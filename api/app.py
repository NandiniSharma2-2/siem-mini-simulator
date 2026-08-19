import os
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "siem.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    total_events = cursor.execute("SELECT COUNT(*) FROM events").fetchone()[0]
    active_alerts = cursor.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
    high_risk_alerts = cursor.execute(
        "SELECT COUNT(*) FROM alerts WHERE UPPER(severity) IN ('HIGH', 'CRITICAL')"
    ).fetchone()[0]
    
    avg_score = cursor.execute("SELECT AVG(risk_score) FROM alerts").fetchone()[0] or 0
    max_score = cursor.execute("SELECT MAX(risk_score) FROM alerts").fetchone()[0] or 0

    conn.close()

    return jsonify({
        "total_events": total_events,
        "active_alerts": active_alerts,
        "high_risk_alerts": high_risk_alerts,
        "aggregate_risk_score": round(avg_score, 1),
        "peak_risk_score": max_score
    })


@app.route('/api/events', methods=['GET'])
def get_events():

    # -----------------------------
    # Pagination
    # -----------------------------

    try:
        page = max(int(request.args.get('page', 1)), 1)
    except ValueError:
        page = 1

    try:
        limit = min(max(int(request.args.get('limit', 20)), 1), 100)
    except ValueError:
        limit = 20

    offset = (page - 1) * limit


    # -----------------------------
    # Filters
    # -----------------------------

    event_id = request.args.get('event_id', '').strip()
    username = request.args.get('username', '').strip()
    search = request.args.get('search', '').strip()

    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()

    start_time = request.args.get('start_time', '').strip()
    end_time = request.args.get('end_time', '').strip()


    # -----------------------------
    # Build WHERE clause
    # -----------------------------

    conditions = []
    params = []


    if event_id:
        conditions.append("event_id = ?")
        params.append(event_id)


    if username:
        conditions.append(
            "(target_user LIKE ? OR subject_account LIKE ?)"
        )

        params.extend([
            f"%{username}%",
            f"%{username}%"
        ])


    if search:
        conditions.append(
            "(computer LIKE ? OR process LIKE ? OR logon_id LIKE ?)"
        )

        params.extend([
            f"%{search}%",
            f"%{search}%",
            f"%{search}%"
        ])


    # -----------------------------
    # Date filtering
    #
    # timestamp format:
    # YYYY-MM-DD HH:MM:SS
    # -----------------------------

    if start_date:
        conditions.append("DATE(timestamp) >= DATE(?)")
        params.append(start_date)


    if end_date:
        conditions.append("DATE(timestamp) <= DATE(?)")
        params.append(end_date)


    # -----------------------------
    # Time filtering
    # -----------------------------

    if start_time:
        conditions.append("TIME(timestamp) >= TIME(?)")
        params.append(start_time)


    if end_time:
        conditions.append("TIME(timestamp) <= TIME(?)")
        params.append(end_time)


    # -----------------------------
    # Construct WHERE
    # -----------------------------

    where_clause = ""

    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)


    # -----------------------------
    # Database query
    # -----------------------------

    conn = get_db_connection()
    cursor = conn.cursor()


    # Get filtered total
    count_query = f"""
        SELECT COUNT(*)
        FROM events
        {where_clause}
    """

    total_count = cursor.execute(
        count_query,
        params
    ).fetchone()[0]


    # Get filtered page
    events_query = f"""
        SELECT *
        FROM events
        {where_clause}
        ORDER BY timestamp DESC
        LIMIT ?
        OFFSET ?
    """

    events_params = params + [limit, offset]

    events = cursor.execute(
        events_query,
        events_params
    ).fetchall()


    conn.close()


    # -----------------------------
    # Response
    # -----------------------------

    return jsonify({
        "data": [dict(row) for row in events],
        "total": total_count,
        "page": page,
        "limit": limit
    })

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    severity = request.args.get('severity')
    rule_name = request.args.get('rule')
    search = request.args.get('search')
    limit = int(request.args.get('limit', 50))

    query = "SELECT * FROM alerts WHERE 1=1"
    params = []

    if severity:
        query += " AND UPPER(severity) = UPPER(?)"
        params.append(severity)
    if rule_name:
        query += " AND rule_name = ?"
        params.append(rule_name)
    if search:
        query += " AND (username LIKE ? OR computer LIKE ? OR process LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"])

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    conn = get_db_connection()
    cursor = conn.cursor()
    alerts = cursor.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(row) for row in alerts])

@app.route('/api/alerts/<int:alert_id>', methods=['GET'])
def get_alert_detail(alert_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    #
    alert = cursor.execute(
        "SELECT * FROM alerts WHERE id = ?",
        (alert_id,)
    ).fetchone()

    if not alert:
        conn.close()
        return jsonify({"error": "Alert not found"}), 404

    alert_dict = dict(alert)

    rule_name = alert_dict.get("rule_name")
    logon_id = alert_dict.get("logon_id")
    timestamp = alert_dict.get("timestamp")
    username = alert_dict.get("username")
    computer = alert_dict.get("computer")
    process = alert_dict.get("process")

    related_events = []

    if rule_name in (
        "Privileged Remote Logon",
        "Unusual Privileged Logon"
    ):

        if logon_id:

            events = cursor.execute(
                """
                SELECT *
                FROM events
                WHERE logon_id = ?
                  AND event_id IN (4624, 4672)
                  AND ABS(
                      CAST(
                          (julianday(timestamp) - julianday(?))
                          * 86400
                          AS INTEGER
                      )
                  ) <= 60
                ORDER BY timestamp ASC, id ASC
                """,
                (logon_id, timestamp)
            ).fetchall()

            related_events = [dict(event) for event in events]

    

    elif rule_name == "Unusual 4798 Activity":

        query = """
            SELECT *
            FROM events
            WHERE event_id = 4798
        """

        params = []

  
        if timestamp:
            query += """
                AND timestamp = ?
            """
            params.append(timestamp)

       
        if computer:
            query += """
                AND computer = ?
            """
            params.append(computer)

        
        if process:
            query += """
                AND process = ?
            """
            params.append(process)

        if username:
            query += """
                AND target_user = ?
            """
            params.append(username)

        query += """
            ORDER BY id DESC
            LIMIT 1
        """

        event = cursor.execute(
            query,
            params
        ).fetchone()

        if event:
            related_events = [dict(event)]

    else:

        related_events = []

    conn.close()

    alert_dict["related_events"] = related_events

    return jsonify(alert_dict)

   
    related_events = []
    if alert_dict.get("logon_id"):
        events = cursor.execute(
            "SELECT * FROM events WHERE logon_id = ? ORDER BY id ASC", 
            (alert_dict["logon_id"],)
        ).fetchall()
        related_events = [dict(e) for e in events]

    conn.close()
    alert_dict["related_events"] = related_events
    return jsonify(alert_dict)

@app.route('/api/rules', methods=['GET'])
def get_rules():
    
    rule_definitions = [
        {
            "rule_name": "Privileged Remote Logon",
            "logic_summary": "Event 4624 + Logon Type 10 + Event 4672",
            "base_severity": "HIGH",
            "description": "Remote Desktop logon followed by special privileges assignment"
        },
        {
            "rule_name": "Unusual Privileged Logon",
            "logic_summary": "Event 4624 + Event 4672 + Non-system account",
            "base_severity": "MEDIUM",
            "description": "A non-system account received special privileges"
        },
        {
            "rule_name": "Unusual 4798 Activity",
            "logic_summary": "Event 4798 combination outside established baseline",
            "base_severity": "LOW",
            "description": "4798 activity did not match the established baseline"
        }
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    for rule in rule_definitions:
        stats = cursor.execute("""
            SELECT 
                COUNT(*) as alert_count,
                MAX(risk_score) as max_risk,
                AVG(risk_score) as avg_risk,
                MAX(timestamp) as last_triggered
            FROM alerts 
            WHERE rule_name = ?
        """, (rule["rule_name"],)).fetchone()

        rule["alert_count"] = stats["alert_count"] or 0
        rule["max_risk_score"] = stats["max_risk"] or 0
        rule["avg_risk_score"] = round(stats["avg_risk"], 1) if stats["avg_risk"] else 0
        rule["last_triggered"] = stats["last_triggered"] or "Never"

    conn.close()
    return jsonify(rule_definitions)

@app.route('/api/analytics/severity', methods=['GET'])
def get_severity_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    counts = cursor.execute("""
        SELECT UPPER(severity) as sev, COUNT(*) as count
        FROM alerts
        GROUP BY UPPER(severity)
    """).fetchall()

    conn.close()

    result = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
    }

    for row in counts:
        if row["sev"] in result:
            result[row["sev"]] = row["count"]

    return jsonify(result)


@app.route('/api/analytics/events-over-time', methods=['GET'])
def get_events_over_time():
    conn = get_db_connection()
    cursor = conn.cursor()
  
    timeline = cursor.execute("""
        SELECT SUBSTR(timestamp, 1, 13) || ':00:00' as time_bucket, COUNT(*) as count 
        FROM events 
        GROUP BY time_bucket 
        ORDER BY time_bucket DESC 
        LIMIT 24
    """).fetchall()
    conn.close()

    formatted = [{"timestamp": row["time_bucket"], "count": row["count"]} for row in reversed(timeline)]
    return jsonify(formatted)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "service": "Aegis SIEM REST API",
        "endpoints": [
            "/api/stats",
            "/api/events",
            "/api/alerts",
            "/api/rules",
            "/api/analytics/severity",
            "/api/analytics/events-over-time"
        ]
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

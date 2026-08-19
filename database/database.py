import sqlite3
DB_NAME="siem.db"
def create_database():

    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        source TEXT,
        event_id INTEGER,
        event_type TEXT,
        computer TEXT,
        target_user TEXT,
        target_domain TEXT,
        target_sid TEXT,
        subject_sid TEXT,
        subject_account TEXT,
        subject_domain TEXT,
        logon_id TEXT,
        logon_type TEXT,
        process_id TEXT,
        process TEXT,
        privileges TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        rule_name TEXT,
        severity TEXT,
        description TEXT,
        logon_id TEXT,
        username TEXT,
        computer TEXT,
        process TEXT,
        logon_type TEXT,
        risk_score INTEGER,
        UNIQUE(rule_name,logon_id)
    )
    """)
    cursor.execute("""
CREATE TABLE IF NOT EXISTS baseline_4798 (
    process TEXT,
    subject_account TEXT,
    subject_domain TEXT,
    UNIQUE(process, subject_account, subject_domain)
)
""")
    connection.commit()
    connection.close()
def save_event(event):
    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO events(
            timestamp,
            source,
            event_id,
            event_type,
            computer,
            target_user,
            target_domain,
            target_sid,
            subject_sid,
            subject_account,
            subject_domain,
            logon_id,
            logon_type,
            process_id,
            process,
            privileges,
            event_key,
            record_number
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """,
    (
        event["timestamp"],
        event["source"],
        event["event_id"],
        event.get("event_type"),
        event.get("computer"),
        event.get("target_user"),
        event.get("target_domain"),
        event.get("target_sid"),
        event.get("subject_sid"),
        event.get("subject_account"),
        event.get("subject_domain"),
        event.get("logon_id"),
        event.get("logon_type"),
        event.get("process_id"),
        event.get("process"),
        event.get("privileges"),
        event.get("event_key"),
        event.get("record_number")
    ))

    inserted = cursor.rowcount == 1

    connection.commit()
    connection.close()

    return inserted
def save_alert(alert):

    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()

    cursor.execute("""
    INSERT OR IGNORE INTO alerts(
        timestamp,
        rule_name,
        severity,
        description,
        logon_id,
        username,
        computer,
        process,
        logon_type,
        risk_score
    )
    VALUES(?,?,?,?,?,?,?,?,?,?)
    """,
    (
        alert["timestamp"],
        alert["rule_name"],
        alert["severity"],
        alert["description"],
        alert["logon_id"],
        alert["username"],
        alert["computer"],
        alert["process"],
        alert["logon_type"],
        alert["risk_score"]
    ))

    inserted = cursor.rowcount == 1

    connection.commit()
    connection.close()

    return inserted


import sqlite3

from correlation.risk_score import calculate_risk_score
from database.database import save_alert
from detection.baseline import check_4798_baseline


DB_NAME = "siem.db"


# RULE 01

def detect_privileged_logon():

    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            a.timestamp,
            a.target_user,
            a.logon_type,
            a.logon_id,
            a.computer,
            a.process
        FROM events a
        JOIN events b
            ON a.logon_id = b.logon_id
        WHERE a.event_id = 4624
          AND b.event_id = 4672
          AND a.logon_type = '10'
    """)

    results = cursor.fetchall()

    connection.close()

    return results


def process_privileged_logon_alerts():

    matches = detect_privileged_logon()

    for match in matches:

        timestamp = match[0]
        username = match[1]
        logon_type = match[2]
        logon_id = match[3]
        computer = match[4]
        process = match[5]

        score, severity = calculate_risk_score(
            remote_logon=True,
            special_privileges=True,
            unusual_account=False,
            baseline_deviation=False
        )

        alert = {
            "timestamp": timestamp,
            "rule_name": "Privileged Remote Logon",
            "severity": severity,
            "risk_score": score,
            "description":
                "Remote Desktop logon followed by special privileges assignment",
            "logon_id": logon_id,
            "username": username,
            "computer": computer,
            "process": process,
            "logon_type": logon_type
        }

        if save_alert(alert):
            print("🚨 NEW ALERT:", alert)



# RULE 02

def detect_unusual_privileged_logon():

    connection = sqlite3.connect(DB_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            b.timestamp,
            b.subject_account,
            b.subject_domain,
            b.logon_id,
            a.computer,
            a.process,
            a.logon_type
        FROM events b
        JOIN events a
            ON b.logon_id = a.logon_id
        WHERE b.event_id = 4672
          AND a.event_id = 4624
          AND b.subject_account NOT IN (
              'SYSTEM',
              'LOCAL SERVICE',
              'NETWORK SERVICE'
          )
    """)

    results = cursor.fetchall()

    connection.close()

    return results


def process_unusual_privileged_logon_alerts():

    matches = detect_unusual_privileged_logon()

    for match in matches:

        timestamp = match[0]
        username = match[1]
        logon_id = match[3]
        computer = match[4]
        process = match[5]
        logon_type = match[6]

        score, severity = calculate_risk_score(
            remote_logon=(logon_type == "10"),
            special_privileges=True,
            unusual_account=True,
            baseline_deviation=False
        )

        alert = {
            "timestamp": timestamp,
            "rule_name": "Unusual Privileged Logon",
            "severity": severity,
            "risk_score": score,
            "description":
                "A non-system account received special privileges",
            "logon_id": logon_id,
            "username": username,
            "computer": computer,
            "process": process,
            "logon_type": logon_type
        }

        if save_alert(alert):
            print("🚨 NEW ALERT:", alert)



# RULE 03

def detect_unusual_4798(event):

    if event is None:
        return None

    if event.get("event_id") != 4798:
        return None

    is_normal = check_4798_baseline(event)

    if not is_normal:
        return event

    return None


def process_unusual_4798_alert(event):

    unusual_event = detect_unusual_4798(event)

    if unusual_event is None:
        return

    score, severity = calculate_risk_score(
        remote_logon=False,
        special_privileges=False,
        unusual_account=False,
        baseline_deviation=True
    )

    alert = {
        "timestamp": unusual_event.get("timestamp"),
        "rule_name": "Unusual 4798 Activity",
        "severity": severity,
        "risk_score": score,
        "description":
            "4798 activity did not match the established baseline",
        "logon_id": unusual_event.get("logon_id"),
        "username": unusual_event.get("target_user"),
        "computer": unusual_event.get("computer"),
        "process": unusual_event.get("process"),
        "logon_type": ""
    }

    if save_alert(alert):
        print("🚨 NEW ALERT:", alert)


def run_all_rules(event=None):

    # Rule 01
    process_privileged_logon_alerts()

    # Rule 02
    process_unusual_privileged_logon_alerts()

    # Rule 03
    process_unusual_4798_alert(event)


if __name__ == "__main__":
    run_all_rules()
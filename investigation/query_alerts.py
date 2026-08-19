import sqlite3
DB_NAME='siem.db'
connection=sqlite3.connect(DB_NAME)
cursor=connection.cursor()
cursor.execute("""
SELECT 
timestamp,
rule_name,
severity,
risk_score,
username,
computer,
process,
logon_type
FROM alerts
ORDER BY risk_score DESC,timestamp DESC
""")
alerts=cursor.fetchall()
for alert in alerts:
    print(alert)
connection.close()
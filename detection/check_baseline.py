import sqlite3 
connection=sqlite3.connect("siem.db")
cursor=connection.cursor()
cursor.execute("""
SELECT process,subject_account,subject_domain,COUNT(*)
FROM events
WHERE event_id=4798
AND NOT(
process='C:\\Windows\\System32\\svchost.exe'
AND subject_account='AARYA$' AND
subject_domain='WORKGROUP'
)
GROUP BY process,subject_account,subject_domain
""")
results=cursor.fetchall()
print("Events that do not NOT much our baseline:")
for result in results:
    print(result)
connection.close()
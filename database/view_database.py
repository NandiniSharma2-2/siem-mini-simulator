import sqlite3
connection=sqlite3.connect("siem.db")
cursor=connection.cursor()
cursor.execute("SELECT * FROM events")
events=cursor.fetchall()
for event in events:
    print(event)
connection.close()
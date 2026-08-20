Aegis SIEM
A research-driven full-stack Security Information & Event Management project build to explore the end-to-end lifecycle of security monitoring by collecting windows events, normalizing telemetry, storing data, detecting suspicious behavior, correlating related activity, assigning risk, and supporting investigation through a web dashboard.

Aegis SIEM is an educational SIEM project designed and built to understand how security monitoring pipelines work in practice. Rather than focusing on a single detection script, the project connects multiple components of a simplified security operations workflow:
1. Collect
2. Normalize
3. Store
4. Detect
5. Correlate
6. Score
7. Investigate

The project is primarily focused on windows security logs and demonstrates how raw operating-system telemetry can be transformed into structured security events and used to identify potentially suspicious activity.
Project status: Educational/actively evolving
Purpose: Cybersecurity learning, detection engineering research, and hands-on SIEM development. Not intended for production use.

Table of contents:
1. Why Aegis SIEM?
2. Key Features
3. Security events currently monitored
4. Architecture
5. How the detection pipeline works
6. Detection and Correlation logic
7. Risk scoring
8. Investigation workflow
9. Technology stack
10. Project structure
11. Installation 
12. Running the project
13. Dashboard build a simpl
14. Screenshots
15. Limitations
16. Future Work
17. Research and learning behind the detection rules
18. What I learned

Why Aegis SIEM?

The goal of this project was to move beyond reading about SIEM architecture and build a simplified implementation of one.
A traditional SIEM receives telemetry from multiple sources ,processes and normalizes events, stores them for searching and analysis, applies detection logic, and helps analysts investigate suspicious behavior.

Aegis SIEM implements a simplified version of this workflow using:
1. Windows security event logs as a telemetry source
2. Python for collection and normalization
3. SQLite for local event storage
4. Detection rules and behavioral baselining
5. Event correlation and risk scoring
6. A flask REST API
7. A react-based investigation dashboard

The project was designed as a learning exercise in:
1. Windows logging
2. Event normalization
3. Detection engineering
4. Behavioral analysis
5. Security correlation
6. Risk prioritization
7. Backend API development
8. Security dashboard design
9. Incident investigation workflows

Key Features:

A. Windows Security Event Collection

Aegis collects selected events from the windows security log.

The current implementation focuses on security-relevant windows events including:
1. Successful authentication activity
2. Privileged logons
3. Local group membership enumeration
NOTE: collected events are processed by python collector before entering the detection pipeline.

B. Event Normalization

Raw windows event log data can contain fields that vary depending on the event type.

Aegis normalizes relevant information into a more consistent event structure so that downstream components can process different event types more easily.
The normalized event data can process different event types more easily.

The normalized event data can include information such as:
1. Event ID
2. Event type
3. TImestamp
4. Username
5. Hostname
6. Source information
7. Logon information
8. Process information
9. Raw event details

This allows detection and correlation logic to operate on structured fields instead of repeatedly interpreting raw event data.

C. SQLite Event Storage

Normalized events are stored locally using SQLite.
SQLite was selected for this project because it provides:
1. Simple local department
2. SQL querying
3. Easy experimentation
4. A lightweight persistence layer

The database stores security events and supports queries used by the API, detection logic, dashboard, and investigation workflow.

D. Security Events Currently Monitored

#Event ID 4624: Event 4624 is generated when a successful logon session is created on the accessed system.

This event is useful for establishing authentication activity and building a behavioral baseline for users and systems.

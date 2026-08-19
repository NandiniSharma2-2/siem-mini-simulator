import win32evtlog

from parsers.windows_parser import (
    parse_4798,
    parse_4624,
    parse_4672
)

from database.database import create_database, save_event
from correlation.rules import run_all_rules


create_database()


server = "localhost"
log_type = "Security"

hand = win32evtlog.OpenEventLog(server, log_type)

flags = (
    win32evtlog.EVENTLOG_BACKWARDS_READ |
    win32evtlog.EVENTLOG_SEQUENTIAL_READ
)


print("======================================")
print(" Aegis SIEM Windows Collector Started")
print(" Monitoring: Windows Security Log")
print("======================================")


while True:

    try:

        events = win32evtlog.ReadEventLog(
            hand,
            flags,
            0
        )

        if not events:
            continue

        for event in events:

            parsed_event = None

            # Windows Event ID
            event_id = event.EventID & 0xFFFF

            if event_id == 4624:

                parsed_event = parse_4624(event)

            elif event_id == 4672:

                parsed_event = parse_4672(event)

            elif event_id == 4798:

                parsed_event = parse_4798(event)

            else:
                continue

            if parsed_event is None:
                continue

            print(
                f"[EVENT {parsed_event['event_id']}] "
                f"Saving record "
                f"{parsed_event.get('record_number')}"
            )

            save_event(parsed_event)

            run_all_rules(parsed_event)


    except Exception as error:

        print(
            f"[COLLECTOR ERROR] {error}"
        )
        
        continue
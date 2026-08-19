def parse_4798(event):

    data = event.StringInserts

    parsed_event = {
        "record_number": event.RecordNumber,
        "timestamp": str(event.TimeGenerated),
        "source": "windows_security",
        "event_id": event.EventID,
        "event_type": "user_group_membership_enumeration",
        "computer":event.ComputerName,
        "target_user": data[0],
        "target_domain": data[1],
        "target_sid": data[2],

        "subject_sid": data[3],
        "subject_account": data[4],
        "subject_domain": data[5],

        "logon_id": data[6],
        "process_id": data[7],
        "process": data[8]
        
    }

    return parsed_event

def parse_4624(event):
    data=event.StringInserts
    return{
        "record_number": event.RecordNumber,
        "timestamp": event.TimeGenerated.strftime("%Y-%m-%d %H:%M:%S"),
        "source":"windows_security",
        "event_id":4624,
        "event_type":"successful_logon",
        "computer":event.ComputerName,

        "target_user":data[5],
        "target_domain":data[6],
        "target_sid":data[4],

        "subject_sid":data[0],
        "subject_account":data[1],
        "subject_domain":data[2],

        "logon_id":data[7],
        "logon_type":data[8],
        "process_id":data[16],
        "process":data[17]
        
    }

def parse_4672(event):
    data=event.StringInserts
    return{
        "record_number": event.RecordNumber,
        "timestamp":event.TimeGenerated.strftime("%Y-%m-%d %H:%M:%S"),
        "source":"windows_security",
        "event_id":4672,
        "event_type":"special_privileges_assigned",
        "computer":event.ComputerName,
        "subject_sid":data[0],
        "subject_account":data[1],
        "subject_domain":data[2],
        "logon_id":data[3],
        "privileges":data[4]
    }
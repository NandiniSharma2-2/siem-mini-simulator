from detection.baseline import check_4798_baseline


normal_event = {
    "event_id": 4798,
    "target_user": "aryaj",
    "subject_account": "AARYA$",
    "subject_domain": "WORKGROUP",
    "process": r"C:\Windows\System32\svchost.exe",
    "computer": "aarya",
    "logon_id": "0x3e7"
}


suspicious_event = {
    "event_id": 4798,
    "target_user": "aryaj",
    "subject_account": "UNKNOWN_USER",
    "subject_domain": "UNKNOWN",
    "process": r"C:\Temp\suspicious.exe",
    "computer": "aarya",
    "logon_id": "0x9999"
}


print("Normal event:", check_4798_baseline(normal_event))
print("Suspicious event:", check_4798_baseline(suspicious_event))
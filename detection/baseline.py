# detection/baseline.py

# Known-good 4798 activity observed on this Windows machine.
#
# IMPORTANT:
# target_user is intentionally NOT included.
# Windows can legitimately enumerate different users.

KNOWN_4798_BASELINE = [
    {
        "subject_account": "AARYA$",
        "subject_domain": "WORKGROUP",
        "process": r"C:\Windows\System32\svchost.exe"
    },
    {
        "subject_account": "AARYA$",
        "subject_domain": "WORKGROUP",
        "process": r"C:\Windows\System32\LogonUI.exe"
    }
]


def normalize(value):
    if value is None:
        return ""

    return str(value).strip().lower()


def check_4798_baseline(event):
    """
    Returns True if the 4798 event matches a known-good baseline.
    Returns False if the event deviates from the baseline.
    """

    if event.get("event_id") != 4798:
        return False

    subject_account = normalize(
        event.get("subject_account")
    )

    subject_domain = normalize(
        event.get("subject_domain")
    )

    process = normalize(
        event.get("process")
    )

    for baseline in KNOWN_4798_BASELINE:

        if (
            subject_account == normalize(baseline["subject_account"])
            and
            subject_domain == normalize(baseline["subject_domain"])
            and
            process == normalize(baseline["process"])
        ):
            return True

    return False
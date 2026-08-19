def calculate_risk_score(#assigning default values(formal parameters), we can override these pqramaters while calling 
        remote_logon=False,
        special_privileges=False,
        unusual_account=False,
        baseline_deviation=False
):
    score=0;
    if remote_logon:
        score+=30

    if special_privileges:
        score+=30

    if unusual_account:
        score+=20

    if baseline_deviation:
        score+=20

    if score>=80:
        severity='CRITICAL'
    elif score>=60:
        severity='HIGH'
    elif score>=30:
        severity='MEDIUM'
    else:
        severity='LOW'

    return score,severity

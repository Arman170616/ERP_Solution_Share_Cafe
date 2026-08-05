import ipaddress


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def is_private_or_loopback(ip):
    if not ip:
        return False
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return addr.is_private or addr.is_loopback


def ip_matches(ip, ip_or_cidr):
    if not ip:
        return False
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    try:
        if "/" in ip_or_cidr:
            return addr in ipaddress.ip_network(ip_or_cidr, strict=False)
        return addr == ipaddress.ip_address(ip_or_cidr)
    except ValueError:
        return False


def ip_matches_any(ip, rules):
    return any(ip_matches(ip, rule.ip_or_cidr) for rule in rules)

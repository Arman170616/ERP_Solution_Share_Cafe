from django.conf import settings
from django.http import JsonResponse

from .utils import get_client_ip, ip_matches_any, is_private_or_loopback

# Only the login endpoint enforces the whitelist (SRS 1: "Allow login only from
# approved cafe IP addresses"). Blacklisted IPs are blocked everywhere.
LOGIN_PATHS = {"/api/accounts/login/"}


class IPAccessControlMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not settings.IP_ACCESS_CONTROL_ENABLED:
            return self.get_response(request)

        ip = get_client_ip(request)

        if settings.DEBUG and not settings.IP_ACCESS_ENFORCE_IN_DEBUG and is_private_or_loopback(ip):
            return self.get_response(request)

        from .models import IPAccessRule

        blacklist = IPAccessRule.objects.filter(rule_type=IPAccessRule.RuleType.BLACKLIST)
        if blacklist.exists() and ip_matches_any(ip, blacklist):
            return JsonResponse({"detail": "Access denied from this IP address."}, status=403)

        if request.path in LOGIN_PATHS:
            whitelist = IPAccessRule.objects.filter(rule_type=IPAccessRule.RuleType.WHITELIST)
            if whitelist.exists() and not ip_matches_any(ip, whitelist):
                return JsonResponse(
                    {"detail": "Login is not permitted from this IP address."}, status=403
                )

        return self.get_response(request)

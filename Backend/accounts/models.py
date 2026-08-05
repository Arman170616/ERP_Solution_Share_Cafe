from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"
        STAFF = "staff", "Staff"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STAFF)
    phone = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class IPAccessRule(models.Model):
    class RuleType(models.TextChoices):
        WHITELIST = "whitelist", "Whitelist"
        BLACKLIST = "blacklist", "Blacklist"

    ip_or_cidr = models.CharField(
        max_length=64,
        help_text="Single IP (e.g. 192.168.1.10) or CIDR range (e.g. 192.168.1.0/24)",
    )
    rule_type = models.CharField(max_length=10, choices=RuleType.choices)
    label = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="ip_rules_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rule_type}: {self.ip_or_cidr}"


class ActiveSession(models.Model):
    """Tracks the single currently-valid session per user (single-device login)."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="active_session")
    session_id = models.CharField(max_length=64)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"session for {self.user.username}"


class ActivityLog(models.Model):
    class Action(models.TextChoices):
        LOGIN = "login", "Login"
        LOGIN_FAILED = "login_failed", "Login failed"
        LOGOUT = "logout", "Logout"
        SIGNUP = "signup", "Signup (owner bootstrap)"
        SESSION_EXPIRED = "session_expired", "Session expired (new device login)"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="activity_logs"
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    detail = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - {self.user} @ {self.created_at:%Y-%m-%d %H:%M}"

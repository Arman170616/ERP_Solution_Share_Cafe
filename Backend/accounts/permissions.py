from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import User


class HasRole(BasePermission):
    """Base class: subclass and set `allowed_roles`."""

    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in self.allowed_roles)


class IsAdmin(HasRole):
    allowed_roles = (User.Role.ADMIN,)


class IsManagerOrAdmin(HasRole):
    allowed_roles = (User.Role.ADMIN, User.Role.MANAGER)


class IsStaffOrAbove(HasRole):
    allowed_roles = (User.Role.ADMIN, User.Role.MANAGER, User.Role.STAFF)


class CanCancelOrder(BasePermission):
    """Admin and Staff can cancel/delete an order; Manager explicitly cannot."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role != User.Role.MANAGER)


class CanManageUserAccounts(BasePermission):
    """Admin has full access to UserViewSet. Manager may only *create* new Staff-role
    accounts — needed for the HR page's "Add employee" onboarding flow — and cannot
    list/view/edit/delete accounts or create Manager/Admin accounts (no privilege
    escalation, no browsing other people's account details)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == User.Role.ADMIN:
            return True
        if user.role == User.Role.MANAGER and view.action == "create":
            return request.data.get("role") == User.Role.STAFF
        return False


class ReadWriteRolePermission(BasePermission):
    """Role gate driven by `read_roles` / `write_roles` tuples set on the view.

    A view that doesn't define one of these attributes allows any authenticated user
    for that half of the check (safe methods vs. everything else).
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        roles = getattr(view, "read_roles" if request.method in SAFE_METHODS else "write_roles", None)
        if roles is None:
            return True
        return user.role in roles

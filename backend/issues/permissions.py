from rest_framework import permissions


class IsCitizen(permissions.BasePermission):
    """Logged-in regular users only. Admin (staff) accounts are blocked."""
    message = 'Only registered users can do this. Admin accounts cannot.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and not request.user.is_staff)

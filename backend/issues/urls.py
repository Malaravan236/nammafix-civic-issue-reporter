from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet, NotificationsView, ProfileView, AdminStatsView, AdminUsersView

router=DefaultRouter()
router.register(r'issues', IssueViewSet)

urlpatterns=[
    path('notifications/', NotificationsView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('admin-stats/', AdminStatsView.as_view()),
    path('admin-users/', AdminUsersView.as_view()),
    path('admin-users/<int:pk>/', AdminUsersView.as_view()),
]+router.urls

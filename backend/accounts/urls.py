from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('profile/', views.user_profile, name='user-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('change-password/', views.change_password, name='change-password'),
    path('dashboard-data/', views.dashboard_data, name='dashboard-data'),
    
    # User Management (Admin Only)
    path('users/', views.user_list, name='user-list'),
    path('users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('users/create/', views.create_user, name='create-user'),
    path('users/<int:user_id>/update/', views.update_user, name='update-user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete-user'),
    path('groups/', views.groups_list, name='groups-list'),
]

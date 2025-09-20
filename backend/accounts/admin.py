from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'get_groups', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    filter_horizontal = ('groups', 'user_permissions')
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'mobile', 'profile_image')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional', {'fields': ('is_verified',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    def get_groups(self, obj):
        """Display user's groups"""
        return ", ".join([group.name for group in obj.groups.all()]) or "No groups"
    get_groups.short_description = 'Groups'

# Customize Group admin to show permissions and users
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_permissions_count', 'get_users_count')
    search_fields = ('name',)
    filter_horizontal = ('permissions',)
    
    def get_permissions_count(self, obj):
        return obj.permissions.count()
    get_permissions_count.short_description = 'Permissions Count'
    
    def get_users_count(self, obj):
        return obj.user_set.count()
    get_users_count.short_description = 'Users Count'

# Re-register Group with custom admin
admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)

# Customize admin site headers
admin.site.site_header = "Shiv Accounts Cloud - Database Administration"
admin.site.site_title = "Shiv Accounts Admin"
admin.site.index_title = "Database Management Dashboard"

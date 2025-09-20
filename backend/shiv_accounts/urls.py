"""
URL configuration for shiv_accounts project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/master-data/', include('master_data.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/reports/', include('reports.urls')),
    # Simple root endpoint so '/' isn't a 404 during local dev
    path('', lambda request: JsonResponse({
        'status': 'ok',
        'app': 'Shiv Accounts API',
        'endpoints': [
            '/admin/',
            '/api/auth/',
            '/api/master-data/',
            '/api/transactions/',
            '/api/reports/'
        ]
    })),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

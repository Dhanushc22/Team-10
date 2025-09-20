"""
WSGI config for shiv_accounts project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')

application = get_wsgi_application()

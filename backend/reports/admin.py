from django.contrib import admin

# Note: Reports are typically generated dynamically via API endpoints
# This admin file is kept simple since reports are mainly API-based

# If you have report storage models in the future, you can register them here
# Example:
# @admin.register(ReportModel)
# class ReportAdmin(admin.ModelAdmin):
#     list_display = ('report_name', 'generated_date', 'user')
#     list_filter = ('generated_date', 'report_type')
#     readonly_fields = ('generated_date',)

# Reports are accessed via API endpoints:
# - /api/reports/balance-sheet/
# - /api/reports/profit-loss/  
# - /api/reports/stock-report/
# - /api/reports/partner-ledger/

from django.urls import path
from . import views

urlpatterns = [
    # Stock Management URLs
    path('stock-movements/', views.StockMovementListCreateView.as_view(), name='stock-movement-list-create'),
    path('stock-balances/', views.StockBalanceListView.as_view(), name='stock-balance-list'),
    
    # Report URLs
    path('balance-sheet/', views.balance_sheet, name='balance-sheet'),
    path('profit-loss/', views.profit_loss, name='profit-loss'),
    path('partner-ledger/', views.partner_ledger, name='partner-ledger'),
    path('stock-report/', views.stock_report, name='stock-report'),
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
]

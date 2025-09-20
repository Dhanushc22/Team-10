from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Sum, F, Case, When, DecimalField
from django.utils import timezone
from datetime import datetime, timedelta
from .models import StockMovement, StockBalance
from .serializers import (
    StockMovementSerializer, StockBalanceSerializer,
    BalanceSheetSerializer, ProfitLossSerializer, 
    PartnerLedgerSerializer, StockReportSerializer
)
from master_data.models import ChartOfAccount, Contact
from transactions.models import CustomerInvoice, VendorBill, Payment, PaymentAllocation


class StockMovementListCreateView(generics.ListCreateAPIView):
    """View for listing and creating stock movements"""
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = ['django_filters.rest_framework.DjangoFilterBackend']
    filterset_fields = ['product', 'movement_type', 'movement_date']


class StockBalanceListView(generics.ListAPIView):
    """View for listing stock balances"""
    queryset = StockBalance.objects.all()
    serializer_class = StockBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = ['django_filters.rest_framework.DjangoFilterBackend']
    filterset_fields = ['product']


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def balance_sheet(request):
    """Generate Balance Sheet report"""
    as_of_date = request.GET.get('as_of_date', timezone.now().date())
    
    # Get all active accounts
    accounts = ChartOfAccount.objects.filter(is_active=True)
    
    # Calculate balances for each account type
    balance_sheet_data = []
    
    # Assets
    assets = accounts.filter(type='asset')
    total_assets = 0
    for account in assets:
        # Calculate current balance (simplified - in real app, calculate from transactions)
        balance = account.current_balance
        total_assets += balance
        balance_sheet_data.append({
            'account_name': account.name,
            'account_type': 'asset',
            'balance': balance,
            'is_total': False
        })
    
    balance_sheet_data.append({
        'account_name': 'Total Assets',
        'account_type': 'asset',
        'balance': total_assets,
        'is_total': True
    })
    
    # Liabilities
    liabilities = accounts.filter(type='liability')
    total_liabilities = 0
    for account in liabilities:
        balance = account.current_balance
        total_liabilities += balance
        balance_sheet_data.append({
            'account_name': account.name,
            'account_type': 'liability',
            'balance': balance,
            'is_total': False
        })
    
    # Equity
    equity = accounts.filter(type='equity')
    total_equity = 0
    for account in equity:
        balance = account.current_balance
        total_equity += balance
        balance_sheet_data.append({
            'account_name': account.name,
            'account_type': 'equity',
            'balance': balance,
            'is_total': False
        })
    
    total_liabilities_equity = total_liabilities + total_equity
    balance_sheet_data.append({
        'account_name': 'Total Liabilities & Equity',
        'account_type': 'liability_equity',
        'balance': total_liabilities_equity,
        'is_total': True
    })
    
    serializer = BalanceSheetSerializer(balance_sheet_data, many=True)
    return Response({
        'as_of_date': as_of_date,
        'data': serializer.data,
        'total_assets': total_assets,
        'total_liabilities_equity': total_liabilities_equity,
        'is_balanced': total_assets == total_liabilities_equity
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profit_loss(request):
    """Generate Profit & Loss report"""
    start_date = request.GET.get('start_date', (timezone.now().date() - timedelta(days=30)))
    end_date = request.GET.get('end_date', timezone.now().date())
    
    # Get income and expense accounts
    income_accounts = ChartOfAccount.objects.filter(type='income', is_active=True)
    expense_accounts = ChartOfAccount.objects.filter(type='expense', is_active=True)
    
    profit_loss_data = []
    
    # Income
    total_income = 0
    for account in income_accounts:
        # Calculate income from transactions (simplified)
        amount = account.current_balance  # In real app, calculate from date range
        total_income += amount
        profit_loss_data.append({
            'account_name': account.name,
            'account_type': 'income',
            'amount': amount,
            'is_total': False
        })
    
    profit_loss_data.append({
        'account_name': 'Total Income',
        'account_type': 'income',
        'amount': total_income,
        'is_total': True
    })
    
    # Expenses
    total_expenses = 0
    for account in expense_accounts:
        # Calculate expenses from transactions (simplified)
        amount = account.current_balance  # In real app, calculate from date range
        total_expenses += amount
        profit_loss_data.append({
            'account_name': account.name,
            'account_type': 'expense',
            'amount': amount,
            'is_total': False
        })
    
    profit_loss_data.append({
        'account_name': 'Total Expenses',
        'account_type': 'expense',
        'amount': total_expenses,
        'is_total': True
    })
    
    # Net Profit/Loss
    net_profit = total_income - total_expenses
    profit_loss_data.append({
        'account_name': 'Net Profit' if net_profit >= 0 else 'Net Loss',
        'account_type': 'net_profit',
        'amount': abs(net_profit),
        'is_total': True
    })
    
    serializer = ProfitLossSerializer(profit_loss_data, many=True)
    return Response({
        'start_date': start_date,
        'end_date': end_date,
        'data': serializer.data,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_profit': net_profit
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def partner_ledger(request):
    """Generate Partner Ledger report"""
    contact_id = request.GET.get('contact_id')
    start_date = request.GET.get('start_date', (timezone.now().date() - timedelta(days=30)))
    end_date = request.GET.get('end_date', timezone.now().date())
    
    if not contact_id:
        return Response({'error': 'Contact ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return Response({'error': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)
    
    ledger_data = []
    running_balance = 0
    
    # Get customer invoices
    invoices = CustomerInvoice.objects.filter(
        customer=contact,
        invoice_date__range=[start_date, end_date]
    ).order_by('invoice_date')
    
    for invoice in invoices:
        running_balance += invoice.grand_total
        ledger_data.append({
            'date': invoice.invoice_date,
            'transaction_type': 'Invoice',
            'reference': invoice.invoice_number,
            'description': f'Invoice for {invoice.grand_total}',
            'debit': invoice.grand_total,
            'credit': 0,
            'balance': running_balance
        })
    
    # Get payments received
    payments = Payment.objects.filter(
        contact=contact,
        payment_type='customer_payment',
        payment_date__range=[start_date, end_date]
    ).order_by('payment_date')
    
    for payment in payments:
        running_balance -= payment.amount
        ledger_data.append({
            'date': payment.payment_date,
            'transaction_type': 'Payment',
            'reference': payment.payment_number,
            'description': f'Payment received {payment.amount}',
            'debit': 0,
            'credit': payment.amount,
            'balance': running_balance
        })
    
    # Get vendor bills
    bills = VendorBill.objects.filter(
        vendor=contact,
        bill_date__range=[start_date, end_date]
    ).order_by('bill_date')
    
    for bill in bills:
        running_balance -= bill.grand_total
        ledger_data.append({
            'date': bill.bill_date,
            'transaction_type': 'Bill',
            'reference': bill.bill_number,
            'description': f'Bill for {bill.grand_total}',
            'debit': 0,
            'credit': bill.grand_total,
            'balance': running_balance
        })
    
    # Get payments made
    vendor_payments = Payment.objects.filter(
        contact=contact,
        payment_type='vendor_payment',
        payment_date__range=[start_date, end_date]
    ).order_by('payment_date')
    
    for payment in vendor_payments:
        running_balance += payment.amount
        ledger_data.append({
            'date': payment.payment_date,
            'transaction_type': 'Payment',
            'reference': payment.payment_number,
            'description': f'Payment made {payment.amount}',
            'debit': payment.amount,
            'credit': 0,
            'balance': running_balance
        })
    
    # Sort by date
    ledger_data.sort(key=lambda x: x['date'])
    
    serializer = PartnerLedgerSerializer(ledger_data, many=True)
    return Response({
        'contact_name': contact.name,
        'contact_type': contact.type,
        'start_date': start_date,
        'end_date': end_date,
        'data': serializer.data,
        'closing_balance': running_balance
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stock_report(request):
    """Generate Stock Report"""
    stock_balances = StockBalance.objects.select_related('product').all()
    
    stock_data = []
    total_stock_value = 0
    
    for balance in stock_balances:
        total_stock_value += balance.stock_value
        stock_data.append({
            'product_name': balance.product.name,
            'product_type': balance.product.type,
            'opening_quantity': balance.opening_quantity,
            'purchased_quantity': balance.purchased_quantity,
            'sold_quantity': balance.sold_quantity,
            'current_quantity': balance.current_quantity,
            'average_cost': balance.average_cost,
            'stock_value': balance.stock_value
        })
    
    serializer = StockReportSerializer(stock_data, many=True)
    return Response({
        'data': serializer.data,
        'total_stock_value': total_stock_value,
        'total_products': len(stock_data)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    """Get summary data for dashboard"""
    user = request.user
    
    if user.is_admin() or user.is_invoicing_user():
        # Calculate key metrics
        total_sales = CustomerInvoice.objects.filter(status='paid').aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        
        total_purchases = VendorBill.objects.filter(status='paid').aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        
        net_profit = total_sales - total_purchases
        
        # Get cash balance from chart of accounts
        try:
            cash_account = ChartOfAccount.objects.get(name__icontains='cash', type='asset')
            cash_balance = cash_account.current_balance
        except:
            cash_balance = 0
        
        # Get pending amounts
        pending_sales = CustomerInvoice.objects.filter(status='pending').aggregate(
            total=Sum('balance_due')
        )['total'] or 0
        
        pending_purchases = VendorBill.objects.filter(status='pending').aggregate(
            total=Sum('balance_due')
        )['total'] or 0
        
        summary = {
            'total_sales': total_sales,
            'total_purchases': total_purchases,
            'net_profit': net_profit,
            'cash_balance': cash_balance,
            'pending_sales': pending_sales,
            'pending_purchases': pending_purchases,
            'total_customers': Contact.objects.filter(type__in=['customer', 'both']).count(),
            'total_vendors': Contact.objects.filter(type__in=['vendor', 'both']).count(),
            'total_products': StockBalance.objects.count(),
            'low_stock_products': StockBalance.objects.filter(current_quantity__lt=10).count(),
        }
    else:
        # Contact user summary
        try:
            contact = request.user.contact_profile
            if contact.type in ['customer', 'both']:
                total_invoices = CustomerInvoice.objects.filter(customer=contact).count()
                pending_invoices = CustomerInvoice.objects.filter(customer=contact, status='pending').count()
                total_due = CustomerInvoice.objects.filter(customer=contact, status='pending').aggregate(
                    total=Sum('balance_due')
                )['total'] or 0
            else:
                total_invoices = 0
                pending_invoices = 0
                total_due = 0
            
            if contact.type in ['vendor', 'both']:
                total_bills = VendorBill.objects.filter(vendor=contact).count()
                pending_bills = VendorBill.objects.filter(vendor=contact, status='pending').count()
                total_payable = VendorBill.objects.filter(vendor=contact, status='pending').aggregate(
                    total=Sum('balance_due')
                )['total'] or 0
            else:
                total_bills = 0
                pending_bills = 0
                total_payable = 0
            
            summary = {
                'total_invoices': total_invoices,
                'pending_invoices': pending_invoices,
                'total_due': total_due,
                'total_bills': total_bills,
                'pending_bills': pending_bills,
                'total_payable': total_payable,
            }
        except:
            summary = {'error': 'Contact profile not found'}
    
    return Response(summary)

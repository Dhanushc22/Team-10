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
    
    # Calculate actual balances from transactions
    from transactions.models import CustomerInvoice, VendorBill
    
    balance_sheet_data = []
    
    # Assets - Calculate from customer invoices and cash
    total_receivables = CustomerInvoice.objects.filter(
        invoice_date__lte=as_of_date,
        status__in=['pending', 'partially_paid']
    ).aggregate(total=Sum('balance_due'))['total'] or 0
    
    total_cash = CustomerInvoice.objects.filter(
        invoice_date__lte=as_of_date,
        status='paid'
    ).aggregate(total=Sum('grand_total'))['total'] or 0
    
    # Subtract cash paid for vendor bills
    cash_paid = VendorBill.objects.filter(
        bill_date__lte=as_of_date,
        status='paid'
    ).aggregate(total=Sum('grand_total'))['total'] or 0
    
    total_cash = (total_cash or 0) - (cash_paid or 0)
    
    # Add asset accounts
    balance_sheet_data.append({
        'account_name': 'Cash',
        'account_type': 'asset',
        'balance': max(total_cash, 0),
        'is_total': False
    })
    
    balance_sheet_data.append({
        'account_name': 'Accounts Receivable',
        'account_type': 'asset',
        'balance': total_receivables,
        'is_total': False
    })
    
    total_assets = max(total_cash, 0) + total_receivables
    
    balance_sheet_data.append({
        'account_name': 'Total Assets',
        'account_type': 'asset',
        'balance': total_assets,
        'is_total': True
    })
    
    # Liabilities - Calculate from vendor bills
    total_payables = VendorBill.objects.filter(
        bill_date__lte=as_of_date,
        status__in=['pending', 'partially_paid']
    ).aggregate(total=Sum('balance_due'))['total'] or 0
    
    balance_sheet_data.append({
        'account_name': 'Accounts Payable',
        'account_type': 'liability',
        'balance': total_payables,
        'is_total': False
    })
    
    # Equity - Calculate as balancing figure
    total_equity = total_assets - total_payables
    
    balance_sheet_data.append({
        'account_name': 'Retained Earnings',
        'account_type': 'equity',
        'balance': total_equity,
        'is_total': False
    })
    
    total_liabilities_equity = total_payables + total_equity
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
        'is_balanced': abs(total_assets - total_liabilities_equity) < 0.01
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profit_loss(request):
    """Generate Profit & Loss report"""
    start_date = request.GET.get('start_date', (timezone.now().date() - timedelta(days=30)))
    end_date = request.GET.get('end_date', timezone.now().date())
    
    # Convert string dates to date objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    profit_loss_data = []
    
    # Income - Calculate from customer invoices
    total_sales = CustomerInvoice.objects.filter(
        invoice_date__range=[start_date, end_date]
    ).aggregate(total=Sum('grand_total'))['total'] or 0
    
    profit_loss_data.append({
        'account_name': 'Sales Revenue',
        'account_type': 'income',
        'amount': total_sales,
        'is_total': False
    })
    
    total_income = total_sales
    profit_loss_data.append({
        'account_name': 'Total Income',
        'account_type': 'income',
        'amount': total_income,
        'is_total': True
    })
    
    # Expenses - Calculate from vendor bills
    total_purchases = VendorBill.objects.filter(
        bill_date__range=[start_date, end_date]
    ).aggregate(total=Sum('grand_total'))['total'] or 0
    
    profit_loss_data.append({
        'account_name': 'Cost of Goods Sold',
        'account_type': 'expense',
        'amount': total_purchases,
        'is_total': False
    })
    
    total_expenses = total_purchases
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
    partner_id = request.GET.get('partner_id')
    start_date = request.GET.get('start_date', (timezone.now().date() - timedelta(days=30)))
    end_date = request.GET.get('end_date', timezone.now().date())
    
    if not partner_id:
        return Response({'error': 'Partner ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        contact = Contact.objects.get(id=partner_id)
    except Contact.DoesNotExist:
        return Response({'error': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Convert string dates to date objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    ledger_data = []
    running_balance = 0
    total_debit = 0
    total_credit = 0
    
    # Get customer invoices
    invoices = CustomerInvoice.objects.filter(
        customer=contact,
        invoice_date__range=[start_date, end_date]
    ).order_by('invoice_date')
    
    for invoice in invoices:
        running_balance += float(invoice.grand_total)
        total_debit += float(invoice.grand_total)
        ledger_data.append({
            'date': invoice.invoice_date,
            'transaction_type': 'Invoice',
            'reference': invoice.invoice_number,
            'description': f'Invoice #{invoice.invoice_number}',
            'debit': float(invoice.grand_total),
            'credit': 0,
            'running_balance': running_balance
        })
    
    # Get vendor bills
    bills = VendorBill.objects.filter(
        vendor=contact,
        bill_date__range=[start_date, end_date]
    ).order_by('bill_date')
    
    for bill in bills:
        running_balance -= float(bill.grand_total)
        total_credit += float(bill.grand_total)
        ledger_data.append({
            'date': bill.bill_date,
            'transaction_type': 'Bill',
            'reference': bill.bill_number,
            'description': f'Bill #{bill.bill_number}',
            'debit': 0,
            'credit': float(bill.grand_total),
            'running_balance': running_balance
        })
    
    # Sort by date
    ledger_data.sort(key=lambda x: x['date'])
    
    serializer = PartnerLedgerSerializer(ledger_data, many=True)
    return Response({
        'contact_name': contact.name,
        'contact_type': contact.contact_type,
        'start_date': start_date,
        'end_date': end_date,
        'opening_balance': 0,  # Simplified - would calculate from earlier transactions
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def partner_ledger(request):
    """Generate Partner Ledger report"""
    partner_id = request.GET.get('partner_id')
    start_date = request.GET.get('start_date', (timezone.now().date() - timedelta(days=30)))
    end_date = request.GET.get('end_date', timezone.now().date())
    
    if not partner_id:
        return Response({'error': 'Partner ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        contact = Contact.objects.get(id=partner_id)
    except Contact.DoesNotExist:
        return Response({'error': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Convert string dates to date objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    ledger_data = []
    running_balance = 0
    total_debit = 0
    total_credit = 0
    
    # Get customer invoices
    invoices = CustomerInvoice.objects.filter(
        customer=contact,
        invoice_date__range=[start_date, end_date]
    ).order_by('invoice_date')
    
    for invoice in invoices:
        running_balance += float(invoice.grand_total)
        total_debit += float(invoice.grand_total)
        ledger_data.append({
            'date': invoice.invoice_date,
            'transaction_type': 'Invoice',
            'reference': invoice.invoice_number,
            'description': f'Invoice #{invoice.invoice_number}',
            'debit': float(invoice.grand_total),
            'credit': 0,
            'running_balance': running_balance
        })
    
    # Get vendor bills
    bills = VendorBill.objects.filter(
        vendor=contact,
        bill_date__range=[start_date, end_date]
    ).order_by('bill_date')
    
    for bill in bills:
        running_balance -= float(bill.grand_total)
        total_credit += float(bill.grand_total)
        ledger_data.append({
            'date': bill.bill_date,
            'transaction_type': 'Bill',
            'reference': bill.bill_number,
            'description': f'Bill #{bill.bill_number}',
            'debit': 0,
            'credit': float(bill.grand_total),
            'running_balance': running_balance
        })
    
    # Sort by date
    ledger_data.sort(key=lambda x: x['date'])
    
    serializer = PartnerLedgerSerializer(ledger_data, many=True)
    return Response({
        'contact_name': contact.name,
        'contact_type': contact.contact_type,
        'start_date': start_date,
        'end_date': end_date,
        'opening_balance': 0,  # Simplified - would calculate from earlier transactions
        'closing_balance': running_balance,
        'total_debit': total_debit,
        'total_credit': total_credit,
        'transactions': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stock_report(request):
    """Generate Stock Report"""
    from master_data.models import Product
    from transactions.models import CustomerInvoiceLineItem, VendorBillLineItem
    
    as_of_date = request.GET.get('as_of_date', timezone.now().date())
    
    # Get all products
    products = Product.objects.filter(is_active=True)
    
    stock_data = []
    total_stock_value = 0
    
    for product in products:
        # Calculate purchased quantity from vendor bills
        purchased_qty = VendorBillLineItem.objects.filter(
            product=product,
            vendor_bill__bill_date__lte=as_of_date
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # Calculate sold quantity from customer invoices
        sold_qty = CustomerInvoiceLineItem.objects.filter(
            product=product,
            customer_invoice__invoice_date__lte=as_of_date
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # Current quantity = purchased - sold
        current_qty = purchased_qty - sold_qty
        
        # Calculate average cost from purchases
        total_purchase_value = VendorBillLineItem.objects.filter(
            product=product,
            vendor_bill__bill_date__lte=as_of_date
        ).aggregate(total=Sum(F('quantity') * F('unit_price')))['total'] or 0
        
        avg_cost = (total_purchase_value / purchased_qty) if purchased_qty > 0 else product.selling_price or 0
        stock_value = current_qty * avg_cost
        total_stock_value += stock_value
        
        stock_data.append({
            'product_name': product.name,
            'product_type': product.type,
            'product_sku': product.sku,
            'opening_quantity': 0,  # Simplified - would need opening stock feature
            'purchased_quantity': purchased_qty,
            'sold_quantity': sold_qty,
            'current_quantity': current_qty,
            'average_cost': avg_cost,
            'stock_value': stock_value
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

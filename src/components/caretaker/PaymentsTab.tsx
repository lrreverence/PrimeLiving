import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, CheckCircle, AlertCircle, Clock, Calendar, Eye, Download, Check, X, Plus } from 'lucide-react';

interface Payment {
  id: number;
  tenantName: string;
  unit: string;
  amount: number;
  period: string;
  paymentDate: string;
  method: string;
  status: string;
  receipt_url?: string;
}

interface Tenant {
  id: number;
  name: string;
  email: string;
  unit: string;
  tenantData?: any;
}

interface PaymentsTabProps {
  payments: Payment[];
  paymentsLoading: boolean;
  paymentFilter: string;
  onFilterChange: (filter: string) => void;
  onApprovePayment: (paymentId: number) => void;
  onRejectPayment: (paymentId: number) => void;
  onRecordPayment?: (paymentData: {
    tenant_id: number;
    contract_id: number | null;
    amount: number;
    payment_date: string;
    payment_mode: string;
    status: string;
    transaction_id?: string;
  }) => void;
  tenants?: Tenant[];
  totalPayments: number;
  confirmedCount: number;
  pendingCount: number;
}

export const PaymentsTab = ({
  payments,
  paymentsLoading,
  paymentFilter,
  onFilterChange,
  onApprovePayment,
  onRejectPayment,
  onRecordPayment,
  tenants = [],
  totalPayments,
  confirmedCount,
  pendingCount
}: PaymentsTabProps) => {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    tenant_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    status: 'confirmed',
    transaction_id: ''
  });

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
    setReceiptModalOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleRecordPayment = () => {
    if (!onRecordPayment) return;
    
    const selectedTenant = tenants.find(t => t.id.toString() === recordForm.tenant_id);
    if (!selectedTenant) {
      return;
    }

    // Get contract_id from tenant data
    let contract_id = null;
    if (selectedTenant.tenantData) {
      const contracts = selectedTenant.tenantData.contracts;
      if (Array.isArray(contracts) && contracts.length > 0) {
        contract_id = contracts[0].contract_id;
      } else if (contracts && contracts.contract_id) {
        contract_id = contracts.contract_id;
      }
    }

    onRecordPayment({
      tenant_id: parseInt(recordForm.tenant_id),
      contract_id: contract_id,
      amount: parseFloat(recordForm.amount),
      payment_date: recordForm.payment_date,
      payment_mode: recordForm.payment_mode,
      status: recordForm.status,
      transaction_id: recordForm.transaction_id || undefined
    });

    setRecordModalOpen(false);
    setRecordForm({
      tenant_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      status: 'confirmed',
      transaction_id: ''
    });
  };

  const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isPDF = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
  };

  const filteredPayments = payments.filter(payment => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'pending') {
      return payment.status === 'pending';
    }
    if (paymentFilter === 'confirmed') {
      return payment.status === 'confirmed';
    }
    return payment.status === paymentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Payment Tracking</h2>
          <p className="text-gray-600 mt-1">Record and monitor rent payments from tenants</p>
        </div>
        <Button 
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2"
          onClick={() => setRecordModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">₱{totalPayments.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900">{confirmedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Filters */}
      <div className="flex space-x-2">
        <Button
          variant={paymentFilter === 'all' ? 'default' : 'outline'}
          onClick={() => onFilterChange('all')}
          className="rounded-full"
        >
          All Payments
        </Button>
        <Button
          variant={paymentFilter === 'confirmed' ? 'default' : 'outline'}
          onClick={() => onFilterChange('confirmed')}
          className="rounded-full"
        >
          Confirmed
        </Button>
        <Button
          variant={paymentFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => onFilterChange('pending')}
          className="rounded-full"
        >
          Pending
        </Button>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Complete payment records and transaction details</p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Loading payments...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {paymentFilter === 'all' 
                        ? 'No payment records found.' 
                        : `No ${paymentFilter} payments found.`}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{payment.tenantName}</div>
                          {payment.unit !== 'N/A' && (
                            <div className="text-sm text-gray-500">({payment.unit})</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">₱{payment.amount.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{payment.period}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{payment.paymentDate}</td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={
                            payment.method === 'gcash' || payment.method === 'g-cash' ? 'bg-blue-100 text-blue-800' :
                            payment.method === 'cash' ? 'bg-green-100 text-green-800' :
                            payment.method === 'bank transfer' || payment.method === 'bank-transfer' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {payment.method}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {payment.status === 'confirmed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : payment.status === 'rejected' ? (
                            <X className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          <Badge 
                            className={
                              payment.status === 'confirmed' 
                                ? 'bg-green-800 text-white' 
                                : payment.status === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-yellow-600 text-white'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {payment.receipt_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewReceipt(payment.receipt_url!)}
                              title="View Receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled title="No receipt available">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </Button>
                          )}
                          {payment.receipt_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(payment.receipt_url, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                              <Download className="w-4 h-4 text-gray-400" />
                            </Button>
                          )}
                          {payment.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={() => onApprovePayment(payment.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-3 bg-red-50 text-red-700 hover:bg-red-100"
                                onClick={() => onRejectPayment(payment.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt View Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Payment Receipt</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {selectedReceipt && (
              <div className="w-full">
                {isImage(selectedReceipt) ? (
                  <div className="flex items-center justify-center">
                    <img 
                      src={selectedReceipt} 
                      alt="Payment Receipt" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-center p-8 text-gray-500';
                        errorDiv.textContent = 'Failed to load receipt image';
                        target.parentElement?.appendChild(errorDiv);
                      }}
                    />
                  </div>
                ) : isPDF(selectedReceipt) ? (
                  <div className="w-full h-[70vh]">
                    <iframe
                      src={selectedReceipt}
                      className="w-full h-full border rounded-lg"
                      title="Payment Receipt PDF"
                    />
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedReceipt, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Open in New Tab</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-600 mb-4">Receipt preview not available for this file type.</p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedReceipt, '_blank')}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Receipt</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={recordModalOpen} onOpenChange={setRecordModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Record Payment</DialogTitle>
            <DialogDescription>
              Manually record a payment from a tenant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select
                value={recordForm.tenant_id}
                onValueChange={(value) => setRecordForm({ ...recordForm, tenant_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name} {tenant.unit !== 'N/A' && `(${tenant.unit})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={recordForm.payment_date}
                onChange={(e) => setRecordForm({ ...recordForm, payment_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Method *</Label>
                <Select
                  value={recordForm.payment_mode}
                  onValueChange={(value) => setRecordForm({ ...recordForm, payment_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={recordForm.status}
                  onValueChange={(value) => setRecordForm({ ...recordForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
              <Input
                id="transaction_id"
                type="text"
                placeholder="Enter transaction ID or reference number"
                value={recordForm.transaction_id}
                onChange={(e) => setRecordForm({ ...recordForm, transaction_id: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRecordModalOpen(false);
                setRecordForm({
                  tenant_id: '',
                  amount: '',
                  payment_date: new Date().toISOString().split('T')[0],
                  payment_mode: 'cash',
                  status: 'confirmed',
                  transaction_id: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!recordForm.tenant_id || !recordForm.amount || !recordForm.payment_date}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


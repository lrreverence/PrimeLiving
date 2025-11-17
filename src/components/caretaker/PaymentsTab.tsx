import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface PaymentsTabProps {
  payments: Payment[];
  paymentsLoading: boolean;
  paymentFilter: string;
  onFilterChange: (filter: string) => void;
  onApprovePayment: (paymentId: number) => void;
  onRejectPayment: (paymentId: number) => void;
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
  totalPayments,
  confirmedCount,
  pendingCount
}: PaymentsTabProps) => {
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
        <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
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
                          <div className="text-sm text-gray-500">({payment.unit})</div>
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
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
    </div>
  );
};


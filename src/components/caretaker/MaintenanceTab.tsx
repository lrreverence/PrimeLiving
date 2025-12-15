import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface MaintenanceTabProps {
  maintenanceFilter: string;
  onFilterChange: (value: string) => void;
  maintenancePendingCount: number;
  maintenanceInProgressCount: number;
  maintenanceCompletedCount: number;
  maintenanceTotalCount: number;
  maintenanceRequests: any[];
  maintenanceRequestsLoading?: boolean;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const MaintenanceTab = ({
  maintenanceFilter,
  onFilterChange,
  maintenancePendingCount,
  maintenanceInProgressCount,
  maintenanceCompletedCount,
  maintenanceTotalCount,
  maintenanceRequests,
  maintenanceRequestsLoading = false,
  getPriorityBadge,
  getStatusBadge
}: MaintenanceTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Maintenance & Incidents</h2>
          <p className="text-gray-600 mt-1">Track and manage maintenance requests and incident reports</p>
        </div>
        <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Request</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{maintenancePendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{maintenanceInProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{maintenanceCompletedCount}</p>
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
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{maintenanceTotalCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div>
        <Select value={maintenanceFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Maintenance Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <p className="text-sm text-gray-600 mt-1">View and manage all maintenance requests</p>
        </CardHeader>
        <CardContent>
          {maintenanceRequestsLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading maintenance requests...</p>
            </div>
          ) : maintenanceRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No maintenance requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceRequests.map((request) => (
                <div key={request.request_id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{request.title || 'Maintenance Request'}</h4>
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Unit: {request.unit_number || 'N/A'}</span>
                        {request.tenant_name && <span>Tenant: {request.tenant_name}</span>}
                        <span>Created: {new Date(request.created_date || request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


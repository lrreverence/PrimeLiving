import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Wrench, Clock, CheckCircle, AlertTriangle, User, Home, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  onMaintenanceUpdate?: () => void;
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
  getStatusBadge,
  onMaintenanceUpdate
}: MaintenanceTabProps) => {
  const { toast } = useToast();
  const [completingRequest, setCompletingRequest] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const handleMarkCompleted = async (requestId: number) => {
    try {
      setCompletingRequest(requestId);
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'completed',
          resolved_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Completed",
        description: "Maintenance request has been marked as completed.",
      });

      if (onMaintenanceUpdate) {
        onMaintenanceUpdate();
      }
    } catch (error: any) {
      console.error('Error completing maintenance request:', error);
      toast({
        title: "Error",
        description: `Failed to mark request as completed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setCompletingRequest(null);
    }
  };

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
                <div 
                  key={request.request_id} 
                  className="border-b border-gray-100 pb-4 last:border-0 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedRequest(request);
                    setRequestModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{request.title || 'Maintenance Request'}</h4>
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Unit: {request.unit_number || 'N/A'}</span>
                        {request.tenant_name && <span>Tenant: {request.tenant_name}</span>}
                        <span>Created: {new Date(request.created_date || request.created_at).toLocaleDateString()}</span>
                        {request.resolved_date && (
                          <span>Resolved: {new Date(request.resolved_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {request.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkCompleted(request.request_id)}
                          disabled={completingRequest === request.request_id}
                          className="flex items-center space-x-1"
                        >
                          {completingRequest === request.request_id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                              <span>Completing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Mark Completed</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Request Detail Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Maintenance Request Details</DialogTitle>
            <DialogDescription className="mt-1">
              Complete information about this maintenance request
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {selectedRequest && (
              <div className="space-y-6">
                {/* Header with Status and Priority */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedRequest.title || 'Maintenance Request'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(selectedRequest.priority)}
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                  {selectedRequest.status !== 'completed' && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkCompleted(selectedRequest.request_id);
                      }}
                      disabled={completingRequest === selectedRequest.request_id}
                      className="flex items-center space-x-2"
                    >
                      {completingRequest === selectedRequest.request_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Completed</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Description</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </CardContent>
                </Card>

                {/* Request Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Home className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Unit</p>
                          <p className="font-medium text-gray-900">{selectedRequest.unit_number || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedRequest.tenant_name && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Tenant</p>
                            <p className="font-medium text-gray-900">{selectedRequest.tenant_name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Created Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedRequest.created_date || selectedRequest.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedRequest.resolved_date && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Resolved Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(selectedRequest.resolved_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Additional Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Request ID:</span>
                      <span className="text-sm font-medium text-gray-900">#{selectedRequest.request_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{selectedRequest.priority || 'Medium'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{selectedRequest.status || 'Pending'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 p-6 border-t flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setRequestModalOpen(false);
                setSelectedRequest(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


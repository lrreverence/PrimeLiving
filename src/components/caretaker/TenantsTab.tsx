import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Plus, Edit, Eye, Trash2, IdCard, X, Download, FileText } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  email: string;
  unit: string;
  contact: string;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string;
  status: string;
  balance: number;
  validIdUrl?: string;
  validIdUploadedAt?: string;
}

interface TenantsTabProps {
  tenants: Tenant[];
  tenantsLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TenantsTab = ({ tenants, tenantsLoading, searchTerm, onSearchChange }: TenantsTabProps) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [viewIdModalOpen, setViewIdModalOpen] = useState(false);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewId = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewIdModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-gray-600 mt-1">Manage tenant profiles, contracts, and unit assignments.</p>
        </div>
        <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tenants by name or unit..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Tenants Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Tenants</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Current tenant list and contract information.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Monthly Rent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contract Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valid ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Balance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantsLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      Loading tenants...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      {searchTerm ? 'No tenants found matching your search.' : 'No tenants found in your branch.'}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {tenant.unit}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{tenant.contact}</td>
                      <td className="py-4 px-4 font-medium">₱{tenant.monthlyRent.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {tenant.contractStart !== 'N/A' && tenant.contractEnd !== 'N/A' 
                          ? `${tenant.contractStart} to ${tenant.contractEnd}`
                          : 'No contract'
                        }
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={
                            tenant.status === 'active' 
                              ? 'bg-gray-800 text-white' 
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {tenant.validIdUrl ? (
                          <Badge className="bg-green-100 text-green-800">
                            <IdCard className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <IdCard className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={tenant.balance === 0 ? 'text-green-600' : 'text-red-600'}>
                          ₱{tenant.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {tenant.validIdUrl ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                              onClick={() => handleViewId(tenant)}
                              title="View Valid ID"
                            >
                              <IdCard className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-400 cursor-not-allowed"
                              disabled
                              title="No Valid ID uploaded"
                            >
                              <IdCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* View Valid ID Modal */}
      <Dialog open={viewIdModalOpen} onOpenChange={setViewIdModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">Valid ID Document</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedTenant?.name} - {selectedTenant?.email}
                  {selectedTenant?.validIdUploadedAt && (
                    <span className="block text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(selectedTenant.validIdUploadedAt).toLocaleDateString()}
                    </span>
                  )}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewIdModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {selectedTenant?.validIdUrl ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                  {selectedTenant.validIdUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-semibold text-gray-700">PDF Document</p>
                          <p className="text-sm text-gray-500 mt-1">Click below to view the PDF</p>
                        </div>
                        <Button
                          onClick={() => window.open(selectedTenant.validIdUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Open PDF in New Tab
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <img
                        src={selectedTenant.validIdUrl}
                        alt={`Valid ID for ${selectedTenant.name}`}
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                  <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <p class="text-lg font-semibold text-gray-700">Failed to load image</p>
                                  <p class="text-sm text-gray-500 mt-1">The image may have been deleted or is no longer accessible</p>
                                </div>
                                <a href="${selectedTenant.validIdUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">
                                  Try opening in new tab
                                </a>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedTenant?.validIdUrl) {
                        window.open(selectedTenant.validIdUrl, '_blank');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => setViewIdModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <IdCard className="w-16 h-16 text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">No Valid ID Available</p>
                  <p className="text-sm text-gray-500 mt-1">This tenant has not uploaded a valid ID yet</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


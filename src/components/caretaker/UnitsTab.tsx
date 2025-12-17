import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, User, Calendar, DollarSign } from 'lucide-react';

interface Unit {
  unit_id: number;
  unit_number: string;
  unit_type: string;
  monthly_rent: number;
  status: string;
  branch?: string;
  contracts?: any[] | any;
}

interface UnitsTabProps {
  units: Unit[];
  unitsLoading: boolean;
}

export const UnitsTab = ({ units, unitsLoading }: UnitsTabProps) => {
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'occupied':
        return <Badge className="bg-green-100 text-green-800">Occupied</Badge>;
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  const getCurrentTenant = (unit: Unit) => {
    if (!unit.contracts) return null;
    const contracts = Array.isArray(unit.contracts) ? unit.contracts : [unit.contracts];
    const activeContract = contracts.find((c: any) => c.status === 'active');
    if (activeContract?.tenants) {
      const tenant = Array.isArray(activeContract.tenants) 
        ? activeContract.tenants[0] 
        : activeContract.tenants;
      return tenant;
    }
    return null;
  };

  if (unitsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Units</h2>
          <p className="text-gray-600 mt-1">View all units in your branch</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-3xl font-bold text-gray-900">{units.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-3xl font-bold text-gray-900">
                  {units.filter(u => u.status?.toLowerCase() === 'occupied').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-gray-900">
                  {units.filter(u => u.status?.toLowerCase() === 'available').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units List */}
      <Card>
        <CardHeader>
          <CardTitle>All Units</CardTitle>
          <p className="text-sm text-gray-600 mt-1">View and manage all units in your branch</p>
        </CardHeader>
        <CardContent>
          {units.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No units found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const tenant = getCurrentTenant(unit);
                return (
                  <div key={unit.unit_id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            Unit {unit.unit_number}
                          </h4>
                          {getStatusBadge(unit.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Home className="w-4 h-4" />
                            <span>Type: {unit.unit_type || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>Rent: ₱{parseFloat(unit.monthly_rent?.toString() || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {tenant && (
                            <>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>
                                  Tenant: {tenant.first_name || ''} {tenant.last_name || ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Branch: {unit.branch || 'N/A'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


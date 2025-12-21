import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Home, User, Calendar, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  onUnitUpdate?: () => void;
  landlordId?: number;
}

export const UnitsTab = ({ units, unitsLoading, onUnitUpdate, landlordId }: UnitsTabProps) => {
  const { toast } = useToast();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unit_number: '',
    unit_type: '',
    monthly_rent: '',
    status: 'available'
  });
  const getUnitStatus = (unit: Unit) => {
    // Check if unit has an active contract - if so, it's occupied
    const tenant = getCurrentTenant(unit);
    if (tenant) {
      return 'occupied';
    }
    // Otherwise use the status from database
    return unit.status?.toLowerCase() || 'available';
  };

  const getStatusBadge = (unit: Unit) => {
    const status = getUnitStatus(unit);
    switch (status) {
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

  const handleAddUnit = () => {
    setUnitForm({
      unit_number: '',
      unit_type: '',
      monthly_rent: '',
      status: 'available'
    });
    setAddModalOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setUnitForm({
      unit_number: unit.unit_number,
      unit_type: unit.unit_type || '',
      monthly_rent: unit.monthly_rent?.toString() || '',
      status: unit.status || 'available'
    });
    setEditModalOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    if (!unitForm.unit_number || !unitForm.unit_type || !unitForm.monthly_rent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('units')
        .insert({
          unit_number: unitForm.unit_number,
          unit_type: unitForm.unit_type,
          monthly_rent: parseFloat(unitForm.monthly_rent),
          status: unitForm.status,
          landlord_id: landlordId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Unit Added",
        description: "Unit has been added successfully.",
      });

      setAddModalOpen(false);
      setUnitForm({
        unit_number: '',
        unit_type: '',
        monthly_rent: '',
        status: 'available'
      });

      if (onUnitUpdate) {
        onUnitUpdate();
      }
    } catch (error: any) {
      console.error('Error adding unit:', error);
      toast({
        title: "Error",
        description: `Failed to add unit: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedUnit || !unitForm.unit_number || !unitForm.unit_type || !unitForm.monthly_rent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('units')
        .update({
          unit_number: unitForm.unit_number,
          unit_type: unitForm.unit_type,
          monthly_rent: parseFloat(unitForm.monthly_rent),
          status: unitForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('unit_id', selectedUnit.unit_id);

      if (error) {
        throw error;
      }

      toast({
        title: "Unit Updated",
        description: "Unit has been updated successfully.",
      });

      setEditModalOpen(false);
      setSelectedUnit(null);

      if (onUnitUpdate) {
        onUnitUpdate();
      }
    } catch (error: any) {
      console.error('Error updating unit:', error);
      toast({
        title: "Error",
        description: `Failed to update unit: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUnit) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('unit_id', selectedUnit.unit_id);

      if (error) {
        throw error;
      }

      toast({
        title: "Unit Deleted",
        description: "Unit has been deleted successfully.",
      });

      setDeleteDialogOpen(false);
      setSelectedUnit(null);

      if (onUnitUpdate) {
        onUnitUpdate();
      }
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      toast({
        title: "Error",
        description: `Failed to delete unit: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600 mt-1">View and manage all units in your branch</p>
        </div>
        <Button 
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2"
          onClick={handleAddUnit}
        >
          <Plus className="w-4 h-4" />
          <span>Add Unit</span>
        </Button>
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
                  {units.filter(u => {
                    const tenant = getCurrentTenant(u);
                    return tenant !== null || u.status?.toLowerCase() === 'occupied';
                  }).length}
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
                  {units.filter(u => {
                    const tenant = getCurrentTenant(u);
                    return tenant === null && u.status?.toLowerCase() !== 'occupied' && u.status?.toLowerCase() !== 'maintenance';
                  }).length}
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
                          {getStatusBadge(unit)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnit(unit)}
                          className="h-8 w-8 p-0"
                          title="Edit Unit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Unit Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Unit</DialogTitle>
            <DialogDescription>
              Create a new unit in your branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit_number">Unit Number *</Label>
              <Input
                id="unit_number"
                type="text"
                placeholder="e.g., 101, A-1, etc."
                value={unitForm.unit_number}
                onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_type">Unit Type *</Label>
              <Input
                id="unit_type"
                type="text"
                placeholder="e.g., Studio, 1BR, 2BR, etc."
                value={unitForm.unit_type}
                onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Monthly Rent (₱) *</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitForm.monthly_rent}
                  onChange={(e) => setUnitForm({ ...unitForm, monthly_rent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={unitForm.status}
                  onValueChange={(value) => setUnitForm({ ...unitForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAddModalOpen(false);
                setUnitForm({
                  unit_number: '',
                  unit_type: '',
                  monthly_rent: '',
                  status: 'available'
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAdd}
              disabled={loading || !unitForm.unit_number || !unitForm.unit_type || !unitForm.monthly_rent}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {loading ? 'Adding...' : 'Add Unit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Unit</DialogTitle>
            <DialogDescription>
              Update unit information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_unit_number">Unit Number *</Label>
              <Input
                id="edit_unit_number"
                type="text"
                placeholder="e.g., 101, A-1, etc."
                value={unitForm.unit_number}
                onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_unit_type">Unit Type *</Label>
              <Input
                id="edit_unit_type"
                type="text"
                placeholder="e.g., Studio, 1BR, 2BR, etc."
                value={unitForm.unit_type}
                onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_monthly_rent">Monthly Rent (₱) *</Label>
                <Input
                  id="edit_monthly_rent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitForm.monthly_rent}
                  onChange={(e) => setUnitForm({ ...unitForm, monthly_rent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">Status *</Label>
                <Select
                  value={unitForm.status}
                  onValueChange={(value) => setUnitForm({ ...unitForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedUnit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={loading || !unitForm.unit_number || !unitForm.unit_type || !unitForm.monthly_rent}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {loading ? 'Updating...' : 'Update Unit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete unit {selectedUnit?.unit_number} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedUnit(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


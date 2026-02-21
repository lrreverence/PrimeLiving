import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  unit: string;
}

interface Document {
  document_id: number;
  document_type: string;
  title: string;
  generated_date: string;
  tenants?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}

interface DocumentsTabProps {
  documents: Document[];
  documentsLoading: boolean;
  tenants: Tenant[];
  selectedTenant: string;
  selectedDocumentType: string;
  onTenantChange: (value: string) => void;
  onDocumentTypeChange: (value: string) => void;
  onGenerateDocument: () => void;
  onExportPDF: (document: Document) => void;
  documentTypes: string[];
}

export const DocumentsTab = ({
  documents,
  documentsLoading,
  tenants,
  selectedTenant,
  selectedDocumentType,
  onTenantChange,
  onDocumentTypeChange,
  onGenerateDocument,
  onExportPDF,
  documentTypes
}: DocumentsTabProps) => {
  return (
    <div className="space-y-8">
      {/* New Document Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Document Management</h2>
        <p className="text-gray-600 mt-1">Manage printable documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Document</CardTitle>
          <p className="text-sm text-gray-600">Create receipts, contracts, and notices for tenants</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
              <Select value={selectedTenant} onValueChange={onTenantChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`}>
                      {tenant.name}{tenant.unit !== 'N/A' && ` (${tenant.unit})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <Select value={selectedDocumentType} onValueChange={onDocumentTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={onGenerateDocument}
                className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <p className="text-sm text-gray-600 mt-1">View and export all documents</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Document Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documentsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No documents found. Create a document to get started.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => {
                    const tenant = document.tenants || null;
                    const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.email?.split('@')[0] || 'N/A' : 'N/A';
                    
                    return (
                      <tr key={document.document_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            {document.document_type}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">{document.title}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{tenantName}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(document.generated_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => onExportPDF(document)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


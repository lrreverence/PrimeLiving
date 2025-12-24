import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadValidIdProps {
  tenantId: number;
  onUploadSuccess: () => void;
  compact?: boolean; // For use in dialogs/modals
  apartmentManagerId?: number; // For automatic verification
}

export const UploadValidId = ({ tenantId, onUploadSuccess, compact = false, apartmentManagerId }: UploadValidIdProps) => {
  const [validIdFile, setValidIdFile] = useState<File | null>(null);
  const [validIdPreview, setValidIdPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleValidIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid ID in JPG, PNG, or PDF format');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setValidIdFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setValidIdPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setValidIdPreview(null);
      }
      setError('');
    }
  };

  const removeValidId = () => {
    setValidIdFile(null);
    setValidIdPreview(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!validIdFile) {
      setError('Please select a valid ID file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const fileExt = validIdFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `valid-ids/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-documents')
        .upload(filePath, validIdFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload valid ID. Please try again.');
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('tenant-documents')
        .getPublicUrl(filePath);

      const validIdUrl = urlData.publicUrl;

      // Update tenant record with valid ID URL
      // If uploaded by apartment manager, automatically verify it
      const updateData: any = {
        valid_id_url: validIdUrl,
        valid_id_uploaded_at: new Date().toISOString()
      };

      // Auto-verify if uploaded by apartment manager
      if (apartmentManagerId) {
        updateData.valid_id_verified = true;
        updateData.valid_id_verified_at = new Date().toISOString();
        updateData.valid_id_verified_by = apartmentManagerId;
      }

      const { error: updateError } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('tenant_id', tenantId);

      if (updateError) {
        console.error('Error updating tenant:', updateError);
        setError('Failed to save valid ID. Please try again.');
        setUploading(false);
        return;
      }

      toast({
        title: "Valid ID Uploaded",
        description: apartmentManagerId 
          ? "Valid ID has been uploaded and verified successfully." 
          : "Valid ID has been uploaded successfully.",
      });

      onUploadSuccess();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="validId">
            Upload Valid ID <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2">
            {!validIdFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="validId"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleValidIdChange}
                  className="hidden"
                />
                <label
                  htmlFor="validId"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, or PDF (Max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{validIdFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(validIdFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeValidId}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {validIdPreview && (
                  <div className="mt-4">
                    <img
                      src={validIdPreview}
                      alt="Valid ID preview"
                      className="max-w-full h-48 object-contain rounded border mx-auto"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Accepted: Driver's License, Passport, National ID, or any government-issued ID
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleUpload}
            disabled={!validIdFile || uploading}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Valid ID
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Valid ID Required</CardTitle>
          <CardDescription className="text-base mt-2">
            You need to upload a valid ID document to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="validId">
              Upload Valid ID <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              {!validIdFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="validId"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleValidIdChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="validId"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, or PDF (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{validIdFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(validIdFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeValidId}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {validIdPreview && (
                    <div className="mt-4">
                      <img
                        src={validIdPreview}
                        alt="Valid ID preview"
                        className="max-w-full h-64 object-contain rounded border mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Accepted: Driver's License, Passport, National ID, or any government-issued ID
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why do we need your ID?</p>
                <p className="text-blue-700">
                  We require a valid ID to verify your identity and ensure the security of your account. 
                  Your ID will be kept confidential and used only for verification purposes.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={!validIdFile || uploading}
            size="lg"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Valid ID
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};


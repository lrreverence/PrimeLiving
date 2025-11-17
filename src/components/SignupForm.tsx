import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Lock, User, Phone, Building2, Upload, FileText, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  branch: z.string().min(1, 'Please select a branch'),
  validId: z.instanceof(FileList).optional().refine((files) => {
    // Only require valid ID for tenants
    return true; // We'll check this in the component
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  selectedRole?: 'tenant' | 'caretaker' | null;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin, selectedRole }) => {
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [validIdFile, setValidIdFile] = useState<File | null>(null);
  const [validIdPreview, setValidIdPreview] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

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
  };

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    
    // Require valid ID for tenants
    if (selectedRole === 'tenant' && !validIdFile) {
      setError('Please upload a valid ID document');
      return;
    }

    // If tenant, upload the valid ID first
    let validIdUrl: string | undefined = undefined;
    if (selectedRole === 'tenant' && validIdFile) {
      try {
        setUploadingId(true);
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
          setUploadingId(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('tenant-documents')
          .getPublicUrl(filePath);

        validIdUrl = urlData.publicUrl;
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Failed to upload valid ID. Please try again.');
        setUploadingId(false);
        return;
      } finally {
        setUploadingId(false);
      }
    }

    const result = await signup(
      data.name, 
      data.email, 
      data.password, 
      data.phone, 
      selectedRole || undefined, 
      data.branch,
      validIdUrl
    );
    
    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join PrimeLiving to find your perfect home
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="+63 917 123 4567"
                className="pl-10"
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cainta-rizal">Cainta Rizal Branch</SelectItem>
                        <SelectItem value="sampaloc-manila">Sampaloc Manila Branch</SelectItem>
                        <SelectItem value="cubao-qc">Cubao QC Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.branch && (
                <p className="text-sm text-destructive">{errors.branch.message}</p>
              )}
            </div>

          {/* Valid ID Upload - Only for tenants */}
          {selectedRole === 'tenant' && (
            <div className="space-y-2">
              <Label htmlFor="validId">
                Valid ID <span className="text-destructive">*</span>
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
                          className="max-w-full h-48 object-contain rounded border"
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
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="pl-10"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="pl-10"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || uploadingId}
          >
            {(isLoading || uploadingId) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingId ? 'Uploading ID...' : 'Creating Account...'}
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;

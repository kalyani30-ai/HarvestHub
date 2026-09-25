import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, MapPin, Phone, Mail, Package, FileText, Upload, X, Image as ImageIcon } from 'lucide-react';
import { readAuthSession, writeAuthSession } from '@/lib/authSession';

interface DocumentUpload {
  type: string;
  file: File | null;
  fileName: string;
}

interface FarmerFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  farmType: string;
  experience: string;
  description: string;
  documents: DocumentUpload[];
}

const FarmerRegistrationForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const session = readAuthSession();
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  const documentTypes = [
    t('farmer.registration.documents.types.identityCard'),
    t('farmer.registration.documents.types.kcc'),
    t('farmer.registration.documents.types.landOwnership'),
    t('farmer.registration.documents.types.pmKisan'),
    t('farmer.registration.documents.types.cropInsurance'),
    t('farmer.registration.documents.types.incomeCertificate'),
    t('farmer.registration.documents.types.mandiReceipts'),
    t('farmer.registration.documents.types.equipmentBill'),
    t('farmer.registration.documents.types.panchayatLetter')
  ];

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documentErrors, setDocumentErrors] = useState<string>('');
  const [farmImages, setFarmImages] = useState<File[]>([]);
  const [farmImagesError, setFarmImagesError] = useState<string>('');

  const [formData, setFormData] = useState<FarmerFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    farmType: '',
    experience: '',
    description: '',
    documents: []
  });

  const handleInputChange = (field: keyof FarmerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentSelection = (documentType: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentType]);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { type: documentType, file: null, fileName: '' }]
      }));
    } else {
      setSelectedDocuments(prev => prev.filter(doc => doc !== documentType));
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.type !== documentType)
      }));
    }
    setDocumentErrors('');
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setDocumentErrors(t('farmer.registration.documents.invalidFileType'));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setDocumentErrors(t('farmer.registration.documents.fileTooLarge'));
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.type === documentType 
            ? { ...doc, file, fileName: file.name }
            : doc
        )
      }));
      setDocumentErrors('');
    }
  };

  const removeDocument = (documentType: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc !== documentType));
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.type !== documentType)
    }));
  };

  const handleFarmImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    let error = '';
    let validFiles: File[] = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        error = t('farmer.registration.images.invalidType');
        break;
      }
      if (file.size > 5 * 1024 * 1024) {
        error = t('farmer.registration.images.tooLarge');
        break;
      }
      validFiles.push(file);
    }
    if (!error) {
      if (farmImages.length + validFiles.length > 5) {
        error = t('farmer.registration.images.maxImages');
      }
    }
    if (error) {
      setFarmImagesError(error);
      return;
    }
    setFarmImagesError('');
    setFarmImages(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFarmImage = (index: number) => {
    setFarmImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateDocuments = () => {
    const uploadedDocuments = formData.documents.filter(doc => doc.file);

    if (uploadedDocuments.length === 0) {
      setDocumentErrors(t('farmer.registration.documents.uploadRequired'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate farm images
    if (farmImages.length < 3) {
      setFarmImagesError(t('farmer.registration.images.minRequired'));
      return;
    }

    if (!validateDocuments()) {
      return;
    }

    const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || 'http://localhost:5000');

    try {
      const token = session.token;
      if (!token) {
        alert(t('farmer.registration.loginRequired'));
        navigate('/login');
        return;
      }

      // Create FormData for file upload
      const uploadFormData = new FormData();
      
      // Add form fields
      uploadFormData.append('name', formData.name);
      uploadFormData.append('email', formData.email);
      uploadFormData.append('phone', formData.phone);
      uploadFormData.append('farmName', formData.farmType);
      uploadFormData.append('farmLocation', formData.location);
      uploadFormData.append('farmAddress', formData.address);
      uploadFormData.append('farmType', formData.farmType);
      uploadFormData.append('experience', formData.experience);
      uploadFormData.append('description', formData.description);

      // Add ID proof files
      const uploadedDocuments = formData.documents.filter(doc => doc.file);
      uploadedDocuments.forEach((doc, index) => {
        if (doc.file) {
          uploadFormData.append('idProofs', doc.file);
          uploadFormData.append(`idProofType${index}`, doc.type);
        }
      });

      // Add farm image files
      farmImages.forEach((file) => {
        uploadFormData.append('farmImages', file);
      });

      const response = await fetch(`${API_URL}/api/auth/farmer-application`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Do NOT set Content-Type when using FormData - browser sets it automatically with boundary
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('farmer.registration.submitFailed'));
      }

      // Update session with new token and user data if returned
      if (data.token || data.user) {
        const currentSession = readAuthSession();
        const updatedSession = {
          ...currentSession,
          token: data.token || currentSession.token,
          user: data.user || currentSession.user,
          userType: data.userType || 'farmer',
          activeRole: data.activeRole || 'farmer',
          roles: data.user?.roles || [...(currentSession.roles || []), 'farmer']
        };
        writeAuthSession(updatedSession);

        // Also set farmerToken in localStorage for FarmerDashboard compatibility
        localStorage.setItem('farmerToken', data.token || currentSession.token);
        localStorage.setItem('farmerUser', JSON.stringify(data.user || currentSession.user));
      }

      // Application submitted successfully - status is 'pending'
      // User is redirected to Farmer Dashboard while waiting for admin approval
      alert(t('farmer.registration.submitSuccess') + '\n\n' + t('farmer.registration.reviewMessage'));
      navigate('/farmer-dashboard');
    } catch (error: any) {
      console.error('Submission error:', error);
      const errorMessage = error.message || t('farmer.registration.tryAgain');
      alert(`${t('farmer.registration.submitFailed')}: ${errorMessage}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const canSubmit = () => {
    const uploadedDocuments = formData.documents.filter(doc => doc.file);
    return uploadedDocuments.length >= 1 && farmImages.length >= 3;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('common.back')}
          </Button>
          <div className="flex items-center">
            <img 
              src="/images/main-log.png" 
              alt="Harvest Hub Logo" 
              className="h-8 w-8 mr-3 mix-blend-multiply"
            />
            <h1 className="text-2xl font-bold text-gray-800">{t('farmer.registration.title')}</h1>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
              <Package className="h-6 w-6 mr-2 text-harvest-green" />
              {t('farmer.registration.title')}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t('farmer.registration.subtitle')}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <User className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmer.registration.personalInfo')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('farmer.registration.fullName')} *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('farmer.registration.fullNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t('auth.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">{t('farmer.registration.phoneNumber')} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('auth.phoneNumberPlaceholder')}
                    required
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmer.registration.farmDetails')}
                </h3>
                
                <div>
                  <Label htmlFor="location">{t('farmer.registration.location')} *</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={t('auth.locationPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">{t('common.address')} *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('auth.farmerAddressPlaceholder')}
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Farm Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmer.registration.farmDetails')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farmType">{t('farmer.registration.farmType')} *</Label>
                    <Input
                      id="farmType"
                      type="text"
                      value={formData.farmType}
                      onChange={(e) => handleInputChange('farmType', e.target.value)}
                      placeholder={t('auth.farmTypePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">{t('farmer.registration.experience')} *</Label>
                    <Input
                      id="experience"
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder={t('auth.experiencePlaceholder')}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">{t('farmer.registration.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('auth.descriptionPlaceholder')}
                    rows={4}
                  />
                </div>
              </div>

              {/* Identity Verification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmer.registration.identityVerification')}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {t('farmer.registration.documents.uploadAtLeastOne')}
                </p>

                <div className="space-y-4">
                  {documentTypes.map((docType) => (
                    <div key={docType} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          id={docType}
                          checked={selectedDocuments.includes(docType)}
                          onCheckedChange={(checked) => handleDocumentSelection(docType, checked as boolean)}
                        />
                        <Label htmlFor={docType} className="text-sm font-medium cursor-pointer">
                          {docType}
                        </Label>
                      </div>

                      {selectedDocuments.includes(docType) && (
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(docType, e.target.files?.[0] || null)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDocument(docType)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {formData.documents.find(doc => doc.type === docType)?.fileName && (
                            <p className="text-xs text-green-600 flex items-center">
                              <Upload className="h-3 w-3 mr-1" />
                              {formData.documents.find(doc => doc.type === docType)?.fileName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {documentErrors && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {documentErrors}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>{t('farmer.registration.documents.acceptedFormats')}</p>
                  <p>{t('farmer.registration.documents.maxFileSize')}</p>
                </div>
              </div>

              {/* Farm Verification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-harvest-green" />
                  {t('farmer.registration.farmVerification')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('farmer.registration.images.uploadAtLeastThree')}
                </p>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={handleFarmImagesChange}
                  className="mb-2"
                />
                {farmImagesError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{farmImagesError}</div>
                )}
                <div className="flex flex-wrap gap-4">
                  {farmImages.map((file, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded overflow-hidden border bg-white flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={t('farmer.registration.images.alt', { index: idx + 1 })}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800"
                        onClick={() => removeFarmImage(idx)}
                        aria-label={t('farmer.registration.images.remove')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {t('farmer.registration.images.count', { current: farmImages.length, required: 3 })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-harvest-green hover:bg-harvest-green-dark text-white px-8 py-3 text-lg font-semibold"
                  disabled={!canSubmit()}
                >
                  {t('farmer.registration.submitButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerRegistrationForm; 
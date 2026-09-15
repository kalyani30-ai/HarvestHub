import React from 'react';
import { useTranslation } from 'react-i18next';
import EmailTest from '@/components/EmailTest';

const EmailTestPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
                           <div className="text-center mb-8">
                   <h1 className="text-3xl font-bold text-gray-900 mb-4">
                     {t('emailTest.title')}
                   </h1>
                   <p className="text-gray-600">
                     {t('emailTest.description')}
                   </p>
                 </div>
          
          <EmailTest />
          
                           <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                   <h3 className="text-lg font-semibold text-blue-900 mb-3">
                     {t('emailTest.howItWorks')}
                   </h3>
                   <ul className="text-blue-800 space-y-2">
                     <li>• <strong>{t('emailTest.loginConfirmation')}:</strong> {t('emailTest.loginConfirmationDesc')}</li>
                     <li>• <strong>{t('emailTest.orderConfirmation')}:</strong> {t('emailTest.orderConfirmationDesc')}</li>
                     <li>• {t('emailTest.emailsIncludeDetails')}</li>
                     <li>• {t('emailTest.missingEmailConfig')}</li>
                     <li>• {t('emailTest.configureEmailSettings')}</li>
                   </ul>
                 </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPage; 
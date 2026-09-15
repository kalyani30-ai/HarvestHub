import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TermsPage = () => {
  const { t } = useTranslation();
  const farmerTerms = t('farmer.terms.list', { returnObjects: true }) as string[];
  const customerTerms = t('customer.terms.list', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-harvest-green">
            {t('auth.termsAndConditions')}
          </h1>
          <LanguageSwitcher />
        </div>
        
        {/* Farmer Terms & Conditions */}
        <section className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-harvest-green text-white rounded-full flex items-center justify-center mr-3 text-sm">🌾</span>
            {t('farmer.terms.title')}
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            {farmerTerms.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        </section>

        {/* Customer Terms & Conditions */}
        <section className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">🛒</span>
            {t('customer.terms.title')}
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            {customerTerms.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        </section>

        {/* General Platform Terms */}
        <section className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('terms.general.title')}</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              {t('terms.general.description')}
            </p>
            <p>
              {t('terms.general.contact')}
            </p>
            <p>
              <strong>{t('terms.general.lastUpdated')}:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsPage; 
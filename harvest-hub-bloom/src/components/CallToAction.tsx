
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-gradient-to-r from-harvest-gold-light to-harvest-gold text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('home.callToAction.title')}</h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10">
          {t('home.callToAction.description')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            asChild
            className="bg-white text-harvest-gold hover:bg-gray-100 sm:text-lg px-8 py-3"
          >
            <Link to="/register-farmer">{t('home.callToAction.joinAsFarmer')}</Link>
          </Button>
          <Button 
            asChild
            className="bg-harvest-green hover:bg-harvest-green-dark sm:text-lg px-8 py-3"
          >
            <Link to="/register">{t('home.callToAction.signUpToShop')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

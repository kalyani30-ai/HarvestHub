import { Link } from "react-router-dom";
import { ArrowUp, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Leaf } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="border-t border-emerald-900/10 bg-[#163021] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-white/10 p-2">
                <Leaf className="h-5 w-5 text-emerald-300" />
              </div>
              <h3 className="text-xl font-semibold">{t('common.appName')}</h3>
            </div>
            <p className="max-w-md text-sm leading-7 text-emerald-50/80">
              {t('footer.description')}
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label={t('footer.facebook')} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label={t('footer.instagram')} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label={t('footer.twitter')} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"><Twitter className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-emerald-50/80">
              <li><Link to="/home" className="transition hover:text-white">{t('common.home')}</Link></li>
              <li><Link to="/products" className="transition hover:text-white">{t('common.products')}</Link></li>
              <li><Link to="/about" className="transition hover:text-white">{t('common.about')}</Link></li>
              <li><Link to="/terms" className="transition hover:text-white">{t('common.terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer.forFarmers')}</h4>
            <ul className="space-y-2 text-sm text-emerald-50/80">
              <li><Link to="/farmer-login" className="transition hover:text-white">{t('footer.farmerLogin')}</Link></li>
              <li><Link to="/farmer-register" className="transition hover:text-white">{t('footer.joinAsFarmer')}</Link></li>
              <li><Link to="/farmer-stories" className="transition hover:text-white">{t('footer.farmerStories')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-emerald-50/80">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /><span>{t('footer.location')}</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href="mailto:harvesttthubb@gmail.com" className="transition hover:text-white">harvesttthubb@gmail.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-emerald-50/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
          <button onClick={scrollToTop} className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3 py-2 transition hover:bg-white/20">
            <ArrowUp className="h-4 w-4" />
            {t('footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

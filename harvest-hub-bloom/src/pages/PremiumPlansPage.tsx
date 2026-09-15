import { useState } from 'react';
import { Check, X, Truck, Clock, Package, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type PlanId = 'base' | 'monthly' | 'quarterly' | 'yearly';

interface PlanFeature {
  feature: string;
  base: boolean;
  monthly: boolean;
  quarterly: boolean;
  yearly: boolean;
}

const PremiumPlansPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  const planFeatures: PlanFeature[] = [
    {
      feature: t('features.accessToAllProducts'),
      base: true,
      monthly: true,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.freeDeliveryOnAllOrders'),
      base: false,
      monthly: true,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.expressDeliverySameDay'),
      base: false,
      monthly: true,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.priorityCustomerSupport'),
      base: false,
      monthly: true,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.earlyAccessToNewProducts'),
      base: false,
      monthly: false,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.specialDiscountsOffers'),
      base: false,
      monthly: false,
      quarterly: true,
      yearly: true
    },
    {
      feature: t('features.exclusiveSeasonalDeals'),
      base: false,
      monthly: false,
      quarterly: false,
      yearly: true
    }
  ];

  const CURRENT_PLAN: PlanId = 'base';

  const handleSelectPlan = (planId: PlanId, planName: string, price: string) => {
    setSelectedPlan(planId);
    toast({
      title: t('planSelected'),
      description: t('selectedDescription', { plan: planName, price }),
      className: "bg-harvest-green text-white",
      duration: 5000,
    });
  };

  const isSelected = (planId: PlanId) => selectedPlan === planId;
  const isCurrentPlan = (planId: PlanId) => CURRENT_PLAN === planId;

  const getPlanCardClassName = (planId: PlanId) =>
    cn(
      'relative rounded-lg shadow-lg transition-all duration-300 ease-out cursor-pointer',
      isSelected(planId)
        ? 'z-20 scale-[1.07] -translate-y-4 border-2 border-harvest-green ring-4 ring-harvest-green/30 shadow-2xl bg-white dark:bg-gray-700'
        : isCurrentPlan(planId)
          ? 'z-10 border-2 border-harvest-green bg-harvest-green/10 dark:bg-harvest-green/20 shadow-lg'
          : 'z-0 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:shadow-xl hover:-translate-y-1'
    );

  const getPlanButtonClassName = (planId: PlanId, variant: 'base' | 'premium' = 'premium') =>
    cn(
      'w-full',
      isCurrentPlan(planId)
        ? 'bg-harvest-green hover:bg-harvest-green-dark text-white'
        : isSelected(planId)
          ? variant === 'base'
            ? 'bg-gray-700 hover:bg-gray-700 ring-2 ring-harvest-gold text-white'
            : 'bg-harvest-green-dark hover:bg-harvest-green-dark ring-2 ring-harvest-gold text-white'
          : variant === 'base'
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-harvest-green hover:bg-harvest-green-dark text-white'
    );

  const getPlanButtonLabel = (planId: PlanId) => {
    if (isCurrentPlan(planId)) return t('currentPlan');
    if (isSelected(planId)) return t('selected');
    return t('subscribeNow');
  };

  const getPlanBadge = (planId: PlanId) => {
    if (isCurrentPlan(planId)) {
      return { label: t('currentPlan'), className: 'bg-harvest-green text-white' };
    }
    if (isSelected(planId)) {
      return { label: t('selected'), className: 'bg-harvest-gold text-white' };
    }
    return null;
  };

  const renderPlanBadge = (planId: PlanId) => {
    const badge = getPlanBadge(planId);
    if (!badge) return null;
    return (
      <div className={cn('text-center text-sm font-semibold py-1.5', badge.className)}>
        {badge.label}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900 min-h-screen">
      {/* Premium Benefits Banner */}
      <div className="bg-gradient-to-r from-harvest-green to-harvest-gold rounded-lg p-6 mb-12 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl">{t('subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <Truck className="h-10 w-10 mb-2" />
            <h3 className="font-bold mb-1">{t('freeDelivery')}</h3>
            <p className="text-sm">{t('onAllOrders')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Clock className="h-10 w-10 mb-2" />
            <h3 className="font-bold mb-1">{t('expressDelivery')}</h3>
            <p className="text-sm">{t('sameDay')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Package className="h-10 w-10 mb-2" />
            <h3 className="font-bold mb-1">{t('prioritySupport')}</h3>
            <p className="text-sm">{t('customerCare')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Star className="h-10 w-10 mb-2" />
            <h3 className="font-bold mb-1">{t('exclusiveOffers')}</h3>
            <p className="text-sm">{t('specialDiscounts')}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto pt-6 md:items-end">
        {/* Base Plan */}
        <div
          className={getPlanCardClassName('base')}
          onClick={() => handleSelectPlan('base', t('basePlan'), t('free'))}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan('base', t('basePlan'), t('free'))}
        >
          <div className="overflow-hidden rounded-lg">
          {renderPlanBadge('base')}
          <div className="p-6 border-b dark:border-gray-600">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{t('basePlan')}</h2>
            <p className="text-4xl font-bold text-center text-harvest-green mb-4">
              {t('free')}
            </p>
            <p className="text-center text-gray-600 dark:text-white">{t('baseDeliveryCharge')}</p>
          </div>
          <div className="p-6 space-y-4">
            {planFeatures.map((item, index) => (
              <div key={index} className="flex items-center">
                {item.base ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={item.base ? "text-gray-700 dark:text-white" : "text-gray-400 dark:text-gray-300"}>
                  {t(`premium.features.${index}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <Button 
              className={getPlanButtonClassName('base', 'base')}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPlan('base', t('basePlan'), t('free'));
              }}
            >
              {getPlanButtonLabel('base')}
            </Button>
          </div>
          </div>
        </div>

        {/* Monthly Plan */}
        <div
          className={getPlanCardClassName('monthly')}
          onClick={() => handleSelectPlan('monthly', t('monthly'), '₹129/month')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan('monthly', t('monthly'), '₹129/month')}
        >
          <div className="overflow-hidden rounded-lg">
          {renderPlanBadge('monthly')}
          <div className="p-6 border-b dark:border-gray-600">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{t('monthly')}</h2>
            <p className="text-4xl font-bold text-center text-harvest-green mb-4">
              ₹129<span className="text-base font-normal text-gray-600 dark:text-white">/month</span>
            </p>
            <p className="text-center text-gray-600 dark:text-white">{t('monthlySavings')}</p>
          </div>
          <div className="p-6 space-y-4">
            {planFeatures.map((item, index) => (
              <div key={index} className="flex items-center">
                {item.monthly ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={item.monthly ? "text-gray-700 dark:text-white" : "text-gray-400 dark:text-gray-300"}>
                  {t(`premium.features.${index}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <Button 
              className={getPlanButtonClassName('monthly')}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPlan('monthly', t('monthly'), '₹129/month');
              }}
            >
              {getPlanButtonLabel('monthly')}
            </Button>
          </div>
          </div>
        </div>

        {/* Quarterly Plan */}
        <div
          className={getPlanCardClassName('quarterly')}
          onClick={() => handleSelectPlan('quarterly', t('quarterly'), '₹249/3 months')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan('quarterly', t('quarterly'), '₹249/3 months')}
        >
          <div className="overflow-hidden rounded-lg">
          {renderPlanBadge('quarterly')}
          <div className="p-6 border-b dark:border-gray-600">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{t('quarterly')}</h2>
            <p className="text-4xl font-bold text-center text-harvest-green mb-4">
              ₹249<span className="text-base font-normal text-gray-600 dark:text-white">/3 months</span>
            </p>
            <p className="text-center text-gray-600 dark:text-white">{t('quarterlySavings')}</p>
          </div>
          <div className="p-6 space-y-4">
            {planFeatures.map((item, index) => (
              <div key={index} className="flex items-center">
                {item.quarterly ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={item.quarterly ? "text-gray-700 dark:text-white" : "text-gray-400 dark:text-gray-300"}>
                  {t(`premium.features.${index}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <Button 
              className={getPlanButtonClassName('quarterly')}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPlan('quarterly', t('quarterly'), '₹249/3 months');
              }}
            >
              {getPlanButtonLabel('quarterly')}
            </Button>
          </div>
          </div>
        </div>

        {/* Yearly Plan */}
        <div
          className={getPlanCardClassName('yearly')}
          onClick={() => handleSelectPlan('yearly', t('yearly'), '₹799/year')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan('yearly', t('yearly'), '₹799/year')}
        >
          <div className="overflow-hidden rounded-lg">
          {renderPlanBadge('yearly')}
          <div className="p-6 border-b dark:border-gray-600">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{t('yearly')}</h2>
            <p className="text-4xl font-bold text-center text-harvest-green mb-4">
              ₹799<span className="text-base font-normal text-gray-600 dark:text-white">/year</span>
            </p>
            <p className="text-center text-gray-600 dark:text-white">{t('yearlySavings')}</p>
          </div>
          <div className="p-6 space-y-4">
            {planFeatures.map((item, index) => (
              <div key={index} className="flex items-center">
                {item.yearly ? (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={item.yearly ? "text-gray-700 dark:text-white" : "text-gray-400 dark:text-gray-300"}>
                  {t(`premium.features.${index}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="p-6">
            <Button 
              className={getPlanButtonClassName('yearly')}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectPlan('yearly', t('yearly'), '₹799/year');
              }}
            >
              {getPlanButtonLabel('yearly')}
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Delivery Benefits Section */}
      <div className="mt-16 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t('deliveryBenefits')}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border dark:border-gray-600 rounded-lg">
            <Truck className="h-12 w-12 mx-auto mb-4 text-harvest-green" />
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{t('freeDelivery')}</h4>
            <p className="text-gray-600 dark:text-white">{t('freeDeliveryDesc')}</p>
          </div>
          <div className="text-center p-6 border dark:border-gray-600 rounded-lg">
            <Clock className="h-12 w-12 mx-auto mb-4 text-harvest-green" />
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{t('expressDelivery')}</h4>
            <p className="text-gray-600 dark:text-white">{t('expressDeliveryDesc')}</p>
          </div>
          <div className="text-center p-6 border dark:border-gray-600 rounded-lg">
            <Package className="h-12 w-12 mx-auto mb-4 text-harvest-green" />
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{t('priorityProcessing')}</h4>
            <p className="text-gray-600 dark:text-white">{t('priorityProcessingDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlansPage; 
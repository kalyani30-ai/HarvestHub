import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProductTranslation } from '@/hooks/useProductTranslation';

const ProductTranslationTest = () => {
  const { i18n } = useTranslation();
  
  // Test product names
  const testProducts = [
    'Organic Onions',
    'Fresh Spinach',
    'Fresh Mangoes',
    'Whole Grain Bread',
    'Raw Honey',
    'Fresh Milk',
    'Red Apples',
    'Organic Rice',
    'Tomato',
    'Potato',
    'Carrot',
    'Bitter Gourd'
  ];

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        Product Translation Test (Current Language: {i18n.language})
      </h3>
      <div className="space-y-2">
        {testProducts.map((productName) => {
          const translatedName = useProductTranslation(productName);
          return (
            <div key={productName} className="flex justify-between items-center p-2 bg-white rounded">
              <span className="font-medium">{productName}</span>
              <span className="text-blue-600">→</span>
              <span className="font-medium">{translatedName}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-2 bg-yellow-100 rounded">
        <p className="text-sm">
          <strong>Note:</strong> Product names are translated based on the current language setting. 
          If a translation is not found, the original English name is displayed.
        </p>
      </div>
    </div>
  );
};

export default ProductTranslationTest; 
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Hook for translating product names with automatic language change detection
 * @param productName - The original product name in English
 * @returns The translated product name
 */
export const useProductTranslation = (productName: string): string => {
  const { t, i18n } = useTranslation();
  
  return useMemo(() => {
    const currentLanguage = i18n.language;
    
    // If language is English, return the original name
    if (currentLanguage === 'en') {
      return productName;
    }
    
    try {
      // Try to get the translation from the current language
      const translation = t(`products.names.${productName.toLowerCase()}`, { 
        defaultValue: productName 
      });
      
      // If translation is the same as the key, it means no translation was found
      if (translation === `products.names.${productName.toLowerCase()}`) {
        return productName;
      }
      
      return translation;
    } catch (error) {
      // If there's any error, return the original name
      console.warn(`Translation error for product name "${productName}":`, error);
      return productName;
    }
  }, [productName, t, i18n.language]);
};

/**
 * Hook for translating multiple product names
 * @param productNames - Array of product names to translate
 * @returns Array of translated product names
 */
export const useProductNamesTranslation = (productNames: string[]): string[] => {
  const { t, i18n } = useTranslation();
  
  return useMemo(() => {
    const currentLanguage = i18n.language;
    
    // If language is English, return the original names
    if (currentLanguage === 'en') {
      return productNames;
    }
    
    return productNames.map(name => {
      try {
        const translation = t(`products.names.${name.toLowerCase()}`, { 
          defaultValue: name 
        });
        
        if (translation === `products.names.${name.toLowerCase()}`) {
          return name;
        }
        
        return translation;
      } catch (error) {
        console.warn(`Translation error for product name "${name}":`, error);
        return name;
      }
    });
  }, [productNames, t, i18n.language]);
};

/**
 * Hook for translating a product object's name property
 * @param product - Product object with a name property
 * @returns Product object with translated name
 */
export const useProductObjectTranslation = (product: { name: string; [key: string]: any }) => {
  const translatedName = useProductTranslation(product.name);
  
  return useMemo(() => ({
    ...product,
    name: translatedName
  }), [product, translatedName]);
};

/**
 * Hook for translating an array of product objects
 * @param products - Array of product objects
 * @returns Array of product objects with translated names
 */
export const useProductsTranslation = (products: { name: string; [key: string]: any }[]) => {
  const { t, i18n } = useTranslation();
  
  return useMemo(() => {
    const currentLanguage = i18n.language;
    
    // If language is English, return the original products
    if (currentLanguage === 'en') {
      return products;
    }
    
    return products.map(product => {
      try {
        const translation = t(`products.names.${product.name.toLowerCase()}`, { 
          defaultValue: product.name 
        });
        
        if (translation === `products.names.${product.name.toLowerCase()}`) {
          return product;
        }
        
        return {
          ...product,
          name: translation
        };
      } catch (error) {
        console.warn(`Translation error for product name "${product.name}":`, error);
        return product;
      }
    });
  }, [products, t, i18n.language]);
}; 
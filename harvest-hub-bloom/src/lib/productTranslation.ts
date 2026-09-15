import i18n from '../i18n';

/**
 * Translates a product name based on the current language
 * @param productName - The original product name in English
 * @returns The translated product name or the original if no translation exists
 */
export const translateProductName = (productName: string): string => {
  const currentLanguage = i18n.language;
  
  // If language is English, return the original name
  if (currentLanguage === 'en') {
    return productName;
  }
  
  try {
    // Try to get the translation from the current language
    const translation = i18n.t(`products.names.${productName.toLowerCase()}`, { 
      returnObjects: false,
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
};

/**
 * Translates multiple product names
 * @param productNames - Array of product names to translate
 * @returns Array of translated product names
 */
export const translateProductNames = (productNames: string[]): string[] => {
  return productNames.map(name => translateProductName(name));
};

/**
 * Translates a product object's name property
 * @param product - Product object with a name property
 * @returns Product object with translated name
 */
export const translateProduct = (product: { name: string; [key: string]: any }) => {
  return {
    ...product,
    name: translateProductName(product.name)
  };
};

/**
 * Translates an array of product objects
 * @param products - Array of product objects
 * @returns Array of product objects with translated names
 */
export const translateProducts = (products: { name: string; [key: string]: any }[]) => {
  return products.map(product => translateProduct(product));
}; 
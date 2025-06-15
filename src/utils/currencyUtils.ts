/**
 * Currency conversion utilities
 * 
 * Note: These are static exchange rates for development purposes.
 * In production, these should be fetched from a real-time exchange rate API.
 */

// Static exchange rates (1 USD = X units of currency)
const EXCHANGE_RATES: Record<string, number> = {
  IDR: 16000,  // 1 USD = 16,000 IDR
  EUR: 0.85,   // 1 USD = 0.85 EUR
  USD: 1,      // 1 USD = 1 USD
  SGD: 1.35,   // 1 USD = 1.35 SGD
  MYR: 4.5,    // 1 USD = 4.5 MYR
};

/**
 * Convert an amount from a given currency to USD and return a formatted string
 * @param amount - The amount to convert
 * @param currency - The source currency code (e.g., 'IDR', 'EUR')
 * @returns Formatted USD estimation string (e.g., '(≈ $313)')
 */
export function convertToUSD(amount: number, currency: string): string {
  // Handle edge cases
  if (!amount || amount <= 0) {
    return '(≈ $0)';
  }

  const rate = EXCHANGE_RATES[currency.toUpperCase()];
  
  // If currency not supported, return empty string
  if (!rate) {
    return '';
  }

  // If already USD, return formatted amount
  if (currency.toUpperCase() === 'USD') {
    return `($${Math.round(amount).toLocaleString()})`;
  }

  // Convert to USD
  const usdAmount = amount / rate;
  const roundedUSD = Math.round(usdAmount);

  // Format with commas for thousands
  return `(≈ $${roundedUSD.toLocaleString()})`;
}

/**
 * Get the currency symbol for a given currency code
 * @param currency - The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    IDR: 'Rp',
    SGD: 'S$',
    MYR: 'RM',
  };

  return symbols[currency.toUpperCase()] || currency.toUpperCase();
}

/**
 * Format a price with currency symbol and thousand separators
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted price string (e.g., 'Rp 25,000k' for IDR)
 */
export const formatPrice = (amount: number, currency: string = 'IDR'): string => {
  // Handle cases where amount might be null or undefined
  if (amount === null || amount === undefined) {
    return 'Price Unavailable';
  }

  // Special formatting for Indonesian Rupiah (IDR)
  if (currency.toUpperCase() === 'IDR') {
    if (amount >= 1000) {
      // For amounts >= 1000, divide by 1000, format with commas, and append 'k'
      const thousands = amount / 1000;
      return `Rp ${new Intl.NumberFormat('en-US').format(thousands)}k`;
    }
    // For smaller IDR amounts, just add the prefix
    return `Rp ${new Intl.NumberFormat('en-US').format(amount)}`;
  }

  // Standard formatting for all other currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currency codes
    console.error(`Failed to format price for currency ${currency}:`, error);
    return `${currency} ${amount}`;
  }
}; 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number and currency into a standardized price string with symbols.
 * - Handles '$' and 'Rp' currency symbols.
 * - Abbreviates numbers to 'K' (thousands) and 'M' (millions).
 * @param amount The numeric value of the price.
 * @param currency The currency code (e.g., 'IDR', 'USD').
 * @returns A formatted price string (e.g., "Rp 12M", "$2.2K").
 */
export function formatPrice(amount: number, currency: string): string {
  if (isNaN(amount)) {
    return '';
  }

  // When amount is 0, just return "0" without currency
  if (amount === 0) {
    return '0';
  }

  const getSymbol = (curr: string): string => {
    switch (curr.toUpperCase()) {
      case 'USD':
        return '$';
      case 'IDR':
        return 'Rp';
      default:
        return '';
    }
  };

  let formattedAmount: string;

  if (amount >= 1_000_000) {
    formattedAmount = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (amount >= 10_000) {
    formattedAmount = (amount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    // For amounts less than 10K, round to nearest integer and format with commas
    formattedAmount = Math.round(amount).toLocaleString('en-US');
  }

  const symbol = getSymbol(currency);
  
  // Place symbol correctly: $100K vs Rp 100K (with a space)
  return currency.toUpperCase() === 'USD' 
    ? `${symbol}${formattedAmount}` 
    : `${symbol} ${formattedAmount}`;
}

interface PriceInfo {
  monthlyRent?: number | null;
  yearlyRent?: number | null;
}

/**
 * Determines the primary display price based on monthly or yearly rent.
 * New rules: Only show explicitly provided prices, no automatic calculations for primary display.
 * @returns An object with the price to display and rent type information.
 */
export const getDisplayPriceInfo = (priceInfo: PriceInfo) => {
  // Only show monthly rent if explicitly provided by landlord
  if (priceInfo.monthlyRent && priceInfo.monthlyRent > 0) {
    return { 
      displayPrice: priceInfo.monthlyRent, 
      isCalculated: false,
      rentType: 'monthly' as const
    };
  }
  // Only show yearly rent if explicitly provided by landlord (no automatic monthly calculation)
  if (priceInfo.yearlyRent && priceInfo.yearlyRent > 0) {
    return { 
      displayPrice: priceInfo.yearlyRent, 
      isCalculated: false,
      rentType: 'yearly' as const
    };
  }
  // No price available
  return { 
    displayPrice: 0, 
    isCalculated: false,
    rentType: 'none' as const
  };
};

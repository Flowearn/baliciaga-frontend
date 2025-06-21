import React from 'react';
import { formatPrice } from '@/lib/utils';
import { formatNoYear } from '@/utils/formatDate';

interface PricingDetailsGridProps {
  monthlyRent?: number | null;
  yearlyRent?: number | null;
  deposit: number;
  utilities?: number | null;
  currency: string;
  availableFrom: string;
  className?: string;
}

/**
 * A reusable component for displaying pricing details in a two-column grid layout.
 * Automatically handles responsive layout (single column on mobile, two columns on larger screens).
 */
const PricingDetailsGrid: React.FC<PricingDetailsGridProps> = ({
  monthlyRent,
  yearlyRent,
  deposit,
  utilities,
  currency,
  availableFrom,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-base ${className}`}>
      {/* Monthly Rent */}
      {monthlyRent !== null && monthlyRent !== undefined && monthlyRent > 0 && (
        <div className="flex flex-col">
          <span className="text-white/70 text-sm">Monthly Rent:</span>
          <span className="font-medium text-white/100">{formatPrice(monthlyRent, currency)}</span>
        </div>
      )}
      
      {/* Yearly Rent with equivalent monthly below */}
      {yearlyRent !== null && yearlyRent !== undefined && yearlyRent > 0 && (
        <div>
          <div className="flex flex-col">
            <span className="text-white/70 text-sm">Yearly Rent:</span>
            <span className="font-medium text-blue-400">{formatPrice(yearlyRent, currency)}</span>
          </div>
          <div className="text-sm text-white/70">
            (equivalent monthly = {formatPrice(Math.round(yearlyRent / 12), currency)})
          </div>
        </div>
      )}
      
      {/* Deposit - Always show */}
      <div className="flex flex-col">
        <span className="text-white/70 text-sm">Deposit:</span>
        <span className="font-medium text-white/100">{formatPrice(deposit, currency)}</span>
      </div>
      
      {/* Utilities */}
      {utilities !== null && utilities !== undefined && (
        <div className="flex flex-col">
          <span className="text-white/70 text-sm">Utilities:</span>
          <span className="font-medium text-white/100">
            {utilities === 0 
              ? 'Covered' 
              : formatPrice(utilities, currency)}
          </span>
        </div>
      )}
      
      {/* Available From */}
      <div className="flex flex-col">
        <span className="text-white/70 text-sm">Available From:</span>
        <span className="font-medium text-white/100">{formatNoYear(availableFrom)}</span>
      </div>
    </div>
  );
};

export default PricingDetailsGrid;
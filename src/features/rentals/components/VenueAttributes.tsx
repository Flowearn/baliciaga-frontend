import { useTranslation } from 'react-i18next';
import { ChefHat, Heart, Sparkles, Wine, Store, DollarSign } from 'lucide-react';

interface VenueAttributesProps {
  venue: {
    // Cafe/Dining fields
    cuisineStyle?: string[] | string;
    atmosphere?: string[] | string;
    signatureDishes?: string[] | string;
    
    // Bar specific fields
    drinkFocus?: string[] | string;
    barType?: string[] | string;
    signatureDrinks?: string[] | string;
    priceRange?: string;
  };
}

const AttributeSection = ({ title, items, icon: Icon }: { title: string, items?: string[] | string, icon: React.ElementType }) => {
  if (!items) return null;
  
  // Convert string to array if necessary
  const itemsArray = Array.isArray(items) ? items : [items];
  
  // Filter out empty strings
  const validItems = itemsArray.filter(item => item && item.trim() !== '');
  
  if (validItems.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center mb-3">
        <div className="mr-2 text-white/60">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {validItems.map((item, index) => (
          <div key={index} className="bg-white/10 text-white/90 text-sm font-medium px-3 py-1.5 rounded-lg border border-white/10">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function VenueAttributes({ venue }: VenueAttributesProps) {
  const { t } = useTranslation('common');
  
  // Check if any attributes exist (including bar-specific ones)
  const hasAttributes = !!(
    venue.cuisineStyle || 
    venue.atmosphere || 
    venue.signatureDishes ||
    venue.drinkFocus ||
    venue.barType ||
    venue.signatureDrinks ||
    venue.priceRange
  );

  if (!hasAttributes) {
    return null;
  }

  return (
    <div className="my-4 p-4 bg-black/40 rounded-xl">
      {/* Cafe/Dining attributes */}
      {venue.cuisineStyle && (
        <AttributeSection 
          title={t('details.attributes.cuisine_style')} 
          items={venue.cuisineStyle} 
          icon={ChefHat} 
        />
      )}
      
      {/* Bar attributes */}
      {venue.drinkFocus && (
        <AttributeSection 
          title={t('details.attributes.drink_focus', { defaultValue: 'Drink Focus' })} 
          items={venue.drinkFocus} 
          icon={Wine} 
        />
      )}
      
      {venue.barType && (
        <AttributeSection 
          title={t('details.attributes.bar_type', { defaultValue: 'Bar Type' })} 
          items={venue.barType} 
          icon={Store} 
        />
      )}
      
      {/* Common attribute */}
      {venue.atmosphere && (
        <AttributeSection 
          title={t('details.attributes.atmosphere')} 
          items={venue.atmosphere} 
          icon={Heart} 
        />
      )}
      
      {/* Cafe/Dining signature dishes */}
      {venue.signatureDishes && (
        <AttributeSection 
          title={t('details.attributes.signature_dishes')} 
          items={venue.signatureDishes} 
          icon={Sparkles} 
        />
      )}
      
      {/* Bar signature drinks */}
      {venue.signatureDrinks && (
        <AttributeSection 
          title={t('details.attributes.signature_drinks', { defaultValue: 'Signature Drinks' })} 
          items={venue.signatureDrinks} 
          icon={Sparkles} 
        />
      )}
      
      {/* Bar price range */}
      {venue.priceRange && (
        <AttributeSection 
          title={t('details.attributes.price_range', { defaultValue: 'Price Range' })} 
          items={venue.priceRange} 
          icon={DollarSign} 
        />
      )}
    </div>
  );
}
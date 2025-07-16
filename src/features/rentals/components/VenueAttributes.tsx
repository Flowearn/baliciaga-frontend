import { useTranslation } from 'react-i18next';
import { ChefHat, Heart, Sparkles } from 'lucide-react';

interface VenueAttributesProps {
  venue: {
    cuisineStyle?: string[] | string;
    atmosphere?: string[] | string;
    signatureDishes?: string[] | string;
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
  
  // Check if any attributes exist
  if (!venue.cuisineStyle && !venue.atmosphere && !venue.signatureDishes) {
    return null;
  }

  return (
    <div className="my-4 p-4 bg-black/40 rounded-xl">
      <AttributeSection title={t('details.attributes.cuisine_style')} items={venue.cuisineStyle} icon={ChefHat} />
      <AttributeSection title={t('details.attributes.atmosphere')} items={venue.atmosphere} icon={Heart} />
      <AttributeSection title={t('details.attributes.signature_dishes')} items={venue.signatureDishes} icon={Sparkles} />
    </div>
  );
}
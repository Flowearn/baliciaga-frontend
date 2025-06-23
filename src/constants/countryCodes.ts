export interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: "Indonesia", dial_code: "+62", code: "ID", flag: "🇮🇩" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "Pakistan", dial_code: "+92", code: "PK", flag: "🇵🇰" },
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "Bangladesh", dial_code: "+880", code: "BD", flag: "🇧🇩" },
  { name: "Russia", dial_code: "+7", code: "RU", flag: "🇷🇺" },
  { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "Ethiopia", dial_code: "+251", code: "ET", flag: "🇪🇹" },
  { name: "Philippines", dial_code: "+63", code: "PH", flag: "🇵🇭" },
  { name: "Egypt", dial_code: "+20", code: "EG", flag: "🇪🇬" },
  { name: "Vietnam", dial_code: "+84", code: "VN", flag: "🇻🇳" },
  { name: "Turkey", dial_code: "+90", code: "TR", flag: "🇹🇷" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "Thailand", dial_code: "+66", code: "TH", flag: "🇹🇭" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "South Korea", dial_code: "+82", code: "KR", flag: "🇰🇷" },
  { name: "Colombia", dial_code: "+57", code: "CO", flag: "🇨🇴" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Argentina", dial_code: "+54", code: "AR", flag: "🇦🇷" },
  { name: "Ukraine", dial_code: "+380", code: "UA", flag: "🇺🇦" },
  { name: "Algeria", dial_code: "+213", code: "DZ", flag: "🇩🇿" },
  { name: "Poland", dial_code: "+48", code: "PL", flag: "🇵🇱" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "Malaysia", dial_code: "+60", code: "MY", flag: "🇲🇾" },
  { name: "Singapore", dial_code: "+65", code: "SG", flag: "🇸🇬" },
  { name: "Netherlands", dial_code: "+31", code: "NL", flag: "🇳🇱" },
  { name: "Belgium", dial_code: "+32", code: "BE", flag: "🇧🇪" },
  { name: "Sweden", dial_code: "+46", code: "SE", flag: "🇸🇪" },
  { name: "Switzerland", dial_code: "+41", code: "CH", flag: "🇨🇭" },
  { name: "Austria", dial_code: "+43", code: "AT", flag: "🇦🇹" },
  { name: "Denmark", dial_code: "+45", code: "DK", flag: "🇩🇰" },
  { name: "Finland", dial_code: "+358", code: "FI", flag: "🇫🇮" },
  { name: "Norway", dial_code: "+47", code: "NO", flag: "🇳🇴" },
  { name: "New Zealand", dial_code: "+64", code: "NZ", flag: "🇳🇿" },
  { name: "Portugal", dial_code: "+351", code: "PT", flag: "🇵🇹" },
  { name: "Greece", dial_code: "+30", code: "GR", flag: "🇬🇷" },
  { name: "Hong Kong", dial_code: "+852", code: "HK", flag: "🇭🇰" },
  { name: "Taiwan", dial_code: "+886", code: "TW", flag: "🇹🇼" },
  { name: "Saudi Arabia", dial_code: "+966", code: "SA", flag: "🇸🇦" },
  { name: "United Arab Emirates", dial_code: "+971", code: "AE", flag: "🇦🇪" },
  { name: "Israel", dial_code: "+972", code: "IL", flag: "🇮🇱" },
  { name: "Qatar", dial_code: "+974", code: "QA", flag: "🇶🇦" },
  { name: "Kuwait", dial_code: "+965", code: "KW", flag: "🇰🇼" },
  { name: "Bahrain", dial_code: "+973", code: "BH", flag: "🇧🇭" },
  { name: "Oman", dial_code: "+968", code: "OM", flag: "🇴🇲" },
  { name: "Jordan", dial_code: "+962", code: "JO", flag: "🇯🇴" },
  { name: "Lebanon", dial_code: "+961", code: "LB", flag: "🇱🇧" },
  { name: "Chile", dial_code: "+56", code: "CL", flag: "🇨🇱" },
  { name: "Peru", dial_code: "+51", code: "PE", flag: "🇵🇪" },
  { name: "Ecuador", dial_code: "+593", code: "EC", flag: "🇪🇨" },
  { name: "Venezuela", dial_code: "+58", code: "VE", flag: "🇻🇪" },
  { name: "Uruguay", dial_code: "+598", code: "UY", flag: "🇺🇾" },
  { name: "Paraguay", dial_code: "+595", code: "PY", flag: "🇵🇾" },
  { name: "Bolivia", dial_code: "+591", code: "BO", flag: "🇧🇴" },
  { name: "Costa Rica", dial_code: "+506", code: "CR", flag: "🇨🇷" },
  { name: "Panama", dial_code: "+507", code: "PA", flag: "🇵🇦" },
  { name: "Guatemala", dial_code: "+502", code: "GT", flag: "🇬🇹" },
  { name: "Honduras", dial_code: "+504", code: "HN", flag: "🇭🇳" },
  { name: "El Salvador", dial_code: "+503", code: "SV", flag: "🇸🇻" },
  { name: "Nicaragua", dial_code: "+505", code: "NI", flag: "🇳🇮" },
  { name: "Dominican Republic", dial_code: "+1", code: "DO", flag: "🇩🇴" },
  { name: "Cuba", dial_code: "+53", code: "CU", flag: "🇨🇺" },
  { name: "Jamaica", dial_code: "+1", code: "JM", flag: "🇯🇲" },
  { name: "Ireland", dial_code: "+353", code: "IE", flag: "🇮🇪" },
  { name: "Czech Republic", dial_code: "+420", code: "CZ", flag: "🇨🇿" },
  { name: "Hungary", dial_code: "+36", code: "HU", flag: "🇭🇺" },
  { name: "Romania", dial_code: "+40", code: "RO", flag: "🇷🇴" },
  { name: "Bulgaria", dial_code: "+359", code: "BG", flag: "🇧🇬" },
  { name: "Slovakia", dial_code: "+421", code: "SK", flag: "🇸🇰" },
  { name: "Slovenia", dial_code: "+386", code: "SI", flag: "🇸🇮" },
  { name: "Croatia", dial_code: "+385", code: "HR", flag: "🇭🇷" },
  { name: "Serbia", dial_code: "+381", code: "RS", flag: "🇷🇸" },
  { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA", flag: "🇧🇦" },
  { name: "Albania", dial_code: "+355", code: "AL", flag: "🇦🇱" },
  { name: "North Macedonia", dial_code: "+389", code: "MK", flag: "🇲🇰" },
  { name: "Montenegro", dial_code: "+382", code: "ME", flag: "🇲🇪" },
  { name: "Luxembourg", dial_code: "+352", code: "LU", flag: "🇱🇺" },
  { name: "Malta", dial_code: "+356", code: "MT", flag: "🇲🇹" },
  { name: "Iceland", dial_code: "+354", code: "IS", flag: "🇮🇸" },
  { name: "Estonia", dial_code: "+372", code: "EE", flag: "🇪🇪" },
  { name: "Latvia", dial_code: "+371", code: "LV", flag: "🇱🇻" },
  { name: "Lithuania", dial_code: "+370", code: "LT", flag: "🇱🇹" },
  { name: "Belarus", dial_code: "+375", code: "BY", flag: "🇧🇾" },
  { name: "Moldova", dial_code: "+373", code: "MD", flag: "🇲🇩" },
  { name: "Armenia", dial_code: "+374", code: "AM", flag: "🇦🇲" },
  { name: "Georgia", dial_code: "+995", code: "GE", flag: "🇬🇪" },
  { name: "Azerbaijan", dial_code: "+994", code: "AZ", flag: "🇦🇿" },
  { name: "Kazakhstan", dial_code: "+7", code: "KZ", flag: "🇰🇿" },
  { name: "Uzbekistan", dial_code: "+998", code: "UZ", flag: "🇺🇿" },
  { name: "Turkmenistan", dial_code: "+993", code: "TM", flag: "🇹🇲" },
  { name: "Tajikistan", dial_code: "+992", code: "TJ", flag: "🇹🇯" },
  { name: "Kyrgyzstan", dial_code: "+996", code: "KG", flag: "🇰🇬" },
  { name: "Mongolia", dial_code: "+976", code: "MN", flag: "🇲🇳" },
  { name: "Nepal", dial_code: "+977", code: "NP", flag: "🇳🇵" },
  { name: "Bhutan", dial_code: "+975", code: "BT", flag: "🇧🇹" },
  { name: "Sri Lanka", dial_code: "+94", code: "LK", flag: "🇱🇰" },
  { name: "Myanmar", dial_code: "+95", code: "MM", flag: "🇲🇲" },
  { name: "Cambodia", dial_code: "+855", code: "KH", flag: "🇰🇭" },
  { name: "Laos", dial_code: "+856", code: "LA", flag: "🇱🇦" },
  { name: "Brunei", dial_code: "+673", code: "BN", flag: "🇧🇳" },
  { name: "Timor-Leste", dial_code: "+670", code: "TL", flag: "🇹🇱" },
  { name: "Papua New Guinea", dial_code: "+675", code: "PG", flag: "🇵🇬" },
  { name: "Fiji", dial_code: "+679", code: "FJ", flag: "🇫🇯" },
  { name: "Solomon Islands", dial_code: "+677", code: "SB", flag: "🇸🇧" },
  { name: "Vanuatu", dial_code: "+678", code: "VU", flag: "🇻🇺" },
  { name: "Samoa", dial_code: "+685", code: "WS", flag: "🇼🇸" },
  { name: "Tonga", dial_code: "+676", code: "TO", flag: "🇹🇴" },
  { name: "Morocco", dial_code: "+212", code: "MA", flag: "🇲🇦" },
  { name: "Tunisia", dial_code: "+216", code: "TN", flag: "🇹🇳" },
  { name: "Libya", dial_code: "+218", code: "LY", flag: "🇱🇾" },
  { name: "Sudan", dial_code: "+249", code: "SD", flag: "🇸🇩" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "Uganda", dial_code: "+256", code: "UG", flag: "🇺🇬" },
  { name: "Tanzania", dial_code: "+255", code: "TZ", flag: "🇹🇿" },
  { name: "Rwanda", dial_code: "+250", code: "RW", flag: "🇷🇼" },
  { name: "Burundi", dial_code: "+257", code: "BI", flag: "🇧🇮" },
  { name: "Mozambique", dial_code: "+258", code: "MZ", flag: "🇲🇿" },
  { name: "Zambia", dial_code: "+260", code: "ZM", flag: "🇿🇲" },
  { name: "Zimbabwe", dial_code: "+263", code: "ZW", flag: "🇿🇼" },
  { name: "Botswana", dial_code: "+267", code: "BW", flag: "🇧🇼" },
  { name: "Namibia", dial_code: "+264", code: "NA", flag: "🇳🇦" },
  { name: "Angola", dial_code: "+244", code: "AO", flag: "🇦🇴" },
  { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
  { name: "Cameroon", dial_code: "+237", code: "CM", flag: "🇨🇲" },
  { name: "Ivory Coast", dial_code: "+225", code: "CI", flag: "🇨🇮" },
  { name: "Senegal", dial_code: "+221", code: "SN", flag: "🇸🇳" },
  { name: "Mali", dial_code: "+223", code: "ML", flag: "🇲🇱" },
  { name: "Burkina Faso", dial_code: "+226", code: "BF", flag: "🇧🇫" },
  { name: "Niger", dial_code: "+227", code: "NE", flag: "🇳🇪" },
  { name: "Guinea", dial_code: "+224", code: "GN", flag: "🇬🇳" },
  { name: "Benin", dial_code: "+229", code: "BJ", flag: "🇧🇯" },
  { name: "Togo", dial_code: "+228", code: "TG", flag: "🇹🇬" },
  { name: "Sierra Leone", dial_code: "+232", code: "SL", flag: "🇸🇱" },
  { name: "Liberia", dial_code: "+231", code: "LR", flag: "🇱🇷" },
  { name: "Mauritius", dial_code: "+230", code: "MU", flag: "🇲🇺" },
  { name: "Madagascar", dial_code: "+261", code: "MG", flag: "🇲🇬" },
  { name: "Seychelles", dial_code: "+248", code: "SC", flag: "🇸🇨" },
  { name: "Maldives", dial_code: "+960", code: "MV", flag: "🇲🇻" },
  { name: "Afghanistan", dial_code: "+93", code: "AF", flag: "🇦🇫" },
  { name: "Iraq", dial_code: "+964", code: "IQ", flag: "🇮🇶" },
  { name: "Iran", dial_code: "+98", code: "IR", flag: "🇮🇷" },
  { name: "Syria", dial_code: "+963", code: "SY", flag: "🇸🇾" },
  { name: "Yemen", dial_code: "+967", code: "YE", flag: "🇾🇪" },
  { name: "Cyprus", dial_code: "+357", code: "CY", flag: "🇨🇾" },
  { name: "Bahamas", dial_code: "+1", code: "BS", flag: "🇧🇸" },
  { name: "Barbados", dial_code: "+1", code: "BB", flag: "🇧🇧" },
  { name: "Trinidad and Tobago", dial_code: "+1", code: "TT", flag: "🇹🇹" },
  { name: "Haiti", dial_code: "+509", code: "HT", flag: "🇭🇹" },
  { name: "Belize", dial_code: "+501", code: "BZ", flag: "🇧🇿" },
  { name: "Suriname", dial_code: "+597", code: "SR", flag: "🇸🇷" },
  { name: "Guyana", dial_code: "+592", code: "GY", flag: "🇬🇾" },
  { name: "French Guiana", dial_code: "+594", code: "GF", flag: "🇬🇫" },
  { name: "Cape Verde", dial_code: "+238", code: "CV", flag: "🇨🇻" },
  { name: "Mauritania", dial_code: "+222", code: "MR", flag: "🇲🇷" },
  { name: "Gambia", dial_code: "+220", code: "GM", flag: "🇬🇲" },
  { name: "Guinea-Bissau", dial_code: "+245", code: "GW", flag: "🇬🇼" },
  { name: "Equatorial Guinea", dial_code: "+240", code: "GQ", flag: "🇬🇶" },
  { name: "Gabon", dial_code: "+241", code: "GA", flag: "🇬🇦" },
  { name: "Congo", dial_code: "+242", code: "CG", flag: "🇨🇬" },
  { name: "DR Congo", dial_code: "+243", code: "CD", flag: "🇨🇩" },
  { name: "Central African Republic", dial_code: "+236", code: "CF", flag: "🇨🇫" },
  { name: "Chad", dial_code: "+235", code: "TD", flag: "🇹🇩" },
  { name: "Comoros", dial_code: "+269", code: "KM", flag: "🇰🇲" },
  { name: "Djibouti", dial_code: "+253", code: "DJ", flag: "🇩🇯" },
  { name: "Eritrea", dial_code: "+291", code: "ER", flag: "🇪🇷" },
  { name: "Somalia", dial_code: "+252", code: "SO", flag: "🇸🇴" },
  { name: "Malawi", dial_code: "+265", code: "MW", flag: "🇲🇼" },
  { name: "Lesotho", dial_code: "+266", code: "LS", flag: "🇱🇸" },
  { name: "Eswatini", dial_code: "+268", code: "SZ", flag: "🇸🇿" },
  { name: "South Sudan", dial_code: "+211", code: "SS", flag: "🇸🇸" }
].sort((a, b) => {
  // Sort by most common countries first
  const priority = ["ID", "CN", "US", "IN", "MY", "SG", "TH", "PH", "VN", "AU"];
  const aPriority = priority.indexOf(a.code);
  const bPriority = priority.indexOf(b.code);
  
  if (aPriority !== -1 && bPriority !== -1) {
    return aPriority - bPriority;
  }
  if (aPriority !== -1) return -1;
  if (bPriority !== -1) return 1;
  
  return a.name.localeCompare(b.name);
});

// Helper function to get country code from phone number
export function getCountryFromPhone(phone: string): CountryCode | undefined {
  if (!phone) return undefined;
  
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Find the best matching country code
  let bestMatch: CountryCode | undefined;
  let longestMatch = 0;
  
  for (const country of COUNTRY_CODES) {
    if (cleaned.startsWith(country.dial_code) && country.dial_code.length > longestMatch) {
      bestMatch = country;
      longestMatch = country.dial_code.length;
    }
  }
  
  return bestMatch;
}

// Helper function to format phone number with country code
export function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  // First, remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Only remove country code if the phone number starts with it (without the +)
  const countryCodeDigits = countryCode.replace(/\D/g, '');
  if (cleaned.startsWith(countryCodeDigits)) {
    cleaned = cleaned.substring(countryCodeDigits.length);
  }
  
  // Combine country code and phone number
  return `${countryCode} ${cleaned}`;
}

// Default country code (Indonesia)
export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // Indonesia
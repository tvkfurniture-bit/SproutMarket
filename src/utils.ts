/**
 * Indian Pincode Directory & Shipping Estimator
 */
export interface PincodeInfo {
  city: string;
  state: string;
  region: string;
  estDays: number;
  isPrimeEligible: boolean;
}

export const lookupPincode = (pin: string): PincodeInfo | null => {
  const clean = pin.trim();
  if (!/^\d{6}$/.test(clean)) return null;
  const firstTwo = clean.slice(0, 2);
  
  switch (firstTwo) {
    case '11': 
      return { city: 'New Delhi', state: 'Delhi', region: 'North', estDays: 1, isPrimeEligible: true };
    case '40':
    case '41':
    case '42':
    case '43': 
      return { city: 'Mumbai', state: 'Maharashtra', region: 'West', estDays: 1, isPrimeEligible: true };
    case '56':
    case '57': 
      return { city: 'Bengaluru', state: 'Karnataka', region: 'South', estDays: 1, isPrimeEligible: true };
    case '60':
    case '61':
    case '62': 
      return { city: 'Chennai', state: 'Tamil Nadu', region: 'South', estDays: 2, isPrimeEligible: true };
    case '70':
    case '71':
    case '72':
    case '73': 
      return { city: 'Kolkata', state: 'West Bengal', region: 'East', estDays: 2, isPrimeEligible: false };
    case '50': 
      return { city: 'Hyderabad', state: 'Telangana', region: 'South', estDays: 1, isPrimeEligible: true };
    case '38': 
      return { city: 'Ahmedabad', state: 'Gujarat', region: 'West', estDays: 2, isPrimeEligible: true };
    case '14':
    case '15':
    case '16':
      return { city: 'Chandigarh', state: 'Punjab/Haryana', region: 'North', estDays: 2, isPrimeEligible: true };
    default: 
      return { city: 'India', state: 'Standard Region', region: 'Central', estDays: 3, isPrimeEligible: false };
  }
};

/**
 * Format helper for Indian Rupee currency
 */
export const formatINR = (value: number): string => {
  return '₹' + Math.round(value).toLocaleString('en-IN');
};

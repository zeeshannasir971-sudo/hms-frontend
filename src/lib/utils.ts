/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as string or Date object
 * @returns Age in years, or null if no valid date
 */
export const calculateAge = (dateOfBirth: string | Date | null): number | null => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = new Date(dateOfBirth);
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Return null for unrealistic ages
    if (age < 0 || age > 150) return null;
    
    return age;
  } catch (error) {
    return null;
  }
};

/**
 * Format date to readable string
 * @param date - Date as string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

/**
 * Format date and time to readable string
 * @param date - Date as string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};
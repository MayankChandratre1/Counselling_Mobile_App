export const categoryCleaner = (category: string) => {
  if (!category) return '';
  if(category.length < 3 || category.includes("EWS") || category.includes("TFWS")) return category;
  
  // First clean the string of special characters and extra spaces
  let cleanedCategory = category
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')          // Replace multiple spaces with a single space
    .trim();                        // Trim leading and trailing spaces

  // Remove legend prefix (G for General, L for Ladies)
  if (/^[GL]/i.test(cleanedCategory)) {
    cleanedCategory = cleanedCategory.substring(1);
  }
  
  // Remove legend suffix (H for Home University, O for Other than Home University, S for State Level)
  if (/[HOS]$/i.test(cleanedCategory)) {
    cleanedCategory = cleanedCategory.substring(0, cleanedCategory.length - 1);
  }
  
  // Final trim in case removing legends left leading/trailing spaces
  return cleanedCategory.trim();
}

export const addLegends = (category: string, isFemale: boolean = false, univercityLevel: 'H' |'O' | 'S' | '') => {
    if (!category) return '';
    if(category.length < 3 || category.includes("EWS") || category.includes("TFWS")) return category;
    
    // Add legend prefix (G for General, L for Ladies)
    const prefix = isFemale ? 'L' : 'G';
    
    // Add legend suffix (H for Home University, O for Other than Home University, S for State Level)
    const suffix = univercityLevel
    
    return `${prefix}${category}${suffix}`;
}

export const expandCategory = (category: string) => {
    if (!category) return '';
    if(category.length < 3 || category.includes("EWS") || category.includes("TFWS")) return category; // If the category is too short, return it as is
    
    // Add legend prefix (G for General, L for Ladies)
    const prefix =(() => {switch(category.slice(0, 1)) {
        case 'L': return 'Ladies';
        case 'G': return 'General';
        default: return '';
    }})();
    
    // Add legend suffix (H for Home University, O for Other than Home University, S for State Level)
    const suffix =  (() => {switch(category.slice(-1)) {
        case 'H': return 'Home University';
        case 'O': return 'Other than Home University';
        case 'S': return 'State Level';
        default: return '';
    }})();
    
    return `${prefix} ${category.replace(/^[GL]/i, '').replace(/[HOS]$/i, '')} ${suffix}`.trim();
}
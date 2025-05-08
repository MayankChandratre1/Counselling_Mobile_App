type Category = string;

// Define interfaces for our data structures
interface Cutoff {
  category: Category;
  percentile: number;
  rank: number;
  capRound: string;
  year: number;
}

interface Branch {
  branchCode: string;
  branchName: string;
  branchShort: string;
  cutoffs: Cutoff[];
}

interface College {
  id: string;
  instituteCode: string;
  instituteName: string;
  branches: Branch[];
}

interface UserInput {
  percentile?: number;
  rank?: number;
  selectedCategory: string; // Like "OPEN", "OBC", "SC", etc.
  isPWD: boolean;
  isDefense: boolean;
}

interface ChanceResult {
  chance: number; // 0-100 probability
  confidenceLevel: "high" | "medium" | "low";
  relevantCutoffs: Cutoff[];
  trend: "increasing" | "decreasing" | "stable" | "unknown";
  suggestedNextRound?: string;
  message: string;
}

// Function to calculate admission chances
export function calculateChances(
  collegeData: College,
  branchCode: string,
  userInput: UserInput
): ChanceResult {
  // Step 1: Find the branch
  const branch = collegeData.branches.find(b => b.branchCode === branchCode);
  if (!branch) {
    return {
      chance: 0,
      confidenceLevel: "low",
      relevantCutoffs: [],
      trend: "unknown",
      message: "Branch not found in college data"
    };
  }

  // Step 2: Determine relevant category patterns to look for
  const categoryPatterns: string[] = [];
  
  // Add general category patterns
  const baseCategory = userInput.selectedCategory.toUpperCase();
  
  // G = General (All India), L = Local (State level)
  // H = Home district, S = State level
  const prefixes = ["G", "L"];
  const suffixes = ["H", "S"];
  
  prefixes.forEach(prefix => {
    // Add base patterns like "GOPEN", "LOPEN"
    categoryPatterns.push(`${prefix}${baseCategory}`);
    
    suffixes.forEach(suffix => {
      // Add with suffix like "GOPENH", "GOPENS"
      categoryPatterns.push(`${prefix}${baseCategory}${suffix}`);
    });
  });
  
  // Add PWD patterns if applicable
  if (userInput.isPWD) {
    prefixes.forEach(prefix => {
      categoryPatterns.push(`PWD${baseCategory}`);
      suffixes.forEach(suffix => {
        categoryPatterns.push(`PWD${baseCategory}${suffix}`);
      });
    });
  }
  
  // Add Defense patterns if applicable
  if (userInput.isDefense) {
    prefixes.forEach(prefix => {
      categoryPatterns.push(`DEF${baseCategory}`);
      suffixes.forEach(suffix => {
        categoryPatterns.push(`DEF${baseCategory}${suffix}`);
      });
    });
  }

  // Step 3: Filter relevant cutoffs based on the patterns
  const relevantCutoffs = branch.cutoffs.filter(cutoff => 
    categoryPatterns.some(pattern => cutoff.category.includes(pattern))
  );

  if (relevantCutoffs.length === 0) {
    return {
      chance: 0,
      confidenceLevel: "low",
      relevantCutoffs: [],
      trend: "unknown",
      message: "No relevant cutoff data found for your category"
    };
  }

  // Step 4: Group cutoffs by year and capRound for trend analysis
  const groupedCutoffs = groupCutoffsByYearAndRound(relevantCutoffs);
  
  // Step 5: Calculate trend based on percentile changes
  const trend = calculateTrend(groupedCutoffs);
  
  // Step 6: Calculate probability based on latest cutoffs
  const latestCutoffs = getLatestCutoffs(relevantCutoffs);
  const chance = calculateProbability(userInput, latestCutoffs);
  
  // Step 7: Determine confidence level based on data availability
  const confidenceLevel = determineConfidenceLevel(relevantCutoffs);
  
  // Step 8: Generate message
  const message = generateMessage(chance, trend, latestCutoffs);
  
  // Step 9: Suggest next round based on current percentile/rank
  const suggestedNextRound = suggestNextRound(userInput, latestCutoffs);
  
  return {
    chance,
    confidenceLevel,
    relevantCutoffs: latestCutoffs,
    trend,
    suggestedNextRound,
    message
  };
}

// Helper function to group cutoffs by year and round
function groupCutoffsByYearAndRound(cutoffs: Cutoff[]): Record<number, Record<string, Cutoff[]>> {
  const grouped: Record<number, Record<string, Cutoff[]>> = {};
  
  cutoffs.forEach(cutoff => {
    if (!grouped[cutoff.year]) {
      grouped[cutoff.year] = {};
    }
    
    if (!grouped[cutoff.year][cutoff.capRound]) {
      grouped[cutoff.year][cutoff.capRound] = [];
    }
    
    grouped[cutoff.year][cutoff.capRound].push(cutoff);
  });
  
  return grouped;
}

// Helper function to calculate trend
function calculateTrend(groupedCutoffs: Record<number, Record<string, Cutoff[]>>): "increasing" | "decreasing" | "stable" | "unknown" {
  // Get years in ascending order
  const years = Object.keys(groupedCutoffs).map(Number).sort((a, b) => a - b);
  
  if (years.length < 2) {
    return "unknown"; // Not enough data to determine trend
  }
  
  // Compare the last two years' first round cutoffs
  const previousYear = years[years.length - 2];
  const latestYear = years[years.length - 1];
  
  const previousYearCutoffs = groupedCutoffs[previousYear]["cap1"] || [];
  const latestYearCutoffs = groupedCutoffs[latestYear]["cap1"] || [];
  
  if (previousYearCutoffs.length === 0 || latestYearCutoffs.length === 0) {
    return "unknown";
  }
  
  // Calculate average percentile for each year
  const previousYearAvg = calculateAveragePercentile(previousYearCutoffs);
  const latestYearAvg = calculateAveragePercentile(latestYearCutoffs);
  
  const diff = latestYearAvg - previousYearAvg;
  
  if (Math.abs(diff) < 3) {
    return "stable";
  } else if (diff > 0) {
    return "increasing"; // Higher percentile means more competitive
  } else {
    return "decreasing"; // Lower percentile means less competitive
  }
}

// Calculate average percentile from a list of cutoffs
function calculateAveragePercentile(cutoffs: Cutoff[]): number {
  if (cutoffs.length === 0) return 0;
  
  const sum = cutoffs.reduce((total, cutoff) => total + cutoff.percentile, 0);
  return sum / cutoffs.length;
}

// Get latest cutoffs from the list
function getLatestCutoffs(cutoffs: Cutoff[]): Cutoff[] {
  // Sort by year (descending) and then by capRound
  const sortedCutoffs = [...cutoffs].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year; // Latest year first
    }
    
    // For same year, sort by capRound
    const roundA = parseInt(a.capRound.replace("cap", "")) || 0;
    const roundB = parseInt(b.capRound.replace("cap", "")) || 0;
    return roundB - roundA; // Latest round first
  });
  
  // Get the latest year
  const latestYear = sortedCutoffs[0]?.year;
  
  // Return all cutoffs from the latest year
  return sortedCutoffs.filter(cutoff => cutoff.year === latestYear);
}

// Calculate probability based on user's percentile and latest cutoffs
function calculateProbability(userInput: UserInput, latestCutoffs: Cutoff[]): number {
  if (latestCutoffs.length === 0) return 0;
  
  // If user has provided rank, use that for comparison
  if (userInput.rank !== undefined) {
    return calculateProbabilityFromRank(userInput.rank, latestCutoffs);
  }
  
  // Otherwise use percentile
  if (userInput.percentile !== undefined) {
    return calculateProbabilityFromPercentile(userInput.percentile, latestCutoffs);
  }
  
  return 0; // No valid input provided
}

function calculateProbabilityFromPercentile(userPercentile: number, cutoffs: Cutoff[]): number {
  // Sort cutoffs by percentile (ascending)
  const sortedCutoffs = [...cutoffs].sort((a, b) => a.percentile - b.percentile);
  
  // If user's percentile is higher than the highest cutoff, high chance
  if (userPercentile >= sortedCutoffs[sortedCutoffs.length - 1].percentile) {
    return 95;
  }
  
  // If user's percentile is lower than the lowest cutoff, low chance
  if (userPercentile < sortedCutoffs[0].percentile) {
    return 5;
  }
  
  // Find where the user's percentile fits in the range
  for (let i = 0; i < sortedCutoffs.length - 1; i++) {
    if (userPercentile >= sortedCutoffs[i].percentile && userPercentile < sortedCutoffs[i + 1].percentile) {
      // Calculate how far between these two cutoffs the user is
      const range = sortedCutoffs[i + 1].percentile - sortedCutoffs[i].percentile;
      const position = userPercentile - sortedCutoffs[i].percentile;
      const ratio = position / range;
      
      // Map to a probability range (30-90%)
      return 30 + ratio * 60;
    }
  }
  
  return 50; // Default middle probability
}

function calculateProbabilityFromRank(userRank: number, cutoffs: Cutoff[]): number {
  // For rank, lower is better (unlike percentile)
  // Sort cutoffs by rank (descending)
  const sortedCutoffs = [...cutoffs].sort((a, b) => b.rank - a.rank);
  
  // If user's rank is better (lower) than the best rank cutoff, high chance
  if (userRank <= sortedCutoffs[sortedCutoffs.length - 1].rank) {
    return 95;
  }
  
  // If user's rank is worse (higher) than the worst rank cutoff, low chance
  if (userRank > sortedCutoffs[0].rank) {
    return 5;
  }
  
  // Find where the user's rank fits in the range
  for (let i = 0; i < sortedCutoffs.length - 1; i++) {
    if (userRank > sortedCutoffs[i + 1].rank && userRank <= sortedCutoffs[i].rank) {
      // Calculate how far between these two cutoffs the user is
      const range = sortedCutoffs[i].rank - sortedCutoffs[i + 1].rank;
      const position = sortedCutoffs[i].rank - userRank;
      const ratio = position / range;
      
      // Map to a probability range (30-90%)
      return 30 + ratio * 60;
    }
  }
  
  return 50; // Default middle probability
}

function determineConfidenceLevel(cutoffs: Cutoff[]): "high" | "medium" | "low" {
  if (cutoffs.length >= 5) {
    return "high";
  } else if (cutoffs.length >= 2) {
    return "medium";
  } else {
    return "low";
  }
}

function generateMessage(chance: number, trend: string, latestCutoffs: Cutoff[]): string {
  let message = "";
  
  if (chance >= 90) {
    message = "You have an excellent chance of admission based on historical data.";
  } else if (chance >= 70) {
    message = "You have a good chance of admission based on historical data.";
  } else if (chance >= 50) {
    message = "You have a moderate chance of admission based on historical data.";
  } else if (chance >= 30) {
    message = "Your chances of admission are below average based on historical data.";
  } else {
    message = "Your chances of admission are low based on historical data.";
  }
  
  // Add trend information
  if (trend === "increasing") {
    message += " Note that cutoffs have been increasing (becoming more competitive).";
  } else if (trend === "decreasing") {
    message += " Note that cutoffs have been decreasing (becoming less competitive).";
  } else if (trend === "stable") {
    message += " Cutoffs have remained relatively stable.";
  }
  

    message += " Please note that this prediction is based on limited historical data.";
  
  
  return message;
}

function suggestNextRound(userInput: UserInput, latestCutoffs: Cutoff[]): string | undefined {
  // Group cutoffs by round
  const cutoffsByRound: Record<string, Cutoff[]> = {};
  
  latestCutoffs.forEach(cutoff => {
    if (!cutoffsByRound[cutoff.capRound]) {
      cutoffsByRound[cutoff.capRound] = [];
    }
    cutoffsByRound[cutoff.capRound].push(cutoff);
  });
  
  // Get the rounds in ascending order
  const rounds = Object.keys(cutoffsByRound).sort((a, b) => {
    const roundA = parseInt(a.replace("cap", "")) || 0;
    const roundB = parseInt(b.replace("cap", "")) || 0;
    return roundA - roundB;
  });
  
  // If user's percentile/rank meets criteria for any round, suggest the next round
  for (let i = 0; i < rounds.length; i++) {
    const roundCutoffs = cutoffsByRound[rounds[i]];
    const avgPercentile = calculateAveragePercentile(roundCutoffs);
    
    if (userInput.percentile !== undefined && userInput.percentile < avgPercentile) {
      // User's percentile is lower than this round's average
      if (i < rounds.length - 1) {
        return rounds[i + 1]; // Suggest next round
      }
    }
    
    // Similar logic for rank if needed
  }
  
  return undefined; // No suggestion
}

// Example usage
/*
const collegeData = {
  // Your college data here
};

const userInput = {
  percentile: 65.5,
  selectedCategory: "OPEN",
  isPWD: false,
  isDefense: false
};

const result = calculateChances(collegeData, "0212919110", userInput);
console.log(result);
*/
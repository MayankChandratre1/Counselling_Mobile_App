import defaultColleges from '../data/College_New_Data_2.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/API';

const { COLLEGE_API } = config;
// Storage keys
const COLLEGES_VERSION_KEY = 'colleges_version';
const COLLEGES_UPDATES_KEY = 'colleges_updates';
const COLLEGES_LAST_FETCH_KEY = 'colleges_last_fetch';

// Types
export interface College {
  id: string;
  instituteCode: number;
  instituteName: string;
  city: string;
  keywords: string[];
  branches: any[];
  additionalMetadata: {
    status?: string;
    totalIntake?: number;
    autonomyStatus?: string;
    minorityStatus?: string;
    address?: string;
    region?: string;
    university?: string;
    [key: string]: any;
  };
  searchIndex: {
    instituteCodeName: string;
    instituteCodeCity: string;
    instituteCityName: string;
  };
  image?: string;
  [key: string]: any;
}

export interface CollegeUpdate {
  id: string;
  [key: string]: any;
}

export class CollegeDataManager {
  private colleges: College[];
  private loadedUpdates: boolean;
  private isInitializing: boolean;
  private initPromise: Promise<College[]> | null;

  constructor() {
    this.colleges = [...defaultColleges as College[]];
    this.loadedUpdates = false;
    this.isInitializing = false;
    this.initPromise = null;
  }

  async initialize(): Promise<College[]> {
    // If already initializing, return the existing promise
    console.log('Initializing college data manager...');
    
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<College[]> {
    try {
      // Load any cached updates from AsyncStorage
      await this.loadCachedUpdates();
      console.log("Loading cached updates...");
      
      // Check for new updates from server
      // Only fetch updates if last fetch was more than 1.5 hour ago
      const lastFetch = await AsyncStorage.getItem(COLLEGES_LAST_FETCH_KEY);
      console.log("Checking for updates...`");
      const now = Date.now();
      
      if (( !lastFetch || now - parseInt(lastFetch, 10) > 1.5*3600000)) {
        console.log("Fetching updates...");
        await this.checkForUpdates();
        console.log("Updates fetched successfully.");
        
        await AsyncStorage.setItem(COLLEGES_LAST_FETCH_KEY, now.toString());
      }
      console.log("Checking for updates...");
      
      
      return this.colleges;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  async loadCachedUpdates(): Promise<void> {
    if (this.loadedUpdates) return;

    try {
      const updatesJSON = await AsyncStorage.getItem(COLLEGES_UPDATES_KEY);
      if (updatesJSON) {
        const updates = JSON.parse(updatesJSON);
        this.applyUpdates(updates);
      }
      this.loadedUpdates = true;
    } catch (error) {
      console.error('Failed to load cached updates:', error);
    }
  }

  applyUpdates(updates: CollegeUpdate[]): void {
    // Apply each update to the base colleges data
    updates.forEach(update => {
      const index = this.colleges.findIndex(college => college.id === update.id);
      if (index !== -1) {
        this.colleges[index] = { ...this.colleges[index], ...update };
      } else {
        // If the college doesn't exist in the base data, it might be a new entry
        if (this.isCompleteCollege(update)) {
          this.colleges.push(update as College);
        }
      }
    });
  }

  private isCompleteCollege(update: any): boolean {
    // Check if the update has all required fields to be considered a complete college entry
    return (
      update.id &&
      update.instituteName &&
      update.city &&
      update.additionalMetadata &&
      update.searchIndex
    );
  }

  async checkForUpdates(): Promise<void> {
    try {
      // Fetch the current version from your API
      const response = await fetch(`${COLLEGE_API}/colleges/version`);
      
      
      if (!response.ok) {
        throw new Error(`Failed to check college updates: ${response.status}`);
      }
      
      const { version } = await response.json();
      console.log("VERSION CHECK RESPONSE", version);
      
      // Get the stored version
      const storedVersion = await AsyncStorage.getItem(COLLEGES_VERSION_KEY) || '0';
      
      // If there's a new version, fetch the updates
      if (version > storedVersion) {
        await this.fetchUpdates(storedVersion, version);
        // Store the new version
        await AsyncStorage.setItem(COLLEGES_VERSION_KEY, version.toString());
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  async fetchUpdates(fromVersion: string, toVersion: string): Promise<void> {
    try {
      // Fetch only the colleges that changed since the last version
      const response = await fetch(`${COLLEGE_API}/colleges/updates?from=${fromVersion}&to=${toVersion}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch college updates: ${response.status}`);
      }
      
      const updates = await response.json();
      console.log("UPDATES CHECK RESPONSE", updates);
      
      if (updates.length > 0) {
        // Apply the updates
        this.applyUpdates(updates);
        
        // Store the updates in AsyncStorage
        const existingUpdatesJSON = await AsyncStorage.getItem(COLLEGES_UPDATES_KEY) || '[]';
        const existingUpdates = JSON.parse(existingUpdatesJSON);
        const mergedUpdates = [...existingUpdates, ...updates];
        
        // Deduplicate updates (keep only the latest for each college ID)
        const uniqueUpdates: Record<string, CollegeUpdate> = {};
        mergedUpdates.forEach(update => {
          uniqueUpdates[update.id] = update;
        });
        
        const finalUpdates = Object.values(uniqueUpdates);
        await AsyncStorage.setItem(COLLEGES_UPDATES_KEY, JSON.stringify(finalUpdates));
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  }

  getColleges(): College[] {
    return this.colleges;
  }

  getCollegeById(id: string): College | undefined {
    return this.colleges.find(college => college.id === id);
  }

  searchColleges(query: string): College[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];
    
    return this.colleges.filter(college => {
      // Check in name
      if (college.instituteName.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check in city
      if (college.city.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check in keywords
      if (college.keywords && college.keywords.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )) {
        return true;
      }
      
      // Check in institute code
      if (college.instituteCode.toString().includes(normalizedQuery) || college.instituteCode.toString().padStart(5,'0').includes(normalizedQuery)) {
        return true;
      }
      
      return false;
    });
  }

  filterColleges(options: { status?: string; city?: string }): College[] {
    let filteredColleges = [...this.colleges];
    
    if (options.status) {
      filteredColleges = filteredColleges.filter(college => 
        college.additionalMetadata?.status === options.status
      );
    }
    
    if (options.city) {
      filteredColleges = filteredColleges.filter(college => 
        college.city.toLowerCase() === options.city?.toLowerCase()
      );
    }
    
    return filteredColleges;
  }
}

// Create singleton instance
export const collegeDataManager = new CollegeDataManager();

import AsyncStorage from '@react-native-async-storage/async-storage';

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export const secureRequest = async <T>(
  url: string, 
  method: RequestMethod,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    // Get token from storage
    const userData = await AsyncStorage.getItem('token');
    const userPlanData = await AsyncStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;
    console.log("Logout token"+token);
    
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Make request
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();
    

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return { data };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { error: 'Request timed out' };
    }
    return { 
      error: error.message || 'An unexpected error occurred'
    };
  }
};


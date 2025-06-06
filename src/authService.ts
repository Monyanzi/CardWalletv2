const API_BASE_URL = 'http://localhost:5002/api/auth';

interface AuthResponse {
  token?: string;
  message?: string;
  userId?: number;
  email?: string;
  // Add other fields that your API might return
}

// Add connection check function
const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5002/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
};

export const loginUser = async (email_raw: string, password_raw: string): Promise<AuthResponse> => {
  const email = email_raw.trim();
  const password = password_raw.trim();
  
  try {
    // Check if backend is running first
    const isBackendRunning = await checkBackendConnection();
    if (!isBackendRunning) {
      throw new Error('Backend server is not running. Please start the backend server on port 5002.');
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      // data.message should contain the error from the backend
      throw new Error(data.message || 'Login failed');
    }
    return data; // Should contain token, userId, email etc.
  } catch (error: any) {
    console.error('Login API error:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { message: 'Cannot connect to server. Please ensure the backend is running on port 5002.' };
    }
    
    // Ensure a consistent error object structure
    return { message: error.message || 'An unknown error occurred during login.' };
  }
};

export const registerUser = async (email_raw: string, password_raw: string, name_raw?: string): Promise<AuthResponse> => {
  const email = email_raw.trim();
  const password = password_raw.trim();
  const name = name_raw?.trim();
  
  try {
    // Check if backend is running first
    const isBackendRunning = await checkBackendConnection();
    if (!isBackendRunning) {
      throw new Error('Backend server is not running. Please start the backend server on port 5002.');
    }

    const requestBody: any = { email, password };
    if (name) {
      requestBody.name = name;
    }
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    // Backend might return the new user's ID and email, or just a success message
    return data; 
  } catch (error: any) {
    console.error('Registration API error:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { message: 'Cannot connect to server. Please ensure the backend is running on port 5002.' };
    }
    
    return { message: error.message || 'An unknown error occurred during registration.' };
  }
};

export const deleteAccount = async (token: string): Promise<AuthResponse> => {
  try {
    // Check if backend is running first
    const isBackendRunning = await checkBackendConnection();
    if (!isBackendRunning) {
      throw new Error('Backend server is not running. Please start the backend server on port 5002.');
    }

    const response = await fetch(`${API_BASE_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send the token for authentication
      },
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Account deletion failed');
    }
    return data; // Should contain a success message
  } catch (error: any) {
    console.error('Delete account API error:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { message: 'Cannot connect to server. Please ensure the backend is running on port 5002.' };
    }
    
    return { message: error.message || 'An unknown error occurred during account deletion.' };
  }
};
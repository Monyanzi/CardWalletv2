const API_BASE_URL = 'http://localhost:5002/api/auth';

interface AuthResponse {
  token?: string;
  message?: string;
  userId?: number;
  email?: string;
  // Add other fields that your API might return
}

export const loginUser = async (email_raw: string, password_raw: string): Promise<AuthResponse> => {
  const email = email_raw.trim();
  const password = password_raw.trim();
  try {
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
    // Ensure a consistent error object structure
    return { message: error.message || 'An unknown error occurred during login.' };
  }
};

export const registerUser = async (email_raw: string, password_raw: string): Promise<AuthResponse> => {
  const email = email_raw.trim();
  const password = password_raw.trim();
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    // Backend might return the new user's ID and email, or just a success message
    return data; 
  } catch (error: any) {
    console.error('Registration API error:', error);
    return { message: error.message || 'An unknown error occurred during registration.' };
  }
};

export const deleteAccount = async (token: string): Promise<AuthResponse> => {
  try {
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
    return { message: error.message || 'An unknown error occurred during account deletion.' };
  }
};

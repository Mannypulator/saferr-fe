// lib/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
// --------------------

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null; // Store token internally

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        // Authorization header will be set dynamically
      },
    });

    // --- Request Interceptor: Add Auth Token ---
    this.client.interceptors.request.use(
      (config) => {
        // If an auth token is stored, add it to the request headers
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        // Also check localStorage in case token was set externally (e.g., page refresh)
        // This handles the case where the app reloads and the token is in storage but not yet in this.authToken
        else {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (token) {
                this.setAuthToken(token); // This will also set the header for this request
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // -------------------------------------------

    // --- Response Interceptor ---
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        // Handle 401 Unauthorized (e.g., token expired)
        if (error.response?.status === 401) {
          console.warn('Unauthorized access - token might be expired. Clearing local storage.');
          this.clearAuthToken(); // Clear internal token and localStorage
          // Redirecting to login is typically handled by the UI layer (e.g., AuthProvider)
          // because the client shouldn't know about routing.
        }
        return Promise.reject(error);
      }
    );
    // ----------------------------
  }

  // --- Public methods to manage auth token ---
  public setAuthToken(token: string) {
    this.authToken = token;
    // Update the default header for future requests initiated by the interceptor
    // The interceptor will use this.authToken
  }

  public clearAuthToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
    // Note: The interceptor will automatically stop adding the header
    // when this.authToken is null.
  }

  public isAuthenticated(): boolean {
     // Check if we have a token and it's potentially valid (basic check)
     // A more robust check would decode the JWT and check expiry
     return !!this.authToken || !!(typeof window !== 'undefined' && localStorage.getItem('authToken'));
  }
  // ------------------------------------------

  // --- Standard HTTP methods ---
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
  // -----------------------------
}

// Export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
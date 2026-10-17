const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-heal.onrender.com/api/v1';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Define specific response types
interface ChatSessionsResponse {
  sessions: Array<{
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface ChatHistoryResponse {
  messages: Array<{
    id: string;
    sessionId: string;
    userId: string;
    content: string;
    senderType: string;
    messageType: string;
    createdAt: string;
  }>;
}

interface SendMessageResponse {
  session: {
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  userMessage: {
    id: string;
    content: string;
    senderType: string;
    messageType: string;
    createdAt: string;
  };
  aiMessage: {
    id: string;
    content: string;
    senderType: string;
    messageType: string;
    createdAt: string;
  };
  response: string;
}

interface UserStatsResponse {
  currentStreak: number;
  totalSessions: number;
  moodScore: number;
  resourcesViewed: number;
  daysActive: number;
}

interface MoodEntry {
  id: string;
  userId: string;
  moodScore: number;
  notes: string;
  createdAt: string;
}

interface MoodHistoryResponse {
  logs: Array<MoodEntry>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // On 401, attempt a token refresh once then retry
        if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
          const refreshed = await this.attemptTokenRefresh();
          if (refreshed) {
            return this.request<T>(endpoint, options, true);
          }
          // Refresh failed – clear stored credentials
          this.removeToken();
          return { error: 'Session expired. Please sign in again.' };
        }

        let errorMessage = data.error || data.message || 'An error occurred';
        
        // Handle specific HTTP status codes
        if (response.status === 409) {
          errorMessage = 'An account with this email already exists';
        } else if (response.status === 401) {
          errorMessage = data.error || 'Invalid email or password';
        } else if (response.status === 400) {
          errorMessage = data.message || 'Invalid request data';
        }
        
        return { error: errorMessage };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error occurred' };
    }
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem('heal_refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.accessToken) {
        this.setToken(data.accessToken);
        localStorage.setItem('heal_refresh_token', data.refreshToken);
        return true;
      }
    } catch {
      // network error during refresh
    }
    return false;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('heal_access_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('heal_access_token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('heal_access_token');
    localStorage.removeItem('heal_refresh_token');
  }

  // Authentication methods
  async register(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('heal_refresh_token', response.data.refreshToken);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('heal_refresh_token', response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.removeToken();
    return response;
  }

  async refreshAccessToken(refreshToken: string) {
    return this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, true); // isRetry=true to skip recursive refresh loops
  }

  // User methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<ApiResponse<UserStatsResponse>> {
    return this.request<UserStatsResponse>('/user/stats');
  }

  async logMood(moodScore: number, notes?: string): Promise<ApiResponse<MoodEntry>> {
    return this.request<MoodEntry>('/user/mood', {
      method: 'POST',
      body: JSON.stringify({ moodScore, notes }),
    });
  }

  async getMoodHistory(days: number = 30): Promise<ApiResponse<MoodHistoryResponse>> {
    return this.request<MoodHistoryResponse>(`/user/mood-history?days=${days}`);
  }

  // Chat methods with proper typing
  async sendMessage(sessionId: string, content: string, messageType: string = 'text'): Promise<ApiResponse<SendMessageResponse>> {
    return this.request<SendMessageResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, content, messageType }),
    });
  }

  async getChatHistory(sessionId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<ChatHistoryResponse>> {
    return this.request<ChatHistoryResponse>(`/chat/history?session_id=${sessionId}&limit=${limit}&offset=${offset}`);
  }

  async getChatSessions(): Promise<ApiResponse<ChatSessionsResponse>> {
    return this.request<ChatSessionsResponse>('/chat/sessions');
  }

  async deleteChatSession(sessionId: string) {
    return this.request(`/chat/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async submitChatFeedback(sessionId: string, messageId: string, rating: number, feedback?: string) {
    return this.request('/chat/feedback', {
      method: 'POST',
      body: JSON.stringify({ sessionId, messageId, rating, feedback }),
    });
  }

  // Resource methods
  async getResources(filters: {
    category?: string;
    type?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/resources?${params.toString()}`);
  }

  async getResource(id: string) {
    return this.request(`/resources/${id}`);
  }

  async getResourceCategories() {
    return this.request('/resources/categories');
  }

  async updateResourceProgress(resourceId: string, progress: number) {
    return this.request(`/resources/${resourceId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    });
  }

  async getRecommendations(limit: number = 5) {
    return this.request(`/resources/recommendations?limit=${limit}`);
  }

  async toggleResourceFavorite(resourceId: string) {
    return this.request(`/resources/${resourceId}/favorite`, {
      method: 'POST',
    });
  }

  // Crisis methods
  async createCrisisAlert(severity: string, message?: string, location?: string) {
    return this.request('/crisis/alert', {
      method: 'POST',
      body: JSON.stringify({ severity, message, location }),
    });
  }

  async getEmergencyContacts() {
    return this.request('/crisis/contacts');
  }

  async addEmergencyContact(data: {
    name: string;
    phone: string;
    relationship?: string;
    isPrimary?: boolean;
  }) {
    return this.request('/crisis/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLocalServices(lat: number, lng: number) {
    return this.request(`/crisis/services?lat=${lat}&lng=${lng}`);
  }

  async createSafetyPlan(plan: any) {
    return this.request('/crisis/safety-plan', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async getSafetyPlan() {
    return this.request('/crisis/safety-plan');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('heal_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('heal_user', JSON.stringify(user));
  }
}

export const apiClient = new ApiClient();
export default apiClient;
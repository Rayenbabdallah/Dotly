import axios, { AxiosInstance, AxiosError } from 'axios';

export interface AuthToken {
  token: string;
  userId: string;
  tenantId: string;
  role: 'Owner' | 'Manager' | 'Staff';
  branchId?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: string;
  tenantId: string;
}

export class DotlyApiClient {
  private api: AxiosInstance;
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5082') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.token = null;
          // Trigger auth refresh or logout
        }
        throw error;
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  // Auth endpoints
  async login(phone: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/api/auth/login', {
      phone,
      password,
    });
    return response.data;
  }

  // Visit endpoints (Staff POS)
  async createVisit(phone: string, amount: number): Promise<any> {
    const response = await this.api.post('/api/visits/pcs-purchase', {
      phone,
      amount,
    });
    return response.data;
  }

  // Redemption endpoints
  async getRewards(): Promise<any[]> {
    const response = await this.api.get('/api/rewards');
    return response.data;
  }

  async redeemReward(rewardId: string, phone: string): Promise<any> {
    const response = await this.api.post('/api/redemptions/redeem', {
      rewardId,
      phone,
    });
    return response.data;
  }

  // Customer endpoints
  async customerRegister(name: string, phone: string, email?: string): Promise<any> {
    const response = await this.api.post('/api/customer-portal/register', {
      name,
      phone,
      email,
    });
    return response.data;
  }

  async customerGetMyQR(): Promise<any> {
    const response = await this.api.get('/api/customer-portal/my-qr');
    return response.data;
  }

  async customerGetWallet(): Promise<any> {
    const response = await this.api.get('/api/customer-portal/wallet');
    return response.data;
  }

  async customerGetAvailableDeals(): Promise<any[]> {
    const response = await this.api.get('/api/customer-portal/available-deals');
    return response.data;
  }

  async customerGetMyShops(): Promise<any[]> {
    const response = await this.api.get('/api/customer-portal/my-shops');
    return response.data;
  }

  // Staff branch
  async getStaffBranch(staffId: string): Promise<any> {
    const response = await this.api.get(`/api/staff/${staffId}/branch`);
    return response.data;
  }

  // Generic error handler
  handleError(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }
    return error.message || 'An error occurred';
  }
}

// Export singleton instance
export const apiClient = new DotlyApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:5082'
);

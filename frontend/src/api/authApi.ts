import { fetchWithAuth } from "./client";

export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  dob?: string;
  gender?: string;
  height?: { value: number; unit: "cm" | "in" };
  weight?: { value: number; unit: "kg" | "lb" };
  bodyMeasurements?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}

export const authApi = {
  login: async (credentials: { email?: string; username?: string; password?: string }): Promise<AuthResponse> => {
    return fetchWithAuth("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: Record<string, any>): Promise<AuthResponse> => {
    return fetchWithAuth("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getMe: async (): Promise<{ user: UserProfile }> => {
    return fetchWithAuth("/users/me");
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<{ user: UserProfile }> => {
    return fetchWithAuth("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<{ message: string }> => {
    return fetchWithAuth("/users/logout", {
      method: "POST",
    });
  },
};

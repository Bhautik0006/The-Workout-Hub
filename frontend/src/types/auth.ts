export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  dob?: string;
  gender?: string;

  height?: {
    value: number;
    unit: "cm" | "in";
  };

  weight?: {
    value: number;
    unit: "kg" | "lb";
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  dob?: string;
  gender?: string;

  height?: {
    value: number;
    unit: "cm" | "in";
  };

  weight?: {
    value: number;
    unit: "kg" | "lb";
  };
}
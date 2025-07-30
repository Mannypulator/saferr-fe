// types/auth.ts
export interface AuthResponseModel {
  token: string;
  expiration: string; // ISO date string
  userId: string; // GUID as string
  username: string;
  brandId: string; // GUID as string
  brandName: string;
}

export interface LoginModel {
  username: string;
  password: string;
}

export interface RegisterModel {
  username: string;
  email: string;
  password: string;
  brandName: string;
}
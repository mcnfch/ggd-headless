export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_urls: {
    [key: string]: string;
  };
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

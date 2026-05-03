export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped';
}
export type ApiResponse<T> = { data: T; error?: string; meta?: { page: number; total: number } };

import type { Order, ApiResponse } from '../types/index.js';
import { getUser } from './user-service.js';
const orders: Map<string, Order> = new Map();
export function createOrder(userId: string, total: number): ApiResponse<Order> {
  const userResult = getUser(userId);
  if (userResult.error) return { data: null as never, error: 'user not found' };
  const order: Order = { id: String(Date.now()), userId, total, status: 'pending' };
  orders.set(order.id, order);
  return { data: order };
}

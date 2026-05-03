import { createUser, getUser } from '../services/user-service.js';
import { createOrder } from '../services/order-service.js';
export function handleRequest(path: string, body: Record<string, unknown>) {
  if (path === '/users' && body.name)
    return createUser({ name: String(body.name), email: String(body.email ?? '') });
  if (path.startsWith('/users/')) return getUser(path.split('/')[2]);
  if (path === '/orders') return createOrder(String(body.userId), Number(body.total));
  return { data: null as never, error: 'unknown route' };
}

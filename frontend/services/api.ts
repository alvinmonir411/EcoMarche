import { fetchApi } from './apiClient';

// --- Auth API Helper ---
export const authApi = {
  login: (data: any) => fetchApi<{ accessToken: string; user?: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchApi<any>('/auth/profile', { method: 'GET' }),
};

// --- Product API Helper ---
export const productApi = {
  getAll: (params?: any) => fetchApi<any>('/products', { method: 'GET', params }),
  getById: (id: string) => fetchApi<any>(`/products/${id}`, { method: 'GET' }),
  getBySlug: (slug: string) => fetchApi<any>(`/products/slug/${slug}`, { method: 'GET' }),
  create: (data: any) => fetchApi<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/products/${id}`, { method: 'DELETE' }),
  uploadThumbnail: (id: string, formData: FormData) => fetchApi<any>(`/products/${id}/thumbnail`, { method: 'POST', body: formData }),
  uploadImages: (id: string, formData: FormData) => fetchApi<any>(`/products/${id}/images`, { method: 'POST', body: formData }),
};

// --- Category API Helper ---
export const categoryApi = {
  getAll: () => fetchApi<any>('/categories', { method: 'GET' }),
  getById: (id: string) => fetchApi<any>(`/categories/${id}`, { method: 'GET' }),
  create: (data: any) => fetchApi<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/categories/${id}`, { method: 'DELETE' }),
  uploadImage: (id: string, formData: FormData) => fetchApi<any>(`/categories/${id}/image`, { method: 'POST', body: formData }),
};

// --- Cart API Helper ---
export const cartApi = {
  getCart: () => fetchApi<any>('/carts/my', { method: 'GET' }),
  addItem: (data: any) => fetchApi<any>('/carts/add', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string | number, quantity: number) => fetchApi<any>(`/carts/update/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeItem: (id: string | number) => fetchApi<any>(`/carts/remove/${id}`, { method: 'DELETE' }),
  clearCart: () => fetchApi<any>('/carts/clear', { method: 'DELETE' }),
};

// --- Order API Helper ---
export const orderApi = {
  getAll: () => fetchApi<any>('/orders', { method: 'GET' }),
  getMyOrders: () => fetchApi<any>('/orders/my', { method: 'GET' }),
  getById: (id: string | number) => fetchApi<any>(`/orders/my/${id}`, { method: 'GET' }),
  getAdminOrderById: (id: string | number) => fetchApi<any>(`/orders/${id}`, { method: 'GET' }),
  create: (data: any) => fetchApi<any>('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Wishlist API Helper ---
export const wishlistApi = {
  getWishlist: () => fetchApi<any>('/wishlist', { method: 'GET' }),
  addItem: (productId: string | number) => fetchApi<any>('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeItem: (productId: string | number) => fetchApi<any>(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// --- Address API Helper ---
export const addressApi = {
  getAll: () => fetchApi<any>('/addresses', { method: 'GET' }),
  getById: (id: string) => fetchApi<any>(`/addresses/${id}`, { method: 'GET' }),
  add: (data: any) => fetchApi<any>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id: string) => fetchApi<any>(`/addresses/${id}/default`, { method: 'PATCH' }),
};

// --- Admin API Helper ---
export const adminApi = {
  getStats: () => fetchApi<any>('/admin/dashboard', { method: 'GET' }),
  getUsers: () => fetchApi<any>('/admin/users', { method: 'GET' }),
  getOrders: () => fetchApi<any>('/admin/orders', { method: 'GET' }),
  updateOrderStatus: (id: string, data: any) => fetchApi<any>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// --- Review API Helper ---
export const reviewApi = {
  getProductReviews: (productId: string) => fetchApi<any>(`/products/${productId}/reviews`, { method: 'GET' }),
  canReview: (productId: string) => fetchApi<any>(`/products/${productId}/reviews/can-review`, { method: 'GET' }),
  createReview: (productId: string, data: { rating: number, comment: string }) => fetchApi<any>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
};

// --- Coupon API Helper ---
export const couponApi = {
  getAll: () => fetchApi<any>('/coupons', { method: 'GET' }),
  getById: (id: string) => fetchApi<any>(`/coupons/${id}`, { method: 'GET' }),
  apply: (code: string) => fetchApi<any>('/coupons/apply', { method: 'POST', body: JSON.stringify({ code }) }),
  create: (data: any) => fetchApi<any>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi<any>(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/coupons/${id}`, { method: 'DELETE' }),
};

// --- Payment API Helper ---
export const paymentApi = {
  getAll: () => fetchApi<any>('/payments', { method: 'GET' }),
  updateStatus: (id: string, status: string) => fetchApi<any>(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

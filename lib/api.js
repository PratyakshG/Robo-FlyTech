import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const user = JSON.parse(localStorage.getItem('techstore_user') || 'null');
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// Profile
export const getProfile        = ()       => api.get('/auth/profile');
export const updateProfile     = (data)   => api.put('/auth/profile', data);
export const changePassword    = (data)   => api.put('/auth/profile/password', data);

// Categories
export const getCategories  = ()           => api.get('/categories');
export const createCategory = (data)       => api.post('/categories', data);
export const updateCategory = (id, data)   => api.put(`/categories/${id}`, data);
export const deleteCategory = (id)         => api.delete(`/categories/${id}`);

// Upload
export const uploadImage = (file) => {
  const fd = new FormData();
  fd.append('image', file);
  return api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const uploadImages = (files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  return api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Products
export const getProducts       = (params)    => api.get('/products', { params });
export const getProduct        = (id)        => api.get(`/products/${id}`);
export const getProductFilters = ()          => api.get('/products/meta/filters');
export const createProduct     = (data)      => api.post('/products', data);
export const updateProduct     = (id, data)  => api.put(`/products/${id}`, data);
export const deleteProduct     = (id)        => api.delete(`/products/${id}`);

// Offers
export const getOffers              = ()         => api.get('/offers');
export const getActiveOffers        = ()         => api.get('/offers/active');
export const getProductsWithOffers  = (params) => api.get('/offers/products-with-offers', { params });
export const createOffer            = (data)     => api.post('/offers', data);
export const updateOffer            = (id, data) => api.put(`/offers/${id}`, data);
export const deleteOffer            = (id)       => api.delete(`/offers/${id}`);

// Hero Slides
export const getHeroSlides        = ()          => api.get('/hero-slides');
export const getAdminHeroSlides    = ()          => api.get('/hero-slides/all');
export const createHeroSlide       = (data)      => api.post('/hero-slides', data);
export const updateHeroSlide       = (id, data)  => api.put(`/hero-slides/${id}`, data);
export const deleteHeroSlide       = (id)        => api.delete(`/hero-slides/${id}`);

// Addresses
export const getAddresses    = ()     => api.get('/addresses');
export const addAddress      = (data) => api.post('/addresses', data);
export const deleteAddress   = (id)   => api.delete(`/addresses/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/myorders');

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminOrders = () => api.get('/admin/orders');
export const updateOrderStatus = (id, s) => api.put(`/admin/orders/${id}/status`, { status: s });
export const getCustomers = () => api.get('/admin/customers');

export default api;

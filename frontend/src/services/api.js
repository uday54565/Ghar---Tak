import axios from "axios";

const TOKEN_KEY = "ghartak-token";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authenticationFailures = new Set([
      "Authentication required",
      "Invalid authentication token",
      "Token has expired",
      "User no longer exists",
    ]);
    const message = error.response?.data?.message;
    if (
      error.response?.status === 401 &&
      authenticationFailures.has(message)
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("ghartak-user");
      window.dispatchEvent(new Event("ghartak:unauthorized"));
    }
    return Promise.reject(
      new Error(
        error.response?.data?.message ||
          error.message ||
          "Unable to connect to the server."
      )
    );
  }
);

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (details) => api.post("/auth/register", details),
  forgotPassword: (details) => api.post("/auth/forgot-password", details),
  resetPassword: (details) => api.post("/auth/reset-password", details),
  updatePassword: (details) => api.patch("/auth/password", details),
};

export const userApi = {
  profile: () => api.get("/users/profile"),
  updateProfile: (details) => api.patch("/users/profile", details),
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  mine: () => api.get("/products/mine"),
  uploadImage: (image) => {
    const formData = new FormData();
    formData.append("image", image);
    return api.post("/products/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  create: (details) => api.post("/products", details),
  update: (id, details) => api.patch(`/products/${id}`, details),
  remove: (id) => api.delete(`/products/${id}`),
};

export const shopApi = {
  list: () => api.get("/shops"),
  mine: () => api.get("/shops/my-shop"),
  update: (details) => api.patch("/shops/my-shop", details),
};

export const categoryApi = {
  list: () => api.get("/categories"),
  create: (details) => api.post("/categories", details),
  update: (id, details) => api.patch(`/categories/${id}`, details),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId, quantity = 1) =>
    api.post("/cart", { productId, quantity }),
  update: (productId, quantity) =>
    api.patch(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart"),
};

export const orderApi = {
  create: (deliveryAddress) => api.post("/orders", { deliveryAddress }),
  mine: () => api.get("/orders/my-orders"),
  forShop: () => api.get("/orders"),
  updateStatus: (id, orderStatus) =>
    api.patch(`/orders/${id}/status`, { orderStatus }),
};

export const getErrorMessage = (error) =>
  error instanceof Error ? error.message : "Something went wrong.";

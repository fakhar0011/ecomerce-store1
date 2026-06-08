import api from "./axios";

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

interface LoginData {
  email: string;
  password: string;
}

// ← Signup
export const signupService = async (data: SignupData) => {
  const response = await api.post("/auth/signup", data);
  // Token save
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// ← Login
export const loginService = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  // Token save
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// ← Logout
export const logoutService = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
};

// ← Get Me
export const getMeService = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

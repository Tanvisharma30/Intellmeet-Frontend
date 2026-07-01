export const getToken = () => {
  return localStorage.getItem("token");
};

export const login = () => {
  localStorage.setItem("token", "demo-token");
};

export const logout = () => {
  localStorage.removeItem("token");
};
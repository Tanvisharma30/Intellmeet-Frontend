import { createContext, useContext, useState, useEffect } from "react";

type AuthType = {
  token: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const login = () => {
    localStorage.setItem("token", "demo-token");
    setToken("demo-token");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
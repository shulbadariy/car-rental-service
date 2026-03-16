import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; role: string } | null;
  token: string | null;
  login: (token: string, user?: Partial<{ id: string; email: string; role: string }>) => void;
  logout: () => void;
}

function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return null;
  }
}

function getUserFromToken(token: string | null) {
  if (!token) return null;
  const decoded = decodeJwt(token);
  if (!decoded) return null;
  return {
    id: decoded.sub as string,
    email: decoded.email as string,
    role: (decoded.role as string) ?? 'USER',
  };
}

export const useAuth = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  return {
    user: getUserFromToken(token),
    token,
    login: (token, user) => {
      const derivedUser =
        user && user.role && user.email
          ? { id: user.id ?? '', email: user.email, role: user.role }
          : getUserFromToken(token);
      localStorage.setItem('token', token);
      set({ token, user: derivedUser });
    },
    logout: () => {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    },
  };
});
import { create } from "zustand";

// state management for authentication and global theme
export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  darkMode: localStorage.getItem("darkMode") === "true",

  // user login action
  login: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  // user logout action
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  // update user info locally
  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // toggle dark mode theme
  toggleDarkMode: () => {
    const nextDark = !get().darkMode;
    localStorage.setItem("darkMode", String(nextDark));
    
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    set({ darkMode: nextDark });
  },

  // synchronize theme class on app boot
  initTheme: () => {
    if (get().darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
}));

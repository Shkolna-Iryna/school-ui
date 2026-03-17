export const ROLE_OPTIONS = ["admin", "teacher", "student"];

export function getCurrentUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
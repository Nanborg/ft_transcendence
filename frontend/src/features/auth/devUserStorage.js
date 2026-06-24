/*
const DEV_USER_STORAGE_KEY = 'ft_transcendence_dev_user';

export function getStoredDevUser() {
  try {
    const storedUser = window.localStorage.getItem(DEV_USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    window.localStorage.removeItem(DEV_USER_STORAGE_KEY);
    return null;
  }
}

export function storeDevUser(user) {
  window.localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredDevUser() {
  window.localStorage.removeItem(DEV_USER_STORAGE_KEY);
}
  */

const AUTH_SESSION_STORAGE_KEY = 'ft_transcendence_auth_session';

export function getStoredAuthSession() {
  try {
    const storedSession = window.localStorage.getItem(
      AUTH_SESSION_STORAGE_KEY,
    );

    if (!storedSession) {
      return null;
    }

    return JSON.parse(storedSession);
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function storeAuthSession(session) {
  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

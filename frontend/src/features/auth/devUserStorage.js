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
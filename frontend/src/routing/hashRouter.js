export function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, '');
  if (!hashPath || hashPath === '/') {
    return '/';
  }
  return hashPath;
}
export function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, '');
  if (!hashPath || hashPath === '/') {
    return '/';
  }
  return hashPath;
}

export function matchCurrentPage(path, pages) {
  const staticPage = pages.find(page => page.path === path);
  if (staticPage)
    return staticPage;

  const profileMatch = path.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    return {
      id: 'public-profile',
      path,
      label: 'Profile',
      title: 'Profile',
      description: '',
      params: {
        userId: Number(profileMatch[1]),
      },
    };
  }

  return pages[0];
}

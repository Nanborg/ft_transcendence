export function getCurrentPath() {
  // DECISION: Hash routing avoids server rewrites
  const hashPath = window.location.hash.replace(/^#/, '');
  if (!hashPath || hashPath === '/') {
    // FALLBACK: Empty hash opens home
    return '/';
  }
  return hashPath;
}

export function matchCurrentPage(path, pages) {
  // REQUIRED: Static routes are checked first
  const staticPage = pages.find(page => page.path === path);
  if (staticPage)
    return staticPage;

  const profileMatch = path.match(/^\/profile\/(\d+)$/);
  if (profileMatch) {
    // DECISION: Public profile route stores id in params
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

  // FALLBACK: Unknown route returns home page
  return pages[0];
}

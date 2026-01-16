// Vite plugin to generate redirect HTML files for each route
export function routeRedirects() {
  const routes = [
    'profile',
    'create',
    'notes',
    'items',
    'labs',
    'jobs',
    'chat',
    'badges',
    'login',
    'register',
  ];

  return {
    name: 'route-redirects',
    generateBundle() {
      // Generate redirect HTML for each route
      routes.forEach(route => {
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
        // Immediate redirect to hash route
        const search = window.location.search;
        const hash = window.location.hash;
        let newUrl = '/Database_Final/#/${route}';
        if (search) newUrl += search;
        if (hash && !hash.startsWith('#')) newUrl += '#' + hash;
        window.location.replace(newUrl);
    </script>
    <meta http-equiv="refresh" content="0; url=/Database_Final/#/${route}">
</head>
<body>
    <p>正在重定向...</p>
    <noscript>
        <meta http-equiv="refresh" content="0; url=/Database_Final/#/${route}">
        <p>如果页面没有自动跳转，请<a href="/Database_Final/#/${route}">点击这里</a>。</p>
    </noscript>
</body>
</html>`;

        // Emit file to be written to dist directory
        this.emitFile({
          type: 'asset',
          fileName: `${route}/index.html`,
          source: html
        });
      });
    }
  };
}


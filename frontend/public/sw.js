// Service Worker for MemoLucky PWA
const CACHE_NAME = 'memolucky-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('[SW] Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 拦截请求 - 网络优先策略（适合动态内容）
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 先检查URL，跳过外部资源和不支持的协议
  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    // 无效的URL，让浏览器处理
    return;
  }

  // 跳过不支持的请求协议（如 chrome-extension）
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:' || url.protocol === 'moz-extension:') {
    return;
  }

  // 跳过外部资源（如 via.placeholder.com），让浏览器直接处理
  if (url.origin !== self.location.origin) {
    return;
  }

  // 跳过API请求（总是从网络获取，不缓存）
  if (event.request.url.includes('/api/')) {
    return;
  }

  // 只处理同源请求
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 只缓存成功的响应
        if (response && response.status === 200 && response.type === 'basic') {
          // 克隆响应
          const responseToCache = response.clone();
          
          // 更新缓存（只缓存同源请求）
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              console.log('[SW] Cache put failed:', err);
            });
          });
        }
        
        return response;
      })
      .catch((error) => {
        // 网络失败时从缓存获取
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 如果缓存也没有，返回离线页面（仅对导航请求）
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html').then((htmlResponse) => {
              return htmlResponse || new Response('Offline', { 
                status: 503, 
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
              });
            });
          }
          
          // 对于其他请求，返回一个错误响应
          return new Response('Network error', { 
            status: 408, 
            statusText: 'Request Timeout',
            headers: { 'Content-Type': 'text/plain' }
          });
        }).catch(() => {
          // 如果缓存匹配也失败，返回一个基本的错误响应
          return new Response('Service Unavailable', { 
            status: 503, 
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// 后台同步（可选）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  // 实现后台同步逻辑
  console.log('[SW] Syncing posts...');
}

// 推送通知（可选）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'memolucky-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('MemoLucky', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});


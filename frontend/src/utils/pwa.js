// PWA 安装提示工具

let deferredPrompt;

// 监听安装提示事件
export const initPWAInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault();
    // 保存事件以便后续使用
    deferredPrompt = e;
    
    // 显示自定义安装按钮
    showInstallButton();
  });

  // 监听安装完成事件
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
    hideInstallButton();
  });
};

// 显示安装按钮
const showInstallButton = () => {
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
  }
};

// 隐藏安装按钮
const hideInstallButton = () => {
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
};

// 触发安装
export const installPWA = async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  // 显示安装提示
  deferredPrompt.prompt();
  
  // 等待用户响应
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  
  // 清除保存的事件
  deferredPrompt = null;
  
  return outcome === 'accepted';
};

// 检查是否已安装
export const isPWAInstalled = () => {
  // 检查是否在standalone模式下运行
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// 检查是否支持PWA
export const isPWASupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 发送本地通知
export const sendLocalNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
};

// 检查网络状态
export const checkOnlineStatus = () => {
  return navigator.onLine;
};

// 监听网络状态变化
export const initNetworkStatusListener = (onOnline, onOffline) => {
  window.addEventListener('online', () => {
    console.log('Network: Online');
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('Network: Offline');
    if (onOffline) onOffline();
  });
};


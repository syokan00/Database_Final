import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 在应用启动前检查URL，如果不是hash路由格式，自动重定向
(function checkAndRedirect() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // 如果不在 /Database_Final/ 路径下，或者没有hash路由，需要重定向
    if (!path.startsWith('/Database_Final/') || (!hash && path !== '/Database_Final/')) {
        // 提取路径部分
        let route = path.replace('/Database_Final', '').replace(/^\//, '').replace(/\/$/, '');
        
        // 如果路径不是空的且不是 Database_Final，转换为hash路由
        if (route && route !== 'Database_Final') {
            const search = window.location.search;
            window.location.replace(`/Database_Final/#/${route}${search}`);
            return; // 阻止应用加载，等待重定向
        } else if (!hash) {
            // 如果已经在正确路径但没有hash，添加默认hash
            window.location.replace('/Database_Final/#/');
            return;
        }
    }
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

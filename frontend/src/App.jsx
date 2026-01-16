import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreatePost from './pages/CreatePost';
import NotesPage from './pages/NotesPage';
import ItemsPage from './pages/ItemsPage';
import EditItemPage from './pages/EditItemPage';
import LabsPage from './pages/LabsPage';
import JobsPage from './pages/JobsPage';
import BadgePage from './pages/BadgePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import FollowListPage from './pages/FollowListPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';
import { initPWAInstallPrompt, initNetworkStatusListener } from './utils/pwa';

// 路由守卫组件：确保URL格式正确
function RouteGuard() {
  const location = useLocation();
  
  useEffect(() => {
    // 确保URL格式正确
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/Database_Final/')) {
      const hash = location.pathname;
      const search = window.location.search;
      window.history.replaceState(null, '', `/Database_Final/#${hash}${search}`);
    }
  }, [location]);
  
  return null;
}

function App() {
  useEffect(() => {
    // 初始化PWA安装提示
    initPWAInstallPrompt();
    
    // 初始化网络状态监听
    initNetworkStatusListener(
      () => {
        console.log('应用已恢复在线');
        // 可以显示通知或刷新数据
      },
      () => {
        console.log('应用已离线');
        // 可以显示离线提示
      }
    );
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <PostProvider>
          <Router>
            <RouteGuard />
            <div className="app">
              <Navbar />
              <PWAInstallPrompt />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreatePost />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/items" element={<ItemsPage />} />
                  <Route path="/items/:id/edit" element={<EditItemPage />} />
                  <Route path="/labs" element={<LabsPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:type/:id" element={<ChatPage />} />
                  <Route path="/chat/:id" element={<ChatPage />} />
                  <Route path="/badges" element={<BadgePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users/:userId/follow" element={<FollowListPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </PostProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

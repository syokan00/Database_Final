import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { installPWA, isPWAInstalled } from '../utils/pwa';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 检查是否已安装
        setIsInstalled(isPWAInstalled());

        // 监听安装提示事件
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            // 延迟显示提示（用户浏览一段时间后）
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000); // 30秒后显示
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 监听安装完成
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        const installed = await installPWA();
        if (installed) {
            setShowPrompt(false);
            setIsInstalled(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // 记住用户选择（可以使用localStorage）
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // 如果已安装或不显示提示，返回null
    if (isInstalled || !showPrompt) {
        return null;
    }

    // 检查用户是否之前拒绝过
    if (localStorage.getItem('pwa-install-dismissed') === 'true') {
        return null;
    }

    return (
        <div className="pwa-install-prompt">
            <div className="pwa-prompt-content">
                <div className="pwa-prompt-icon">
                    <Download size={24} />
                </div>
                <div className="pwa-prompt-text">
                    <h3>アプリをインストール</h3>
                    <p>ホーム画面に追加して、より快適に利用できます</p>
                </div>
                <div className="pwa-prompt-actions">
                    <button 
                        className="pwa-btn pwa-btn-primary" 
                        onClick={handleInstall}
                    >
                        インストール
                    </button>
                    <button 
                        className="pwa-btn pwa-btn-dismiss" 
                        onClick={handleDismiss}
                        aria-label="閉じる"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;


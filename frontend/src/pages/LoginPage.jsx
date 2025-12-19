import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Clover, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const LoginPage = () => {
    const { t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                setLoading(false);
                // Force navigation and state update
                window.location.href = '/profile';
            } else {
                setLoading(false);
                setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
            }
        } catch (err) {
            setLoading(false);
            // Handle error message - ensure it's a string
            let errorMessage = 'ログインに失敗しました。入力内容を確認してください。';
            
            if (err.message && typeof err.message === 'string') {
                errorMessage = err.message;
            } else if (err.response?.data) {
                const data = err.response.data;
                if (Array.isArray(data.detail)) {
                    errorMessage = data.detail.map(e => e.msg || '入力内容が正しくありません').join('; ');
                } else if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span style={{ fontSize: '32px' }}>🍀</span>
                    </div>
                    <h2>{t.common.login}</h2>
                    <p className="auth-subtitle">{t.common.slogan}</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    {error && (
                        <div className="error-message" style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '1rem',
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '0.5rem',
                            color: '#DC2626',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>{t.common.email}</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="student@university.edu"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t.common.password}</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'ログイン中...' : (
                            <>
                                {t.common.login} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register" className="text-link">{t.common.register}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

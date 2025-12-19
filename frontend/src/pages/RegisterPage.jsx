import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Clover } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const RegisterPage = () => {
    const { t } = useLanguage();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [year, setYear] = useState('');
    const [grade, setGrade] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true);
        
        const result = await register(name, email, password, year ? parseInt(year) : null, grade);
        setLoading(false);
        
        if (result.success) {
            // Registration successful
            navigate('/login', { 
                state: { message: '登録が完了しました。ログインしてください。' } 
            });
        } else {
            // Show error message
            setError(result.error || '登録に失敗しました。もう一度お試しください。');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span style={{ fontSize: '32px' }}>🍀</span>
                    </div>
                    <h2>{t.common.register}</h2>
                    <p className="auth-subtitle">MemoLuckyに参加しよう。</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
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
                        <label>ユーザー名</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="LuckyStudent"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError(''); // Clear error when user types
                                }}
                                required
                            />
                        </div>
                    </div>

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
                                    setError(''); // Clear error when user types
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
                                    setError(''); // Clear error when user types
                                }}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>入学年（任意）</label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                placeholder="2024"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                min="2000"
                                max="2030"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>学年（任意）</label>
                        <div className="input-wrapper">
                            <select 
                                value={grade} 
                                onChange={(e) => setGrade(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">選択しない</option>
                                <option value="B1">学部1年</option>
                                <option value="B2">学部2年</option>
                                <option value="B3">学部3年</option>
                                <option value="B4">学部4年</option>
                                <option value="M1">M1（修士1年）</option>
                                <option value="M2">M2（修士2年）</option>
                                <option value="D1">D1（博士1年）</option>
                                <option value="D2">D2（博士2年）</option>
                                <option value="D3">D3（博士3年）</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? '登録中...' : (
                            <>
                                {t.common.register} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        すでにアカウントをお持ちですか？ <Link to="/login" className="text-link">{t.common.login}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

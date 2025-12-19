import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await client.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('username', email.trim());
            params.append('password', password);

            const response = await client.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Fetch user details
            const userResponse = await client.get('/auth/me');
            setUser(userResponse.data);

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            
            // Format error message for display
            let errorMessage = 'ログインに失敗しました。入力内容を確認してください。';
            
            if (error.response) {
                const data = error.response.data;
                
                // Handle 422 validation errors
                if (error.response.status === 422) {
                    if (Array.isArray(data?.detail)) {
                        const errors = data.detail.map(err => {
                            const field = err.loc ? err.loc.join('.') : 'field';
                            const msg = err.msg || '入力内容が正しくありません';
                            return `${field}: ${msg}`;
                        });
                        errorMessage = errors.join('; ') || 'メールアドレスまたはパスワードの形式が正しくありません。';
                    } else if (typeof data?.detail === 'string') {
                        errorMessage = data.detail;
                    }
                } else if (typeof data?.detail === 'string') {
                    errorMessage = data.detail;
                } else if (data?.message) {
                    errorMessage = data.message;
                }
            }
            
            // Create a new error with formatted message
            const formattedError = new Error(errorMessage);
            formattedError.response = error.response;
            throw formattedError;
        }
    };

    const register = async (name, email, password, year = null, grade = null) => {
        try {
            // Basic validation
            if (!name || !name.trim()) {
                return { success: false, error: 'ユーザー名は必須です' };
            }
            if (!email || !email.trim()) {
                return { success: false, error: 'メールアドレスは必須です' };
            }
            if (!password || password.length < 6) {
                return { success: false, error: 'パスワードは6文字以上にしてください' };
            }

            const response = await client.post('/auth/register', {
                email: email.trim(),
                password,
                nickname: name.trim(),
                year: year || 2025, // Default year
                grade: grade
            });
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Extract error message from response
            let errorMessage = '登録に失敗しました。もう一度お試しください。';
            
            if (error.response) {
                // Server responded with error
                const data = error.response.data;
                
                // Handle 422 validation errors (Pydantic validation errors)
                if (error.response.status === 422) {
                    if (Array.isArray(data?.detail)) {
                        // Pydantic validation errors are arrays
                        const errors = data.detail.map(err => {
                            const field = err.loc ? err.loc.join('.') : 'field';
                            const msg = err.msg || '入力内容が正しくありません';
                            return `${field}: ${msg}`;
                        });
                        errorMessage = errors.join('; ') || '入力内容を確認してください。';
                    } else if (typeof data?.detail === 'string') {
                        errorMessage = data.detail;
                    } else {
                        errorMessage = '入力内容を確認してください。';
                    }
                } else if (typeof data?.detail === 'string') {
                    errorMessage = data.detail;
                } else if (data?.message) {
                    errorMessage = data.message;
                } else if (error.response.status === 400) {
                    errorMessage = '入力内容を確認してください。';
                } else if (error.response.status === 409) {
                    errorMessage = 'このメールアドレスは既に登録されています。';
                } else if (error.response.status >= 500) {
                    errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'サーバーに接続できません。ネットワークを確認してください。';
            }
            
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser,
            login, 
            register, 
            logout, 
            isAuthenticated: !!user, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

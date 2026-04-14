'use client';

import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export const GoogleSignInButton = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        // Prevent multiple initializations
        if (window.google?.accounts?.id?.initialize && window.__google_initialized) {
            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, { theme: 'filled_black', size: 'large', width: window.innerWidth > 400 ? '380' : '100%' });
            }
            return;
        }

        const handleCredentialResponse = async (response) => {
            setLoading(true);
            setError(null);
            try {
                const res = await API.post('auth/google/', { credential: response.credential });
                const data = res.data;
                
                login({ token: data.token, refresh: data.refresh }, data.user);
                
                if (data.token) {
                    API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                }

                router.push('/dashboard');
            } catch (err) {
                console.error('Google login failed:', err);
                setError(err.response?.data?.error || err.response?.data?.detail || 'Google login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const initializeGoogle = () => {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in env");
                setError("Google Sign-In is not configured.");
                return;
            }
            
            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });
                window.__google_initialized = true;

                if (buttonRef.current) {
                    window.google.accounts.id.renderButton(buttonRef.current, { 
                        theme: 'filled_black', 
                        size: 'large', 
                        width: window.innerWidth > 400 ? 380 : undefined
                    });
                }
            } catch (err) {
                console.error("Error initializing Google Sign-In", err);
            }
        };

        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogle;
            script.onerror = () => setError('Failed to load Google Sign-In script');
            document.head.appendChild(script);
        } else {
            initializeGoogle();
        }

    }, [login, router]);

    return (
        <div style={{ marginTop: '20px', width: '100%' }}>
            {error && (
                <div style={{ 
                    background: 'rgba(239,68,68,0.1)', color: '#EF4444', 
                    padding: '10px', borderRadius: '8px', marginBottom: '15px', 
                    fontSize: '13px', textAlign: 'center' 
                }}>
                    {error}
                </div>
            )}
            
            {loading ? (
                <div style={{ 
                    padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', 
                    color: '#A1A1AA', borderRadius: '8px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    Logging you in...
                </div>
            ) : (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div ref={buttonRef}></div>
                </div>
            )}
        </div>
    );
};

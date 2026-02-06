import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {API_BASE} from './config'; 


export function useAuthCheck(redirectIfUnauthenticated = true) {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/auth/protected`, {
            credentials: 'include',
        })
        .then(res => {
            if (!res.ok) throw new Error('Not authenticated');
            return res.json();
        })
        .then(() => {
            setIsAuthenticated(true);
            setCheckingAuth(false);
        })
        .catch(() => {
            setIsAuthenticated(false);
            setCheckingAuth(false);
            if (redirectIfUnauthenticated) {
                navigate('/');
                
            }
        });
    }, [navigate, redirectIfUnauthenticated]);

    return { checkingAuth, isAuthenticated };
}

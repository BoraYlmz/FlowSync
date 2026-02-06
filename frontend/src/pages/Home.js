import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import '../App.css';
import {API_BASE} from '../components/config';
import { useAuthCheck } from '../components/AuthCheck';


import logo from '../assets/logo192.png';


function Home() {
  const navigate = useNavigate();
  const { checkingAuth, isAuthenticated } = useAuthCheck(false);

  const currentPage = "home";
  
  const [theme, setTheme] = useState(() => {return localStorage.getItem('theme') || 'light';});


  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
      if (!checkingAuth && !isAuthenticated) {
        navigate('/');
      }
  }, [checkingAuth, isAuthenticated, navigate]);


  return (
    <div className={`${currentPage} container`}>
      <div className={`${currentPage} container`}>
        Home Page
      </div>
      
    </div>

  );
}

export default Home;

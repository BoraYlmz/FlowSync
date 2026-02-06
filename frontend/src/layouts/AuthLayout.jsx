import React, { useState, useEffect } from "react";
import { Outlet,useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import "./styles/authLayouth.css";
import logo from "../assets/logo192.png";

import { useAuthCheck } from "../components/AuthCheck";
import  LoadingSpinner  from "../components/LoadingSpinner";
import {PROJECT_NAME} from "../components/config"

const AuthLayout = () => {
  const navigate = useNavigate();
  const { checkingAuth, isAuthenticated } = useAuthCheck(false);

  useEffect(() => {
    if (!checkingAuth && isAuthenticated) {
      navigate("/");
    }
  }, [checkingAuth, isAuthenticated, navigate]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  if (checkingAuth) {
    return <LoadingSpinner />;
  }
  return (
    <div className={`main container`}>
        <div className="auth-Sidebar">
          <div className="auth-Sidebarlogo">
            <span className="auth-Sidebar_logo_content">
              <img src={logo} alt="FlowSync" />
              {PROJECT_NAME}
            </span>
          </div>
          <hr />
          <h2>{PROJECT_NAME}</h2>
          <p>Senkronize veri akışı ve güvenilir entegrasyon.</p>
          <button onClick={toggleTheme}>
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
        </div>
      <main className={`main content`}>
        
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

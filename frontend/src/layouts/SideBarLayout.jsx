import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

import "./styles/sidebarLayouth.css";
import logo from "../assets/logo192.png";
import { Moon, Sun, Building2 , Network , MessageSquareMore } from "lucide-react";


import { useAuthCheck } from "../components/AuthCheck";
import LoadingSpinner from "../components/LoadingSpinner";
import {PROJECT_NAME} from "../components/config"

const MainLayout = () => {
  const { checkingAuth, isAuthenticated } = useAuthCheck(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      navigate("/");
    }
  }, [checkingAuth, isAuthenticated, navigate]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }
  return (
    //main container sidebar
    <div className={`main container`}>
      <div className={`sidebar container`}>
        <div className={`sidebar logo`}>
          <Link to="/home" className={`sidebar links`}>
            <div className={`sidebar logo content`}>
              <img src={logo} alt="FlowSync" />
              {PROJECT_NAME}
            </div>
          </Link>
        </div>
        <hr></hr>
        <ul style={{}}>
          <li>
            <Link
              to="/department-list"
              className={`sidebar links ${
                location.pathname === "/department-list" ? "active" : ""
              }`}
            >
              <i>
                <Network />
              </i>
              <span>Departmanlar</span>
            </Link>
          </li>
          <li>
            <Link
              to="/company-list"
              className={`sidebar links ${
                location.pathname === "/company-list" ? "active" : ""
              }`}
            >
              <i>
                <Building2 />
              </i>
              <span>Firmalar</span>
            </Link>
          </li>
          <li>
            <Link
              to="/meet-list"
              className={`sidebar links ${
                location.pathname === "/meet-list" ? "active" : ""
              }`}
            >
              <i>
                <MessageSquareMore />
              </i>
              <span>Toplantılar</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`sidebar links ${
                location.pathname === "/settings" ? "active" : ""
              }`}
            >
              Ayarlar
            </Link>
          </li>
        </ul>
        <button onClick={toggleTheme}>
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
      </div>
      {/*main content route ile gelen sayfalar */}
      <main className={`main content`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

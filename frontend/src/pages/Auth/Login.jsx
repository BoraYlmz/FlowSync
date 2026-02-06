import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./styles/auth.css";
import { forgotPassword, login } from "../../services/authService";

import logo from "../../assets/logo192.png";
import { toast } from "react-toastify";
import {PROJECT_NAME} from "../../components/config"


function LoginPage() {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = e.target.fpemail.value;
    const response = await forgotPassword(email);
    
    if (response.state) {
      setEmailSent(true);
    } else {
      toast.error("E-posta gönderilemedi.")
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    const remember = e.target.remember.checked;


    const response = await login(email, password, remember);
    console.log(response)

    if (response.state) {
      navigate("/home");
    } else {
      toast.error("kullanıcı adı veya şifre hatalı!")
    }
  };

  return (
    <div className="auth-Container">
      <div className="auth-Content">
        <div className={`auth-Card ${isFlipped ? "flipped" : ""}`}>
          <div className={`auth-CardInner ${isFlipped ? "flipped" : ""}`}>
            <div className="auth-Card_front">
              <div className="auth-Card_logo">
                <span className="auth-Card_logo_content">
                  <img src={logo} alt={PROJECT_NAME} />
                  {PROJECT_NAME}
                </span>
              </div>
              <form onSubmit={handleLogin}>
                <div className="auth-Card_input-group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                  <div className="underline"></div>
                </div>
                <div className="auth-Card_input-group">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password">Password</label>
                  <div className="underline"></div>
                </div>
                <div className="auth-remember">
                  <input type="checkbox" id="remember" />{" "}
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <button type="submit">Log In</button>
              </form>
              <div className="auth-Card_links">
                <p
                  onClick={() => {
                    setIsFlipped(true);
                    setEmailSent(false);
                  }}
                >
                  Forgot your password?
                </p>
              </div>
            </div>
            <div className="auth-Card_back">
              <div className="auth-Card_logo">
                <span className="auth-Card_logo_content">
                  <img src={logo} alt={PROJECT_NAME} />
                  {PROJECT_NAME}
                </span>
              </div>
              {emailSent ? (
                <p>Mail gönderildi! Lütfen gelen kutunu kontrol et.</p>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className="auth-Card_input-group">
                    <input
                      type="email"
                      name="fpemail"
                      id="fpemail"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="fpemail">Email Address</label>
                    <div className="underline"></div>
                  </div>
                  <button type="submit">Reset Password</button>
                </form>
              )}
              <div className="auth-Card_links">
                <p onClick={() => setIsFlipped(false)}>
                  Remember your password?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

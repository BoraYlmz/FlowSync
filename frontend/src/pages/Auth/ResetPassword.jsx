import React, { useState, useEffect } from "react";
import { useNavigate ,useSearchParams} from "react-router-dom";
import { toast } from "react-toastify";

import "./styles/auth.css";
import { validateToken, resetPassword } from "../../services/authService";
import {PROJECT_NAME} from "../../components/config"

import LoadingSpinner from "../../components/LoadingSpinner";

import logo from "../../assets/logo192.png";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!token) {
      toast.error("Geçersiz veya süresi dolmuş link!")
      navigate("/");
      return;
    }

    const checkToken = async () => {
      try {
        const response = await validateToken(token);

        if (response.status) {
          setLoading(false);
        } else {
          toast.error("Token geçersiz veya süresi dolmuş!")
          navigate("/");
        }
      } catch (err) {
        toast.error("Token kontrol hatası")
        navigate("/");
      }
    };

    checkToken();
  }, [token, navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    const rptpassword = e.target.rptpassword.value;

    if (password === rptpassword) {
      
      const response = await resetPassword(token,password);
      if (response.status) {
        toast.success(response.msg)
        navigate("/");
      } else {
        toast.error(response.msg);
      }
    } else {
      toast.error("Şifreler uyuşmalıdır!");
    }
  };
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="auth-Container">
      <div className="auth-Content">
        <div className="auth-Card">
          <div className="auth-CardInner">
            <div className="auth-Card_front">
              <div className="auth-Card_logo">
                <span className="auth-Card_logo_content">
                  <img src={logo} alt={PROJECT_NAME} />
                  {PROJECT_NAME}
                </span>
              </div>
              <form onSubmit={handleSubmit}>
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
                <div className="auth-Card_input-group">
                  <input
                    type="password"
                    name="rptpassword"
                    id="rptpassword"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="rptpassword">Repeat Password</label>
                  <div className="underline"></div>
                </div>

                <button type="submit">Reset Password</button>
              </form>
              <div className="auth-Card_links">
                <p
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Back To Login
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import "./styles/auth.css";
import { validateToken, register } from "../../services/authService";
import LoadingSpinner from "../../components/LoadingSpinner";
import logo from "../../assets/logo192.png";
import {PROJECT_NAME} from "../../components/config"

function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [birthDate, setBirthDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Geçersiz veya süresi dolmuş link!");
      navigate("/");
      return;
    }

    const checkToken = async () => {
      try {
        const response = await validateToken(token);

        if (response.status) {
          setLoading(false);
        } else {
          toast.error(response.msg);
          navigate("/");
        }
      } catch (err) {
        toast.error(
          "Beklenmedik hata meydana geldi. Kayıt işlemi şuan yapılamıyor!"
        );
        navigate("/");
      }
    };

    checkToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const usrbirthDate = format(birthDate, "dd/MM/yyyy");
    const password = e.target.password.value;
    const rptpassword = e.target.rptpassword.value;

    if (password === rptpassword) {
      const response = await register(
        token,
        firstName,
        lastName,
        usrbirthDate,
        password
      );
      if (response.state) {
        toast.success(response.msg);
        navigate("/");
      } else {
        toast.error(response.msg);
      }
    } else {
      toast.error("Şifrelerniz uyuşmamaktadır.");
    }
  };
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="auth-Container">
      <div className="auth-Content">
        <div className="auth-Card" style={{ height: "550px" }}>
          <div className="auth-CardInner">
            <div className="auth-Card_front">
              <div className="auth-Card_logo">
                <span className="auth-Card_logo_content">
                  <img src={logo} alt={PROJECT_NAME} />
                  {PROJECT_NAME}
                </span>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ width: "100%", display: "flex", gap: "15px" }}>
                  <div className="auth-Card_input-group">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="firstName">İsim</label>
                    <div className="underline"></div>
                  </div>

                  <div className="auth-Card_input-group">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder=" "
                      required
                    />
                    <label htmlFor="lastName">Soyisim</label>
                    <div className="underline"></div>
                  </div>
                </div>
                <div className="auth-Card_input-group">
                  <div className="react-datepicker-wrapper">
                    <DatePicker
                      selected={birthDate}
                      onChange={setBirthDate}
                      dateFormat="dd/MM/yyyy"
                      placeholderText=" "
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      required
                      id="birthDate"
                    />
                  </div>
                  <label htmlFor="birthDate">Date of Birth</label>
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

                <button type="submit">Register</button>
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

export default Register;

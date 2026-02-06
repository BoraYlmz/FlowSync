import {API_BASE} from "../components/config";
import getCookie from "../components/crfsToken";

export const forgotPassword = async (email) => {
  const resp = await fetch(`${API_BASE}/auth/forgot-password/${email}`, {
    credentials: "include",
  });

  return resp.json();
};

export const login = async (email, password, remember) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ email, password, remember }),
  });
  return response.json();
};

export const validateToken = async (token) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/auth/validate-token`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ token }),
  });
  return response.json();
};

export const register = async (
  token,
  firstName,
  lastName,
  usrbirthDate,
  password
) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({
      token,
      firstName,
      lastName,
      usrbirthDate,
      password,
    }),
  });
  return response.json();
};

export const resetPassword = async (token, password) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ token, password }),
  });
  return response.json();
};

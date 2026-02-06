import {API_BASE} from "../components/config";
import getCookie from "../components/crfsToken";

export const userFrmList = async () => {
  const response = await fetch(
    `${API_BASE}/api/meets/userFrmList`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const getFrmPerson = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/meets/getFrmPerson/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const getDepartmentUserList = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/meets/getDepartmentUserList/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const createMeet = async (frmId, frmPersonIds, departmentId, departmentUserList, meetHeader, meetDate, content) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/meets/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ frmId, frmPersonIds, departmentId, departmentUserList, meetHeader, meetDate, content}),
  });
  return response.json();
};

export const getMeet = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/meets/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const getUserDepartmentList = async (frm_id) => {
  const response = await fetch(
    `${API_BASE}/api/meets/getUserDepartmentList/${frm_id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};


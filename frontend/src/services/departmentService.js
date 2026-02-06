import {API_BASE} from "../components/config";
import getCookie from "../components/crfsToken";

export const updateUserStatus = async (departmentId, selectedRows, process) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(`${API_BASE}/api/departments/userChangeState`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ departmentId, selectedRows, process }),
  });

  return response.json();
};

export const updateUserRole = async (departmentId, selectedRows, process) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(`${API_BASE}/api/departments/userChangeRole`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ departmentId, selectedRows, process }),
  });

  return response.json();
};

export const removeUsers = async (departmentId, selectedRows, process) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(
    `${API_BASE}/api/departments/firedFromTheDepartment`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ departmentId, selectedRows, process }),
    }
  );

  return response.json();
};

export const checkIfOrganization = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/control/isDepartmentAnOrganization/${id}`,
    { credentials: "include" }
  );
  return response.json();
};

export const fetchAddableUsers = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/departments/addableUser/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const addUsersToDepartment = async (departmentId, users) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(
    `${API_BASE}/api/departments/addUsersToDepartment`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ departmentId, users }),
    }
  );
  return response.json();
};

export const sendInviteMail = async (email) => {
  const response = await fetch(
    `${API_BASE}/api/departments/invitation/${email}`,
    { credentials: "include" }
  );
  return response.json();
};

export const createDepartment = async (departmentName, description) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/departments/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ departmentName, description }),
  });
  return response.json();
};

export const deleteDepartment = async (id) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRFToken": csrfToken },
  });
  return response.json();
};

export const assignableUsers = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/departments/assignableUsers/${id}`,
    { credentials: "include" }
  );

  return response.json();
};

export const setDepartmentManager = async (selectedUsers,departmentId) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(
    `${API_BASE}/api/departments/setDepartmentManager`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        selectedUsers,
        departmentId,
      }),
    }
  );
  return response.json();
};

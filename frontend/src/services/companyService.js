import {API_BASE} from "../components/config";
import getCookie from "../components/crfsToken";

export const createCompany = async (CompanyName, number, address) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/companies/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ CompanyName, number, address}),
  });
  return response.json();
};

export const updateCompany = async (companyId,companyName, companyNumber, companyAddress) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(`${API_BASE}/api/companies/update`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ companyId, companyName, companyNumber ,companyAddress}),
  });

  return response.json();
};

export const companyContactList = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/companies/contactList/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const appendCompanyContact = async (companyId, newUser) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/companies/appendContact`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ companyId, newUser}),
  });
  return response.json();
};

export const deleteContact = async (companyId, selectedRows) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(
    `${API_BASE}/api/companies/deleteContact`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ companyId, selectedRows }),
    }
  );

  return response.json();
};

export const updateCompanyContact = async (companyId, selectedUser,newData) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/companies/updateContact`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ companyId, selectedUser,newData}),
  });
  return response.json();
};

export const companyDepartmentList = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/companies/departmentList/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const deleteCompanyDepartment = async (companyId, selectedRows) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(
    `${API_BASE}/api/companies/deleteCompanyDepartment`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ companyId, selectedRows }),
    }
  );

  return response.json();
};

export const addableDepartment = async (id) => {
  const response = await fetch(
    `${API_BASE}/api/companies/addableDepartment/${id}`,
    {
      credentials: "include",
    }
  );
  return response.json();
};

export const appendCompanyDepartment = async (companyId, departmentList) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/companies/appendDepartment`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ companyId, departmentList}),
  });
  return response.json();
};

export const companyDepartmentCangeState = async (companyId, departmentList) => {
  const csrfToken = getCookie("csrf_token");
  const response = await fetch(`${API_BASE}/api/companies/companyDepartmentCangeState`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ companyId, departmentList}),
  });
  return response.json();
};

export const deleteCompany = async (companyId) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch(
    `${API_BASE}/api/companies/deleteCompany`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ companyId }),
    }
  );

  return response.json();
};
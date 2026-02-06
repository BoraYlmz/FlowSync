import { createContext, useState, useContext } from "react";

const DepartmentContext = createContext();

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [activeDepartment, setActiveDepartment] = useState(null);


const openSidebar = async (department = null) => {
  if (isSidebarVisible) {
    await closeSidebar();
  }

  setServerResponse(null);
  setShowUserSearch(false);
  setSelectedDepartment(department);
  setIsSidebarVisible(true);
  setActiveDepartment(null);


  setTimeout(() => setIsSidebarOpen(true), 10);
};

const closeSidebar = () => {
  return new Promise((resolve) => {
    setServerResponse(null);
    setShowUserSearch(false);
    setIsSidebarOpen(false);
    setInputVisible(false);

    setTimeout(() => {
      setIsSidebarVisible(false);
      setSelectedDepartment(null);
      resolve();
    }, 300);
  });
};

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        setDepartments,
        selectedDepartment,
        setSelectedDepartment,
        isSidebarVisible,
        isSidebarOpen,
        loading,
        setLoading,
        openSidebar,
        closeSidebar,
        inputVisible,
        setInputVisible,
        showUserSearch,
        setShowUserSearch,
        serverResponse,
        setServerResponse,
        activeDepartment,
        setActiveDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = () => useContext(DepartmentContext);

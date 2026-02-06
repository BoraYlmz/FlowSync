import { createContext, useState, useContext } from "react";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isUpdateClicked, setIsUpdateClicked] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

const openSidebar = async (company = null) => {
  if (isSidebarVisible) {
    await closeSidebar();
  }

  setSelectedCompany(company);
  setIsSidebarVisible(true);
  setTimeout(() => setIsSidebarOpen(true), 10);
};

const closeSidebar = () => {
  return new Promise((resolve) => {
    setIsSidebarOpen(false);

    setTimeout(() => {
      setIsSidebarVisible(false);
      setSelectedCompany(null);
      resolve();
    }, 300);
  });
};



  return (
    <CompanyContext.Provider
      value={{
        companies,
        setCompanies,
        selectedCompany,
        setSelectedCompany,
        isSidebarVisible,
        isSidebarOpen,
        loading,
        setLoading,
        openSidebar,
        closeSidebar,
        isUpdateClicked,
        setIsUpdateClicked,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompanies = () => useContext(CompanyContext);
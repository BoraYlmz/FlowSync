import { createContext, useState, useContext } from "react";

const MeetContext = createContext();

export const MeetProvider = ({ children }) => {
  const [meets, setMeets] = useState([]);
  const [selectedMeet, setSelectedMeet] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


const openSidebar = async (meet = null) => {
  if (isSidebarVisible) {
    await closeSidebar();
  }

  setSelectedMeet(meet);
  setIsSidebarVisible(true);
  setTimeout(() => setIsSidebarOpen(true), 10);
};

const closeSidebar = () => {
  return new Promise((resolve) => {
    setIsSidebarOpen(false);

    setTimeout(() => {
      setIsSidebarVisible(false);
      setSelectedMeet(null);
      resolve();
    }, 300);
  });
};



  return (
    <MeetContext.Provider
      value={{
        meets,
        setMeets,
        selectedMeet,
        setSelectedMeet,
        isSidebarVisible,
        isSidebarOpen,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </MeetContext.Provider>
  );
};

export const useMeets = () => useContext(MeetContext);
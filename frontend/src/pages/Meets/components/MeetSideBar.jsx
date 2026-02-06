import { useEffect, useState } from "react";

import { useMeets } from "../../../context/MeetContext";
// import { confirmToast } from "../../../components/confirmToast";
import "../styles/MeetSideBar.css";
import MeetForm from "./MeetForm";
// import { Building, Phone, MapPin } from "lucide-react";

// import { deleteCompany } from "../../../services/companyService";
import { toast } from "react-toastify";

const CompanyDetailSidebar = () => {
  const {
    selectedMeet,
    isSidebarOpen,
    closeSidebar,
    setMeets,
  } = useMeets();

  const [detailSelectedNav, setDetailSelectedNav] = useState(0);

  useEffect(() => {
    const reset = async () => {
      setDetailSelectedNav(0);
    };
    if (isSidebarOpen) {
      reset();
    }
  }, [isSidebarOpen]);


  return (
    <div
      className={`MeetSideBar ${isSidebarOpen ? "open" : "close"}`}
      style={{
        width: "1000px",
      }}
    >
      <button className="close_btn" onClick={closeSidebar}>
        X
      </button>
      {selectedMeet ? (
          <MeetForm />
      ) : (
        <MeetForm />
      )}
    </div>
  );
};

export default CompanyDetailSidebar;

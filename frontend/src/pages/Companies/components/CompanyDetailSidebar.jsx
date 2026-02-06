import { useEffect, useState } from "react";

import { useCompanies } from "../../../context/CompanyContext";
import { confirmToast } from "../../../components/confirmToast";
import "../styles/CompanyDetailSidebar.css";
import InfoForm from "./CompanyInfoForm";
import { Building, Phone, MapPin } from "lucide-react";

import ContactTable from "./CompanyContactTable";
import DepartmentListTable from "./CompanyDepartmentTable";

import { deleteCompany } from "../../../services/companyService";
import { toast } from "react-toastify";

const CompanyDetailSidebar = () => {
  const {
    selectedCompany,
    isUpdateClicked,
    isSidebarOpen,
    closeSidebar,
    setCompanies,
  } = useCompanies();

  const [detailSelectedNav, setDetailSelectedNav] = useState(0);

  useEffect(() => {
    const reset = async () => {
      setDetailSelectedNav(0);
    };
    if (isSidebarOpen) {
      reset();
    }
  }, [isSidebarOpen]);

  const deleteFrmToast = () => {
    confirmToast({
      message:
        "Bu firmayı silmek istediğinize emin misiniz? Bu firmaya ait tüm kayıtlar silinecektir.",
      onConfirm: () => {
        deleteFrm();
      },
    });
  };

  const deleteFrm = async () => {
    const response = await deleteCompany(selectedCompany._id);
    if (response) {
      closeSidebar();
      setCompanies((prev) =>
        prev.includes(selectedCompany)
          ? prev.filter((card) => card !== selectedCompany)
          : NaN
      );
      toast.success(response.msg)
    } else {
      toast.error(response.msg)
    }
  };

  return (
    <div
      className={`company-Detail ${isSidebarOpen ? "open" : "close"}`}
      style={{
        width: selectedCompany
          ? isUpdateClicked
            ? "550px"
            : "1000px"
          : "550px",
      }}
    >
      <button className="close_btn" onClick={closeSidebar}>
        X
      </button>
      {selectedCompany ? (
        isUpdateClicked ? (
          <InfoForm />
        ) : (
          <div className="content-placeholder">
            <h2>Firma Detayları</h2>
            <div className="company-detailsHeader">
              <div className="company-info">
                <span>
                  <Building size={20} />
                </span>
                <p>{selectedCompany.companyName}</p>
              </div>
              <div className="company-info">
                <span>
                  <Phone size={20} />
                </span>
                <p>{selectedCompany.companyNumber}</p>
              </div>
              <div className="company-info">
                <span>
                  <MapPin size={20} />
                </span>
                <p>{selectedCompany.companyAddress}</p>
              </div>
            </div>
            <ul>
              <li
                className={`${detailSelectedNav === 0 ? "active u_0" : ""}`}
                onClick={() => setDetailSelectedNav(0)}
              >
                Kişiler
              </li>
              <li
                className={`${detailSelectedNav === 1 ? "active u_1" : ""}`}
                onClick={() => setDetailSelectedNav(1)}
              >
                Departmanlar
              </li>
              <li
                className={`${detailSelectedNav === 2 ? "active u_2" : ""}`}
                onClick={() => setDetailSelectedNav(2)}
              >
                Toplantılar
              </li>
              <div className="underline"></div>
            </ul>
            {detailSelectedNav === 0 ? (
              <ContactTable />
            ) : detailSelectedNav === 1 ? (
              <DepartmentListTable />
            ) : (
              NaN
            )}
            <button className="removeCardBtn" onClick={deleteFrmToast}>
              Firmayı Sil
            </button>
          </div>
        )
      ) : (
        <InfoForm />
      )}
    </div>
  );
};

export default CompanyDetailSidebar;

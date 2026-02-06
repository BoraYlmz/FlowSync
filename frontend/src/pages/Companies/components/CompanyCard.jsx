import React from "react";

import { useCompanies } from "../../../context/CompanyContext";

import "../styles/CompanyCard.css";
import { Settings } from "lucide-react";

const CompanyCard = ({ frm }) => {
  const { openSidebar, setIsUpdateClicked } = useCompanies();

  return (
    <div className="company-Card">
      <div className="cardHeader">
        <h3>{frm.companyName}</h3>
        <span
          className="update_btn"
          onClick={() => {
            setIsUpdateClicked(true);
            openSidebar(frm);
          }}
        >
          <Settings size={15} />
        </span>
      </div>

      <div className="cardBody">
        <p className="info">📞 {frm.companyNumber || "Belirtilmemiş"}</p>
        <p className="info address">
          <span className="icon">📍</span>{" "}
          <span className="text">{frm.companyAddress || "Belirtilmemiş"}</span>
        </p>
      </div>
      <div className="button-group">
        <button
          className="detail_btn"
          onClick={() => {
            setIsUpdateClicked(false);
            openSidebar(frm);
          }}
        >
          Detay
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;

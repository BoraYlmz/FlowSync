import React from "react";

import { useMeets } from "../../../context/MeetContext";
import { UserPlus, Users } from "lucide-react";


import "../styles/MeetCard.css";


const MeetCard = ({ meet }) => {
  const { openSidebar} =
    useMeets();

  return (
    <div className="meet-Card">
        <div className="frmName">{meet.frmName}</div>
        <div className="meetHeader"><span>{meet.meetHeader}</span></div>
        <div className="meetDate">{meet.meetDate}</div>
        <div className="participants">
            <span><UserPlus size={20}/>{meet.externalParticipantsCount}</span>
            <span>/</span>
            <span><Users size={20}/>{meet.internalParticipantsCount}</span>
        </div>
        <button onClick={() => openSidebar(meet)}>
          Detay
        </button>
    </div>
  );
};

export default MeetCard;

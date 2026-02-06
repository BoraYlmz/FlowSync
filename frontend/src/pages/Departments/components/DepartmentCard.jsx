import React, { useState } from "react";

import { useDepartments } from "../../../context/DepartmentContext";
import { toast } from "react-toastify";

import UserSearchList from "./UserSearchList";
import "../styles/DepartmentCard.css";

import {
  assignableUsers,
  setDepartmentManager,
} from "../../../services/departmentService";

const DepartmentCard = ({ dept }) => {
  const { openSidebar, closeSidebar, activeDepartment, setActiveDepartment } =
    useDepartments();
  const [users, setUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const userAssignment = async (dept) => {
    try {
      closeSidebar();
      if (activeDepartment === null) {
        const response = await assignableUsers(dept._id);
        if (response.state) {
          setUsers(response.data);
          setShowUserSearch(true);
          setActiveDepartment(dept._id);
        } else {
          toast.error("HATA: " + response.msg);
        }
      } else {
        if (selectedUsers.length > 0) {
          const result = await setDepartmentManager(selectedUsers, dept._id);
          if (result.state) {
            dept.managerName = result.data;
            toast.success(result.msg);
          } else {
            toast.error(result.msg);
          }
        }

        setActiveDepartment(null);
        setUsers([]);
        setShowUserSearch(false);
      }
    } catch (err) {
      setActiveDepartment(null);
      setUsers([]);
      setShowUserSearch(false);
      toast.error("Beklenmedik hata meydana geldi!");
    }
  };

  return (
    <div className="departments-Card">
      <h3>{dept.name}</h3>
      <div className="manager-info">
        Müdür: {dept.managerName || "Belirtilmemiş"}
      </div>

      <div className="button-group">
        <button className="detail_btn" onClick={() => openSidebar(dept)}>
          Detay
        </button>

        <button
          className="assign_btn"
          onClick={() => {
            userAssignment(dept);
            setSelectedUsers([]);
          }}
        >
          Kullanıcı Ata
        </button>
        {activeDepartment === dept._id && showUserSearch && (
          <div className="addUserContainer">
            <UserSearchList
              users={users}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              isDetailView={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentCard;

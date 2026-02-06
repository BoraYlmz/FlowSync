import { useEffect, useState } from "react";

import {API_BASE} from "../../../components/config";
import { toast } from "react-toastify";
import { confirmToast } from "../../../components/confirmToast";
import LoadingSpinner from "../../../components/LoadingSpinner";

import { useDepartments } from "../../../context/DepartmentContext";
import "../styles/DepartmentDetailSidebar.css";

import DepartmentTable from "./DepartmentTable";
import UserSearchList from "./UserSearchList";

import {
  fetchAddableUsers,
  addUsersToDepartment,
  sendInviteMail,
  checkIfOrganization,
  createDepartment,
  deleteDepartment,
} from "../../../services/departmentService";

import { UserRoundPlus } from "lucide-react";

const DepartmentDetailSidebar = () => {
  const {
    selectedDepartment,
    isSidebarVisible,
    isSidebarOpen,
    closeSidebar,
    inputVisible,
    setInputVisible,
    setDepartments,
    showUserSearch,
    setShowUserSearch,
    serverResponse,
    setServerResponse,
  } = useDepartments();

  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isInputClosing, setIsInputClosing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedDepartment) return;
      setLoadingDetails(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/departments/${selectedDepartment._id}`,
          { credentials: "include" }
        );
        const json = await response.json();
        if (json.state) {
          setDetails(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (isSidebarOpen) {
      fetchDetails();
    }
  }, [selectedDepartment, isSidebarOpen]);

  const newDepartment = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const description = e.target.description.value;

    if (name.trim() === "" || description.trim() === "") {
      toast.warning("Departman Bilgileri Boş olamaz");
    } else {
      try {
        const resp = await createDepartment(name, description);
        if (resp.state) {
          const newDepartmentInfo = {
            _id: resp.Id,
            name,
            description,
          };
          setDepartments((prev) => [...prev, newDepartmentInfo]);
          toast.success("Kayıt Başarı İle eklendi");
          e.target.reset();
          closeSidebar();
        } else {
          toast.error(resp.msg);
          e.target.reset();
          closeSidebar();
        }
      } catch (err) {
        toast.error("HATA:" + err);
        console.error("HATA:", err);
      }
    }
  };

    const delDepartment = async () => {
      if (selectedDepartment) {
        try {
          const resp = await deleteDepartment(selectedDepartment._id);
          if (resp.state) {
            setDepartments((prev) =>
              prev.includes(selectedDepartment)
                ? prev.filter((card) => card !== selectedDepartment)
                : NaN
            );
            toast.success(resp.msg);
            closeSidebar();
          } else {
            toast.error(resp.msg);
            closeSidebar();
          }
        } catch (err) {
          toast.error("HATA:" + err);
          console.error("HATA:", err);
        }
      } else {
        toast.error("Departman Bilgisi hatalı veya boş gelmektedir.");
        closeSidebar();
      }
    };

  const addingUser = async () => {
    try {
      if (serverResponse === null) return await handleAddUser();
      if (serverResponse === true) return await handleInviteSend();
      if (serverResponse === false) return await handleUserSubmit();
    } catch (err) {
      toast.error("HATA: " + err.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const resp = await checkIfOrganization(selectedDepartment._id);
      if (!resp.state) {
        toast.error(resp.msg);
        return;
      }
      setServerResponse(resp.mode);

      if (resp.mode) {
        // Organizasyon: e-posta inputu
        setTimeout(() => setInputVisible(true), 50);
        setShowUserSearch(false);
      } else {
        // Normal departman: kullanıcı listesi
        const list = await fetchAddableUsers(selectedDepartment._id);
        if (list.state) {
          setUsers(list.data);
          setShowUserSearch(true);
        } else {
          toast.error(list.msg);
        }
      }
    } catch (err) {
      toast.error("Kullanıcı ekleme hatası");
    }
  };

  const handleInviteSend = async () => {
    toggleInput();
    if (!inputValue.trim()) return;
    const result = await sendInviteMail(inputValue);
    if (result.state) {
      toast.success(result.msg);
    } else {
      toast.error(result.msg);
    }
    toggleInput();
    setInputValue("");
    setInputVisible(false);
    setServerResponse(null);
  };

  const handleUserSubmit = async () => {
    if (!selectedUsers.length) {
      setShowUserSearch(false);
      setSelectedUsers([]);
      setServerResponse(null);
      setSearchTerm("");
      return;
    }

    const resp = await addUsersToDepartment(
      selectedDepartment._id,
      selectedUsers
    );
    if (resp.state) {
      toast.success(resp.msg);
      setDetails(resp.data);
    } else {
      toast.error(resp.msg);
    }
    setShowUserSearch(false);
    setSelectedUsers([]);
    setServerResponse(null);
  };

  const toggleInput = () => {
    if (!inputVisible) {
      setInputVisible(true);
    } else {
      setIsInputClosing(true);
      setTimeout(() => {
        setInputVisible(false);
        setIsInputClosing(false);
      }, 500);
    }
  };

  if (!isSidebarVisible) return null;

  return (
    <div
      className={`departments-Detail ${isSidebarOpen ? "open" : "close"}`}
      style={{ width: selectedDepartment ? "1000px" : "550px" }}
    >
      <button className="close_btn" onClick={closeSidebar}>
        X
      </button>
      {loadingDetails ? (
        <LoadingSpinner />
      ) : selectedDepartment ? (
        <>
          <h2>Departman Detayları</h2>
          <p>
            <strong>Ad:</strong> {selectedDepartment.name}
          </p>
          <p>
            <strong>Müdür:</strong>{" "}
            {selectedDepartment.managerName || "Belirtilmemiş"}
          </p>

          {/* Buraya tablo ve kullanıcı ekleme gelecek */}
          <div className="content-placeholder">
            <div className="addUserContainer">
              <button className="addingUser" onClick={addingUser}>
                <UserRoundPlus />
              </button>

              {inputVisible && (
                <input
                  className={`inviteInput ${
                    isInputClosing ? "slideOutInput" : "slideInInput"
                  }`}
                  type="email"
                  placeholder="E-posta giriniz..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}

              {showUserSearch && (
                <UserSearchList
                  users={users}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  isDetailView={true}
                />
              )}
            </div>
            <DepartmentTable
              details={details}
              selectedDepartment={selectedDepartment}
              setDetails={setDetails}
            />
            <button
              className="removeCardBtn"
              onClick={() =>
                confirmToast({
                  message:
                    "Bu departmanı silmek istediğinize emin misiniz? Bu departmanla ilişkili tüm veriler silinecektir.",
                  onConfirm: () => delDepartment(),
                })
              }
            >
              Departmanı Kapat
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Yeni Departman Ekle</h2>
          <div className="content-placeholder">
            <form onSubmit={newDepartment}>
              <div className="newForm">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="name">Departman Adı</label>
                  <div className="underline"></div>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="description">Departman Açıklaması</label>
                  <div className="underline"></div>
                </div>
                <button type="submit">Ekle</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default DepartmentDetailSidebar;

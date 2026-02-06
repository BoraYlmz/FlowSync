import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  ShieldUser,
  Shield,
  UserRound,
  Play,
} from "lucide-react";

import {
  updateUserStatus,
  updateUserRole,
  removeUsers,
} from "../../../services/departmentService";

import "../styles/DepartmentTable.css";
import "../../../App.css";

const rowsPerPage = 15;

export default function DepartmentTable({
  details,
  selectedDepartment,
  setDetails,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const totalPages = Math.ceil(details.length / rowsPerPage);

  const handleAction = async () => {
    if (selectedAction === 0) {
      toast.warning("İşlem seçmelisiniz");
      return;
    }

    if (selectedRows.length === 0) {
      toast.warning("Kullanıcı seçmelisiniz");
      return;
    }

    let response;
    const deptId = selectedDepartment._id;

    if (selectedAction === 1) {
      response = await updateUserStatus(deptId, selectedRows, selectedAction);
    } else if ([2, 3, 4].includes(selectedAction)) {
      response = await updateUserRole(deptId, selectedRows, selectedAction);
    } else if (selectedAction === 5) {
      response = await removeUsers(deptId, selectedRows, selectedAction);
    }

    if (response?.state) {
      const updatedIds = response.data.map((id) => id.toString());
      if (selectedAction === 1) {
        setDetails((prevDetails) =>
          prevDetails.map((card) =>
            updatedIds.includes(card.userId)
              ? { ...card, userState: !card.userState }
              : card
          )
        );
      } else if ([2, 3, 4].includes(selectedAction)) {
        setDetails((prevDetails) =>
          prevDetails.map((card) =>
            updatedIds.includes(card.userId)
              ? {
                  ...card,
                  role:
                    selectedAction === 2
                      ? "User"
                      : selectedAction === 3
                      ? "Manager"
                      : "Admin",
                }
              : card
          )
        );
      } else if (selectedAction === 5) {
        setDetails((prevDetails) =>
          prevDetails.filter((card) => !updatedIds.includes(card.userId))
        );
      }
      toast.success(response.msg);
      setSelectedRows([]);
    } else {
      toast.error(response?.msg || "İşlem başarısız");
    }
  };

  const paginatedData = useMemo(() => {
    return details.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [details, currentPage]);

  const toggleAll = () => {
    const pageIds = paginatedData.map((row) => row.userId);

    const allSelected = pageIds.every((id) => selectedRows.includes(id));

    if (allSelected) {
      setSelectedRows(selectedRows.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedRows([...new Set([...selectedRows, ...pageIds])]);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows(
      selectedRows.includes(id)
        ? selectedRows.filter((row) => row !== id)
        : [...selectedRows, id]
    );
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={paginatedData.every((row) =>
                  selectedRows.includes(row.userId)
                )}
                onChange={toggleAll}
              />
            </td>
            <td>İsim</td>
            <td style={{ textAlign: "center" }}>Durum</td>
            <td style={{ textAlign: "center" }}>Doğum Tarihi</td>
            <td>Mail</td>
            <td style={{ textAlign: "center" }}>Role</td>
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((row) => (
            <tr
              key={row.userId}
              className={
                selectedRows.includes(row.userId) ? "selected-row" : ""
              }
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.userId)}
                  onChange={() => toggleRow(row.userId)}
                />
              </td>
              <td>
                {row.name} {row.surname}
              </td>
              <td style={{ textAlign: "center" }}>
                <span
                  className={row.userState ? "stateTrue" : "stateFalse"}
                ></span>
              </td>
              <td style={{ textAlign: "center" }}>{row.birthday}</td>
              <td>{row.email}</td>

              <td style={{ textAlign: "center" }}>
                <span
                  className={
                    row.role === "Admin"
                      ? "adminUser"
                      : row.role === "Manager"
                      ? "managerUser"
                      : "User"
                  }
                >
                  {row.role === "Admin" ? (
                    <ShieldUser />
                  ) : row.role === "Manager" ? (
                    <Shield />
                  ) : (
                    <UserRound />
                  )}
                  {row.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan="6">
              <div className="pagination-control">
                <div className="left">
                  <div className="actions">
                    <select
                      value={selectedAction}
                      onChange={(e) =>
                        setSelectedAction(Number(e.target.value))
                      }
                    >
                      <option value={0}>Select An Option</option>
                      <option value={1}>✔️ Aktif ⇄ Pasif ❌</option>
                      <option value={2}>👤 User Yap</option>
                      <option value={3}>🧑‍💼 Manager Yap</option>
                      <option value={4}>🛡️ Admin Yap</option>
                      <option value={5}>🗑️ Kullanıcıyı Kaldır</option>
                    </select>
                    <button className="run" onClick={handleAction}>
                      <Play size={20} />
                    </button>
                  </div>
                </div>
                <div className="right">
                  <span>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    className="prevNextButton"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    className="prevNextButton"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

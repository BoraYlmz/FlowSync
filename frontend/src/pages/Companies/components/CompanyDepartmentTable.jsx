import { useState, useEffect, useMemo } from "react";
import { useCompanies } from "../../../context/CompanyContext";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import { confirmToast } from "../../../components/confirmToast";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

import TableDataSearchList from "../../components/TableDataSearchList";

import {
  companyDepartmentList,
  deleteCompanyDepartment,
  addableDepartment,
  appendCompanyDepartment,
  companyDepartmentCangeState,
} from "../../../services/companyService";

import "../../../App.css";

const DepartmentTable = () => {
  const { selectedCompany, isSidebarOpen } = useCompanies();
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState(0); // Seçilen form aksiyonu
  const [selectedRows, setSelectedRows] = useState([]); // Tabloda seçilen verilerin idleri
  const [tableDataList, setTableDataList] = useState([]); // Tablodaki veri grubu
  const [currentPage, setCurrentPage] = useState(1); // Tablo görüntülendiği sayfa
  const [addDataListVisible, setAddDataListVisible] = useState(false); // SearchBox gözükme durumu
  const [searchTerm, setSearchTerm] = useState(""); // SearchBox arama terimi
  const [selectedDataRow, setSelectedDataRow] = useState([]); // SearchBox içersinde seçilen verilerin idleri
  const [dataList, setDataList] = useState([]); // SearchBox içerisindeki veri grubu

  useEffect(() => {
    setLoadingDetails(true);
    setCurrentPage(1);
    setSelectedAction(0);
    setSelectedRows([]);
    setAddDataListVisible(false);
    const fetchCompanyDepartments = async () => {
      try {
        const resp = await companyDepartmentList(selectedCompany._id);
        if (resp.state) {
          setTableDataList(resp.data);
        } else {
          toast.error(resp.msg);
        }
      } catch (err) {
        toast.error("HATA:" + err);
        console.error("HATA:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    if (isSidebarOpen) {
      fetchCompanyDepartments();
    }
  }, [
    setTableDataList,
    isSidebarOpen,
    selectedCompany,
    setSelectedRows,
    setCurrentPage,
  ]);

  const rowsPerPage = 15;
  const totalPages = Math.ceil(tableDataList.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return tableDataList.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [tableDataList, currentPage]);

  const toggleAll = () => {
    const pageIds = paginatedData.map((row) => row._id);

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
  const handleAction = async () => {
    if (selectedAction === 0) {
      toast.warning("İşlem seçmelisiniz");
      return;
    }
    if (selectedAction === 1) {
      confirmToast({
        message:
          "Seçili departmanları silmek istediğinize emin misiniz. Seçili departmanlara ait tüm kayıtlar silinecektir.",
        onConfirm: () => {
          removeDepartment();
        },
      });
    } else if (selectedAction === 2) {
      changeStateDepartment();
    }
  };

  const removeDepartment = async () => {
    const response = await deleteCompanyDepartment(
      selectedCompany._id,
      selectedRows
    );
    if (response.state) {
      setTableDataList((prev) =>
        prev.filter((dpt) => !selectedRows.includes(dpt._id))
      );
      toast.success("Seçilen departmanlar silinmiştir...");
    } else {
      toast.error(response.msg);
    }
  };

  const changeStateDepartment = async () => {
    const response = await companyDepartmentCangeState(
      selectedCompany._id,
      selectedRows
    );
    if (response.state) {
      const updatedIds = selectedRows.map((id) => id.toString());
      setTableDataList((prevDetails) =>
        prevDetails.map((card) =>
          updatedIds.includes(card._id) ? { ...card, state: !card.state } : card
        )
      );
      toast.success("Seçilen Departmanların firmaya erişimi kapatılmıştır.")
    } else {
      toast.error(response.msg);
    }
  };

  const toggleAppendContainer = async () => {
    if (addDataListVisible) {
      if (selectedDataRow.length > 0) {
        const resp = await appendCompanyDepartment(
          selectedCompany._id,
          selectedDataRow
        );
        if (resp.state) {
          setTableDataList(resp.data);
          toast.success(resp.msg);
        } else {
          toast.error(resp.msg);
        }
      }
      setAddDataListVisible(false);
    } else {
      setSearchTerm("");
      setSelectedDataRow([]);
      const resp = await addableDepartment(selectedCompany._id);
      if (resp.state) {
        setDataList(resp.data);
      } else {
        toast.error(resp.msg);
      }
      setAddDataListVisible(true);
    }
  };

  return loadingDetails ? (
    <LoadingSpinner />
  ) : (
    <>
      <div className="table-wrapper">
        <div className="appendTableContainer">
          <button className="add_btn" onClick={toggleAppendContainer}>
            <Plus />
          </button>
          {addDataListVisible && (
            <TableDataSearchList
              dataList={dataList}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDataRow={selectedDataRow}
              setSelectedDataRow={setSelectedDataRow}
              multiSelect={true}
            />
          )}
        </div>
        <table>
          <thead>
            <tr>
              <td>
                <input
                  type="checkbox"
                  checked={paginatedData.every((row) =>
                    selectedRows.includes(row._id)
                  )}
                  onChange={toggleAll}
                />
              </td>
              <td>Departman Adı</td>
              <td style={{ textAlign: "center" }}>Erişim Durumu</td>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={row._id}
                className={selectedRows.includes(row._id) ? "selected-row" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row._id)}
                    onChange={() => toggleRow(row._id)}
                  />
                </td>
                <td>{row.deptName}</td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className={row.state ? "stateTrue" : "stateFalse"}
                  ></span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">
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
                        <option value={1}>🗑️ Departmanı Kaldır</option>
                        <option value={2}>✔️ Aktif ⇄ Pasif ❌</option>
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
    </>
  );
};

export default DepartmentTable;

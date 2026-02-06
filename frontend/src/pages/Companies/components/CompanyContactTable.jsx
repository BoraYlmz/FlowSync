import { useState, useEffect, useRef, useMemo } from "react";
import { useCompanies } from "../../../context/CompanyContext";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import { confirmToast } from "../../../components/confirmToast";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import {
  companyContactList,
  appendCompanyContact,
  updateCompanyContact,
  deleteContact,
} from "../../../services/companyService";

import "../../../App.css";

const ContactTable = () => {
  const { selectedCompany, isSidebarOpen } = useCompanies();

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableDataList, setTableDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const nameRef = useRef(null);
  const mailRef = useRef(null);
  const numberRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    setLoadingDetails(true);
    setCurrentPage(1);
    setSelectedAction(0);
    setSelectedRows([]);
    const fetchContact = async () => {
      try {
        const resp = await companyContactList(selectedCompany._id);
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
      fetchContact();
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

  const delContact = async (frmId) => {
    const response = await deleteContact(frmId, selectedRows);
    if (response.state) {
      setTableDataList((prev) =>
        prev.filter((frmUser) => !selectedRows.includes(frmUser._id))
      );
      toast.success("Seçilen kişiler listeden silinmiştir..");
    } else {
      toast.error(response.msg);
    }
  };

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
    if (selectedAction !== 2 && selectedRows.length === 0) {
      toast.warning("Kullanıcı seçmelisiniz");
      return;
    }
    if (selectedAction === 3 && selectedRows.length !== 1) {
      toast.warning("Güncellemek için sadece bir kullanıcı seçiniz!");
      return;
    }
    let response;
    const frmId = selectedCompany._id;
    if (selectedAction === 1) {
      confirmToast({
        message:
          "Bu kişiyi silmek istediğinize emin misiniz? Bu kişiyle ilişkili tüm veriler silinecektir.",
        onConfirm: () => {
          delContact(frmId);
        },
      });
    } else if (selectedAction === 2) {
      const newUser = {
        name: nameRef.current.value,
        mail: mailRef.current.value,
        number: numberRef.current.value,
        role: roleRef.current.value,
      };
      response = await appendCompanyContact(frmId, newUser);
      if (response.state) {
        const newContact = {
          _id: response.Id,
          companyId: selectedCompany._id,
          mail: mailRef.current.value,
          name: nameRef.current.value,
          number: numberRef.current.value,
          role: roleRef.current.value,
        };
        setTableDataList([...tableDataList, newContact]);
        toast.success("İletişim bilgisi başarılı bir şekilde eklenmiştir.");
      } else {
        toast.error(response.msg);
      }
      nameRef.current.value = "";
      mailRef.current.value = "";
      numberRef.current.value = "";
      roleRef.current.value = "";
    } else if (selectedAction === 3) {
      const newData = {
        name: nameRef.current.value,
        mail: mailRef.current.value,
        number: numberRef.current.value,
        role: roleRef.current.value,
      };
      response = await updateCompanyContact(frmId, selectedRows, newData);
      if (response.state) {
        const updateContact = {
          _id: selectedRows[0],
          companyId: selectedCompany._id,
          mail: mailRef.current.value,
          name: nameRef.current.value,
          number: numberRef.current.value,
          role: roleRef.current.value,
        };
        setTableDataList((prev) => {
          return prev.map((frmUser) => {
            if (selectedRows.includes(frmUser._id)) {
              return updateContact;
            }
            return frmUser;
          });
        });
        toast.success("İletişim bilgisi başarılı bir şekilde güncellenmiştir.");
      } else {
        toast.error(response.msg);
      }
      nameRef.current.value = "";
      mailRef.current.value = "";
      numberRef.current.value = "";
      roleRef.current.value = "";
    }
  };

  return loadingDetails ? (
    <LoadingSpinner />
  ) : (
    <>
      <div className="table-wrapper">
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
              <td>İsim</td>
              <td>Mail</td>
              <td style={{ textAlign: "center" }}>Telefon</td>
              <td style={{ textAlign: "center" }}>Görev</td>
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
                <td>{row.name}</td>
                <td>{row.mail}</td>
                <td style={{ textAlign: "center" }}>{row.number}</td>
                <td style={{ textAlign: "center" }}>{row.role}</td>
              </tr>
            ))}
            {[2, 3].includes(selectedAction) ? (
              <tr key="0">
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  <input
                    ref={nameRef}
                    type="text"
                    className="newLine"
                    placeholder="Adı Soyadı"
                  ></input>
                </td>
                <td>
                  <input
                    ref={mailRef}
                    type="text"
                    className="newLine"
                    placeholder="Mail Adresi"
                  ></input>
                </td>
                <td>
                  <input
                    ref={numberRef}
                    type="text"
                    className="newLine"
                    placeholder="Telefon Numarası"
                  ></input>
                </td>
                <td>
                  <input
                    ref={roleRef}
                    type="text"
                    className="newLine"
                    placeholder="Görevi"
                  ></input>
                </td>
              </tr>
            ) : (
              ""
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5">
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
                        <option value={1}>🗑️ Kullanıcı Kaldır</option>
                        <option value={2}>➕ Kullanıcı Ekle</option>
                        <option value={3}>🔄 Kullanıcı Güncelle</option>
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

export default ContactTable;

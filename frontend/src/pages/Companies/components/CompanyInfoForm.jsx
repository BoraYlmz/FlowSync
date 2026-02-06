import { useEffect, useState } from "react";
import { useCompanies } from "../../../context/CompanyContext";
import { toast } from "react-toastify";

import { API_BASE } from "../../../components/config";
import LoadingSpinner from "../../../components/LoadingSpinner";
import "../styles/CompanyInfoForm.css";

import { createCompany, updateCompany } from "../../../services/companyService";

const CompanyInfoForm = () => {
  const { closeSidebar, setCompanies, selectedCompany, isSidebarOpen } =
    useCompanies();
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      setCompanyInfo([]);
      if (!selectedCompany) return;
      setLoadingDetails(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/companies/info/${selectedCompany._id}`,
          { credentials: "include" }
        );
        const json = await response.json();
        if (json.state) {
          setCompanyInfo(json.data);
        }
      } catch (err) {
        toast.error("Şirket bilgileri çekilirken hata meydana geldi.");
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (isSidebarOpen) {
      fetchDetails();
    }
  }, [selectedCompany, isSidebarOpen]);

  const updateCompanyFunc = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const number = e.target.number.value;
    const address = e.target.address.value;

    if (name.trim() === "") {
      toast.error("Şirket Adı Boş olamaz");
      return;
    }
    try {
      const resp = await updateCompany(
        selectedCompany._id,
        name,
        number,
        address
      );
      if (resp.state) {
        const newCompanyInfo = {
          _id: selectedCompany._id,
          companyName: name,
          companyNumber: number,
          companyAddress: address,
        };
        setCompanies((prev) =>
          prev.map((frm) =>
            frm._id === selectedCompany._id
              ? { ...frm, ...newCompanyInfo }
              : frm
          )
        );
        toast.success("Kayıt Başarı İle güncellendi");
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
  };

  const newCompany = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const number = e.target.number.value;
    const address = e.target.address.value;

    if (name.trim() === "") {
      toast.error("Şirket Adı Boş olamaz");
      return;
    }
    try {
      const resp = await createCompany(name, number, address);
      if (resp.state) {
        const newCompanyInfo = {
          _id: resp.Id,
          companyName: name,
          companyNumber: number,
          companyAddress: address,
        };
        setCompanies((prev) => [...prev, newCompanyInfo]);
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
  };

  return loadingDetails ? (
    <LoadingSpinner />
  ) : (
    <>
      <h2>{selectedCompany ? "Firma Güncelle" : "Yeni Firma Ekle"}</h2>
      <div className="content-placeholder">
        <form onSubmit={selectedCompany ? updateCompanyFunc : newCompany}>
          <div className="newForm">
            <div className="input-group">
              <input
                type="text"
                name="name"
                id="name"
                value={companyInfo.CompanyName || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    CompanyName: e.target.value,
                  })
                }
                placeholder=" "
                required
              />
              <label htmlFor="name">Şirket Adı</label>
              <div className="underline"></div>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="number"
                id="number"
                placeholder=" "
                value={companyInfo.CompanyNumber || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    CompanyNumber: e.target.value,
                  })
                }
              />
              <label htmlFor="number">Şirket Numarası</label>
              <div className="underline"></div>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                id="address"
                placeholder=" "
                value={companyInfo.CompanyAddress || ""}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    CompanyAddress: e.target.value,
                  })
                }
              />
              <label htmlFor="address">Şirket Adresi</label>
              <div className="underline"></div>
            </div>
            <button type="submit">
              {selectedCompany ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CompanyInfoForm;

import { useEffect } from "react";
import { useCompanies } from "../../context/CompanyContext";
import { API_BASE } from "../../components/config";
import { toast } from "react-toastify";
import CompanyCard from "./components/CompanyCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import CompanyDetailSidebar from "./components/CompanyDetailSidebar";

import "./styles/CompanyList.css";





const CompanyList = () => {
  const { companies, setCompanies, loading, setLoading,openSidebar } =
    useCompanies();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/companies/list`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.state) {
          setCompanies(json.data);
        }
      } catch (err) {
        toast.error("Firmalar yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [setCompanies, setLoading]);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="companies">
      <div className="header">
        <h1>Firmalar</h1>
        <button className="add-btn" onClick={() => openSidebar()}>
          + Firma Ekle
        </button>
      </div>
      {companies.map((frm) => (
        <CompanyCard key={frm._id} frm={frm} />
      ))}
      <CompanyDetailSidebar />
    </div>
  );
};

export default CompanyList;

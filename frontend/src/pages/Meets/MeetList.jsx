import { useEffect, useState, useMemo } from "react";
import { useMeets } from "../../context/MeetContext";
import { API_BASE } from "../../components/config";
import { toast } from "react-toastify";
// import CompanyCard from "./components/CompanyCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import MeetSideBar from "./components/MeetSideBar";

import "./styles/MeetList.css";
import MeetCard from "./components/MeetCard";
import { ChevronLeft, ChevronRight, Globe, Star } from "lucide-react";

const rowsPerPage = 10;

const MeetList = () => {
  const { meets, setMeets, openSidebar} = useMeets();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [listType, setListType] = useState(true);//kişisel için true tüm liste için false başlangıç ters çalışacağı için false bırakıldı

  const totalPages = Math.ceil(meets.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return meets.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [meets, currentPage]);

    const fetchMeets = async () => {
      setListType(prev => !prev);
      setLoading(true);
      try {
        let res;
        if (listType)
        {
          res = await fetch(`${API_BASE}/api/meets/list`, {
            credentials: "include",
          });
        }
          else{
            res = await fetch(`${API_BASE}/api/meets/allist`, {
            credentials: "include",
          });
          }
        const json = await res.json();
        if (json.state) {
          setMeets(json.data);
        }
        else
        {
          setMeets([])
        }
      } catch (err) {
        setMeets([])
        toast.error("Toplantılar yüklenemedi");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMeets();
  }, []);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="meets">
      <div className="header">
        <h1>Toplantılar</h1>
        <button className="add-btn" onClick={() => openSidebar()}>
          + Toplantı Oluştur
        </button>
      </div>
      <div className="headers">
        <span className="headers-1">Firma Adı</span>
        <span className="headers-2">Toplantı Başlığı</span>
        <span className="headers-3">Toplantı Tarihi</span>
        <span className="headers-4">Katılımcılar</span>
        <span className="headers-5" onClick={() => fetchMeets()}>{listType?<Globe />:<Star />}</span>
      </div>
      {paginatedData.map((meet) => (
        <MeetCard key={meet._id} meet={meet} />
      ))}
      <div className="footer">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </button>
        <span>{currentPage}</span>
        <span>/</span>
        <span>{totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </button>
      </div>
      <MeetSideBar />
    </div>
  );
};

export default MeetList;

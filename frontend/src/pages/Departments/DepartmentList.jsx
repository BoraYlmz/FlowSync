import { useEffect } from "react";
import { useDepartments } from "../../context/DepartmentContext";
import {API_BASE} from "../../components/config";
import { toast } from "react-toastify";
import DepartmentCard from "./components/DepartmentCard";
import DepartmentDetailSidebar from "./components/DepartmentDetailSidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./styles/DepartmentList.css";

const DepartmentList = () => {
  const {
    departments,
    setDepartments,
    loading,
    setLoading,
    openSidebar,
  } = useDepartments();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/departments/list`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.state) {
          setDepartments(json.data);
        }
      } catch (err) {
        toast.error("Departmanlar yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [setDepartments, setLoading]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="departments">
      <div className="departments-Header">
        <h1>Departmanlar</h1>
        <button className="add-btn" onClick={() => openSidebar(null)}>
          + Departman Ekle
        </button>
      </div>

      {departments.map((dept) => (
        <DepartmentCard key={dept._id} dept={dept} />
      ))}

      <DepartmentDetailSidebar />
    </div>
  );
};

export default DepartmentList;

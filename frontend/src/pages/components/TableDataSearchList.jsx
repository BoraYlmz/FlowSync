import { useMemo } from "react";
import "../../App.css";

const TableDataSearchList = ({
  dataList = [],
  searchTerm,
  setSearchTerm,
  selectedDataRow,
  setSelectedDataRow,
  multiSelect = false,
  messageBoxVisible = false,
  messageText="Veri bulunamadı"
}) => {
  const filteredData = useMemo(() => {
    if (!Array.isArray(dataList) || !dataList.length) return [];
    if (!searchTerm.trim()) return dataList;

    const lower = searchTerm.toLowerCase();
    return dataList.filter((data) =>
      Object.keys(data)
        .filter((key) => key !== "_id")
        .some((key) => {
          const value = data[key];
          return value?.toString().toLowerCase().includes(lower);
        })
    );
  }, [dataList, searchTerm]);

  const toggleData = (id) => {
    if (multiSelect){
      setSelectedDataRow((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    } 
    else{
      setSelectedDataRow(id)
    }
  };

  return (
    <div className="SearchBox">
      <input
        type="text"
        className="SearchInput"
        placeholder="Keyword"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredData.length === 0 ? (
        <div className="noDataFound">{messageBoxVisible ? messageText:"Veri bulunamadı"}</div>
      ) : (
        filteredData.map((data) => {
          const avatar = Object.keys(data)
            .filter((key) => key !== "_id")
            .map((key) => data[key]?.toString()[0]?.toUpperCase())
            .slice(0, 2)
            .join("");

          const text = Object.keys(data)
            .filter((key) => key !== "_id")
            .map((key) => data[key])
            .join(" ");

          return (
            <div
              key={data._id}
              className={`dataOption ${
                selectedDataRow.includes(data._id) ? "selected" : ""
              }`}
              onClick={() => toggleData(data._id)}
            >
              <div className="dataAvatar">{avatar}</div>
              <div className="dataText">{text}</div>
              <input
                type="checkbox"
                checked={selectedDataRow.includes(data._id)}
                onChange={() => toggleData(data._id)}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default TableDataSearchList;

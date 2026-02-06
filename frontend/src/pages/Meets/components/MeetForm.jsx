import { useEffect, useState } from "react";
import { useMeets } from "../../../context/MeetContext";
import { toast } from "react-toastify";

import LoadingSpinner from "../../../components/LoadingSpinner";
import Editor from "../../components/Editor";
import "../../../App.css"
import "../styles/MeetForm.css";
import TableDataSearchList from "../../components/TableDataSearchList";
import { userFrmList, getFrmPerson, createMeet, getMeet, getUserDepartmentList, getDepartmentUserList} from "../../../services/meetService";

import DatePicker from "react-datepicker";
import { format } from "date-fns";


const NewMeetForm = () => {
    const { closeSidebar, setMeets, isSidebarOpen,selectedMeet } =
        useMeets();
    const [isloading, setIsLoading] = useState(false);
    const [content, setContent] = useState("");
    const [meetDate, setMeetDate] = useState(null);
    const [meetHeader, setMeetHeader] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditable, setIsEditable] = useState(true);

    const [frmSelectorVisible, setFrmSelectorVisible] = useState(false); // SearchBox gözükme durumu
    const [frmSearchTerm, setFrmSearchTerm] = useState(""); // SearchBox arama terimi
    const [selectedFrmDataRow, setSelectedFrmDataRow] = useState([]); // SearchBox içersinde seçilen verilerin idleri
    const [frmList, setFrmList] = useState([]); // SearchBox içerisindeki veri grubu

    const [frmPersonSelectorVisible, setFrmPersonSelectorVisible] = useState(false); // SearchBox gözükme durumu
    const [frmPersonSearchTerm, setFrmPersonSearchTerm] = useState(""); // SearchBox arama terimi
    const [selectedFrmPersonDataRow, setSelectedFrmPersonDataRow] = useState([]); // SearchBox içersinde seçilen verilerin idleri
    const [frmPersonList, setFrmPersonList] = useState([]); // SearchBox içerisindeki veri grubu

    const [departmentMessageVisible, setDepartmentMessageVisible] = useState(false);

    const [departmentSelectorVisible, setDepartmentSelectorVisible] = useState(false); // SearchBox gözükme durumu
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState(""); // SearchBox arama terimi
    const [selectedDepartmentDataRow, setSelectedDepartmentDataRow] = useState([]); // SearchBox içersinde seçilen verilerin idleri
    const [departmentList, setDepartmentList] = useState([]); // SearchBox içerisindeki veri grubu

    const [userSelectorVisible, setUserSelectorVisible] = useState(false); // SearchBox gözükme durumu
    const [userSearchTerm, setUserSearchTerm] = useState(""); // SearchBox arama terimi
    const [selectedUserDataRow, setSelectedUserDataRow] = useState([]); // SearchBox içersinde seçilen verilerin idleri
    const [userList, setUserList] = useState([]); // SearchBox içerisindeki veri grubu

    const selectedPersonTags = selectedFrmPersonDataRow.map(id =>
        frmPersonList.find(p => p._id === id)
    );

    const selectedUserTags = selectedUserDataRow.map(id =>
        userList.find(p => p._id === id)
    );

    const selectedFrmName = frmList.find(p => p._id === selectedFrmDataRow);

    useEffect(() => {
      const init= async () => {
        setIsLoading(true);
        setMeetDate(null);
        setContent("");
        setMeetHeader("");
        setFrmSearchTerm("");
        setSelectedFrmDataRow([]);
        setFrmSelectorVisible(false);
        setFrmList([]);
        setFrmPersonSelectorVisible(false);
        setFrmPersonSearchTerm("");
        setSelectedFrmPersonDataRow([]);
        setFrmPersonList([]);
        setUserSelectorVisible(false);
        setUserSearchTerm("");
        setSelectedUserDataRow([]);
        setUserList([]);
        setIsLoading(false);
        setIsEditable(true);
        setDepartmentSelectorVisible(false);
        setDepartmentSearchTerm("");
        setSelectedDepartmentDataRow([]);
        setDepartmentList([]);

        if (!selectedMeet) return;

        setIsLoading(true);
        try {
          const response = await getMeet(selectedMeet._id)
          if (response.state) {
            setContent(response.data.content)
            setMeetDate(new Date(response.data.meetDate))
            setMeetHeader(response.data.meetHeader)
            setSelectedFrmDataRow(response.data.frmId)
            setSelectedFrmPersonDataRow(response.data.externalParticipants)
            setSelectedDepartmentDataRow(response.data.deparmentId)
            setSelectedUserDataRow(response.data.internalParticipants)
            setIsEditable(response.data.isEditable)
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }

    };

      init();

        

    
    }, [selectedMeet, isSidebarOpen]);

    const meetUpdate = async () => {}

    const newMeet = async () => {
        if (isSubmitting) return;
        if (!selectedFrmDataRow || selectedFrmDataRow.length ===0) {toast.warning("Lütfen toplantının tarfını seçiniz!"); return;}
        if (!selectedFrmPersonDataRow || selectedFrmPersonDataRow.length ===0) {toast.warning("Lütfen toplantının tarfını seçiniz!"); return;}
        if (!selectedDepartmentDataRow || selectedDepartmentDataRow.length ===0) {toast.warning("Lütfen toplantının hangi depatmana ait olduğunu seçiniz!"); return;}
        if (!meetHeader?.trim()) {toast.warning("Lütfen toplantının başlığını giriniz!"); return;}
        if (!meetDate) {toast.warning("Lütfen toplantının gerçeleşeceği tarihi giriniz!"); return;}

        try{
            setIsSubmitting(true);
            const formatMeetDate = format(meetDate, "dd.MM.yyyy HH:mm")
            const resp = await createMeet(selectedFrmDataRow, selectedFrmPersonDataRow, selectedDepartmentDataRow, selectedUserDataRow, meetHeader, meetDate, content);
            if (resp.state) {
                const newMeetInfo = {
                  _id: resp.Id,
                  meetHeader: meetHeader,
                  frmName: selectedFrmName.name,
                  externalParticipantsCount: selectedFrmPersonDataRow.length,
                  internalParticipantsCount: selectedUserDataRow.length+1,
                  meetDate:formatMeetDate
                };
                setMeets((prev) => [...prev, newMeetInfo]);
                toast.success("Kayıt Başarı İle eklendi");
                closeSidebar();
            }
            else{
                toast.error(resp.msg);
            }
        }catch (err){
            toast.error("HATA:" + err);
            console.error("HATA:", err);
        }finally{
            setIsSubmitting(false);
        }
        
    };

    useEffect(() => {
        // Burası firma seçildikten sonra seçilen firmanın kişiler listesini çeker ve departman listesini sıfırlar.
        if (!selectedFrmDataRow || selectedFrmDataRow.length === 0) return;
        if (typeof selectedFrmDataRow !== "string") return;

        const fetchPersons = async () => {
            setUserList([]);
            setDepartmentList([]);
            setSelectedDepartmentDataRow([]);
            setSelectedUserDataRow([]);
            const resp = await getFrmPerson(selectedFrmDataRow);

            if (resp.state) {
                setFrmPersonList(resp.data);
                setFrmPersonSelectorVisible(true);
            } else {
                toast.error(resp.msg);
                setFrmPersonList([]);
                setFrmPersonSelectorVisible(false);
            }
        };

        fetchPersons();
    }, [selectedFrmDataRow]);

    const toggleFrmSelector = async () => {
        // burası firma seçiciyi açar kapatır. her açıldığında güncel listesi çeker.
        if (frmSelectorVisible) {
            setFrmSelectorVisible(false);
        } else {
            setDepartmentSelectorVisible(false);
            setFrmSearchTerm("");
            const resp = await userFrmList();
            if (resp.state) {
                setFrmList(resp.data);
                setFrmSelectorVisible(true);
            } else {
                toast.error(resp.msg);
            }
        }
    };

    const toggleUserSelector = async () => {
        // burası departman seçiciyi açar kapatır . seçilen firmanya tanımlı departmanları çeker
        if(departmentSelectorVisible){
            setDepartmentSelectorVisible(false);
        }
        else{
            setFrmSelectorVisible(false);
            setDepartmentMessageVisible(false);
            setDepartmentSearchTerm("");
            if (!selectedFrmDataRow || selectedFrmDataRow.length === 0){
                setDepartmentMessageVisible(true);
                setDepartmentSelectorVisible(true);
                return;
            }  
            if (typeof selectedFrmDataRow !== "string"){
                setDepartmentMessageVisible(true);
                setDepartmentSelectorVisible(true);
                return;
            } 
            const resp = await getUserDepartmentList(selectedFrmDataRow);
            if (resp.state){
                setDepartmentList(resp.data);
                setDepartmentSelectorVisible(true);
            }
            else{
                toast.error(resp.msg);
            }
        }
    };

    useEffect(() => {
        // Burası seçilen departmana ait aktif kullanıcı listesini çeker
        if (!selectedDepartmentDataRow || selectedDepartmentDataRow.length === 0) return;
        if (typeof selectedDepartmentDataRow !== "string") return;

        const fetchUsers = async () => {
            const resp = await getDepartmentUserList(selectedDepartmentDataRow);

            if (resp.state) {
                setUserList(resp.data);
                setUserSelectorVisible(true);
            } else {
                toast.error(resp.msg);
                setUserList([]);
                setUserSelectorVisible(false);
            }
        };

        fetchUsers();
    }, [selectedDepartmentDataRow]);

    return isloading ? (
        <LoadingSpinner />
    ) : (
        <>
            <h2>{selectedMeet ? "Toplantı Detayı" : "Toplantı Oluştur"}</h2>
            <div className="content-placeholder">
                <div className="input-group">
                    <button onClick={isEditable?toggleFrmSelector:undefined}>To</button>
                    <div className="tag-input" >
                        {selectedPersonTags.map(person => (
                            person && (
                                <div className="tag" key={person._id}>
                                    {person.name}
                                    {isEditable?<span
                                        className="remove-tag"
                                        onClick={(e) => {
                                            // e.stopPropagation();
                                            setSelectedFrmPersonDataRow(prev =>
                                                prev.filter(id => id !== person._id)
                                            );
                                        }}
                                    >
                                        ×
                                    </span>:<span />}
                                    
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {frmSelectorVisible && (
                    <div className="table-wrapper" style={{ maxWidth: "350px", maxHeight: "0" }}><div className="appendTableContainer" style={{ top: "-60px" }}>
                        <TableDataSearchList
                            dataList={frmList}
                            searchTerm={frmSearchTerm}
                            setSearchTerm={setFrmSearchTerm}
                            selectedDataRow={selectedFrmDataRow}
                            setSelectedDataRow={setSelectedFrmDataRow}
                            multiSelect={false}
                        /></div></div>
                )}
                {frmSelectorVisible && frmPersonSelectorVisible && (
                    <div className="table-wrapper" style={{ maxWidth: "610px", maxHeight: "0" }}><div className="appendTableContainer" style={{ top: "-60px" }}>
                        <TableDataSearchList
                            dataList={frmPersonList}
                            searchTerm={frmPersonSearchTerm}
                            setSearchTerm={setFrmPersonSearchTerm}
                            selectedDataRow={selectedFrmPersonDataRow}
                            setSelectedDataRow={setSelectedFrmPersonDataRow}
                            multiSelect={true}
                        /></div></div>
                )}
                <div className="input-group">
                    <button onClick={isEditable?toggleUserSelector:undefined}>CC</button>
                    <div className="tag-input" >
                        {selectedUserTags.map(user => (
                            user && (
                                <div className="tag" key={user._id}>
                                    {user.name}
                                    {isEditable ?
                                     <span
                                        className="remove-tag"
                                        onClick={(e) => {
                                            // e.stopPropagation();
                                            setSelectedUserDataRow(prev =>
                                                prev.filter(id => id !== user._id)
                                            );
                                        }}
                                    >
                                        ×
                                    </span>:<span />    
                                }
                                   
                                </div>
                            )
                        ))}


                    </div>
                </div>
                {departmentSelectorVisible && (
                    <div className="table-wrapper" style={{ maxWidth: "350px", maxHeight: "0" }}><div className="appendTableContainer" style={{ top: "-60px" }}>
                        <TableDataSearchList
                            dataList={departmentList}
                            searchTerm={departmentSearchTerm}
                            setSearchTerm={setDepartmentSearchTerm}
                            selectedDataRow={selectedDepartmentDataRow}
                            setSelectedDataRow={setSelectedDepartmentDataRow}
                            multiSelect={false}
                            messageBoxVisible={departmentMessageVisible}
                            messageText={"Önce Firma Seçiniz!"}
                        /></div></div>
                )}
                {departmentSelectorVisible && userSelectorVisible && (
                    <div className="table-wrapper" style={{ maxWidth: "610px", maxHeight: "0" }}><div className="appendTableContainer" style={{ top: "-60px" }}>
                        <TableDataSearchList
                            dataList={userList}
                            searchTerm={userSearchTerm}
                            setSearchTerm={setUserSearchTerm}
                            selectedDataRow={selectedUserDataRow}
                            setSelectedDataRow={setSelectedUserDataRow}
                            multiSelect={true}
                        /></div></div>
                )}
                <div className="input-group">
                    <input type="text" placeholder="Konu" value={meetHeader} onChange={(e) => setMeetHeader(e.target.value)} disabled={!isEditable}/>
                        <div className="react-datepicker-wrapper">
                        <DatePicker
                            selected={meetDate}
                            onChange={setMeetDate}
                            dateFormat="dd.MM.yyyy HH:mm"
                            placeholderText="Toplantı Tarihi"
                            showMonthDropdown
                            showYearDropdown
                            showTimeSelect
                            timeIntervals={15}
                            dropdownMode="select"
                            required
                            disabled={!isEditable}
                            id="selectMeetDate"
                        />
                        </div>

                </div>
                <Editor value={content} onChange={setContent} canEdit={isEditable} /> 
                <button type="submit" className="add-btn" onClick={selectedMeet ? meetUpdate : newMeet}>
                    {selectedMeet? "Güncelle": "Ekle"}
                </button>
            </div>
        </>
    );
};

export default NewMeetForm;

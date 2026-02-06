import { useMemo } from "react";
import "../styles/UserSearchList.css";

const UserSearchList = ({
  users = [],
  searchTerm,
  setSearchTerm,
  selectedUsers,
  setSelectedUsers,
  isDetailView,
}) => {
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users) || !users.length) return [];
    if (!searchTerm.trim()) return users;

    const lower = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lower) ||
        u.surname?.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="userSearchBox">
      <input
        type="text"
        className="userSearchInput"
        placeholder="Kullanıcı adı veya soyadı girin..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredUsers.length === 0 ? (
        <div className="noUserFound">Kullanıcı bulunamadı</div>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`userOption ${
              selectedUsers.includes(user._id) ? "selected" : ""
            }`}
            onClick={() => isDetailView ? toggleUser(user._id):setSelectedUsers(user._id)}
          >
            <div className="userAvatar">
              {user.name[0]?.toUpperCase()}
              {user.surname[0]?.toUpperCase()}
            </div>
            <div className="userName">
              {user.name} {user.surname}
            </div>
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={() => isDetailView ? toggleUser(user._id):setSelectedUsers(user._id)}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default UserSearchList;

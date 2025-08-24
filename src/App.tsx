import React, { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
}

interface UserDetails {
  id: number;
  name: string;
  avatar: string;
  details: {
    city: string;
    company: string;
    position: string;
  };
}

interface DetailsProps {
  info: User | null;
}

const List: React.FC<{
  users: User[];
  onSelect: (user: User) => void;
  selectedId: number | null;
}> = ({ users, onSelect, selectedId }) => {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {users.map((user) => (
        <li
          key={user.id}
          onClick={() => onSelect(user)}
          style={{
            cursor: "pointer",
            backgroundColor: selectedId === user.id ? "#ddd" : "transparent",
            padding: "5px 10px",
            marginBottom: 2,
          }}
        >
          {user.name}
        </li>
      ))}
    </ul>
  );
};

const Details: React.FC<DetailsProps> = ({ info }) => {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailsCache = React.useRef<Map<number, UserDetails>>(new Map());

  useEffect(() => {
    if (!info) {
      setDetails(null);
      setError(null);
      return;
    }

    if (detailsCache.current.has(info.id)) {
      setDetails(detailsCache.current.get(info.id)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(
      `https://raw.githubusercontent.com/netology-code/ra16-homeworks/master/hooks-context/use-effect/data/${info.id}.json`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: UserDetails) => {
        detailsCache.current.set(info.id, data);
        setDetails(data);
      })
      .catch(() => setError("Ошибка загрузки данных"))
      .finally(() => setLoading(false));
  }, [info]);

  if (!info) return <div>Выберите пользователя</div>;
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!details) return null;

  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #ccc",
        marginLeft: 20,
        minWidth: 200,
      }}
    >
      <img
        src={details.avatar}
        alt={details.name}
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 10,
        }}
      />
      <h3>{details.name}</h3>
      <p>City: {details.details.city}</p>
      <p>Company: {details.details.company}</p>
      <p>Position: {details.details.position}</p>
    </div>
  );
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/netology-code/ra16-homeworks/master/hooks-context/use-effect/data/users.json"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки списка");
        return res.json();
      })
      .then((data: User[]) => {
        setUsers(data);
        setErrorUsers(null);
      })
      .catch(() => setErrorUsers("Ошибка загрузки списка"))
      .finally(() => setLoadingUsers(false));
  }, []);

  if (loadingUsers) return <p>Загрузка списка...</p>;
  if (errorUsers) return <p style={{ color: "red" }}>{errorUsers}</p>;

  return (
    <div style={{ display: "flex", maxWidth: 600 }}>
      <List
        users={users}
        onSelect={setSelectedUser}
        selectedId={selectedUser?.id ?? null}
      />
      <Details info={selectedUser} />
    </div>
  );
}

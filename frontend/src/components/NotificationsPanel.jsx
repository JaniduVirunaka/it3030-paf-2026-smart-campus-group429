import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';

export default function NotificationsPanel({ userId }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getNotifications(userId);
      setNotes(res.data);
    };
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotes((n) => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notes.map(n => (
          <li key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
            {n.message}
            {!n.read && <button onClick={() => handleRead(n.id)}>Mark read</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

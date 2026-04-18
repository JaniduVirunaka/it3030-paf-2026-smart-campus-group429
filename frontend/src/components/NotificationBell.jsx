import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { getNotifications, markNotificationRead } from '../services/api';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell({ userId }) {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef(null);

  const unreadCount = notes.filter(n => !n.read).length;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications(userId);
        setNotes(res.data);
      } catch (_) {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setSelected(prev => (prev?.id === id ? { ...prev, read: true } : prev));
    } catch (_) {}
  };

  // Open detail modal — no auto-mark so the button works as expected
  const handleSelect = (notif) => {
    setSelected(notif);
    setOpen(false);
  };

  const modal = selected && createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setSelected(null)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider">
              {selected.type}
            </span>
            {selected.read
              ? <span className="text-xs text-slate-400">Read</span>
              : <span className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />Unread
                </span>
            }
          </div>
          <button
            onClick={() => setSelected(null)}
            className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <p className="text-slate-800 dark:text-white text-base leading-relaxed mb-4">
          {selected.message}
        </p>

        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          {new Date(selected.createdAt).toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {!selected.read && (
            <button
              onClick={() => handleMarkRead(selected.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={() => setSelected(null)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-800 dark:text-white text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {notes.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notes.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="mt-2 flex-shrink-0 w-2 h-2 rounded-full" style={{ background: n.read ? 'transparent' : '#3b82f6' }} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug line-clamp-2 ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {modal}
    </div>
  );
}

NotificationBell.propTypes = {
  userId: PropTypes.string.isRequired,
};

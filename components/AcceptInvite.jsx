"use client";

import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { LobbyDataContext } from "@/context/LobbyContext";
import { UserDataContext } from "@/context/UserContext";
import { X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FRIENDS_EVENT,
  acceptFriendRequest,
  denyFriendRequest,
  errorMessage,
} from "@/lib/friendActions";

const DURATION = 30_000;
const SEEN_KEY = "seenLobbyInvites";

export default function AcceptInvite() {
  const { socket } = useContext(LobbyDataContext);
  const { user } = useContext(UserDataContext);
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);

  const audioRef = useRef(null);
  const timersRef = useRef(new Map());
  // toast id -> dedupe key ("lobby:<id>" ya "friend:<email>")
  const keyOfRef = useRef(new Map());
  const counter = useRef(0);

  // Notification sound setup
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      audioRef.current = null;
    };
  }, []);

  // Clear all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    const keys = keyOfRef.current;
    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer.autoClose);
        cancelAnimationFrame(timer.raf1);
        cancelAnimationFrame(timer.raf2);
      });
      timers.clear();
      keys.clear();
    };
  }, []);

  const update = useCallback((id, patch) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
    );
  }, []);

  // Sirf toast band karta hai. Friend request dashboard me pending rehti hai.
  const handleClose = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer.autoClose);
      cancelAnimationFrame(timer.raf1);
      cancelAnimationFrame(timer.raf2);
    }
    timersRef.current.delete(id);
    keyOfRef.current.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const push = useCallback(
    (data) => {
      const key =
        data.type === "lobby" ? `lobby:${data.lobbyId}` : `friend:${data.email}`;

      // Duplicate toast mat dikhao
      if ([...keyOfRef.current.values()].includes(key)) return;

      const id = `${Date.now()}-${counter.current++}`;
      keyOfRef.current.set(id, key);

      setNotifications((prev) => [
        ...prev,
        { id, running: false, busy: false, error: null, ...data },
      ]);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          update(id, { running: true });
        });
        const timer = timersRef.current.get(id);
        if (timer) timer.raf2 = raf2;
      });

      const autoClose = setTimeout(() => handleClose(id), DURATION);
      timersRef.current.set(id, { autoClose, raf1, raf2: null });
    },
    [handleClose, update]
  );

  // Socket events (real-time)
  useEffect(() => {
    if (!socket) return;

    const onFriendRequest = (email) => push({ type: "friend", email });
    const onLobbyInvite = (invite) =>
      push({
        type: "lobby",
        lobbyId: invite.id,
        title: invite.title,
        from: invite.from,
      });

    socket.on("addFriendRequestReceived", onFriendRequest);
    socket.on("invite:received", onLobbyInvite);

    return () => {
      socket.off("addFriendRequestReceived", onFriendRequest);
      socket.off("invite:received", onLobbyInvite);
    };
  }, [socket, push]);

  // Dashboard se accept/deny hua to us friend ka toast hata do
  useEffect(() => {
    const onChanged = (e) => {
      const email = e.detail?.email;
      if (!email) return;
      [...keyOfRef.current.entries()].forEach(([id, key]) => {
        if (key === `friend:${email}`) handleClose(id);
      });
    };
    window.addEventListener(FRIENDS_EVENT, onChanged);
    return () => window.removeEventListener(FRIENDS_EVENT, onChanged);
  }, [handleClose]);

  // Pending lobby invitations
  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    axios
      .get("/api/playground/mine")
      .then(({ data }) => {
        if (cancelled) return;

        let seen = [];
        try {
          seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]");
        } catch {}

        (data.invites ?? []).forEach((invite) => {
          if (seen.includes(invite.id)) return;
          seen.push(invite.id);
          push({
            type: "lobby",
            lobbyId: invite.id,
            title: invite.title,
            from: invite.from,
          });
        });

        try {
          sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
        } catch {}
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?._id, push]);

  const handleAccept = async (n) => {
    update(n.id, { busy: true, error: null });

    try {
      if (n.type === "friend") {
        await acceptFriendRequest(n.email, socket);
        handleClose(n.id);
        return;
      }

      await axios.post(`/api/playground/${n.lobbyId}/respond`, { accept: true });
      handleClose(n.id);
      router.push(`/party/${n.lobbyId}`);
    } catch (error) {
      update(n.id, {
        busy: false,
        error: errorMessage(
          error,
          n.type === "friend" ? "Couldn't accept this request." : "Couldn't join this lobby."
        ),
      });
    }
  };

  const handleDeny = async (n) => {
    update(n.id, { busy: true, error: null });

    try {
      if (n.type === "friend") {
        await denyFriendRequest(n.email);
      } else {
        await axios.post(`/api/playground/${n.lobbyId}/respond`, { accept: false });
      }
      handleClose(n.id);
    } catch (error) {
      update(n.id, {
        busy: false,
        error: errorMessage(error, "Couldn't process your request."),
      });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          role="alert"
          className="relative w-[320px] bg-black text-white border rounded-xl shadow-lg p-4"
        >
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            onClick={() => handleClose(n.id)}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>

          <h2 className="text-lg font-semibold">
            {n.type === "lobby" ? "Playground Invitation" : "Friend Request"}
          </h2>

          <p className="text-gray-300 break-words">
            {n.type === "lobby"
              ? `${n.from} invited you to "${n.title}"`
              : `${n.email} wants to be your friend`}
          </p>

          {n.error && <p className="mt-2 text-sm text-red-400">{n.error}</p>}

          <div className="flex gap-x-2 mt-3">
            <button
              onClick={() => handleDeny(n)}
              disabled={n.busy}
              className="bg-slate-200 text-black px-3 py-1 rounded disabled:opacity-50"
            >
              Deny
            </button>

            <button
              onClick={() => handleAccept(n)}
              disabled={n.busy}
              className="bg-green-600 px-3 py-1 rounded disabled:opacity-50"
            >
              {n.busy ? (n.type === "friend" ? "Adding..." : "Joining...") : "Accept"}
            </button>
          </div>

          {/* 30-second decreasing progress bar */}
          <div className="w-full h-1 bg-gray-700 mt-3 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 rounded"
              style={{
                width: n.running ? "0%" : "100%",
                transition: n.running ? `width ${DURATION}ms linear` : "none",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// "use client";
// import { useState, useEffect, useContext } from "react";
// import { LobbyDataContext } from "@/context/LobbyContext";
// import { X } from "lucide-react"; // icon library (npm install lucide-react)

// export default function AcceptInvite() {
//   const { socket } = useContext(LobbyDataContext);
//   const [open, setOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [progress, setProgress] = useState(100);
//   const DURATION = 7000; // 7 seconds

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("addFriendRequestReceived", (email) => {
//       setEmail(email);
//       setOpen(true);
//       setProgress(100);

//       // Animate progress bar
//       let start = Date.now();
//       const interval = setInterval(() => {
//         let elapsed = Date.now() - start;
//         let percent = Math.max(0, 100 - (elapsed / DURATION) * 100);
//         setProgress(percent);

//         if (percent <= 0) {
//           clearInterval(interval);
//           setOpen(false);
//         }
//       }, 100);

//       return () => clearInterval(interval);
//     });
//   }, [socket]);

//   const handleClose = () => {
//     setOpen(false);
//     setProgress(0);
//   };

//   return (
//     <div
//       className={`fixed bottom-5 z-50 right-5 w-[320px] bg-black text-white border rounded-xl shadow-lg p-4 
//         transform transition-all duration-500 ease-in-out
//         ${open ? "translate-x-0 opacity-100" : "translate-x-96 opacity-0"}
//       `}
//     >
//       {/* Close Button */}
//       <button
//         className="absolute top-2 right-2 text-gray-400 hover:text-white"
//         onClick={handleClose}
//       >
//         <X size={18} />
//       </button>

//       {/* Content */}
//       <h2 className="text-lg font-semibold">Friend Request</h2>
//       <p className="text-gray-300">{email || "test@test.com"}</p>

//       <div className="flex gap-x-2 mt-3">
//         <button className="bg-slate-200 text-black px-3 py-1 rounded">
//           Cancel
//         </button>
//         <button className="bg-green-600 px-3 py-1 rounded">Accept</button>
//       </div>

//       {/* Progress Bar */}
//       <div className="w-full h-1 bg-gray-700 mt-3 rounded overflow-hidden">
//         <div
//           className="h-1 bg-green-500 transition-all duration-100 linear"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { LobbyDataContext } from "@/context/LobbyContext";
import { UserDataContext } from "@/context/UserContext";
import { X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AcceptInvite() {
  const { socket } = useContext(LobbyDataContext);
  const {user} = useContext(UserDataContext);
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [isLobbyInvite, setIsLobbyInvite] = useState(false);
  const [lobbyId, setLobbyId] = useState('');
  const DURATION = 7000; // 7 seconds

  // 🔊 Keep one audio object and unlock it after first click
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    // Unlock audio on first click
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
    };
  }, []);

      const handleAccept = async (senderEmail) => {
        if(!isLobbyInvite){
          const data = {
              senderEmail: senderEmail,
              receiverEmail: user.email
          }
          const response = await axios.post('api/acceptrequest', data);
          console.log(response.data);
        }
        else{
          socket.emit('accept-invite', {
            lobbyId: lobbyId,
            id: user._id
          }, (response) => {
            if (response.success) {
              router.push(`/lobby/${response.lobbyId}`);
            }
          });
        }
      }


      const handleDeny = async(senderEmail) => {
        if(!isLobbyInvite){
          try{
              const response = await axios.put('/api/denyrequest', {senderEmail: senderEmail}, {withCredentials:true});
              if(response.status == 200){
                  console.log(response.data);
                  getFriends();
                  // getnotifications();
              }
          }catch(error){
              console.log(error);
          }
        }
    }

  useEffect(() => {
    if (!socket) return;

    socket.on("addFriendRequestReceived", (email) => {
      const id = Date.now();
      const newNotification = { id, email };

      setNotifications((prev) => [...prev, newNotification]);
      setProgressMap((prev) => ({ ...prev, [id]: 100 }));

      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Progress countdown
      let start = Date.now();
      const interval = setInterval(() => {
        let elapsed = Date.now() - start;
        let percent = Math.max(0, 100 - (elapsed / DURATION) * 100);
        setProgressMap((prev) => ({ ...prev, [id]: percent }));

        if (percent <= 0) {
          clearInterval(interval);
          handleClose(id);
        }
      }, 100);
    });

    const handleInvite = (data) => {
      setIsLobbyInvite(true);
      setLobbyId(data.lobbyId);
      const id = Date.now();
      const newNotification = { id, email: data.inviterEmail };

      setNotifications((prev) => [...prev, newNotification]);
      setProgressMap((prev) => ({ ...prev, [id]: 100 }));

      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Progress countdown
      let start = Date.now();
      const interval = setInterval(() => {
        let elapsed = Date.now() - start;
        let percent = Math.max(0, 100 - (elapsed / DURATION) * 100);
        setProgressMap((prev) => ({ ...prev, [id]: percent }));

        if (percent <= 0) {
          clearInterval(interval);
          handleClose(id);
        }
      }, 100);



        // console.log("received invite", data);
        // if (confirm(`${data.inviterEmail} invited you to a lobby`)) {
        //   socket.emit('accept-invite', {
        //     lobbyId: data.lobbyId,
        //     id: user._id
        //   }, (response) => {
        //     if (response.success) {
        //       router.push(`/lobby/${response.lobbyId}`);
        //     }
        //   });
        // }
      };

      socket.on('receive-invite', handleInvite);

  }, [socket]);

  const handleClose = (id) => {
    setIsLobbyInvite(false);
    setLobbyId('');
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setProgressMap((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`relative w-[320px] bg-black text-white border rounded-xl shadow-lg p-4
            transform transition-all duration-500 ease-in-out
            translate-x-0 opacity-100
          `}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            onClick={() => handleClose(n.id)}
          >
            <X size={18} />
          </button>

          {/* Content */}
          <h2 className="text-lg font-semibold">{isLobbyInvite ? 'Playground Invitation' : 'Friend Request'}</h2>
          <p className="text-gray-300">{isLobbyInvite ? `${n.email} invited you to a playground` : `${n.email}`}</p>

          <div className="flex gap-x-2 mt-3">
            <button onClick={() => {handleDeny(n.email); handleClose(n.id)}} className="bg-slate-200 text-black px-3 py-1 rounded">
              Cancel
            </button>
            <button onClick={()=> {handleAccept(n.email); handleClose(n.id)}} className="bg-green-600 px-3 py-1 rounded">Accept</button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 mt-3 rounded overflow-hidden">
            <div
              className="h-1 bg-green-500 transition-all duration-100 linear"
              style={{ width: `${progressMap[n.id] || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


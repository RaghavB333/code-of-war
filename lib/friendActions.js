import axios from 'axios';

export const FRIENDS_EVENT = 'friends:changed';

const announce = (email) =>
  window.dispatchEvent(new CustomEvent(FRIENDS_EVENT, { detail: { email } }));

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

export async function acceptFriendRequest(senderEmail, socket) {
  await axios.post('/api/acceptrequest', { senderEmail }, { withCredentials: true });
  socket?.emit('friend-accepted-notify', { senderEmail });
  announce(senderEmail);
}

export async function denyFriendRequest(senderEmail) {
  await axios.put('/api/denyrequest', { senderEmail }, { withCredentials: true });
  announce(senderEmail);
}

export function sendFriendRequest(socket, email, friendemail) {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      return resolve({ ok: false, message: 'Not connected right now. Please try again in a moment.' });
    }
    socket.timeout(8000).emit('add-friend', { data: { email, friendemail } }, (err, res) => {
      resolve(err || !res ? { ok: false, message: 'The server took too long. Please try again.' } : res);
    });
  });
}
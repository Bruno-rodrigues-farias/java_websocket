import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:9092";

export const socket = io(socketUrl, {
  transports: ["websocket"],
});

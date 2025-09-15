// lib/socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"], // force websocket for reliability
      withCredentials: true,
    });

    socket.on("connect", () => {
    //  console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
     // console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connect error:", err.message);
    });
  }
  return socket;
};

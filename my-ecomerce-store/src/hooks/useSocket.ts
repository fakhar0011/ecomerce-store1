import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }
    if (socketRef.current && socketRef.current.connected) return;

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current.on("connect", () => {
      // console.log("✅ Frontend socket connected");
      setIsConnected(true);
    });
    socketRef.current.on("disconnect", () => {
      // console.log("❌ Frontend socket disconnected");
      setIsConnected(false);
    });
    socketRef.current.on("connect_error", (err: Error) => {
      // ✅ type added
      console.error("Socket connection error:", err.message);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [localStorage.getItem("token")]);

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };
  const off = (event: string, callback?: any) => {
    socketRef.current?.off(event, callback);
  };
  return { isConnected, on, off };
};

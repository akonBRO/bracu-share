import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth(); // Get user status

  useEffect(() => {
    if (user) {
      // If user is logged in, create the socket connection
      // We must pass 'withCredentials' to send our cookies
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });
      setSocket(newSocket);

      // Clean up the connection when the component unmounts
      return () => newSocket.close();
    } else {
      // If user logs out, disconnect socket
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); // Re-run this effect when user logs in or out

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
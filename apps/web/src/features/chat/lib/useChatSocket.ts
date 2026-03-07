import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  user: {
    id: string | null;
    name: string;
  };
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
}

interface UseChatSocketOptions {
  isOpen: boolean;
  username: string;
}

export function useChatSocket({ isOpen, username }: UseChatSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_room', { room: 'general', username });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_count', (count: number) => {
      setOnlineUsers(count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isOpen, username]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !socket || !isConnected) return;

      socket.emit('send_message', {
        room: 'general',
        username,
        content: content.trim(),
      });
    },
    [socket, isConnected, username]
  );

  return { messages, isConnected, onlineUsers, sendMessage };
}

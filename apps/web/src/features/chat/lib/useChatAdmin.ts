import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/api/api-client';

export interface AdminChatMessage {
  id: string;
  sessionId: string;
  username: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
  timestamp: string;
}

interface PageResponse {
  content: AdminChatMessage[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function useChatAdmin() {
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<PageResponse>(
        `/admin/chat/messages?page=${pageNum}&size=50`
      );
      setMessages(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(0);
    const interval = setInterval(() => fetchMessages(page), 30000);
    return () => clearInterval(interval);
  }, [fetchMessages, page]);

  return {
    messages,
    page,
    totalPages,
    totalElements,
    isLoading,
    fetchPage: fetchMessages,
  };
}

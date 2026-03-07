'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message, Conversation } from '@/lib/types/domain';

export function useRealtimeMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    const sb = createClient();
    setIsLoading(true);
    sb.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as Message[]); setIsLoading(false); });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const sb = createClient();
    const channel = sb.channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (p) => setMessages(prev => [...prev, p.new as Message]))
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [conversationId]);

  return { messages, isLoading };
}

export function useRealtimeConversations(orgId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    const sb = createClient();
    sb.from('conversations').select('*').eq('org_id', orgId).eq('is_active', true).order('last_message_at', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setConversations(data as Conversation[]); setIsLoading(false); });
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    const sb = createClient();
    const channel = sb.channel(`conversations:${orgId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `org_id=eq.${orgId}` },
        (p) => {
          if (p.eventType === 'INSERT') setConversations(prev => [p.new as Conversation, ...prev]);
          else if (p.eventType === 'UPDATE') setConversations(prev => prev.map(c => c.id === (p.new as Conversation).id ? p.new as Conversation : c));
        }).subscribe();
    return () => { sb.removeChannel(channel); };
  }, [orgId]);

  return { conversations, isLoading };
}

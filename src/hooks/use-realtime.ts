'use client';
import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Message, Conversation } from '@/lib/types/domain';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;
function getSupabase() {
  if (!browserClient) browserClient = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return browserClient;
}

export function useRealtimeMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    const sb = getSupabase();
    setIsLoading(true);
    sb.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }).then(({ data }) => { if (data) setMessages(data as Message[]); setIsLoading(false); });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const sb = getSupabase();
    const channel = sb.channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (p) => setMessages(prev => [...prev, p.new as Message]))
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
    const sb = getSupabase();
    sb.from('conversations').select('*').eq('org_id', orgId).eq('is_active', true).order('last_message_at', { ascending: false }).limit(50).then(({ data }) => { if (data) setConversations(data as Conversation[]); setIsLoading(false); });
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    const sb = getSupabase();
    const channel = sb.channel(`conversations:${orgId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `org_id=eq.${orgId}` }, (p) => {
        if (p.eventType === 'INSERT') setConversations(prev => [p.new as Conversation, ...prev]);
        else if (p.eventType === 'UPDATE') setConversations(prev => prev.map(c => c.id === (p.new as Conversation).id ? p.new as Conversation : c));
      }).subscribe();
    return () => { sb.removeChannel(channel); };
  }, [orgId]);

  return { conversations, isLoading };
}

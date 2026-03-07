import type { SupabaseClient } from '@supabase/supabase-js';
import type { DomainEventType } from '@/lib/types/domain';
import { tryCatch, type Result } from '@/lib/errors';

export class DomainEventEmitter {
  constructor(private db: SupabaseClient) {}

  async emit(event_type: DomainEventType, aggregate_type: string, aggregate_id: string, payload: Record<string, unknown>, org_id?: string): Promise<Result<{ id: string }>> {
    return tryCatch(async () => {
      const { data, error } = await this.db.from('domain_events').insert({ org_id, event_type, aggregate_type, aggregate_id, payload, status: 'pending' }).select('id').single();
      if (error) throw error;
      return { id: data.id };
    });
  }

  async emitBatch(events: Array<{ event_type: DomainEventType; aggregate_type: string; aggregate_id: string; payload: Record<string, unknown>; org_id?: string }>): Promise<Result<{ ids: string[] }>> {
    return tryCatch(async () => {
      const { data, error } = await this.db.from('domain_events').insert(events.map(e => ({ ...e, status: 'pending' as const }))).select('id');
      if (error) throw error;
      return { ids: (data ?? []).map(d => d.id) };
    });
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, LeadStatus, LeadSource } from '@/lib/types/domain';
import { Ok, type Result, tryCatch } from '@/lib/errors';
import { AppError } from '@/lib/errors';

export interface CreateLeadInput { org_id: string; agent_id?: string; first_name?: string; last_name?: string; email?: string; phone?: string; phone_e164?: string; source: LeadSource; source_metadata?: Record<string, unknown>; tags?: string[]; sms_consent?: boolean; email_consent?: boolean; }
export interface PaginationParams { page: number; per_page: number; sort_by?: string; sort_order?: 'asc' | 'desc'; }
export interface PaginatedResult<T> { data: T[]; total: number; page: number; per_page: number; total_pages: number; }

export class LeadRepository {
  constructor(private db: SupabaseClient) {}

  async findById(id: string): Promise<Result<Lead>> {
    return tryCatch(async () => {
      const { data, error } = await this.db.from('leads').select('*').eq('id', id).single();
      if (error || !data) throw AppError.notFound('Lead', id);
      return data as Lead;
    }, () => AppError.notFound('Lead', id));
  }

  async findByPhone(phone_e164: string, org_id: string): Promise<Result<Lead | null>> {
    return tryCatch(async () => {
      const { data } = await this.db.from('leads').select('*').eq('phone_e164', phone_e164).eq('org_id', org_id).maybeSingle();
      return data as Lead | null;
    });
  }

  async create(input: CreateLeadInput): Promise<Result<Lead>> {
    return tryCatch(async () => {
      const { data, error } = await this.db.from('leads').insert({ ...input, sms_consent_at: input.sms_consent ? new Date().toISOString() : null, email_consent_at: input.email_consent ? new Date().toISOString() : null }).select().single();
      if (error) throw error;
      return data as Lead;
    });
  }

  async list(org_id: string, pagination: PaginationParams = { page: 1, per_page: 25 }): Promise<Result<PaginatedResult<Lead>>> {
    return tryCatch(async () => {
      const { page, per_page, sort_by = 'created_at', sort_order = 'desc' } = pagination;
      const offset = (page - 1) * per_page;
      const { data, error, count } = await this.db.from('leads').select('*', { count: 'exact' }).eq('org_id', org_id).order(sort_by, { ascending: sort_order === 'asc' }).range(offset, offset + per_page - 1);
      if (error) throw error;
      const total = count ?? 0;
      return { data: (data ?? []) as Lead[], total, page, per_page, total_pages: Math.ceil(total / per_page) };
    });
  }
}

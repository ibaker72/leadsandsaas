import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Total leads last 30 days
    const { count: recentLeads } = await admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .gte('created_at', thirtyDaysAgo);

    // Total leads previous 30 days (for change calc)
    const { count: prevLeads } = await admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .gte('created_at', sixtyDaysAgo)
      .lt('created_at', thirtyDaysAgo);

    // All-time leads for total
    const { count: totalLeads } = await admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId);

    // Active conversations
    const { count: activeConvos } = await admin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .eq('is_active', true);

    // Appointments today
    const { count: apptsToday } = await admin
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd);

    // Conversion rate
    const { count: convertedLeads } = await admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ctx.orgId)
      .eq('status', 'converted');

    const convRate = (totalLeads || 0) > 0
      ? Math.round(((convertedLeads || 0) / (totalLeads || 1)) * 1000) / 10
      : 0;

    const leadsChange = (prevLeads || 0) > 0
      ? Math.round(((recentLeads || 0) - (prevLeads || 0)) / (prevLeads || 1) * 1000) / 10
      : (recentLeads || 0) > 0 ? 100 : 0;

    // Pipeline value
    const { data: pipelineEntries } = await admin
      .from('lead_pipeline_entries')
      .select('estimated_value')
      .eq('org_id', ctx.orgId);

    const pipelineValue = (pipelineEntries || []).reduce(
      (sum, e) => sum + (Number(e.estimated_value) || 0), 0
    );

    // Agent performance
    const { data: agents } = await admin
      .from('agents')
      .select('id, name, stats')
      .eq('org_id', ctx.orgId)
      .eq('status', 'active');

    const agentPerformance = (agents || []).map(a => {
      const stats = a.stats as Record<string, unknown> || {};
      return {
        name: a.name as string,
        convos: Number(stats.total_conversations) || 0,
        booked: Number(stats.total_appointments_booked) || 0,
        time: `${Number(stats.avg_response_time_seconds) || 0}s`,
        rate: Number(stats.avg_messages_to_conversion) || 0,
      };
    });

    // Live conversations (most recent 3 active)
    const { data: liveConvos } = await admin
      .from('conversations')
      .select('id, lead_id, agent_id, channel, last_message_at')
      .eq('org_id', ctx.orgId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(3);

    const liveLeadIds = (liveConvos || []).map(c => c.lead_id as string);
    const liveAgentIds = (liveConvos || []).filter(c => c.agent_id).map(c => c.agent_id as string);

    const liveLeadMap = new Map<string, Record<string, unknown>>();
    if (liveLeadIds.length > 0) {
      const { data: ll } = await admin.from('leads').select('id, first_name, last_name').in('id', liveLeadIds);
      (ll || []).forEach(l => liveLeadMap.set(l.id as string, l));
    }
    const liveAgentMap = new Map<string, string>();
    if (liveAgentIds.length > 0) {
      const { data: la } = await admin.from('agents').select('id, name').in('id', liveAgentIds);
      (la || []).forEach(a => liveAgentMap.set(a.id as string, a.name as string));
    }

    const liveConversations = (liveConvos || []).map(c => {
      const lead = liveLeadMap.get(c.lead_id as string);
      const name = lead ? [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown' : 'Unknown';
      const agent = c.agent_id ? (liveAgentMap.get(c.agent_id as string) || 'Agent') : 'Unassigned';
      const timeDiff = c.last_message_at ? Math.floor((now.getTime() - new Date(c.last_message_at as string).getTime()) / 60000) : 0;
      const time = timeDiff < 60 ? `${timeDiff}m` : `${Math.floor(timeDiff / 60)}h`;
      return {
        id: c.id as string,
        name,
        agent,
        msg: '',
        time,
        unread: false,
        ch: ((c.channel as string) || 'sms').toUpperCase(),
      };
    });

    // Recent activity: recent leads and appointments
    const { data: recentLeadsList } = await admin
      .from('leads')
      .select('id, first_name, last_name, status, created_at')
      .eq('org_id', ctx.orgId)
      .order('created_at', { ascending: false })
      .limit(6);

    const recentActivity = (recentLeadsList || []).map((l, i) => {
      const name = [l.first_name, l.last_name].filter(Boolean).join(' ') || 'Unknown';
      const timeDiff = Math.floor((now.getTime() - new Date(l.created_at as string).getTime()) / 60000);
      const time = timeDiff < 60 ? `${timeDiff}m` : timeDiff < 1440 ? `${Math.floor(timeDiff / 60)}h` : `${Math.floor(timeDiff / 1440)}d`;
      const typeMap: Record<string, { text: string; type: string }> = {
        new: { text: 'New lead captured', type: 'lead_created' },
        contacted: { text: 'Lead contacted', type: 'message_sent' },
        qualified: { text: 'Lead qualified', type: 'lead_qualified' },
        converted: { text: 'Lead converted', type: 'lead_converted' },
      };
      const info = typeMap[l.status as string] || { text: 'Lead activity', type: 'lead_created' };
      return {
        id: (l.id as string) || String(i),
        text: info.text,
        name,
        time,
        type: info.type,
      };
    });

    return NextResponse.json({
      stats: {
        totalLeads: totalLeads || 0,
        leadsChange,
        activeConvos: activeConvos || 0,
        apptsToday: apptsToday || 0,
        convRate,
        pipelineValue,
        agentPerformance,
        liveConversations,
        recentActivity,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requiredRole: 'viewer' });

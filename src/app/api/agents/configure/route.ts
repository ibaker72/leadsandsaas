import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/api';
import { createAdminClient } from '@/lib/supabase/admin';

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  try {
    const {
      agent_id,
      name,
      description,
      vertical,
      status,
      channels,
      personality,
      rules,
      system_prompt_override,
      model_config,
    } = await req.json();

    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id is required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify agent belongs to the org
    const { data: agent, error: lookupError } = await admin
      .from('agents')
      .select('id')
      .eq('id', agent_id)
      .eq('org_id', ctx.orgId)
      .single();

    if (lookupError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Build update payload with only provided fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (vertical !== undefined) updates.vertical = vertical;
    if (status !== undefined) updates.status = status;
    if (channels !== undefined) updates.channels = channels;
    if (personality !== undefined) updates.personality = personality;
    if (rules !== undefined) updates.rules = rules;
    if (system_prompt_override !== undefined) updates.system_prompt_override = system_prompt_override;
    if (model_config !== undefined) updates.model_config = model_config;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from('agents')
      .update(updates)
      .eq('id', agent_id)
      .eq('org_id', ctx.orgId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ agent: updated });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { requiredRole: 'admin' });

// src/lib/skills/registry.ts

import { createClient } from "@supabase/supabase-js";
import type {
  AtlasSkill,
  SkillDomain,
  SkillStatus,
  SkillProvenance,
} from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = "atlas_skills";

// ── Write ──────────────────────────────────────────────────────────────────

export async function registerSkill(skill: AtlasSkill): Promise<AtlasSkill> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(skill, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(`registerSkill failed: ${error.message}`);
  return data as AtlasSkill;
}

export async function updateSkillStatus(
  id: string,
  status: SkillStatus,
  approvedBy?: string
): Promise<void> {
  const patch: Partial<AtlasSkill> = {
    status,
    updatedAt: new Date().toISOString(),
    ...(status === "approved" && {
      approvedBy,
      promotedAt: new Date().toISOString(),
    }),
  };

  const { error } = await supabase.from(TABLE).update(patch).eq("id", id);
  if (error) throw new Error(`updateSkillStatus failed: ${error.message}`);
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getSkillById(id: string): Promise<AtlasSkill | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as AtlasSkill;
}

export async function listSkills(filters?: {
  domain?: SkillDomain;
  status?: SkillStatus;
  provenance?: SkillProvenance;
  tags?: string[];
}): Promise<AtlasSkill[]> {
  let query = supabase.from(TABLE).select("*");

  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.provenance) query = query.eq("provenance", filters.provenance);
  if (filters?.tags?.length)
    query = query.overlaps("tags", filters.tags);

  const { data, error } = await query.order("createdAt", { ascending: false });
  if (error) throw new Error(`listSkills failed: ${error.message}`);
  return (data ?? []) as AtlasSkill[];
}

export async function findComposableSkills(
  requiredInput: string,
  expectedOutput: string
): Promise<AtlasSkill[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "active")
    .eq("orchestration->>canBeComposed", "true");

  if (error) throw new Error(`findComposableSkills failed: ${error.message}`);

  return (data as AtlasSkill[]).filter(
    (s) =>
      s.inputs.some((i) => i.name === requiredInput) &&
      s.outputs.some((o) => o.name === expectedOutput)
  );
}

export async function findSkillsByDomain(
  domain: SkillDomain
): Promise<AtlasSkill[]> {
  return listSkills({ domain, status: "active" });
}

export async function getPendingApprovalQueue(): Promise<AtlasSkill[]> {
  return listSkills({ status: "approval_pending", provenance: "nepa_generated" });
}
// src/app/dashboard/skills/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { AtlasSkill } from "@/lib/skills/types";
import SkillCard from "@/components/skills/SkillCard";
import SkillFilters from "@/components/skills/SkillFilters";

export default function SkillLibraryPage() {
  const [skills, setSkills] = useState<AtlasSkill[]>([]);
  const [filter, setFilter] = useState({ domain: "", status: "", provenance: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filter).filter(([, v]) => v))
    );
    fetch(`/api/skills?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setSkills(d.skills))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Skill Library</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {skills.length} skills registered · NEPA Agent Mode active
          </p>
        </div>
        <SkillFilters filter={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-48 rounded-xl bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}
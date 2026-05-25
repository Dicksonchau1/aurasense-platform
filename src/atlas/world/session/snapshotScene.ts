import { supabase } from '@/lib/supabase';
import { sha256 } from '@/lib/hash';

export async function snapshotScene(opts: {
  siteId: string;
  sceneBlob: Blob;
  meta: Record<string, any>;
}) {
  const buf = await opts.sceneBlob.arrayBuffer();
  const hash = await sha256(buf);

  // Reuse if already stored (content-addressed)
  const existing = await supabase.from('scene_snapshots')
    .select('id').eq('scene_hash', hash).maybeSingle();
  if (existing.data) return { id: existing.data.id, hash };

  // Upload to object storage
  const path = `scenes/${opts.siteId}/${hash}.glb`;
  await supabase.storage.from('atlas-scenes').upload(path, opts.sceneBlob, { upsert: false });
  const { data: pub } = supabase.storage.from('atlas-scenes').getPublicUrl(path);

  const { data, error } = await supabase.from('scene_snapshots').insert({
    site_id: opts.siteId,
    scene_hash: hash,
    scene_url: pub.publicUrl,
    scene_meta: opts.meta,
  }).select('id').single();
  if (error) throw error;
  return { id: data.id as string, hash };
}
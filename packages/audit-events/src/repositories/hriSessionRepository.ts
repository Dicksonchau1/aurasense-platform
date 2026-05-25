import { createClient } from '@supabase/supabase-js';

export class HriSessionRepository {
  public supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

  async listSessions(params: any) {
    return [];
  }

  async createSession(data: any) {
    return await this.supabase.from('hri_sessions').insert([data]).select();
  }
}

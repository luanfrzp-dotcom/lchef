import { supabase } from "@/lib/supabase/client";
import type { User, RoleId } from "@/lib/domain";
import { demoRepository } from "./demo.repository";

function mapUser(row: {
  id: string;
  name: string;
  email: string;
  role_id: string;
  unit_id: string | null;
  active: boolean;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role_id as RoleId,
    unitId: row.unit_id ?? undefined,
    active: row.active,
  };
}

export const authRepository = {
  async currentUser(): Promise<User | undefined> {
    if (!supabase) {
      const state = await demoRepository.getState();
      return state.users.find((user) => user.id === state.currentUserId);
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return undefined;

    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role_id,unit_id,active")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (data) return mapUser(data);

    if (error) return undefined;

    const email = authData.user.email;
    if (!email) return undefined;

    const { data: emailProfile, error: emailError } = await supabase
      .from("users")
      .select("id,name,email,role_id,unit_id,active")
      .ilike("email", email)
      .maybeSingle();

    if (emailError || !emailProfile) return undefined;
    return mapUser(emailProfile);
  },
  async login(email: string, password: string): Promise<User | undefined> {
    if (!supabase) return demoRepository.login(email, password);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return undefined;
    return this.currentUser();
  },
  async logout() {
    if (!supabase) return demoRepository.logout();
    await supabase.auth.signOut();
  },
  async resetDemo() {
    if (!supabase) await demoRepository.reset();
  },
};

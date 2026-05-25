import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session } = useSession();
  // Example: role from session.user.role, fallback to 'user'
  const role = session?.user?.role || (session?.user?.email === 'admin@example.com' ? 'admin' : 'user');
  return role;
}

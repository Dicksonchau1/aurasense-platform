import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session)
    return (
      <button onClick={() => signIn()}>Sign in</button>
    );
  return (
    <div>
      <span>Signed in as {session.user?.name || session.user?.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

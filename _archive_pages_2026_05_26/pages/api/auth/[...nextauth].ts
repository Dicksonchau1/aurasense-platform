import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dev pass-through: any non-empty password works.
        // TODO: replace with Supabase auth.signInWithPassword() before production.
        const email = credentials.email.toLowerCase().trim();
        const role  = email.endsWith("@aurasense.io") ? "admin"
                    : email.startsWith("ops")          ? "operator"
                    : "customer";

        return {
          id: email,
          email,
          name: email.split("@")[0],
          role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-replace-in-production",
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id   = (user as any).id ?? user.email;
        token.role = (user as any).role ?? "customer";
      }
      if (account?.provider === "github" && !token.role) {
        token.role = "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/hesap/giris",
  },
  callbacks: {
    authorized() {
      return true; // Handle route guarding manually in middleware.ts
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isPremiumMember = user.isPremiumMember ?? false;
      }
      // Client called `update({ name })` after a profile edit — refresh the
      // token's name so header/menu re-render without a re-login. Email is
      // intentionally never accepted here: it can't be changed post-signup.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isPremiumMember = token.isPremiumMember ?? false;
      return session;
    },
  },
  providers: [], // Configured dynamically in auth.ts
} satisfies NextAuthConfig;

export default authConfig;

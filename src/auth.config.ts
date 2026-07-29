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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isPremiumMember = user.isPremiumMember ?? false;
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

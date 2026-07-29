import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isPremiumMember: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isPremiumMember: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    isPremiumMember: boolean;
  }
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        code: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        const code = String(credentials?.code || "").trim();

        if (!email || !password || !code) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { customerProfile: true }
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Verify MFA/OTP Code
        const otp = await prisma.otpCode.findFirst({
          where: {
            identifier: email,
            code,
            consumed: false,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!otp) return null;

        // Consume OTP
        await prisma.otpCode.update({
          where: { id: otp.id },
          data: { consumed: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          isPremiumMember: user.customerProfile?.isPremiumMember ?? false,
        };
      },
    }),
  ],
});

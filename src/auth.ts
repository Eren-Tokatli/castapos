import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateCustomerIdentity } from "@/lib/account-security";
import { verifyOtp } from "@/lib/otp";
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

        const identityError = validateCustomerIdentity({
          email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
        if (identityError) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // MFA/OTP kodu — deneme sınırlı (brute-force koruması), bkz. lib/otp.ts.
        const otpResult = await verifyOtp(email, code);
        if (!otpResult.success) return null;

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

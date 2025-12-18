import NextAuth, { AuthOptions } from "next-auth";
import { dbConnect } from "./lib/dbConnect";
import { DarkUser } from "./model/User";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credentials are missing");
        }

        await dbConnect();

        const user = await DarkUser.findOne({
          email: credentials.email,
        }).select("+password");

        if (!user) {
          throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) {
          throw new Error("Password does not match");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role, // Fixed missing comma
          emailVerified: user.emailVerified || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.email = user.email;
        token.role = user.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.image = token.image;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-auth.session-token"
          : "dev-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function jwtSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "ecomarche-development-secret-change-before-production";

  if (process.env.NODE_ENV === "production" && secret.includes("development-secret")) {
    throw new Error("NEXTAUTH_SECRET or AUTH_SECRET must be set in production.");
  }

  return new TextEncoder().encode(secret);
}

export async function createPasswordHash(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function signAuthToken(user: AuthUser) {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

export async function verifyAuthToken(token?: string | null): Promise<AuthUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (!payload.sub || !payload.email || !payload.name || !payload.role) return null;

    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role) as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getAuthUserFromRequest(request: Request | NextRequest) {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearerToken || getCookieToken(request.headers.get("cookie"));
  const tokenUser = await verifyAuthToken(token);

  if (!tokenUser) return null;

  const user = await getPrisma().user.findUnique({
    where: { id: tokenUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireUser(request: Request | NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function requireAdmin(request: Request | NextRequest) {
  const user = await requireUser(request);
  if (user.role !== UserRole.ADMIN) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

function getCookieToken(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [key, ...value] = cookie.trim().split("=");
      return [key, decodeURIComponent(value.join("="))];
    }),
  );

  return (
    cookies["next-auth.session-token"] ||
    cookies["__Secure-next-auth.session-token"] ||
    null
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await getPrisma().user.findUnique({ where: { email } });
        if (!user?.isActive) return null;

        const valid = await verifyPassword(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AuthUser).role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role) as UserRole;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

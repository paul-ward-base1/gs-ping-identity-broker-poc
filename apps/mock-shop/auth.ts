import NextAuth from "next-auth";
import { createAuthConfig } from "@ciam-poc/auth";

export const { handlers, signIn, signOut, auth } = NextAuth(createAuthConfig());

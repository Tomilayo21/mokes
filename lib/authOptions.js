// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const email = credentials.email.toLowerCase().trim();
        const user = await User.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") }
        });

        const isMatch = user
          ? await bcrypt.compare(credentials.password, user.passwordHash)
          : false;

        //
        if (!user || !isMatch) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.imageUrl,
          username: user.username,
        };
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: true,
          role: "user",
          username: profile.email.split("@")[0],
          authProvider: "google",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/authentication" },

  callbacks: {
    async signIn({ user }) {
      await connectDB();

      let existing = await User.findOne({
        email: user.email.toLowerCase(),
      });

      if (!existing) {
        existing = await User.create({
          _id: new mongoose.Types.ObjectId().toString(),
          name: user.name,
          email: user.email.toLowerCase(),
          username: user.email.split("@")[0],
          imageUrl: user.image || null,
          emailVerified: true,
          role: "user",
          authProvider: user.authProvider,
        });
      }

      user.id = existing._id.toString();
      return true;
    },

    async jwt({ token, user }) {
      // 1. Initial login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.image = user.image;
        token.authProvider = user.authProvider;
      }

      // 2. Always refresh from DB (IMPORTANT for admin role)
      if (token.id) {
        const dbUser = await User.findById(token.id).select("role sessionVersion");

        if (dbUser) {
          token.role = dbUser.role; // 🔥 THIS FIXES ADMIN DISPLAY
          token.sessionVersion = dbUser.sessionVersion || 0;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) return null;

      session.user.id = token.id;
      session.user.role = token.role || "user";
      session.user.image = token.image || null;
      session.user.username = token.username || "";
      session.user.authProvider = token.authProvider || "credentials";

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
  },
};
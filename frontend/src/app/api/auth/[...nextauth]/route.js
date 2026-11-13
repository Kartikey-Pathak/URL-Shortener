import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Sync user with backend database
        const res = await axios.post("http://localhost:8000/user/google-auth", {
          name: user.name,
          email: user.email,
        });

        if (res.data && res.data.token) {
          user.backendToken = res.data.token;
          user.backendUser = res.data.user;
          return true;
        }
        return false;
      } catch (error) {
        console.error("Backend Google sync error:", error?.response?.data || error.message);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken;
        token.backendUser = user.backendUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.backendToken = token.backendToken;
        session.user = {
          ...session.user,
          ...token.backendUser,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "PATHAK_SECRET_KEY_12345",
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


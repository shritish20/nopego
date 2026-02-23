import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const admin = await prisma.admin.findUnique({ where: { email: credentials.email } })
        if (!admin) return null
        const match = await bcrypt.compare(credentials.password, admin.password)
        if (!match) return null
        return { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
      },
    }),
    CredentialsProvider({
      id: 'customer-login',
      name: 'Customer',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const customer = await prisma.customer.findUnique({ where: { email: credentials.email } })
        if (!customer || !(customer as any).password) return null
        const match = await bcrypt.compare(credentials.password, (customer as any).password)
        if (!match) return null
        return { id: customer.id, email: customer.email, name: customer.name, role: 'customer' }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  // FIX: admin login page for admin, customer login for customer
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import {PrismaAdapter} from '@next-auth/prisma-adapter'
import { db } from "./db";
import {compare} from 'bcrypt'


export const authOptions: NextAuthOptions = {
    secret: 'Ey7nTKnggBc0bRN8WUjyShw2qzOZ6KW4fUyqcKBePxY=',
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/sign-in',
        
    },
    
    providers: [
        CredentialsProvider({
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'Credentials',
          // The credentials is used to generate a suitable form on the sign in page.
          // You can specify whatever fields you are expecting to be submitted.
          // e.g. domain, username, password, 2FA token, etc.
          // You can pass any HTML attribute to the <input> tag through the object.
          credentials: {
            email: { label: "Email", type: "email", placeholder: "guy@pyekgroup.com" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            const existingUser = await db.user.findUnique({
                where: {email: credentials?.email}
            })

            if(!existingUser) {
                return null;
            }

            const passwordMatch = await compare(credentials.password, existingUser.password)

            if (!passwordMatch) {
                return null;
            }

            return {
                id: existingUser.id + '',
                username: existingUser.username,
                email: existingUser.email
            }

            // You need to provide your own logic here that takes the credentials
            // submitted and returns either a object representing a user or value
            // that is false/null if the credentials are invalid.
            // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
            // You can also use the `req` object to obtain additional parameters
            // (i.e., the request IP address)
            // const res = await fetch("/your/endpoint", {
            //   method: 'POST',
            //   body: JSON.stringify(credentials),
            //   headers: { "Content-Type": "application/json" }
            // })
            // const user = await res.json()
      
            // // If no error and we have user data, return it
            // if (res.ok && user) {
            //   return user
            // }
            // // Return null if user data could not be retrieved
            // return null
          }
        })
      ]
}
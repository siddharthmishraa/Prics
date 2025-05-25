import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import connectToDb from "@/libraries/mongodb";
import User from "@/models/user";
import bcrypt from "bcrypt";

const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "Enter your UserName",
                },
                password: { label: "Password",type: "password" },
            },
            async authorize(credentials){
                await connectToDb();

                const user = await User.findOne({username: credentials.username});

                const isPasswordMatched = await bcrypt.compare(credentials.password, user.password);

                if (!user) {
                    throw new Error("No user found with the username");
                }
                if (!isPasswordMatched) {
                    throw new Error("Incorrect password");
                }
                

                return {
                    name: user.username,
                    email: user.email,
                };
            }

        }),
    ],

    pages: {
        signIn: "/signin",
    },
};


const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
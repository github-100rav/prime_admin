import NextAuth from "next-auth";
declare module "next-auth"{
    interface User{
        id?:string;
        role?:string
        emailVerified?:Date | null
    }
    interface Session{
        user:{
            id?:string;
            email?:string;
            role?:string;
            emailVerified?:Date | null
        } & DefaultSession["user"]
    }
}
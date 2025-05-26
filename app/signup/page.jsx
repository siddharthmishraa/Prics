"use client"
import React, { useEffect } from "react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

const SignUp = () => {

    const {data: session} = useSession();
    const router = useRouter();
   
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     if(session){
    //         router.push("/");
    //     }
    // }, [session, router])

    const handleUserRegister = async()=> {
        setLoading(true);

        if(!username || !email || !password){
            toast.error("Please provide complete details.");
            setLoading(false);
            return;
        }

        try {
            await axios.post("/api/auth/register", {
                username,
                email,
                password,
            });
            
            setUsername("");
            setEmail("");
            setPassword("");
            setLoading(false);
            router.push("/signin");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed, try again.";
            toast.error(errorMessage);
            setLoading(false);
            console.error("Registration Error:", error);
        }
    };
      

    return(
        <>
        <div className="min-h-screen flex justify-center items-center bg-gray-100 fixed top-0 left-0 w-full">

            {/* the box in which everything is contained */}
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            
                {/* to display the logo */}
                <div className="flex justify-center mb-4">
                    <Image src="/prics.svg" alt="Prics Svg" height={150} width={150} priority className="w-30 h-30" />
                </div>
            
                {/* display text */}
                <h2 className="text-center text-xl font-semibold mb-1">
                    Welcome to PRICS!
                </h2>
                <p className="text-center text-gray-500 mb-6">Find suggestions you didn't know you needed for your next reel.</p>
            
                {/* take input from user for username, email and password */}
                <input type="text" placeholder="Username" className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-black-500" value={username} 
                onChange={(e)=> setUsername(e.target.value)}></input>

                <input type="email" placeholder="User Email ID" className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-black-500"value={email} 
                onChange={(e)=> setEmail(e.target.value)}></input>
            
                <input type="password" placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-black-500"value={password} 
                onChange={(e)=> setPassword(e.target.value)}></input>
                
                {/* register button */}
                <button onClick = {handleUserRegister} 
                    className="w-full p-3 bg-red-500 text-white rounded-lg mb-4 hover:bg-red-600 transition-all duration-300 cursor-pointer">
                        {
                            loading ? <ClipLoader color={"#fff"} size={20}/> :"Sign Up"
                        }

                    </button>
                
                {/* creating a division between traditional signup and using 3rd party apps */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                    
                    <div className="h-px bg-gray-300 w-full"></div>

                    <p className="text-gray-500">OR</p>

                    <div className="h-px bg-gray-300 w-full"></div>


                </div>

                {/* signup with facebook */}
                <button onClick={()=> signIn("facebook",{callbackUrl: "/"})} className="w-full p-3 bg-black text-white rounded-lg flex justify-center items-center space-x-2 mb-3 hover:bg-gray-600 cursor-pointer">
                    
                    <Image src="/fb.png" alt="Facebook" width={150} height={150} priority className="w-6 h-6" />
                    
                    <span className="font-semibold">Continue with Facebook</span>
                
                </button>

                {/* signup with google */}
                <button onClick={()=> signIn("google",{callbackUrl: "/"})} className="w-full p-3 bg-gray-400 text-white rounded-lg flex justify-center items-center space-x-2 mb-3 hover:bg-gray-500 cursor-pointer">
                    
                    <Image src="/google.png" alt="Google" width={150} height={150} priority className="w-6 h-6" />
                    
                    <span className="font-semibold">Continue with Google</span>
                
                </button>

                {/* basic t&c line */}
                <p className="text-xs text-center text-gray-500 mt-4">By continuing, you agree to PRICS's{" "} 

                    <Link href="/" className="text-blue-600 hover:underline">Terms of Services</Link>{" "} and {" "}

                    <Link href="/" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>

                {/* to reroute them to login page */}
                <p className="text-center text-sm mt-4">
                    Already a Member? <Link href="/signin" className="text-blue-600 hover:underline"> Signin</Link>                    
                </p>
            
            </div>
        
        </div>
        
        </>
    )
}

export default SignUp;
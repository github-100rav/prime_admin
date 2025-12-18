// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";

// const LoginPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     if (!email || !password) {
//       toast.error("Please fill in all fields");
//       setIsLoading(false);
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       toast.error("Please enter a valid email address");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       // Replace with actual authentication logic
//       // const response = await fetch('/api/auth/login', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ email, password }),
//       // });

//       // if (!response.ok) throw new Error('Login failed');

//       toast.success("Login successful!");
//       router.push("/dashboard");
//     } catch (error) {
//       toast.error("Invalid credentials. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1F133D] to-[#0A061F] p-4">
//       <div className="w-full max-w-md bg-[#1F133D]/90 backdrop-blur-sm border border-[#2D1B55] rounded-xl p-8 shadow-lg">
//         <div className="flex flex-col items-center mb-8">
//           <div className="w-16 h-16 bg-[#C27AFF] rounded-full flex items-center justify-center mb-4">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="w-8 h-8 text-white"
//             >
//               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
//           <p className="text-gray-400 mt-2">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="email" className="text-gray-300">
//               Email Address
//             </Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="your@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="bg-[#2D1B55] border-gray-700 text-white focus:ring-2 focus:ring-[#C27AFF]"
//             />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="password" className="text-gray-300">
//                 Password
//               </Label>

//             </div>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="bg-[#2D1B55] border-gray-700 text-white focus:ring-2 focus:ring-[#C27AFF]"
//             />
//           </div>

//           <Button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-[#C27AFF] hover:bg-[#A55CE6] text-black font-semibold h-11"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Signing in...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </Button>
//         </form>

//       </div>
//     </div>
//   );
// };

// export default LoginPage;

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex w-full justify-center bg-yellow-300 items-center py-20 bg-gradient-to-tr from-[#0E091C] via-[#1F133D] to-[#0B1027] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full flex-col items-center px-8 sm:px-6 lg:px-8"
      >
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-[#500150] via-[#42026d] to-[#031877] rounded-full blur-3xl opacity-30" />
          <motion.div
            className="bg-[#0C1B44]/90 backdrop-blur-sm border-2 border-[#A92EDF]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-[#500150] via-[#42026d] to-[#031877] rounded-full blur-2xl opacity-20" />

            <div className="flex flex-col items-center space-y-8">
              <div className="w-full flex flex-col justify-center items-center gap-2">
                <div className="flex gap-4 justify-center items-center">
                  <Lock size={24} className="text-[#A92EDF]" />
                  <h2 className="text-4xl font-bold text-[#A92EDF] ">Login</h2>
                </div>
                <h2 className="text-3xl text-white text-center">
                  Welcome Back
                </h2>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <Input
                  label="Email"
                  icon={<Mail className="h-5 w-5 text-purple-500" />}
                  {...register("email")}
                  error={
                    errors.email ? { message: errors.email.message } : undefined
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  icon={<Lock className="h-5 w-5 text-purple-500" />}
                  {...register("password")}
                  error={
                    errors.password
                      ? { message: errors.password.message }
                      : undefined
                  }
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-[#A92EDF] hover:bg-[#8e5ea3] text-white font-semibold mb-4 py-4 rounded-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}


import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }
  return (
    <html lang="en">
      <body>
        <div className="flex w-full h-full">
          <div className="flex flex-1 h-full w-full">{children}</div>
        </div>
      </body>
    </html>
  );
}

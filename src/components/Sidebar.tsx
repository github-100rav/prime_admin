"use client";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  X,
  Layers,
  Tags,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsVisible(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1F133D] p-2 rounded text-white"
        onClick={() => setIsVisible(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      <aside
        className={`bg-[#1F133D] z-[100] text-white w-[250px] h-screen p-4 fixed shadow-2xl border-r-2 border-r-[#352047] transition-transform duration-300 overflow-y-auto ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
        aria-hidden={!isVisible && isMobile}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[#C27AFF] text-2xl font-bold">Admin Panel</h1>
          <button
            className="md:hidden text-white hover:text-[#C27AFF] transition-colors"
            onClick={() => setIsVisible(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-3">
          <Link
            href="/"
            className={`${
              pathname === "/" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <Home size={20} /> Dashboard
          </Link>
          <Link
            href="/products"
            className={`${
              pathname === "/products" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <Package size={20} /> Products
          </Link>
          <Link
            href="/orders"
            className={`${
              pathname === "/orders" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <ShoppingCart size={20} /> Orders
          </Link>
          <Link
            href="/customers"
            className={`${
              pathname === "/customers" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <Users size={20} /> Customers
          </Link>

          <Link
            href="/category"
            className={`${
              pathname === "/category" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <Tags size={20} /> Category
          </Link>
          <Link
            href="/group"
            className={`${
              pathname === "/group" ? "bg-[#2A1B4D] text-[#C27AFF]" : ""
            } flex items-center gap-3 p-2 rounded hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors`}
            onClick={handleLinkClick}
          >
            <Layers size={20} /> Group
          </Link>

          <div className="border-t border-[#352047] mt-4 pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 rounded w-full text-left hover:bg-[#2A1B4D] hover:text-[#C27AFF] transition-colors"
            >
              <LogOut size={20} /> Log Out
            </button>
          </div>
        </nav>
      </aside>
      {isVisible && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

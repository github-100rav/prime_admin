import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: { message?: string };
  icon?: ReactNode;
}

export const Input = ({ label, error, icon, ...props }: InputProps) => (
  <div className="space-y-1">
    <label className="block mb-4 text-lg font-medium text-white">{label}</label>
    <div className="relative ">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#A92EDF] focus:border-[#A92EDF] ${
          icon ? "pl-10" : ""
        }`}
        {...props}
      />
    </div>
    {error?.message && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);

"use client";

import { User } from "lucide-react";

export function IDSignIn() {
    const handleIDClick = () => {
        const input = document.getElementById("login-id-input");
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    return (
        <button
            onClick={handleIDClick}
            className="w-full px-4 py-3 text-sm font-bold text-black bg-white border border-transparent rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
            <User size={18} />
            Sign in with System ID
        </button>
    );
}

export function RoleBasedSignIn({ role }: { role: string }) {
    const handleRoleClick = () => {
        const input = document.getElementById("login-id-input");
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    return (
        <button
            onClick={handleRoleClick}
            className="w-full px-4 py-3 text-sm font-bold text-black bg-white border border-transparent rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
            <User size={18} />
            Role-based Login ({role.charAt(0).toUpperCase() + role.slice(1)})
        </button>
    );
}

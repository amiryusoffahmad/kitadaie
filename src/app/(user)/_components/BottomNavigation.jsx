"use client";

import Link from "next/link";
import { Home, History, CirclePlus, Inbox, User } from "lucide-react";
import UpdateDrawer from "./UpdateDrawer";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { usePersonalData } from "@/app/api/profile/user-api";

export default function MobileNav() {
    const { data: session } = useSession();
    const [userInfo, setUserInfo] = useState({ username: "", email: "" });

    // Fetch user data from API using the user ID from session
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id);

    useEffect(() => {
        // When personal data is loaded, update user info
        if (personalData) {
            setUserInfo({
                username: personalData.username || "",
                email: personalData.email || ""
            });
            console.log("User data loaded:", personalData.username);
        }
    }, [personalData]);

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
                {!isLoading && userInfo.username && (
                    <div className="absolute -top-6 left-0 right-0 bg-background border-t py-1 px-3 text-xs w-full max-w-md mx-auto">
                        <div className="flex justify-between items-center">
                            <span className="font-medium truncate">ID: {userInfo.username}</span>
                            {userInfo.email && (
                                <span className="text-muted-foreground truncate">{userInfo.email}</span>
                            )}
                        </div>
                    </div>
                )}
                <nav className="border-t bg-background h-16 w-full max-w-md">
                    <div className="flex items-center justify-around pt-[17px] pb-[6px]">
                        <Link href="/home" className="flex flex-col items-center gap-1">
                            <Home size={23} />
                            <span className="text-xs">Home</span>
                        </Link>

                        <Link href="/tprog" className="flex flex-col items-center gap-1">
                            <History size={23} />
                            <span className="text-xs">TProg</span>
                        </Link>

                        <UpdateDrawer />

                        <Link href="/inbox" className="flex flex-col items-center gap-1">
                            <Inbox size={23} />
                            <span className="text-xs">Inbox</span>
                        </Link>

                        <Link href="/profile" className="flex flex-col items-center gap-1">
                            <User size={23} />
                            <span className="text-xs">Profile</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}

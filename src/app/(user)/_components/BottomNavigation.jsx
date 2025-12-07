"use client";

import Link from "next/link";
import { Home, BookOpen, CirclePlus, Mail, MailOpen, User } from "lucide-react";
import UpdateDrawer from "./UpdateDrawer";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { usePersonalData } from "@/app/api/profile/user-api";
import { useNotifications } from "@/providers/notification-provider";
import { Badge } from "@/components/ui/badge";

export default function MobileNav() {
    const { data: session } = useSession();
    const [userInfo, setUserInfo] = useState({ username: "", email: "" });
    const { unreadCount } = useNotifications();

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

                        <Link href="/resources" className="flex flex-col items-center gap-1">
                            <BookOpen size={23} />
                            <span className="text-xs">Resources</span>
                        </Link>

                        <UpdateDrawer />

                        <Link href="/user/notifications" className="flex flex-col items-center gap-1 relative">
                            <div className="relative">
                                {unreadCount > 0 ? (
                                    <Mail size={23} />
                                ) : (
                                    <MailOpen size={23} />
                                )}
                                {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 px-1 min-w-4 h-4 text-[10px] flex items-center justify-center"
                                    >
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </Badge>
                                )}
                            </div>
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

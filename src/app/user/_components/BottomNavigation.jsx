"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, History, CirclePlus, Inbox, User } from "lucide-react";

export default function MobileNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <nav className="border-t bg-background h-16 w-full max-w-md">
                <div className="flex items-center justify-around pt-[17px] pb-[6px]">
                    <Link href="/" className="flex flex-col items-center gap-1">
                        <Home size={23} />
                        <span className="text-xs">Home</span>
                    </Link>

                    <Link href="/tprog" className="flex flex-col items-center gap-1">
                        <History size={23} />
                        <span className="text-xs">TProg</span>
                    </Link>

                    <Link href="/updates" className="flex flex-col items-center gap-1">
                        <CirclePlus size={23} />
                        <span className="text-xs">Updates</span>
                    </Link>

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
    );
}

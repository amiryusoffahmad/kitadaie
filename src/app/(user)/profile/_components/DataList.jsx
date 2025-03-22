'use client'
import { menuData } from "@/lib/menu-data"
import { ProfileSection } from "./ProfileSection"

export default function DataList() {
    return (
        <div className="flex min-h-screen flex-col ">
            <main className="flex-1 flex flex-col px-5 pt-10">
                <h1 className="text-2xl font-bold pb-6">Muhammad Nuri</h1>
                <div className="grid grid-cols-2 gap-3 min-h-[170px] pb-12">
                    <div className="bg-secondary rounded-[7px]"></div>
                    <div className="bg-secondary rounded-[7px]"></div>
                </div>
                {menuData.map((section, index) => (
                    <ProfileSection key={section.title} section={section} />
                ))}
            </main>
        </div>
    )
}
'use client'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    CirclePlus,
    Clock,
    Timer,
    CalendarDays,
    BarChart,
    FileText,
    ChevronRight,
    Network,
    BookOpen,
    Users,
    Calendar,
    Building,
    Cog,
    Award,
    UserCircle,
    MessageSquare,
    CheckSquare,
    Target,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

export default function UpdateDrawer() {
    const router = useRouter()

    const handleNavigate = (path) => {
        router.push(path || '/coming-soon')
    }

    return (
        <Drawer>
            <DrawerTrigger className="flex flex-col items-center gap-1">
                <CirclePlus size={23} />
                <span className="text-xs">Update</span>
            </DrawerTrigger>
            <DrawerContent className="mx-auto max-w-md">


                <div className="px-4 space-y-6 pb-2 pt-4">
                    {/* Tajmik Bina Section */}
                    <div>
                        <h3 className="font-medium text-sm mb-3">Tajmik Bina</h3>
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-3 pb-2">
                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Network className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">HQ Tree</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Calendar className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Pentajmikan</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Building className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Binaan</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Resource</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Users className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Our Experts</span>
                                </Button>



                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Cog className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">CCS</span>
                                </Button>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>

                    {/* Others Section */}
                    <div>
                        <h3 className="font-medium text-sm mb-3">Others</h3>
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-3 pb-2">
                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Award className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Ikh/Akh Expertise</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <UserCircle className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Profile Ikh/Akh</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Invitation Pengisian</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <CheckSquare className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Evaluation Pengisian</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Target className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Mad'u Core</span>
                                </Button>

                                <Button
                                    onClick={() => handleNavigate()}
                                    variant="outline"
                                    className="flex flex-col items-center py-6 h-auto w-24 border-muted-foreground/20"
                                >
                                    <div className="bg-foreground p-3 rounded-md mb-2">
                                        <Globe className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">Insights Overseas</span>
                                </Button>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </div>

                <DrawerFooter className="pt-2">
                    <DrawerClose>
                        <Button variant="outline" className="w-full">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

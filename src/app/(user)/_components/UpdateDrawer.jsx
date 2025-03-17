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
import { CirclePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UpdateDrawer() {
    return (
        <Drawer>
            <DrawerTrigger className="flex flex-col items-center gap-1">
                <CirclePlus size={23} />
                <span className="text-xs">Update</span>
            </DrawerTrigger>
            <DrawerContent className="mx-auto max-w-md">
                <DrawerHeader>
                    <DrawerTitle>Update</DrawerTitle>
                    <DrawerDescription></DrawerDescription>
                    <Button>Pentajmikan</Button>
                    <Button>Pembinaan</Button>
                    <Button>Bisnes</Button>
                    <Button>Virality</Button>
                    <Button>Akademik</Button>
                </DrawerHeader>

                <DrawerFooter>
                    <DrawerClose>
                        <Button variant="outline" className="w-full">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

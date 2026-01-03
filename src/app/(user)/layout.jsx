import BottomNavigation from "./_components/BottomNavigation";
import ScreenshotPrevention from "./_components/ScreenshotPrevention";

export default function MobileLayout({ children }) {
    return (
        <div className='flex flex-col h-screen max-w-md mx-auto pb-[90.78px] border-l border-r'>
            <ScreenshotPrevention />
            <div className='grow overflow-auto p-4'>
                {children}
            </div>
            <BottomNavigation />
        </div>
    )
}
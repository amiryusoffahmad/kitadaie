import BottomNavigation from "./_components/BottomNavigation";
import ScreenshotPrevention from "./_components/ScreenshotPrevention";

export default function MobileLayout({ children }) {
    return (
        <div className='fixed inset-0 overflow-hidden'>
            <div className='flex flex-col h-full max-w-md mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] border-l border-r'>
                <ScreenshotPrevention />
                <div className='grow overflow-auto p-4'>
                    {children}
                </div>
                <BottomNavigation />
            </div>
        </div>
    )
}
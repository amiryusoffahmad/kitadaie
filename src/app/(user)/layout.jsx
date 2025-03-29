import BottomNavigation from "./_components/BottomNavigation";
import ScreenshotPrevention from "./_components/ScreenshotPrevention";

export default function MobileLayout({ children }) {
    return (
        <div className='flex flex-col h-screen max-w-md mx-auto'>
            <ScreenshotPrevention />
            <div className='flex-grow overflow-auto p-4 border-l border-r'>
                {children}
            </div>
            <BottomNavigation />
        </div>
    )
}
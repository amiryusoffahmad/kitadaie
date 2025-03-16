export default function MobileLayout({ children }) {
    return (
        <div className='flex flex-col h-screen max-w-md mx-auto'>
            <div className='flex-grow overflow-auto p-4 border-l border-r '>
                {children}
            </div>
        </div>
    )
}
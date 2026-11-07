import Image from "next/image";

export function SiteHeader() {
    return (
        <header className="h-14 shrink-0 border-b bg-background">
            <div className="mx-auto flex h-full w-full max-w-md items-center justify-center px-4">
                <Image
                    src="/branding/kitadaie-header-logo.png"
                    alt="KitaDaie"
                    width={2172}
                    height={724}
                    priority
                    className="h-9 w-auto object-contain"
                />
            </div>
        </header>
    );
}

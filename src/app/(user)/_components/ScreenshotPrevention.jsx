'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScreenshotPrevention() {
    const [securityTriggered, setSecurityTriggered] = useState(false);

    useEffect(() => {
        // Function to handle screenshot attempts
        const handleScreenshotAttempt = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Log the attempt
            console.log('[SECURITY] Screenshot attempt detected');

            // Show toast warning
            toast.error("Screenshots are not allowed for security and privacy reasons", {
                duration: 5000,
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />
            });

            // Set security state
            setSecurityTriggered(true);

            return false;
        };

        // Function to detect visibility change (potential screenshot attempt)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('[SECURITY] Visibility change detected');
                toast.warning("Screen recording or switching apps may compromise security", {
                    duration: 3000
                });
            }
        };

        // Prevent Print Screen key and other screenshot shortcuts
        const handleKeyDown = (e) => {
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 'p') ||
                (e.metaKey && e.key === 'p') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.key === 'F12')
            ) {
                handleScreenshotAttempt(e);
            }
        };

        // Mobile blur detection (potential app switching for screenshot)
        const handleWindowBlur = () => {
            if (document.hasFocus === false) {
                console.log('[SECURITY] Window blur detected');
                toast.warning("Switching apps may trigger security measures", {
                    duration: 3000
                });
            }
        };

        // Add CSS to prevent selection and make screenshots less useful
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
            }
            
            img, video {
                -webkit-user-drag: none !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(styleElement);

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('contextmenu', handleScreenshotAttempt);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', handleScreenshotAttempt);
            document.head.removeChild(styleElement);
        };
    }, []);

    if (securityTriggered) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
                <div className="w-full max-w-md p-6 rounded-lg bg-red-50 border border-red-200 shadow-lg">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                        <h2 className="text-xl font-bold text-red-800">Security Alert</h2>
                        <p className="text-sm text-gray-700">
                            Screenshot attempt detected. For security reasons, screenshots are not allowed in this application.
                        </p>
                        <p className="text-xs text-gray-500">
                            This incident has been logged for security purposes.
                        </p>
                        <Button
                            onClick={() => setSecurityTriggered(false)}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Acknowledge & Continue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Component doesn't render anything visible when not triggered
    return null;
} 
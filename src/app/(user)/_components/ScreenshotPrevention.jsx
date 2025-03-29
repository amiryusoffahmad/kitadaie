'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScreenshotPrevention() {
    const [securityTriggered, setSecurityTriggered] = useState(false);
    const lastVisibilityChange = useRef(0);
    const lastLuminance = useRef(null);
    const isIOS = useRef(false);

    useEffect(() => {
        // Check if device is iOS
        isIOS.current = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // Function to handle screenshot attempts
        const handleScreenshotAttempt = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

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
            const now = Date.now();

            // iOS screenshot often triggers rapid visibility changes
            if (isIOS.current && document.hidden) {
                // If two visibility changes happen within 300ms, likely a screenshot on iOS
                if (now - lastVisibilityChange.current < 300) {
                    console.log('[SECURITY] iOS screenshot pattern detected');
                    handleScreenshotAttempt();
                }
            }

            if (document.hidden) {
                console.log('[SECURITY] Visibility change detected');
                toast.warning("Screen recording or switching apps may compromise security", {
                    duration: 3000
                });
            }

            lastVisibilityChange.current = now;
        };

        // Prevent Print Screen key and other screenshot shortcuts
        const handleKeyDown = (e) => {
            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 'p') ||
                (e.metaKey && e.key === 'p') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.key === 'F12') ||
                // iOS specific shortcuts
                (e.key === 'Home' && e.altKey) ||
                (e.key === 'Power') ||
                // Android specific
                (e.key === 'S' && e.metaKey)
            ) {
                handleScreenshotAttempt(e);
            }
        };

        // Mobile blur detection (potential app switching for screenshot)
        const handleWindowBlur = () => {
            console.log('[SECURITY] Window blur detected');

            // iOS screenshot often causes a brief blur
            if (isIOS.current) {
                // Check again after a small delay to detect the iOS screenshot pattern
                setTimeout(() => {
                    if (document.hasFocus()) {
                        console.log('[SECURITY] iOS screenshot blur pattern detected');
                        handleScreenshotAttempt();
                    }
                }, 50);
            }

            toast.warning("Switching apps may trigger security measures", {
                duration: 3000
            });
        };

        // iOS specific: Screen capture API detection (iOS 15+)
        let screenCaptureSupported = false;
        if (typeof navigator.mediaDevices !== 'undefined' &&
            typeof navigator.mediaDevices.getDisplayMedia === 'function') {
            screenCaptureSupported = true;

            // Override getDisplayMedia to detect screen recording attempts
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = function (constraints) {
                console.log('[SECURITY] Screen capture attempt detected');
                handleScreenshotAttempt();
                return originalGetDisplayMedia.call(this, constraints)
                    .then(stream => {
                        // Screen recording was allowed, show additional warning
                        toast.error("Screen recording detected! This violates our security policy.", {
                            duration: 10000
                        });
                        return stream;
                    });
            };
        }

        // Detect screen brightness changes (can indicate iOS screenshot)
        const handleScreenBrightnessChange = () => {
            if (!isIOS.current) return;

            // Try to detect the flash that occurs during iOS screenshots
            if ('AmbientLightSensor' in window) {
                try {
                    const sensor = new window.AmbientLightSensor();
                    sensor.onreading = () => {
                        const currentLuminance = sensor.illuminance;

                        // If we detect a rapid increase then decrease in brightness (iOS screenshot flash)
                        if (lastLuminance.current !== null &&
                            currentLuminance > lastLuminance.current * 1.5 &&
                            Date.now() - lastVisibilityChange.current < 500) {
                            console.log('[SECURITY] Screen brightness flash detected');
                            handleScreenshotAttempt();
                        }

                        lastLuminance.current = currentLuminance;
                    };
                    sensor.start();
                } catch (error) {
                    console.log('AmbientLightSensor not available:', error);
                }
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
            
            /* iOS-specific screenshot prevention */
            body {
                -webkit-touch-callout: none !important;
                -webkit-user-select: none !important;
            }
            
            /* Add invisible watermark overlay */
            body::after {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><text x='50' y='50' font-size='20' fill='rgba(0,0,0,0.03)' transform='rotate(45 150 150)'>SECURE NO SCREENSHOTS</text></svg>");
                z-index: 10000;
            }
        `;
        document.head.appendChild(styleElement);

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('contextmenu', handleScreenshotAttempt);

        // Add iOS-specific detection
        if (isIOS.current) {
            handleScreenBrightnessChange();
            // iOS gesture that can trigger screenshots (three finger tap)
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length >= 3) {
                    console.log('[SECURITY] Multi-touch gesture detected');
                    handleScreenshotAttempt(e);
                }
            });
        }

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', handleScreenshotAttempt);

            if (isIOS.current) {
                document.removeEventListener('touchstart', handleScreenshotAttempt);
            }

            document.head.removeChild(styleElement);

            // Restore original getDisplayMedia if we modified it
            if (screenCaptureSupported) {
                navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
            }
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
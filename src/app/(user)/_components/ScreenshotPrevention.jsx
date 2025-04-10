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
    const canvasRef = useRef(null);
    const frameId = useRef(null);
    const screenObserver = useRef(null);
    const isInteractingWithDropdown = useRef(false);

    useEffect(() => {
        // Check if device is iOS
        isIOS.current = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // Function to handle screenshot attempts
        const handleScreenshotAttempt = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // Check if user is interacting with a dropdown or popover
            if (isInteractingWithDropdown.current) {
                console.log('[SECURITY] Ignoring potential false positive during dropdown interaction');
                return false;
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

        // Monitor for dropdown and popover interactions to prevent false positives
        const monitorUIInteractions = () => {
            // Check for elements that indicate dropdown/popover is open
            const checkForOpenDropdowns = () => {
                const popoverElements = document.querySelectorAll('[data-state="open"], [aria-expanded="true"]');
                isInteractingWithDropdown.current = popoverElements.length > 0;
            };

            // Setup mutation observer to detect when dropdowns open and close
            const dropdownObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'data-state' ||
                            mutation.attributeName === 'aria-expanded')) {
                        checkForOpenDropdowns();
                    }
                }
            });

            // Observe the entire document for dropdown state changes
            dropdownObserver.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['data-state', 'aria-expanded']
            });

            // Also monitor click events to detect dropdown interactions
            document.addEventListener('click', (e) => {
                // Check if clicking on a dropdown trigger
                const isDropdownTrigger = e.target.closest('[role="combobox"], [aria-haspopup="true"], button');
                if (isDropdownTrigger) {
                    isInteractingWithDropdown.current = true;
                    // Reset after a short delay to allow the dropdown to open/close
                    setTimeout(() => {
                        checkForOpenDropdowns();
                    }, 300);
                }
            });

            return () => {
                dropdownObserver.disconnect();
            };
        };

        // iOS Safari-specific screenshot detection (simplified to reduce false positives)
        const detectIOSScreenshot = () => {
            if (!isIOS.current) return;

            // Simplified detection to avoid interfering with UI interactions
            const handleIOSVisibilityChange = () => {
                const now = Date.now();
                // Only consider very rapid visibility changes as screenshot attempts
                if (document.hidden && now - lastVisibilityChange.current < 100) {
                    console.log('[SECURITY] iOS screenshot pattern detected');
                    if (!isInteractingWithDropdown.current) {
                        handleScreenshotAttempt();
                    }
                }
                lastVisibilityChange.current = now;
            };

            document.addEventListener('visibilitychange', handleIOSVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleIOSVisibilityChange);
            };
        };

        // Function to detect visibility change (potential screenshot attempt)
        const handleVisibilityChange = () => {
            // Skip detection when interacting with dropdowns
            if (isInteractingWithDropdown.current) {
                return;
            }

            const now = Date.now();

            // iOS screenshot often triggers rapid visibility changes
            if (isIOS.current && document.hidden) {
                // If two visibility changes happen within 300ms, likely a screenshot on iOS
                if (now - lastVisibilityChange.current < 300) {
                    console.log('[SECURITY] iOS screenshot pattern detected');
                    handleScreenshotAttempt();
                }
            }

            lastVisibilityChange.current = now;
        };

        // Prevent Print Screen key and other screenshot shortcuts
        const handleKeyDown = (e) => {
            // Skip detection when interacting with dropdowns
            if (isInteractingWithDropdown.current) {
                return;
            }

            if (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 'p') ||
                (e.metaKey && e.key === 'p')
            ) {
                handleScreenshotAttempt(e);
            }
        };

        // Mobile blur detection (potential app switching for screenshot)
        const handleWindowBlur = () => {
            // Skip detection when interacting with dropdowns
            if (isInteractingWithDropdown.current) {
                return;
            }

            console.log('[SECURITY] Window blur detected');
        };

        // Add CSS with less aggressive user-select prevention
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            body.secure-mode * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
            
            img, video {
                -webkit-user-drag: none !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(styleElement);

        // Setup monitors
        const cleanupUIMonitor = monitorUIInteractions();

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);

            cleanupUIMonitor();


            if (screenObserver.current) {
                screenObserver.current.disconnect();
                screenObserver.current = null;
            }

            if (frameId.current) {
                cancelAnimationFrame(frameId.current);
                frameId.current = null;
            }

            if (canvasRef.current && canvasRef.current.parentNode) {
                canvasRef.current.parentNode.removeChild(canvasRef.current);
                canvasRef.current = null;
            }

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
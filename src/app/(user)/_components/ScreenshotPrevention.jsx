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

        // iOS Safari-specific screenshot detection
        // Based on research, iOS screenshots trigger a sequence of events
        let iosScreenshotTimeout = null;
        const detectIOSScreenshot = () => {
            // iOS screenshot detection is challenging but possible through various signals

            // Create a MutationObserver to watch for temporary elements that iOS creates when taking screenshots
            if (!screenObserver.current && isIOS.current) {
                screenObserver.current = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.addedNodes.length) {
                            // iOS 16+ adds some specific elements when screenshot is taken
                            const addedElements = Array.from(mutation.addedNodes);
                            const possibleScreenshotIndicator = addedElements.some(
                                node => node.nodeType === 1 &&
                                    (node.classList?.contains('UIActionSheet') ||
                                        node.id?.includes('screenshot') ||
                                        node.style?.zIndex > 9999)
                            );

                            if (possibleScreenshotIndicator) {
                                console.log('[SECURITY] iOS DOM change indicating screenshot');
                                clearTimeout(iosScreenshotTimeout);
                                iosScreenshotTimeout = setTimeout(handleScreenshotAttempt, 50);
                            }
                        }
                    }
                });

                // Watch for changes to the body and its descendants
                screenObserver.current.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        };

        // Implement 60fps animation technique to prevent clear screenshots
        // This is one of the most effective methods on iOS according to research
        const createProtectionCanvas = () => {
            if (isIOS.current) {
                // Create canvas element for 60fps animation
                const canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.pointerEvents = 'none';
                canvas.style.zIndex = '99999';
                canvas.style.opacity = '0.01'; // Almost invisible but will affect screenshots

                document.body.appendChild(canvas);
                canvasRef.current = canvas;

                const ctx = canvas.getContext('2d');

                // Animate canvas at 60fps to disrupt screenshots
                const animate = () => {
                    if (!ctx) return;

                    // Create a subtle but effective pattern that will disrupt screenshots
                    // but be nearly invisible to users
                    const timestamp = Date.now() / 1000;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw subtle patterns that change every frame
                    for (let i = 0; i < 10; i++) {
                        const x = Math.sin(timestamp + i) * canvas.width / 2 + canvas.width / 2;
                        const y = Math.cos(timestamp + i) * canvas.height / 2 + canvas.height / 2;

                        ctx.fillStyle = `rgba(255,255,255,0.01)`;
                        ctx.beginPath();
                        ctx.arc(x, y, 50 + Math.sin(timestamp) * 20, 0, Math.PI * 2);
                        ctx.fill();

                        // Add watermark text that will show in screenshots
                        ctx.font = '20px Arial';
                        ctx.fillStyle = 'rgba(0,0,0,0.01)';
                        ctx.fillText('SECURE - NO SCREENSHOTS',
                            canvas.width / 2 - 100 + Math.sin(timestamp) * 10,
                            canvas.height / 2 + Math.cos(timestamp) * 10);
                    }

                    frameId.current = requestAnimationFrame(animate);
                };

                frameId.current = requestAnimationFrame(animate);

                // Adjust canvas on resize
                window.addEventListener('resize', () => {
                    if (canvasRef.current) {
                        canvasRef.current.width = window.innerWidth;
                        canvasRef.current.height = window.innerHeight;
                    }
                });
            }
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
        let originalGetDisplayMedia = null;
        if (typeof navigator.mediaDevices !== 'undefined' &&
            typeof navigator.mediaDevices.getDisplayMedia === 'function') {
            screenCaptureSupported = true;

            // Override getDisplayMedia to detect screen recording attempts
            originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
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

        // Detect Assistive Touch screenshot (iOS specific)
        const detectAssistiveTouch = () => {
            if (!isIOS.current) return;

            // Assistive Touch detection is tricky, but we can listen for specific touch patterns
            let touchStartTime = 0;
            let lastTouchX = 0;
            let lastTouchY = 0;

            const handleTouchStart = (e) => {
                touchStartTime = Date.now();
                if (e.touches.length === 1) {
                    lastTouchX = e.touches[0].clientX;
                    lastTouchY = e.touches[0].clientY;
                }

                // Detect edge touches which might indicate Assistive Touch activation
                const touchX = e.touches[0]?.clientX || 0;
                const touchY = e.touches[0]?.clientY || 0;
                const edgeTolerance = 20;

                if (touchX < edgeTolerance ||
                    touchX > window.innerWidth - edgeTolerance ||
                    touchY < edgeTolerance ||
                    touchY > window.innerHeight - edgeTolerance) {
                    console.log('[SECURITY] Edge touch detected - possible Assistive Touch');
                }
            };

            const handleTouchEnd = (e) => {
                const touchDuration = Date.now() - touchStartTime;

                // Assistive Touch typically involves quick taps
                if (touchDuration < 200) {
                    setTimeout(() => {
                        // If we detect rapid visibility changes after a quick tap,
                        // it might be Assistive Touch screenshot
                        if (Date.now() - lastVisibilityChange.current < 500) {
                            console.log('[SECURITY] Possible Assistive Touch screenshot pattern');
                            handleScreenshotAttempt();
                        }
                    }, 300);
                }
            };

            document.addEventListener('touchstart', handleTouchStart, { passive: true });
            document.addEventListener('touchend', handleTouchEnd, { passive: true });

            return () => {
                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        };

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
        let cleanupAssistiveTouch = () => { };
        if (isIOS.current) {
            handleScreenBrightnessChange();
            detectIOSScreenshot();
            createProtectionCanvas();
            cleanupAssistiveTouch = detectAssistiveTouch();

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
                cleanupAssistiveTouch();

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
            }

            document.head.removeChild(styleElement);

            // Restore original getDisplayMedia if we modified it
            if (screenCaptureSupported && originalGetDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
            }

            clearTimeout(iosScreenshotTimeout);
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
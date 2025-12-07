'use client'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from './theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { NotificationProvider } from './notification-provider'
// import ModalProvider from './modal-provider'

export const Providers = ({ children }) => {
    return (
        <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem={false}
            disableTransitionOnChange
        >
            <ReactQueryProvider>
                <NotificationProvider>
                    {children}
                    {/* <ModalProvider /> */}
                    <Toaster position='top-center' />
                </NotificationProvider>
            </ReactQueryProvider>
        </ThemeProvider>
    )
}

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { PageTransition } from '@/components/PageTransition'
import { TapSparkles } from '@/components/ui/TapSparkles'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

const fraunces = Fraunces({
    variable: '--font-fraunces',
    subsets: ['latin'],
    weight: ['600'],
})

export const metadata: Metadata = {
    title: 'H+O Trivia',
    description: 'A trivia app for two',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'H+O Trivia',
    },
    icons: {
        icon: '/icon-192.png',
        apple: '/apple-touch-icon.png',
    },
}

export const viewport: Viewport = {
    themeColor: '#578BC8',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased bg-cream`}>
        <ProfileProvider>
            <div className="mx-auto min-h-screen max-w-md">
                <PageTransition>{children}</PageTransition>
            </div>
        </ProfileProvider>
        <TapSparkles />
        </body>
        </html>
    )
}
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ProfileProvider } from '@/contexts/ProfileContext'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Us Trivia',
    description: 'A trivia app for two',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Us Trivia',
    },
    icons: {
        icon: '/icon-192.png',
        apple: '/apple-touch-icon.png',
    },
}

export const viewport: Viewport = {
    themeColor: '#f4adcf',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ProfileProvider>{children}</ProfileProvider>
        </body>
        </html>
    )
}
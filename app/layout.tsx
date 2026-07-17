import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { DeferredAnalytics } from '@/components/deferred-analytics'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LOKAMARK — Verifikasi Keaslian Naskah Kuno Bali',
  description:
    'LOKAMARK adalah platform verifikasi keaslian naskah kuno (lontar) Bali. Pindai QR Code atau masukkan ID Naskah untuk memastikan keasliannya.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1c1b19',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' ? <DeferredAnalytics /> : null}
      </body>
    </html>
  )
}

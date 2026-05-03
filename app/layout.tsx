import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'KasirPro',
  description: 'Sistem Point of Sale',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/ConditionalLayout'

export const metadata: Metadata = {
  title: 'SAFERR - Product Authentication System',
  description: 'Protect your brand and empower consumers with secure product authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
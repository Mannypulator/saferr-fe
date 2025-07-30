import React, { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  )
}
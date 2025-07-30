'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation' // Changed from next/router
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated and initial check is done
      router.push('/login') // Updated path
    }
  }, [isAuthenticated, isLoading, router])

  // Show a loading state while checking auth status
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )
    )
  }

  // Don't render content if not authenticated (while redirecting)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render the protected content
  return <>{children}</>
}

export default ProtectedRoute
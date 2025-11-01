'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the token from URL parameters
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      
      if (token && type === 'signup') {
        // Verify the signup token
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash: token,
        })
        
        if (!error && data?.user) {
          // Successfully verified, redirect to profile creation
          router.push('/profile-creation')
          return
        }
      }
      
      // If user is already authenticated or verification successful
      if (user) {
        router.push('/profile-creation')
        return
      }
      
      // If no token or verification failed, redirect to home
      router.push('/')
    }
    
    handleAuthCallback()
  }, [user, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto mb-4"></div>
        <p className="text-[#37322F]">Confirming your email and redirecting...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto mb-4"></div>
          <p className="text-[#37322F]">Confirming your email and redirecting...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
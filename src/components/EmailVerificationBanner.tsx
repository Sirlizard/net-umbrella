import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth()

  const resendVerification = async () => {
    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      
      if (error) {
        console.error('Error resending verification:', error.message)
        alert('Error resending verification email. Please try again.')
      } else {
        alert('Verification email sent! Please check your inbox.')
      }
    }
  }

  // Only show if user exists but email is not confirmed
  if (!user || user.email_confirmed_at) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-yellow-600"></div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please check your email and click the verification link to complete your account setup.
            </p>
          </div>
        </div>
        <button
          onClick={resendVerification}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
        >
          Resend Email
        </button>
      </div>
    </div>
  )
}

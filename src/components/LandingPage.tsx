import React from 'react'
import { Umbrella, ArrowRight } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Umbrella className="w-7 h-7 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Net-umbrella</span>
          </div>
          <div>
            <button
              onClick={onSignIn}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            A simple way to remember and manage personal connections
          </h1>
          <p className="text-gray-600 mb-8">
            Log interactions, set reminders you control, and keep a private record of your relationships. This is a demo — no personal data is shown here.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>

            <button
              onClick={onSignIn}
              className="px-6 py-3 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            No tracking of external platforms. Data shown in the app can be demo content.
          </div>
        </div>
      </main>
    </div>
  )
}
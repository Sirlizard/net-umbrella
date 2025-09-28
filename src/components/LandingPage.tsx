import React from 'react'
import { Umbrella, Users, MessageCircle, BarChart3, Heart, Star, ArrowRight, Check } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Umbrella className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Net-umbrella</span>
          </div>
          <button
            onClick={onSignIn}
            className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Join thousands building better friendships
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Never Lose Touch with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Amazing Friends</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your relationships with intelligent friendship management. Track conversations, get reminders, and build deeper connections that last a lifetime.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg text-gray-700">Smart contact reminders based on your preferences</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg text-gray-700">Track conversations across all platforms</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg text-gray-700">Beautiful analytics and insights</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Friendships Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Side - Hero Image/Visual */}
          <div className="lg:pl-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Friendship Network
                  </h3>
                  <p className="text-gray-600">
                    See how Net-umbrella helps you stay connected
                  </p>
                </div>

                {/* Mock Dashboard Preview */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Sarah Chen</div>
                      <div className="text-sm text-green-600">Last contact: 2 days ago</div>
                    </div>
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Marcus Johnson</div>
                      <div className="text-sm text-yellow-600">Last contact: 1 week ago</div>
                    </div>
                    <MessageCircle className="w-5 h-5 text-yellow-500" />
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
                      E
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Elena Rodriguez</div>
                      <div className="text-sm text-red-500">Last contact: 3 weeks ago</div>
                    </div>
                    <MessageCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={onGetStarted}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold transform hover:scale-105"
                  >
                    Start Managing Your Friendships
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-indigo-100 rounded-xl w-fit mb-6">
              <MessageCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically track conversations across Instagram, WhatsApp, SMS, and more. Never wonder when you last spoke again.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-purple-100 rounded-xl w-fit mb-6">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Beautiful Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Get insights into your friendship patterns, response times, and discover who you should reach out to next.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="p-3 bg-green-100 rounded-xl w-fit mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Deeper Connections</h3>
            <p className="text-gray-600 leading-relaxed">
              Build stronger relationships with personalized reminders and conversation starters tailored to each friend.
            </p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Friendships?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people who never lose touch with the people they care about.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Your Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-full border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-200"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1 text-red-400" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-blue-400" />
              <span>Unlimited friends</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
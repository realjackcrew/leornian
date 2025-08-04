import { Link } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import LogoMarquee from '../components/LogoScroll';
export default function Home() {
  const { token, user } = useContext(AuthContext);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-black flex flex-col justify-end items-center">
      <div className="flex flex-col items-stretch justify-end w-full max-w-4xl px-4 space-y-1" style={{ minHeight: '80vh', marginBottom: '4vh' }}>
        <h1 className="flex flex-col space-y-4 w-full max-w-5xl mx-auto px-4">
          <span className="block text-5xl sm:text-7xl md:text-8xl font-extrabold text-left animate-fadein-slow delay-400">
            <span className="text-white">Know</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">More.</span>
          </span>
          <span className="block text-5xl sm:text-7xl md:text-8xl font-extrabold text-left animate-fadein-slow delay-1400 ml-12 sm:ml-16 md:ml-24">
            <span className="text-white">Feel</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Better.</span>
          </span>
          <span className="block text-5xl sm:text-7xl md:text-8xl font-extrabold text-left animate-fadein-slow delay-2400 ml-24 sm:ml-32 md:ml-48">
            <span className="text-white">Live</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Smarter.</span>
          </span>
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-gray-300 text-center max-w-2xl mx-auto animate-fadein delay-3400">
          Your personal wellness companion, powered by AI to help you track and optimize your health journey.
        </p>
        <div className="mt-6 animate-fadein delay-4000 text-center">
          <Link
            to="/register"
            className="inline-flex justify-center bg-white text-black font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-xl"
          >
            Early Access
          </Link>
        </div>
      </div>
      {}
      <style>{`
        .animate-fadein { opacity: 0; animation: fadein 1.5s forwards; }
        .animate-fadein-slow { opacity: 0; animation: fadein 2.2s forwards; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-1400 { animation-delay: 1.4s; }
        .delay-2400 { animation-delay: 2.4s; }
        .delay-3400 { animation-delay: 3.4s; }
        .delay-4000 { animation-delay: 4s; }
        @keyframes fadein { to { opacity: 1; } }
      `}</style>
      {}
      <div className="bg-black text-white min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Analytics
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Transform your health data into actionable insights with our advanced AI algorithms. 
                Track patterns, identify trends, and understand your wellness journey like never before.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time data processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Predictive health modeling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Personalized recommendations</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-gray-800">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    <div className="w-16 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-8 h-8 bg-blue-400 rounded-lg mb-2"></div>
                      <div className="w-full h-2 bg-gray-600 rounded mb-1"></div>
                      <div className="w-3/4 h-2 bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-8 h-8 bg-purple-400 rounded-lg mb-2"></div>
                      <div className="w-full h-2 bg-gray-600 rounded mb-1"></div>
                      <div className="w-1/2 h-2 bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-8 h-8 bg-green-400 rounded-lg mb-2"></div>
                      <div className="w-full h-2 bg-gray-600 rounded mb-1"></div>
                      <div className="w-5/6 h-2 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1 bg-gray-800/50 rounded-lg p-4">
                      <div className="w-full h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded"></div>
                    </div>
                    <div className="flex-1 bg-gray-800/50 rounded-lg p-4">
                      <div className="w-full h-20 bg-gradient-to-r from-purple-400/20 to-green-400/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black">
        <LogoMarquee />
      </div>
      {}
      <div className="bg-black text-white min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-2xl p-8 border border-gray-700">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="w-24 h-3 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-full h-3 bg-gray-600 rounded mb-2"></div>
                      <div className="w-3/4 h-3 bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-full h-3 bg-gray-600 rounded mb-2"></div>
                      <div className="w-5/6 h-3 bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="w-full h-3 bg-gray-600 rounded mb-2"></div>
                      <div className="w-2/3 h-3 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-16 h-8 bg-green-400 rounded-lg"></div>
                    <div className="w-16 h-8 bg-gray-600 rounded-lg"></div>
                    <div className="w-16 h-8 bg-gray-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Personalized <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  Recommendations
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Get tailored suggestions that adapt to your unique lifestyle and goals. 
                Our AI learns from your patterns to provide increasingly accurate and helpful recommendations.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Adaptive learning algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Lifestyle-based suggestions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Goal-oriented planning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="bg-black text-white min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Seamless <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Integration
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect all your WHOOP devices and apps in one place. From WHOOP wearables to WHOOP medical devices, we bring your WHOOP data together for a complete health picture.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">1+ platform integrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Secure data handling</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-gray-800">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-400 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-16 h-3 bg-gray-600 rounded mb-1"></div>
                        <div className="w-12 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-400 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-20 h-3 bg-gray-600 rounded mb-1"></div>
                        <div className="w-14 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-400 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-18 h-3 bg-gray-600 rounded mb-1"></div>
                        <div className="w-10 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-14 h-3 bg-gray-600 rounded mb-1"></div>
                        <div className="w-8 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
                  <div className="w-full h-16 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
      <footer className="bg-black text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link to="/chat" className="hover:text-blue-400 transition-colors">Chat</Link></li>
                <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/settings" className="hover:text-blue-400 transition-colors">Settings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">About Leornian</h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                Your intelligent wellness companion that transforms health data into actionable insights. 
                Powered by advanced AI, we help you understand your body, optimize your routines, and achieve your health goals with precision and clarity.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">📧  jack [at] jackcrew [dot] net</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} Leornian. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
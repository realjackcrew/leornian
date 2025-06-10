import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import imageSource from '../assets/boatmonet.png';
import LogoMarquee from '../components/LogoScroll';

export default function Home() {
  const { token, userName } = useContext(AuthContext);

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section with Video Background */}
      <div className="relative w-full h-screen">
        <img
          src={imageSource}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-black/20 to-black/50"></div>

        <div className="absolute inset-0 flex items-center justify-left text-left px-4">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-sans text-white mb-6">
            Every Moment Counts. Leo Makes Yours Smarter.
            </h1>
            <Link 
              to="/register" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Early Access
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-[#2c333a] text-gray-800 dark:text-[#eef3f7] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Track Your Progress</h3>
              <p className="text-gray-600">Monitor your wellness journey with detailed analytics and insights.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Smart Insights</h3>
              <p className="text-gray-600">Get personalized recommendations based on your data.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Community Support</h3>
              <p className="text-gray-600">Connect with others on similar wellness journeys.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Logos Marquee */}
      <LogoMarquee />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link to="/pages/Chat" className="hover:text-blue-600 transition-colors">Chat</Link></li>
                <li><Link to="/pages/Dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/pages/Settings" className="hover:text-blue-600 transition-colors">Settings</Link></li>
              </ul>
            </div>
            <div className="col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">About Leornian</h4>
              <p className="text-gray-600">
                Your personal wellness companion, helping you track and improve your health journey.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact</h4>
              <p className="text-gray-600">
                Have questions? Reach out to us at support@leornian.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p>&copy; {new Date().getFullYear()} Leornian. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
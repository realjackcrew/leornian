import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Settings, MessageCircle, BarChart3 } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolledPastLanding, setScrolledPastLanding] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolledPastLanding(currentScrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Determine navbar styles based on scroll position and page
  const getNavbarStyles = () => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return 'hidden';
    }
    if (isHomePage) {
      return scrolledPastLanding 
        ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200/20 text-gray-800' 
        : 'bg-transparent text-white';
    }
    return 'bg-white border-b border-gray-200 text-gray-800';
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 font-sans ${getNavbarStyles()}`}
    >
      <div className="flex items-center space-x-8">
        <Link 
          to="/" 
          className="text-2xl font-light tracking-wide hover:opacity-80 transition-opacity"
        >
          Leornian
        </Link>
        <Link 
          to="/chat" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity" 
          title="Chat"
        >
          <MessageCircle size={20} />
          <span className="text-lg font-light">Chat</span>
        </Link>
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity" 
          title="Dashboard"
        >
          <BarChart3 size={20} />
          <span className="text-lg font-light">Dashboard</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        {user ? (
          <div className="relative group">
            <button className="text-lg font-light hover:opacity-80 transition-opacity">
              Hello, {user.username}
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white text-gray-800 text-base p-3 rounded-lg shadow-lg border border-gray-200 min-w-[120px]">
              <button 
                onClick={onLogout}
                className="w-full text-left hover:text-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to="/login" 
            className={`${
              scrolledPastLanding 
                ? 'text-blue-600 hover:text-blue-700' 
                : 'text-white hover:text-white/80'
            } px-4 py-2 rounded-lg transition-all duration-200 font-light text-lg`}
          >
            Login
          </Link>
        )}
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        
        <Link 
          to="/settings"
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          title="Settings"
        >
          <Settings size={22} />
        </Link>
      </div>
    </nav>
  );
}
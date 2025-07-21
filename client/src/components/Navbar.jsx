import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, MessageCircle, BarChart3 } from 'lucide-react';

// User dropdown component
function UserDropdown({ user, onLogout, getButtonStyles }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div 
      className="relative user-dropdown"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className={`px-4 py-2 rounded-lg transition-all duration-200 text-lg hover:opacity-80 transition-opacity`}
      >
        Hello, {user.preferredName || user.firstName || 'There'}
      </button>
      
      <div className={`absolute right-0 top-full mt-2 transition-all duration-300 ease-out transform ${
        isOpen 
          ? 'opacity-100 visible translate-y-0' 
          : 'opacity-0 invisible -translate-y-2'
      }`}>
        <div className="rounded-lg min-w-[140px] overflow-hidden">
          <button 
            onClick={handleLogout}
            className={`w-full text-right px-3 py-2 text-white-600 hover:text-red-700 transition-colors duration-200 text-sm hover:opacity-80 transition-opacity`}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ user, onLogout }) {
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

  // Determine navbar styles based on scroll position and page
  const getNavbarStyles = () => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      return 'hidden';
    }
    if (isHomePage) {
      return scrolledPastLanding 
        ? 'bg-black/95 backdrop-blur-sm border-transparent text-white' 
        : 'bg-transparent text-white';
    }
    return 'bg-black/95 backdrop-blur-sm border-transparent text-white';
  };

  // Determine button colors based on scroll and login status
  const getButtonStyles = () => {
    if (isHomePage && !scrolledPastLanding) {
      return 'text-white hover:text-white/80 hover:bg-white/10';
    }
    if (isHomePage && scrolledPastLanding) {
      return 'text-white hover:text-white/80 hover:bg-white/10';
    }
    return 'text-white hover:text-white/80 hover:bg-white/10';
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${getNavbarStyles()}`}
    >
      <div className="flex items-center space-x-8">
        <Link 
          to="/" 
          className="text-2xl tracking-wide hover:opacity-80 transition-opacity"
        >
          Leornian
        </Link>
        <Link 
          to="/chat" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity" 
          title="Chat"
        >
          <MessageCircle size={20} />
          <span className="text-lg">Chat</span>
        </Link>
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity" 
          title="Dashboard"
        >
          <BarChart3 size={20} />
          <span className="text-lg">Dashboard</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-6">
        {user ? (
          <UserDropdown user={user} onLogout={onLogout} getButtonStyles={getButtonStyles} />
        ) : (
          <Link 
            to="/login" 
            className="text-lg hover:opacity-80 transition-opacity"
          >
            Log In
          </Link>
        )}
        

        
        <Link 
          to="/settings"
          className="hover:opacity-80 transition-opacity"
          title="Settings"
        >
          <Settings size={22} />
        </Link>
      </div>
    </nav>
  );
}
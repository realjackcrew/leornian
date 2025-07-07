import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import Chat from './pages/Chat'
import Settings from './pages/Settings';
import WhoopCallback from './pages/WhoopCallback';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';


export default function App() {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/whoop-callback" element={<WhoopCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log" element={<Log />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
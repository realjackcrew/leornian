import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Leornian</h1>
      <p className="mb-4">Your productivity assistant.</p>
      <Link to="/login" className="text-blue-600 underline">Login</Link>
      <br />
      <Link to="/register" className="text-blue-600 underline">Register</Link>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import LogoMarquee from '../components/LogoScroll';

export default function Home() {
  const { token, user } = useContext(AuthContext);
  const canvasRef = useRef(null);

  // Bright streak lines with gravitational bending
  useEffect(() => {
         const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;

         let width = canvas.width = window.innerWidth;
     let height = canvas.height = window.innerHeight;
     
     // Set canvas CSS size to match device pixel ratio for crisp rendering
     canvas.style.width = width + 'px';
     canvas.style.height = height + 'px';

    const starPos = { x: width * 0.75 + 12, y: height * 0.5 }; // star center - positioned in right column
    const lines = [];
    const G = 30000; // tweak for stronger / weaker bending

    function spawnLine() {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      const speed = 1.5 + Math.random() * 1; // slower motion
      switch (side) {
        case 0: // top
          x = Math.random() * width;
          y = -20;
          vx = (Math.random() - 0.5);
          vy = speed;
          break;
        case 1: // bottom
          x = Math.random() * width;
          y = height + 20;
          vx = (Math.random() - 0.5);
          vy = -speed;
          break;
        case 2: // left
          x = -20;
          y = Math.random() * height;
          vx = speed;
          vy = (Math.random() - 0.5);
          break;
        default: // right
          x = width + 20;
          y = Math.random() * height;
          vx = -speed;
          vy = (Math.random() - 0.5);
      }
      lines.push({ x, y, vx, vy, life: 0, length: 0, history: [] });
    }

    let lastSpawn = 0;
    const spawnInterval = 120; // ms - slightly slower spawning
    let prev = performance.now();

         function animate(now) {
       const dt = (now - prev) / 1000;
       prev = now;

       // Clear the entire canvas
       ctx.clearRect(0, 0, width, height);

      // spawn new line regularly
      if (now - lastSpawn > spawnInterval) {
        spawnLine();
        lastSpawn = now;
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';

      lines.forEach((l) => {
        // gravitational bending
        const dx = starPos.x - l.x;
        const dy = starPos.y - l.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 260 * 260) {
          const dist = Math.sqrt(distSq);
          const accel = G / (distSq + 1);
          l.vx += (dx / dist) * accel * dt;
          l.vy += (dy / dist) * accel * dt;
        }

        // Store current position in history
        l.history.push({ x: l.x, y: l.y });
        
        // Keep only recent history (last 50 positions)
        if (l.history.length > 50) {
          l.history.shift();
        }
        
        l.x += l.vx;
        l.y += l.vy;
        l.length += Math.sqrt(l.vx * l.vx + l.vy * l.vy) * dt;

        // draw comet tail following actual path
        const trailLength = 200; // about the width of the early access button
        const maxHistoryPoints = Math.min(l.history.length, 30);
        
        for (let i = 0; i < maxHistoryPoints - 1; i++) {
          const t = i / maxHistoryPoints;
          const opacity = t * 0.8; // taper from 0 to 0.8 (head is brightest)
          const width = t * 5; // taper from 0 to 5px (head is thickest)
          
          ctx.lineWidth = width;
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
          
          ctx.beginPath();
          ctx.moveTo(l.history[i].x, l.history[i].y);
          ctx.lineTo(l.history[i + 1].x, l.history[i + 1].y);
          ctx.stroke();
        }
        
        l.life += dt;
      });

      // remove old lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];
        if (l.x < -200 || l.x > width + 200 || l.y < -200 || l.y > height + 200 || l.life > 8) {
          lines.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

         const handleResize = () => {
       width = canvas.width = window.innerWidth;
       height = canvas.height = window.innerHeight;
       canvas.style.width = width + 'px';
       canvas.style.height = height + 'px';
       starPos.x = width * 0.75 + 12;
       starPos.y = height * 0.5;
     };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full">
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0">
          <div className="subtle-grid"></div>
          <div className="background-gradient"></div>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>
          <div className="floating-shapes">
            <div className="floating-shape shape-bg-1"></div>
            <div className="floating-shape shape-bg-2"></div>
            <div className="floating-shape shape-bg-3"></div>
            <div className="floating-shape shape-bg-4"></div>
            <div className="floating-shape shape-bg-5"></div>
            <div className="floating-shape shape-bg-6"></div>
          </div>
          <div className="background-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`bg-particle bg-particle-${i + 1}`}></div>
            ))}
          </div>
          {/* dynamic-lines removed per new streak canvas */}
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
              
              {/* Left Side - Content */}
              <div className="flex flex-col justify-end space-y-8 pt-20">
                <div>
                  <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                    Know <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">More. </span><br />
                    Feel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Better.</span>
                    <br />
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Smarter.</span>
                  </h1>
                  <p className="text-xl text-gray-300 mb-8 max-w-lg">
                    Your personal wellness companion, powered by AI to help you track and optimize your health journey.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center bg-white text-black font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-xl"
                  >
                    Early Access
                  </Link>
                </div>
              </div>

              {/* Right Side - Dynamic Graphic */}
              <div className="hidden lg:flex justify-center items-center h-full">
                <div className="relative w-full max-w-lg h-96">
                  
                  {/* Central Node */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="central-node"></div>
                  </div>
                  
                  {/* Orbiting Elements */}
                  <div className="orbit-container orbit-1">
                    <div className="orbit-path">
                      <div className="orbit-element element-1"></div>
                    </div>
                  </div>
                  
                  <div className="orbit-container orbit-2">
                    <div className="orbit-path">
                      <div className="orbit-element element-2"></div>
                    </div>
                  </div>
                  
                  <div className="orbit-container orbit-3">
                    <div className="orbit-path">
                      <div className="orbit-element element-3"></div>
                    </div>
                  </div>
                  
                  {/* data streams removed */}
                  
                  {/* Floating Data Points */}
                  <div className="data-points">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`data-point data-point-${i + 1}`}></div>
                    ))}
                  </div>
                  
                  {/* connection lines removed */}
                  
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Gradient fade at bottom of hero section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20"></div>
      </div>

      {/* AI-Powered Analytics Section */}
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

      {/* Company Logos Marquee */}
      <div className="bg-black">
        <LogoMarquee />
      </div>

      {/* Personalized Recommendations Section */}
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

      {/* Seamless Integration Section */}
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
                Connect all your health devices and apps in one place.<sup>*</sup> From wearables to medical devices, we bring your data together for a complete health picture.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">1+ device integrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Secure data handling</span>
                </div>
                <p className="text-gray-300 text-xs opacity-50">
                  <sup>*</sup> Only applies if you are a fellow WHOOP supremacist.
                </p>
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

      {/* Footer */}
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
                  <span className="text-gray-500">📧</span>
                  <a href="mailto:jack@jackcrew.net" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    jack@jackcrew.net
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">💬</span>
                  <span className="text-gray-400">Questions? We actually read our emails!</span>
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
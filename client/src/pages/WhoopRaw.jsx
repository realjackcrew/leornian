import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { format, subDays } from 'date-fns';
import { API_BASE_URL } from '../config';

export default function WhoopDebugger() {
  const { token } = useContext(AuthContext);
  const [authSteps, setAuthSteps] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepCounter, setStepCounter] = useState(0);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl">
        Please log in to use the WHOOP API Debugger.
      </div>
    );
  }

  const addStep = (step, status, message, data = null) => {
    const timestamp = new Date().toISOString();
    setStepCounter(prev => prev + 1);
    setAuthSteps(prev => [...prev, {
      step,
      status,
      message,
      data,
      timestamp,
      id: `${step}-${Date.now()}-${stepCounter}`
    }]);
  };

  const clearSteps = () => {
    setAuthSteps([]);
    setProfileData(null);
    setIsAuthenticated(false);
    setCycleData(null);
    setStepCounter(0);
  };

  const debugAuthentication = async () => {
    setLoading(true);
    clearSteps();
    
    try {
      addStep('INIT', 'info', 'Starting WHOOP API authentication debug process...');
      
      // Step 1: Token Analysis
      addStep('TOKEN_ANALYSIS', 'info', 'Analyzing JWT token...', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...',
        tokenEnd: '...' + token.substring(token.length - 20),
        hasToken: !!token
      });

      // Step 2: Database Token Check
      addStep('DB_CHECK', 'info', 'Checking database for WHOOP credentials...');
      
      const dbCheckRes = await fetch(`${API_BASE_URL}/api/whoop/debug`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!dbCheckRes.ok) {
        const errorText = await dbCheckRes.text();
        addStep('DB_CHECK', 'error', `Database check failed: ${dbCheckRes.status}`, {
          status: dbCheckRes.status,
          statusText: dbCheckRes.statusText,
          error: errorText
        });
        return;
      }
      
      const dbResult = await dbCheckRes.json();
      addStep('DB_CHECK', 'success', 'Database credentials found', dbResult);

      // Step 3: WHOOP Profile Request
      addStep('PROFILE_REQUEST', 'info', 'Attempting to fetch WHOOP user profile...');
      
      const profileRes = await fetch(`${API_BASE_URL}/api/whoop/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const profileResponseHeaders = {};
      profileRes.headers.forEach((value, key) => {
        profileResponseHeaders[key] = value;
      });
      
      addStep('PROFILE_HEADERS', 'info', 'Profile response headers received', {
        status: profileRes.status,
        statusText: profileRes.statusText,
        headers: profileResponseHeaders
      });
      
      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        addStep('PROFILE_REQUEST', 'error', `Profile request failed: ${profileRes.status}`, {
          status: profileRes.status,
          statusText: profileRes.statusText,
          error: errorText,
          url: `${API_BASE_URL}/api/whoop/profile`
        });
        setIsAuthenticated(false);
        return;
      }
      
      const profile = await profileRes.json();
      setProfileData(profile);
      addStep('PROFILE_REQUEST', 'success', 'Profile data retrieved successfully', profile);
      
      // Step 4: Authentication Verification
      if (profile && (profile.user_id || profile.id)) {
        setIsAuthenticated(true);
        addStep('AUTH_VERIFIED', 'success', 'WHOOP authentication fully verified!', {
          userId: profile.user_id || profile.id,
          email: profile.email,
          name: `${profile.first_name} ${profile.last_name}`
        });
      } else {
        setIsAuthenticated(false);
        addStep('AUTH_VERIFIED', 'error', 'Authentication verification failed - invalid profile data');
      }
      
    } catch (error) {
      addStep('NETWORK_ERROR', 'error', `Network error: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    if (!isAuthenticated) {
      addStep('CYCLES_ERROR', 'error', 'Cannot fetch cycles - authentication not verified');
      return;
    }
    
    setLoading(true);
    setCycleData(null);
    
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 60);
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      addStep('CYCLES_REQUEST', 'info', `Requesting cycles from ${startStr} to ${endStr}...`);
      
      const cyclesRes = await fetch(`${API_BASE_URL}/api/whoop/raw?start=${startStr}&end=${endStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const cyclesResponseHeaders = {};
      cyclesRes.headers.forEach((value, key) => {
        cyclesResponseHeaders[key] = value;
      });
      
      addStep('CYCLES_HEADERS', 'info', 'Cycles response headers', {
        status: cyclesRes.status,
        statusText: cyclesRes.statusText,
        headers: cyclesResponseHeaders
      });
      
      if (!cyclesRes.ok) {
        const errorText = await cyclesRes.text();
        addStep('CYCLES_REQUEST', 'error', `Cycles request failed: ${cyclesRes.status}`, {
          status: cyclesRes.status,
          statusText: cyclesRes.statusText,
          error: errorText,
          url: `${API_BASE_URL}/api/whoop/raw?start=${startStr}&end=${endStr}`
        });
        return;
      }
      
      const cycles = await cyclesRes.json();
      setCycleData(cycles);
      addStep('CYCLES_REQUEST', 'success', `Retrieved ${cycles.cycles?.length || 0} cycles`, {
        cycleCount: cycles.cycles?.length || 0,
        sleepCount: cycles.sleep?.length || 0,
        recoveryCount: cycles.recovery?.length || 0,
        workoutCount: cycles.workouts?.length || 0
      });
      
    } catch (error) {
      addStep('CYCLES_ERROR', 'error', `Error fetching cycles: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-900';
      case 'error': return 'text-red-400 bg-red-900';
      case 'info': return 'text-blue-400 bg-blue-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">WHOOP API Debugger</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center">
          <button 
            onClick={debugAuthentication} 
            disabled={loading}
            className="px-8 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Debugging...' : 'Debug Authentication'}
          </button>
          
          <button 
            onClick={fetchCycles} 
            disabled={loading || !isAuthenticated}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition ${
              isAuthenticated 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? 'Loading...' : 'Fetch Last 60 Days Cycles'}
          </button>
          
          <button 
            onClick={clearSteps}
            className="px-6 py-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition"
          >
            Clear Debug Log
          </button>
        </div>

        {/* Authentication Status */}
        {isAuthenticated && profileData && (
          <div className="bg-green-900 border-l-4 border-green-500 p-4 mb-6">
            <h2 className="text-green-200 font-semibold text-lg mb-2">🎉 Authentication Successful!</h2>
            <div className="text-green-100 space-y-1">
              <p><strong>User ID:</strong> {profileData.user_id || profileData.id}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Name:</strong> {profileData.first_name} {profileData.last_name}</p>
            </div>
          </div>
        )}

        {/* Debug Steps Log */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {authSteps.length === 0 ? (
              <p className="text-gray-400">No debug steps yet. Click "Debug Authentication" to start.</p>
            ) : (
              authSteps.map((step) => (
                <div key={step.id} className={`p-3 rounded-lg border-l-4 ${getStatusColor(step.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{getStatusIcon(step.status)}</span>
                      <span className="font-semibold">{step.step}</span>
                    </div>
                    <span className="text-xs opacity-75">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mb-2">{step.message}</p>
                  {step.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                        View Raw Data
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-black rounded overflow-x-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cycle Data Display */}
        {cycleData && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cycle Data (Last 60 Days)</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{cycleData.cycles?.length || 0}</div>
                <div className="text-gray-300">Cycles</div>
              </div>
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{cycleData.sleep?.length || 0}</div>
                <div className="text-gray-300">Sleep Records</div>
              </div>
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{cycleData.recovery?.length || 0}</div>
                <div className="text-gray-300">Recovery Records</div>
              </div>
              <div className="bg-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{cycleData.workouts?.length || 0}</div>
                <div className="text-gray-300">Workouts</div>
              </div>
            </div>

            {cycleData.cycles && cycleData.cycles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Cycles</h3>
                {cycleData.cycles.slice(0, 5).map((cycle, idx) => (
                  <div key={cycle.id || idx} className="bg-gray-800 rounded p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">ID:</span> {cycle.id}
                      </div>
                      <div>
                        <span className="text-gray-400">State:</span> {cycle.score_state}
                      </div>
                      <div>
                        <span className="text-gray-400">Start:</span> {new Date(cycle.start).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-400">End:</span> {cycle.end ? new Date(cycle.end).toLocaleString() : 'Current'}
                      </div>
                      {cycle.score && (
                        <>
                          <div>
                            <span className="text-gray-400">Strain:</span> {cycle.score.strain?.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-gray-400">Avg HR:</span> {cycle.score.average_heart_rate} bpm
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {cycleData.cycles.length > 5 && (
                  <p className="text-gray-400 text-center">
                    ... and {cycleData.cycles.length - 5} more cycles
                  </p>
                )}
              </div>
            )}

            <details className="mt-6">
              <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold">
                View Complete Raw Data
              </summary>
              <pre className="text-xs mt-4 p-4 bg-black rounded overflow-x-auto max-h-96">
                {JSON.stringify(cycleData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
} 
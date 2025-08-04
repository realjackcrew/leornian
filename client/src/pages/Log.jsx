import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog, updateLog, getLogByDate } from '../api/log';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Check, X, Lock } from 'lucide-react';
import { useEnabledDatapoints, getDefaultValues, getCategoryNames } from '../components/Datapoints';
import { getCurrentCentralDate, formatDateAsCentral, isSameDayInCentral } from '../utils/dateUtils';
import { fetchWhoopData } from '../api/auth';
import whoopIcon from '../assets/whoop-icon.png';
export default function Log() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dataPointDefinitions, loading: datapointsLoading, error: datapointsError } = useEnabledDatapoints();
  useEffect(() => {
    if (!datapointsLoading && dataPointDefinitions) {
      console.log('[SLEEP] Sleep category fields:', Object.keys(dataPointDefinitions.sleep || {}));
      if (dataPointDefinitions.sleep && (!dataPointDefinitions.sleep.bedtime || !dataPointDefinitions.sleep.wakeTime)) {
        dataPointDefinitions.sleep.bedtime = { type: 'time', label: 'Last night\'s bedtime' };
        dataPointDefinitions.sleep.wakeTime = { type: 'time', label: 'This morning\'s wake time' };
      }
    }
  }, [datapointsLoading, dataPointDefinitions, datapointsError]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [values, setValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingLogId, setExistingLogId] = useState(null);
  const [isFutureDate, setIsFutureDate] = useState(false);
  const [isWhoopLoading, setIsWhoopLoading] = useState(false);
  const [whoopError, setWhoopError] = useState(null);
  const [whoopPopulated, setWhoopPopulated] = useState({});
  const getMissingDataMessage = (dataType) => {
    const messages = {
      sleep: 'No sleep data available for this date',
      recovery: 'No recovery data available for this date', 
      workouts: 'No workout data available for this date'
    };
    return messages[dataType] || `No ${dataType} data available`;
  };
  const isDatapointMissingFromWhoop = (category, datapointKey) => {
    if (whoopPopulated[category] && whoopPopulated[category][datapointKey] === true) {
      return false; 
    }
    return true; 
  };
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-900 rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full animate-fadein">
          <Lock size={48} className="text-white mb-4" />
          <div className="text-3xl font-bold mb-2 text-white">Sign in required</div>
          <div className="text-lg text-white/80 mb-6 text-center">You need to be logged in to access this page. Please log in to continue.</div>
          <Link to="/login" className="px-8 py-3 bg-black/80 rounded-lg text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform border border-white/10">Go to Login</Link>
        </div>
      </div>
    );
  }
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day); 
      setSelectedDate(parsedDate);
      const today = getCurrentCentralDate();
      if (parsedDate > today) {
        setIsFutureDate(true);
        setIsLoadingData(false);
        return;
      }
    } else {
      const today = getCurrentCentralDate();
      setSelectedDate(today);
    }
  }, [searchParams]);
  useEffect(() => {
    if (!datapointsLoading && !datapointsError) {
      const availableCategories = Object.keys(dataPointDefinitions);
      if (availableCategories.length > 0) {
        if (!selectedCategory || (!availableCategories.includes(selectedCategory) && selectedCategory !== 'notes')) {
          setSelectedCategory(availableCategories[0]);
        }
      } else {
        setSelectedCategory('notes');
      }
    }
  }, [dataPointDefinitions, datapointsLoading, datapointsError, selectedCategory]);
  const handleLoadFromWhoop = async () => {
    setIsWhoopLoading(true);
    setWhoopError(null);
    try {
      const dateString = formatDateAsCentral(selectedDate);
      const whoopResp = await fetchWhoopData(dateString);
      if (whoopResp && whoopResp.success) {
        const whoop = whoopResp.data || {};
        const populated = {};
        setValues(prevValues => {
          const newValues = JSON.parse(JSON.stringify(prevValues));
          Object.entries(newValues).forEach(([category, dataPoints]) => {
            if (category === 'sleep') {
              if (!dataPoints.bedtime) {
                dataPoints.bedtime = undefined;
              }
              if (!dataPoints.wakeTime) {
                dataPoints.wakeTime = undefined;
              }
              Object.entries(dataPoints).forEach(([key, value]) => {
                if (whoop[key] !== undefined) {
                  newValues[category][key] = whoop[key];
                  if (!populated[category]) populated[category] = {};
                  populated[category][key] = true;
                }
              });
            } else if (category === 'physicalHealth') {
              Object.entries(dataPoints).forEach(([key, value]) => {
                if (whoop[key] !== undefined) {
                  newValues[category][key] = whoop[key];
                  if (!populated[category]) populated[category] = {};
                  populated[category][key] = true;
                }
              });
            }
          });
          return newValues;
        });
        setWhoopPopulated(populated);
      } else {
        setWhoopError("Failed to load data from Whoop. An unknown issue occurred.");
      }
    } catch (whoopErr) {
      console.warn('Could not prepopulate with WHOOP data:', whoopErr);
      if (whoopErr.message && whoopErr.message.includes('WHOOP credentials have expired')) {
        alert('WHOOP connection has expired.\n\nYou can reconnect your WHOOP account in Settings > Integrations.');
        setWhoopError('WHOOP connection has expired. You can reconnect your WHOOP account in Settings > Integrations.');
      } else {
        alert('Failed to load data from Whoop. An unknown issue occurred.');
        setWhoopError(whoopErr.message || 'An unknown error occurred while fetching Whoop data.');
      }
    } finally {
      setIsWhoopLoading(false);
    }
  };
  useEffect(() => {
    if (!token || !selectedDate || isFutureDate) return;
    const loadExistingLog = async () => {
      setIsLoadingData(true);
      try {
        const dateString = formatDateAsCentral(selectedDate);
        const response = await getLogByDate(token, dateString);
        if (response) {
          const logData = response;
          setExistingLogId(logData.id);
          setNotes(logData.healthData.notes || '');
          const existingValues = getDefaultValues(dataPointDefinitions);
          if (logData.healthData.values) {
            Object.entries(logData.healthData.values).forEach(([category, dataPoints]) => {
              if (existingValues[category]) {
                Object.entries(dataPoints).forEach(([key, value]) => {
                  if (existingValues[category][key] !== undefined) {
                    existingValues[category][key] = value;
                  }
                });
              }
            });
          }
          setValues(existingValues);
        } else {
          setValues(getDefaultValues(dataPointDefinitions));
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
            setValues(getDefaultValues(dataPointDefinitions));
        } else {
          console.error('Error loading existing log:', error);
            setValues(getDefaultValues(dataPointDefinitions));
        }
      } finally {
        setIsLoadingData(false);
      }
    };
    loadExistingLog();
  }, [token, selectedDate, isFutureDate, dataPointDefinitions]);
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  const Toggle = ({ value, onChange, label, isWhoopPopulated = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center">
        <span className="inline-flex items-center justify-center w-6">
          {isWhoopPopulated && (
            <img src={whoopIcon} alt="WHOOP" className="w-4 h-4 opacity-70" />
          )}
        </span>
        <span className="text-gray-900 dark:text-white font-medium ml-2">{label}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onChange(true)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            value === true ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => onChange(false)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
            value === false ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
  const NumericInput = ({ value, onChange, label, min, max, step, isWhoopPopulated = false }) => {
    const [localValue, setLocalValue] = useState(value?.toString() || '');
    useEffect(() => {
      setLocalValue(value?.toString() || '');
    }, [value]);
    const handleBlur = () => {
      const numericValue = localValue === '' ? 0 : Number(localValue);
      onChange(numericValue);
    };
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-6">
            {isWhoopPopulated && (
              <img src={whoopIcon} alt="WHOOP" className="w-4 h-4 opacity-70" />
            )}
          </span>
          <span className="text-gray-900 dark:text-white font-medium ml-2">{label}</span>
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className="remove-arrow w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
        />
      </div>
    );
  };
  const TimeInput = ({ value, onChange, label, isWhoopPopulated = false }) => {
    if (label.includes('bedtime') || label.includes('wake time')) {
    }
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-6">
            {isWhoopPopulated && (
              <img src={whoopIcon} alt="WHOOP" className="w-4 h-4 opacity-70" />
            )}
          </span>
          <span className="text-gray-900 dark:text-white font-medium ml-2">{label}</span>
        </div>
        <input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-30 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" />
      </div>
    );
  };
  const updateValue = (categoryKey, dataPointKey, value) => {
    setValues(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [dataPointKey]: value
      }
    }));
  };
  const handleSave = async () => {
    if (!token || !selectedDate || isFutureDate) return;
    setIsLoading(true);
    try {
      const processedValues = {};
      Object.entries(values).forEach(([category, dataPoints]) => {
        processedValues[category] = {};
        Object.entries(dataPoints).forEach(([key, value]) => {
          processedValues[category][key] = value === null ? false : value;
        });
      });
      const healthData = {
        values: processedValues,
        notes,
        timezone: 'America/Chicago' 
      };
      if (existingLogId) {
        await updateLog(token, existingLogId, { healthData });
      } else {
        const logData = {
          healthData,
          date: formatDateAsCentral(selectedDate)
        };
        await createLog(token, logData);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving health log:', error);
      alert('Error saving log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  if (!token) return <p className="text-center mt-10 text-gray-900 dark:text-white">Please log in.</p>;
  if (datapointsLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading datapoints...</p>
          </div>
        </div>
      </div>
    );
  }
  if (datapointsError) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Error loading datapoints</p>
            <p className="text-gray-300">{datapointsError}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!selectedDate) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  if (isFutureDate) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8 pt-24">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-light text-white flex-1 text-center">Daily Log</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-300 mb-2">Cannot log for future dates</p>
            <p className="text-gray-400">You can only log entries for today or past dates</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center mb-8 pt-24">
          <div className="justify-self-start">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          <div className="text-center justify-self-center">
            <h1 className="text-3xl font-light text-white">Daily Log</h1>
            <p className="text-lg text-gray-300 mt-1">{selectedDate && formatDisplayDate(selectedDate)}</p>
          </div>
          <div className="justify-self-end">
            <div className="flex flex-col items-end">
              <button
                  onClick={handleLoadFromWhoop}
                  disabled={isWhoopLoading}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 py-2 px-4 rounded-lg inline-flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <img src="/src/assets/whoop-icon.png" alt="whoop" className="w-5 h-5 mr-2"/>
                  <span>{isWhoopLoading ? 'Loading...' : 'Load from Whoop'}</span>
              </button>
              {}
            </div>
          </div>
        </div>
        {}
        <div className="flex justify-between mb-8 border-b border-gray-700 pb-4">
          {getCategoryNames(dataPointDefinitions).map(({ key, name }) => (
            <span
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`text-lg cursor-pointer px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === key
                  ? 'text-blue-400 font-medium bg-blue-600/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {name}
            </span>
          ))}
          <span
            onClick={() => setSelectedCategory('notes')}
            className={`text-lg cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'notes'
                ? 'text-blue-400 font-medium bg-blue-600/20'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Notes
          </span>
        </div>
        {}
        <div className=" rounded-xl p-6">
          {isLoadingData || values === null ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading log data...</p>
            </div>
          ) : selectedCategory === 'notes' ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Do you have any additional thoughts or observations?"
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-900/50 text-white placeholder-gray-400"
                rows="4"
              />
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`w-full mt-6 flex justify-center items-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Log'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 border-transparent relative">
              {}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              {Object.entries(dataPointDefinitions[selectedCategory] || {}).map(([key, def]) => {
                return (
                  <div key={key}>
                    {def.type === 'boolean' ? (
                      <Toggle
                        value={values[selectedCategory][key]}
                        onChange={(value) => updateValue(selectedCategory, key, value)}
                        label={def.label}
                        isWhoopPopulated={!!whoopPopulated[selectedCategory]?.[key]}
                      />
                    ) : def.type === 'time' ? (
                      <TimeInput
                        value={values[selectedCategory][key]}
                        onChange={(value) => updateValue(selectedCategory, key, value)}
                        label={def.label}
                        isWhoopPopulated={!!whoopPopulated[selectedCategory]?.[key]}
                      />
                    ) : (
                      <NumericInput
                        value={values[selectedCategory][key]}
                        onChange={(value) => updateValue(selectedCategory, key, value)}
                        label={def.label}
                        min={def.min}
                        max={def.max}
                        step={def.step}
                        isWhoopPopulated={!!whoopPopulated[selectedCategory]?.[key]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
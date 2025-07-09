import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog, updateLog, getLogByDate } from '../api/log';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Check, X } from 'lucide-react';
import { useEnabledDatapoints, getDefaultValues, getCategoryNames } from '../components/Datapoints';
import { getCurrentCentralDate, formatDateAsCentral, isSameDayInCentral } from '../utils/dateUtils';
import { fetchWhoopData } from '../api/auth';

export default function Log() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dataPointDefinitions, loading: datapointsLoading, error: datapointsError } = useEnabledDatapoints();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [values, setValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [existingLogId, setExistingLogId] = useState(null);
  const [isFutureDate, setIsFutureDate] = useState(false);

  // Get date from URL parameter or default to current date
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      // Parse the date string (YYYY-MM-DD format) into a Date object
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
      setSelectedDate(parsedDate);
      console.log('Selected date from URL:', parsedDate);
      
      // Check if it's a future date
      const today = getCurrentCentralDate();
      if (parsedDate > today) {
        setIsFutureDate(true);
        setIsLoadingData(false);
        return;
      }
    } else {
      // No date parameter, default to today
      const today = getCurrentCentralDate();
      setSelectedDate(today);
      console.log('No date parameter, defaulting to today:', today);
    }
  }, [searchParams]);

  // Set the first available category when datapoints load
  useEffect(() => {
    if (!datapointsLoading && !datapointsError) {
      const availableCategories = Object.keys(dataPointDefinitions);
      if (availableCategories.length > 0) {
        // If current category is not available, or no category selected, pick the first one
        // Don't reset if the selected category is 'notes'
        if (!selectedCategory || (!availableCategories.includes(selectedCategory) && selectedCategory !== 'notes')) {
          setSelectedCategory(availableCategories[0]);
        }
      } else {
        // No datapoints available, default to notes
        setSelectedCategory('notes');
      }
    }
  }, [dataPointDefinitions, datapointsLoading, datapointsError, selectedCategory]);

  // Load existing log data for the selected date
  useEffect(() => {
    if (!token || !selectedDate || isFutureDate) return;
    
    const loadExistingLog = async () => {
      setIsLoadingData(true);
      try {
        const dateString = formatDateAsCentral(selectedDate);
        const response = await getLogByDate(token, dateString);
        
        if (response.data) {
          const logData = response.data;
          setExistingLogId(logData.id);
          setNotes(logData.healthData.notes || '');
          
          // Load existing values from the log
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
          // No existing log found, use default values and try to prepopulate with WHOOP data
          let defaultValues = getDefaultValues(dataPointDefinitions);
          
          // Only fetch WHOOP data for today's log
          const today = getCurrentCentralDate();
          const isToday = selectedDate && isSameDayInCentral(selectedDate, today);
          
          if (isToday) {
            try {
              const whoopResp = await fetchWhoopData();
              if (whoopResp && whoopResp.success && whoopResp.data) {
                const whoop = whoopResp.data;
                // Map WHOOP fields to log fields
                // sleep
                if (defaultValues.sleep) {
                  if (whoop.bedtime !== undefined) defaultValues.sleep.bedtime = whoop.bedtime;
                  if (whoop.wakeTime !== undefined) defaultValues.sleep.wakeTime = whoop.wakeTime;
                  if (whoop.sleepEfficiencyPercent !== undefined) defaultValues.sleep.sleepEfficiencyPercent = whoop.sleepEfficiencyPercent;
                  if (whoop.sleepFulfillmentPercent !== undefined) defaultValues.sleep.sleepFulfillmentPercent = whoop.sleepFulfillmentPercent;
                  if (whoop.sleepDebtMinutes !== undefined) defaultValues.sleep.sleepDebtMinutes = whoop.sleepDebtMinutes;
                }
                // physicalHealth
                if (defaultValues.physicalHealth) {
                  if (whoop.didStrengthTrainingWorkout !== undefined) defaultValues.physicalHealth.didStrengthTrainingWorkout = whoop.didStrengthTrainingWorkout;
                  if (whoop.wentForRun !== undefined) defaultValues.physicalHealth.wentForRun = whoop.wentForRun;
                  if (whoop.caloriesBurned !== undefined) defaultValues.physicalHealth.caloriesBurned = whoop.caloriesBurned;
                  if (whoop.restingHR !== undefined) defaultValues.physicalHealth.restingHR = whoop.restingHR;
                  if (whoop.heartRateVariability !== undefined) defaultValues.physicalHealth.heartRateVariability = whoop.heartRateVariability;
                  if (whoop.whoopStrainScore !== undefined) defaultValues.physicalHealth.whoopStrainScore = whoop.whoopStrainScore;
                  if (whoop.whoopRecoveryScorePercent !== undefined) defaultValues.physicalHealth.whoopRecoveryScorePercent = whoop.whoopRecoveryScorePercent;
                }
              }
            } catch (whoopErr) {
              // WHOOP data is optional, just log error
              console.warn('Could not prepopulate with WHOOP data:', whoopErr);
              
              // If it's a token expiration error, show a helpful message
              if (whoopErr.message && whoopErr.message.includes('WHOOP credentials have expired')) {
                console.warn('WHOOP tokens expired. User should reconnect in Settings page.');
                // Show a user-friendly alert
                setTimeout(() => {
                  alert('WHOOP connection has expired. You can reconnect your WHOOP account in Settings > Integrations to automatically populate your logs with WHOOP data.');
                }, 1000); // Small delay to avoid showing alert immediately
              }
            }
          }
          setValues(defaultValues);
        }
      } catch (error) {
        // No existing log found, which is fine
        if (error.response && error.response.status === 404) {
            let defaultValues = getDefaultValues(dataPointDefinitions);
            
            // Only fetch WHOOP data for today's log
            const today = getCurrentCentralDate();
            const isToday = selectedDate && isSameDayInCentral(selectedDate, today);
            
            if (isToday) {
              try {
                const whoopResp = await fetchWhoopData();
                if (whoopResp && whoopResp.success && whoopResp.data) {
                  const whoop = whoopResp.data;
                  if (defaultValues.sleep) {
                    if (whoop.bedtime !== undefined) defaultValues.sleep.bedtime = whoop.bedtime;
                    if (whoop.wakeTime !== undefined) defaultValues.sleep.wakeTime = whoop.wakeTime;
                    if (whoop.sleepEfficiencyPercent !== undefined) defaultValues.sleep.sleepEfficiencyPercent = whoop.sleepEfficiencyPercent;
                    if (whoop.sleepFulfillmentPercent !== undefined) defaultValues.sleep.sleepFulfillmentPercent = whoop.sleepFulfillmentPercent;
                    if (whoop.sleepDebtMinutes !== undefined) defaultValues.sleep.sleepDebtMinutes = whoop.sleepDebtMinutes;
                  }
                  if (defaultValues.physicalHealth) {
                    if (whoop.didStrengthTrainingWorkout !== undefined) defaultValues.physicalHealth.didStrengthTrainingWorkout = whoop.didStrengthTrainingWorkout;
                    if (whoop.wentForRun !== undefined) defaultValues.physicalHealth.wentForRun = whoop.wentForRun;
                    if (whoop.caloriesBurned !== undefined) defaultValues.physicalHealth.caloriesBurned = whoop.caloriesBurned;
                    if (whoop.restingHR !== undefined) defaultValues.physicalHealth.restingHR = whoop.restingHR;
                    if (whoop.heartRateVariability !== undefined) defaultValues.physicalHealth.heartRateVariability = whoop.heartRateVariability;
                    if (whoop.whoopStrainScore !== undefined) defaultValues.physicalHealth.whoopStrainScore = whoop.whoopStrainScore;
                    if (whoop.whoopRecoveryScorePercent !== undefined) defaultValues.physicalHealth.whoopRecoveryScorePercent = whoop.whoopRecoveryScorePercent;
                  }
                }
              } catch (whoopErr) {
                console.warn('Could not prepopulate with WHOOP data:', whoopErr);
              }
            }
            setValues(defaultValues);
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

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Toggle component for boolean values
  const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-900 dark:text-white font-medium">{label}</span>
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

  // Input component for numeric values
  const NumericInput = ({ value, onChange, label, min, max, step }) => {
    const [localValue, setLocalValue] = useState(value?.toString() || '');

    // Update local value when prop value changes
    useEffect(() => {
      setLocalValue(value?.toString() || '');
    }, [value]);

    const handleBlur = () => {
      const numericValue = localValue === '' ? 0 : Number(localValue);
      onChange(numericValue);
    };

    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
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

  const TimeInput = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-900 dark:text-white font-medium">{label}</span>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-30 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" />
    </div>
  );

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
      // Convert null values to false before saving
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
        timezone: 'America/Chicago' // Add timezone information
      };
      
      if (existingLogId) {
        // Update existing log
        await updateLog(token, existingLogId, { healthData });
      } else {
        // Create new log with specific date
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading datapoints...</p>
          </div>
        </div>
      </div>
    );
  }

  if (datapointsError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-2">Error loading datapoints</p>
            <p className="text-gray-600 dark:text-gray-300">{datapointsError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFutureDate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8 pt-24">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-light text-gray-900 dark:text-white flex-1 text-center">Daily Log</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 mb-2">Cannot log for future dates</p>
            <p className="text-gray-500 dark:text-gray-400">You can only log entries for today or past dates</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 pt-24">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-light text-gray-900 dark:text-white">Daily Log</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{formatDisplayDate(selectedDate)}</p>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {getCategoryNames(dataPointDefinitions).map(({ key, name }) => (
            <span
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`text-lg cursor-pointer px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === key
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {name}
            </span>
          ))}
          <span
            onClick={() => setSelectedCategory('notes')}
            className={`text-lg cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'notes'
                ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Notes
          </span>
        </div>

        {/* Content Area */}
        <div className=" rounded-xl p-6">
          {isLoadingData || values === null ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading log data...</p>
            </div>
          ) : selectedCategory === 'notes' ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Do you have any additional thoughts or observations?"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows="4"
              />
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`w-full mt-6 flex justify-center items-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Log'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 border-transparent relative">
              {/* Subtle column divider */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              
              {Object.entries(dataPointDefinitions[selectedCategory] || {}).map(([key, def]) => (
                <div key={key}>
                  {def.type === 'boolean' ? (
                    <Toggle
                      value={values[selectedCategory][key]}
                      onChange={(value) => updateValue(selectedCategory, key, value)}
                      label={def.label}
                    />
                  ) : def.type === 'time' ? (
                    <TimeInput
                      value={values[selectedCategory][key]}
                      onChange={(value) => updateValue(selectedCategory, key, value)}
                      label={def.label}
                    />
                  ) : (
                    <NumericInput
                      value={values[selectedCategory][key]}
                      onChange={(value) => updateValue(selectedCategory, key, value)}
                      label={def.label}
                      min={def.min}
                      max={def.max}
                      step={def.step}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
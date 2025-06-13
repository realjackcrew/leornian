import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog, updateLog } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

// Data point definitions
const dataPointDefinitions = {
  sleep: {
    screenInBed: { type: 'boolean', label: 'Used screen device in bed' },
    homeBed: { type: 'boolean', label: 'Slept in your home bed' },
    sunlightWakeup: { type: 'boolean', label: 'Viewed sunlight within 30min of wakeup' },
    sleepMeditation: { type: 'boolean', label: 'Did sleep meditation/relaxation' },
    caffeineLate: { type: 'boolean', label: 'Had caffeine after 2 PM' },
    sleepHours: { type: 'slider', label: 'Hours of sleep', min: 0, max: 12, step: 0.5 },
    bedTime: { type: 'slider', label: 'Bedtime (hour)', min: 18, max: 26, step: 0.5 },
    wakeTime: { type: 'slider', label: 'Wake time (hour)', min: 4, max: 12, step: 0.5 },
    sleepQuality: { type: 'slider', label: 'Sleep quality (1-10)', min: 1, max: 10, step: 1 }
  },
  nutrition: {
    vegetables: { type: 'boolean', label: 'Ate 5+ servings of vegetables' },
    fastFood: { type: 'boolean', label: 'Had fast food' },
    cookAtHome: { type: 'boolean', label: 'Cooked meal at home' },
    vitamins: { type: 'boolean', label: 'Took vitamins/supplements' },
    alcohol: { type: 'boolean', label: 'Consumed alcohol' },
    waterIntake: { type: 'slider', label: 'Water intake (glasses)', min: 0, max: 15, step: 1 },
    mealsBetweenSleep: { type: 'slider', label: 'Hours between last meal and sleep', min: 0, max: 8, step: 0.5 },
    proteinServings: { type: 'slider', label: 'Protein servings', min: 0, max: 6, step: 1 },
    sugarCravings: { type: 'slider', label: 'Sugar cravings (1-10)', min: 1, max: 10, step: 1 }
  },
  mentalHealth: {
    meditation: { type: 'boolean', label: 'Practiced meditation' },
    journaling: { type: 'boolean', label: 'Did journaling' },
    socialTime: { type: 'boolean', label: 'Spent quality time with others' },
    stressfulEvent: { type: 'boolean', label: 'Experienced stressful event' },
    gratitudePractice: { type: 'boolean', label: 'Practiced gratitude' },
    moodRating: { type: 'slider', label: 'Overall mood (1-10)', min: 1, max: 10, step: 1 },
    anxietyLevel: { type: 'slider', label: 'Anxiety level (1-10)', min: 1, max: 10, step: 1 },
    focusScore: { type: 'slider', label: 'Focus/concentration (1-10)', min: 1, max: 10, step: 1 },
    energyLevel: { type: 'slider', label: 'Energy level (1-10)', min: 1, max: 10, step: 1 }
  },
  physicalHealth: {
    exercise: { type: 'boolean', label: 'Did structured exercise' },
    medication: { type: 'boolean', label: 'Took prescribed medication' },
    stretching: { type: 'boolean', label: 'Did stretching/mobility work' },
    outdoorActivity: { type: 'boolean', label: 'Spent time outdoors' },
    painOrDiscomfort: { type: 'boolean', label: 'Experienced pain/discomfort' },
    exerciseMinutes: { type: 'slider', label: 'Exercise duration (minutes)', min: 0, max: 180, step: 15 },
    steps: { type: 'slider', label: 'Steps (thousands)', min: 0, max: 25, step: 1 },
    hrv: { type: 'slider', label: 'HRV (if tracked)', min: 10, max: 100, step: 5 },
    restingHR: { type: 'slider', label: 'Resting heart rate', min: 40, max: 100, step: 1 }
  },
  lifestyle: {
    screenBreaks: { type: 'boolean', label: 'Took regular screen breaks' },
    coldTherapy: { type: 'boolean', label: 'Did cold therapy (shower/bath)' },
    sauna: { type: 'boolean', label: 'Used sauna/heat therapy' },
    massage: { type: 'boolean', label: 'Had massage/self-massage' },
    creativityTime: { type: 'boolean', label: 'Engaged in creative activity' },
    screenTime: { type: 'slider', label: 'Total screen time (hours)', min: 0, max: 16, step: 0.5 },
    stressLevel: { type: 'slider', label: 'Stress level (1-10)', min: 1, max: 10, step: 1 },
    productivityScore: { type: 'slider', label: 'Productivity score (1-10)', min: 1, max: 10, step: 1 },
    recoveryScore: { type: 'slider', label: 'Recovery feeling (1-10)', min: 1, max: 10, step: 1 }
  }
};

// Default values for data points
const getDefaultValues = () => {
  const values = {};
  Object.entries(dataPointDefinitions).forEach(([category, dataPoints]) => {
    values[category] = {};
    Object.entries(dataPoints).forEach(([key, def]) => {
      values[category][key] = def.type === 'boolean' ? false : def.min;
    });
  });
  return values;
};

export default function Log() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('sleep');
  const [values, setValues] = useState(getDefaultValues());
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Toggle component for boolean values
  const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span className="text-gray-900 dark:text-white font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  // Slider component for numeric values
  const Slider = ({ value, onChange, label, min, max, step }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
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
    if (!token) return;
    
    setIsLoading(true);
    try {
      const healthData = {
        values,
        notes
      };
      
      await createLog(token, { healthData });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving health log:', error);
      alert('Error saving log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <p className="text-center mt-10 text-gray-900 dark:text-white">Please log in.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 pt-16">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-light text-gray-900 dark:text-white">Daily Health Log</h1>
          <div></div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {Object.entries(dataPointDefinitions).map(([key, category]) => (
            <span
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`text-lg cursor-pointer ${
                selectedCategory === key
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </span>
          ))}
          <span
            onClick={() => setSelectedCategory('notes')}
            className={`text-lg cursor-pointer ${
              selectedCategory === 'notes'
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Notes
          </span>
        </div>

        {/* Content Area */}
        <div>
          {selectedCategory === 'notes' ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your day? Any additional thoughts or observations..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows="4"
              />
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`w-full mt-6 flex justify-center items-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Complete Health Log'}</span>
              </button>
            </div>


          ) : (
            <div className="space-y-4">
              {Object.entries(dataPointDefinitions[selectedCategory]).map(([key, def]) => (
                <div key={key}>
                  {def.type === 'boolean' ? (
                    <Toggle
                      value={values[selectedCategory][key]}
                      onChange={(value) => updateValue(selectedCategory, key, value)}
                      label={def.label}
                    />
                  ) : (
                    <Slider
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

        {/* Save Button */}
        {/* <button
          onClick={handleSave}
          disabled={isLoading}
          className={`w-full mt-6 flex justify-center items-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save Complete Health Log'}</span>
        </button> */}
      </div>
    </div>
  );
} 
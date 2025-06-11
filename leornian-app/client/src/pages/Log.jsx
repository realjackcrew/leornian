import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog, updateLog } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Moon, Apple, Brain, Heart, Coffee, Edit3, Save, X, Check } from 'lucide-react';

// Default categories and their data points
const defaultCategories = {
  sleep: {
    name: 'Sleep',
    icon: Moon,
    color: 'bg-indigo-500',
    dataPoints: {
      screenInBed: { type: 'boolean', label: 'Used screen device in bed', value: false },
      homeBed: { type: 'boolean', label: 'Slept in your home bed', value: true },
      sunlightWakeup: { type: 'boolean', label: 'Viewed sunlight within 30min of wakeup', value: false },
      sleepMeditation: { type: 'boolean', label: 'Did sleep meditation/relaxation', value: false },
      caffeineLate: { type: 'boolean', label: 'Had caffeine after 2 PM', value: false },
      sleepHours: { type: 'slider', label: 'Hours of sleep', value: 7, min: 0, max: 12, step: 0.5 },
      bedTime: { type: 'slider', label: 'Bedtime (hour)', value: 22, min: 18, max: 26, step: 0.5 },
      wakeTime: { type: 'slider', label: 'Wake time (hour)', value: 7, min: 4, max: 12, step: 0.5 },
      sleepQuality: { type: 'slider', label: 'Sleep quality (1-10)', value: 7, min: 1, max: 10, step: 1 }
    }
  },
  nutrition: {
    name: 'Nutrition',
    icon: Apple,
    color: 'bg-green-500',
    dataPoints: {
      vegetables: { type: 'boolean', label: 'Ate 5+ servings of vegetables', value: false },
      fastFood: { type: 'boolean', label: 'Had fast food', value: false },
      cookAtHome: { type: 'boolean', label: 'Cooked meal at home', value: true },
      vitamins: { type: 'boolean', label: 'Took vitamins/supplements', value: false },
      alcohol: { type: 'boolean', label: 'Consumed alcohol', value: false },
      waterIntake: { type: 'slider', label: 'Water intake (glasses)', value: 6, min: 0, max: 15, step: 1 },
      mealsBetweenSleep: { type: 'slider', label: 'Hours between last meal and sleep', value: 3, min: 0, max: 8, step: 0.5 },
      proteinServings: { type: 'slider', label: 'Protein servings', value: 2, min: 0, max: 6, step: 1 },
      sugarCravings: { type: 'slider', label: 'Sugar cravings (1-10)', value: 3, min: 1, max: 10, step: 1 }
    }
  },
  mentalHealth: {
    name: 'Mental Health',
    icon: Brain,
    color: 'bg-purple-500',
    dataPoints: {
      meditation: { type: 'boolean', label: 'Practiced meditation', value: false },
      journaling: { type: 'boolean', label: 'Did journaling', value: false },
      socialTime: { type: 'boolean', label: 'Spent quality time with others', value: true },
      stressfulEvent: { type: 'boolean', label: 'Experienced stressful event', value: false },
      gratitudePractice: { type: 'boolean', label: 'Practiced gratitude', value: false },
      moodRating: { type: 'slider', label: 'Overall mood (1-10)', value: 7, min: 1, max: 10, step: 1 },
      anxietyLevel: { type: 'slider', label: 'Anxiety level (1-10)', value: 3, min: 1, max: 10, step: 1 },
      focusScore: { type: 'slider', label: 'Focus/concentration (1-10)', value: 6, min: 1, max: 10, step: 1 },
      energyLevel: { type: 'slider', label: 'Energy level (1-10)', value: 7, min: 1, max: 10, step: 1 }
    }
  },
  physicalHealth: {
    name: 'Physical Health',
    icon: Heart,
    color: 'bg-red-500',
    dataPoints: {
      exercise: { type: 'boolean', label: 'Did structured exercise', value: false },
      medication: { type: 'boolean', label: 'Took prescribed medication', value: true },
      stretching: { type: 'boolean', label: 'Did stretching/mobility work', value: false },
      outdoorActivity: { type: 'boolean', label: 'Spent time outdoors', value: true },
      painOrDiscomfort: { type: 'boolean', label: 'Experienced pain/discomfort', value: false },
      exerciseMinutes: { type: 'slider', label: 'Exercise duration (minutes)', value: 30, min: 0, max: 180, step: 15 },
      steps: { type: 'slider', label: 'Steps (thousands)', value: 8, min: 0, max: 25, step: 1 },
      hrv: { type: 'slider', label: 'HRV (if tracked)', value: 45, min: 10, max: 100, step: 5 },
      restingHR: { type: 'slider', label: 'Resting heart rate', value: 65, min: 40, max: 100, step: 1 }
    }
  },
  lifestyle: {
    name: 'Lifestyle & Recovery',
    icon: Coffee,
    color: 'bg-orange-500',
    dataPoints: {
      screenBreaks: { type: 'boolean', label: 'Took regular screen breaks', value: false },
      coldTherapy: { type: 'boolean', label: 'Did cold therapy (shower/bath)', value: false },
      sauna: { type: 'boolean', label: 'Used sauna/heat therapy', value: false },
      massage: { type: 'boolean', label: 'Had massage/self-massage', value: false },
      creativityTime: { type: 'boolean', label: 'Engaged in creative activity', value: true },
      screenTime: { type: 'slider', label: 'Total screen time (hours)', value: 6, min: 0, max: 16, step: 0.5 },
      stressLevel: { type: 'slider', label: 'Stress level (1-10)', value: 4, min: 1, max: 10, step: 1 },
      productivityScore: { type: 'slider', label: 'Productivity score (1-10)', value: 7, min: 1, max: 10, step: 1 },
      recoveryScore: { type: 'slider', label: 'Recovery feeling (1-10)', value: 6, min: 1, max: 10, step: 1 }
    }
  }
};

export default function Log() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(defaultCategories);
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

  const updateDataPoint = (categoryKey, dataPointKey, value) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        dataPoints: {
          ...prev[categoryKey].dataPoints,
          [dataPointKey]: {
            ...prev[categoryKey].dataPoints[dataPointKey],
            value
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const healthData = {
        categories,
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

  // Main category selection view
  const MainView = () => (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(categories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  setCurrentView('category');
                }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(category.dataPoints).length} data points
                </p>
              </button>
            );
          })}
        </div>

        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was your day? Any additional thoughts or observations..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows="4"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`w-full flex justify-center items-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save Complete Health Log'}</span>
        </button>
      </div>
    </div>
  );

  // Category detail view
  const CategoryView = () => {
    const category = categories[selectedCategory];
    if (!category) return null;

    const IconComponent = category.icon;

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto p-6">
          <button 
            onClick={() => setCurrentView('main')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Categories
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white">{category.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">Track your {category.name.toLowerCase()} metrics</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(category.dataPoints).map(([key, dataPoint]) => (
                <div key={key}>
                  {dataPoint.type === 'boolean' ? (
                    <Toggle
                      value={dataPoint.value}
                      onChange={(value) => updateDataPoint(selectedCategory, key, value)}
                      label={dataPoint.label}
                    />
                  ) : (
                    <Slider
                      value={dataPoint.value}
                      onChange={(value) => updateDataPoint(selectedCategory, key, value)}
                      label={dataPoint.label}
                      min={dataPoint.min}
                      max={dataPoint.max}
                      step={dataPoint.step}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('main')}
              className="w-full mt-6 flex justify-center items-center space-x-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!token) return <p className="text-center mt-10 text-gray-900 dark:text-white">Please log in.</p>;

  // Render appropriate view
  if (currentView === 'category') return <CategoryView />;
  return <MainView />;
} 
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createLog, updateLog } from '../api/log';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, X } from 'lucide-react';
import { dataPointDefinitions, getDefaultValues, getCategoryNames } from '../components/Datapoints';
import { toUTC } from '../utils/dateUtils';

export default function Log() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('sleep');
  const [values, setValues] = useState(getDefaultValues());
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

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
    if (!token) return;
    
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

        {/* Category Navigation */}
        <div className="flex justify-between mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {getCategoryNames().map(({ key, name }) => (
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
          {selectedCategory === 'notes' ? (
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
              
              {Object.entries(dataPointDefinitions[selectedCategory]).map(([key, def]) => (
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
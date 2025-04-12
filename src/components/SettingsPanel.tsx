import React from 'react';
import { Settings, Moon, Sun, Mic, Waves } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

const SettingsPanel: React.FC = () => {
  const {
    darkMode,
    noiseOptimization,
    voiceEnhancer,
    toggleDarkMode,
    toggleNoiseOptimization,
    toggleVoiceEnhancer
  } = useSettingsStore();

  return (
    <div className="fixed bottom-4 left-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Dark Mode
            </span>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Waves className="w-5 h-5" />
              AI Noise Optimization
            </span>
            <button
              onClick={toggleNoiseOptimization}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                noiseOptimization ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  noiseOptimization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Enhancer
            </span>
            <button
              onClick={toggleVoiceEnhancer}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                voiceEnhancer ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  voiceEnhancer ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Note: These are experimental features. AI may occasionally make errors.
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import MapView from './components/MapView';
import SettingsPanel from './components/SettingsPanel';
import { useSettingsStore } from './stores/settingsStore';

function App() {
  const { darkMode } = useSettingsStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'} mb-8`}>
          Nav AI NLP prototype example
        </h1>
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Try saying "Hey Nava!" to start a conversation
        </p>
      </div>
      <VoiceAssistant />
      <MapView />
      <SettingsPanel />
    </div>
  );
}

export default App;
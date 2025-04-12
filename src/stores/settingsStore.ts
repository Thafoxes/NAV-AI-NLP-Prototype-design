import { create } from 'zustand';

interface SettingsState {
  darkMode: boolean;
  noiseOptimization: boolean;
  voiceEnhancer: boolean;
  toggleDarkMode: () => void;
  toggleNoiseOptimization: () => void;
  toggleVoiceEnhancer: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  noiseOptimization: true,
  voiceEnhancer: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleNoiseOptimization: () => set((state) => ({ noiseOptimization: !state.noiseOptimization })),
  toggleVoiceEnhancer: () => set((state) => ({ voiceEnhancer: !state.voiceEnhancer })),
}));
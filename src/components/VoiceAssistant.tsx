import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, AudioWaveform as Waveform, Minimize2, Maximize2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { useSettingsStore } from '../stores/settingsStore';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SuggestedCommand {
  category: string;
  emoji: string;
  commands: string[];
}

const suggestedCommands: SuggestedCommand[] = [
  {
    category: 'Navigation',
    emoji: '🧭',
    commands: [
      'Navigate to KLCC',
      'Find nearest petrol station',
      'Find nearest rest stop',
      'Avoid toll roads',
      'Show alternative route',
      'How long to my destination?'
    ]
  },
  {
    category: 'Passenger & Ride Info',
    emoji: '👥',
    commands: [
      'Call my passenger',
      'Message my passenger'
    ]
  }
];

const SILENCE_TIMEOUT = 3000; // 3 seconds of silence before processing
const HOTWORD = 'hey nava';
const HOTWORD_VARIATIONS = ['hey nava', 'hey naba', 'hey nova', 'hay nava', 'he nava'];

const VoiceAssistant: React.FC = () => {
  const { darkMode } = useSettingsStore();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hotwordDetected, setHotwordDetected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
    interimTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    startPassiveListening();
    return () => {
      SpeechRecognition.stopListening();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (isSpeaking) return;

    const normalizedTranscript = interimTranscript.toLowerCase().trim();
    
    const isHotwordDetected = HOTWORD_VARIATIONS.some(variation => 
      normalizedTranscript.includes(variation) || 
      normalizedTranscript.replace(/\s+/g, '').includes(variation.replace(/\s+/g, ''))
    );

    if (isHotwordDetected && !isListening && !hotwordDetected) {
      console.log('Hotword detected:', normalizedTranscript);
      setHotwordDetected(true);
      startActiveListening();
      speakResponse("How can I help you?");
    }
  }, [interimTranscript, isListening, hotwordDetected, isSpeaking]);

  useEffect(() => {
    if (!isListening && !listening && !isSpeaking) {
      startPassiveListening();
    }
  }, [isListening, listening, isSpeaking]);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: darkMode ? '#818CF8' : '#4F46E5',
        progressColor: darkMode ? '#C7D2FE' : '#818CF8',
        cursorWidth: 0,
        height: 40,
        barWidth: 2,
        barGap: 3,
      });
    }

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [darkMode]);

  useEffect(() => {
    if (isListening && transcript && !isSpeaking) {
      lastSpeechRef.current = Date.now();
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      silenceTimeoutRef.current = setTimeout(() => {
        if (Date.now() - lastSpeechRef.current >= SILENCE_TIMEOUT && isListening) {
          handleSilenceDetected();
        }
      }, SILENCE_TIMEOUT);
    }
  }, [transcript, isListening, isSpeaking]);

  const startPassiveListening = () => {
    if (!isSpeaking) {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const startActiveListening = () => {
    if (!isSpeaking) {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (transcript) {
      processMessage(transcript);
    }
    resetTranscript();
    setHotwordDetected(false);
  };

  const handleSilenceDetected = () => {
    if (transcript && !isProcessing && !isSpeaking) {
      setIsProcessing(true);
      setMessages(prev => [...prev, {
        text: "Processing your request...",
        isUser: false,
        timestamp: new Date()
      }]);
      processMessage(transcript).finally(() => {
        setIsProcessing(false);
        resetTranscript();
        setHotwordDetected(false);
        setIsListening(false);
        startActiveListening(); // Continue listening for the next command
      });
    }
  };

  const speakResponse = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsSpeaking(true);
      SpeechRecognition.stopListening();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
        setTimeout(() => {
          if (!isListening) {
            startPassiveListening();
          }
        }, 500);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
        if (!isListening) {
          startPassiveListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const processMessage = async (text: string) => {
    if (HOTWORD_VARIATIONS.some(variation => text.toLowerCase().trim() === variation)) {
      return;
    }

    const normalizedText = text.toLowerCase().trim();
    
    setMessages(prev => prev.filter(msg => msg.text !== "Processing your request..."));

    setMessages(prev => [...prev, {
      text,
      isUser: true,
      timestamp: new Date()
    }]);

    let aiResponse = "";

    // Process different types of commands
    if (normalizedText.includes('thank you') || normalizedText.includes('thanks')) {
      aiResponse = "You're welcome! I'm still listening for your next command.";
    } 
    else if (normalizedText.includes('navigate to') || normalizedText.includes('go to')) {
      const location = normalizedText.replace(/(navigate to|go to)/i, '').trim();
      aiResponse = `Setting up navigation to ${location}. Would you like to avoid toll roads?`;
    }
    else if (normalizedText.includes('find nearest') || normalizedText.includes('locate')) {
      const place = normalizedText.replace(/(find nearest|locate)/i, '').trim();
      aiResponse = `Searching for the nearest ${place}. I'll show you the results on the map.`;
    }
    else if (normalizedText.includes('toll')) {
      if (normalizedText.includes('avoid')) {
        aiResponse = "I've updated the route to avoid toll roads. The new route will take 10 minutes longer.";
      } else {
        aiResponse = "The current route includes toll roads. Would you like me to find an alternative route?";
      }
    }
    else if (normalizedText.includes('how long') || normalizedText.includes('eta')) {
      aiResponse = "Based on current traffic conditions, you'll reach your destination in approximately 25 minutes.";
    }
    else if (normalizedText.includes('call') || normalizedText.includes('message')) {
      if (normalizedText.includes('passenger')) {
        aiResponse = "Would you like me to call or send a message to your passenger about your arrival time?";
      } else {
        aiResponse = "I can help you call or message someone. Who would you like to contact?";
      }
    }
    else {
      aiResponse = `I understand you said: "${text}". How can I help you with that?`;
    }
    
    setMessages(prev => [...prev, {
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    }]);

    await speakResponse(aiResponse);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div 
      className={`fixed transition-all duration-300 ease-in-out ${
        isExpanded 
          ? 'bottom-0 right-0 w-full h-full md:w-3/4 md:h-5/6 md:bottom-4 md:right-4' 
          : 'bottom-4 right-4 w-96'
      } ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}
    >
      <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-indigo-600'} text-white flex items-center justify-between`}>
        <h2 className="text-lg font-semibold">Voice Assistant</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={isListening ? stopListening : startActiveListening}
            className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
            disabled={isSpeaking}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleExpand}
            className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className={`flex ${isExpanded ? 'h-[calc(100%-8rem)]' : 'h-96'}`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? darkMode 
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-indigo-600 text-white rounded-br-none'
                    : darkMode
                      ? 'bg-gray-700 text-white rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className={`w-64 border-l ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} overflow-y-auto p-4`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Suggested Commands
          </h3>
          <div className="space-y-6">
            {suggestedCommands.map((category, index) => (
              <div key={index}>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  {category.emoji} {category.category}
                </h4>
                <ul className="space-y-2">
                  {category.commands.map((command, cmdIndex) => (
                    <li
                      key={cmdIndex}
                      className={`text-sm ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-600 hover:bg-gray-100'
                      } py-1 px-2 rounded-md cursor-default`}
                    >
                      {command}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <div
            ref={waveformRef}
            className="flex-1 h-10"
          />
          <div className="flex items-center space-x-2">
            {(isListening || (listening && !isSpeaking)) && (
              <Waveform className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} ${isListening ? 'animate-pulse' : 'opacity-50'}`} />
            )}
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {isSpeaking ? 'Speaking...' :
               isProcessing ? 'Processing...' : 
               isListening ? 'Listening...' : 
               listening ? 'Waiting for "Hey Nava!"' : 
               'Click mic or say "Hey Nava!"'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
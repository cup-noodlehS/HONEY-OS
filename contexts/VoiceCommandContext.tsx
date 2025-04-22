// src/contexts/VoiceCommandContext.tsx

import type React from "react";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Web Speech API interfaces
interface SpeechRecognitionAlternative {
  confidence: number;
  transcript: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  readonly length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  addEventListener: (
    type: string,
    callback: EventListenerOrEventListenerObject
  ) => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  removeEventListener: (
    type: string,
    callback: EventListenerOrEventListenerObject
  ) => void;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// Move function to outer scope
function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as WindowWithSpeechRecognition).SpeechRecognition ||
    (window as WindowWithSpeechRecognition).webkitSpeechRecognition
  );
}

interface VoiceCommandContextType {
  isListening: boolean;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  startListening: () => void;
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(
  undefined
);

export const useVoiceCommand = (): VoiceCommandContextType => {
  const context = useContext(VoiceCommandContext);

  if (context === undefined) {
    throw new Error(
      "useVoiceCommand must be used within a VoiceCommandProvider"
    );
  }

  return context;
};

interface VoiceCommandProviderProps {
  children: ReactNode;
}

export const VoiceCommandProvider: React.FC<VoiceCommandProviderProps> = ({
  children,
}) => {
  const [message, setMessage] = useState<string>("");
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    if (isListening) {
      // Already listening, ignoring request
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      // Speech Recognition is not supported in this browser
      return;
    }

    try {
      setIsListening(true);

      const SpeechRecognitionImpl =
        (window as WindowWithSpeechRecognition).SpeechRecognition ||
        (window as WindowWithSpeechRecognition).webkitSpeechRecognition;

      if (!SpeechRecognitionImpl) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognitionImpl();

      // Basic configuration
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const { transcript } = event.results[0][0];
        const { isFinal } = event.results[0];

        if (isFinal) {
          setMessage(transcript);
        }
      };

      // Handle errors using addEventListener
      const handleError = () => {
        setIsListening(false);
      };

      recognition.addEventListener("error", handleError);

      // Reset when recognition ends
      recognition.onend = () => {
        setIsListening(false);
      };

      // Start recognition
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey && event.code === "Space") {
        event.preventDefault();
        startListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startListening]);

  // Create a stable context value with useMemo to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isListening,
      message,
      setMessage,
      startListening,
    }),
    [message, setMessage, startListening, isListening]
  );

  return (
    <VoiceCommandContext.Provider value={contextValue}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

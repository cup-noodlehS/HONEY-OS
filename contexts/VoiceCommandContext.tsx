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

interface VoiceCommandContextType {
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

  // Simple function to check browser support

  const isSpeechRecognitionSupported = () => {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  };

  const startListening = useCallback(() => {
    if (isListening) {
      console.log("Already listening, ignoring request");

      return;
    }

    if (!isSpeechRecognitionSupported()) {
      console.error("Speech Recognition is not supported in this browser");

      return;
    }

    try {
      setIsListening(true);

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();

      // Basic configuration

      recognition.lang = "en-US";

      recognition.continuous = false;

      recognition.interimResults = true;

      recognition.maxAlternatives = 1;

      // Handle results

      recognition.onresult = (event: any) => {
        const { transcript } = event.results[0][0];

        const { confidence } = event.results[0][0];

        const { isFinal } = event.results[0];

        // Log everything clearly

        console.log(
          `Speech detected: "${transcript}" (Confidence: ${confidence})`
        );

        if (isFinal) {
          console.log(`FINAL RESULT: "${transcript}"`);

          setMessage(transcript); // Set the final transcript as the message
        }
      };

      // Handle errors

      recognition.onerror = (event: any) => {
        console.error(`Speech recognition error: ${event.error}`);

        setIsListening(false);
      };

      // Reset when recognition ends

      recognition.onend = () => {
        console.log("Speech recognition session ended");

        setIsListening(false);
      };

      // Start recognition

      recognition.start();

      console.log("Speech recognition started - Please speak now");
    } catch (error) {
      console.error("Error initializing speech recognition:", error);

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
      message,

      setMessage,

      startListening,
    }),

    [message, setMessage, startListening]
  );

  return (
    <VoiceCommandContext.Provider value={contextValue}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

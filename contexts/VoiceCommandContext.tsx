// src/contexts/VoiceCommandContext.tsx
import React, { createContext, useContext, useState } from "react";

interface VoiceCommandContextType {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(
  undefined
);

export const useVoiceCommand = () => {
  const context = useContext(VoiceCommandContext);
  if (context === undefined) {
    throw new Error(
      "useVoiceCommand must be used within a VoiceCommandProvider"
    );
  }

  // Destructure context to get message and setMessage
  const { message, setMessage } = context;

  // Return both message and setMessage
  return { message, setMessage };
};

export const VoiceCommandProvider: React.FC = ({ children }) => {
  const [message, setMessage] = useState<string>("");

  const handleVoiceInput = (): void => {
    const recognition = new window.webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionResult) => {
      const { transcript } = event.results[0][0];
      setMessage(transcript);
      recognition.stop();
    };
    recognition.start();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.code === "Space") {
      event.preventDefault();
      handleVoiceInput();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <VoiceCommandContext.Provider value={{ message, setMessage }}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

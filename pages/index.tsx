import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";
import { memo, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Preloader from "./Preloader";

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  const [message, setMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const speakMessage = (): void => {
    const utterance = new SpeechSynthesisUtterance("Hello DEBMAC, I'm awake");
    utterance.pitch = 1;
    utterance.rate = 0.5;
    utterance.volume = 1;
    // Function to select the Microsoft Zira voice
    const selectZiraVoice = (voices: SpeechSynthesisVoice[]) => {
      const ziraVoice = voices.find(
        (voice) => voice.name === "Microsoft Zira - English (United States)"
      );

      if (ziraVoice) {
        utterance.voice = ziraVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        console.error("Microsoft Zira voice not found!");
      }
    };

    // Check if the voices are available
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      // Voices are available, select Zira voice
      selectZiraVoice(voices);
    } else {
      // Voices not available, listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        selectZiraVoice(updatedVoices);
      };
    }
  };

  const handleVoiceInput = (): void => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const { transcript } = event.results[0][0];
      setMessage(transcript);
      recognition.stop();

      // Speak the response if message is "honey wake up"
      if (transcript === "honey wake up") {
        speakMessage();
        setIsOpen(true);
      }
    };
    recognition.start();
  };

  useEffect(() => {
    if (message !== "") {
      toast(message);
    }
  }, [message]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === "Space") {
        event.preventDefault();
        handleVoiceInput();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      <ToastContainer />
      {isOpen ? (
        <Desktop>
          <Taskbar />
          <AppsLoader />
        </Desktop>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default memo(Index);

import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import { useVoiceCommand } from "contexts/VoiceCommandContext";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";
import { memo, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import Preloader from "./Preloader";

const speakMessage = (m: string): void => {
  const utterance = new SpeechSynthesisUtterance(m);
  utterance.pitch = 1;
  utterance.rate = 0.5;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

const StyledButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #45a049;
  }
`;

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();
  const [showGif, setShowGif] = useState<boolean>(false);
  const { message, startListening } = useVoiceCommand();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const StyledContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  useEffect(() => {
    if (message && message.trim() !== "") {
      // Display the received message
      toast(`Voice command: "${message}"`, {
        autoClose: 3000,
        closeOnClick: true,
        draggable: true,
        hideProgressBar: false,
        pauseOnHover: true,
        position: "top-right",
      });

      // Process commands
      const normalizedMessage = message.toLowerCase().trim();

      // Wake up commands
      if (
        normalizedMessage.includes("wake up") ||
        normalizedMessage.includes("wake") ||
        normalizedMessage.includes("honey wake") ||
        normalizedMessage.includes("wakeup")
      ) {
        speakMessage("Hello, I'm awake");
        setShowGif(true);
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      }
      // Rest commands
      else if (
        normalizedMessage.includes("rest") ||
        normalizedMessage.includes("sleep") ||
        normalizedMessage.includes("honey rest")
      ) {
        speakMessage("Resting");
        setIsOpen(false);
        setShowGif(false);
      }
    }
  }, [message]);

  return (
    <div>
      <ToastContainer />
      {isOpen ? (
        <Desktop>
          <Taskbar />
          <AppsLoader />
        </Desktop>
      ) : (
        <StyledContainer>
          {!showGif && <img alt="Loading..." src="/closed.png" />}
          <Preloader showGif={showGif} />
        </StyledContainer>
      )}

      <StyledButton
        onClick={startListening}
        title="Press to start voice recognition (or use Ctrl+Space)"
      >
        🎤
      </StyledButton>
    </div>
  );
};

export default memo(Index);

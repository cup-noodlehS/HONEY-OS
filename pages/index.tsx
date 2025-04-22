import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
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

const StyledButton = styled.button<{ $active?: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: ${({ $active }) => ($active ? "#ff4b4b" : "#4caf50")};
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 0 0 4px rgba(255, 75, 75, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)"
      : "0 4px 8px rgba(0, 0, 0, 0.2)"};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#e63e3e" : "#45a049")};
  }
`;

const MicrophoneIndicator = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const SoundWave = styled.div<{ $active?: boolean; $delay?: string }>`
  position: absolute;
  width: 4px;
  height: ${({ $active }) => ($active ? "16px" : "0px")};
  background-color: white;
  border-radius: 2px;
  margin: 0 2px;
  animation: ${({ $active, $delay }) =>
    $active ? `soundWave 1s infinite ${$delay}` : "none"};
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition:
    height 0.3s ease,
    opacity 0.3s ease;

  @keyframes soundWave {
    0% {
      height: 4px;
    }
    50% {
      height: 16px;
    }
    100% {
      height: 4px;
    }
  }
`;

const WaveContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const StyledContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();
  const [showGif, setShowGif] = useState<boolean>(false);
  const { message, startListening, isListening } = useVoiceCommand();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { open } = useProcesses();

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
      // Open app commands
      else if (
        normalizedMessage.includes("honey") &&
        normalizedMessage.includes("open")
      ) {
        // Extract app name from command
        const appName = normalizedMessage.split("open")[1]?.trim();

        if (appName) {
          // Find the closest matching app
          const matchingApp = Object.keys(processDirectory).find((app) =>
            appName.includes(app.toLowerCase())
          );

          // Alternative match by checking if app name is contained in the command
          const alternativeMatch = Object.keys(processDirectory).find((app) =>
            normalizedMessage.includes(app.toLowerCase())
          );

          const appToOpen = matchingApp || alternativeMatch;

          if (appToOpen) {
            speakMessage(`Opening ${appToOpen}`);
            open(appToOpen, {});
          } else {
            speakMessage(`Sorry, I couldn't find the app ${appName}`);
          }
        } else {
          speakMessage("Sorry, I didn't catch which app to open");
        }
      }
    }
  }, [message, open]);

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
        $active={isListening}
        onClick={startListening}
        title={
          isListening
            ? "Microphone is active"
            : "Press to start voice recognition (or use Ctrl+Space)"
        }
      >
        <MicrophoneIndicator $active={isListening}>
          <WaveContainer>
            <SoundWave
              $active={isListening}
              $delay="0s"
              style={{ transform: "translateX(-8px)" }}
            />
            <SoundWave
              $active={isListening}
              $delay="0.2s"
              style={{ transform: "translateX(-4px)" }}
            />
            <SoundWave $active={isListening} $delay="0.1s" />
            <SoundWave
              $active={isListening}
              $delay="0.3s"
              style={{ transform: "translateX(4px)" }}
            />
            <SoundWave
              $active={isListening}
              $delay="0.15s"
              style={{ transform: "translateX(8px)" }}
            />
          </WaveContainer>
          {!isListening && "🎤"}
        </MicrophoneIndicator>
      </StyledButton>
    </div>
  );
};

export default memo(Index);

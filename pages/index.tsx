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

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();
  const [showGif, setShowGif] = useState<boolean>(false);
  const { message } = useVoiceCommand();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const speakMessage = (m: string): void => {
    const utterance = new SpeechSynthesisUtterance(m);
    utterance.pitch = 1;
    utterance.rate = 0.5;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    window.speechSynthesis.speak(utterance);
  };

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
    if (message !== "") {
      toast(message);
      if (message === "honey wake up") {
        speakMessage("Hello DEBMAC, I'm awake");
        setShowGif(true);
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      } else if (message === "honey rest") {
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
    </div>
  );
};

export default memo(Index);

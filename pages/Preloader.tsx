import type React from "react";
import styled from "styled-components";

// Styled container for the preloader
const StyledContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface PreloaderProps {
  showGif: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ showGif }) => {
  return (
    <StyledContainer>
      {showGif && <img alt="Loading..." src="/final.gif" />}
    </StyledContainer>
  );
};

export default Preloader;

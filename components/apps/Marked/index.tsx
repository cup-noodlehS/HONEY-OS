import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useState } from "react";
import styled from "styled-components";

const StyledMarked = styled.div`
  background-color: white;
  color: black;
  padding: 1rem;
`;

const StyledSelector = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const Button = styled.button`
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  margin-right: 10px;
  padding: 5px 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const Header = styled.span`
  border: 1px solid black;
  border-radius: 5px;
  color: black;
  cursor: pointer;
  padding: 5px 10px;
`;

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 10px;
`;

const StyledDataContainer = styled(StyledContainer)`
  background-color: yellow;
  border: 1px solid black;
  margin: 10px;
`;

const Marked: FC<ComponentProcessProps> = () => {
  const { processes = {} } = useProcesses();
  const [renderTimestamps, setRenderTimestamps] = useState<
    Record<string, string>
  >({});

  console.log("processes are:", processes);

  const generateTimestamp = () => {
    return new Date().toLocaleTimeString(); // Generating the timestamp
  };

  const updateTimestamp = (title: string) => {
    setRenderTimestamps((prevState) => ({
      ...prevState,
      [title]: generateTimestamp(), // Updating the timestamp for the key
    }));
  };

  return (
    <StyledMarked>
      <StyledSelector>
        <Button>FCFS</Button>
        <Button>SJFS</Button>
        <Button>ROUND ROBIN</Button>
      </StyledSelector>
      <StyledContainer>
        <Header>PROCESS TITLE</Header>
        <Header>BURST TIME</Header>
        <Header>ARRIVAL TIME</Header>
      </StyledContainer>
      {Object.values(processes).map((process, index) => {
        const { title } = process;
        if (!renderTimestamps.hasOwnProperty(title)) {
          updateTimestamp(title); // Generating timestamp if it doesn't exist
        }
        return (
          <StyledDataContainer key={index}>
            <span>{process.title}</span>
            <span>{process.burstTime}</span>
            <span>{renderTimestamps[title]}</span>
          </StyledDataContainer>
        );
      })}
    </StyledMarked>
  );
};
export default Marked;

import directory from "contexts/process/directory";
import type { FC, ReactElement } from "react";
import { useState } from "react";
import styled from "styled-components";
import type { SimulationProcess } from "./type";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalHeader = styled.div`
  text-align: center;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #cdd6f4;
`;

const ModalContent = styled.div`
  background: #1e1e2e;
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid #313244;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;

  label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
    color: #cdd6f4;
    font-size: 0.9rem;
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    background-color: #313244;
    color: #cdd6f4;
    border: 1px solid #45475a;
    border-radius: 0.5rem;
    transition: border-color 0.2s;
    outline: none;

    &:focus {
      border-color: #89b4fa;
    }

    &:hover {
      border-color: #585b70;
    }

    option {
      background-color: #181825;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
`;

interface ModalButtonProps {
  $primary?: boolean;
}

const ModalButton = styled.button<ModalButtonProps>`
  background-color: ${(props) => (props.$primary ? "#89b4fa" : "#45475a")};
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    background-color: ${(props) => (props.$primary ? "#74c7ec" : "#585b70")};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (process: SimulationProcess) => void;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}): ReactElement | undefined => {
  const [processId, setProcessId] = useState("");
  const [burstTime, setBurstTime] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [priority, setPriority] = useState("");

  if (!isOpen) return undefined;

  const handleSubmit = (): void => {
    if (!processId || !burstTime || !memorySize || !arrivalTime || !priority) {
      return;
    }

    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 80%, 65%)`;

    onSubmit({
      arrivalTime: Number(arrivalTime),
      burstTime: Number(burstTime),
      color: randomColor,
      memorySize: Number(memorySize),
      priority: Number(priority),
      processId,
      status: "Not Ready",
      waitingTime: 0,
    });

    // Reset form fields
    setProcessId("");
    setBurstTime("");
    setMemorySize("");
    setArrivalTime("");
    setPriority("");

    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>Add New Process</ModalHeader>
        <FormField>
          <label htmlFor="processId">Process ID</label>
          <select
            id="processId"
            onChange={(e) => setProcessId(e.target.value)}
            value={processId}
          >
            <option value="" disabled>
              Select a process
            </option>
            {Object.keys(directory).map((processKey) => (
              <option key={processKey} value={processKey}>
                {processKey}
              </option>
            ))}
          </select>
        </FormField>
        <FormField>
          <label htmlFor="burstTime">Burst Time</label>
          <input
            id="burstTime"
            min="1"
            onChange={(e) => setBurstTime(e.target.value)}
            placeholder="Enter burst time"
            type="number"
            value={burstTime}
          />
        </FormField>
        <FormField>
          <label htmlFor="memorySize">Memory Size (MB)</label>
          <input
            id="memorySize"
            max="1024"
            min="1"
            onChange={(e) => setMemorySize(e.target.value)}
            placeholder="Enter memory size"
            type="number"
            value={memorySize}
          />
        </FormField>
        <FormField>
          <label htmlFor="arrivalTime">Arrival Time</label>
          <input
            id="arrivalTime"
            min="0"
            onChange={(e) => setArrivalTime(e.target.value)}
            placeholder="Enter arrival time"
            type="number"
            value={arrivalTime}
          />
        </FormField>
        <FormField>
          <label htmlFor="priority">Priority</label>
          <input
            id="priority"
            min="1"
            onChange={(e) => setPriority(e.target.value)}
            placeholder="Enter priority (lower = higher priority)"
            type="number"
            value={priority}
          />
        </FormField>
        <ButtonGroup>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleSubmit} $primary>
            Add Process
          </ModalButton>
        </ButtonGroup>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;

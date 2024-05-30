import directory from "contexts/process/directory";
import { useState } from "react";
import styled from "styled-components";
import Button from "styles/common/Button";

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Ensure the modal appears in front of everything */
`;

const Test = styled.div`
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  padding-bottom: 0.5rem;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;

  label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    display: block;
  }

  input,
  select {
    cursor: pointer;
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const ModalButton = styled(Button)`
  background-color: #4299e1; /* Blue color */
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: #2b6cb0;
  border-radius: 0.25rem;
  width: 45%;

  &:hover {
    background-color: #63b3ed;
    border-bottom-color: #3182ce;
  }
`;

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [processId, setProcessId] = useState("");
  const [burstTime, setBurstTime] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [priority, setPriority] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      arrivalTime,
      burstTime: Number(burstTime),
      memorySize: Number(memorySize),
      priority: Number(priority),
      processId,
      status: "Not Ready", // Assuming status is fixed here
    });
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Test>Add New Process</Test>
        <FormField>
          <label>Process ID</label>
          <select
            onChange={(e) => setProcessId(e.target.value)}
            value={processId}
          >
            {Object.keys(directory).map((processKey) => (
              <option key={processKey} value={processKey}>
                {processKey}
              </option>
            ))}
          </select>
        </FormField>
        <FormField>
          <label>Burst Time</label>
          <input
            onChange={(e) => setBurstTime(e.target.value)}
            type="number"
            value={burstTime}
          />
        </FormField>
        <FormField>
          <label>Memory Size</label>
          <input
            onChange={(e) => setMemorySize(e.target.value)}
            type="number"
            value={memorySize}
          />
        </FormField>
        <FormField>
          <label>Arrival Time</label>
          <input
            onChange={(e) => setArrivalTime(e.target.value)}
            type="number"
            value={arrivalTime}
          />
        </FormField>
        <FormField>
          <label>Priority</label>
          <input
            onChange={(e) => setPriority(e.target.value)}
            type="number"
            value={priority}
          />
        </FormField>
        <ButtonGroup>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleSubmit}>OK</ModalButton>
        </ButtonGroup>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;

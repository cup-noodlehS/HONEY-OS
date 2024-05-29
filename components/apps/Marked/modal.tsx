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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
`;

const ModalButton = styled(Button)`
  margin-top: 1rem;
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
      status,
    });
    onClose();
  };

  return (
    <ModalBackdrop>
      <ModalContent>
        <div>
          <label>
            Process ID
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
          </label>
        </div>
        <div>
          <label>
            Burst Time
            <input
              onChange={(e) => setBurstTime(e.target.value)}
              type="number"
              value={burstTime}
            />
          </label>
        </div>
        <div>
          <label>
            Memory Size
            <input
              onChange={(e) => setMemorySize(e.target.value)}
              type="number"
              value={memorySize}
            />
          </label>
        </div>
        <div>
          <label>
            Arrival Time
            <input
              onChange={(e) => setArrivalTime(e.target.value)}
              type="number"
              value={arrivalTime}
            />
          </label>
        </div>
        <div>
          <label>
            Priority
            <input
              onChange={(e) => setPriority(e.target.value)}
              type="number"
              value={priority}
            />
          </label>
        </div>

        <ModalButton onClick={handleSubmit}>OK</ModalButton>
        <ModalButton onClick={onClose}>Cancel</ModalButton>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;

import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useState } from "react";
import styled from "styled-components";

import useFile from "components/system/Files/FileEntry/useFile";
import Modal from "./modal";
import type { SimulationProcess } from "./type";

const StyledMarked = styled.div`
  background-color: #fffdd0;
  color: black;
  padding-top: 2rem;
  padding-bottom: 5rem;
  padding-left: 5rem;
  padding-right: 5rem;
  overflow: auto;
  height: 100vh; /* Ensure the container takes full viewport height */
`;

const StyledSelector = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
`;

const DesTime = styled.div`
  font-weight: bold;
  align-items: center;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const DesDiv = styled.div`
  font-size: 1.5rem;
  color: white;
  border-radius: 9999px;
  background-color: #123456;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  width: 8rem;
  height: 8rem;
  border: 2px solid gold; /* Add this line for the gold border */
`;

const Button = styled.button<{ disabled: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#4299e1")};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: #2b6cb0;
  border-radius: 0.25rem;
  color: white;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  margin-right: 10px;
  padding: 8px 10px;
  transition:
    transform 200ms,
    background-color 200ms; /* Add background-color to transition */

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#0056b3")};
  }

  &:active {
    background-color: #0056b3; /* Ensure the color stays consistent when active */
    transform: scale(0.95); /* Scale the button to 0.95 when active */
  }
`;

const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: black;
  cursor: pointer;
  padding: 5px 10px;
`;

const ProcessID = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  padding: 10px;
  border-right: 2px solid black; /* Add right border */
`;

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-top: 1.5rem;
  padding-left: 2px;
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "#00c04b";
    case "Processing":
      return "orange";
    case "Ready":
      return "yellow";
    case "Waiting for Memory":
      return "red";
    case "Not Ready":
      return "grey";
    default:
      return "white";
  }
};

const StyledDataContainer = styled(StyledContainer)<{ status: string }>`
  background-color: ${({ status }) => getStatusColor(status)};
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-bottom: 5px solid black;
`;

const DataStyle = styled.div`
  color: white;
  font-weight: 800;
  margin-left: 8rem;
  padding: 1rem;
  border-radius: 4px;
`;

const StyledVisualization = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 2rem;
  border-top: 1px solid #000;
  padding-top: 1rem;
  width: 100%;
`;

const GanttChart = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
`;

const GanttBar = styled.div<{ color: string; left: number; width: number }>`
  height: 30px;
  background-color: ${({ color }) => color};
  width: ${({ width }) => width}%;
  text-align: center;
  line-height: 30px;
  color: white;
  font-weight: bold;
  position: absolute;
  left: ${({ left }) => left}%;
`;

const TimeLabel = styled.div`
  position: absolute;
  top: 35px;
  left: 0;
  width: 100%;
  text-align: start;
  color: black;
  padding-left: 2px;
  font-size: 11px;
`;

const EndTimeLabel = styled.div`
  position: absolute;
  top: 35px;
  right: 0;
  text-align: start;
  color: black;
  font-size: 12px;
`;

const LoadingBarContainer = styled.div`
  position: relative;
  height: 10px;
  width: 100%;
  background-color: #e0e0e0;
  margin-bottom: 1rem;
`;

const LoadingBar = styled.div<{ width: number }>`
  border-radius: 5px;
  height: 100%;
  background-color: #00ab41;
  width: ${({ width }) => width}%;
  transition: width 0.5s linear;
`;

const MainMemoryContainer = styled.div`
  margin-top: 6rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f0f0f0;
`;

const MemorySegment = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  margin: 5px 0;
  padding: 10px;
  border-radius: 4px;
  color: white;
  text-align: center;
`;

const QueueContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f0f0f0;
`;

const QueueHeader = styled.div`
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Marked: FC = () => {
  const { processes = {} } = useProcesses();
  const openFile = useFile(``);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationProcesses, setSimulationProcesses] = useState<
    SimulationProcess[]
  >([]);

  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [readyQueue, setReadyQueue] = useState<SimulationProcess[]>([]);
  const [jobQueue, setJobQueue] = useState<SimulationProcess[]>([]);
  const handleAddProcess = (process: SimulationProcess) => {
    setSimulationProcesses((prevProcesses) => [...prevProcesses, process]);
  };

  const addDummyData = () => {
    const dummyData: SimulationProcess[] = [
      {
        arrivalTime: 0,
        burstTime: 10,
        color: "#ff4c4c",
        memorySize: 256,
        priority: 1,
        processId: "Browser",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 2,
        burstTime: 3,
        color: "#4caf50",
        memorySize: 512,
        priority: 2,
        processId: "Chat",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 3,
        burstTime: 8,
        color: "#2196f3",
        memorySize: 128,
        priority: 3,
        processId: "Emulator",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 4,
        burstTime: 8,
        color: "#ffeb3b",
        memorySize: 128,
        priority: 4,
        processId: "Photos",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 5,
        burstTime: 6,
        color: "#8e44ad",
        memorySize: 64,
        priority: 5,
        processId: "Transfer",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 6,
        burstTime: 4,
        color: "#3498db",
        memorySize: 128,
        priority: 6,
        processId: "IRC",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 7,
        burstTime: 7,
        color: "#e67e22",
        memorySize: 256,
        priority: 7,
        processId: "Webamp",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 8,
        burstTime: 5,
        color: "#2ecc71",
        memorySize: 512,
        priority: 8,
        processId: "VideoPlayer",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 9,
        burstTime: 9,
        color: "#f1c40f",
        memorySize: 64,
        priority: 9,
        processId: "MonacoEditor",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 10,
        burstTime: 2,
        color: "#e74c3c",
        memorySize: 128,
        priority: 10,
        processId: "DevTools",
        status: "Not Ready",
        waitingTime: 0,
      },
    ];

    setSimulationProcesses(dummyData);
  };

  const resetProcesses = () => {
    setSimulationProcesses([]);
    setCurrentTime(0);
    setMemoryUsage(0);
  };

  const simulateFCFS = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: SimulationProcess[] = [];

    sortedProcesses.forEach((process) => {
      if (time < process.arrivalTime) {
        scheduledProcesses.push({
          arrivalTime: time,
          burstTime: process.arrivalTime - time,
          color: "#000000",
          endTime: process.arrivalTime,
          memorySize: 0,
          priority: 0,
          processId: "Idle",
          startTime: time,
          status: "Idle",
          waitingTime: 0,
        });
        time = process.arrivalTime;
      }
      process.startTime = time;
      time += process.burstTime;
      process.endTime = time;
      scheduledProcesses.push(process);
    });

    setSimulationProcesses(scheduledProcesses);
    setTotalTime(time);
  };

  const simulateSJF = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: SimulationProcess[] = [];
    const processQueue: SimulationProcess[] = [];
    const remainingBurstTimes: Record<string, number> = {};

    sortedProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
    });

    while (sortedProcesses.length > 0 || processQueue.length > 0) {
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift()!);
      }

      if (processQueue.length > 0) {
        processQueue.sort(
          (a, b) =>
            remainingBurstTimes[a.processId] - remainingBurstTimes[b.processId]
        );
        const currentProcess = processQueue[0];
        scheduledProcesses.push({
          ...currentProcess,
          burstTime: 1,
          endTime: time + 1,
          startTime: time,
        });
        remainingBurstTimes[currentProcess.processId] -= 1;
        time += 1;
        if (remainingBurstTimes[currentProcess.processId] === 0) {
          processQueue.shift();
        }
      } else {
        scheduledProcesses.push({
          arrivalTime: time,
          burstTime: 1,
          color: "#000000",
          endTime: time + 1,
          memorySize: 0,
          priority: 0,
          processId: "Idle",
          startTime: time,
          status: "Idle",
          waitingTime: 0,
        });
        time += 1;
      }
    }

    setSimulationProcesses(scheduledProcesses);
    setTotalTime(time);
  };

  const simulatePriority = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: SimulationProcess[] = [];
    const processQueue: SimulationProcess[] = [];

    while (sortedProcesses.length > 0 || processQueue.length > 0) {
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift()!);
      }

      if (processQueue.length > 0) {
        processQueue.sort((a, b) => a.priority - b.priority);
        const currentProcess = processQueue.shift()!;
        scheduledProcesses.push({
          ...currentProcess,
          endTime: time + currentProcess.burstTime,
          startTime: time,
        });
        time += currentProcess.burstTime;
      } else {
        scheduledProcesses.push({
          arrivalTime: time,
          burstTime: 1,
          color: "#000000",
          endTime: time + 1,
          memorySize: 0,
          priority: 0,
          processId: "Idle",
          startTime: time,
          status: "Idle",
          waitingTime: 0,
        });
        time += 1;
      }
    }

    setSimulationProcesses(scheduledProcesses);
    setTotalTime(time);
  };

  const simulateRoundRobin = (quantum = 4) => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: SimulationProcess[] = [];
    const processQueue: SimulationProcess[] = [];
    const remainingBurstTimes: Record<string, number> = {};

    sortedProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
    });

    while (sortedProcesses.length > 0 || processQueue.length > 0) {
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift()!);
      }

      if (processQueue.length > 0) {
        const currentProcess = processQueue.shift()!;
        const executionTime = Math.min(
          quantum,
          remainingBurstTimes[currentProcess.processId]
        );

        scheduledProcesses.push({
          ...currentProcess,
          burstTime: executionTime,
          endTime: time + executionTime,
          startTime: time,
        });

        remainingBurstTimes[currentProcess.processId] -= executionTime;
        time += executionTime;

        if (remainingBurstTimes[currentProcess.processId] > 0) {
          // Requeue the process
          while (
            sortedProcesses.length > 0 &&
            sortedProcesses[0].arrivalTime <= time
          ) {
            processQueue.push(sortedProcesses.shift()!);
          }
          processQueue.push(currentProcess);
        }
      } else {
        // If there are no processes ready to run, advance time
        if (sortedProcesses.length > 0) {
          const idleTime = sortedProcesses[0].arrivalTime - time;
          scheduledProcesses.push({
            arrivalTime: time,
            burstTime: idleTime,
            color: "#000000",
            endTime: time + idleTime,
            memorySize: 0,
            priority: 0,
            processId: "Idle",
            startTime: time,
            status: "Idle",
            waitingTime: 0,
          });
          time += idleTime;
        }
      }
    }

    setSimulationProcesses(scheduledProcesses);
    setTotalTime(time);
  };

  const simulate = async () => {
    setIsSimulating(true);
    setCurrentTime(0);
    for (let time = 0; time <= totalTime; time++) {
      setCurrentTime(time);
      await updateProcessStatus(time);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setIsSimulating(false);
  };

  const updateProcessStatus = async (time: number) => {
    return new Promise<void>((resolve) => {
      setSimulationProcesses((prevProcesses) => {
        let currentMemory = readyQueue.reduce(
          (acc, process) => acc + process.memorySize,
          0
        );
        const updatedProcesses = prevProcesses.map((process) => {
          if (time === process.arrivalTime) {
            // Check if process is already in readyQueue
            const isInReadyQueue = readyQueue.some(
              (p) => p.processId === process.processId
            );

            // Check if process is already in jobQueue
            const isInJobQueue = jobQueue.some(
              (p) => p.processId === process.processId
            );

            if (!isInReadyQueue && !isInJobQueue) {
              if (currentMemory + process.memorySize <= 1024) {
                readyQueue.push({ ...process, status: "Ready" });
                currentMemory += process.memorySize;
              } else {
                jobQueue.push({ ...process, status: "Waiting for Memory" });
              }
            }
          } else if (time >= process.startTime && time < process.endTime) {
            // Check if process is already in readyQueue
            const index = readyQueue.findIndex(
              (p) => p.processId === process.processId
            );
            if (index !== -1) {
              // Update process status to "Processing"
              readyQueue[index] = {
                ...readyQueue[index],
                burstTime: readyQueue[index].burstTime - 0.5,
                status: "Processing", // Subtract 1 from burst time
              };
            }
          } else if (time >= process.endTime) {
            // Remove completed process from readyQueue
            const index = readyQueue.findIndex(
              (p) => p.processId === process.processId && p.burstTime <= 1
            );
            if (index !== -1) {
              readyQueue.splice(index, 1);
            }

            // Move the first process from the job queue to the ready queue if memory allows
            if (jobQueue.length > 0) {
              const firstJobProcess = jobQueue[0];
              if (
                !readyQueue.some(
                  (p) => p.processId === firstJobProcess.processId
                ) &&
                currentMemory + firstJobProcess.memorySize <= 1024
              ) {
                readyQueue.push({ ...firstJobProcess, status: "Ready" });
                currentMemory += firstJobProcess.memorySize;

                // Remove the added process from the job queue
                jobQueue.shift();
              }
            }
          }
          return process;
        });

        console.log("Updated processes:", updatedProcesses);
        console.log("Ready Queue:", readyQueue);
        return updatedProcesses;
      });

      resolve();
    });
  };
  return (
    <StyledMarked>
      <StyledSelector>
        <Button disabled={isSimulating} onClick={simulateFCFS}>
          {isSimulating ? "Simulating..." : "FCFS"}
        </Button>
        <Button disabled={isSimulating} onClick={simulateSJF}>
          {isSimulating ? "Simulating..." : "SJF (preemptive)"}
        </Button>
        <Button disabled={isSimulating} onClick={simulatePriority}>
          {isSimulating ? "Simulating..." : "Priority"}
        </Button>
        <Button disabled={isSimulating} onClick={() => simulateRoundRobin()}>
          {isSimulating ? "Simulating..." : "ROUND ROBIN"}
        </Button>
      </StyledSelector>

      <DesTime>
        <DesDiv>
          <span>{currentTime}</span>
        </DesDiv>
      </DesTime>

      <Button disabled={isSimulating} onClick={() => setIsModalOpen(true)}>
        ADD PROCESS
      </Button>
      <Button disabled={isSimulating} onClick={addDummyData}>
        ADD DATA
      </Button>
      <Button disabled={isSimulating} onClick={simulate}>
        {isSimulating ? "Simulating..." : "SIMULATE"}
      </Button>
      <Button disabled={isSimulating} onClick={resetProcesses}>
        RESET
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProcess}
      />
      <StyledContainer>
        <Header>PROCESS ID</Header>
        <Header>BURST TIME</Header>
        <Header>MEMORY SIZE</Header>
        <Header>ARRIVAL TIME</Header>
        <Header>PRIORITY</Header>
        <Header>STATUS</Header>
      </StyledContainer>

      {!isSimulating &&
        simulationProcesses.map((process, index) => {
          const {
            processId,
            burstTime,
            memorySize,
            arrivalTime,
            priority,
            status,
            color,
          } = process;
          return (
            <StyledDataContainer key={index} status={status}>
              <ProcessID>{processId}</ProcessID>
              <ProcessID>{burstTime}</ProcessID>
              <ProcessID>{memorySize}</ProcessID>
              <ProcessID>{arrivalTime}</ProcessID>
              <ProcessID>{priority}</ProcessID>
              <ProcessID>{status}</ProcessID>
            </StyledDataContainer>
          );
        })}
      <StyledVisualization>
        <LoadingBarContainer>
          <LoadingBar width={(currentTime / totalTime) * 100} />
        </LoadingBarContainer>
        <GanttChart>
          {simulationProcesses.map((process, index) => (
            <GanttBar
              key={process.processId + index}
              color={process.color}
              left={(process.startTime / totalTime) * 100}
              width={(process.burstTime / totalTime) * 100}
            >
              {process.processId}
              <TimeLabel>{process.startTime}</TimeLabel>
            </GanttBar>
          ))}
        </GanttChart>
      </StyledVisualization>

      <MainMemoryContainer>
        <QueueHeader>
          Main Memory (
          {readyQueue.reduce((acc, process) => acc + process.memorySize, 0)} /
          1024 MB)
        </QueueHeader>
        {readyQueue.map((process, index) => (
          <MemorySegment key={index} color={process.color}>
            {process.processId} - {process.memorySize}KB
          </MemorySegment>
        ))}
      </MainMemoryContainer>

      <QueueContainer>
        <QueueHeader>Ready Queue</QueueHeader>
        {readyQueue.map((process, index) => (
          <StyledDataContainer key={index} status={process.status}>
            <ProcessID>{process.processId}</ProcessID>
            <ProcessID>{process.burstTime}</ProcessID>
            <ProcessID>{process.memorySize}</ProcessID>
            <ProcessID>{process.arrivalTime}</ProcessID>
            <ProcessID>{process.priority}</ProcessID>
            <ProcessID>{process.status}</ProcessID>
          </StyledDataContainer>
        ))}
      </QueueContainer>

      <QueueContainer>
        <QueueHeader>Job Queue</QueueHeader>
        {jobQueue.map((process, index) => (
          <StyledDataContainer key={index} status={process.status}>
            <ProcessID>{process.processId}</ProcessID>
            <ProcessID>{process.burstTime}</ProcessID>
            <ProcessID>{process.memorySize}</ProcessID>
            <ProcessID>{process.arrivalTime}</ProcessID>
            <ProcessID>{process.priority}</ProcessID>
            <ProcessID>{process.status}</ProcessID>
          </StyledDataContainer>
        ))}
      </QueueContainer>
    </StyledMarked>
  );
};

export default Marked;

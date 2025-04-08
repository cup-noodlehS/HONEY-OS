import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import useFile from "components/system/Files/FileEntry/useFile";
import Modal from "./modal";
import type { SimulationProcess } from "./type";

const StyledMarked = styled.div`
  background-color: #1e1e2e;
  color: #cdd6f4;
  padding: 1.5rem;
  overflow: auto;
  height: 100vh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
`;

const StyledSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding-bottom: 2rem;
  flex-wrap: wrap;
`;

const DesTime = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0 2rem;
`;

const DesDiv = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  border-radius: 1rem;
  background-color: #89b4fa;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 6rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

const Button = styled.button<{ disabled: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#45475a" : "#89b4fa")};
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  color: ${({ disabled }) => (disabled ? "#6c7086" : "white")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#45475a" : "#74c7ec")};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(0)")};
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #cdd6f4;
  padding: 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ProcessID = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: white;
  padding: 0.75rem;
  font-size: 0.875rem;
`;

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #313244;
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "#a6e3a1";
    case "Processing":
      return "#fab387";
    case "Ready":
      return "#f9e2af";
    case "Waiting for Memory":
      return "#f38ba8";
    case "Not Ready":
      return "#7f849c";
    default:
      return "#cdd6f4";
  }
};

const StyledDataContainer = styled.div<{ status: string }>`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  background-color: #181825;
  margin-bottom: 0.25rem;
  border-left: 4px solid ${({ status }) => getStatusColor(status)};
  border-radius: 0.25rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(2px);
    background-color: #1e1e2e;
  }
`;

const QueueHeader = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #cdd6f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MainMemoryContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #313244;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const QueueContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #313244;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const MemorySegment = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  margin: 5px 0;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
`;

const ProcessContainer = styled.div`
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #313244;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #45475a;
    border-radius: 4px;
  }
`;

const MemoryUsage = styled.div`
  height: 8px;
  width: 100%;
  background-color: #45475a;
  border-radius: 4px;
  margin: 0.5rem 0 1rem;
  overflow: hidden;
`;

const MemoryUsageFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background-color: ${({ percentage }) =>
    percentage > 80 ? "#f38ba8" : percentage > 60 ? "#fab387" : "#a6e3a1"};
  transition: width 0.3s ease;
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
        burstTime: 15,
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
    const scheduledProcesses = [];
    const processQueue = [];

    const interval = setInterval(() => {
      // Update the readyQueue based on the current process statuses
      const currentReadyQueue = simulationProcesses.filter(
        (process) =>
          process.status === "Ready" || process.status === "Processing"
      );

      // Calculate current memory usage directly from the readyQueue state
      const currentMemoryUsage = currentReadyQueue.reduce(
        (acc, process) => acc + process.memorySize,
        0
      );

      // Log the current memory usage
      console.log("Current memory usage:", currentMemoryUsage);
      console.log("Queue memory usage:", currentReadyQueue);

      simulationProcesses.forEach((process, index) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          console.log("Process Memory is:", process.memorySize);
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              // Check if the process is already in the jobQueue
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          }
        }
      });

      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift());
      }

      if (processQueue.length > 0) {
        const currentProcess = processQueue[0];
        const processIndex = simulationProcesses.findIndex(
          (p) => p.processId === currentProcess.processId
        );

        if (processIndex !== -1) {
          simulationProcesses[processIndex].burstTime -= 1;
          scheduledProcesses.push({
            ...simulationProcesses[processIndex],
            endTime: time + 1,
            startTime: time,
          });

          if (simulationProcesses[processIndex].burstTime === 0) {
            processQueue.shift();
            simulationProcesses[processIndex].status = "Completed";

            // Try to add the first process from the jobQueue to the readyQueue if there is enough memory
            setJobQueue((prevJobQueue) => {
              if (prevJobQueue.length > 0) {
                const firstJob = prevJobQueue[0];
                const newMemoryUsage = currentMemoryUsage + firstJob.memorySize;
                if (newMemoryUsage <= 1024) {
                  firstJob.status = "Ready";
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1); // Remove the first job from the jobQueue
                }
              }
              return prevJobQueue;
            });
          } else {
            // Update the status of all other processes to "Ready"
            simulationProcesses.forEach((process, index) => {
              if (index !== processIndex && process.status === "Processing") {
                process.status = "Ready";
              }
            });
            simulationProcesses[processIndex].status = "Processing";
          }
        }
        time += 1;
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

      // Update the state of readyQueue
      setReadyQueue(
        currentReadyQueue.filter((process) => process.status !== "Completed")
      );
      setJobQueue((prevJobQueue) =>
        prevJobQueue.filter((process) => process.status !== "Completed")
      );

      setCurrentTime(time);
      if (sortedProcesses.length === 0 && processQueue.length === 0) {
        clearInterval(interval);
        setIsSimulating(false);
      }
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
  };

  const simulateSJF = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const remainingBurstTimes = {};

    sortedProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
    });

    const interval = setInterval(() => {
      // Update the readyQueue based on the current process statuses
      const currentReadyQueue = simulationProcesses.filter(
        (process) =>
          process.status === "Ready" || process.status === "Processing"
      );

      // Calculate current memory usage directly from the readyQueue state
      const currentMemoryUsage = currentReadyQueue.reduce(
        (acc, process) => acc + process.memorySize,
        0
      );

      // Log the current memory usage
      console.log("Current memory usage:", currentMemoryUsage);
      console.log("Queue memory usage:", currentReadyQueue);

      simulationProcesses.forEach((process, index) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          console.log("Process Memory is:", process.memorySize);
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              // Check if the process is already in the jobQueue
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          }
        }
      });

      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift());
      }

      if (processQueue.length > 0) {
        processQueue.sort(
          (a, b) =>
            remainingBurstTimes[a.processId] - remainingBurstTimes[b.processId]
        );
        const currentProcess = processQueue[0];
        const processIndex = simulationProcesses.findIndex(
          (p) => p.processId === currentProcess.processId
        );

        if (processIndex !== -1) {
          simulationProcesses[processIndex].burstTime -= 1;
          scheduledProcesses.push({
            ...simulationProcesses[processIndex],
            endTime: time + 1,
            startTime: time,
          });

          remainingBurstTimes[currentProcess.processId] -= 1;
          if (remainingBurstTimes[currentProcess.processId] === 0) {
            processQueue.shift();
            simulationProcesses[processIndex].status = "Completed";

            // Try to add the first process from the jobQueue to the readyQueue if there is enough memory
            setJobQueue((prevJobQueue) => {
              if (prevJobQueue.length > 0) {
                const firstJob = prevJobQueue[0];
                const newMemoryUsage = currentMemoryUsage + firstJob.memorySize;
                if (newMemoryUsage <= 1024) {
                  firstJob.status = "Ready";
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1); // Remove the first job from the jobQueue
                }
              }
              return prevJobQueue;
            });
          } else {
            // Update the status of all other processes to "Ready"
            simulationProcesses.forEach((process, index) => {
              if (index !== processIndex && process.status === "Processing") {
                process.status = "Ready";
              }
            });
            simulationProcesses[processIndex].status = "Processing";
          }
        }
        time += 1;
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

      // Update the state of readyQueue
      setReadyQueue(
        currentReadyQueue.filter((process) => process.status !== "Completed")
      );
      setJobQueue((prevJobQueue) =>
        prevJobQueue.filter((process) => process.status !== "Completed")
      );
      setCurrentTime(time);
      if (sortedProcesses.length === 0 && processQueue.length === 0) {
        clearInterval(interval);
        setIsSimulating(false);
      }
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
  };

  const simulatePriority = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];

    const interval = setInterval(() => {
      // Update the readyQueue based on the current process statuses
      const currentReadyQueue = simulationProcesses.filter(
        (process) =>
          process.status === "Ready" || process.status === "Processing"
      );

      // Calculate current memory usage directly from the readyQueue state
      const currentMemoryUsage = currentReadyQueue.reduce(
        (acc, process) => acc + process.memorySize,
        0
      );

      // Log the current memory usage
      console.log("Current memory usage:", currentMemoryUsage);
      console.log("Queue memory usage:", currentReadyQueue);

      simulationProcesses.forEach((process, index) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          console.log("Process Memory is:", process.memorySize);
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              // Check if the process is already in the jobQueue
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          }
        }
      });

      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift());
      }

      if (processQueue.length > 0) {
        processQueue.sort((a, b) => a.priority - b.priority);
        const currentProcess = processQueue[0];
        const processIndex = simulationProcesses.findIndex(
          (p) => p.processId === currentProcess.processId
        );

        if (processIndex !== -1) {
          simulationProcesses[processIndex].burstTime -= 1;
          scheduledProcesses.push({
            ...simulationProcesses[processIndex],
            endTime: time + 1,
            startTime: time,
          });

          if (simulationProcesses[processIndex].burstTime === 0) {
            processQueue.shift();
            simulationProcesses[processIndex].status = "Completed";

            // Try to add the first process from the jobQueue to the readyQueue if there is enough memory
            setJobQueue((prevJobQueue) => {
              if (prevJobQueue.length > 0) {
                const firstJob = prevJobQueue[0];
                const newMemoryUsage = currentMemoryUsage + firstJob.memorySize;
                if (newMemoryUsage <= 1024) {
                  firstJob.status = "Ready";
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1); // Remove the first job from the jobQueue
                }
              }
              return prevJobQueue;
            });
          } else {
            // Update the status of all other processes to "Ready"
            simulationProcesses.forEach((process, index) => {
              if (index !== processIndex && process.status === "Processing") {
                process.status = "Ready";
              }
            });
            simulationProcesses[processIndex].status = "Processing";
          }
        }
        time += 1;
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

      // Update the state of readyQueue
      setReadyQueue(
        currentReadyQueue.filter((process) => process.status !== "Completed")
      );
      setJobQueue((prevJobQueue) =>
        prevJobQueue.filter((process) => process.status !== "Completed")
      );

      setCurrentTime(time);
      if (sortedProcesses.length === 0 && processQueue.length === 0) {
        clearInterval(interval);
        setIsSimulating(false);
      }
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
  };

  const simulateRoundRobin = (quantum = 4) => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const remainingBurstTimes = {};

    sortedProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
    });

    const interval = setInterval(() => {
      // Update the readyQueue based on the current process statuses
      const currentReadyQueue = simulationProcesses.filter(
        (process) =>
          process.status === "Ready" || process.status === "Processing"
      );

      // Calculate current memory usage directly from the readyQueue state
      const currentMemoryUsage = currentReadyQueue.reduce(
        (acc, process) => acc + process.memorySize,
        0
      );

      // Log the current memory usage
      console.log("Current memory usage:", currentMemoryUsage);
      console.log("Queue memory usage:", currentReadyQueue);

      simulationProcesses.forEach((process, index) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          console.log("Process Memory is:", process.memorySize);
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              // Check if the process is already in the jobQueue
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          }
        }
      });

      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        processQueue.push(sortedProcesses.shift());
      }

      if (processQueue.length > 0) {
        const currentProcess = processQueue.shift();
        const processIndex = simulationProcesses.findIndex(
          (p) => p.processId === currentProcess.processId
        );

        if (processIndex === -1) {
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
        } else {
          const executionTime = Math.min(
            quantum,
            remainingBurstTimes[currentProcess.processId]
          );

          simulationProcesses[processIndex].burstTime -= executionTime;
          scheduledProcesses.push({
            ...simulationProcesses[processIndex],
            burstTime: executionTime,
            endTime: time + executionTime,
            startTime: time,
          });

          remainingBurstTimes[currentProcess.processId] -= executionTime;

          if (remainingBurstTimes[currentProcess.processId] === 0) {
            simulationProcesses[processIndex].status = "Completed";

            // Try to add the first process from the jobQueue to the readyQueue if there is enough memory
            setJobQueue((prevJobQueue) => {
              if (prevJobQueue.length > 0) {
                const firstJob = prevJobQueue[0];
                const newMemoryUsage = currentMemoryUsage + firstJob.memorySize;
                if (newMemoryUsage <= 1024) {
                  firstJob.status = "Ready";
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1); // Remove the first job from the jobQueue
                }
              }
              return prevJobQueue;
            });
          } else {
            simulationProcesses[processIndex].status = "Ready";
            processQueue.push(currentProcess);
          }

          time += executionTime;
        }

        // Update the state of readyQueue and jobQueue
        setReadyQueue(
          currentReadyQueue.filter((process) => process.status !== "Completed")
        );

        setJobQueue((prevJobQueue) =>
          prevJobQueue.filter((process) => process.status !== "Completed")
        );

        setCurrentTime(time);
        if (sortedProcesses.length === 0 && processQueue.length === 0) {
          clearInterval(interval);
          setIsSimulating(false);
        }
        setSimulationProcesses([...simulationProcesses]);
        setTotalTime(time);
      }
    }, 1000);

    setIsSimulating(true);
  };

  useEffect(() => {
    simulationProcesses.forEach((process) => {
      if (
        process.status === "Processing" &&
        !(process.processId in processes)
      ) {
        openFile(
          process.processId,
          `/System/Icons/${process.processId.toLowerCase()}.webp`
        );
      }
    });
  }, [simulationProcesses, processes]);

  // Calculate memory usage percentage for the progress bar
  const memoryUsagePercentage =
    readyQueue.reduce((acc, process) => acc + process.memorySize, 0) / 10.24;

  return (
    <StyledMarked>
      <StyledSelector>
        <Button disabled={isSimulating} onClick={simulateFCFS}>
          FCFS
        </Button>
        <Button disabled={isSimulating} onClick={simulateSJF}>
          SJF (preemptive)
        </Button>
        <Button disabled={isSimulating} onClick={simulatePriority}>
          Priority
        </Button>
        <Button disabled={isSimulating} onClick={() => simulateRoundRobin()}>
          Round Robin
        </Button>
      </StyledSelector>

      <DesTime>
        <DesDiv>
          <span>{currentTime}</span>
        </DesDiv>
      </DesTime>

      <ActionButtonsContainer>
        <Button disabled={isSimulating} onClick={() => setIsModalOpen(true)}>
          Add Process
        </Button>
        <Button disabled={isSimulating} onClick={addDummyData}>
          Add Data
        </Button>
        <Button disabled={isSimulating} onClick={resetProcesses}>
          Reset
        </Button>
      </ActionButtonsContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProcess}
      />

      <StyledContainer>
        <Header>Process ID</Header>
        <Header>Burst Time</Header>
        <Header>Memory Size</Header>
        <Header>Arrival Time</Header>
        <Header>Priority</Header>
        <Header>Status</Header>
      </StyledContainer>

      <ProcessContainer>
        {simulationProcesses.map((process, index) => {
          const {
            processId,
            burstTime,
            memorySize,
            arrivalTime,
            priority,
            status,
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
      </ProcessContainer>

      <MainMemoryContainer>
        <QueueHeader>
          Main Memory
          <span>
            {readyQueue.reduce((acc, process) => acc + process.memorySize, 0)} /
            1024 MB
          </span>
        </QueueHeader>
        <MemoryUsage>
          <MemoryUsageFill percentage={memoryUsagePercentage} />
        </MemoryUsage>
        {readyQueue.map((process, index) => (
          <MemorySegment key={index} color={process.color}>
            <span>{process.processId}</span>
            <span>{process.memorySize} MB</span>
          </MemorySegment>
        ))}
      </MainMemoryContainer>

      <QueueContainer>
        <QueueHeader>Ready Queue</QueueHeader>
        {readyQueue.length === 0 ? (
          <div style={{ color: "#7f849c", padding: "0.5rem 0" }}>
            No processes in ready queue
          </div>
        ) : (
          readyQueue.map((process, index) => (
            <StyledDataContainer key={index} status={process.status}>
              <ProcessID>{process.processId}</ProcessID>
              <ProcessID>{process.burstTime}</ProcessID>
              <ProcessID>{process.memorySize}</ProcessID>
              <ProcessID>{process.arrivalTime}</ProcessID>
              <ProcessID>{process.priority}</ProcessID>
              <ProcessID>{process.status}</ProcessID>
            </StyledDataContainer>
          ))
        )}
      </QueueContainer>

      <QueueContainer>
        <QueueHeader>Job Queue</QueueHeader>
        {jobQueue.length === 0 ? (
          <div style={{ color: "#7f849c", padding: "0.5rem 0" }}>
            No processes in job queue
          </div>
        ) : (
          jobQueue.map((process, index) => (
            <StyledDataContainer key={index} status={process.status}>
              <ProcessID>{process.processId}</ProcessID>
              <ProcessID>{process.burstTime}</ProcessID>
              <ProcessID>{process.memorySize}</ProcessID>
              <ProcessID>{process.arrivalTime}</ProcessID>
              <ProcessID>{process.priority}</ProcessID>
              <ProcessID>{process.status}</ProcessID>
            </StyledDataContainer>
          ))
        )}
      </QueueContainer>
    </StyledMarked>
  );
};

export default Marked;

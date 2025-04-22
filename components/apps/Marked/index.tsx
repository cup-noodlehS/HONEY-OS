import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import useFile from "components/system/Files/FileEntry/useFile";
import { useTheme } from "contexts/ThemeContext";
import Modal from "./modal";
import type { SimulationProcess } from "./type";

const StyledMarked = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e1e2e" : "#f9f9fb")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
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
  flex-direction: column;
  align-items: center;
  margin: 1rem 0 2rem;
`;

const TimeLabel = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #cdd6f4;
  margin-bottom: 0.75rem;
`;

const DesDiv = styled.div<{ isDarkMode: boolean }>`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  border-radius: 1rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#89b4fa" : "#5c7cfa")};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 6rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
`;

const Button = styled.button<{ disabled: boolean; isDarkMode?: boolean }>`
  background-color: ${({ disabled, isDarkMode = true }) =>
    disabled
      ? isDarkMode
        ? "#45475a"
        : "#d0d0d8"
      : isDarkMode
      ? "#89b4fa"
      : "#5c7cfa"};
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  color: ${({ disabled, isDarkMode = true }) =>
    disabled ? (isDarkMode ? "#6c7086" : "#9999a8") : "white"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;

  &:hover {
    background-color: ${({ disabled, isDarkMode = true }) =>
      disabled
        ? isDarkMode
          ? "#45475a"
          : "#d0d0d8"
        : isDarkMode
        ? "#74c7ec"
        : "#4c6ef5"};
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

const Header = styled.span<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  padding: 0.75rem;
  font-size: 0.875rem;
`;

const ProcessID = styled.span<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: ${({ isDarkMode }) => (isDarkMode ? "white" : "#333344")};
  padding: 0.75rem;
  font-size: 0.875rem;
`;

const StyledContainer = styled.div<{ isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#313244" : "#e9ecef")};
`;

const getStatusColor = (status: string, isDarkMode: boolean) => {
  if (isDarkMode) {
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
  } else {
    switch (status) {
      case "Completed":
        return "#40c057";
      case "Processing":
        return "#ff922b";
      case "Ready":
        return "#fcc419";
      case "Waiting for Memory":
        return "#f03e3e";
      case "Not Ready":
        return "#868e96";
      default:
        return "#495057";
    }
  }
};

const StyledDataContainer = styled.div<{ status: string; isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#f1f3f5")};
  margin-bottom: 0.25rem;
  border-left: 4px solid
    ${({ status, isDarkMode }) => getStatusColor(status, isDarkMode)};
  border-radius: 0.25rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(2px);
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#1e1e2e" : "#e9ecef"};
  }
`;

const QueueHeader = styled.div<{ isDarkMode: boolean }>`
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AlgorithmContainer = styled.div<{ isDarkMode: boolean }>`
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#313244" : "#e9ecef")};
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const AlgorithmTitle = styled.div<{ isDarkMode: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  margin-bottom: 1.25rem;
  text-align: center;
`;

const MainMemoryContainer = styled.div<{ isDarkMode: boolean }>`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#313244" : "#e9ecef")};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const QueueContainer = styled.div<{ isDarkMode: boolean }>`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#313244" : "#e9ecef")};
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

const GanttChartContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #313244;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const GanttChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GanttLegend = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #45475a;
`;

const GanttLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
`;

const GanttLegendColor = styled.div<{ color: string }>`
  width: 1rem;
  height: 1rem;
  background-color: ${({ color }) => color};
  border-radius: 2px;
`;

const GanttTimeline = styled.div`
  position: relative;
  height: 3rem;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1e1e2e;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #45475a;
    border-radius: 4px;
  }
`;

const GanttBar = styled.div<{
  color: string;
  duration: number;
  widthPercentage: number;
}>`
  height: 100%;
  background-color: ${({ color }) => color};
  width: ${({ widthPercentage, duration }) => `${widthPercentage * duration}%`};
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.8rem;
  margin-right: 1px;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    z-index: 10;
  }

  &::after {
    content: attr(data-time);
    position: absolute;
    bottom: 0;
    right: 2px;
    font-size: 0.65rem;
    opacity: 0.8;
  }
`;

const GanttTimeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.25rem;
  color: #cdd6f4;
  font-size: 0.7rem;
`;

interface GanttItem {
  color: string;
  endTime: number;
  processId: string;
  startTime: number;
}

const ThemeToggleButton = styled.button<{ isDarkMode: boolean }>`
  position: absolute;
  top: 2rem;
  right: 1rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  &:hover {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#585b70" : "#dee2e6"};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Marked: FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
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
  const [executionHistory, setExecutionHistory] = useState<GanttItem[]>([]);

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
    setExecutionHistory([]);
  };

  const simulateFCFS = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const executionTimelineItems: GanttItem[] = [];

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

          // Add to execution timeline
          executionTimelineItems.push({
            color: simulationProcesses[processIndex].color,
            endTime: time + 1,
            processId: simulationProcesses[processIndex].processId,
            startTime: time,
          });

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
        // Idle process
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
        });

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
      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulateSJF = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const remainingBurstTimes = {};
    const executionTimelineItems: GanttItem[] = [];

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

          // Add to execution timeline
          executionTimelineItems.push({
            color: simulationProcesses[processIndex].color,
            endTime: time + 1,
            processId: simulationProcesses[processIndex].processId,
            startTime: time,
          });

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
      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
  };

  const simulateSRTF = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const remainingBurstTimes = {};
    const executionTimelineItems: GanttItem[] = [];

    // Initialize remaining burst times
    simulationProcesses.forEach((process) => {
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

      // Check for processes that have arrived at the current time
      simulationProcesses.forEach((process) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          } else if (process.status === "Ready") {
            // If the process can be added to ready queue, add it to process queue too
            processQueue.push(process);
          }
        }
      });

      // Add processes that have arrived to the process queue
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        const newProcess = sortedProcesses.shift();
        if (newProcess.status !== "Waiting for Memory") {
          processQueue.push(newProcess);
        }
      }

      if (processQueue.length > 0) {
        // Sort processes by remaining time (preemptive)
        processQueue.sort((a, b) => {
          const aRemaining = remainingBurstTimes[a.processId] || a.burstTime;
          const bRemaining = remainingBurstTimes[b.processId] || b.burstTime;
          return aRemaining - bRemaining;
        });

        const currentProcess = processQueue[0];
        const processIndex = simulationProcesses.findIndex(
          (p) => p.processId === currentProcess.processId
        );

        if (processIndex !== -1) {
          // Execute for one time unit
          simulationProcesses[processIndex].burstTime -= 1;
          remainingBurstTimes[currentProcess.processId] -= 1;

          // Add to execution timeline
          executionTimelineItems.push({
            color: simulationProcesses[processIndex].color,
            endTime: time + 1,
            processId: simulationProcesses[processIndex].processId,
            startTime: time,
          });

          // Update process status
          simulationProcesses.forEach((process, index) => {
            if (index !== processIndex && process.status === "Processing") {
              process.status = "Ready";
            }
          });
          simulationProcesses[processIndex].status = "Processing";

          // Check if process is completed
          if (remainingBurstTimes[currentProcess.processId] === 0) {
            // Remove from process queue
            processQueue.splice(
              processQueue.findIndex(
                (p) => p.processId === currentProcess.processId
              ),
              1
            );
            simulationProcesses[processIndex].status = "Completed";

            // Try to add the first process from the jobQueue to the readyQueue if there is enough memory
            setJobQueue((prevJobQueue) => {
              if (prevJobQueue.length > 0) {
                const firstJob = prevJobQueue[0];
                const newMemoryUsage = currentMemoryUsage + firstJob.memorySize;
                if (newMemoryUsage <= 1024) {
                  firstJob.status = "Ready";
                  processQueue.push(firstJob);
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1);
                }
              }
              return prevJobQueue;
            });
          }
        }
      } else {
        // Idle process
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
        });
      }

      time += 1;

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
      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulatePriority = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const executionTimelineItems: GanttItem[] = [];

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
        // Idle process
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
        });

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
      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulateRoundRobin = (quantum = 4) => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses = [];
    const processQueue = [];
    const remainingBurstTimes = {};
    const executionTimelineItems: GanttItem[] = [];

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
          // Idle process
          executionTimelineItems.push({
            color: "#45475a",
            endTime: time + 1,
            processId: "Idle",
            startTime: time,
          });

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

          // Add to execution timeline
          executionTimelineItems.push({
            color: simulationProcesses[processIndex].color,
            endTime: time + executionTime,
            processId: simulationProcesses[processIndex].processId,
            startTime: time,
          });

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
                  processQueue.push(firstJob);
                  setReadyQueue((prevReadyQueue) => [
                    ...prevReadyQueue,
                    firstJob,
                  ]);
                  return prevJobQueue.slice(1);
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
        setExecutionHistory(executionTimelineItems);
        setSimulationProcesses([...simulationProcesses]);
        setTotalTime(time);
      }
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulateMultiLevelQueue = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;

    // Define multiple queues with different priorities
    // Queue 0: Highest priority (priority 1-3) - Round Robin with quantum 2
    // Queue 1: Medium priority (priority 4-7) - Round Robin with quantum 4
    // Queue 2: Low priority (priority 8-10) - FCFS
    const queues = [[], [], []];
    const remainingBurstTimes = {};
    const executionTimelineItems: GanttItem[] = [];

    // Initialize remaining burst times
    simulationProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
    });

    const getQueueForPriority = (priority: number) => {
      if (priority >= 1 && priority <= 3) return 0;
      if (priority >= 4 && priority <= 7) return 1;
      return 2;
    };

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

      // Check for processes that have arrived at the current time
      simulationProcesses.forEach((process) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          } else if (process.status === "Ready") {
            // Add to appropriate queue based on priority
            const queueIndex = getQueueForPriority(process.priority);
            queues[queueIndex].push(process);
          }
        }
      });

      // Add newly arrived processes to appropriate queues
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        const newProcess = sortedProcesses.shift();
        if (newProcess.status !== "Waiting for Memory") {
          const queueIndex = getQueueForPriority(newProcess.priority);
          queues[queueIndex].push(newProcess);
        }
      }

      // Process the highest priority queue first
      let executed = false;
      for (let queueIndex = 0; queueIndex < queues.length; queueIndex++) {
        if (queues[queueIndex].length > 0) {
          let currentProcess;

          switch (queueIndex) {
            case 0: // Highest priority - Round Robin with quantum 2
            case 1: // Medium priority - Round Robin with quantum 4
              currentProcess = queues[queueIndex].shift();
              const quantum = queueIndex === 0 ? 2 : 4;
              const executionTime = Math.min(
                quantum,
                remainingBurstTimes[currentProcess.processId]
              );

              const processIndex = simulationProcesses.findIndex(
                (p) => p.processId === currentProcess.processId
              );

              if (processIndex !== -1) {
                simulationProcesses[processIndex].burstTime -= executionTime;
                remainingBurstTimes[currentProcess.processId] -= executionTime;

                // Update status
                simulationProcesses.forEach((process, index) => {
                  if (
                    index !== processIndex &&
                    process.status === "Processing"
                  ) {
                    process.status = "Ready";
                  }
                });
                simulationProcesses[processIndex].status = "Processing";

                // Add to execution timeline
                executionTimelineItems.push({
                  color: simulationProcesses[processIndex].color,
                  endTime: time + executionTime,
                  processId: simulationProcesses[processIndex].processId,
                  startTime: time,
                });

                // Check if process is completed
                if (remainingBurstTimes[currentProcess.processId] === 0) {
                  simulationProcesses[processIndex].status = "Completed";

                  // Try to add the first process from the jobQueue
                  setJobQueue((prevJobQueue) => {
                    if (prevJobQueue.length > 0) {
                      const firstJob = prevJobQueue[0];
                      const newMemoryUsage =
                        currentMemoryUsage + firstJob.memorySize;
                      if (newMemoryUsage <= 1024) {
                        firstJob.status = "Ready";
                        const jobQueueIndex = getQueueForPriority(
                          firstJob.priority
                        );
                        queues[jobQueueIndex].push(firstJob);
                        setReadyQueue((prevReadyQueue) => [
                          ...prevReadyQueue,
                          firstJob,
                        ]);
                        return prevJobQueue.slice(1);
                      }
                    }
                    return prevJobQueue;
                  });
                } else {
                  // If not completed, add back to queue
                  queues[queueIndex].push(currentProcess);
                }

                time += executionTime;
                executed = true;
              }
              break;

            case 2: // Lowest priority - FCFS
              currentProcess = queues[queueIndex][0]; // Peek but don't remove yet
              const processIdx = simulationProcesses.findIndex(
                (p) => p.processId === currentProcess.processId
              );

              if (processIdx !== -1) {
                simulationProcesses[processIdx].burstTime -= 1;
                remainingBurstTimes[currentProcess.processId] -= 1;

                // Update status
                simulationProcesses.forEach((process, index) => {
                  if (index !== processIdx && process.status === "Processing") {
                    process.status = "Ready";
                  }
                });
                simulationProcesses[processIdx].status = "Processing";

                // Add to execution timeline
                executionTimelineItems.push({
                  color: simulationProcesses[processIdx].color,
                  endTime: time + 1,
                  processId: simulationProcesses[processIdx].processId,
                  startTime: time,
                });

                // Check if process is completed
                if (remainingBurstTimes[currentProcess.processId] === 0) {
                  queues[queueIndex].shift(); // Now remove it
                  simulationProcesses[processIdx].status = "Completed";

                  // Try to add the first process from the jobQueue
                  setJobQueue((prevJobQueue) => {
                    if (prevJobQueue.length > 0) {
                      const firstJob = prevJobQueue[0];
                      const newMemoryUsage =
                        currentMemoryUsage + firstJob.memorySize;
                      if (newMemoryUsage <= 1024) {
                        firstJob.status = "Ready";
                        const jobQueueIndex = getQueueForPriority(
                          firstJob.priority
                        );
                        queues[jobQueueIndex].push(firstJob);
                        setReadyQueue((prevReadyQueue) => [
                          ...prevReadyQueue,
                          firstJob,
                        ]);
                        return prevJobQueue.slice(1);
                      }
                    }
                    return prevJobQueue;
                  });
                }

                time += 1;
                executed = true;
              }
              break;
          }

          break; // Process only one queue per time unit (higher priority queues are serviced first)
        }
      }

      if (!executed) {
        // Idle process - no process to execute
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
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

      // Check if all processes are completed
      const allQueuesEmpty = queues.every((queue) => queue.length === 0);
      if (sortedProcesses.length === 0 && allQueuesEmpty) {
        clearInterval(interval);
        setIsSimulating(false);
      }

      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulateMultiLevelFeedbackQueue = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;

    // Define multiple queues with different time quantums
    // Queue 0: Highest priority - Round Robin with quantum 2
    // Queue 1: Medium priority - Round Robin with quantum 4
    // Queue 2: Lowest priority - FCFS
    const queues = [[], [], []];
    const remainingBurstTimes = {};
    const processQueueLevels = {}; // Track which queue each process is in
    const executionTimelineItems: GanttItem[] = [];

    // Initialize remaining burst times
    simulationProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
      processQueueLevels[process.processId] = 0; // All processes start in the highest priority queue
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

      // Check for processes that have arrived at the current time
      simulationProcesses.forEach((process) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          } else if (process.status === "Ready") {
            // New processes always go to the highest priority queue
            queues[0].push(process);
            processQueueLevels[process.processId] = 0;
          }
        }
      });

      // Add newly arrived processes to the highest priority queue
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        const newProcess = sortedProcesses.shift();
        if (newProcess.status !== "Waiting for Memory") {
          queues[0].push(newProcess);
          processQueueLevels[newProcess.processId] = 0;
        }
      }

      // Process the highest priority non-empty queue
      let executed = false;
      for (let queueIndex = 0; queueIndex < queues.length; queueIndex++) {
        if (queues[queueIndex].length > 0) {
          const currentProcess = queues[queueIndex].shift();
          const processIndex = simulationProcesses.findIndex(
            (p) => p.processId === currentProcess.processId
          );

          if (processIndex !== -1) {
            // Determine quantum based on queue level
            let quantum = 1; // Default for FCFS
            if (queueIndex === 0) quantum = 2;
            else if (queueIndex === 1) quantum = 4;

            const executionTime = Math.min(
              quantum,
              remainingBurstTimes[currentProcess.processId]
            );

            simulationProcesses[processIndex].burstTime -= executionTime;
            remainingBurstTimes[currentProcess.processId] -= executionTime;

            // Update status
            simulationProcesses.forEach((process, index) => {
              if (index !== processIndex && process.status === "Processing") {
                process.status = "Ready";
              }
            });
            simulationProcesses[processIndex].status = "Processing";

            // Add to execution timeline
            executionTimelineItems.push({
              color: simulationProcesses[processIndex].color,
              endTime: time + executionTime,
              processId: simulationProcesses[processIndex].processId,
              startTime: time,
            });

            // Check if process is completed
            if (remainingBurstTimes[currentProcess.processId] === 0) {
              simulationProcesses[processIndex].status = "Completed";

              // Try to add the first process from the jobQueue
              setJobQueue((prevJobQueue) => {
                if (prevJobQueue.length > 0) {
                  const firstJob = prevJobQueue[0];
                  const newMemoryUsage =
                    currentMemoryUsage + firstJob.memorySize;
                  if (newMemoryUsage <= 1024) {
                    firstJob.status = "Ready";
                    queues[0].push(firstJob); // New processes start at highest priority
                    processQueueLevels[firstJob.processId] = 0;
                    setReadyQueue((prevReadyQueue) => [
                      ...prevReadyQueue,
                      firstJob,
                    ]);
                    return prevJobQueue.slice(1);
                  }
                }
                return prevJobQueue;
              });
            } else {
              // If not completed, demote to a lower priority queue
              const nextQueueLevel = Math.min(
                queueIndex + 1,
                queues.length - 1
              );
              queues[nextQueueLevel].push(currentProcess);
              processQueueLevels[currentProcess.processId] = nextQueueLevel;
            }

            time += executionTime;
            executed = true;
            break; // Process only one queue per cycle
          }
        }
      }

      if (!executed) {
        // Idle process - no process to execute
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
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

      // Check if all processes are completed
      const allQueuesEmpty = queues.every((queue) => queue.length === 0);
      if (sortedProcesses.length === 0 && allQueuesEmpty) {
        clearInterval(interval);
        setIsSimulating(false);
      }

      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
  };

  const simulateLotteryScheduling = () => {
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const remainingBurstTimes = {};
    const tickets = {}; // Store the number of tickets for each process
    const executionTimelineItems: GanttItem[] = [];
    const processQueue = [];

    // Initialize remaining burst times and assign tickets based on priority
    // Higher priority = more tickets (inverse relationship)
    simulationProcesses.forEach((process) => {
      remainingBurstTimes[process.processId] = process.burstTime;
      // Assign tickets inverse to priority (lower priority number = more important)
      // So priority 1 gets 10 tickets, priority 10 gets 1 ticket
      tickets[process.processId] = Math.max(1, 11 - process.priority);
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

      // Check for processes that have arrived at the current time
      simulationProcesses.forEach((process) => {
        if (process.status === "Not Ready" && process.arrivalTime === time) {
          process.status =
            currentMemoryUsage + process.memorySize > 1024 ||
            jobQueue.length > 0
              ? "Waiting for Memory"
              : "Ready";

          if (process.status === "Waiting for Memory") {
            setJobQueue((prevJobQueue) => {
              if (
                !prevJobQueue.some((p) => p.processId === process.processId)
              ) {
                return [...prevJobQueue, process];
              }
              return prevJobQueue;
            });
          } else if (process.status === "Ready") {
            processQueue.push(process);
          }
        }
      });

      // Add newly arrived processes to the process queue
      while (
        sortedProcesses.length > 0 &&
        sortedProcesses[0].arrivalTime <= time
      ) {
        const newProcess = sortedProcesses.shift();
        if (newProcess.status !== "Waiting for Memory") {
          processQueue.push(newProcess);
        }
      }

      if (processQueue.length > 0) {
        // Lottery scheduling - randomly select a process based on ticket distribution
        const readyProcesses = processQueue.filter(
          (p) => p.status === "Ready" || p.status === "Processing"
        );

        if (readyProcesses.length > 0) {
          // Calculate total tickets in the system
          let totalTickets = 0;
          for (const process of readyProcesses) {
            totalTickets += tickets[process.processId];
          }

          // Generate a random ticket number
          const winningTicket = Math.floor(Math.random() * totalTickets) + 1;

          // Find the winning process
          let ticketCounter = 0;
          let winningProcess = null;

          for (const process of readyProcesses) {
            ticketCounter += tickets[process.processId];
            if (ticketCounter >= winningTicket) {
              winningProcess = process;
              break;
            }
          }

          const processIndex = simulationProcesses.findIndex(
            (p) => p.processId === winningProcess.processId
          );

          if (processIndex !== -1) {
            // Execute for one time unit
            simulationProcesses[processIndex].burstTime -= 1;
            remainingBurstTimes[winningProcess.processId] -= 1;

            // Update status
            simulationProcesses.forEach((process, index) => {
              if (index !== processIndex && process.status === "Processing") {
                process.status = "Ready";
              }
            });
            simulationProcesses[processIndex].status = "Processing";

            // Add to execution timeline
            executionTimelineItems.push({
              color: simulationProcesses[processIndex].color,
              endTime: time + 1,
              processId: simulationProcesses[processIndex].processId,
              startTime: time,
            });

            // Check if process is completed
            if (remainingBurstTimes[winningProcess.processId] === 0) {
              processQueue.splice(
                processQueue.findIndex(
                  (p) => p.processId === winningProcess.processId
                ),
                1
              );
              simulationProcesses[processIndex].status = "Completed";

              // Try to add the first process from the jobQueue
              setJobQueue((prevJobQueue) => {
                if (prevJobQueue.length > 0) {
                  const firstJob = prevJobQueue[0];
                  const newMemoryUsage =
                    currentMemoryUsage + firstJob.memorySize;
                  if (newMemoryUsage <= 1024) {
                    firstJob.status = "Ready";
                    processQueue.push(firstJob);
                    setReadyQueue((prevReadyQueue) => [
                      ...prevReadyQueue,
                      firstJob,
                    ]);
                    return prevJobQueue.slice(1);
                  }
                }
                return prevJobQueue;
              });
            }
          }
        } else {
          // No ready processes
          executionTimelineItems.push({
            color: "#45475a",
            endTime: time + 1,
            processId: "Idle",
            startTime: time,
          });
        }
      } else {
        // Idle process - no process to execute
        executionTimelineItems.push({
          color: "#45475a",
          endTime: time + 1,
          processId: "Idle",
          startTime: time,
        });
      }

      time += 1;

      // Update the state of readyQueue
      setReadyQueue(
        currentReadyQueue.filter((process) => process.status !== "Completed")
      );
      setJobQueue((prevJobQueue) =>
        prevJobQueue.filter((process) => process.status !== "Completed")
      );

      setCurrentTime(time);

      // Check if all processes are completed
      if (
        sortedProcesses.length === 0 &&
        processQueue.every((p) => p.status === "Completed")
      ) {
        clearInterval(interval);
        setIsSimulating(false);
      }

      setExecutionHistory(executionTimelineItems);
      setSimulationProcesses([...simulationProcesses]);
      setTotalTime(time);
    }, 1000);

    setIsSimulating(true);
    setExecutionHistory([]);
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

  // Calculate time scale for Gantt chart
  const timeScale = totalTime > 0 ? 100 / totalTime : 0;

  return (
    <StyledMarked isDarkMode={isDarkMode}>
      <ThemeToggleButton
        isDarkMode={isDarkMode}
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </ThemeToggleButton>

      <AlgorithmContainer isDarkMode={isDarkMode}>
        <AlgorithmTitle isDarkMode={isDarkMode}>
          Scheduling Algorithms
        </AlgorithmTitle>
        <StyledSelector>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateFCFS}
          >
            FCFS
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateSJF}
          >
            SJF
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateSRTF}
          >
            SRTF
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulatePriority}
          >
            Priority
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateRoundRobin}
          >
            Round Robin
          </Button>
        </StyledSelector>
        <StyledSelector>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateMultiLevelQueue}
          >
            Multi-level Queue
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateMultiLevelFeedbackQueue}
          >
            MLFQ
          </Button>
          <Button
            disabled={isSimulating}
            isDarkMode={isDarkMode}
            onClick={simulateLotteryScheduling}
          >
            Lottery
          </Button>
        </StyledSelector>
      </AlgorithmContainer>

      <AlgorithmContainer isDarkMode={isDarkMode}>
        <AlgorithmTitle isDarkMode={isDarkMode}>Simulation Time</AlgorithmTitle>
        <DesTime>
          <DesDiv isDarkMode={isDarkMode}>{currentTime}</DesDiv>
        </DesTime>
      </AlgorithmContainer>

      <ActionButtonsContainer>
        <Button
          disabled={isSimulating}
          isDarkMode={isDarkMode}
          onClick={() => setIsModalOpen(true)}
        >
          Add Process
        </Button>
        <Button
          disabled={isSimulating}
          isDarkMode={isDarkMode}
          onClick={addDummyData}
        >
          Add Data
        </Button>
        <Button
          disabled={isSimulating}
          isDarkMode={isDarkMode}
          onClick={resetProcesses}
        >
          Reset
        </Button>
      </ActionButtonsContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProcess}
      />

      <StyledContainer isDarkMode={isDarkMode}>
        <Header isDarkMode={isDarkMode}>Process ID</Header>
        <Header isDarkMode={isDarkMode}>Burst Time</Header>
        <Header isDarkMode={isDarkMode}>Memory Size</Header>
        <Header isDarkMode={isDarkMode}>Arrival Time</Header>
        <Header isDarkMode={isDarkMode}>Priority</Header>
        <Header isDarkMode={isDarkMode}>Status</Header>
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
            <StyledDataContainer
              key={index}
              status={status}
              isDarkMode={isDarkMode}
            >
              <ProcessID isDarkMode={isDarkMode}>{processId}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{burstTime}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{memorySize} MB</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{arrivalTime}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{priority}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{status}</ProcessID>
            </StyledDataContainer>
          );
        })}
      </ProcessContainer>

      {executionHistory.length > 0 && (
        <GanttChartContainer>
          <GanttChartHeader>
            <QueueHeader isDarkMode={isDarkMode}>
              Process Execution Timeline
            </QueueHeader>
            <span>{`Current Time: ${currentTime}`}</span>
          </GanttChartHeader>

          <GanttTimeline>
            {executionHistory.map((item, index) => (
              <GanttBar
                key={`${item.processId}-${item.startTime}`}
                color={item.color}
                data-time={item.startTime}
                duration={item.endTime - item.startTime}
                title={`${item.processId} (Time: ${item.startTime}-${item.endTime})`}
                widthPercentage={timeScale}
              >
                {item.processId}
              </GanttBar>
            ))}
          </GanttTimeline>

          <GanttTimeLabels>
            <span>Time: 0</span>
            <span>Time: {totalTime}</span>
          </GanttTimeLabels>

          <GanttLegend>
            {/* Create a unique list of processes for the legend */}
            {[
              ...new Map(
                executionHistory
                  .filter((item) => item.processId !== "Idle")
                  .map((item) => [item.processId, item])
              ).values(),
            ].map((item) => (
              <GanttLegendItem key={item.processId}>
                <GanttLegendColor color={item.color} />
                <span>{item.processId}</span>
              </GanttLegendItem>
            ))}
            <GanttLegendItem>
              <GanttLegendColor color="#45475a" />
              <span>Idle</span>
            </GanttLegendItem>
          </GanttLegend>
        </GanttChartContainer>
      )}

      <MainMemoryContainer isDarkMode={isDarkMode}>
        <QueueHeader isDarkMode={isDarkMode}>
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

      <QueueContainer isDarkMode={isDarkMode}>
        <QueueHeader isDarkMode={isDarkMode}>Ready Queue</QueueHeader>
        {readyQueue.length === 0 ? (
          <div style={{ color: "#7f849c", padding: "0.5rem 0" }}>
            No processes in ready queue
          </div>
        ) : (
          readyQueue.map((process, index) => (
            <StyledDataContainer
              key={index}
              status={process.status}
              isDarkMode={isDarkMode}
            >
              <ProcessID isDarkMode={isDarkMode}>{process.processId}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.burstTime}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>
                {process.memorySize} MB
              </ProcessID>
              <ProcessID isDarkMode={isDarkMode}>
                {process.arrivalTime}
              </ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.priority}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.status}</ProcessID>
            </StyledDataContainer>
          ))
        )}
      </QueueContainer>

      <QueueContainer isDarkMode={isDarkMode}>
        <QueueHeader isDarkMode={isDarkMode}>Job Queue</QueueHeader>
        {jobQueue.length === 0 ? (
          <div style={{ color: "#7f849c", padding: "0.5rem 0" }}>
            No processes in job queue
          </div>
        ) : (
          jobQueue.map((process, index) => (
            <StyledDataContainer
              key={index}
              status={process.status}
              isDarkMode={isDarkMode}
            >
              <ProcessID isDarkMode={isDarkMode}>{process.processId}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.burstTime}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>
                {process.memorySize} MB
              </ProcessID>
              <ProcessID isDarkMode={isDarkMode}>
                {process.arrivalTime}
              </ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.priority}</ProcessID>
              <ProcessID isDarkMode={isDarkMode}>{process.status}</ProcessID>
            </StyledDataContainer>
          ))
        )}
      </QueueContainer>
    </StyledMarked>
  );
};

export default Marked;

import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useEffect, useState } from "react";
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
  overflow: hidden;
  height: 100vh; /* Ensure the container takes full viewport height */
`;

const StyledSelector = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-bottom: 5rem;
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
    case "Not Ready":
      return "red";
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
  margin: 5px;
  width: ${({ width }) => width}%;
  text-align: center;
  line-height: 30px;
  color: white;
  font-weight: bold;
  position: absolute;
  left: ${({ left }) => left}%;
  transition: width 1s linear;
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

const Marked: FC = () => {
  const { processes = {} } = useProcesses();
  const openFile = useFile(``);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationProcesses, setSimulationProcesses] = useState<
    SimulationProcess[]
  >([]);
  const [initialProcesses, setInitialProcesses] = useState<SimulationProcess[]>(
    []
  );
  const [fcfsSchedule, setFcfsSchedule] = useState<SimulationProcess[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddProcess = (process: SimulationProcess) => {
    setSimulationProcesses((prevProcesses) => [...prevProcesses, process]);
    setInitialProcesses((prevProcesses) => [...prevProcesses, process]);
  };

  const addDummyData = () => {
    const dummyData: SimulationProcess[] = [
      {
        arrivalTime: 1,
        burstTime: 10,
        color: "#ff4c4c",
        memorySize: 256,
        priority: 1,
        processId: "Browser",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 3,
        burstTime: 3,
        color: "#4caf50",
        memorySize: 512,
        priority: 2,
        processId: "Chat",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 2,
        burstTime: 8,
        color: "#2196f3",
        memorySize: 128,
        priority: 3,
        processId: "Emulator",
        status: "Not Ready",
        waitingTime: 0,
      },
      {
        arrivalTime: 30,
        burstTime: 8,
        color: "#ffeb3b",
        memorySize: 128,
        priority: 4,
        processId: "Photos",
        status: "Not Ready",
        waitingTime: 0,
      },
    ];
    setSimulationProcesses(dummyData);
    setInitialProcesses(dummyData);
  };

  const resetProcesses = () => {
    setSimulationProcesses(initialProcesses);
    setCurrentTime(0);
    setFcfsSchedule([]);
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

    setFcfsSchedule(scheduledProcesses);
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

    setFcfsSchedule(scheduledProcesses);
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

    setFcfsSchedule(scheduledProcesses);
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

    setFcfsSchedule(scheduledProcesses);
    setTotalTime(time);
  };

  const simulate = async () => {
    setIsSimulating(true);
    setCurrentTime(0);
    for (let time = 0; time <= totalTime; time++) {
      await updateProcessStatus(time);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentTime(time);
    }
    setIsSimulating(false);
  };

  const updateProcessStatus = async (time: number) => {
    return new Promise<void>((resolve) => {
      // Find the current process that should be running at the current time
      const currentProcess = fcfsSchedule.find(
        (process) => time >= process.startTime && time < process.endTime
      );

      console.log("Time:", time);
      console.log("Current process is:", currentProcess);

      setSimulationProcesses((prevProcesses) => {
        const updatedProcesses = prevProcesses.map((process) => {
          if (
            currentProcess &&
            process.processId === currentProcess.processId
          ) {
            const burstTime = process.burstTime > 0 ? process.burstTime - 1 : 0;
            const status = burstTime === 0 ? "Completed" : "Processing";
            console.log(
              `Updating process: ${process.processId}, New burst time: ${burstTime}, Status: ${status}`
            );

            return { ...process, burstTime, status };
          }
          if (time >= process.endTime) {
            return { ...process, status: "Completed" };
          }
          if (process.status !== "Completed" && time >= process.arrivalTime) {
            return { ...process, status: "Ready" };
          }
          if (process.status === "Completed") {
            return { ...process, status: "Completed" };
          }
          return { ...process, status: "Not Ready" };
        });

        console.log("Updated processes:", updatedProcesses);
        return updatedProcesses;
      });

      resolve();
    });
  };

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSimulating]);

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
      <p> Current Time: {currentTime}</p>

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

      {simulationProcesses.map((process, index) => {
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
        <GanttChart>
          {fcfsSchedule.map((process, index) => {
            const visibleWidth =
              currentTime >= process.startTime
                ? ((Math.min(currentTime, process.endTime) -
                    process.startTime) /
                    process.burstTime) *
                  100
                : 0;
            return (
              <GanttBar
                key={process.processId + index}
                color={process.color}
                left={(process.startTime / totalTime) * 100}
                width={visibleWidth}
              >
                {process.processId}
                <TimeLabel>{process.startTime}</TimeLabel>
              </GanttBar>
            );
          })}
        </GanttChart>
      </StyledVisualization>
    </StyledMarked>
  );
};

export default Marked;

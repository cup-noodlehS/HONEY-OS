import { useProcesses } from "contexts/process";
import type { FC } from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import useFile from "components/system/Files/FileEntry/useFile";
import { useTheme } from "contexts/ThemeContext";
import AlgorithmInfo from "./AlgorithmInfo";
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

const TabContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid
    ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
`;

const Tab = styled.button<{ isActive: boolean; isDarkMode: boolean }>`
  background-color: ${({ isActive, isDarkMode }) =>
    isActive ? (isDarkMode ? "#89b4fa" : "#5c7cfa") : "transparent"};
  color: ${({ isActive, isDarkMode }) =>
    isActive ? "white" : isDarkMode ? "#cdd6f4" : "#333344"};
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.2s ease;
  margin-right: 0.5rem;

  &:hover {
    background-color: ${({ isActive, isDarkMode }) =>
    isActive
      ? isDarkMode
        ? "#89b4fa"
        : "#5c7cfa"
      : isDarkMode
        ? "#45475a"
        : "#e9ecef"};
  }
`;

const TabContent = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? "block" : "none")};
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

const StyledDataContainer = styled.div<{ isDarkMode: boolean; status: string }>`
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

interface PageReplacementStep {
  frames: (number | undefined)[];
  isFault: boolean;
  newFrameIndex?: number;
  page: number;
}

interface MemoryBlock {
  color?: string;
  endAddress: number;
  id: string;
  isAllocated: boolean;
  processId?: string;
  size: number;
  startAddress: number;
}

interface AllocationRequest {
  color: string;
  processId: string;
  size: number;
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

// Page Replacement Algorithm Styled Components
const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ConfigLabel = styled.label<{ isDarkMode: boolean }>`
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  font-size: 0.9rem;
`;

const ReferenceStringInput = styled.input<{ isDarkMode: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.5rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e1e2e" : "#ffffff")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ isDarkMode }) => (isDarkMode ? "#89b4fa" : "#5c7cfa")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FrameInput = styled.input<{ isDarkMode: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.5rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e1e2e" : "#ffffff")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  font-size: 0.9rem;
  width: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ isDarkMode }) => (isDarkMode ? "#89b4fa" : "#5c7cfa")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 1rem;
`;

const ResultsSummary = styled.div<{ isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#f1f3f5")};
  border-radius: 0.5rem;
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SummaryLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
`;

const TimelineContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`;

const TimelineHeader = styled.div<{ isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: 60px 60px repeat(var(--frame-count, 3), 80px) 80px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.5rem 0.5rem 0 0;
  font-weight: 600;
`;

const TimelineBody = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const TimelineRow = styled.div<{ isDarkMode: boolean; isFault: boolean }>`
  display: grid;
  grid-template-columns: 60px 60px repeat(var(--frame-count, 3), 80px) 80px;
  background-color: ${({ isDarkMode, isFault }) =>
    isFault
      ? isDarkMode
        ? "#f38ba8"
        : "#ffe0e0"
      : isDarkMode
        ? "#181825"
        : "#f9f9f9"};
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ isDarkMode }) =>
    isDarkMode ? "#1e1e2e" : "#f0f0f0"};
  }
`;

const TimelineCell = styled.div<{ isDarkMode: boolean }>`
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  border-right: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
`;

const FrameCell = styled(TimelineCell) <{ isNew: boolean }>`
  font-weight: ${({ isNew }) => (isNew ? "600" : "normal")};
  background-color: ${({ isNew, isDarkMode }) =>
    isNew ? (isDarkMode ? "#a6e3a1" : "#d4edda") : "transparent"};
  color: ${({ isNew, isDarkMode }) =>
    isNew
      ? isDarkMode
        ? "#000000"
        : "#155724"
      : isDarkMode
        ? "#cdd6f4"
        : "#333344"};
`;

const StatusCell = styled(TimelineCell) <{ isFault: boolean }>`
  font-weight: 600;
  color: ${({ isFault, isDarkMode }) =>
    isFault
      ? isDarkMode
        ? "#f38ba8"
        : "#dc3545"
      : isDarkMode
        ? "#a6e3a1"
        : "#28a745"};
`;

// Memory Placement Algorithm Styled Components
const MemoryVisualization = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#f1f3f5")};
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  min-height: 300px;
  position: relative;
`;

const MemoryBlockDiv = styled.div<{
  color?: string;
  height: number;
  isAllocated: boolean;
  isDarkMode: boolean;
}>`
  background-color: ${({ color, isAllocated, isDarkMode }) =>
    isAllocated
      ? color || (isDarkMode ? "#89b4fa" : "#5c7cfa")
      : isDarkMode
        ? "#45475a"
        : "#e9ecef"};
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#6c7086" : "#adb5bd")};
  height: ${({ height }) => height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ isAllocated, isDarkMode }) =>
    isAllocated ? "white" : isDarkMode ? "#cdd6f4" : "#495057"};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 1px;

  &:hover {
    transform: ${({ isAllocated }) => (isAllocated ? "scale(1.02)" : "none")};
    z-index: 5;
  }
`;

const AllocationForm = styled.div<{ isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#f8f9fa")};
  border-radius: 0.5rem;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  margin-bottom: 1rem;
`;

const AllocationInput = styled.input<{ isDarkMode: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.25rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e1e2e" : "#ffffff")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#cdd6f4" : "#333344")};
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: ${({ isDarkMode }) => (isDarkMode ? "#89b4fa" : "#5c7cfa")};
  }
`;

const AllocationStats = styled.div<{ isDarkMode: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#f8f9fa")};
  border-radius: 0.5rem;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

const ProcessList = styled.div<{ isDarkMode: boolean }>`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};
  border-radius: 0.5rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#181825" : "#ffffff")};
`;

const ProcessItem = styled.div<{ color: string; isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#45475a" : "#e9ecef")};

  &:last-child {
    border-bottom: none;
  }
`;

const ProcessInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProcessColorIndicator = styled.div<{ color: string }>`
  width: 1rem;
  height: 1rem;
  background-color: ${({ color }) => color};
  border-radius: 2px;
`;

const DeallocateButton = styled.button<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#f38ba8" : "#dc3545")};
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ isDarkMode }) =>
    isDarkMode ? "#f2d5d5" : "#c82333"};
  }
`;

const Marked: FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { processes = {} } = useProcesses();
  const openFile = useFile(``);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "scheduling" | "replacement" | "placement"
  >("scheduling");
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

  // Page Replacement Algorithm States
  const [pageReferenceString, setPageReferenceString] = useState(
    "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1"
  );
  const [numberOfFrames, setNumberOfFrames] = useState(3);
  const [pageReplacementHistory, setPageReplacementHistory] = useState<
    PageReplacementStep[]
  >([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [currentAlgorithm, setCurrentAlgorithm] = useState("");
  const [pageReferences, setPageReferences] = useState<number[]>([]);

  // Memory Placement Algorithm States
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [totalMemorySize, setTotalMemorySize] = useState(1024);
  const [allocatedProcesses, setAllocatedProcesses] = useState<
    AllocationRequest[]
  >([]);
  const [placementAlgorithm, setPlacementAlgorithm] = useState("");
  const [nextFitPointer, setNextFitPointer] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");

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
    setSelectedAlgorithm("");
    setSimulationProcesses([]);
    setGanttData([]);
    setAverageWaitingTime(0);
    setAverageTurnaroundTime(0);
    setAverageResponseTime(0);
    setCurrentTime(0);
    setIsSimulating(false);
  };

  const simulateFCFS = () => {
    setSelectedAlgorithm("FCFS");
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: any[] = [];
    const processQueue: SimulationProcess[] = [];
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
    setSelectedAlgorithm("SJF");
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: any[] = [];
    const processQueue: SimulationProcess[] = [];
    const remainingBurstTimes: Record<string, number> = {};
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
    setSelectedAlgorithm("SRTF");
    const sortedProcesses = [...simulationProcesses].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );
    let time = 0;
    const scheduledProcesses: any[] = [];
    const processQueue: SimulationProcess[] = [];
    const remainingBurstTimes: Record<string, number> = {};
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
    setSelectedAlgorithm("Priority");
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
    setSelectedAlgorithm("RR");
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
    setSelectedAlgorithm("MLQ");
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
    setSelectedAlgorithm("MLFQ");
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
    setSelectedAlgorithm("Lottery");
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

  // Page Replacement Algorithm Functions
  const parseReferenceString = (refString: string): number[] => {
    return refString
      .split(",")
      .map((s) => Number.parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  };

  const generateRandomReferenceString = () => {
    const length = 20;
    const maxPage = 9;
    const randomPages = Array.from({ length }, () =>
      Math.floor(Math.random() * maxPage)
    );
    setPageReferenceString(randomPages.join(","));
  };

  const resetPageReplacement = () => {
    setPageReplacementHistory([]);
    setPageFaults(0);
    setCurrentAlgorithm("");
    setPageReferences([]);
  };

  const simulatePageReplacement = (algorithm: string) => {
    const references = parseReferenceString(pageReferenceString);
    if (references.length === 0) {
      alert("Please enter a valid page reference string");
      return;
    }

    setPageReferences(references);
    setCurrentAlgorithm(algorithm);
    setIsSimulating(true);

    const frames: (number | undefined)[] = new Array(numberOfFrames).fill();
    let faults = 0;
    const history: PageReplacementStep[] = [];
    let accessOrder: number[] = []; // For LRU
    let clockPointer = 0; // For Clock algorithm
    const referenceBits: boolean[] = new Array(numberOfFrames).fill(false); // For Clock

    const interval = setInterval(() => {
      if (history.length >= references.length) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }

      const currentPage = references[history.length];
      let isFault = false;
      let newFrameIndex: number | undefined;

      // Check if page is already in frames
      const pageIndex = frames.indexOf(currentPage);

      if (pageIndex === -1) {
        // Page fault
        isFault = true;
        faults++;

        // Find empty frame first
        const emptyIndex = frames.indexOf();

        if (emptyIndex === -1) {
          // Need to replace a page
          let replaceIndex = 0;

          switch (algorithm) {
            case "FIFO":
              // Replace the oldest page (first in)
              replaceIndex = history.length % numberOfFrames;
              break;

            case "LRU":
              // Replace least recently used
              const lruPage = accessOrder[0];
              replaceIndex = frames.indexOf(lruPage);
              accessOrder = accessOrder.filter((p) => p !== lruPage);
              accessOrder.push(currentPage);
              break;

            case "Optimal":
              // Replace page that will be used farthest in future
              let farthestIndex = -1;
              let farthestDistance = -1;

              for (const [i, page] of frames.entries()) {
                let nextUse = references.length; // Default to never used again

                for (let j = history.length + 1; j < references.length; j++) {
                  if (references[j] === page) {
                    nextUse = j;
                    break;
                  }
                }

                if (nextUse > farthestDistance) {
                  farthestDistance = nextUse;
                  farthestIndex = i;
                }
              }

              replaceIndex = farthestIndex;
              break;

            case "Clock":
              // Clock algorithm (Second Chance)
              while (referenceBits[clockPointer]) {
                referenceBits[clockPointer] = false;
                clockPointer = (clockPointer + 1) % numberOfFrames;
              }
              replaceIndex = clockPointer;
              clockPointer = (clockPointer + 1) % numberOfFrames;
              break;

            default:
              replaceIndex = 0;
          }

          frames[replaceIndex] = currentPage;
          newFrameIndex = replaceIndex;
        } else {
          // Use empty frame
          frames[emptyIndex] = currentPage;
          newFrameIndex = emptyIndex;

          if (algorithm === "LRU") {
            accessOrder.push(currentPage);
          }
        }
      } else {
        // Page hit
        if (algorithm === "LRU") {
          // Update access order for LRU
          accessOrder = accessOrder.filter((p) => p !== currentPage);
          accessOrder.push(currentPage);
        } else if (algorithm === "Clock") {
          // Set reference bit for Clock
          referenceBits[pageIndex] = true;
        }
      }

      // Record the step
      history.push({
        frames: [...frames],
        isFault,
        newFrameIndex,
        page: currentPage,
      });

      setPageReplacementHistory([...history]);
      setPageFaults(faults);
    }, 1000);
  };

  // Memory Placement Algorithm Functions
  const initializeMemory = () => {
    const initialBlock: MemoryBlock = {
      endAddress: totalMemorySize - 1,
      id: "initial",
      isAllocated: false,
      size: totalMemorySize,
      startAddress: 0,
    };
    setMemoryBlocks([initialBlock]);
    setAllocatedProcesses([]);
    setNextFitPointer(0);
  };

  const generateRandomColors = () => {
    const colors = [
      "#ff4c4c",
      "#4caf50",
      "#2196f3",
      "#ffeb3b",
      "#8e44ad",
      "#3498db",
      "#e67e22",
      "#2ecc71",
      "#f1c40f",
      "#e74c3c",
      "#9b59b6",
      "#1abc9c",
      "#34495e",
      "#f39c12",
      "#d35400",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const allocateMemory = (
    processId: string,
    size: number,
    algorithm: string
  ) => {
    if (size <= 0 || size > totalMemorySize) {
      alert("Invalid memory size");
      return false;
    }

    const color = generateRandomColors();
    let blockIndex = -1;
    let bestFitIndex = -1;
    let bestFitSize = Number.POSITIVE_INFINITY;
    let worstFitIndex = -1;
    let worstFitSize = -1;

    // Find suitable block based on algorithm
    for (const [i, block] of memoryBlocks.entries()) {
      if (!block.isAllocated && block.size >= size) {
        switch (algorithm) {
          case "First Fit":
            blockIndex = i;
            break;
          case "Best Fit":
            if (block.size < bestFitSize) {
              bestFitSize = block.size;
              bestFitIndex = i;
            }
            break;
          case "Worst Fit":
            if (block.size > worstFitSize) {
              worstFitSize = block.size;
              worstFitIndex = i;
            }
            break;
          case "Next Fit":
            if (i >= nextFitPointer) {
              blockIndex = i;
              setNextFitPointer(i);
              break;
            }
            break;
        }

        if (blockIndex !== -1) break;
      }
    }

    // For Next Fit, if no block found from pointer onwards, search from beginning
    if (algorithm === "Next Fit" && blockIndex === -1) {
      for (let i = 0; i < nextFitPointer; i++) {
        const block = memoryBlocks[i];
        if (!block.isAllocated && block.size >= size) {
          blockIndex = i;
          setNextFitPointer(i);
          break;
        }
      }
    }

    // Set the final block index based on algorithm
    if (algorithm === "Best Fit") blockIndex = bestFitIndex;
    if (algorithm === "Worst Fit") blockIndex = worstFitIndex;

    if (blockIndex === -1) {
      alert("No suitable memory block found");
      return false;
    }

    const selectedBlock = memoryBlocks[blockIndex];
    const newBlocks = [...memoryBlocks];

    if (selectedBlock.size === size) {
      // Exact fit
      newBlocks[blockIndex] = {
        ...selectedBlock,
        color,
        isAllocated: true,
        processId,
      };
    } else {
      // Split the block
      const allocatedBlock: MemoryBlock = {
        color,
        endAddress: selectedBlock.startAddress + size - 1,
        id: `${processId}-${Date.now()}`,
        isAllocated: true,
        processId,
        size,
        startAddress: selectedBlock.startAddress,
      };

      const remainingBlock: MemoryBlock = {
        endAddress: selectedBlock.endAddress,
        id: `free-${Date.now()}`,
        isAllocated: false,
        size: selectedBlock.size - size,
        startAddress: selectedBlock.startAddress + size,
      };

      newBlocks.splice(blockIndex, 1, allocatedBlock, remainingBlock);
    }

    setMemoryBlocks(newBlocks);
    setAllocatedProcesses((prev) => [...prev, { color, processId, size }]);
    return true;
  };

  const deallocateMemory = (processId: string) => {
    const newBlocks = memoryBlocks.map((block) =>
      block.processId === processId
        ? {
          ...block,
          color: undefined,
          isAllocated: false,
          processId: undefined,
        }
        : block
    );

    // Merge adjacent free blocks
    const mergedBlocks: MemoryBlock[] = [];
    for (const currentBlock of newBlocks) {
      if (
        !currentBlock.isAllocated &&
        mergedBlocks.length > 0 &&
        !mergedBlocks[mergedBlocks.length - 1].isAllocated &&
        mergedBlocks[mergedBlocks.length - 1].endAddress + 1 ===
        currentBlock.startAddress
      ) {
        // Merge with previous block
        const lastBlock = mergedBlocks[mergedBlocks.length - 1];
        lastBlock.size += currentBlock.size;
        lastBlock.endAddress = currentBlock.endAddress;
      } else {
        mergedBlocks.push(currentBlock);
      }
    }

    setMemoryBlocks(mergedBlocks);
    setAllocatedProcesses((prev) =>
      prev.filter((p) => p.processId !== processId)
    );
  };

  const resetMemoryPlacement = () => {
    initializeMemory();
    setPlacementAlgorithm("");
  };

  const simulatePlacementAlgorithm = (algorithm: string) => {
    setPlacementAlgorithm(algorithm);
    initializeMemory();
  };

  // Initialize memory on component mount
  useEffect(() => {
    initializeMemory();
  }, [totalMemorySize]);

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

  const handleAlgorithmSelection = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    // Add any existing algorithm selection logic here
  };

  return (
    <StyledMarked isDarkMode={isDarkMode}>
      <ThemeToggleButton
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        isDarkMode={isDarkMode}
        onClick={toggleTheme}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </ThemeToggleButton>

      <TabContainer isDarkMode={isDarkMode}>
        <Tab
          isActive={activeTab === "scheduling"}
          isDarkMode={isDarkMode}
          onClick={() => setActiveTab("scheduling")}
        >
          Scheduling Algorithms
        </Tab>
        <Tab
          isActive={activeTab === "replacement"}
          isDarkMode={isDarkMode}
          onClick={() => setActiveTab("replacement")}
        >
          Replacement Algorithms
        </Tab>
        <Tab
          isActive={activeTab === "placement"}
          isDarkMode={isDarkMode}
          onClick={() => setActiveTab("placement")}
        >
          Placement Algorithms
        </Tab>
      </TabContainer>

      <TabContent isVisible={activeTab === "scheduling"}>
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
              onClick={() => simulateRoundRobin()}
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

          {selectedAlgorithm && (
            <AlgorithmInfo
              algorithm={selectedAlgorithm}
              isDarkMode={isDarkMode}
            />
          )}
        </AlgorithmContainer>

        <AlgorithmContainer isDarkMode={isDarkMode}>
          <AlgorithmTitle isDarkMode={isDarkMode}>
            Simulation Time
          </AlgorithmTitle>
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
                isDarkMode={isDarkMode}
                status={status}
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
              {readyQueue.reduce((acc, process) => acc + process.memorySize, 0)}{" "}
              / 1024 MB
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
                isDarkMode={isDarkMode}
                status={process.status}
              >
                <ProcessID isDarkMode={isDarkMode}>
                  {process.processId}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.burstTime}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.memorySize} MB
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.arrivalTime}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.priority}
                </ProcessID>
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
                isDarkMode={isDarkMode}
                status={process.status}
              >
                <ProcessID isDarkMode={isDarkMode}>
                  {process.processId}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.burstTime}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.memorySize} MB
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.arrivalTime}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>
                  {process.priority}
                </ProcessID>
                <ProcessID isDarkMode={isDarkMode}>{process.status}</ProcessID>
              </StyledDataContainer>
            ))
          )}
        </QueueContainer>
      </TabContent>

      <TabContent isVisible={activeTab === "replacement"}>
        <AlgorithmContainer isDarkMode={isDarkMode}>
          <AlgorithmTitle isDarkMode={isDarkMode}>
            Page Replacement Algorithms
          </AlgorithmTitle>
          <StyledSelector>
            <Button
              disabled={isSimulating}
              isDarkMode={isDarkMode}
              onClick={() => simulatePageReplacement("FIFO")}
            >
              FIFO
            </Button>
            <Button
              disabled={isSimulating}
              isDarkMode={isDarkMode}
              onClick={() => simulatePageReplacement("LRU")}
            >
              LRU
            </Button>
            <Button
              disabled={isSimulating}
              isDarkMode={isDarkMode}
              onClick={() => simulatePageReplacement("Optimal")}
            >
              Optimal
            </Button>
            <Button
              disabled={isSimulating}
              isDarkMode={isDarkMode}
              onClick={() => simulatePageReplacement("Clock")}
            >
              Clock
            </Button>
          </StyledSelector>
        </AlgorithmContainer>

        <AlgorithmContainer isDarkMode={isDarkMode}>
          <AlgorithmTitle isDarkMode={isDarkMode}>Configuration</AlgorithmTitle>
          <ConfigContainer>
            <ConfigSection>
              <ConfigLabel isDarkMode={isDarkMode}>
                Page Reference String:
              </ConfigLabel>
              <ReferenceStringInput
                disabled={isSimulating}
                isDarkMode={isDarkMode}
                onChange={(e) => setPageReferenceString(e.target.value)}
                placeholder="e.g., 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1"
                value={pageReferenceString}
              />
            </ConfigSection>
            <ConfigSection>
              <ConfigLabel isDarkMode={isDarkMode}>
                Number of Frames:
              </ConfigLabel>
              <FrameInput
                disabled={isSimulating}
                isDarkMode={isDarkMode}
                max="10"
                min="1"
                onChange={(e) =>
                  setNumberOfFrames(Number.parseInt(e.target.value) || 3)
                }
                type="number"
                value={numberOfFrames}
              />
            </ConfigSection>
            <ActionButtonsContainer>
              <Button
                disabled={isSimulating}
                isDarkMode={isDarkMode}
                onClick={generateRandomReferenceString}
              >
                Generate Random
              </Button>
              <Button
                disabled={isSimulating}
                isDarkMode={isDarkMode}
                onClick={resetPageReplacement}
              >
                Reset
              </Button>
            </ActionButtonsContainer>
          </ConfigContainer>
        </AlgorithmContainer>

        {pageReplacementHistory.length > 0 && (
          <AlgorithmContainer isDarkMode={isDarkMode}>
            <AlgorithmTitle isDarkMode={isDarkMode}>
              Simulation Results - {currentAlgorithm}
            </AlgorithmTitle>
            <ResultsContainer>
              <ResultsSummary isDarkMode={isDarkMode}>
                <SummaryItem>
                  <SummaryLabel>Total Page Faults:</SummaryLabel>
                  <SummaryValue>{pageFaults}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Hit Rate:</SummaryLabel>
                  <SummaryValue>
                    {(
                      ((pageReferences.length - pageFaults) /
                        pageReferences.length) *
                      100
                    ).toFixed(1)}
                    %
                  </SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Miss Rate:</SummaryLabel>
                  <SummaryValue>
                    {((pageFaults / pageReferences.length) * 100).toFixed(1)}%
                  </SummaryValue>
                </SummaryItem>
              </ResultsSummary>
            </ResultsContainer>
          </AlgorithmContainer>
        )}

        {pageReplacementHistory.length > 0 && (
          <AlgorithmContainer isDarkMode={isDarkMode}>
            <AlgorithmTitle isDarkMode={isDarkMode}>
              Frame State Timeline
            </AlgorithmTitle>
            <TimelineContainer
              style={{ "--frame-count": numberOfFrames } as React.CSSProperties}
            >
              <TimelineHeader isDarkMode={isDarkMode}>
                <TimelineCell isDarkMode={isDarkMode}>Step</TimelineCell>
                <TimelineCell isDarkMode={isDarkMode}>Page</TimelineCell>
                {Array.from({ length: numberOfFrames }, (_, i) => (
                  <TimelineCell key={i} isDarkMode={isDarkMode}>
                    Frame {i + 1}
                  </TimelineCell>
                ))}
                <TimelineCell isDarkMode={isDarkMode}>Status</TimelineCell>
              </TimelineHeader>
              <TimelineBody>
                {pageReplacementHistory.map((step, index) => (
                  <TimelineRow
                    key={index}
                    isDarkMode={isDarkMode}
                    isFault={step.isFault}
                  >
                    <TimelineCell isDarkMode={isDarkMode}>
                      {index + 1}
                    </TimelineCell>
                    <TimelineCell isDarkMode={isDarkMode}>
                      {step.page}
                    </TimelineCell>
                    {Array.from({ length: numberOfFrames }, (_, i) => (
                      <FrameCell
                        key={i}
                        isDarkMode={isDarkMode}
                        isNew={step.newFrameIndex === i}
                      >
                        {step.frames[i] === undefined ? "-" : step.frames[i]}
                      </FrameCell>
                    ))}
                    <StatusCell isDarkMode={isDarkMode} isFault={step.isFault}>
                      {step.isFault ? "FAULT" : "HIT"}
                    </StatusCell>
                  </TimelineRow>
                ))}
              </TimelineBody>
            </TimelineContainer>
          </AlgorithmContainer>
        )}
      </TabContent>

      <TabContent isVisible={activeTab === "placement"}>
        <AlgorithmContainer isDarkMode={isDarkMode}>
          <AlgorithmTitle isDarkMode={isDarkMode}>
            Memory Placement Algorithms
          </AlgorithmTitle>
          <StyledSelector>
            <Button
              disabled={false}
              isDarkMode={isDarkMode}
              onClick={() => simulatePlacementAlgorithm("First Fit")}
            >
              First Fit
            </Button>
            <Button
              disabled={false}
              isDarkMode={isDarkMode}
              onClick={() => simulatePlacementAlgorithm("Best Fit")}
            >
              Best Fit
            </Button>
            <Button
              disabled={false}
              isDarkMode={isDarkMode}
              onClick={() => simulatePlacementAlgorithm("Worst Fit")}
            >
              Worst Fit
            </Button>
            <Button
              disabled={false}
              isDarkMode={isDarkMode}
              onClick={() => simulatePlacementAlgorithm("Next Fit")}
            >
              Next Fit
            </Button>
          </StyledSelector>
        </AlgorithmContainer>

        <AlgorithmContainer isDarkMode={isDarkMode}>
          <AlgorithmTitle isDarkMode={isDarkMode}>
            Memory Configuration
          </AlgorithmTitle>
          <ConfigContainer>
            <ConfigSection>
              <ConfigLabel isDarkMode={isDarkMode}>
                Total Memory Size (KB):
              </ConfigLabel>
              <FrameInput
                isDarkMode={isDarkMode}
                max="4096"
                min="256"
                onChange={(e) =>
                  setTotalMemorySize(Number.parseInt(e.target.value) || 1024)
                }
                type="number"
                value={totalMemorySize}
              />
            </ConfigSection>
            <ActionButtonsContainer>
              <Button
                disabled={false}
                isDarkMode={isDarkMode}
                onClick={resetMemoryPlacement}
              >
                Reset Memory
              </Button>
            </ActionButtonsContainer>
          </ConfigContainer>
        </AlgorithmContainer>

        {placementAlgorithm && (
          <AlgorithmContainer isDarkMode={isDarkMode}>
            <AlgorithmTitle isDarkMode={isDarkMode}>
              Allocate Memory - {placementAlgorithm}
            </AlgorithmTitle>
            <AllocationForm isDarkMode={isDarkMode}>
              <div>
                <ConfigLabel isDarkMode={isDarkMode}>Process ID:</ConfigLabel>
                <AllocationInput
                  id="processId"
                  isDarkMode={isDarkMode}
                  placeholder="e.g., P1"
                  type="text"
                />
              </div>
              <div>
                <ConfigLabel isDarkMode={isDarkMode}>Size (KB):</ConfigLabel>
                <AllocationInput
                  id="processSize"
                  isDarkMode={isDarkMode}
                  placeholder="e.g., 100"
                  type="number"
                />
              </div>
              <div />
              <Button
                disabled={false}
                isDarkMode={isDarkMode}
                onClick={() => {
                  const processIdInput = document.querySelector(
                    "#processId"
                  ) as HTMLInputElement;
                  const processSizeInput = document.querySelector(
                    "#processSize"
                  ) as HTMLInputElement;

                  if (processIdInput && processSizeInput) {
                    const processId = processIdInput.value.trim();
                    const size = Number.parseInt(processSizeInput.value);

                    if (processId && size > 0) {
                      const success = allocateMemory(
                        processId,
                        size,
                        placementAlgorithm
                      );
                      if (success) {
                        processIdInput.value = "";
                        processSizeInput.value = "";
                      }
                    } else {
                      alert("Please enter valid process ID and size");
                    }
                  }
                }}
              >
                Allocate
              </Button>
            </AllocationForm>
          </AlgorithmContainer>
        )}

        {memoryBlocks.length > 0 && (
          <AlgorithmContainer isDarkMode={isDarkMode}>
            <AlgorithmTitle isDarkMode={isDarkMode}>
              Memory Visualization
            </AlgorithmTitle>
            <AllocationStats isDarkMode={isDarkMode}>
              <StatItem>
                <StatLabel>Total Memory:</StatLabel>
                <StatValue>{totalMemorySize} KB</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Allocated:</StatLabel>
                <StatValue>
                  {memoryBlocks
                    .filter((block) => block.isAllocated)
                    .reduce((sum, block) => sum + block.size, 0)}{" "}
                  KB
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Free:</StatLabel>
                <StatValue>
                  {memoryBlocks
                    .filter((block) => !block.isAllocated)
                    .reduce((sum, block) => sum + block.size, 0)}{" "}
                  KB
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Fragmentation:</StatLabel>
                <StatValue>
                  {(
                    ((memoryBlocks.filter((block) => !block.isAllocated)
                      .length -
                      1) /
                      memoryBlocks.length) *
                    100
                  ).toFixed(1)}
                  %
                </StatValue>
              </StatItem>
            </AllocationStats>

            <MemoryVisualization isDarkMode={isDarkMode}>
              {memoryBlocks.map((block, index) => (
                <MemoryBlockDiv
                  key={block.id}
                  color={block.color}
                  height={Math.max(20, (block.size / totalMemorySize) * 250)}
                  isAllocated={block.isAllocated}
                  isDarkMode={isDarkMode}
                  title={`${block.isAllocated ? block.processId : "Free"} - ${block.size
                    } KB (${block.startAddress}-${block.endAddress})`}
                >
                  {block.isAllocated
                    ? `${block.processId} (${block.size}KB)`
                    : `Free (${block.size}KB)`}
                </MemoryBlockDiv>
              ))}
            </MemoryVisualization>
          </AlgorithmContainer>
        )}

        {allocatedProcesses.length > 0 && (
          <AlgorithmContainer isDarkMode={isDarkMode}>
            <AlgorithmTitle isDarkMode={isDarkMode}>
              Allocated Processes
            </AlgorithmTitle>
            <ProcessList isDarkMode={isDarkMode}>
              {allocatedProcesses.map((process, index) => (
                <ProcessItem
                  key={index}
                  color={process.color}
                  isDarkMode={isDarkMode}
                >
                  <ProcessInfo>
                    <ProcessColorIndicator color={process.color} />
                    <span>{process.processId}</span>
                    <span>({process.size} KB)</span>
                  </ProcessInfo>
                  <DeallocateButton
                    isDarkMode={isDarkMode}
                    onClick={() => deallocateMemory(process.processId)}
                  >
                    Deallocate
                  </DeallocateButton>
                </ProcessItem>
              ))}
            </ProcessList>
          </AlgorithmContainer>
        )}
      </TabContent>
    </StyledMarked>
  );
};

export default Marked;

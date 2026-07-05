import { useState, useEffect } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import MetricsCard from "../components/MetricsCard";
import ThreatTypePieChart from "../components/ThreatTypePieChart";
import UnresolvedThreatsPieChart from "../components/UnresolvedThreatsPieChart";
import SeverityBarChart from "../components/SeverityBarChart";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, X, Move, Terminal, Maximize2, ShieldCheck } from "lucide-react";
import { fetchVulnerableAppsData } from "../mockData";
import { fetchDevicesByOSData } from "../mockData";

export interface DashboardCardItem {
  id: string;
  type: string;
  title: string;
}

export interface VulnerableApp {
  name: string;
  severity: string;
  hosts: number;
}

export interface DeviceByOS {
  name: string;
  value: number;
  color: string;
}

export default function Dashboard() {
  const [columns, setColumns] = useState<{
    [key: string]: DashboardCardItem[];
  }>({
    "col-1": [],
    "col-2": [],
    "col-3": [],
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [resizableCards, setResizableCards] = useState<Record<string, boolean>>(
    {},
  );

  const [vulnerableApps, setVulnerableApps] = useState<VulnerableApp[]>([]);
  const [devicesByOS, setDevicesByOS] = useState<DeviceByOS[]>([]);

  const {
    metrics,
    threats,
    threatsTypeData,
    unresolvedStatusData,
    threatsSeverityData,
    loading,
  } = useDashboardData();

  useEffect(() => {
    fetchVulnerableAppsData().then((data) => {setVulnerableApps(data)});
    fetchDevicesByOSData().then((data) => {setDevicesByOS(data)});
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const columnCards = Array.from(columns[source.droppableId]);
      const [movedCard] = columnCards.splice(source.index, 1);
      columnCards.splice(destination.index, 0, movedCard);
      setColumns({
        ...columns,
        [source.droppableId]: columnCards,
      });
    } else {
      const sourceCards = Array.from(columns[source.droppableId]);
      const destinationCards = Array.from(columns[destination.droppableId]);
      const [movedItem] = sourceCards.splice(source.index, 1);
      destinationCards.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: sourceCards,
        [destination.droppableId]: destinationCards,
      });
    }
  };

  const addCardToDashboard = (type: string, title: string) => {
    const newCard: DashboardCardItem = {
      id: `card-${Date.now()}`,
      type,
      title,
    };
    setColumns({
      ...columns,
      "col-1": [...columns["col-1"], newCard],
    });
    setIsMenuOpen(false);
  };

  const removeCard = (colId: string, cardId: string) => {
    const updatedCards = columns[colId].filter((card) => card.id !== cardId);
    setColumns({
      ...columns,
      [colId]: updatedCards,
    });
  };

  const toggleResize = (id: string) => {
    setResizableCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderCardContent = (type: string) => {
    switch (type) {
      case "threats":
        return (
          <div
            className="
              grid
              gap-4
              grid-cols-1
              mt-4
            "
          >
            {threats.map((threat) => (
              <div
                key={threat.id}
                className={`${cardStyleClass}`}
                style={{
                  borderLeft: `4px solid ${threat.severity === "Critical" ? "var(--soc-red)" : "var(--soc-yellow)"}`,
                }}
              >
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  mb-3"
                >
                  <span
                    className="
                    flex
                    items-center
                    gap-2
                    text-[14px]
                    font-semibold
                    text-[var(--soc-text)]"
                  >
                    <Terminal size={16} color="var(--soc-gray)" />
                    {threat.computerName}{" "}
                    <span
                      className="
                      text-[var(--soc-subtext)]
                      font-normal"
                    >
                      ({threat.ipAddress})
                    </span>
                  </span>
                  <span
                    className="
                    text-[11px]
                    font-bold
                    px-[10px]
                    py-[4px]
                    rounded-[12px]"
                    style={{
                      backgroundColor:
                        threat.severity === "Critical"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(245, 158, 11, 0.1)",
                      color:
                        threat.severity === "Critical"
                          ? "var(--soc-red)"
                          : "var(--soc-yellow)",
                      border: `1px solid ${threat.severity === "Critical" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
                    }}
                  >
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <p
                  className="
                  mb-1
                  text-[16px]
                  font-medium
                  text-[var(--soc-text)]"
                >
                  {threat.threatType}
                </p>
                <p className="text-[13px] text-[var(--soc-subtext)]">
                  Flagged Object:{" "}
                  <code
                    className="
                    bg-slate-800
                    px-2
                    py-1
                    rounded"
                  >
                    {threat.programName}
                  </code>
                </p>
              </div>
            ))}
          </div>
        );
      case "metrics":
        return <MetricsCard metrics={metrics} loading={loading} />;
      case "threatTypePie":
        return (
          <ThreatTypePieChart
            threatsTypeData={threatsTypeData}
            loading={loading}
          />
        );
      case "unresolvedPie":
        return (
          <UnresolvedThreatsPieChart
            unresolvedStatusData={unresolvedStatusData}
            loading={loading}
          />
        );
      case "severityBar":
        return (
          <SeverityBarChart
            threatsSeverityData={threatsSeverityData}
            loading={loading}
          />
        );
      case "vulnerableApps":
        return (
          <div className="flex flex-col gap-2">
            {vulnerableApps.map((app, i) => (
                <div
                  key={i}
                  className="
                    flex
                    justify-between
                    p-2
                    bg-slate-800
                    rounded
                  "
                >
                  <span className="text-sm text-[var(--soc-text)]">{app.name}</span>
                  <span
                    className="font-bold text-sm"
                    style={{
                      color:
                        app.severity === "Critical"
                          ? "var(--soc-red)"
                          : app.severity === "High"
                            ? "var(--soc-orange)"
                            : app.severity === "Medium"
                              ? "var(--soc-yellow)"
                              : "var(--soc-gray)",
                    }}
                  >
                    {app.hosts} Hosts Affected
                  </span>
                </div>
              ))}
          </div>
        );
      case "devicesByOs":
        return (
          <div className="flex flex-col gap-2">
            {devicesByOS.map((os, i) => (
                <div
                  key={i}
                  className="
                    flex
                    justify-between
                    items-center
                    p-2
                    bg-[#1E293B]
                    rounded
                  "
                >
                  <span className="text-[14px] text-[var(--soc-text)]">{os.name}</span>
                  <span className="font-bold text-sm" style={{ color: os.color }}>
                    {os.value} Active
                  </span>
                </div>
              ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="
        bg-[var(--soc-background)]
        my-0
        mx-auto
        min-h-screen
        p-10
      "
    >
      <header
        className="
          flex
          items-center
          gap-4
          pb-6
          mb-8
          border-b
          border-[var(--soc-border)]
        "
      >
        <ShieldCheck size={36} color="var(--soc-green)" />
        <div>
          <h1
            className="
              m-0
              text-[var(--soc-text)]
              font-bold
              text-2xl
            "
          >
            SME Security Dashboard
          </h1>
          <p
            className="
              m-0
              text-[var(--soc-subtext)]
              text-sm
            "
          >
            (Prototype with Mock Data)
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className="
            flex
            gap-6
            items-start
            overflow-x-auto
            pb-10
          "
        >
          {Object.keys(columns).map((colId) => (
            <Droppable key={colId} droppableId={colId} direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`${kanbanColumnClass}`}
                >
                  {columns[colId].map((card, index) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${cardStyleClass}`}
                          style={{
                            ...provided.draggableProps.style,
                            resize: resizableCards[card.id]
                              ? "horizontal"
                              : "none",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="
                              flex
                              justify-between
                              items-center
                              mb-4
                              border-b
                              border-[var(--soc-border)]
                              pb-2
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-2.5
                              "
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  cursor-grab
                                "
                              >
                                <Move size={16} color="#475569" />
                              </div>
                              <h4
                                className="
                                  m-0
                                  text-[var(--soc-text)]
                                  text-[15px]
                                  font-semibold
                                "
                              >
                                {card.title}
                              </h4>
                            </div>
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <button
                                onClick={() => toggleResize(card.id)}
                                className={`
                                  border-none
                                  flex
                                  items-center
                                  justify-center
                                  p-1.5
                                  rounded-md
                                  cursor-pointer 
                                  transition-all duration-200 ease-in-out
                                  ${
                                    resizableCards[card.id]
                                    ? "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30"
                                    : "bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                  }
                                `}
                                title={
                                  resizableCards[card.id]
                                    ? "Lock Width"
                                    : "Enable Resizing"
                                }
                              >
                                <Maximize2 size={16} />
                              </button>
                              <button
                                onClick={() => removeCard(colId, card.id)}
                                className="
                                  bg-none
                                  border-none
                                  cursor-pointer
                                  flex
                                  text-[var(--soc-gray)]
                                  p-[6px]
                                "
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          <div>{renderCardContent(card.type)}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <button
        onClick={() => setIsMenuOpen(true)}
        className="
          fixed
          bottom-10
          left-10
          w-14
          h-14
          rounded-full
          bg-[var(--soc-blue)]
          text-[#090d16]
          flex
          items-center
          justify-center
          shadow-lg
          z-[100]"
      >
        <Plus size={24} />
      </button>

      {isMenuOpen && (
        <div className={`${modalOverlayClass}`}>
          <div className={`${modalContentClass}`}>
            <div
              className="
                flex
                justify-between
                items-center
                mb-5
                border-b
                border-[var(--soc-border)]
                pb-3
              "
            >
              <h3 style={{ margin: 0, color: "#FFF" }}>
                Select a Component to Add
              </h3>
              <X
                size={20}
                color="var(--soc-subtext)"
                className="cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              />
            </div>
            <div
              className="
                flex
                flex-col
                gap-2.5
              "
            >
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard(
                    "vulnerableApps",
                    "Potentially Vulnerable Applications",
                  )
                }
              >
                + List of Potentially Vulnerable Applications
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard(
                    "devicesByOs",
                    "Devices by Operating System",
                  )
                }
              >
                + List of Secured Devices by Operating System
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard("metrics", "Operational Metrics Overview")
                }
              >
                + Standard Metrics Overview
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard("threats", "Real-Time Incident Feed")
                }
              >
                + Threat Data Feed
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard("threatTypePie", "Threats by Type")
                }
              >
                + Threat Type Pie Chart
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard("unresolvedPie", "Unresolved Threats")
                }
              >
                + Unresolved Threats Pie Chart
              </button>
              <button
                className={`${menuOptionClass}`}
                onClick={() =>
                  addCardToDashboard("severityBar", "Threats by Severity")
                }
              >
                + Threat Severity Bar Graph
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* REUSABLE OBJECT STYLES */
const cardStyleClass =
  "bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5 shadow-md w-full";
const modalOverlayClass =
  "fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,8,15,0.85)]";
const modalContentClass =
  "bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-lg p-7 w-full max-w-[480px]";
const menuOptionClass =
  "bg-[var(--soc-bg)] border border-[var(--soc-border)] text-[var(--soc-text)] text-left rounded px-3 py-2 cursor-pointer text-sm font-medium transition-all duration-200 ease-in-out";
const kanbanColumnClass =
  "flex flex-col gap-4 min-w-[340px] min-h-[300px] flex-none";

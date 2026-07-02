import React, { useState } from "react";
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
import {
  Plus,
  X,
  Info,
  Terminal,
  Maximize2,
  ShieldCheck,
} from "lucide-react";
import { fetchVulnerableAppsData } from "../mockData";
import { fetchDevicesByOSData } from "../mockData";

export interface DashboardCardItem {
  id: string;
  type: string;
  title: string;
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

  const {
    metrics,
    threats,
    threatsTypeData,
    unresolvedStatusData,
    threatsSeverityData,
    loading,
  } = useDashboardData();

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
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "1fr",
              marginTop: "16px",
            }}
          >
            {threats.map((threat) => (
              <div
                key={threat.id}
                style={{
                  ...cardStyle,
                  borderLeft: `4px solid ${threat.severity === "Critical" ? "var(--soc-red)" : "var(--soc-yellow)"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#FFF",
                      fontWeight: 600,
                    }}
                  >
                    <Terminal size={16} color="var(--soc-gray)" />
                    {threat.computerName}{" "}
                    <span
                      style={{ color: "var(--soc-subtext)", fontWeight: 400 }}
                    >
                      ({threat.ipAddress})
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "4px 10px",
                      borderRadius: "12px",
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
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#F1F5F9",
                  }}
                >
                  {threat.threatType}
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                  Flagged Object:{" "}
                  <code
                    style={{
                      backgroundColor: "#1E293B",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fetchVulnerableAppsData().then((data) => data.map((app, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                  backgroundColor: "#1e293b",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <span>{app.name}</span>
                <span
                  style={{
                    color:
                      app.severity === "Critical"
                        ? "var(--soc-red)"
                        : app.severity === "High"
                        ? "var(--soc-orange)"
                        : app.severity === "Medium"
                        ? "var(--soc-yellow)"
                        : "var(--soc-gray)",
                      fontWeight: "bold",
                  }}
                >
                  {app.hosts} Hosts Affected
                </span>
              </div>
            )))}
          </div>
        );
      case "devicesByOs":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fetchDevicesByOSData().then((data) => data.map((os, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "14px" }}>{os.name}</span>
                <span style={{ fontWeight: "bold", color: os.color }}>
                  {os.value} Active
                </span>
              </div>
            )))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "100%",
        margin: "0 auto",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          paddingBottom: "24px",
          marginBottom: "32px",
          borderBottom: "1px solid var(--soc-border)",
        }}
      >
        <ShieldCheck size={36} color="var(--soc-green)" />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "var(--soc-text)",
            }}
          >
            SME Security Dashboard
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              color: "var(--soc-subtext)",
            }}
          >
            (Prototype with Mock Data)
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            overflowX: "auto",
            paddingBottom: "40px",
          }}
        >
          {Object.keys(columns).map((colId) => (
            <Droppable key={colId} droppableId={colId} direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={kanbanColumnStyle}
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
                          style={{
                            ...cardStyle,
                            ...provided.draggableProps.style,
                            resize: resizableCards[card.id]
                              ? "horizontal"
                              : "none",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "16px",
                              borderBottom: "1px solid rgba(34, 47, 71, 0.4)",
                              paddingBottom: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                {...provided.dragHandleProps}
                                style={{
                                  cursor: "grab",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Info size={16} color="#475569" />
                              </div>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: "15px",
                                  color: "var(--soc-text)",
                                  fontWeight: 600,
                                }}
                              >
                                {card.title}
                              </h4>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <button
                                onClick={() => toggleResize(card.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: resizableCards[card.id]
                                    ? "rgba(56, 189, 248, 0.15)"
                                    : "transparent",
                                  color: resizableCards[card.id]
                                    ? "var(--soc-blue)"
                                    : "var(--soc-gray)",
                                  transition: "all 0.2 ease",
                                }}
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
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "6px",
                                  display: "flex",
                                  color: "var(--soc-gray)",
                                }}
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

      <button onClick={() => setIsMenuOpen(true)} style={fabStyle}>
        <Plus size={24} />
      </button>

      {isMenuOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid var(--soc-border)",
                paddingBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, color: "#FFF" }}>
                Select a Component to Add
              </h3>
              <X
                size={20}
                color="var(--soc-subtext)"
                style={{ cursor: "pointer" }}
                onClick={() => setIsMenuOpen(false)}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                style={menuOptionStyle}
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
                style={menuOptionStyle}
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
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard("metrics", "Operational Metrics Overview")
                }
              >
                + Standard Metrics Overview
              </button>
              <button
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard("threats", "Real-Time Incident Feed")
                }
              >
                + Threat Data Feed
              </button>
              <button
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard("threatTypePie", "Threats by Type")
                }
              >
                + Threat Type Pie Chart
              </button>
              <button
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard("unresolvedPie", "Unresolved Threats")
                }
              >
                + Unresolved Threats Pie Chart
              </button>
              <button
                style={menuOptionStyle}
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
const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-card)",
  border: "1px solid var(--soc-border)",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(5, 8, 15, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-card)",
  border: "1px solid var(--soc-border)",
  borderRadius: "16px",
  padding: "28px",
  width: "100%",
  maxWidth: "480px",
};
const menuOptionStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-bg)",
  border: "1px solid var(--soc-border)",
  color: "var(--soc-text)",
  textAlign: "left",
  borderRadius: "4px",
  padding: "12px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "border 0.2s ease",
};
const kanbanColumnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: "340px",
  minHeight: "300px",
  flex: "0 0 auto",
};
const fabStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "40px",
  left: "40px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "var(--soc-blue)",
  color: "#090d16",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  cursor: "pointer",
  zIndex: 100,
};

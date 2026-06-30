import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  fetchMockThreats,
  fetchThreatsTypeData,
  fetchUnresolvedStatusData,
  fetchThreatsSeverityData,
  fetchDashboardMetrics,
} from "./mockData";
import type {
  SecurityThreat,
  PieChartData,
  BarChartData,
  DashboardMetrics,
} from "./types";
import {
  ShieldAlert,
  Plus,
  X,
  LayoutGrid,
  Terminal,
  Bug,
  Activity,
  Maximize2,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* MOCK DATA STRUCTURES FOR COMPONENTS */
const vulnerableAppsData = [
  { name: "App 0", hosts: 4, severity: "High" },
  { name: "App 1", hosts: 4, severity: "Low" },
  { name: "App 2", hosts: 4, severity: "Medium" },
  { name: "App 3", hosts: 4, severity: "Critical" },
];

const devicesByOSData = [
  { name: "Windows 11", value: 84, color: "#0078d4" },
  { name: "macOS Sequoia", value: 21, color: "#e95420" },
  { name: "Ubuntu LTS", value: 42, color: "#a2aaad" },
];

export interface DashboardCardItem {
  id: string;
  type: string;
  title: string;
}

export default function App() {
  // old dashboard card logic
  // const [activeCards, setActiveCards] = useState<DashboardCardItem[]>([
  //   { id: "card-metrics", type: "metrics", title: "Metrics Summary" },
  //   { id: "card-types", type: "threatTypePie", title: "Threats by Type" },
  //   {
  //     id: "card-unresolved",
  //     type: "unresolvedPie",
  //     title: "Unresolved Threats",
  //   },
  //   {
  //     id: "card-severity",
  //     type: "severityBar",
  //     title: "Threats by Severity Grid",
  //   },
  // ]);

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
      "col-1": [...columns["col-1"], newCard], // add new cards to first column by default
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
            <h2
              style={{ fontSize: "18px", color: "#FFF", marginBottom: "4px" }}
            >
              Real-time Incident Feed
            </h2>
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
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
              marginTop: "16px",
            }}
          >
            <div style={cardStyle}>
              <div style={metricHeaderStyle}>
                <p style={metricLabelStyle}>Total Threats</p>
                <Bug size={20} color="var(--soc-subtext)" />
              </div>
              <p style={{ ...metricValueStyle, color: "#FFF" }}>
                {loading ? "..." : metrics?.totalThreats}
              </p>
            </div>
            <div style={cardStyle}>
              <div style={metricHeaderStyle}>
                <p style={metricLabelStyle}>Critical Threats (Active)</p>
                <ShieldAlert size={20} color="var(--soc-red)" />
              </div>
              <p style={{ ...metricValueStyle, color: "var(--soc-red)" }}>
                {loading ? "..." : metrics?.criticalCount}
              </p>
            </div>
            <div style={cardStyle}>
              <div style={metricHeaderStyle}>
                <p style={metricLabelStyle}>RDP Connections</p>
                <Terminal size={20} color="var(--soc-light-blue)" />
              </div>
              <p
                style={{ ...metricValueStyle, color: "var(--soc-light-blue)" }}
              >
                {loading ? "..." : metrics?.activeRdpConnections}
              </p>
            </div>
            <div style={cardStyle}>
              <div style={metricHeaderStyle}>
                <p style={metricLabelStyle}>AnyDesk Instances</p>
                <Activity size={20} color="var(--soc-yellow)" />
              </div>
              <p style={{ ...metricValueStyle, color: "var(--soc-yellow)" }}>
                {loading ? "..." : metrics?.activeAnyDeskInstances}
              </p>
            </div>
          </div>
        );
      case "threatTypePie":
        return (
          <div style={cardStyle}>
            <h2 style={chartTitleStyle}>Threats by Type</h2>
            <div style={{ height: "300px" }}>
              {loading ? (
                <p
                  style={{
                    color: "var(--soc-subtext)",
                    textAlign: "center",
                    paddingTop: "100px",
                  }}
                >
                  Loading chart...
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={threatsTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {threatsTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      case "unresolvedPie":
        return (
          <div style={cardStyle}>
            <h2 style={chartTitleStyle}>Unresolved Threats</h2>
            <div style={{ height: "300px" }}>
              {loading ? (
                <p
                  style={{
                    color: "var(--soc-subtext)",
                    textAlign: "center",
                    paddingTop: "100px",
                  }}
                >
                  Loading chart...
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={unresolvedStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {unresolvedStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      case "severityBar":
        return (
          <div
            style={{ ...cardStyle, gridColumn: "1 / -1", marginTop: "16px" }}
          >
            {" "}
            <h2 style={chartTitleStyle}>Threats by Severity</h2>
            <div style={{ height: "300px" }}>
              {loading ? (
                <p
                  style={{
                    color: "var(--soc-subtext)",
                    textAlign: "center",
                    paddingTop: "100px",
                  }}
                >
                  Loading chart...
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={threatsSeverityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--soc-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="severity"
                      stroke="var(--soc-gray)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--soc-gray)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--soc-blue)"
                      radius={[4, 4, 0, 0]}
                    >
                      {threatsSeverityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getSeverityColor(entry.severity)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );

      case "vulnerableApps":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {vulnerableAppsData.map((app, i) => (
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
                        : "var(--soc-yellow)",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {devicesByOSData.map((os, i) => (
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
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [threatsTypeData, setThreatsTypeData] = useState<PieChartData[]>([]);
  const [unresolvedStatusData, setUnresolvedStatusData] = useState<
    PieChartData[]
  >([]);
  const [threatsSeverityData, setThreatsSeverityData] = useState<
    BarChartData[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMockThreats(),
      fetchDashboardMetrics(),
      fetchThreatsTypeData(),
      fetchUnresolvedStatusData(),
      fetchThreatsSeverityData(),
    ]).then(([threats, metrics, typesData, statusData, severityData]) => {
      setThreats(threats);
      setMetrics(metrics);
      setThreatsTypeData(typesData);
      setUnresolvedStatusData(statusData);
      setThreatsSeverityData(severityData);
      setLoading(false);
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "var(--soc-red)";
      case "High":
        return "var(--soc-yellow)";
      case "Medium":
        return "var(--soc-blue)";
      case "Low":
        return "var(--soc-green)";
      default:
        return "var(--soc-subtext)";
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
      {/* HEADER BAR */}
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

      {/* KANBAN CONTAINER STRUCTURE */}
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
                          {/* COMPONENT HEADER */}
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
                                <LayoutGrid size={16} color="#475569" />
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
                              {/* TOGGLE EXPAND */}
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

                              {/* CLOSE BUTTON */}
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

                          {/* COMPONENT CONTENT BODY */}
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

      {/* FLOATING ACTION BUTTON */}
      <button onClick={() => setIsMenuOpen(true)} style={fabStyle}>
        <Plus size={24} />
      </button>

      {/*MODAL LAYER*/}
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
              <h3
                style={{
                  margin: 0,
                  color: "#FFF",
                }}
              >
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
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
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
                + Potentially Vulnerable Applications (Software Compliance)
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
                + Secured Devices by Operating System (Telemetry Ingestion)
              </button>
              <button
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard(
                    "metrics",
                    "Operational Metrics Overview"
                  )
                }
              >
                + Standard Metrics Aggregates
              </button>
              <button
                style={menuOptionStyle}
                onClick={() =>
                  addCardToDashboard(
                    "threats",
                    "Real-Time Incident Feed"
                  )
                }
              >
                + Threat Data Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OLD DRAG AND DROP CONTAINER
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
              }}
            >
              {activeCards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...cardStyle,
                        ...provided.draggableProps.style,
                      }}
                    >
                      {/* COMPONENT HEADER 
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
                            <LayoutGrid size={16} color="#475569" />
                          </div>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              color: "#FFF",
                              fontWeight: 600,
                            }}
                          >
                            {card.title}
                          </h4>
                        </div>

                        <X
                          size={16}
                          color="var(--soc-subtext)"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => removeCard(colId, card.id)}
                        />
                      </div>

                      {/* COMPONENT CONTENT BODY 
                      <div>{renderCardContent(card.type)}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext> */}
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

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#94A3B8",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const metricValueStyle: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: "32px",
  fontWeight: "bold",
};

const metricHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#FFF",
  marginBottom: "20px",
};

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-card)",
  border: "1px solid var(--soc-border)",
  color: "#FFF",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "12px",
};

//
// const subCardStyle: React.CSSProperties = {
//   backgroundColor: "#090d16",
//   border: "1px solid var(--soc-border)",
//   borderRadius: "8px",
//   padding: "12px",
//   paddingTop: "16px",
// };

// const labelStyle: React.CSSProperties = {
//   margin: 0,
//   fontSize: "11px",
//   color: "var(--soc-subtext)",
//   textTransform: "uppercase",
//   fontWeight: 600,
// };

// const numStyle: React.CSSProperties = {
//   margin: "4px 0 0 0",
//   fontSize: "20px",
//   fontWeight: "bold",
// };

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
  borderRadius: "8px",
  padding: "14px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  transition: "border 0.2s ease",
};

const kanbanColumnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: "340px", // empty column base width
  minHeight: "300px", // empty column base height
  flex: "0 0 auto", // prevent shrinking
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

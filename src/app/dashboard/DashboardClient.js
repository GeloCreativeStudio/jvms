import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Container,
  CircularProgress,
  Button,
  Fade,
  Tooltip,
  Divider,
  Chip,
} from "@mui/material";
import { PageLayout } from "../../components/PageLayout";
import DashboardCard from "../../components/DashboardCard";
import DataTable from "../../components/DataTable";
import { useDashboard } from "../../hooks/useDashboard";
import { PieChart, BarChart } from "@mui/x-charts";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import { formatDateTime } from "../../utils/dateUtils"; // Add this import
import { motion } from "framer-motion"; // Add this import

const RECENT_VISITS_COLUMNS = [
  { id: "visitor_name", label: "Visitor Name" },
  {
    id: "visitor_type",
    label: "Visitor Type",
    chip: (value) => ({
      label: value,
      color:
        value === "PDL Visitor"
          ? "primary"
          : value === "Service Provider"
          ? "secondary"
          : "warning",
      size: "small",
    }),
  },
  {
    id: "status",
    label: "Status",
    chip: (value) => ({
      label: value === "Checked Out" ? "Checked out" : "Not checked out",
      color: value === "Checked Out" ? "success" : "error",
      size: "small",
    }),
  },
  { 
    id: "visited_at", 
    label: "Visited At",
    render: (row) => formatDateTime(row.visited_at) || 'N/A',
    chip: (value) => ({
      label: formatDateTime(value) || 'N/A',
      color: 'default',
      size: 'small',
    })
  },
  { id: "purpose", label: "Purpose" },
];

const DashboardClient = () => {
  const { dashboardData, isLoading, error } = useDashboard();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [hoveredBar, setHoveredBar] = useState(null);

  const processedData = useMemo(() => {
    if (!dashboardData) return null;
    
    const sortAndAdjustWeeklyVisits = (visits) => {
      if (!visits || !visits.weeklyData || visits.weeklyData.length === 0) {
        console.log('Weekly visits is empty or not an array:', visits); // Debug log
        return { data: [], maxValue: 0 };
      }

      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Sort the visits to start from the current day
      const sortedVisits = [...visits.weeklyData].sort((a, b) => {
        const aIndex = daysOfWeek.indexOf(a.name);
        const bIndex = daysOfWeek.indexOf(b.name);
        return ((aIndex - dayOfWeek + 7) % 7) - ((bIndex - dayOfWeek + 7) % 7);
      });
      
      // Mark the current day and calculate total
      return {
        data: sortedVisits.map((day, index) => ({
          ...day,
          isCurrent: index === 0,
          total: (day["PDL Visitor"] || 0) + (day["Service Provider"] || 0) + (day["Personnel"] || 0)
        })),
        maxValue: visits.maxValue
      };
    };

    const { data: weeklyVisitsData, maxValue } = sortAndAdjustWeeklyVisits(dashboardData.weeklyVisits || { weeklyData: [], maxValue: 0 });

    const result = {
      ...dashboardData,
      weeklyVisits: weeklyVisitsData,
      weeklyVisitsMaxValue: maxValue
    };

    console.log('Processed dashboard data:', result); // Debug log
    return result;
  }, [dashboardData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Use consistent colors for charts and labels
  const visitorTypeColors = {
    "PDL Visitor": theme.palette.primary.main,
    "Service Provider": theme.palette.secondary.main,
    "Personnel": theme.palette.warning.main,
  };

  if (error) {
    return (
      <PageLayout title="Dashboard">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <Typography color="error" variant="h6" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Dashboard">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </PageLayout>
    );
  }

  if (
    !processedData ||
    Object.values(processedData).every(
      (value) => value === 0 || (Array.isArray(value) && value.length === 0)
    )
  ) {
    return (
      <PageLayout title="Dashboard">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            No data available. Please add some visitors or visits to see
            dashboard information.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            Refresh Data
          </Button>
        </Box>
      </PageLayout>
    );
  }

  const {
    totalVisitors = 0,
    checkedInVisitors = 0,
    checkedOutVisitors = 0,
    visitorTypes = [],
    weeklyVisits = [],
    recentVisits = [],
    violators = 0,
  } = processedData || {};

  // Use MUI default colors for charts
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  return (
    <PageLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box my={2}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="Total visitors"
                  value={totalVisitors}
                  icon={PeopleIcon}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="Checked-in"
                  value={checkedInVisitors}
                  icon={LoginIcon}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="Checked-out"
                  value={checkedOutVisitors}
                  icon={LogoutIcon}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="Violators"
                  value={violators}
                  icon={WarningIcon}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants}>
                    <Typography variant="h6" gutterBottom>
                      <strong>Weekly Visitors</strong>
                    </Typography>
                    {processedData?.weeklyVisits?.length > 0 ? (
                      <>
                        <BarChart
                          xAxis={[
                            {
                              scaleType: "band",
                              data: processedData.weeklyVisits.map((d) => d.name),
                              tickLabelStyle: {
                                angle: 0,
                                textAnchor: 'middle',
                                fontSize: isMobile ? 7 : 9,
                              },
                              renderTick: (tickProps) => {
                                const { x, y, formattedValue } = tickProps;
                                const isCurrentDay = processedData.weeklyVisits.find(v => v.name === formattedValue)?.isCurrent;
                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    fontSize={isMobile ? 7 : 9}
                                    fontWeight={isCurrentDay ? 'bold' : 'normal'}
                                    fill={isCurrentDay ? theme.palette.primary.main : 'inherit'}
                                  >
                                    {formattedValue}
                                  </text>
                                );
                              },
                            },
                          ]}
                          yAxis={[
                            {
                              scaleType: "linear",
                              max: Math.max(2, Math.ceil(processedData.weeklyVisitsMaxValue)), // Ensure at least 2 ticks
                              tickLabelStyle: {
                                fontSize: isMobile ? 8 : 11,
                              },
                              valueFormatter: (value) => Math.floor(value).toString(), // Only show integer values
                              tickNumber: Math.min(5, Math.max(2, Math.ceil(processedData.weeklyVisitsMaxValue))), // Adjust number of ticks
                              min: 0,
                            },
                          ]}
                          series={[
                            {
                              data: processedData.weeklyVisits.map((d) => d["PDL Visitor"] || 0),
                              color: theme.palette.primary.main,
                              label: "PDL Visitor",
                            },
                            {
                              data: processedData.weeklyVisits.map(
                                (d) => d["Service Provider"] || 0
                              ),
                              color: theme.palette.secondary.main,
                              label: "Service Provider",
                            },
                            {
                              data: processedData.weeklyVisits.map((d) => d["Personnel"] || 0),
                              color: theme.palette.warning.main,
                              label: "Personnel",
                            },
                          ]}
                          height={isMobile ? 250 : isTablet ? 300 : 400}
                          margin={{
                            left: isMobile ? 30 : 50,
                            right: 10,
                            top: isMobile ? 30 : 50,
                            bottom: isMobile ? 30 : 50,
                          }}
                          slotProps={{
                            legend: {
                              direction: "row",
                              position: {
                                vertical: "bottom",
                                horizontal: "middle",
                              },
                              padding: 0,
                              itemMarkWidth: 8,
                              itemMarkHeight: 8,
                              markGap: 5,
                              itemGap: isMobile ? 5 : 10,
                              labelStyle: {
                                fontSize: isMobile ? 9 : 11,
                              },
                            },
                          }}
                          onMouseMove={(event) => {
                            if (event.type === "cell") {
                              setHoveredBar(event);
                            } else {
                              setHoveredBar(null);
                            }
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                          tooltip={{
                            trigger: "item",
                            formatter: (params) => {
                              if (hoveredBar) {
                                const dayData = processedData.weeklyVisits[hoveredBar.dataIndex];
                                return `${hoveredBar.axisValue}<br/>
                                  ${hoveredBar.seriesId}: ${hoveredBar.dataValue}<br/>
                                  Total: ${dayData.total}`;
                              }
                              return "";
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontStyle: 'italic', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                          Number of visitors per type for each day of the week<br/>
                          Total visits: <strong>{processedData.weeklyVisits.reduce((acc, day) => acc + day.total, 0)}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
                          Current day: <strong>{processedData.weeklyVisits.find(d => d.isCurrent)?.name || 'N/A'}</strong> (highlighted)
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body1" align="center">
                        No data available for weekly visits
                      </Typography>
                    )}
                  </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants}>
                    <Typography variant="h6" gutterBottom>
                      <strong>Visitor Types</strong>
                    </Typography>
                    {visitorTypes?.length > 0 ? (
                      <>
                        <PieChart
                          series={[
                            {
                              data: visitorTypes.map((type) => ({
                                ...type,
                                color: visitorTypeColors[type.id] || chartColors[visitorTypes.indexOf(type) % chartColors.length],
                              })),
                              highlightScope: {
                                faded: "global",
                                highlighted: "item",
                              },
                              faded: {
                                innerRadius: 30,
                                additionalRadius: -30,
                                color: "gray",
                              },
                              arcLabel: null,
                            },
                          ]}
                          height={isMobile ? 250 : isTablet ? 300 : 400}
                          margin={{ 
                            top: isMobile ? 30 : 50, 
                            bottom: isMobile ? 30 : 50, 
                            left: isMobile ? 30 : 50, 
                            right: isMobile ? 30 : 50 
                          }}
                          slotProps={{
                            legend: {
                              hidden: true,
                              direction: "column",
                              position: {
                                vertical: "middle",
                                horizontal: "right",
                              },
                              padding: 0,
                              itemMarkWidth: 8,
                              itemMarkHeight: 8,
                              markGap: 5,
                              itemGap: 10,
                              labelStyle: {
                                fontSize: 12,
                              },
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontStyle: 'italic', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                          Comprehensive breakdown of visitor demographics, illustrating the proportional distribution of various visitor categories. This visualization aids in identifying predominant visitor types and informs resource allocation strategies.
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                          {visitorTypes.map((type) => (
                            <Chip
                              key={type.id}
                              label={`${type.id}: ${type.value} (${((type.value / visitorTypes.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%)`}
                              size="small"
                              sx={{
                                backgroundColor: visitorTypeColors[type.id] || chartColors[visitorTypes.indexOf(type) % chartColors.length],
                                color: theme.palette.getContrastText(visitorTypeColors[type.id] || chartColors[visitorTypes.indexOf(type) % chartColors.length]),
                                fontSize: isMobile ? '0.6rem' : '0.75rem',
                                height: isMobile ? '20px' : '24px',
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body1" align="center">
                        No data available
                      </Typography>
                    )}
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Typography variant="h6" gutterBottom>
                  <strong>Recent Visits</strong>
                </Typography>
                <DataTable
                  columns={RECENT_VISITS_COLUMNS}
                  data={recentVisits || []}
                  page={0}
                  rowsPerPage={isMobile ? 3 : isTablet ? 4 : 5}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </PageLayout>
  );
};

DashboardClient.displayName = 'DashboardClient';

export default DashboardClient;
import { useState, useEffect, useCallback } from 'react';
import { getUserData } from '../utils/supabaseClient';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(7);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [visitors, visits, violations] = await Promise.all([
        getUserData('visitors'),
        getUserData('visits'),
        getUserData('violations')
      ]);

      console.log('Raw visits data:', visits); // Debug log

      const weeklyVisitsData = processWeeklyVisits(visits || []);
      console.log('Processed weekly visits data:', weeklyVisitsData); // Debug log

      // Process the data as needed for your dashboard
      const dashboardData = {
        totalVisitors: visitors?.length || 0,
        checkedInVisitors: visits?.filter(v => !v.check_out_time)?.length || 0,
        checkedOutVisitors: visits?.filter(v => v.check_out_time)?.length || 0,
        visitorTypes: processVisitorTypes(visitors || []),
        weeklyVisits: weeklyVisitsData,
        recentVisits: processRecentVisits(visits || [], visitors || []),
        violators: violations?.length || 0
      };

      console.log('Final dashboard data:', dashboardData); // Debug log

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'An error occurred while fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateDateRange = (newRange) => {
    setDateRange(newRange);
  };

  return { dashboardData, isLoading, error, updateDateRange };
};

// Helper functions (implement these according to your data structure)
function processVisitorTypes(visitors) {
  const typeCounts = visitors.reduce((acc, visitor) => {
    acc[visitor.visitor_type] = (acc[visitor.visitor_type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    id: type,
    value: count,
    label: type
  }));
}

function processWeeklyVisits(visits) {
  console.log('Processing weekly visits, input:', visits); // Debug log

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = daysOfWeek.map(day => ({
    name: day,
    'PDL Visitor': 0,
    'Service Provider': 0,
    'Personnel': 0
  }));

  visits.forEach(visit => {
    const visitDate = new Date(visit.check_in_time);
    const dayIndex = visitDate.getDay();
    const visitorType = visit.visitor?.visitor_type || 'Other';
    if (weeklyData[dayIndex][visitorType] !== undefined) {
      weeklyData[dayIndex][visitorType]++;
    }
  });

  // Calculate the maximum value for y-axis
  const maxValue = Math.max(...weeklyData.map(day => 
    Math.max(day['PDL Visitor'], day['Service Provider'], day['Personnel'])
  ));

  console.log('Processed weekly visits, output:', weeklyData); // Debug log
  return { weeklyData, maxValue };
}

function processRecentVisits(visits, visitors) {
  return visits.slice(0, 5).map(visit => {
    const visitor = visitors.find(v => v.id === visit.visitor_id);
    return {
      visitor_name: visitor?.name || 'Unknown',
      visitor_type: visitor?.visitor_type || 'Unknown',
      status: visit.check_out_time ? 'Checked Out' : 'Active',
      visited_at: visit.check_in_time,
      purpose: visit.purpose
    };
  });
}
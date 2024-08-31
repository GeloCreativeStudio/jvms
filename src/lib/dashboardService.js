import { supabase } from '../utils/supabaseClient';

export const getInitialDashboardData = async (dateRange = 7) => {
  try {
    const [totalVisitors, activeVisits, visitorTypes, recentVisits, weeklyVisits] = await Promise.all([
      fetchTotalVisitors(),
      fetchActiveVisits(),
      fetchVisitorTypes(),
      fetchRecentVisits(),
      fetchWeeklyVisits(dateRange)
    ]);

    console.log('Initial dashboard data:', { totalVisitors, activeVisits, visitorTypes, recentVisits, weeklyVisits }); // Debug log

    return {
      totalVisitors,
      activeVisits,
      visitorTypes,
      weeklyVisits,
      recentVisits
    };
  } catch (error) {
    console.error('Error fetching initial dashboard data:', error);
    throw error;
  }
};

const fetchTotalVisitors = async () => {
  const { count, error } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count;
};

const fetchActiveVisits = async () => {
  const { count, error } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .is('check_out_time', null);
  if (error) throw error;
  return count;
};

const fetchVisitorTypes = async () => {
  const { data, error } = await supabase
    .from('visitors')
    .select('visitor_type')
    .order('visitor_type');
  if (error) throw error;
  const typeCounts = data.reduce((acc, { visitor_type }) => {
    acc[visitor_type] = (acc[visitor_type] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(typeCounts).map(([type, value]) => ({ type, value }));
};

const fetchRecentVisits = async () => {
  const { data, error } = await supabase
    .from('visits')
    .select(`
      id,
      check_in_time,
      check_out_time,
      purpose,
      visitors (
        name,
        visitor_type
      )
    `)
    .order('check_in_time', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data.map(visit => ({
    visitor_name: visit.visitors.name,
    visitor_type: visit.visitors.visitor_type,
    status: visit.check_out_time ? 'Completed' : 'Active',
    visited_at: visit.check_in_time,
    purpose: visit.purpose
  }));
};

const fetchWeeklyVisits = async (dateRange) => {
  const { data, error } = await supabase
    .from('visits')
    .select('check_in_time, visitors (visitor_type)')
    .gte('check_in_time', new Date(new Date().setDate(new Date().getDate() - dateRange)).toISOString())
    .order('check_in_time');
  
  if (error) {
    console.error('Error fetching weekly visits:', error);
    throw error;
  }
  
  console.log('Raw weekly visits data:', data); // Debug log
  
  const weeklyVisits = data.reduce((acc, visit) => {
    const date = new Date(visit.check_in_time);
    const weekNumber = getWeekNumber(date);
    const weekKey = `${date.getFullYear()}-W${weekNumber}`;
    
    if (!acc[weekKey]) {
      acc[weekKey] = { week_number: weekNumber, 'PDL Visitor': 0, 'Service Provider': 0, 'Personnel': 0 };
    }
    acc[weekKey][visit.visitors.visitor_type]++;
    return acc;
  }, {});

  return Object.values(weeklyVisits);
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};
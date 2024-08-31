DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_visitors', COALESCE((SELECT COUNT(*) FROM visitors), 0),
    'checked_in_visitors', COALESCE((SELECT COUNT(*) FROM visits WHERE check_out_time IS NULL), 0),
    'checked_out_visitors', COALESCE((SELECT COUNT(*) FROM visits WHERE check_out_time IS NOT NULL), 0),
    'visitor_types', COALESCE((
      SELECT json_agg(json_build_object('visitor_type', visitor_type, 'count', count))
      FROM (SELECT visitor_type, COUNT(*) FROM visitors GROUP BY visitor_type) AS vt
    ), '[]'::json),
    'weekly_visits', COALESCE((
      SELECT json_agg(json_build_object(
        'name', TO_CHAR(day_date, 'Dy'),
        'PDL Visitor', COALESCE(ROUND("PDL Visitor"::numeric), 0),
        'Service Provider', COALESCE(ROUND("Service Provider"::numeric), 0),
        'Personnel', COALESCE(ROUND("Personnel"::numeric), 0),
        'isCurrent', day_date = current_date,
        'debug_date', day_date
      ) ORDER BY day_date)
      FROM (
        SELECT 
          series_date::date AS day_date,
          COUNT(DISTINCT CASE WHEN visitors.visitor_type = 'PDL Visitor' THEN visits.id END) AS "PDL Visitor",
          COUNT(DISTINCT CASE WHEN visitors.visitor_type = 'Service Provider' THEN visits.id END) AS "Service Provider",
          COUNT(DISTINCT CASE WHEN visitors.visitor_type = 'Personnel' THEN visits.id END) AS "Personnel"
        FROM generate_series(current_date - INTERVAL '6 days', current_date, '1 day'::interval) AS series_date
        LEFT JOIN visits ON date_trunc('day', visits.check_in_time AT TIME ZONE 'Asia/Manila') = series_date
        LEFT JOIN visitors ON visits.visitor_id = visitors.id
        GROUP BY series_date
      ) AS daily_visits
    ), '[]'::json),
    'recent_visits', COALESCE((
      SELECT json_agg(json_build_object(
        'id', v.id,
        'visitor_name', vis.name,
        'visitor_type', vis.visitor_type,
        'check_in_time', v.check_in_time,
        'check_out_time', v.check_out_time,
        'purpose', v.purpose
      ))
      FROM (
        SELECT * FROM visits
        ORDER BY check_in_time DESC
        LIMIT 5
      ) AS v
      JOIN visitors vis ON v.visitor_id = vis.id
    ), '[]'::json),
    'violators', COALESCE((SELECT COUNT(*) FROM violations), 0)
  ) INTO result;

  RETURN result;
END;
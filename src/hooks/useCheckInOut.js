import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/authContext';

export const useCheckInOut = () => {
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckInOut = useCallback(async (visitorId, purpose, isCheckIn) => {
    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      if (isCheckIn) {
        await handleCheckIn(visitorId, purpose, user.id);
      } else {
        await handleCheckOut(visitorId, user.id);
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleCheckIn = async (visitorId, purpose, userId) => {
    const { data: visitor, error: visitorError } = await supabase
      .from('visitors')
      .select('id')
      .eq('id', visitorId)
      .single();

    if (visitorError) throw new Error('Visitor not found');

    const { data: violations, error: violationError } = await supabase
      .from('violations')
      .select('id')
      .eq('visitor_id', visitor.id);

    if (violationError) throw violationError;

    if (violations && violations.length > 0) {
      throw new Error('Check-in rejected due to existing violations');
    }

    const { error: visitError } = await supabase
      .from('visits')
      .insert({ 
        visitor_id: visitor.id, 
        purpose, 
        check_in_time: new Date().toISOString(),
        user_id: userId,
        tenant_id: userId
      });

    if (visitError) throw visitError;

    setMessage({ text: 'Check-in successful', severity: 'success' });
  };

  const handleCheckOut = async (visitorId, userId) => {
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select('id')
      .eq('visitor_id', visitorId)
      .eq('user_id', userId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (visitError) throw new Error('No active visit found for this visitor');

    const { error: updateError } = await supabase
      .from('visits')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', visit.id)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    setMessage({ text: 'Check-out successful', severity: 'success' });
  };

  return {
    message,
    isLoading,
    handleCheckInOut,
    setMessage
  };
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import md5 from 'md5';

const ReuContext = createContext();

export function useReu() {
  return useContext(ReuContext);
}

export function ReuProvider({ children }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programSuggestions, setProgramSuggestions] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (programsError) {
        console.error('Error with programs query:', programsError);
        setError(programsError.message);
      } else if (programsData) {
        console.log(`Fetched ${programsData.length} programs`);
        setPrograms(programsData);
      }

      // Fetch program suggestions (user-uploaded decisions)
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('program_suggestions')
        .select(`
          *,
          profile:profiles!program_suggestions_user_id_fkey (
            id,
            email,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (suggestionsError) {
        console.error('Error with suggestions query:', suggestionsError);
      } else if (suggestionsData) {
        console.log(`Fetched ${suggestionsData.length} program suggestions`);
        setProgramSuggestions(suggestionsData);
      }

      // Fetch decisions (user-uploaded decisions)
      const { data: decisionsData, error: decisionsError } = await supabase
        .from('decisions')
        .select(`
          *,
          profiles!decisions_user_id_fkey (
            id,
            email,
            username,
            avatar_url
          ),
          programs!decisions_program_id_fkey (
            id,
            title,
            institution
          )
        `)
        .order('created_at', { ascending: false });

      if (decisionsError) {
        console.error('Error with decisions query:', decisionsError);
      } else if (decisionsData) {
        console.log(`Fetched ${decisionsData.length} decisions`);
        setDecisions(decisionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Add function to submit program suggestions
  const submitReuSuggestion = async (programData, userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from('program_suggestions')
        .insert([
          {
            ...programData,
            user_id: userId,
            user_email: userEmail,
            status: 'pending',
            created_at: new Date().toISOString(),
            source: 'user suggested'
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Refresh programs list
      const newProgram = {
        id: data[0].id,
        ...programData,
        userId,
        userEmail,
        status: 'pending',
        createdAt: new Date(),
        source: 'user suggested'
      };
      
      setPrograms(prevPrograms => [newProgram, ...prevPrograms]);
      return true;
    } catch (err) {
      console.error('Error submitting program suggestion:', err);
      return false;
    }
  };

  const value = {
    programs,
    programSuggestions,
    decisions,
    loading,
    error,
    submitReuSuggestion,
    fetchPrograms
  };

  return (
    <ReuContext.Provider value={value}>
      {children}
    </ReuContext.Provider>
  );
}
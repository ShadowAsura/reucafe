import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ReuContext = createContext();

export function useReu() {
  return useContext(ReuContext);
}

export function ReuProvider({ children }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        
        // Fetch from Supabase (all programs)
        let { data: programs, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('deadline', { ascending: true });  // Add ordering if needed
        
        if (programsError) {
          console.error('Error with basic query:', programsError);
          programs = [];
        }
        
        console.log(`Fetched ${programs?.length || 0} programs from Supabase`);
        
        const supabasePrograms = (programs || []).map(program => {
          
          // Format deadline if it exists
          let formattedDeadline = 'No deadline specified';
          let isPastDeadline = false;
          let rawDeadlineDate = null;
          
          if (program.deadline) {
            try {
              let deadlineDate;
              
              if (typeof program.deadline === 'string') {
                deadlineDate = new Date(program.deadline);
              } else if (program.deadline instanceof Date) {
                deadlineDate = program.deadline;
              }
              
              if (deadlineDate && !isNaN(deadlineDate.getTime())) {
                rawDeadlineDate = deadlineDate;
                formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                isPastDeadline = deadlineDate < new Date();
              } else {
                formattedDeadline = 'No deadline specified';
              }
            } catch (err) {
              console.log('Error formatting date:', err);
              formattedDeadline = 'No deadline specified';
            }
          }
          
          // Normalize source field and rename specific sources
          let normalizedSource = program.source ? program.source.toLowerCase() : 'unknown';
          
          // Rename sources as requested
          if (normalizedSource === 'sciencepathways') {
            normalizedSource = 'Pathways';
          } else if (normalizedSource === 'googlesheets') {
            normalizedSource = 'NU';
          }
          
          // Combine url and link fields
          const programUrl = program.url || program.link || program.website || '';
          
          // Use institution as location if location is not specified
          const location = program.institution || 'Unknown Institution';
          
          return {
            id: program.id,
            ...program,
            deadline: formattedDeadline,
            rawDeadlineDate,
            isPastDeadline,
            source: normalizedSource,
            url: programUrl,
            location: location,
            field: Array.isArray(program.field) ? program.field : (program.field ? [program.field] : [])
          };
        });
        
        // Also fetch user-suggested programs
        let suggestions = [];
        try {
          let { data, error: suggestionsError } = await supabase
            .from('program_suggestions')
            .select('*');
          
          if (suggestionsError) {
            console.error('Error with suggestions query:', suggestionsError);
          } else if (data) {
            suggestions = data;
            console.log(`Fetched ${suggestions.length} program suggestions`);
          }
        } catch (suggestErr) {
          console.error('Exception fetching suggestions:', suggestErr);
        }
        
        const userSuggestions = (suggestions || []).map(suggestion => {
          // Format deadline for suggestions too
          let formattedDeadline = 'No deadline specified';
          let isPastDeadline = false;
          let rawDeadlineDate = null;
          
          if (suggestion.deadline) {
            try {
              let deadlineDate = new Date(suggestion.deadline);
              
              if (!isNaN(deadlineDate.getTime())) {
                rawDeadlineDate = deadlineDate;
                formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                isPastDeadline = deadlineDate < new Date();
              }
            } catch (err) {
              console.log('Error formatting suggestion date:', err);
            }
          }
          
          // Use institution as location
          const location = suggestion.institution || 'Unknown Institution';
          
          return {
            id: suggestion.id,
            source: 'user suggested',
            ...suggestion,
            deadline: formattedDeadline,
            rawDeadlineDate,
            isPastDeadline,
            location: location,
            field: Array.isArray(suggestion.field) ? suggestion.field : (suggestion.field ? [suggestion.field] : [])
          };
        });
        
        // Combine all programs
        const allPrograms = [
          ...supabasePrograms,
          ...userSuggestions
        ];
        
        // Sort programs by deadline (future deadlines first)
        allPrograms.sort((a, b) => {
          // First check if either has isPastDeadline flag
          if (a.isPastDeadline && !b.isPastDeadline) return 1;
          if (!a.isPastDeadline && b.isPastDeadline) return -1;
          
          // If both have raw deadline dates, compare them
          if (a.rawDeadlineDate && b.rawDeadlineDate) {
            return a.rawDeadlineDate - b.rawDeadlineDate;
          }
          
          // If only one has a raw deadline date, prioritize it
          if (a.rawDeadlineDate && !b.rawDeadlineDate) return -1;
          if (!a.rawDeadlineDate && b.rawDeadlineDate) return 1;
          
          // Finally sort by title
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
        });
        
        setPrograms(allPrograms);
        setError(null);
      } catch (err) {
        console.error('Error fetching REU programs:', err);
        setError('Failed to load REU programs');
      } finally {
        setLoading(false);
      }
    };

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
    loading,
    error,
    submitReuSuggestion
  };

  return (
    <ReuContext.Provider value={value}>
      {children}
    </ReuContext.Provider>
  );
}
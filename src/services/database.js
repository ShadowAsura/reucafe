import { supabase } from '../supabase';

// Results collection
export const submitResult = async (resultData, userId) => {
  try {
    const resultWithMetadata = {
      ...resultData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('results')
      .insert([resultWithMetadata])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error submitting result:', error);
    throw error;
  }
};

export const getResults = async (filters = {}) => {
  try {
    let query = supabase
      .from('results')
      .select('*');
    
    // Apply filters
    if (filters.field) {
      query = query.eq('field', filters.field);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.institution) {
      query = query.eq('institution', filters.institution);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortDirection === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting results:', error);
    throw error;
  }
};

export const getUserResults = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user results:', error);
    throw error;
  }
};

export const updateResult = async (resultId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('results')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', resultId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating result:', error);
    throw error;
  }
};

export const deleteResult = async (resultId) => {
  try {
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', resultId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting result:', error);
    throw error;
  }
};
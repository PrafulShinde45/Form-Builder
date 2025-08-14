import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const FormContext = createContext();

const initialState = {
  forms: [],
  currentForm: null,
  loading: false,
  error: null
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FORMS':
      return { ...state, forms: action.payload };
    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };
    case 'ADD_FORM':
      return { ...state, forms: [action.payload, ...state.forms] };
    case 'UPDATE_FORM':
      return {
        ...state,
        forms: state.forms.map(form => 
          form._id === action.payload._id ? action.payload : form
        ),
        currentForm: state.currentForm?._id === action.payload._id ? action.payload : state.currentForm
      };
    case 'DELETE_FORM':
      return {
        ...state,
        forms: state.forms.filter(form => form._id !== action.payload),
        currentForm: state.currentForm?._id === action.payload ? null : state.currentForm
      };
    case 'CLEAR_CURRENT_FORM':
      return { ...state, currentForm: null };
    default:
      return state;
  }
};

export const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Fetch all forms
  const fetchForms = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/api/forms');
      dispatch({ type: 'SET_FORMS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch forms');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Fetch a specific form
  const fetchForm = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/api/forms/${id}`);
      dispatch({ type: 'SET_CURRENT_FORM', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch form');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Create a new form
  const createForm = useCallback(async (formData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/api/forms', formData);
      dispatch({ type: 'ADD_FORM', payload: response.data });
      toast.success('Form created successfully!');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to create form');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update a form
  const updateForm = useCallback(async (id, formData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.put(`/api/forms/${id}`, formData);
      dispatch({ type: 'UPDATE_FORM', payload: response.data });
      toast.success('Form updated successfully!');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update form');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Delete a form
  const deleteForm = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.delete(`/api/forms/${id}`);
      dispatch({ type: 'DELETE_FORM', payload: id });
      toast.success('Form deleted successfully!');
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete form');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Publish/Unpublish a form
  const togglePublish = useCallback(async (id, isPublished) => {
    try {
      const response = await api.patch(`/api/forms/${id}/publish`, { isPublished });
      dispatch({ type: 'UPDATE_FORM', payload: response.data });
      toast.success(isPublished ? 'Form published!' : 'Form unpublished!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update form status');
      return null;
    }
  }, []);

  // Upload header image
  const uploadHeaderImage = useCallback(async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('headerImage', file);
      
      const response = await api.post(`/api/forms/${id}/header-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update the current form with new header image
      if (state.currentForm?._id === id) {
        dispatch({ 
          type: 'UPDATE_FORM', 
          payload: { ...state.currentForm, headerImage: response.data.headerImage }
        });
      }
      
      toast.success('Header image uploaded successfully!');
      return response.data.headerImage;
    } catch (error) {
      toast.error('Failed to upload header image');
      return null;
    }
  }, [state.currentForm]);

  // Upload question image
  const uploadQuestionImage = useCallback(async (id, questionIndex, file) => {
    try {
      const formData = new FormData();
      formData.append('questionImage', file);
      
      const response = await api.post(`/api/forms/${id}/questions/${questionIndex}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update the current form with new question image
      if (state.currentForm?._id === id) {
        const updatedForm = { ...state.currentForm };
        updatedForm.questions[questionIndex].image = response.data.image;
        dispatch({ type: 'UPDATE_FORM', payload: updatedForm });
      }
      
      toast.success('Question image uploaded successfully!');
      return response.data.image;
    } catch (error) {
      toast.error('Failed to upload question image');
      return null;
    }
  }, [state.currentForm]);

  // Clear current form
  const clearCurrentForm = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_FORM' });
  }, []);

  useEffect(() => {
    fetchForms();
  }, []);

  const value = {
    ...state,
    fetchForms,
    fetchForm,
    createForm,
    updateForm,
    deleteForm,
    togglePublish,
    uploadHeaderImage,
    uploadQuestionImage,
    clearCurrentForm
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

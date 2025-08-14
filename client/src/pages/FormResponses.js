import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import { ArrowLeft, Download, Filter, Eye, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentForm, fetchForm } = useForm();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    if (id) {
      fetchForm(id);
      fetchResponses();
    }
  }, [id, fetchForm]);

  useEffect(() => {
    if (currentForm) {
      setForm(currentForm);
      setLoading(false);
    }
  }, [currentForm]);

  useEffect(() => {
    if (filterText.trim() === '') {
      setFilteredResponses(responses);
    } else {
      const filtered = responses.filter(response => 
        response.submittedBy?.toLowerCase().includes(filterText.toLowerCase()) ||
        response.submittedAt?.toLowerCase().includes(filterText.toLowerCase())
      );
      setFilteredResponses(filtered);
    }
  }, [responses, filterText]);

  const fetchResponses = useCallback(async () => {
    try {
      const response = await api.get(`/api/responses/${id}`);
      setResponses(response.data);
      setFilteredResponses(response.data);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('Failed to fetch responses');
    }
  }, [id]);

  const deleteResponse = async (responseId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      await api.delete(`/api/responses/${responseId}`);
      setResponses(responses.filter(r => r._id !== responseId));
      toast.success('Response deleted successfully');
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Failed to delete response');
    }
  };

  const exportResponses = () => {
    if (responses.length === 0) {
      toast.error('No responses to export');
      return;
    }

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form?.title || 'form'}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    if (!form || responses.length === 0) return '';

    const headers = ['Submitted By', 'Submitted At', ...form.questions.map(q => q.text)];
    const rows = responses.map(response => {
      const row = [
        response.submittedBy || 'Anonymous',
        new Date(response.submittedAt).toLocaleString(),
        ...form.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question._id);
          if (!answer) return '';
          
          if (Array.isArray(answer.value)) {
            return answer.value.join(', ');
          }
          return answer.value || '';
        })
      ];
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportResponses}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Form Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mb-4">{form.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {responses.length} responses
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                {form.questions.length} questions
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center space-x-4">
              <Filter size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Filter responses by submitter or date..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Responses List */}
          <div className="space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-500 text-lg">
                  {filterText ? 'No responses match your filter' : 'No responses yet'}
                </p>
                {!filterText && (
                  <p className="text-gray-400 mt-2">Share your form to start collecting responses</p>
                )}
              </div>
            ) : (
              filteredResponses.map((response, index) => (
                <div key={response._id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {response.submittedBy ? response.submittedBy.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {response.submittedBy || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(response.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedResponse(selectedResponse === response._id ? null : response._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteResponse(response._id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Response Details */}
                  {selectedResponse === response._id && (
                    <div className="border-t pt-4 space-y-4">
                      {form.questions.map((question, qIndex) => {
                        const answer = response.answers.find(a => a.questionId === question._id);
                        return (
                          <div key={qIndex} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {qIndex + 1}. {question.text}
                            </h4>
                            <div className="text-gray-700">
                              {answer ? (
                                Array.isArray(answer.value) ? (
                                  <div className="space-y-1">
                                    {answer.value.map((value, vIndex) => (
                                      <span key={vIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2 mb-1">
                                        {value}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p>{answer.value}</p>
                                )
                              ) : (
                                <span className="text-gray-400 italic">No answer provided</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormResponses;

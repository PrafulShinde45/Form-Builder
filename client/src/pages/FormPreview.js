import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import { ArrowLeft, Eye, Share, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const FormPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentForm, fetchForm } = useForm();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchForm(id);
    }
  }, [id, fetchForm]);

  useEffect(() => {
    if (currentForm) {
      setForm(currentForm);
      setLoading(false);
    }
  }, [currentForm]);

  const copyToClipboard = async () => {
    try {
      const previewUrl = `${window.location.origin}/preview/${id}`;
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareForm = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: form.description,
          url: `${window.location.origin}/preview/${id}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
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
                onClick={shareForm}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share size={16} className="mr-2" />
                Share
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {copied ? (
                  <Check size={16} className="mr-2 text-green-600" />
                ) : (
                  <Copy size={16} className="mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Form Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
            {form.headerImage && (
              <div className="mb-6">
                <img
                  src={form.headerImage}
                  alt="Form header"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 text-lg">{form.description}</p>
            )}
          </div>

          {/* Questions Preview */}
          <div className="space-y-6">
            {form.questions.map((question, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {question.text}
                    </h3>
                    {question.description && (
                      <p className="text-gray-600 mb-4">{question.description}</p>
                    )}
                    
                    {/* Question Type Preview */}
                    {question.type === 'text' && (
                      <input
                        type="text"
                        placeholder="Text answer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                    )}
                    
                    {question.type === 'textarea' && (
                      <textarea
                        placeholder="Long text answer"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                    )}
                    
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              className="text-blue-600 focus:ring-blue-500"
                              disabled
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'checkbox' && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="text-blue-600 focus:ring-blue-500"
                              disabled
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'dropdown' && (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                        <option>Select an option</option>
                        {question.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={optionIndex}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {question.type === 'rating' && (
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="text-gray-300 hover:text-yellow-400 text-2xl"
                            disabled
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Notice */}
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Eye size={20} className="text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">This is a preview of your form</p>
              <p className="text-blue-600 text-sm">Responses are not being collected in preview mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;

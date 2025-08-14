import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const FormRenderer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchForm, fetchForms } = useForm();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const formData = await fetchForm(id);
      if (formData) {
        setForm(formData);
        // Initialize answers structure
        const initialAnswers = {};
        formData.questions.forEach((question, index) => {
          switch (question.type) {
            case 'categorize':
              initialAnswers[index] = { items: [] };
              break;
            case 'cloze':
              initialAnswers[index] = { blanks: [] };
              break;
            case 'comprehension':
              initialAnswers[index] = { questions: [] };
              break;
            default:
              break;
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      toast.error('Failed to load form');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, fetchForm, navigate]);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id, loadForm]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await api.post(`/api/responses/${id}`, {
        answers: Object.keys(answers).map(index => {
          const q = form.questions?.[index];
          return {
            questionId: q?._id,
            questionType: q?.type,
            answer: answers[index]
          };
        })
      });

      if (response.status === 201) {
        toast.success('Form submitted successfully!');
        try { await fetchForms(); } catch {}
        navigate('/');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  // HTML5 Drag and Drop handlers for categorize questions
  const handleItemDragStart = (e, questionIndex, itemIndex) => {
    setDraggedItem({ questionIndex, itemIndex });
    e.dataTransfer.setData('text/plain', JSON.stringify({ questionIndex, itemIndex }));
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
  };

  const handleCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCategoryDrop = (e, questionIndex, categoryIndex) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    
    try {
      const { questionIndex: sourceQuestionIndex, itemIndex } = JSON.parse(data);
      
      if (sourceQuestionIndex === questionIndex) {
        const question = form.questions?.[questionIndex] || {};
        const item = (question.items || [])[itemIndex];
        const category = (question.categories || [])[categoryIndex];
        
        if (!item || !category) return;

        // Check if item is already categorized
        const currentAnswers = answers[questionIndex]?.items || [];
        const isAlreadyCategorized = currentAnswers.some(answer => answer.text === item.text);
        
        if (!isAlreadyCategorized) {
          // Add the item to the category
          setAnswers(prev => {
            const newAnswers = [...(prev[questionIndex]?.items || []), { text: item.text, category: category.name }];
            
            return {
              ...prev,
              [questionIndex]: {
                items: newAnswers
              }
            };
          });
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    setDraggedItem(null);
  };

  const handleClozeAnswer = (questionIndex, blankIndex, value) => {
    setAnswers(prev => {
      const currentBlanks = prev[questionIndex]?.blanks || [];
      const newBlanks = [...currentBlanks];
      newBlanks[blankIndex] = { answer: value };
      
      return {
        ...prev,
        [questionIndex]: { blanks: newBlanks }
      };
    });
  };

  const renderTextQuestion = (question, questionIndex) => {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <p className="text-gray-700">{question.text}</p>
      </div>
    );
  };

  const renderMCQQuestion = (question, questionIndex) => {
    const handleMCQAnswer = (option) => {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: { selectedOption: option }
      }));
    };

    return (
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => (
          <div 
            key={optionIndex}
            className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => handleMCQAnswer(option)}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[questionIndex]?.selectedOption === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
              {answers[questionIndex]?.selectedOption === option && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-gray-700">{option}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCategorizeQuestion = (question, questionIndex) => {
    const questionAnswers = answers[questionIndex]?.items || [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items to categorize */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Items to Categorize:</h4>
            <div
              id={`items-${questionIndex}`}
              className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              {question.items.map((item, itemIndex) => {
                // Check if this item has already been categorized
                const isAlreadyCategorized = questionAnswers.some(answer => answer.text === item.text);
                
                // Only show items that haven't been categorized yet
                if (!isAlreadyCategorized) {
                  return (
                    <div
                      key={`item-${questionIndex}-${itemIndex}`}
                      draggable
                      onDragStart={(e) => handleItemDragStart(e, questionIndex, itemIndex)}
                      onDragEnd={handleItemDragEnd}
                      className={`p-3 mb-2 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
                        draggedItem && draggedItem.questionIndex === questionIndex && draggedItem.itemIndex === itemIndex
                          ? 'opacity-50 scale-95 shadow-lg'
                          : ''
                      }`}
                    >
                      {item.text}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Categories:</h4>
            {question.categories.map((category, catIndex) => (
              <div
                key={catIndex}
                id={`category-${questionIndex}-${catIndex}`}
                className={`min-h-[100px] border-2 border-dashed rounded-lg p-3 transition-colors ${
                  draggedItem && draggedItem.questionIndex === questionIndex ? 'border-blue-400 bg-blue-50' : ''
                }`}
                style={{ borderColor: draggedItem && draggedItem.questionIndex === questionIndex ? '#3B82F6' : category.color }}
                onDragOver={handleCategoryDragOver}
                onDrop={(e) => handleCategoryDrop(e, questionIndex, catIndex)}
              >
                <div 
                  className="font-medium mb-2 text-center"
                  style={{ color: category.color }}
                >
                  {category.name}
                </div>
                {questionAnswers
                  .filter(answer => answer.category === category.name)
                  .map((answer, answerIndex) => (
                    <div
                      key={answerIndex}
                      className="p-2 mb-1 bg-white rounded border text-sm"
                    >
                      {answer.text}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Reset button to allow re-categorization */}
        {questionAnswers.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setAnswers(prev => ({
                  ...prev,
                  [questionIndex]: { items: [] }
                }));
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              Reset Categories
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderClozeQuestion = (question, questionIndex) => {
    const questionAnswers = answers[questionIndex]?.blanks || [];
    
    // Function to render text with blanks as drop zones
    const renderTextWithBlanks = () => {
      let parts = question.text.split('_____');
      let result = [];
      
      parts.forEach((part, index) => {
        // Add the text part
        result.push(<span key={`text-${index}`}>{part}</span>);
        
        // Add the blank drop zone if not the last part
        if (index < parts.length - 1) {
          const blankIndex = index;
          const blank = question.blanks[blankIndex];
          const currentAnswer = questionAnswers[blankIndex]?.answer || '';
          
          result.push(
            <div key={`blank-container-${index}`} className="relative inline-block">
              <div
                className={`mx-1 px-3 py-2 w-32 inline-block border-2 border-dashed rounded text-center transition-colors ${
                  currentAnswer 
                    ? 'border-green-300 bg-green-50 text-green-800' 
                    : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedOption = e.dataTransfer.getData('text/plain');
                  if (droppedOption) {
                    handleClozeAnswer(questionIndex, blankIndex, droppedOption);
                  }
                }}
              >
                {currentAnswer || '_____'}
              </div>
            </div>
          );
        }
      });
      
      return result;
    };

    // Drag and drop handlers for answer options
    const handleOptionDragStart = (e, option) => {
      e.dataTransfer.setData('text/plain', option);
      e.dataTransfer.effectAllowed = 'copy';
    };

    const handleOptionDragEnd = () => {
      // Clean up if needed
    };

    return (
      <div className="space-y-6">
        {/* Question text with blanks */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-lg leading-relaxed">
            {renderTextWithBlanks()}
          </div>
        </div>

        {/* Answer options for drag and drop */}
        {(() => {
          const baseOptions = (question.answerOptions && question.answerOptions.length > 0)
            ? question.answerOptions
            : (question.blanks ? question.blanks.map(b => b?.text || b?.answer).filter(Boolean) : []);
          const availableOptions = Array.from(new Set(baseOptions));
          if (availableOptions.length === 0) return null;
          return (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Answer Options:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableOptions.map((option, optionIndex) => {
                  // Check if this option is already used in any blank
                  const isUsed = questionAnswers.some(answer => answer.answer === option);
                  
                  return (
                    <div
                      key={optionIndex}
                      draggable={!isUsed}
                      onDragStart={(e) => handleOptionDragStart(e, option)}
                      onDragEnd={handleOptionDragEnd}
                      className={`p-3 border rounded-lg text-center transition-all cursor-move ${
                        isUsed
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {option}
                      {isUsed && (
                        <div className="text-xs text-gray-500 mt-1">Used</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Drag answer options into the blank spaces above.
              </p>
            </div>
          );
        })()}

        {/* Reset button to allow re-answering */}
        {questionAnswers.length > 0 && questionAnswers.some(answer => answer.answer) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setAnswers(prev => ({
                  ...prev,
                  [questionIndex]: { blanks: [] }
                }));
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              Reset Answers
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderComprehensionQuestion = (question, questionIndex) => {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-gray-700 whitespace-pre-line">{question.passage}</p>
        </div>
        
        <div className="space-y-4">
          {question.questions.map((subQuestion, subIndex) => (
            <div key={subIndex} className="p-4 bg-white border rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">{subQuestion.question}</h4>
              <div className="space-y-2">
                {subQuestion.options.map((option, optIndex) => (
                  <div 
                    key={optIndex}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      const newAnswers = { ...answers };
                      if (!newAnswers[questionIndex]) {
                        newAnswers[questionIndex] = { questions: [] };
                      }
                      if (!newAnswers[questionIndex].questions) {
                        newAnswers[questionIndex].questions = [];
                      }
                      
                      const existingAnswerIndex = newAnswers[questionIndex].questions.findIndex(
                        a => a.questionIndex === subIndex
                      );
                      
                      if (existingAnswerIndex >= 0) {
                        newAnswers[questionIndex].questions[existingAnswerIndex].answer = option;
                      } else {
                        newAnswers[questionIndex].questions.push({
                          questionIndex: subIndex,
                          answer: option
                        });
                      }
                      
                      setAnswers(newAnswers);
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      answers[questionIndex]?.questions?.find(q => q.questionIndex === subIndex)?.answer === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[questionIndex]?.questions?.find(q => q.questionIndex === subIndex)?.answer === option && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render different question types
  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'text':
        return renderTextQuestion(question, index);
      case 'mcq':
        return renderMCQQuestion(question, index);
      case 'categorize':
        return renderCategorizeQuestion(question, index);
      case 'cloze':
        return renderClozeQuestion(question, index);
      case 'comprehension':
        return renderComprehensionQuestion(question, index);
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Form not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
              {form.description && (
                <p className="text-sm text-gray-600 mt-1">{form.description}</p>
              )}
            </div>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {form.questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-3 mb-6">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {question.text}
                  </h3>
                  {question.required && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Question Type Specific Renderer */}
              {renderQuestion(question, index)}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;
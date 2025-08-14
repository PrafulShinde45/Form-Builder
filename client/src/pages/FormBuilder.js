import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import { Plus, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionEditor from '../components/QuestionEditor';
import HeaderImageUpload from '../components/HeaderImageUpload';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentForm, 
    fetchForm, 
    createForm, 
    updateForm, 
    clearCurrentForm 
  } = useForm();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    headerImage: null,
    questions: [],
    isPublished: false,
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF'
    },
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id) {
      fetchForm(id);
    }
    return () => {
      if (!id) {
        clearCurrentForm();
      }
    };
  }, [id, fetchForm, clearCurrentForm]);

  useEffect(() => {
    if (currentForm && id) {
      setForm(currentForm);
    }
  }, [currentForm, id]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    setSaving(true);
    try {
      let savedForm;
      if (id) {
        savedForm = await updateForm(id, form);
      } else {
        savedForm = await createForm(form);
        if (savedForm) {
          navigate(`/builder/${savedForm._id}`);
        }
      }
      
      if (savedForm) {
        toast.success(id ? 'Form updated successfully!' : 'Form created successfully!');
      }
    } catch (error) {
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  // HTML5 Drag and Drop handlers for reordering questions
  const handleQuestionDragStart = (e, questionIndex) => {
    setDraggedQuestion({ questionIndex, question: form.questions[questionIndex] });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', questionIndex.toString());
  };

  const handleQuestionDragEnd = () => {
    setDraggedQuestion(null);
    setIsDragging(false);
  };

  const handleQuestionDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleQuestionDropZone = (e, dropIndex) => {
    e.preventDefault();
    if (draggedQuestion && draggedQuestion.questionIndex !== dropIndex) {
      const questions = Array.from(form.questions);
      const [movedQuestion] = questions.splice(draggedQuestion.questionIndex, 1);
      questions.splice(dropIndex, 0, movedQuestion);
      
      // Update order numbers
      questions.forEach((question, index) => {
        question.order = index;
      });
      
      setForm({ ...form, questions });
    }
    setDraggedQuestion(null);
    setIsDragging(false);
  };

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      required: false,
      order: form.questions.length,
      image: null
    };

    // Add type-specific fields
    switch (type) {
      case 'categorize':
        newQuestion.categories = [
          { id: Date.now().toString() + 'cat1', name: 'Category 1', color: '#3B82F6' },
          { id: Date.now().toString() + 'cat2', name: 'Category 2', color: '#10B981' }
        ];
        newQuestion.items = [
          { id: Date.now().toString() + 'item1', text: 'Item 1', category: 'Category 1' },
          { id: Date.now().toString() + 'item2', text: 'Item 2', category: 'Category 2' }
        ];
        break;
      
      case 'cloze':
        newQuestion.text = 'This is a _____ text with _____ to fill in.';
        newQuestion.blanks = [
          { text: 'sample', answer: '', options: [] },
          { text: 'gaps', answer: '', options: [] }
        ];
        newQuestion.answerOptions = ['sample', 'gaps', 'example', 'spaces'];
        break;
      
      case 'comprehension':
        newQuestion.passage = 'Read the following passage and answer the questions below.';
        newQuestion.questions = [
          {
            question: 'What is the main idea of this passage?',
            type: 'multiple-choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            points: 1
          }
        ];
        break;
    }

    setForm({
      ...form,
      questions: [...form.questions, newQuestion]
    });
  };

  const updateQuestion = (index, updatedQuestion) => {
    const questions = [...form.questions];
    questions[index] = updatedQuestion;
    setForm({ ...form, questions });
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const questions = form.questions.filter((_, i) => i !== index);
      // Reorder remaining questions
      questions.forEach((question, i) => {
        question.order = i;
      });
      setForm({ ...form, questions });
    }
  };

  const duplicateQuestion = (index) => {
    const question = { ...form.questions[index] };
    question.title = `${question.title} (Copy)`;
    question.order = form.questions.length;
    
    setForm({
      ...form,
      questions: [...form.questions, question]
    });
  };

  const updateFormField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleHeaderImageUpload = (imageUrl) => {
    setForm({ ...form, headerImage: imageUrl });
  };

  const handleHeaderImageRemove = () => {
    setForm({ ...form, headerImage: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {id ? 'Edit Form' : 'Create New Form'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditing 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? 'Preview Mode' : 'Edit Mode'}
              </button>
              
              {id && (
                <button
                  onClick={() => navigate(`/preview/${id}`)}
                  className="btn-secondary text-sm"
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-sm"
              >
                {saving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Form Settings */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Form Basic Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => updateFormField('title', e.target.value)}
                      className="input-field"
                      placeholder="Enter form title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateFormField('description', e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Enter form description"
                    />
                  </div>
                </div>
              </div>

              {/* Header Image */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Header Image</h3>
                <HeaderImageUpload
                  currentImage={form.headerImage}
                  onImageUpload={handleHeaderImageUpload}
                  onImageRemove={handleHeaderImageRemove}
                />
              </div>

              {/* Question Types */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => addQuestion('categorize')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Categorize</div>
                    <div className="text-sm text-gray-600">Group items into categories</div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('cloze')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Cloze</div>
                    <div className="text-sm text-gray-600">Fill in the blanks</div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('comprehension')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Comprehension</div>
                    <div className="text-sm text-gray-600">Reading with questions</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Questions */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Form Preview Header */}
              {form.headerImage && (
                <div className="card p-0 overflow-hidden">
                  <img
                    src={form.headerImage}
                    alt="Form header"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Form Title & Description */}
              <div className="card text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {form.title || 'Untitled Form'}
                </h2>
                {form.description && (
                  <p className="text-lg text-gray-600">{form.description}</p>
                )}
              </div>

              {/* Questions */}
              {form.questions.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-6">Add questions from the sidebar to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Drop zone at the top */}
                  <div
                    className={`h-2 transition-colors rounded ${
                      isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                    }`}
                    onDragOver={handleQuestionDragOver}
                    onDrop={(e) => handleQuestionDropZone(e, 0)}
                  />
                  
                  {form.questions.map((question, index) => (
                    <div key={index}>
                      {/* Drop zone above the question */}
                      <div
                        className={`h-2 -mb-1 transition-colors ${
                          isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                        }`}
                        onDragOver={handleQuestionDragOver}
                        onDrop={(e) => handleQuestionDropZone(e, index)}
                      />
                      
                      {/* Question */}
                      <div
                        draggable
                        onDragStart={(e) => handleQuestionDragStart(e, index)}
                        onDragEnd={handleQuestionDragEnd}
                        onDragOver={handleQuestionDragOver}
                        onDrop={(e) => handleQuestionDropZone(e, index)}
                        className={`card transition-all ${
                          draggedQuestion && draggedQuestion.questionIndex === index ? 'shadow-lg rotate-2 opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className="cursor-move p-2 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                              Question {index + 1}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => duplicateQuestion(index)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Duplicate question"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => deleteQuestion(index)}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              title="Delete question"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <QuestionEditor
                          question={question}
                          index={index}
                          onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                          formId={id}
                        />
                      </div>
                      
                      {/* Drop zone below the question (for last question) */}
                      {index === form.questions.length - 1 && (
                        <div
                          className={`h-2 -mt-1 transition-colors ${
                            isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                          }`}
                          onDragOver={handleQuestionDragOver}
                          onDrop={(e) => handleQuestionDropZone(e, index + 1)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

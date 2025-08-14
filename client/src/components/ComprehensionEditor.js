import React, { useState, useEffect } from 'react';
import { Plus, X, Edit3, GripVertical, FileText, HelpCircle } from 'lucide-react';

const ComprehensionEditor = ({ question, onQuestionChange }) => {
  const [passage, setPassage] = useState(question?.passage || '');
  const [subQuestions, setSubQuestions] = useState(question?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '○' },
    { value: 'true-false', label: 'True/False', icon: '⊤⊥' },
    { value: 'short-answer', label: 'Short Answer', icon: '✎' }
  ];

  useEffect(() => {
    if (question?.passage) {
      setPassage(question.passage);
    }
    if (question?.questions) {
      setSubQuestions(question.questions);
    }
  }, [question]);

  const handlePassageChange = (e) => {
    setPassage(e.target.value);
    updateQuestion();
  };

  const addQuestion = () => {
    if (!newQuestion.question.trim()) return;
    
    const question = {
      ...newQuestion,
      id: Date.now().toString(),
      options: newQuestion.type === 'short-answer' ? [] : newQuestion.options.filter(opt => opt.trim())
    };
    
    const newSubQuestions = [...subQuestions, question];
    setSubQuestions(newSubQuestions);
    setNewQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
    setShowAddQuestion(false);
    updateQuestion(passage, newSubQuestions);
  };

  const updateQuestionField = (index, field, value) => {
    const newSubQuestions = [...subQuestions];
    newSubQuestions[index] = { ...newSubQuestions[index], [field]: value };
    setSubQuestions(newSubQuestions);
    updateQuestion(passage, newSubQuestions);
  };

  const removeQuestion = (index) => {
    const newSubQuestions = subQuestions.filter((_, i) => i !== index);
    setSubQuestions(newSubQuestions);
    updateQuestion(passage, newSubQuestions);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const newSubQuestions = [...subQuestions];
    newSubQuestions[questionIndex].options[optionIndex] = value;
    setSubQuestions(newSubQuestions);
    updateQuestion(passage, newSubQuestions);
  };

  const addOption = (questionIndex) => {
    const newSubQuestions = [...subQuestions];
    newSubQuestions[questionIndex].options.push('');
    setSubQuestions(newSubQuestions);
    updateQuestion(passage, newSubQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newSubQuestions = [...subQuestions];
    newSubQuestions[questionIndex].options.splice(optionIndex, 1);
    setSubQuestions(newSubQuestions);
    updateQuestion(passage, newSubQuestions);
  };

  const updateQuestion = (newPassage = passage, newSubQuestions = subQuestions) => {
    onQuestionChange({
      ...question,
      passage: newPassage,
      questions: newSubQuestions
    });
  };

  const renderQuestionEditor = (subQuestion, index) => {
    return (
      <div key={subQuestion.id} className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {questionTypes.find(t => t.value === subQuestion.type)?.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setEditingQuestion(index)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit question"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => removeQuestion(index)}
              className="p-1 text-red-400 hover:text-red-600"
              title="Remove question"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {editingQuestion === index ? (
          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={subQuestion.question}
                onChange={(e) => updateQuestionField(index, 'question', e.target.value)}
                placeholder="Enter your question here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {questionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateQuestionField(index, 'type', type.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      subQuestion.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options for Multiple Choice */}
            {subQuestion.type === 'multiple-choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {subQuestion.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeOption(index, optionIndex)}
                        disabled={subQuestion.options.length <= 2}
                        className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove option"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(index)}
                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Option
                  </button>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            {subQuestion.type !== 'short-answer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                {subQuestion.type === 'multiple-choice' ? (
                  <select
                    value={subQuestion.correctAnswer}
                    onChange={(e) => updateQuestionField(index, 'correctAnswer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select correct answer</option>
                    {subQuestion.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option || `Option ${optionIndex + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    {['true', 'false'].map((option) => (
                      <label key={option} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          value={option}
                          checked={subQuestion.correctAnswer === option}
                          onChange={(e) => updateQuestionField(index, 'correctAnswer', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700">{subQuestion.question}</p>
            
            {subQuestion.type === 'multiple-choice' && (
              <div className="space-y-2">
                {subQuestion.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      option === subQuestion.correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {option === subQuestion.correctAnswer && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      option === subQuestion.correctAnswer
                        ? 'text-green-700 font-medium'
                        : 'text-gray-600'
                    }`}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {subQuestion.type === 'true-false' && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Correct Answer: <span className="font-medium text-green-700 capitalize">{subQuestion.correctAnswer}</span>
                </span>
              </div>
            )}
            
            {subQuestion.type === 'short-answer' && (
              <div className="text-sm text-gray-600">
                Short answer question - no options needed
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reading Passage */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FileText size={20} className="text-blue-600" />
          <label className="block text-sm font-medium text-gray-700">
            Reading Passage
          </label>
        </div>
        
        <textarea
          value={passage}
          onChange={handlePassageChange}
          placeholder="Enter the reading passage or text that students will read before answering questions..."
          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        
        <p className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> Write a clear, engaging passage that students will read before answering the questions below.
        </p>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Comprehension Questions</h4>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-1" />
            Add Question
          </button>
        </div>

        {/* Add Question Form */}
        {showAddQuestion && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Enter your question here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewQuestion({ ...newQuestion, type: type.value })}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        newQuestion.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {newQuestion.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ))}
                  </div>
                </div>
              )}

              {newQuestion.type !== 'short-answer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  {newQuestion.type === 'multiple-choice' ? (
                    <select
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select correct answer</option>
                      {newQuestion.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option || `Option ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      {['true', 'false'].map((option) => (
                        <label key={option} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="correct-answer"
                            value={option}
                            checked={newQuestion.correctAnswer === option}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addQuestion}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Question
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {subQuestions.map((subQuestion, index) => renderQuestionEditor(subQuestion, index))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to create comprehension questions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Write a reading passage in the text area above</li>
          <li>Add questions using the "Add Question" button</li>
          <li>Choose from multiple choice, true/false, or short answer questions</li>
          <li>For multiple choice, add options and select the correct answer</li>
          <li>For true/false, select the correct answer</li>
          <li>Short answer questions don't need options</li>
        </ol>
      </div>
    </div>
  );
};

export default ComprehensionEditor;

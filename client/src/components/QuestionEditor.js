import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useForm } from '../context/FormContext';
import toast from 'react-hot-toast';
import CategorizeEditor from './CategorizeEditor';
import ClozeEditor from './ClozeEditor';
import ComprehensionEditor from './ComprehensionEditor';

const QuestionEditor = ({ question, index, onUpdate, formId }) => {
  const { uploadQuestionImage } = useForm();
  const [showImageUpload, setShowImageUpload] = useState(false);

  const updateField = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleImageUpload = async (file) => {
    if (!formId) {
      toast.error('Please save the form first before adding images');
      return;
    }

    const imageUrl = await uploadQuestionImage(formId, index, file);
    if (imageUrl) {
      updateField('image', imageUrl);
      setShowImageUpload(false);
    }
  };

  const handleQuestionChange = (updatedQuestion) => {
    onUpdate(updatedQuestion);
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input-field text-lg font-medium"
            placeholder="Question title"
          />
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateField('required', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {/* Question Image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Question Image
          </label>
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showImageUpload ? 'Cancel' : 'Add Image'}
          </button>
        </div>
        
        {question.image && (
          <div className="relative inline-block">
            <img
              src={question.image}
              alt="Question"
              className="max-w-xs h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => updateField('image', null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {showImageUpload && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="hidden"
              id={`question-image-${index}`}
            />
            <label
              htmlFor={`question-image-${index}`}
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <ImageIcon size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload an image
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Question Type Specific Editor */}
      <div className="border-t border-gray-200 pt-4">
        {question.type === 'categorize' && (
          <CategorizeEditor 
            question={question} 
            onQuestionChange={handleQuestionChange} 
          />
        )}
        {question.type === 'cloze' && (
          <ClozeEditor 
            question={question} 
            onQuestionChange={handleQuestionChange} 
          />
        )}
        {question.type === 'comprehension' && (
          <ComprehensionEditor 
            question={question} 
            onQuestionChange={handleQuestionChange} 
          />
        )}
      </div>
    </div>
  );
};

export default QuestionEditor;

import React, { useState, useRef, useEffect } from 'react';
import { Underline, X, Plus, Edit3, GripVertical } from 'lucide-react';

const ClozeEditor = ({ question, onQuestionChange }) => {
  const [text, setText] = useState(question?.text || '');
  const [blanks, setBlanks] = useState(question?.blanks || []);
  const [selectedText, setSelectedText] = useState('');
  const [showHintInput, setShowHintInput] = useState(false);
  const [editingBlankIndex, setEditingBlankIndex] = useState(null);
  const [draggedBlank, setDraggedBlank] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [answerOptions, setAnswerOptions] = useState(question?.answerOptions || []);
  const [newAnswerOption, setNewAnswerOption] = useState('');
  const textRef = useRef(null);

  useEffect(() => {
    if (question?.text) {
      setText(question.text);
    }
    if (question?.blanks) {
      setBlanks(question.blanks);
    }
  }, [question]);

  // If there are blanks but no answer options yet, generate options from blanks
  useEffect(() => {
    if (blanks.length > 0 && answerOptions.length === 0) {
      const generated = Array.from(new Set(blanks.map(b => b.text).filter(Boolean)));
      if (generated.length > 0) {
        setAnswerOptions(generated);
        updateQuestion(text, blanks, generated);
      }
    }
  }, [blanks]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    updateQuestion();
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const createBlank = () => {
    if (!selectedText.trim()) return;

    const newBlank = {
      text: selectedText,
      answer: selectedText,
      options: []
    };

    const newBlanks = [...blanks, newBlank];
    setBlanks(newBlanks);
    
    // Replace selected text with blank placeholder
    const newText = text.replace(selectedText, '_____');
    setText(newText);
    
    // Ensure the selected text becomes a draggable option automatically
    const newOptions = answerOptions.includes(selectedText)
      ? answerOptions
      : [...answerOptions, selectedText];
    setAnswerOptions(newOptions);
    
    setSelectedText('');
    updateQuestion(newText, newBlanks, newOptions);
  };

  const removeBlank = (index) => {
    const blank = blanks[index];
    const newBlanks = blanks.filter((_, i) => i !== index);
    
    // Restore the original text
    const newText = text.replace('_____', blank.text);
    setText(newText);
    
    setBlanks(newBlanks);
    updateQuestion(newText, newBlanks);
  };

  const addAnswerOption = () => {
    if (!newAnswerOption.trim()) return;
    
    const newOptions = [...answerOptions, newAnswerOption.trim()];
    setAnswerOptions(newOptions);
    setNewAnswerOption('');
    updateQuestion(text, blanks, newOptions);
  };

  const removeAnswerOption = (optionIndex) => {
    const newOptions = answerOptions.filter((_, i) => i !== optionIndex);
    setAnswerOptions(newOptions);
    updateQuestion(text, blanks, newOptions);
  };

  const updateQuestion = (newText = text, newBlanks = blanks, newAnswerOptions = answerOptions) => {
    onQuestionChange({
      ...question,
      text: newText,
      blanks: newBlanks,
      answerOptions: newAnswerOptions
    });
  };

  // HTML5 Drag and Drop handlers for reordering blanks
  const handleBlankDragStart = (e, blankIndex) => {
    setDraggedBlank({ blankIndex, blank: blanks[blankIndex] });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blankIndex.toString());
  };

  const handleBlankDragEnd = () => {
    setDraggedBlank(null);
    setIsDragging(false);
  };

  const handleBlankDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBlankDropZone = (e, dropIndex) => {
    e.preventDefault();
    if (draggedBlank && draggedBlank.blankIndex !== dropIndex) {
      const newBlanks = Array.from(blanks);
      const [movedBlank] = newBlanks.splice(draggedBlank.blankIndex, 1);
      newBlanks.splice(dropIndex, 0, movedBlank);
      
      // Update the text to reflect the new blank order
      // Since we're using "_____" as placeholders, we need to rebuild the text
      // with the blanks in their new order
      let newText = text;
      
      // Replace all existing blank placeholders with a temporary marker
      newText = newText.replace(/_____/g, '___TEMP___');
      
      // Now insert the blanks in their new order
      newBlanks.forEach((blank, index) => {
        newText = newText.replace('___TEMP___', '_____');
      });
      
      setBlanks(newBlanks);
      updateQuestion(newText, newBlanks);
    }
    setDraggedBlank(null);
    setIsDragging(false);
  };

  const renderTextWithBlanks = () => {
    let parts = text.split('_____');
    let blankIndex = 0;
    
    return parts.map((part, partIndex) => (
      <React.Fragment key={partIndex}>
        <span>{part}</span>
        {partIndex < parts.length - 1 && (
          <span className="inline-block mx-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 font-medium min-w-[80px] text-center">
            Blank {blankIndex + 1}
            <button
              onClick={() => removeBlank(blankIndex)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              <X size={14} />
            </button>
          </span>
        )}
        {partIndex < parts.length - 1 && blankIndex++}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Text Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Question Text
          </label>
          <div className="flex items-center space-x-2">
            {selectedText && (
              <button
                onClick={createBlank}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Underline size={16} className="mr-1" />
                Create Blank
              </button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <textarea
            ref={textRef}
            value={text}
            onChange={handleTextChange}
            onSelect={handleTextSelect}
            placeholder="Type your question text here. Select text and click 'Create Blank' to make fill-in-the-blank questions."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          {selectedText && (
            <div className="absolute top-2 right-2 bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm text-blue-800">
              Selected: "{selectedText}"
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> Select any text in the question and click "Create Blank" to convert it into a fill-in-the-blank question.
        </p>
      </div>

      {/* Preview */}
      {text && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Preview:</h4>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="prose max-w-none">
              {renderTextWithBlanks()}
            </div>
          </div>
        </div>
      )}

      {/* Blanks Management */}
      {blanks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Blanks ({blanks.length}):</h4>
          <div className="space-y-3">
            {/* Drop zone at the top */}
            <div
              className={`h-2 transition-colors rounded ${
                isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
              }`}
              onDragOver={handleBlankDragOver}
              onDrop={(e) => handleBlankDropZone(e, 0)}
            />
            
            {blanks.map((blank, index) => (
              <div key={index}>
                {/* Drop zone above the blank */}
                <div
                  className={`h-2 -mb-1 transition-colors ${
                    isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                  }`}
                  onDragOver={handleBlankDragOver}
                  onDrop={(e) => handleBlankDropZone(e, index)}
                />
                
                {/* Blank item */}
                <div
                  draggable
                  onDragStart={(e) => handleBlankDragStart(e, index)}
                  onDragEnd={handleBlankDragEnd}
                  onDragOver={handleBlankDragOver}
                  className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border transition-all ${
                    draggedBlank && draggedBlank.blankIndex === index ? 'opacity-50 scale-95 shadow-lg' : ''
                  }`}
                >
                  <div className="text-gray-400 hover:text-gray-600 cursor-move">
                    <GripVertical size={16} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Blank {index + 1}: "{blank.text}"
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-gray-600">
                        Answer: {blank.answer || 'Not answered'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeBlank(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove blank"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Drop zone below the blank (for last blank) */}
                {index === blanks.length - 1 && (
                  <div
                    className={`h-2 -mt-1 transition-colors ${
                      isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                    }`}
                    onDragOver={handleBlankDragOver}
                    onDrop={(e) => handleBlankDropZone(e, index + 1)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Options Management */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Answer Options for Drag & Drop:</h4>
        <div className="space-y-3">
          {/* Add new answer option */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newAnswerOption}
              onChange={(e) => setNewAnswerOption(e.target.value)}
              placeholder="Add a new answer option"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addAnswerOption()}
            />
            <button
              onClick={addAnswerOption}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Answer options list */}
          {answerOptions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                Students will drag these options into the blanks:
              </div>
              {answerOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="text-sm font-medium text-green-800">{option}</span>
                  <button
                    onClick={() => removeAnswerOption(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove option"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {answerOptions.length === 0 && (
            <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p>No answer options yet. Add options above for students to drag into blanks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to create drag & drop fill-in-the-blank questions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Type your question text in the text area above</li>
          <li>Select (highlight) the word or phrase you want to make into a blank</li>
          <li>Click the "Create Blank" button that appears</li>
          <li>The selected text will be replaced with "_____" and added to the blanks list</li>
          <li>Add answer options below that students can drag into the blanks</li>
          <li><strong>Drag and drop blanks to reorder them</strong> - use the grip handle on the left</li>
          <li>Students will drag answer options into the blank spaces when taking the quiz</li>
        </ol>
      </div>
    </div>
  );
};

export default ClozeEditor;
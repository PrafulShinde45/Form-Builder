import React, { useState, useEffect } from 'react';
import { Plus, X, Edit3, GripVertical } from 'lucide-react';

const CategorizeEditor = ({ question, onQuestionChange }) => {
  const [categories, setCategories] = useState(question?.categories || []);
  const [items, setItems] = useState(question?.items || []);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [newItem, setNewItem] = useState({ text: '' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const defaultColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    if (question?.categories) {
      // Ensure all categories have IDs
      const categoriesWithIds = question.categories.map(category => 
        category.id ? category : { ...category, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      );
      setCategories(categoriesWithIds);
    }
    if (question?.items) {
      // Ensure all items have IDs
      const itemsWithIds = question.items.map(item => 
        item.id ? item : { ...item, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      );
      setItems(itemsWithIds);
    }
  }, [question]);

  // Category drag and drop handlers
  const handleCategoryDragStart = (e, category) => {
    setDraggedCategory(category);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', category.id);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategory(null);
    setIsDragging(false);
  };

  const handleCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCategoryDrop = (e, targetCategory) => {
    e.preventDefault();
    if (draggedCategory && draggedCategory.id !== targetCategory.id) {
      const newCategories = [...categories];
      const draggedIndex = newCategories.findIndex(cat => cat.id === draggedCategory.id);
      const targetIndex = newCategories.findIndex(cat => cat.id === targetCategory.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [movedCategory] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, movedCategory);
        setCategories(newCategories);
        updateQuestion(newCategories, items);
      }
    }
    setDraggedCategory(null);
  };

  // Item drag and drop handlers
  const handleItemDragStart = (e, item) => {
    setDraggedItem(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  const handleItemDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e, targetItem) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
      const targetIndex = newItems.findIndex(item => item.id === targetItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [movedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);
        setItems(newItems);
        updateQuestion(categories, newItems);
      }
    }
    setDraggedItem(null);
  };

  // Drop zone handlers for reordering
  const handleCategoryDropZone = (e, dropIndex) => {
    e.preventDefault();
    if (draggedCategory) {
      const newCategories = [...categories];
      const draggedIndex = newCategories.findIndex(cat => cat.id === draggedCategory.id);
      
      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        const [movedCategory] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(dropIndex, 0, movedCategory);
        setCategories(newCategories);
        updateQuestion(newCategories, items);
      }
    }
    setDraggedCategory(null);
    setIsDragging(false);
  };

  const handleItemDropZone = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem) {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
      
      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        const [movedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, movedItem);
        setItems(newItems);
        updateQuestion(categories, newItems);
      }
    }
    setDraggedItem(null);
    setIsDragging(false);
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category = {
      ...newCategory,
      id: Date.now().toString()
    };
    
    const newCategories = [...categories, category];
    setCategories(newCategories);
    setNewCategory({ name: '', color: '#3B82F6' });
    setShowAddCategory(false);
    updateQuestion(newCategories, items);
  };

  const updateCategory = (id, field, value) => {
    const newCategories = categories.map(category => 
      category.id === id ? { ...category, [field]: value } : category
    );
    setCategories(newCategories);
    updateQuestion(newCategories, items);
  };

  const removeCategory = (id) => {
    const newCategories = categories.filter(category => category.id !== id);
    setCategories(newCategories);
    updateQuestion(newCategories, items);
  };

  const addItem = () => {
    if (!newItem.text.trim()) return;
    
    const item = {
      ...newItem,
      id: Date.now().toString()
    };
    
    const newItems = [...items, item];
    setItems(newItems);
    setNewItem({ text: '' });
    setShowAddItem(false);
    updateQuestion(categories, newItems);
  };

  const updateItem = (id, field, value) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    updateQuestion(categories, newItems);
  };

  const removeItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateQuestion(categories, newItems);
  };

  const updateQuestion = (newCategories = categories, newItems = items) => {
    onQuestionChange({
      ...question,
      categories: newCategories,
      items: newItems
    });
  };

  // Early return if no question data
  if (!question) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No question data available</p>
      </div>
    );
  }

  // Validate question structure
  if (!question.categories || !Array.isArray(question.categories)) {
    console.warn('CategorizeEditor: question.categories is not an array:', question.categories);
  }
  if (!question.items || !Array.isArray(question.items)) {
    console.warn('CategorizeEditor: question.items is not an array:', question.items);
  }

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Categories</h4>
          <button
            onClick={() => setShowAddCategory(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-1" />
            Add Category
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Animals, Colors, Countries"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex space-x-1">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        {categories.filter(category => category && category.id).length > 0 ? (
          <div className="space-y-3">
            {/* Drop zone at the top */}
            <div
              className="h-2 hover:bg-blue-200 transition-colors rounded"
              onDragOver={handleCategoryDragOver}
              onDrop={(e) => handleCategoryDropZone(e, 0)}
            />
            
            {categories.filter(category => category && category.id).map((category, index) => (
              <div key={category.id}>
                {/* Drop zone above the category */}
                <div
                  className={`h-2 -mb-1 transition-colors ${
                    isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                  }`}
                  onDragOver={handleCategoryDragOver}
                  onDrop={(e) => handleCategoryDropZone(e, index)}
                />
                
                {/* Category item */}
                <div
                  draggable
                  onDragStart={(e) => handleCategoryDragStart(e, category)}
                  onDragEnd={handleCategoryDragEnd}
                  onDragOver={handleCategoryDragOver}
                  className={`flex items-center space-x-3 p-3 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
                    draggedCategory?.id === category.id ? 'opacity-50 scale-95' : ''
                  } hover:shadow-md`}
                >
                  <div className="text-gray-400 hover:text-gray-600">
                    <GripVertical size={16} />
                  </div>
                  
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  
                  <div className="flex-1">
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        onBlur={() => setEditingCategory(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(null)}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit category name"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove category"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Drop zone below the category (for last item) */}
                {index === categories.filter(category => category && category.id).length - 1 && (
                  <div
                    className={`h-2 -mt-1 transition-colors ${
                      isDragging ? 'bg-blue-300' : 'hover:bg-blue-200'
                    }`}
                    onDragOver={handleCategoryDragOver}
                    onDrop={(e) => handleCategoryDropZone(e, index + 1)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p>No categories yet. Click "Add Category" to get started!</p>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Items to Categorize</h4>
          <button
            onClick={() => setShowAddItem(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus size={16} className="mr-1" />
            Add Item
          </button>
        </div>

        {/* Add Item Form */}
        {showAddItem && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Text
              </label>
              <input
                type="text"
                value={newItem.text}
                onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                placeholder="e.g., Apple, Red, France"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        {items.filter(item => item && item.id).length > 0 ? (
          <div className="space-y-3">
            {/* Drop zone at the top */}
            <div
              className={`h-2 transition-colors rounded ${
                isDragging ? 'bg-green-300' : 'hover:bg-green-200'
              }`}
              onDragOver={handleItemDragOver}
              onDrop={(e) => handleItemDropZone(e, 0)}
            />
            
            {items.filter(item => item && item.id).map((item, index) => (
              <div key={item.id}>
                {/* Drop zone above the item */}
                <div
                  className={`h-2 -mb-1 transition-colors ${
                    isDragging ? 'bg-green-300' : 'hover:bg-green-200'
                  }`}
                  onDragOver={handleItemDragOver}
                  onDrop={(e) => handleItemDropZone(e, index)}
                />
                
                {/* Item */}
                <div
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, item)}
                  onDragEnd={handleItemDragEnd}
                  onDragOver={handleItemDragOver}
                  className={`flex items-center space-x-3 p-3 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
                    draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''
                  } hover:shadow-md`}
                >
                  <div className="text-gray-400 hover:text-gray-600">
                    <GripVertical size={16} />
                  </div>
                  
                  <div className="flex-1">
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        onBlur={() => setEditingItem(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingItem(null)}
                      />
                    ) : (
                      <span className="text-gray-900">
                        {item.text}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit item text"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove item"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Drop zone below the item (for last item) */}
                {index === items.filter(item => item && item.id).length - 1 && (
                  <div
                    className={`h-2 -mt-1 transition-colors ${
                      isDragging ? 'bg-green-300' : 'hover:bg-green-200'
                    }`}
                    onDragOver={handleItemDragOver}
                    onDrop={(e) => handleItemDropZone(e, index + 1)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p>No items yet. Click "Add Item" to get started!</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {categories.length > 0 && items.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Preview:</h4>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Items */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Items to Categorize:</h5>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white border rounded text-sm"
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Categories */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Categories:</h5>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className="p-2 border-2 border-dashed rounded text-sm text-center"
                      style={{ borderColor: category.color, color: category.color }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to create categorization questions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Add categories using the "Add Category" button above</li>
          <li>Customize each category with a name and color</li>
          <li>Add items to be categorized using the "Add Item" button</li>
          <li>Drag and drop to reorder categories and items</li>
          <li>Students will drag items into the appropriate category boxes when answering</li>
        </ol>
      </div>
    </div>
  );
};

export default CategorizeEditor;

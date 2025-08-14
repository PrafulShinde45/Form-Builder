import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../context/FormContext';
import { Plus, Edit, Eye, BarChart3, Trash2, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { forms, loading, deleteForm, togglePublish } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && form.isPublished) ||
                         (filterStatus === 'draft' && !form.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteForm(id);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    await togglePublish(id, !currentStatus);
  };

  const copyFormLink = (id) => {
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Form link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your forms and view responses</p>
        </div>
        <Link
          to="/builder"
          className="btn-primary inline-flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus size={18} />
          <span>Create New Form</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Forms</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first form</p>
          <Link to="/builder" className="btn-primary">
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form._id} className="card hover:shadow-soft transition-shadow">
              {/* Form Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {form.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {form.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Form Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{form.questions?.length || 0} questions</span>
                <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Link
                  to={`/builder/${form._id}`}
                  className="flex-1 btn-secondary text-center text-sm"
                >
                  <Edit size={16} className="inline mr-2" />
                  Edit
                </Link>
                
                <Link
                  to={`/preview/${form._id}`}
                  className="flex-1 btn-secondary text-center text-sm"
                >
                  <Eye size={16} className="inline mr-2" />
                  Preview
                </Link>
                
                <Link
                  to={`/form/${form._id}`}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Take Form
                </Link>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyFormLink(form._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy form link"
                  >
                    <Copy size={16} />
                  </button>
                  
                  <Link
                    to={`/responses/${form._id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View responses"
                  >
                    <BarChart3 size={16} />
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePublish(form._id, form.isPublished)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      form.isPublished
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {form.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(form._id, form.title)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete form"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {forms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {forms.length}
            </div>
            <div className="text-gray-600">Total Forms</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {forms.filter(f => f.isPublished).length}
            </div>
            <div className="text-gray-600">Published</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-600 mb-2">
              {forms.filter(f => !f.isPublished).length}
            </div>
            <div className="text-gray-600">Drafts</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

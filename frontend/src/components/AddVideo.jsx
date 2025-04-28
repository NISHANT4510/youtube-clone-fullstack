import React, { useState, useEffect } from 'react';
import { videoService } from '../services/video.service';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import CreateChannel from './CreateChannel';

const AddVideo = ({ onSuccess, onClose }) => {
  const { user, hasChannel } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  useEffect(() => {
    // Only show create channel if user doesn't have a channel
    if (!hasChannel()) {
      setShowCreateChannel(true);
    } else {
      setShowCreateChannel(false);
      setError('');
    }
  }, [hasChannel]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.videoUrl?.trim() || loading) {
      setError('Title and video URL are required');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.videoUrl);
    } catch (e) {
      setError('Please enter a valid video URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data according to the backend schema
      const videoData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        videoUrl: formData.videoUrl.trim(),
        thumbnail: formData.thumbnail?.trim() || '',
        categories: formData.categories || []
      };

      const response = await videoService.addVideo(videoData);
      
      if (response) {
        await onSuccess(response);
        onClose();
      } else {
        throw new Error('Failed to add video');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add video';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelCreated = async () => {
    setShowCreateChannel(false);
    setError(''); // Clear any previous errors
    // Retry submitting the video after channel creation
    if (formData.title && formData.videoUrl) {
      await handleSubmit(new Event('submit'));
    }
  };

  // If user already has a channel, don't show create channel form
  if (showCreateChannel && !user?.channelId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Create a Channel</h2>
          <p className="text-gray-600 mb-4">You need to create a channel before you can upload videos. Create your channel now to get started!</p>
          <CreateChannel onClose={() => setShowCreateChannel(false)} onSuccess={handleChannelCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Video</h2>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Video URL *
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.filter(cat => cat.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.categories.includes(category.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                rows="3"
                maxLength={5000}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.videoUrl}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideo;
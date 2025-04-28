import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ comments = [], videoId, onAddComment, onEditComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { user } = useAuth();

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment({
      text: newComment,
      userId: user._id || user.id,
      username: user.username,
      avatar: user.avatar
    });
    setNewComment('');
  };

  const handleEdit = (commentId) => {
    if (!editText.trim()) return;
    onEditComment(commentId, editText);
    setEditingId(null);
    setEditText('');
  };

  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment) return false;
    const userId = user._id || user.id;
    const commentUserId = comment.userId._id || comment.userId;
    return userId === commentUserId;
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-4">
            <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full" />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none pb-2"
            />
          </div>
          <div className="flex justify-end mt-2 space-x-2">
            <button
              type="button"
              onClick={() => setNewComment('')}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Comment
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="flex space-x-4">
            <img src={comment.avatar} alt={comment.username} className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.username}</span>
                <span className="text-gray-500 text-sm">
                  {formatDate(comment.createdAt || comment.timestamp)}
                </span>
              </div>
              
              {editingId === comment._id ? (
                <div className="mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border rounded-lg p-2 min-h-[60px]"
                    autoFocus
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(comment._id)}
                      disabled={!editText.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
              )}

              {isCommentOwner(comment) && !editingId && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => startEditing(comment)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteComment(comment._id)}
                    className="text-gray-500 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

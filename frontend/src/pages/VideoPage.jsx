import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { videoService } from '../services/video.service';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const formatViews = (count) => {
    // If it's an array (likes/dislikes), use its length
    const num = Array.isArray(count) ? count.length : count;
    
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const { data } = await videoService.getVideo(id);
      
      // Ensure comments have proper user data
      const processedComments = data.comments?.map(comment => ({
        ...comment,
        _id: comment._id,
        userId: comment.userId._id || comment.userId
      })) || [];

      // Make sure we have a valid video URL
      const videoUrl = data.videoUrl || data.url; // Check both possible URL fields

      setVideo({
        ...data,
        videoUrl, // Ensure video URL is set properly
        channelName: data.channelId?.name || data.channelName,
        channelAvatar: data.channelId?.avatar || data.channelAvatar,
        likes: data.likes || [],
        dislikes: data.dislikes || [],
        comments: processedComments,
        views: data.views || 0
      });

      // Check if user has liked/disliked
      if (user) {
        setIsLiked(data.likes?.includes(user._id));
        setIsDisliked(data.dislikes?.includes(user._id));
      }
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = isLiked 
        ? await videoService.unlikeVideo(id)
        : await videoService.likeVideo(id);
      
      if (response.success) {
        setIsLiked(!isLiked);
        setIsDisliked(false);
        // Update the video data
        setVideo(response.data);
      }
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = isDisliked 
        ? await videoService.undislikeVideo(id)
        : await videoService.dislikeVideo(id);
      
      if (response.success) {
        setIsDisliked(!isDisliked);
        setIsLiked(false);
        // Update the video data
        setVideo(response.data);
      }
    } catch (err) {
      console.error('Error updating dislike:', err);
    }
  };

  const handleAddComment = async (newComment) => {
    try {
      await videoService.addComment(id, newComment);
      await loadVideo(); // Reload video to get updated comments
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      await videoService.editComment(id, commentId, newText);
      await loadVideo();
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await videoService.deleteComment(id, commentId);
      await loadVideo();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <div className="pt-14 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mt-4">
        {/* Video Player */}
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
          {video?.videoUrl && (
            <ReactPlayer
              url={video.videoUrl}
              width="100%"
              height="100%"
              controls
              playing
              config={{
                youtube: {
                  playerVars: { 
                    origin: window.location.origin,
                    showinfo: 1 
                  }
                },
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
              onError={(e) => {
                console.error('Video playback error:', e);
                setError('Failed to play video. Please try again later.');
              }}
            />
          )}
        </div>
        
        {/* Video Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <img 
                src={video.channelAvatar} 
                alt={video.channelName}
                className="h-10 w-10 rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium">{video.channelName}</p>
                <p className="text-sm text-gray-500">{formatViews(video.views)} views</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-blue-600' : 'text-gray-700'}`}
              >
                <span>👍 {video.likes ? formatViews(video.likes.length) : '0'}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={`flex items-center space-x-1 ${isDisliked ? 'text-red-600' : 'text-gray-700'}`}
              >
                <span>👎 {video.dislikes ? formatViews(video.dislikes.length) : '0'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
          </div>

          {/* Comments Section */}
          <CommentSection
            comments={video.comments}
            videoId={video.id}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPage;

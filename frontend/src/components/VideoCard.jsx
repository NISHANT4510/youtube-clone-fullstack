import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Ensure we have a consistent video ID
  const videoId = video._id || video.id;
  if (!videoId) {
    console.warn('Video has no ID:', video);
  }

  const generatePlaceholderUrl = (type) => {
    return type === 'thumbnail' 
      ? `https://picsum.photos/640/360?random=${videoId}`
      : `https://picsum.photos/50/50?random=${videoId}`;
  };

  const getYouTubeThumbnail = (videoUrl) => {
    const videoIdMatch = videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  const handleImageError = (e, type) => {
    if (type === 'thumbnail') {
      const youtubeThumbnail = getYouTubeThumbnail(video.videoUrl);
      if (youtubeThumbnail) {
        e.target.src = youtubeThumbnail;
      } else {
        e.target.src = generatePlaceholderUrl('thumbnail');
      }
    } else {
      e.target.src = generatePlaceholderUrl('avatar');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0 views';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  const getThumbnailUrl = () => {
    if (video.thumbnail && video.thumbnail.startsWith('data:image')) {
      return generatePlaceholderUrl('thumbnail');
    }
    return video.thumbnail || getYouTubeThumbnail(video.videoUrl) || generatePlaceholderUrl('thumbnail');
  };

  const avatarUrl = avatarError
    ? generatePlaceholderUrl('avatar')
    : (video.channelAvatar || generatePlaceholderUrl('avatar'));

  return (
    <Link to={`/video/${videoId}`} className="flex flex-col hover:bg-gray-100 rounded-lg p-2">
      <div className="relative aspect-w-16 aspect-h-9">
        <img 
          src={getThumbnailUrl()}
          alt={video.title}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => handleImageError(e, 'thumbnail')}
          loading="lazy"
        />
        {video.duration && (
          <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <div className="flex mt-3 space-x-3">
        <div className="flex-shrink-0">
          <img 
            src={video.channelAvatar || generatePlaceholderUrl('avatar')}
            alt={video.channelName || 'Channel'}
            className="w-9 h-9 rounded-full object-cover"
            onError={(e) => handleImageError(e, 'avatar')}
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{video.channelName}</p>
          <p className="text-sm text-gray-600">
            {formatNumber(video.views)}
            {video.uploadedAt && ` • ${video.uploadedAt}`}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;

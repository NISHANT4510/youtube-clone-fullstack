import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import VideoCard from '../components/VideoCard';
import { CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import { videoService } from '../services/video.service';

let loadingTimeout = null;
let lastLoadTime = 0;
const LOAD_DEBOUNCE_TIME = 1000; // 1 second

const Home = ({ sidebarOpen, toggleSidebar }) => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('search') || '';
  const { user } = useAuth();

  const loadVideos = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadTime < LOAD_DEBOUNCE_TIME) {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      loadingTimeout = setTimeout(loadVideos, LOAD_DEBOUNCE_TIME);
      return;
    }

    try {
      setLoading(true);
      lastLoadTime = now;
      const response = await videoService.getAllVideos();
      
      // Create a Map to store unique videos by ID and URL
      const uniqueVideos = new Map();
      response.forEach(video => {
        const videoId = video._id || video.id;
        const videoKey = `${videoId}-${video.videoUrl}`;
        
        if (!uniqueVideos.has(videoKey)) {
          uniqueVideos.set(videoKey, {
            ...video,
            _id: videoId,
            id: videoId
          });
        }
      });
      
      const videos = Array.from(uniqueVideos.values());
      setVideos(videos);
      setError(null);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
      loadingTimeout = null;
    }
  }, []);

  useEffect(() => {
    loadVideos();
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadVideos]);

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const getTimeSinceUpload = (uploadDate) => {
    const diff = new Date() - new Date(uploadDate);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  const filteredVideos = videos.filter(video => {
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeFilter !== 'all') {
      // Ensure video has categories array and it includes the active filter
      const videoCategories = video.categories || [];
      return videoCategories.includes(activeFilter);
    }
    return true;
  });

  const processedVideos = filteredVideos.map(video => ({
    ...video,
    id: video._id,
    channelName: video.channelId?.name,
    channelAvatar: video.channelId?.avatar,
    views: formatViews(video.views),
    uploadedAt: getTimeSinceUpload(video.createdAt)
  }));

  if (loading) {
    return <div className="pt-14 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="pt-14 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="pt-14">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:pl-64' : 'pl-0'
      }`}>
        <div className="sticky top-14 bg-white z-40 border-b">
          <div className="flex space-x-3 p-3 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-1 rounded-full whitespace-nowrap ${
                  activeFilter === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {processedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

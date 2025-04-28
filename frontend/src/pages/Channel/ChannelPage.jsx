import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { channelService } from '../../services/channel.service';
import { videoService } from '../../services/video.service';
import { useAuth } from '../../context/AuthContext';
import VideoCard from '../../components/VideoCard';
import AddVideo from '../../components/AddVideo';

const ChannelPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  const isOwnChannel = user?.channelId === id;

  useEffect(() => {
    loadChannel();
  }, [id]);

  const loadChannel = async () => {
    try {
      setLoading(true);
      const data = await channelService.getChannel(id);
      setChannel(data.channel);
      setVideos(data.videos || []);
      setError(null);
    } catch (err) {
      console.error('Error loading channel:', err);
      setError(err.message || 'Failed to load channel');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoAdd = async (video) => {
    await loadChannel();
    setShowAddVideo(false);
  };

  const handleVideoEdit = async (videoId, newTitle) => {
    try {
      await videoService.updateVideo(videoId, { title: newTitle });
      await loadChannel();
      setEditingVideo(null);
    } catch (err) {
      console.error('Error updating video:', err);
    }
  };

  const handleVideoDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await videoService.deleteVideo(videoId);
      await loadChannel();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>;
  }

  if (!channel) {
    return <div className="text-center mt-8">Channel not found</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-16">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            <p className="text-gray-600">{channel.description}</p>
          </div>
          {isOwnChannel && (
            <button
              onClick={() => setShowAddVideo(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Add Video
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="relative group">
            <VideoCard video={video} />
            {isOwnChannel && (
              <div className="absolute top-2 right-2 hidden group-hover:flex space-x-2">
                {editingVideo === video._id ? (
                  <div className="bg-white p-2 rounded shadow-lg">
                    <input
                      type="text"
                      defaultValue={video.title}
                      className="border rounded px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleVideoEdit(video._id, e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingVideo(null);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingVideo(video._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleVideoDelete(video._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center mt-8 text-gray-600">
          {isOwnChannel ? 'Add your first video!' : 'No videos yet'}
        </div>
      )}

      {showAddVideo && (
        <AddVideo onSuccess={handleVideoAdd} onClose={() => setShowAddVideo(false)} />
      )}
    </div>
  );
};

export default ChannelPage;

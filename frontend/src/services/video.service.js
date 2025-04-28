import api from './api';

export const videoService = {
  async getAllVideos() {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  async getVideo(id) {
    try {
      const response = await api.get(`/videos/${id}`);
      return {
        success: true,
        data: {
          ...response.data,
          videoUrl: response.data.videoUrl || response.data.url // Handle both URL formats
        }
      };
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  async addVideo(videoData) {
    try {
      // Get user from localStorage to access channelId
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.channelId) {
        throw new Error('You must create a channel before adding videos');
      }

      // Format the video data according to the backend schema
      const formattedData = {
        title: videoData.title.trim(),
        description: videoData.description?.trim() || '',
        url: videoData.videoUrl.trim(), // Changed from videoUrl to url to match backend schema
        thumbnail: videoData.thumbnail?.trim() || '',
        channelId: user.channelId,
        userId: user.id,
        categories: videoData.categories || []
      };

      const response = await api.post('/videos', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error adding video:', error);
      throw new Error(error.response?.data?.message || 'Failed to add video');
    }
  },

  async updateVideo(id, data) {
    try {
      const response = await api.patch(`/videos/${id}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update video');
    }
  },

  async likeVideo(id) {
    return this.updateVideo(id, { action: 'like' });
  },

  async unlikeVideo(id) {
    return this.updateVideo(id, { action: 'unlike' });
  },

  async dislikeVideo(id) {
    return this.updateVideo(id, { action: 'dislike' });
  },

  async undislikeVideo(id) {
    return this.updateVideo(id, { action: 'undislike' });
  },

  async deleteVideo(id) {
    try {
      const response = await api.delete(`/videos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete video');
    }
  },

  async addComment(videoId, comment) {
    try {
      const response = await api.post(`/videos/${videoId}/comments`, comment);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  },

  async deleteComment(videoId, commentId) {
    try {
      const response = await api.delete(`/videos/${videoId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
  },

  async editComment(videoId, commentId, text) {
    try {
      const response = await api.put(`/videos/${videoId}/comments/${commentId}`, { text });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to edit comment');
    }
  }
};

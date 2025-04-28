import api from './api';

export const channelService = {
  async createChannel(channelData) {
    try {
      const response = await api.post('/channels', channelData);
      if (response.data.success) {
        return {
          success: true,
          channel: response.data.channel,
          message: response.data.message
        };
      } else if (response.data.channel) {
        // User already has a channel, return it
        return {
          success: true,
          channel: response.data.channel,
          message: 'Existing channel found'
        };
      }
      throw new Error(response.data.message || 'Failed to create channel');
    } catch (error) {
      // If it's a 400 error with a channel, the user already has one
      if (error.response?.status === 400 && error.response.data.channel) {
        return {
          success: true,
          channel: error.response.data.channel,
          message: 'Existing channel found'
        };
      }
      // Otherwise throw the error
      throw new Error(error.response?.data?.message || error.message || 'Failed to create channel');
    }
  },

  async getChannel(id) {
    try {
      const response = await api.get(`/channels/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch channel');
    }
  },

  async updateChannel(id, data) {
    try {
      const response = await api.patch(`/channels/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update channel');
    }
  },

  async uploadVideo(channelId, videoData) {
    try {
      const response = await api.post(`/channels/${channelId}/videos`, videoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload video');
    }
  },

  async deleteVideo(channelId, videoId) {
    try {
      const response = await api.delete(`/channels/${channelId}/videos/${videoId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete video');
    }
  },

  async updateVideo(channelId, videoId, data) {
    try {
      const response = await api.patch(`/channels/${channelId}/videos/${videoId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update video');
    }
  }
};

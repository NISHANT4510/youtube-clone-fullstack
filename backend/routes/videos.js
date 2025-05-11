const router = require('express').Router();
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const User = require('../models/User'); // Ensure you import the User model

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('userId', 'username avatar')
      .populate('channelId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    
    const uniqueVideosMap = new Map();
    videos.forEach(video => {
      if (!uniqueVideosMap.has(video.videoUrl)) {
        uniqueVideosMap.set(video.videoUrl, {
          ...video,
          id: video._id.toString(),
          username: video.userId?.username,
          userAvatar: video.userId?.avatar,
          channelName: video.channelId?.name,
          channelAvatar: video.channelId?.avatar
        });
      }
    });

    const uniqueVideos = Array.from(uniqueVideosMap.values());
    console.log(`Sending ${uniqueVideos.length} unique videos`); 
    
    res.json(uniqueVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      message: 'Error fetching videos',
      error: error.message 
    });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid video ID provided' });
    }

    const video = await Video.findById(id)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views = (video.views || 0) + 1;
    await video.save();

    const videoData = video.toObject();
    videoData.username = video.userId?.username;
    videoData.userAvatar = video.userId?.avatar;

    res.json(videoData);
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ 
      message: 'Error retrieving video',
      error: error.message 
    });
  }
});

// Create a new video
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, url, thumbnail, channelId, categories } = req.body;

    // Validate required fields
    if (!title || !url || !channelId) {
      return res.status(400).json({ 
        message: 'Title, video URL, and channel ID are required' 
      });
    }

    const newVideo = new Video({
      title,
      description: description || '',
      videoUrl: url, // Map url to videoUrl in schema
      thumbnail,
      userId: req.userData.userId,
      channelId,
      categories: categories || [],
      views: 0,
      likes: [],
      dislikes: [],
      comments: []
    });

    const savedVideo = await newVideo.save();

    // Return the saved video with proper ID mapping
    res.status(201).json({
      ...savedVideo.toObject(),
      id: savedVideo._id,
      url: savedVideo.videoUrl // Include both url and videoUrl for compatibility
    });

  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create video',
      error: error 
    });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      userId: req.userData.userId
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update video
router.patch('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const userId = req.userData.userId;
    const { action } = req.body;

    if (action) {
      switch (action) {
        case 'like':
          if (!video.likes.includes(userId)) {
            // Remove from dislikes if exists
            video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
            video.likes.push(userId);
          }
          break;
        case 'unlike':
          video.likes = video.likes.filter(id => id.toString() !== userId.toString());
          break;
        case 'dislike':
          if (!video.dislikes.includes(userId)) {
            // Remove from likes if exists
            video.likes = video.likes.filter(id => id.toString() !== userId.toString());
            video.dislikes.push(userId);
          }
          break;
        case 'undislike':
          video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } else {
      // Handle other video updates
      const { title, description } = req.body;
      if (title !== undefined) video.title = title;
      if (description !== undefined) video.description = description;
    }

    await video.save();

    // Return consistent response format
    return res.json({
      success: true,
      data: {
        ...video.toObject(),
        id: video._id,
        likes: video.likes || [],
        dislikes: video.dislikes || []
      }
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: error.message });
  }
});

// Comment routes
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { _id, username, avatar } = await User.findById(req.userData.userId);
    
    const comment = {
      text: req.body.text,
      userId: _id,
      username: username,
      avatar: avatar || req.userData.avatar,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    video.comments.push(comment);
    await video.save();

    const savedComment = video.comments[video.comments.length - 1];
    res.status(201).json({
      ...savedComment.toObject(),
      _id: savedComment._id,
      userId: savedComment.userId // Ensure we send back the proper userId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:videoId/comments/:commentId', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.userData.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.text = req.body.text;
    comment.updatedAt = new Date();
    await video.save();
    
    res.json({
      ...comment.toObject(),
      username: comment.username,
      avatar: comment.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:videoId/comments/:commentId', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.userData.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    video.comments.pull(req.params.commentId);
    await video.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Video = require('../models/Video');

router.post('/:videoId', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const comment = {
      text: req.body.text,
      userId: req.userData.userId,
      username: req.userData.username,
      timestamp: new Date()
    };

    video.comments.push(comment);
    await video.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

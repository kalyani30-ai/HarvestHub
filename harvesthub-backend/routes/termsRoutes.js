const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve terms and conditions text
router.get('/text', (req, res) => {
  const termsPath = path.join(__dirname, '../public/terms.txt');
  fs.readFile(termsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Terms file not found' });
    res.json({ terms: data });
  });
});

// Serve terms and conditions audio file URL
router.get('/audio', (req, res) => {
  // Assuming the audio file is in public/audio/terms.mp3
  const audioUrl = '/audio/terms.mp3';
  res.json({ audioUrl });
});

module.exports = router; 
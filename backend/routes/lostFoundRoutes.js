const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  addComment,
  resolvePost,
  deletePost
} = require('../Controllers/lostFoundController');

router.get('/', getAllPosts);
router.post('/', createPost);
router.post('/:id/comment', addComment);
router.patch('/:id/resolve', resolvePost);
router.delete('/:id', deletePost);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  deleteComment
} = require('../controllers/commentController');

router.get('/:postId/comments', getComments);
router.post('/:postId/comments', createComment);
router.delete('/:id', deleteComment);

module.exports = router;

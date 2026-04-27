const LostFound    = require('../models/LostFound');
const Notification = require('../models/Notification');

async function getAllPosts(req, res) {
  try {
    const posts = await LostFound.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPost(req, res) {
  try {
    const {
      type, studentId, itemName, description,
      busNumber, location, specialMark, image
    } = req.body;

    const post = new LostFound({
      type, studentId, itemName, description,
      busNumber, location, specialMark, image
    });
    await post.save();

    // ── Auto-notify logic (only when a FOUND post is created) ──
    if (type === 'found') {
      const keyword = itemName.toLowerCase().trim();

      // Find all OPEN lost posts
      const lostPosts = await LostFound.find({
        type: 'lost',
        status: 'open'
      });

      // Partial match — check if lost item name contains any word from found item
      const foundWords = keyword.split(' ').filter(w => w.length > 2);

      for (const lostPost of lostPosts) {
        const lostKeyword = lostPost.itemName.toLowerCase().trim();

        const isMatch = foundWords.some(word => lostKeyword.includes(word))
          || lostKeyword.split(' ').some(word =>
              word.length > 2 && keyword.includes(word)
             );

        if (isMatch && lostPost.studentId !== studentId) {
          await Notification.create({
            studentId: lostPost.studentId,
            message: `Someone found a "${itemName}"! Check if it's yours.`,
            postId: post._id
          });
        }
      }
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function addComment(req, res) {
  try {
    const { postedBy, text } = req.body;
    const post = await LostFound.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ postedBy, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function resolvePost(req, res) {
  try {
    const post = await LostFound.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deletePost(req, res) {
  try {
    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllPosts, createPost, addComment, resolvePost, deletePost
};
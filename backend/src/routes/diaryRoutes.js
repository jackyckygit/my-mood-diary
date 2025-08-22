const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All diary routes are protected
router.use(authenticateToken);

router.post('/', diaryController.saveDiary);
router.get('/:date', diaryController.getDiaryByDate);
router.get('/', diaryController.getDiariesInRange); // For calendar
router.get('/category/:sentiment', diaryController.getDiariesByCategory);
router.delete('/:id', diaryController.deleteDiary);

module.exports = router;
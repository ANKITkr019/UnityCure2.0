const router = require('express').Router();
const { chat, translateReport, summarizeReport } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/chat', chat);
router.post('/translate', translateReport);
router.post('/summarize', summarizeReport);

module.exports = router;
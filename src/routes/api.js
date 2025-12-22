const router = require('express').Router();
const api = require('../controllers/apiController');
const auth = require('../middleware/auth');

router.get('/', api.list);
router.get('/:id', api.execute);

// admin
router.post('/', auth, api.create);
router.put('/:id', auth, api.update);
router.delete('/:id', auth, api.remove);

module.exports = router;
const express = require('express')
const router = express.Router()
const Categories = require('../controllers/Categories') 

router.post('/',Categories.create);
router.get('/',Categories.readAll);
router.put('/:Categories',Categories.update);
router.delete('/:id',Categories.delete);

module.exports = router
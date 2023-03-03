const { Router } = require('express');
const { check } = require('express-validator');
const {
  addProductToCart,
  updateCart,
  removeProductToCart,
} = require('../controllers/cart.controller');
const {
  validExistCart,
  validExistProductInCartByParamsForUpdate,
} = require('../middlewares/cart.middleware');
const {
  validBodyProductById,
  validIfExistProductInStock,
  validExistProductInStockForUpdate,
} = require('../middlewares/products.middlewares');
const { validateFields } = require('../middlewares/validateField.middleware');

const router = Router();

router.post(
  '/add-product',
  [
    check('productId', 'The producId is required').not().isEmpty(),
    check('productId', 'The producId must be a number').isNumeric(),
    check('quantity', 'The quantity is required').not().isEmpty(),
    check('quantity', 'The quantity must be a number').isNumeric(),
    validateFields,
    validBodyProductById,
    validIfExistProductInStock,
    validExistCart,
  ],
  addProductToCart
);

router.patch(
  '/update-cart',
  [
    check('productId', 'The producId is required').not().isEmpty(),
    check('productId', 'The producId must be a number').isNumeric(),
    check('newQty', 'The newQty is required').not().isEmpty(),
    check('newQty', 'The newQty must be a number').isNumeric(),
    validateFields,
    validExistProductInStockForUpdate,
  ],
  updateCart
);
router.delete(
  '/:productId',
  validExistPreoductIdByParams,
  validExistProductInCartByParamsForUpdate,
  removeProductToCart
);
router.post('/purchase', buyProductOnCart);

module.exports = {
  cartRouter: router,
};

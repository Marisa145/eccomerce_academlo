const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ProductInCart = require('../models/productInCart.model');
const catchAsync = require('../utils/catchAsync');

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { cart } = req;

  const productInCart = await ProductInCart.create({
    cartId: cart.id,
    productId,
    quantity,
  });

  res.status(201).json({
    status: 'success',
    message: 'The product has been added',
    productInCart,
  });
});

exports.validExistProductInCartForUpdate = catchAsync(
  async (req, res, next) => {
    const { sessionUser } = req;
    const { productId } = req.body;

    const cart = await Cart.findOne({
      where: {
        userId: sessionUser.id,
        status: 'active',
      },
    });

    const productInCart = await ProductInCart.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!productInCart) {
      return next(new AppError('The product does not exist in the cart', 400));
    }

    req.productInCart = productInCart;

    next();
  }
);
exports.updateCart = catchAsync(async (req, res, next) => {
  const { newQty } = req.body;
  const { productInCart } = req;

  if (newQty < 0) {
    return next(new AppError('The quantity must be greater than 0', 400));
  }

  if (newQty === 0) {
    await productInCart.update({ quantity: newQty, status: 'removed' });
  } else {
    await productInCart.update({ quantity: newQty, status: 'active' });
  }

  res.status(201).json({
    status: 'success',
    message: 'The product has been added',
  });
});

exports.buyProductOnCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  //1. buscar el carrito del usuario

  const cart = await Cart.findOne({
    attributes: ['id', 'userId'],
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    include: [
      {
        model: ProductInCart,
        attributes: { exclude: ['status', 'createdAt', 'updatedAt'] },
        where: {
          status: 'active',
        },
        include: [
          {
            model: Product,
            attributes: { exclude: ['status', 'createdAt', 'updatedAt'] },
          },
        ],
      },
    ],
  });

  //2. calcular el precio total a pagar
  let totalPrice = 0;

  cart.productInCarts.forEach(productInCart => {
    totalPrice += productInCart.quantity * productInCart.product.price;
  });

  //3. vamos a actualizar el stock o cantidad del modelo Product
  const purchasedProductPromises = cart.productInCarts.map(
    async productInCart => {
      const product = await Product.findOne({
        where: {
          id: productInCart.productId,
        },
      });

      const newStock = product.quantity - productInCart.quantity;

      return await product.update({ quantity: newStock });
    }
  );

  await Promise.all(purchasedProductPromises);

  res.json({
    cart,
  });
});

//crearse una constante que se la van a asignar al map, statusProductInCartPromises

//recorrer el arreglo de productsInCarts

//buscar el producto en el carrito a actualizar

//retornar las actualizaciones del producto en el carrito encontrado, y el status: 'purchased'

//fuera del map van a resolver las promesas con el promise All

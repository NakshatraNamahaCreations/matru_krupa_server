const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /api/cart  (protected)
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name image images brand price originalPrice stock active"
    );
    if (!cart) return res.json({ items: [], totalAmount: 0, totalItems: 0 });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/cart  (protected) — add or update item
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!product.active) return res.status(400).json({ message: "Product is unavailable" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity = quantity;
      cart.items[existingIdx].price = product.price;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    await cart.populate("items.product", "name image images brand price originalPrice stock active");
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/cart/:productId  (protected) — update quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    item.price = product.price;
    await cart.save();
    await cart.populate("items.product", "name image images brand price originalPrice stock active");
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/cart/:productId  (protected)
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    await cart.populate("items.product", "name image images brand price originalPrice stock active");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart  (protected) — clear cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

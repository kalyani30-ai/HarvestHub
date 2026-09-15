const Product = require('../models/productModel');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl } = req.body;

    const farmerId = req.user && (req.user.id || req.user._id);

    const product = new Product({
      name,
      price,
      description,
      category,
      farmer: farmerId,
      stock,
      imageUrl,
    });

    await product.save();

    return res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createProduct, getAllProducts };



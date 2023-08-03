const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId; // lay userId tu authMiddleware
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productID}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productID}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOne({ _id: productID });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productID}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please provide image file");
  }

  const maxSize = 1024 * 1024; // 1MB
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      `Please upload an image less than ${maxSize}`
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + productImage.name
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};

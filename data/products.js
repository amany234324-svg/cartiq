import { get, post, patch, remove } from './api.js';
import { validateProductData } from '../utils/validation.js';
import { hasRole } from './auth.js';

/**
 * Fetches one product by its ID.
 * Input: id (string or number) — the product ID.
 * Possible outputs:
 *   - { status: 'success', data: product } — product found; "data" has name, description, category, price, stock, id, etc.
 *   - { status: 'fail', error: 'Product ID is required' } — id was not provided.
 *   - { status: 'fail', message: 'No ... found with this ID' } — no product with this id.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function getProductById(id) {
  if (!id) {
    return { status: 'fail', error: 'Product ID is required' };
  }

  return await get(`products/${id}`);
}

/**
 * Fetches a list of products. You can filter by category and/or search by text in name, category, or description.
 * Input: filters (object, optional) — { category: '...', search: '...' }. You can omit it to get all products.
 * Possible outputs:
 *   - { status: 'success', data: [ products... ] } — array of products (filtered if you passed category or search).
 *   - { status: 'fail', message: '...' } — from the API (e.g. no products found).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function getAllProducts(filters = {}) {
  const queryObj = {};
  if (filters.category) queryObj.category = filters.category;
  // if (filters.search) queryObj.name = filters.search;
  // if (filters.search) queryObj.name_like = filters.search;
  // if (filters.search) queryObj.q = filters.search;

  const result = await get('products', queryObj);
  // Apply search manually
  // Search is applied for product name, category, and description
  if (result.status === 'success' && filters.search) {
    const term = filters.search;
    result.data = result.data.filter(
      (product) =>
        new RegExp(term, 'i').test(product.name) ||
        new RegExp(term, 'i').test(product.category) ||
        new RegExp(term, 'i').test(product.description),
    );
  }

  return result;
}

/**
 * Creates a new product. Only users with admin role can do this. Product data is validated before creating.
 * Input: productData (object) — { name, description, category, price, stock }; all fields are required.
 * Possible outputs:
 *   - { status: 'success', data: product } — product created; "data" is the new product.
 *   - { status: 'fail', message: 'User does not have permission to do this action' } — not an admin.
 *   - { status: 'fail', message: '...' } — validation error (e.g. "Product name is required", "Product price must be a positive number").
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function createProduct(productData) {
  // Only admins can create products
  const hasAdminRole = hasRole('admin');
  if (hasAdminRole.status === 'fail') return hasAdminRole;

  // Validate product's data
  const productValidation = validateProductData(productData);
  if (!productValidation.valid)
    return { status: 'fail', message: productValidation.error };

  // Save image through the server and get the path of the saved image
  const productImageResponse = await fetch(
    'http://localhost:8000/api/products',
    {
      method: 'POST',
      body: productData.image,
    },
  );

  let productImagePath;
  if (productImageResponse.ok) {
    const productImageResponseJson = await productImageResponse.json();

    productImagePath = productImageResponseJson.data.file;
  }

  // Create product
  return await post('products', { ...productData, image: productImagePath });
}

/**
 * Updates an existing product by ID. Only the fields you pass in "data" are updated and validated.
 * Input: id (string or number) — product ID; data (object) — fields to change, e.g. { name, description, category, price, stock } (any subset).
 * Possible outputs:
 *   - { status: 'success', data: product } — product updated; "data" is the updated product.
 *   - { status: 'fail', error: 'Product ID is required' } — id was not provided.
 *   - { status: 'fail', message: '...' } — validation error (e.g. "Too short product name", "Product price must be a positive number").
 *   - { status: 'fail', message: 'No ... found with this ID' } — product not found.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function updateProductById(id, data) {
  if (!id) {
    return { status: 'fail', error: 'Product ID is required' };
  }

  const productValidation = validateProductData(data, false);
  if (!productValidation.valid)
    return { status: 'fail', message: productValidation.error };

  // Save image through the server and get the path of the saved image
  if (data.image) {
    const productImageResponse = await fetch(
      'http://localhost:8000/api/products',
      {
        method: 'POST',
        body: data.image,
      },
    );

    let productImagePath;
    if (productImageResponse.ok) {
      const productImageResponseJson = await productImageResponse.json();

      productImagePath = productImageResponseJson.data.file;
    }
    return await patch(`products/${id}`, { ...data, image: productImagePath });
  }

  return await patch(`products/${id}`, data);
}

/**
 * Deletes a product by ID. Only users with admin role can do this.
 * Input: id (string or number) — the product ID to delete.
 * Possible outputs:
 *   - { status: 'success' } — product deleted.
 *   - { status: 'fail', error: 'Product ID is required' } — id was not provided.
 *   - { status: 'fail', message: 'User does not have permission to do this action' } — not an admin.
 *   - { status: 'fail', message: 'No ... found with this ID' } — product not found.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function deleteProductById(id) {
  if (!id) {
    return { status: 'fail', error: 'Product ID is required' };
  }

  const hasAdminRole = hasRole('admin');
  if (hasAdminRole.status === 'fail') return hasAdminRole;

  return await remove(`products/${id}`);
}

// getAllProducts({ category: 'Footwear' })
//   .then((result) => result.data.forEach((product) => console.log(product)))
//   .catch(console.log);

// getAllProducts({ search: 'compatible' }).then(console.log).catch(console.log);
// getProductById(100).then(console.log).catch(console.log);

// createProduct({
//   name: 'Desk Lamp',
//   price: 29.5,
//   stock: 150,
//   category: 'Home Decor',
//   description: 'LED desk lamp with adjustable brightness and flexible neck.',
// }).then(console.log);

// deleteProductById('cee6').then(console.log);

// updateProductById('56b1', { name: 'l' }).then(console.log).catch(console.log);

export {
  getProductById,
  getAllProducts,
  createProduct,
  updateProductById,
  deleteProductById,
};

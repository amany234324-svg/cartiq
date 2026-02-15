import * as api from './api.js';
import { isAuthenticated } from './auth.js';
import { getProductById } from './products.js';

/**
 * Gets the current user's cart from the API (raw cart: items are productId + quantity only).
 * Input: none (uses the logged-in user from the token).
 * Possible outputs:
 *   - { status: 'success', data: cart } — cart found; "data" has id, userId, items (array of { productId, quantity }).
 *   - { status: 'fail', message: 'User is not authenticated' } — not logged in.
 *   - { status: 'fail', message: 'User has no cart' } — user is logged in but has no cart yet.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function getCurrentUserCart() {
  const authenticationResult = isAuthenticated();
  if (authenticationResult.status === 'fail') return authenticationResult;

  const userId = authenticationResult.token.userId;

  const userCart = await api.getOne('carts', { userId });

  if (userCart.status === 'fail')
    return { status: 'fail', message: 'User has no cart' };

  return userCart;
}

/**
 * Gets the current user's cart with each item filled in with full product details (name, price, etc.) plus quantity.
 * Input: none (uses the logged-in user).
 * Possible outputs:
 *   - { status: 'success', data: { ...cart, items: [ product details + quantity, ... ] } } — cart with full product info.
 *   - Same fail/error outputs as getCurrentUserCart (not logged in, no cart, or request failed).
 */
async function getCurrentUserCartPopulated() {
  // Get current user's cart
  const userCart = await getCurrentUserCart();
  if (userCart.status === 'fail') return userCart;

  const cartItems = userCart.data.items;

  // Populate cart items with products' data
  const items = await Promise.all(
    cartItems.map(async (cartItem) => {
      const productResponse = await getProductById(cartItem.productId);

      return {
        ...productResponse.data,
        quantity: cartItem.quantity,
      };
    }),
  );

  return {
    status: 'success',
    data: {
      ...userCart.data,
      items,
    },
  };
}

/**
 * Adds a product to the current user's cart (or creates a cart if they don't have one). Checks that enough stock exists.
 * Input: productId (string or number), quantity (number).
 * Possible outputs:
 *   - { status: 'success', data: cart } — item(s) added; "data" is the updated cart.
 *   - { status: 'fail', message: 'User is not authenticated' } — not logged in.
 *   - { status: 'fail', message: 'Requested quantity exceeds available stock.' } — not enough stock.
 *   - { status: 'fail', message: '...' } or { status: 'error', message: '...' } — product not found or API error.
 */
async function addToCart(productId, quantity) {
  const authenticationResult = isAuthenticated();
  if (authenticationResult.status === 'fail') return authenticationResult;

  const currentUserId = authenticationResult.token.userId;

  // Check stock first
  const productRes = await getProductById(productId);
  if (productRes.status !== 'success') return productRes;

  if (productRes.data.stock < quantity)
    return {
      status: 'fail',
      message: 'Requested quantity exceeds available stock.',
    };

  const currentUserCart = await getCurrentUserCart();
  // If cart doesn't exist yet, create it
  if (currentUserCart.status === 'fail') {
    const newCart = {
      userId: currentUserId,
      items: [{ productId, quantity }],
    };

    const res = await api.post('carts', newCart);
    return res;
  }

  // If cart exists, update it
  const cart = currentUserCart.data;
  const existingProduct = cart.items.find((p) => p.productId === productId);

  if (existingProduct) {
    // If product already in cart, update quantity
    existingProduct.quantity += quantity;
  } else {
    // Add to cart
    cart.items.push({ productId, quantity });
  }

  const res = await api.patch(`carts/${cart.id}`, { items: cart.items });
  return res;
}

/**
 * Removes one product completely from the current user's cart.
 * Input: productId (string or number) — the product to remove.
 * Possible outputs:
 *   - { status: 'success' } or { status: 'success', data: ... } — item removed (or cart deleted if empty).
 *   - { status: 'fail', message: 'User is not authenticated' } or 'User has no cart' — not logged in or no cart.
 *   - { status: 'fail', message: "This product does not exist in user's cart" } — product was not in the cart.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function removeFromCart(productId) {
  // Get current user cart
  const currentUserCart = await getCurrentUserCart();

  if (currentUserCart.status === 'fail') return currentUserCart;

  const cart = currentUserCart.data;
  const numOfItems = cart.items.length;
  // Filter cart items excluding product
  cart.items = cart.items?.filter((item) => item.productId !== productId);

  // If cart items length still the same, that means product doesn't exist in the cart
  if (cart.items.length === numOfItems)
    return {
      status: 'fail',
      message: "This product does not exist in user's cart",
    };

  // If cart became empty, delete it
  if (!cart.items.length) {
    return await api.remove(`carts/${cart.id}`);
  }

  return await api.patch(`carts/${cart.id}`, { items: cart.items });
}

/**
 * Changes the quantity of a product in the current user's cart. If newQuantity is 0, the item is removed.
 * Input: productId (string or number), newQuantity (number, use 0 to remove the item).
 * Possible outputs:
 *   - { status: 'success', data: cart } — quantity updated (or item removed if 0).
 *   - { status: 'fail', message: 'User is not authenticated' } or 'User has no cart' — not logged in or no cart.
 *   - { status: 'fail', message: "This product does not exist in user's cart" } — product not in cart.
 *   - { status: 'fail', message: 'Requested quantity exceeds available stock.' } — new quantity higher than stock.
 *   - { status: 'fail', message: 'No product found with this ID' } — product doesn't exist.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function updateCartItem(productId, newQuantity) {
  const currentUserCart = await getCurrentUserCart();

  if (currentUserCart.status === 'fail') return currentUserCart;

  const cart = currentUserCart.data;
  // Get item from cart
  const productInCart = cart.items?.find(
    (item) => item.productId === productId,
  );

  // If item doesn't exist
  if (!productInCart) {
    return {
      status: 'fail',
      message: "This product does not exist in user's cart",
    };
  }

  // If quantity is 0, remove item from cart
  if (!newQuantity) {
    return await removeFromCart(productId);
  }

  // Get product data
  const product = await getProductById(productId);
  if (product.status === 'fail')
    return { status: 'fail', message: 'No product found with this ID' };

  // Check for new quantity against product stock
  if (newQuantity > product.data.stock)
    return {
      status: 'fail',
      message: 'Requested quantity exceeds available stock.',
    };

  productInCart.quantity = newQuantity;

  return await api.patch(`carts/${cart.id}`, { items: cart.items });
}

/**
 * Removes the current user's entire cart (all items).
 * Input: none (uses the logged-in user).
 * Possible outputs:
 *   - { status: 'success' } — cart deleted.
 *   - { status: 'fail', message: 'User is not authenticated' } or 'User has no cart' — not logged in or no cart.
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function clearCart() {
  const currentUserCart = await getCurrentUserCart();

  if (currentUserCart.status === 'fail') return currentUserCart;

  return await api.remove(`carts/${currentUserCart.data.id}`);
}

export {
  getCurrentUserCart,
  getCurrentUserCartPopulated,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
};

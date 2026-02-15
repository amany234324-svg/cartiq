import { validateShippingInfo } from '../utils/validation.js';
import { post, patch, remove, getOne, getAll } from './api.js';
import { clearCart, getCurrentUserCartPopulated } from './cart.js';
import {
  getAllProducts,
  getProductById,
  updateProductById,
} from './products.js';
import { hasRole, isAuthenticated } from './auth.js';

/**
 * Fetches one order by its ID and fills in full product details for each item in the order.
 * Input: id (string or number) — the order ID.
 * Possible outputs:
 *   - { status: 'success', data: order } — order found; "data" includes items with full product info and quantities.
 *   - { status: 'fail', message: 'Order ID is required' } — id was not provided.
 *   - { status: 'fail', message: '...' } — order not found (from API).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function getOrderById(id) {
  if (!id) {
    return { status: 'fail', error: 'Order ID is required' };
  }

  const order = await getOne(`orders/${id}`);

  if (order.status === 'fail') return order;

  const orderItems = order.data.items;

  const items = await Promise.all(
    orderItems.map(async (item) => {
      const productResponse = await getProductById(item.productId);

      return {
        ...productResponse.data,
        quantity: item.quantity,
      };
    }),
  );

  return {
    status: 'success',
    data: {
      ...order.data,
      items,
    },
  };
}

/**
 * Fetches all orders for a given user and fills in full product details for each order's items.
 * Input: userId (string or number) — the user whose orders you want.
 * Possible outputs:
 *   - { status: 'success', data: [ orders... ] } — list of orders, each with items containing full product info.
 *   - { status: 'fail', message: '...' } or { status: 'error', message: '...' } — from the API (e.g. no orders or request failed).
 */
async function getAllOrders(userId) {
  const orders = await getAll('orders', { userId });

  if (orders.status !== 'success') return orders;

  // Populate order items with products data
  const populatedOrders = await Promise.all(
    orders.data.map(async (order) => {
      const orderItems = order.items;

      const items = await Promise.all(
        orderItems.map(async (item) => {
          const productResponse = await getProductById(item.productId);

          return {
            ...productResponse.data,
            quantity: item.quantity,
          };
        }),
      );

      return {
        ...order,
        items,
      };
    }),
  );

  return {
    status: 'success',
    data: populatedOrders,
  };
}

/**
 * Gets all orders for the currently logged-in user (same as getAllOrders but uses the token to get userId).
 * Input: none.
 * Possible outputs:
 *   - { status: 'success', data: [ orders... ] } — list of the current user's orders with full product details.
 *   - { status: 'fail', message: 'User is not authenticated' } — not logged in.
 *   - { status: 'fail', message: '...' } or { status: 'error', message: '...' } — from getAllOrders/API.
 */
async function getCurrentUserOrders() {
  const authenticationResult = isAuthenticated();
  if (authenticationResult.status === 'fail') return authenticationResult;

  return await getAllOrders(authenticationResult.token.userId);
}

/**
 * Creates an order from the current user's cart: validates shipping info, checks stock, updates product stock, saves the order, then clears the cart.
 * Input: shippingInfo (object) — { fullName, address, city, postalCode, phone } (see validateShippingInfo for rules).
 * Possible outputs:
 *   - { status: 'success', data: order } — order created; "data" is the new order.
 *   - { status: 'fail', message: '...' } — user has no cart, invalid shipping info, or a product's requested quantity exceeds stock (message explains).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function createOrder(shippingInfo) {
  // Check if user has a cart
  const userCart = await getCurrentUserCartPopulated();
  if (userCart.status === 'fail') return userCart;

  // Validate shipping info
  const shippingValidationResult = validateShippingInfo(shippingInfo);
  if (!shippingValidationResult.valid)
    return { status: 'fail', message: shippingValidationResult.error };

  // Cart items
  let items = userCart.data.items;

  let subtotal = 0;
  let valid = true;
  let messages = '';
  // Check items quantities against products stocks, and set subtotal
  await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.id);

      if (product.data.stock < item.quantity) {
        valid = false;
        messages += `Requested quantity "${item.quantity}" for product "${item.name}" exceeds available stock "${product.data.stock}". `;
      }

      // Update subtotal
      subtotal += item.price * item.quantity;
    }),
  );

  // If no valid quantity don't continue the process
  if (!valid) {
    return { status: 'fail', message: messages };
  }

  // Update products stocks
  items = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.id);

      await updateProductById(item.id, {
        stock: product.data.stock - item.quantity,
      });

      return { productId: item.id, quantity: item.quantity };
    }),
  );

  // Calculate total price
  const tax = subtotal * 0.14;
  const totalPrice = subtotal + tax;

  const order = {
    userId: userCart.data.userId,
    items: [...items],
    subtotal,
    tax,
    totalPrice,
    status: 'pending',
    shippingInfo,
    createdAt: new Date(),
  };

  // Clear cart
  const orderResult = await post('orders', order);
  await clearCart();

  return orderResult;
}

/**
 * Updates an existing order (e.g. change status). Only users with admin role can do this.
 * Input: id (string or number) — order ID; data (object) — fields to update (e.g. { status: 'shipped' }).
 * Possible outputs:
 *   - { status: 'success', data: order } — order updated; "data" is the updated order.
 *   - { status: 'fail', error: 'Order ID is required' } — id was not provided.
 *   - { status: 'fail', message: 'User does not have permission to do this action' } — not an admin.
 *   - { status: 'fail', message: '...' } — order not found (from API).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function updateOrderById(id, data) {
  if (!id) {
    return { status: 'fail', error: 'Order ID is required' };
  }

  const hasAdminRole = hasRole('admin');
  if (hasAdminRole.status === 'fail') return hasAdminRole;

  return await patch(`orders/${id}`, data);
}

/**
 * Deletes an order by ID.
 * Input: id (string or number) — the order ID to delete.
 * Possible outputs:
 *   - { status: 'success' } — order deleted.
 *   - { status: 'fail', error: 'Order ID is required' } — id was not provided.
 *   - { status: 'fail', message: '...' } — order not found (from API).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
async function deleteOrderById(id, data) {
  if (!id) {
    return { status: 'fail', error: 'Order ID is required' };
  }

  return await remove(`orders/${id}`);
}

/**
 * Gets dashboard statistics: total orders, total revenue, pending orders count, total products count, and customers count. Only admins can call this.
 * Input: none.
 * Possible outputs:
 *   - { status: 'success', data: { totalOrders, totalRevenue, pendingOrders, totalProducts, customers } } — numbers for the dashboard.
 *   - { status: 'fail', message: 'User is not authenticated' } or 'User does not have permission to do this action' — not logged in or not admin.
 */
async function getOrdersStatistics() {
  // Only admins can get statistics
  const isAdmin = hasRole('admin');
  if (isAdmin.status === 'fail') return isAdmin;

  const orders = await getAllOrders();

  const totalOrders = orders.data.length;
  let totalRevenue = 0;
  let pendingOrders = 0;
  orders.data.forEach((order) => {
    if (order.status === 'completed') {
      totalRevenue += order.totalPrice;
    }
    if (order.status === 'pending') pendingOrders++;
  });

  const totalProducts = (await getAllProducts()).data.length;
  const customers = (await getAll('users')).data.length;

  return {
    status: 'success',
    data: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalProducts,
      customers,
    },
  };
}

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderById,
  deleteOrderById,
  getCurrentUserOrders,
  getOrdersStatistics,
};

/**
 * Turns an object of key-value pairs into a URL query string (e.g. { category: 'shoes' } becomes "category=shoes"). Used internally by the API.
 * Input: obj (object) — keys and values are encoded and joined with &.
 * Output: a string like "key=value&foo=bar".
 */
function formQueryString(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Gets a short name for the resource from the endpoint (e.g. "products" from "products/123") so we can use it in error messages. Used internally.
 * Input: endpoint (string) — e.g. "products" or "products/123".
 * Output: a string like "product" or "products" (used in "No product found" type messages).
 */
function getResourceName(endpoint) {
  return endpoint.includes('/')
    ? endpoint.slice(0, endpoint.indexOf('/') - 1)
    : endpoint.slice(0, -1);
}

const API_BASE_URL = 'http://localhost:3000';

/**
 * Sends a GET request to the API and returns the JSON result. Used to fetch one or many items (e.g. products, orders). If the server returns 404 (not found), you get status 'fail' instead of throwing.
 * Input: endpoint (string) — path like "products" or "products/1"; params (object, optional) — query parameters, e.g. { category: 'shoes' }.
 * Possible outputs:
 *   - { status: 'success', data: ... } — request OK; "data" is the response body (object or array).
 *   - { status: 'fail', message: 'No ... found with this ID' } — server returned 404.
 *   - { status: 'error', message: '...' } — something went wrong (e.g. network error, server error).
 */
export async function get(endpoint, params = {}) {
  try {
    const query = formQueryString(params);
    console.log('-------');
    console.log(query);
    const res = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
    // const res = await fetch(`${API_BASE_URL}/${endpoint}`);

    if (!res.ok) {
      if (res.status === 404) {
        // throw new Error(`No ${getResourceName(endpoint)} found with this ID`);
        return {
          status: 'fail',
          message: `No ${getResourceName(endpoint)} found with this ID`,
        };
      }

      throw new Error('Something went wrong!');
    }

    const data = await res.json();

    return { status: 'success', data };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Fetches a single item from the API. If the API returns an array (e.g. when filtering by email), this returns the first item or "fail" if the array is empty.
 * Input: endpoint (string) — path like "users" or "users?email=..."; params (object, optional) — query parameters.
 * Possible outputs:
 *   - { status: 'success', data: object } — one item found; "data" is that item.
 *   - { status: 'fail', message: 'No ... found' } — array was empty or no resource found.
 *   - { status: 'error', message: '...' } — same as get (network/server error).
 */
export async function getOne(endpoint, params) {
  const res = await get(endpoint, params);
  if (res.status !== 'success') return res;

  const resourceName = getResourceName(endpoint);

  if (!Array.isArray(res.data)) return res;

  if (!res.data.length) {
    return {
      status: 'fail',
      message: `No ${resourceName} found`,
    };
  }

  return {
    status: 'success',
    data: { ...res.data[0] },
  };
}

/**
 * Fetches a full list from the API (e.g. all orders, all users). Same as get but typically used without extra query params.
 * Input: endpoint (string) — path like "orders" or "users".
 * Possible outputs:
 *   - { status: 'success', data: array } — list of items.
 *   - { status: 'fail', message: '...' } — not found (e.g. 404).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error).
 */
export async function getAll(endpoint) {
  return await get(endpoint);
}

/**
 * Sends a POST request to create something new (e.g. a user, a product, an order). Sends "data" as JSON in the request body.
 * Input: endpoint (string) — path like "users" or "products"; data (object) — the data to send (e.g. { name, email, password }).
 * Possible outputs:
 *   - { status: 'success', data: object } — item created; "data" is what the server returned (e.g. the new user or product).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error, server error).
 */
export async function post(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resourceName = getResourceName(endpoint);

    if (!res.ok) {
      throw new Error('Something went wrong!');
    }

    const resJson = await res.json();

    return { status: 'success', data: { ...resJson } };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Sends a PATCH request to update an existing item (e.g. change a product's price or an order's status). Only the fields you send in "data" are updated.
 * Input: endpoint (string) — path like "products/1" or "orders/5"; data (object) — the fields to update (e.g. { price: 20, stock: 10 }).
 * Possible outputs:
 *   - { status: 'success', data: object } — item updated; "data" is the updated item.
 *   - { status: 'fail', message: 'No ... found with this ID' } — server returned 404 (item doesn't exist).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error, server error).
 */
export async function patch(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (res.status === 404) {
        // throw new Error(`No ${getResourceName(endpoint)} found with this ID`);
        return {
          status: 'fail',
          message: `No ${getResourceName(endpoint)} found with this ID`,
        };
      }

      throw new Error('Something went wrong!');
    }

    const resJson = await res.json();

    return { status: 'success', data: { ...resJson } };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Sends a DELETE request to remove an item (e.g. delete a product or a cart). If the item doesn't exist (404), you get status 'fail' instead of throwing.
 * Input: endpoint (string) — path like "products/1" or "carts/3".
 * Possible outputs:
 *   - { status: 'success' } — item was deleted.
 *   - { status: 'fail', message: 'No ... found with this ID' } — server returned 404 (item doesn't exist).
 *   - { status: 'error', message: '...' } — request failed (e.g. network error, server error).
 */
export async function remove(endpoint) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return {
          status: 'fail',
          message: `No ${getResourceName(endpoint)} found with this ID`,
        };
      }

      throw new Error('Something went wrong!');
    }

    // const resJson = await res.json();

    return { status: 'success' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

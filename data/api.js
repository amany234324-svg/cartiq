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


function getResourceName(endpoint) {
  return endpoint.includes('/')
    ? endpoint.slice(0, endpoint.indexOf('/') - 1)
    : endpoint.slice(0, -1);
}

const API_BASE_URL = 'http://localhost:3000';

export async function get(endpoint, params = {}) {
  try {
    const query = formQueryString(params);
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

export async function getAll(endpoint, params) {
  return await get(endpoint, params);
}

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

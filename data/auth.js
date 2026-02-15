import { getOne, post } from './api.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

/**
 * Takes a user object and returns the same object but without the password field.
 * Input: any object that may have a "password" property (e.g. user data from the API).
 * Output: a new object with all properties except "password".
 */
function dataWithoutPassword(data) {
  const { password, ...rest } = data;
  return rest;
}

/**
 * Registers a new user (customer) with email, password, and name. If successful, saves a token in the browser so the user is logged in.
 * Input: userData = { email, password, name }.
 * Possible outputs:
 *   - { status: 'success', data: user } — user created and logged in; "data" is the user without password.
 *   - { status: 'fail', message: '...' } — something wrong: invalid email, invalid password, name missing, or email already in use (message explains which).
 */
export async function register(userData) {
  const { email, password, name } = userData;

  const validatedEmail = validateEmail(email);
  if (!validateEmail(email).valid) {
    return { status: 'fail', message: validatedEmail.error };
  }

  const validatedPass = validatePassword(password);
  if (!validatedPass.valid) {
    return { status: 'fail', message: validatedPass.error };
  }

  if (!name) {
    return { status: 'fail', message: 'Name is required' };
  }

  // Check if email already exists
  const existingEmail = await getOne('users', { email });
  if (existingEmail.status === 'success') {
    return { status: 'fail', message: 'Please choose another email' };
  }

  const res = await post('users', { ...userData, role: 'customer' });
  if (res.status !== 'success') return res;

  // Exclude password from response
  const user = dataWithoutPassword(res.data);
  // Create token
  const token = { userId: user.id, role: user.role };
  localStorage.setItem('token', JSON.stringify(token));

  return { status: 'success', data: user };
}

/**
 * Logs in a user with email and password. If correct, saves a token in the browser so the user is logged in.
 * Input: email (string), password (string).
 * Possible outputs:
 *   - { status: 'success', data: user } — login OK; "data" is the user without password.
 *   - { status: 'fail', message: 'Email is required' } — email was not provided.
 *   - { status: 'fail', message: 'Password is required' } — password was not provided.
 *   - { status: 'fail', message: 'Incorrect email or password' } — no user with this email, or wrong password.
 *   - { status: 'error', message: '...' } — something went wrong with the request (e.g. network error).
 */
export async function login(email, password) {
  if (!email) {
    return { status: 'fail', message: 'Email is required' };
  }
  if (!password) {
    return { status: 'fail', message: 'Password is required' };
  }

  const res = await getOne(`users`, { email });
  // const res = await getOne(`users?email=${email}`);
  if (res.status === 'error') return res;

  if (res.status === 'fail') {
    return { status: 'fail', message: 'Incorrect email or password' };
  }

  // Check password
  let user = res.data;
  if (user.password !== password) {
    return { status: 'fail', message: 'Incorrect email or password' };
  }
  user = dataWithoutPassword(user);
  const token = { userId: user.id, role: user.role };
  localStorage.setItem('token', JSON.stringify(token));

  return { status: 'success', data: user };
}

/**
 * Checks if the current visitor is logged in (has a saved token in the browser).
 * Input: none.
 * Possible outputs:
 *   - { status: 'success', token } — user is logged in; "token" contains userId and role.
 *   - { status: 'fail', message: 'User is not authenticated' } — no token found (user not logged in).
 */
export function isAuthenticated() {
  let token = localStorage.getItem('token');
  if (!token) {
    return { status: 'fail', message: 'User is not authenticated' };
  }

  token = JSON.parse(token);

  return { status: 'success', token };
}

/**
 * Gets the full user data for the currently logged-in user (from the saved token).
 * Input: none.
 * Possible outputs:
 *   - { status: 'success', data: user } — user data without password.
 *   - { status: 'fail', message: 'User is not authenticated' } — not logged in (from isAuthenticated).
 *   - { status: 'fail', message: '...' } or { status: 'error', message: '...' } — user not found or request failed (from API).
 */
export async function getCurrentUser() {
  const authenticatedUser = isAuthenticated();
  if (authenticatedUser.status === 'fail') return authenticatedUser;

  const { token } = authenticatedUser;

  const user = await getOne(`users/${token.userId}`);
  if (user.status !== 'success') return user;

  return { status: 'success', data: dataWithoutPassword(user.data) };
}

/**
 * Checks if the currently logged-in user has a specific role (e.g. "admin", "customer").
 * Input: role (string), e.g. 'admin' or 'customer'.
 * Possible outputs:
 *   - { status: 'success' } — user is logged in and has this role.
 *   - { status: 'fail', message: 'User is not authenticated' } — not logged in.
 *   - { status: 'fail', message: 'User does not have permission to do this action' } — logged in but different role.
 */
export function hasRole(role) {
  const authenticatedUser = isAuthenticated();
  if (authenticatedUser.status === 'fail') return authenticatedUser;

  const { token } = authenticatedUser;

  if (token.role !== role.toLowerCase())
    return {
      status: 'fail',
      message: 'User does not have permission to do this action',
    };

  return { status: 'success' };
}

/**
 * Logs out the current user by removing the saved token from the browser.
 * Input: none.
 * Possible outputs:
 *   - { status: 'success' } — token removed successfully.
 *   - { status: 'fail', message: 'User is not authenticated' } — there was no token (user was not logged in).
 */
export function logout() {
  const authenticatedUser = isAuthenticated();
  if (authenticatedUser.status === 'fail') return authenticatedUser;

  localStorage.removeItem('token');

  return { status: 'success' };
}

import { getOne, getAll, post, patch, remove } from './api.js';

export async function getUserById(id) {
  if (!id) {
    return { status: 'fail', error: 'User ID is required' };
  }

  return await getOne(`users/${id}`);
}

async function getAllUsers() {
  return await getAll('users');
}

async function updateUserById(id, data) {
  if (!id) {
    return { status: 'fail', error: 'User ID is required' };
  }

  return await patch(`users/${id}`, data);
}

async function deleteUserById(id, data) {
  if (!id) {
    return { status: 'fail', error: 'User ID is required' };
  }

  return await remove(`users/${id}`);
}

import { fetchFromAPI } from './api';

export const getProfile = () => fetchFromAPI('/auth/profile');

export const updateProfile = (data) =>
  fetchFromAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

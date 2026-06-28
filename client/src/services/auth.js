import api from './api';

const login = async (full_name, password) => {
  const response = await api.post('/auth/login', { full_name, password });
  if (response.data.token) {
    localStorage.setItem('mizigoflow_token', response.data.token);
    localStorage.setItem('mizigoflow_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('mizigoflow_token');
  localStorage.removeItem('mizigoflow_user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('mizigoflow_user');
  return user ? JSON.parse(user) : null;
};

const getToken = () => {
  return localStorage.getItem('mizigoflow_token');
};

const authService = { login, logout, getCurrentUser, getToken };

export default authService;
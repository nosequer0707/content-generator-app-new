import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurar axios para incluir cookies en las solicitudes
  axios.defaults.withCredentials = true;
  
  // URL base para las solicitudes API
  const API_URL = '/api';

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la aplicación
    const checkUserLoggedIn = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.log('No hay usuario autenticado');
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrarse con token de invitación
  const register = async (name, email, password, inviteToken) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { 
        name, 
        email, 
        password, 
        inviteToken 
      });
      if (res.data.success) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrarse');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para validar token de invitación
  const validateInviteToken = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/invites/validate?token=${token}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // Función para generar token de invitación (solo admin)
  const generateInvite = async () => {
    try {
      const res = await axios.post(`${API_URL}/invites/generate`);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // Función para obtener todas las invitaciones (solo admin)
  const getAllInvites = async () => {
    try {
      const res = await axios.get(`${API_URL}/invites`);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        validateInviteToken,
        generateInvite,
        getAllInvites,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

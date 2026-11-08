import { createContext, useContext, useEffect, useState } from 'react'
import * as auth from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(auth.getStoredUser())

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const value = {
    user,
    isAuthed: !!user,
    isStaff: !!user?.is_staff,
    login: async (u, p, admin = false) => setUser(await auth.login(u, p, admin)),
    register: async (u, p, e) => setUser(await auth.register(u, p, e)),
    updateUser: (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u) },
    logout: () => { auth.logout(); setUser(null) },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
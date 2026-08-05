import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabaseClient } from '../services/supabaseClient'
import * as authService from '../services/authService'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    authService.getSession().then(({ session }) => {
      if (active) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const signup = useCallback(async (email, firstName, lastName, password, hospitalId) => {
    setError(null)
    const { user: newUser, error: signupError } = await authService.signup(
      email,
      firstName,
      lastName,
      password,
      hospitalId
    )
    if (signupError) setError(signupError.message)
    return { user: newUser, error: signupError }
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    const { data, error: loginError } = await authService.login(email, password)
    if (loginError) {
      setError(loginError.message)
    } else {
      setUser(data.user)
    }
    return { data, error: loginError }
  }, [])

  const verifyOTP = useCallback(async (email, token) => {
    setError(null)
    const { data, error: otpError } = await authService.verifyOTP(email, token)
    if (otpError) {
      setError(otpError.message)
    } else {
      setUser(data.user)
    }
    return { data, error: otpError }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    verifyOTP,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

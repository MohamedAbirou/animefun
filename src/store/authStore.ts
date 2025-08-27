import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  isApproved: boolean
  checkSession: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean, error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<{ success: boolean, error?: string }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAdmin: false,
  isApproved: false,
  
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch admin profile using maybeSingle() to handle no results gracefully
        const { data: profile, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          
        if (error) throw error
        
        set({ 
          user: session.user,
          isAdmin: !!profile,
          isApproved: profile?.approved || false,
          isLoading: false
        })
      } else {
        set({ user: null, isAdmin: false, isApproved: false, isLoading: false })
      }
    } catch (error) {
      console.error('Session check error:', error)
      set({ user: null, isAdmin: false, isApproved: false, isLoading: false })
    }
  },
  
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Check if user is an admin and is approved
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()
          
        if (profileError) throw profileError
        
        set({ 
          user: data.user,
          isAdmin: !!profile,
          isApproved: profile?.approved || false,
          isLoading: false
        })
        
        if (!profile) {
          await get().logout()
          return { success: false, error: 'Not authorized as admin' }
        }
        
        if (!profile.approved) {
          return { success: true, error: 'Account pending approval' }
        }
        
        toast.success('Login successful')
        return { success: true }
      }
      
      return { success: false, error: 'Unknown error' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false, isApproved: false })
    toast.success('Logged out successfully')
  },
  
  register: async (email, password) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      if (!data.user) {
        return { success: false, error: 'User registration failed' }
      }

      // Create the user record first
     // 1. Insert into users and await confirmation
      const { error: usersError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email: data.user.email }])
        .select() // this ensures you wait for the insert to complete and return the inserted row(s)
      
      if (usersError) {
        console.error('Users table insert error:', usersError)
        await supabase.auth.signOut()
        return { success: false, error: 'Failed to create user profile' }
      }
      
      // 2. Now insert into admin_profiles
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          approved: false
        }])
      
      if (profileError) {
        console.error('Admin profile insert error:', profileError)
        await supabase.auth.signOut()
        return { success: false, error: 'Failed to create admin profile' }
      }

      
      set({ 
        user: data.user,
        isAdmin: true,
        isApproved: false,
        isLoading: false
      })
      
      toast.success('Registration successful. Please wait for approval.')
      return { success: true }
    } catch (error: any) {
      console.error('Register error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }
}))

// Initialize auth state on app load
supabase.auth.onAuthStateChange(async () => {
  useAuthStore.getState().checkSession()
})
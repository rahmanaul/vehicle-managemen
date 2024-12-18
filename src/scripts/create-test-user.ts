import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'rahmannauliaaa@gmail.com',
      password: 'admin123',
    })

    if (error) {
      console.error('Error creating user:', error.message)
      return
    }

    console.log('User created successfully:', data)
  } catch (err) {
    console.error('Error:', err)
  }
}

createTestUser()

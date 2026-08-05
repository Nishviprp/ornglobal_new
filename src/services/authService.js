import { supabaseClient } from './supabaseClient'

function describeProfileError(error) {
  const message = error?.message || ''

  if (error?.code === '23505' || message.includes('duplicate key')) {
    return 'An account with this email already exists.'
  }
  if (error?.code === '23503' || message.includes('foreign key')) {
    return 'The selected hospital is no longer available. Please choose another one.'
  }
  if (error?.code === '42501' || message.toLowerCase().includes('row-level security')) {
    return 'We could not finish setting up your account (permission denied). Please contact support.'
  }

  return message || 'Could not finish setting up your account. Please try again.'
}

export async function signup(email, firstName, lastName, password, hospitalId) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  })

  if (error) {
    return { user: null, error }
  }

  const userId = data.user?.id
  if (!userId) {
    return { user: null, error: { message: 'Signup did not return a user. Please try again.' } }
  }

  try {
    // A database trigger (see supabase/migrations) creates a placeholder
    // public.users row the instant auth.signUp() creates the auth.users row,
    // before this code ever runs. Upsert (not insert) so this call overwrites
    // that placeholder with the real values the user submitted, instead of
    // failing on a duplicate-key conflict.
    const { error: insertError } = await supabaseClient.from('users').upsert(
      {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        hospital_id: hospitalId,
        role: 'nurse',
      },
      { onConflict: 'id' }
    )

    if (insertError) {
      return { user: data.user, error: { message: describeProfileError(insertError) } }
    }
  } catch (unexpectedError) {
    return { user: data.user, error: { message: describeProfileError(unexpectedError) } }
  }

  return { user: data.user, error: null }
}

export async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function verifyOTP(email, token) {
  const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: 'email' })
  return { data, error }
}

export async function resendOTP(email) {
  const { data, error } = await supabaseClient.auth.resend({ type: 'signup', email })
  return { data, error }
}

export async function logout() {
  const { error } = await supabaseClient.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser()
  return { user: data?.user ?? null, error }
}

export async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession()
  return { session: data?.session ?? null, error }
}

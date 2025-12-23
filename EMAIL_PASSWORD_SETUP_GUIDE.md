# Email Password Setup & Reset Guide

This guide explains how the email-based password reset and user invitation system works in this project, so you can implement it in another project.

## Overview

The system uses **Supabase Auth** to handle email sending and password management. There are two main flows:

1. **Password Reset Flow** - For existing users who forgot their password
2. **User Invitation Flow** - For new users who need to set up their account

## Architecture

### Key Components

1. **Supabase Auth** - Handles email sending, token generation, and session management
2. **Callback Route** (`/auth/callback`) - Processes email links and establishes sessions
3. **Password Reset Page** (`/auth/reset-password`) - Allows users to set a new password
4. **Password Setup Page** (`/auth/setup-password`) - Allows invited users to create their password
5. **API Routes** - Handle password reset requests and user invitations

---

## Flow 1: Password Reset (Forgot Password)

### Step-by-Step Process

1. **User requests password reset** → `/auth/forgot-password` page
2. **API sends reset email** → `/api/auth/forgot-password` route
3. **User clicks email link** → Supabase redirects to `/auth/callback?code=...&type=recovery`
4. **Callback processes token** → Exchanges code for session, redirects to `/auth/reset-password`
5. **User sets new password** → Submits form, password is updated

### Implementation

#### 1. Forgot Password API Route

```typescript
// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get your site URL from environment variable
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    
    // Redirect URL where user will land after clicking email link
    const redirectUrl = `${siteUrl}/auth/reset-password`

    // Supabase automatically sends the email with reset link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error('Password reset error:', error)
      // Don't reveal whether email exists for security
    }

    // Always return success message (don't reveal if email exists)
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link shortly.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
```

#### 2. Callback Route (Handles Email Link)

```typescript
// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") // "recovery" for password reset

  if (code) {
    try {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )

      // Exchange the code from email link for a session
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(requestUrl.origin + `/auth/reset-password?error=expired_link`)
      }

      if (user) {
        // If password reset flow, redirect to reset password page
        if (type === 'recovery') {
          const response = NextResponse.redirect(requestUrl.origin + "/auth/reset-password")
          // Ensure cookies are set
          cookieStore.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value)
          })
          return response
        }
      }
    } catch (error) {
      console.error("Error in callback:", error)
      return NextResponse.redirect(requestUrl.origin)
    }
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

#### 3. Reset Password Page (Frontend)

```typescript
// src/app/auth/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Verify user has a valid session from the email link
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Please use the password reset link from your email.')
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Verify session exists
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expired. Please use the password reset link again.')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password')
      }

      // Success - redirect to login
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
```

---

## Flow 2: User Invitation (New User Setup)

### Step-by-Step Process

1. **Admin creates user** → Calls `/api/admin/users` with email and user details
2. **API sends invitation email** → Uses `inviteUserByEmail()` which automatically sends email
3. **User clicks email link** → Supabase redirects to `/auth/callback?code=...&type=invite`
4. **Callback processes token** → Exchanges code for session, redirects to `/auth/setup-password`
5. **User sets password** → Submits form, password is created

### Implementation

#### 1. User Invitation API Route

```typescript
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin' // Admin client with service role key

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Admin client not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, firstName, lastName, role = 'trainee' } = body

    // Validate input
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Get callback URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectTo = `${siteUrl}/auth/callback`

    // This creates the user AND sends invitation email automatically
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectTo,
        data: {
          role: role,
          first_name: firstName,
          last_name: lastName,
        },
      }
    )

    if (inviteError) {
      if (inviteError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create user and send invitation' },
        { status: 500 }
      )
    }

    // Create user record in your database
    const { error: userError } = await adminSupabase
      .from('users')
      .upsert({
        id: inviteData.user.id,
        email: inviteData.user.email,
        role: role,
        first_name: firstName,
        last_name: lastName,
      }, {
        onConflict: 'id'
      })

    return NextResponse.json({
      success: true,
      data: {
        id: inviteData.user.id,
        email: inviteData.user.email,
        role: role,
      },
      message: 'User created successfully. An invitation email has been sent.'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

#### 2. Update Callback Route for Invitations

Add this to your callback route:

```typescript
// In src/app/auth/callback/route.ts
if (user) {
  // ... existing password reset code ...

  // If this is an invitation flow, redirect to password setup page
  if (type === 'invite') {
    const finalResponse = NextResponse.redirect(requestUrl.origin + "/auth/setup-password?type=invite")
    cookieStore.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })
    return finalResponse
  }
}
```

#### 3. Setup Password Page

```typescript
// src/app/auth/setup-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Verify user has a valid session from invitation
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please use the invitation link from your email.')
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Verify session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Session expired. Please use the invitation link again.')
      }

      // Set password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw new Error(updateError.message || 'Failed to set password')
      }

      // Success - redirect based on role
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1>Set Up Your Account</h1>
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Setting Password...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
```

---

## Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations

# Site URL (for email redirects)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # Production URL
# Or use http://localhost:3000 for development
```

---

## Supabase Configuration

### 1. Email Templates

Supabase sends emails automatically, but you can customize them:

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Customize:
   - **Reset Password** template
   - **Invite User** template

### 2. Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 3. JWT Expiration

1. Go to **Supabase Dashboard** → **Authentication** → **Settings** → **Advanced Settings**
2. Set **JWT expiry** (default is 3600 seconds = 1 hour)
   - For longer expiration: `86400` = 24 hours

---

## Key Points

### How Email Sending Works

1. **Supabase handles all email sending** - You don't need to configure SMTP or email services
2. **Automatic email generation** - Supabase generates secure links with tokens
3. **Token-based authentication** - Links contain codes that are exchanged for sessions

### Security Features

1. **Rate limiting** - Implement rate limiting on API routes to prevent abuse
2. **Generic error messages** - Don't reveal if an email exists in the system
3. **Session validation** - Always verify sessions before allowing password changes
4. **Token expiration** - Tokens expire after a set time (configurable in Supabase)

### Hash vs Code-Based Tokens

- **Code-based** (PKCE): Used in callback route, expires quickly (5-10 minutes)
- **Hash-based**: Used in direct redirects, stored in URL hash (`#access_token=...`)
- This project uses **hash-based tokens** for password reset to avoid quick expiration issues

---

## Testing

### Test Password Reset Flow

1. Go to `/auth/forgot-password`
2. Enter an email address
3. Check email inbox (or Supabase logs)
4. Click the reset link
5. Should redirect to `/auth/reset-password`
6. Set new password
7. Should be able to login with new password

### Test User Invitation Flow

1. Call `/api/admin/users` POST endpoint with:
   ```json
   {
     "email": "newuser@example.com",
     "firstName": "John",
     "lastName": "Doe",
     "role": "trainee"
   }
   ```
2. Check email inbox
3. Click invitation link
4. Should redirect to `/auth/setup-password`
5. Set password
6. Should be able to login

---

## Troubleshooting

### Email not received
- Check Supabase Dashboard → Authentication → Users → Check if user exists
- Check Supabase logs for email sending errors
- Verify email templates are configured
- Check spam folder

### "Session expired" errors
- Increase JWT expiry time in Supabase settings
- Ensure callback route properly exchanges code for session
- Check that cookies are being set correctly

### Redirect URL errors
- Verify redirect URLs are whitelisted in Supabase Dashboard
- Ensure `NEXT_PUBLIC_SITE_URL` matches your actual domain
- Check that callback route exists and is accessible

---

## Summary

The email password system works by:

1. **Supabase sends emails automatically** when you call:
   - `resetPasswordForEmail()` for password resets
   - `inviteUserByEmail()` for new user invitations

2. **Email links contain secure tokens** that redirect to your callback route

3. **Callback route exchanges tokens for sessions** and redirects to appropriate page

4. **User sets password** on the reset/setup page using their authenticated session

5. **No custom email service needed** - Supabase handles everything!

This is a secure, production-ready approach that leverages Supabase's built-in authentication system.


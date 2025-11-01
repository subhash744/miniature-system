# Authentication Flow in REGEO

## Overview

REGEO uses Supabase Auth for user authentication with email and password. The authentication flow is designed to be secure and user-friendly.

## Authentication Flow

### 1. Sign Up
1. User enters email and password in the sign-up form
2. Email domain is validated (only @gmail.com and @icloud.com allowed)
3. Supabase creates a new user account
4. Verification email is sent to the user
5. User clicks verification link which redirects to `/auth/callback`
6. Token is verified and user is redirected to profile creation

### 2. Sign In
1. User enters email and password in the sign-in form
2. Supabase validates credentials
3. If valid, user session is created
4. User is redirected to the dashboard

### 3. Session Management
1. User session is stored in Supabase Auth
2. Session is automatically refreshed when needed
3. On page load, the app checks for existing session
4. If session exists, user is authenticated automatically

### 4. Sign Out
1. User clicks sign out button
2. Supabase session is terminated
3. User is redirected to the home page

## Security Features

- Email verification required for new accounts
- Password strength enforced by Supabase
- Session tokens are securely stored
- Automatic session refresh
- Row Level Security (RLS) in Supabase database

## Environment Variables

The authentication system requires the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Auth Configuration

The Supabase project should be configured with:

1. Email authentication enabled
2. Email confirmation enabled
3. Secure password requirements
4. Appropriate RLS policies for database tables

## Error Handling

Common authentication errors are handled gracefully:

- Invalid email/password combinations
- Email already in use
- Weak passwords
- Network connectivity issues
- Session expiration

## Testing Authentication

To test the authentication flow:

1. Create a new account with a valid email
2. Check email for verification link
3. Click verification link
4. Complete profile creation
5. Sign out and sign back in
6. Verify session persistence

## Troubleshooting

### Common Issues

1. **Verification email not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check Supabase email settings

2. **Unable to sign in**
   - Verify account is confirmed
   - Check email and password
   - Ensure network connectivity

3. **Session not persisting**
   - Check browser storage settings
   - Verify Supabase configuration
   - Clear browser cache and cookies

### Debugging

Enable debug logging by setting:

```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

This will output additional information to the browser console.
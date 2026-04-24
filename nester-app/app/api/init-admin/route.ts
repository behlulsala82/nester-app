import { createSupabaseServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createSupabaseServer()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  try {
    // 1. Try to create the user in Auth
    const adminEmail = 'admin@nester.com'
    const adminPass = 'Admin123!'

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPass,
    })

    if (signUpError) {
      // If user already exists, it might error. Check that case.
      if (signUpError.message.includes('already registered')) {
        return NextResponse.json({ 
          message: 'Admin already exists, connection is GOOD.',
          email: adminEmail 
        })
      }
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Admin user created successfully!',
      user: data.user?.email,
      connection: 'SUCCESS'
    })

  } catch (err: unknown) {
    return NextResponse.json({ 
      error: 'Unexpected error during connection test',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}

import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { signOut } from '@/services/auth.service'

export async function UserNav() {
  const supabase = createSupabaseServer()

  if (!supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/login"
          className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        {user.email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm font-medium text-destructive hover:underline transition-colors"
        >
          Log Out
        </button>
      </form>
    </div>
  )
}

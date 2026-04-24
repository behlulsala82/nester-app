import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createSupabaseServer()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Welcome to <span className="text-primary">Nester</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          A production-ready foundation for your next big project. Built with Next.js 14, TypeScript, and clean architecture principles.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {user ? "View Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View Documentation
          </Link>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xl font-bold mb-2">Modern Stack</h3>
          <p className="text-muted-foreground">Next.js 14, App Router, TypeScript, and TailwindCSS for the best developer experience.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xl font-bold mb-2">Auth Integrated</h3>
          <p className="text-muted-foreground">Supabase authentication pre-configured with server-side session handling and route protection.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xl font-bold mb-2">Dark Mode Ready</h3>
          <p className="text-muted-foreground">Seamless light and dark mode integration using next-themes and CSS variables.</p>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserNav } from './user-nav'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-primary">Nester</span>
        </Link>
        <div className="flex items-center space-x-4">
          <UserNav />
          <div className="border-l pl-4 flex items-center h-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

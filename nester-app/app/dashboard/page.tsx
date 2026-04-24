import { createSupabaseServer } from '@/lib/supabase/server'
import { OrderForm } from '@/components/orders/order-form'

export default async function DashboardPage() {
  const supabase = createSupabaseServer()

  if (!supabase) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Supabase Not Configured</h1>
        <p className="text-muted-foreground mt-2">Please update your .env.local file with Supabase credentials.</p>
      </div>
    )
  }

  await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">New Optimization Order</h1>
        <p className="text-muted-foreground">Configure your board dimensions and add the pieces you need to cut.</p>
      </div>

      <OrderForm />
    </div>
  )
}

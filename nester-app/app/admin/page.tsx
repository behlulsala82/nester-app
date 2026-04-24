import { getOrders } from '@/services/order.service'
import { OrderList } from '@/components/admin/order-list'
import { LayoutDashboard, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const orders = await getOrders()

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-primary mb-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Order History</h1>
          <p className="text-muted-foreground mt-1">Manage and export your cutting optimization orders.</p>
        </div>

        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Optimization
        </Link>
      </header>

      <div className="pt-4">
        <OrderList orders={orders} />
      </div>
    </div>
  )
}

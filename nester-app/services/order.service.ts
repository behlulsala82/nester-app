'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type PieceInsert = Database['public']['Tables']['pieces']['Insert']

interface OrderData {
  material: string
  board_width: number
  board_height: number
  total_sheets: number
  waste_percent: number
  efficiency_score: number
  selected_strategy: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placements_data: any
  pieces: {
    width: number
    height: number
    quantity: number
    rotation: boolean
    edge_top: boolean
    edge_bottom: boolean
    edge_left: boolean
    edge_right: boolean
  }[]
}

export async function saveOrder(data: OrderData) {
  const supabase = createSupabaseServer()
  if (!supabase) return { error: 'Supabase not configured' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to save orders' }

  try {
    // 1. Insert into 'orders' table
    const orderPayload: OrderInsert = {
      user_id: user.id,
      material: material_standardize(data.material),
      board_width: data.board_width,
      board_height: data.board_height,
      total_sheets: data.total_sheets,
      waste_percent: data.waste_percent,
      efficiency_score: data.efficiency_score,
      selected_strategy: data.selected_strategy,
      placements_data: data.placements_data
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(orderPayload as any)
      .select()
      .single()

    if (orderError || !order) throw orderError || new Error("Order not created")

    // 2. Insert pieces with the new order_id
    const piecesToInsert: PieceInsert[] = data.pieces.map(p => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order_id: (order as any).id,
      ...p
    }))

    const { error: piecesError } = await supabase
      .from('pieces')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(piecesToInsert as any)

    if (piecesError) throw piecesError

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, orderId: (order as any).id }

  } catch (error: unknown) {
    console.error('Save Order Error:', error)
    return { error: (error as Error).message || 'Failed to save order' }
  }
}

function material_standardize(m: string) {
  return m || 'Standard'
}

export async function getOrders() {
  const supabase = createSupabaseServer()
  if (!supabase) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, pieces(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch Orders Error:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return orders as any[]
}

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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        material: data.material,
        board_width: data.board_width,
        board_height: data.board_height,
        total_sheets: data.total_sheets,
        waste_percent: data.waste_percent
      } as OrderInsert)
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Insert pieces with the new order_id
    const piecesToInsert: PieceInsert[] = data.pieces.map(p => ({
      order_id: order.id,
      ...p
    }))

    const { error: piecesError } = await supabase
      .from('pieces')
      .insert(piecesToInsert)

    if (piecesError) throw piecesError

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true, orderId: order.id }

  } catch (error: any) {
    console.error('Save Order Error:', error)
    return { error: error.message || 'Failed to save order' }
  }
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

  return orders
}

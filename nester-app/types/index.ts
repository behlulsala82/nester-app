export interface User {
  id: string
  name: string
  email: string
}

export interface Placement {
  x: number
  y: number
  width: number
  height: number
  bin_index: number
}

export interface LayoutOption {
  type: string
  score: number
  total_sheets: number
  waste_percent: number
  used_area: number
  waste_area: number
  efficiency_score: number
  cut_lines_count: number
  max_cut_length: number
  placements: Placement[]
  description: string
}

export interface PieceInput {
  id: string
  width: string
  height: string
  quantity: string
  rotation: boolean
  edge_top: boolean
  edge_bottom: boolean
  edge_left: boolean
  edge_right: boolean
}

export interface OptimizationResult {
  layouts: LayoutOption[]
  best_layout: LayoutOption
}

import rectpack
from typing import List, Dict

def normalize_pieces(pieces: List[Dict]) -> List[Dict]:
    normalized = []
    for p in pieces:
        w, h = p['width'], p['height']
        if p.get('rotation', True):
            new_w, new_h = min(w, h), max(w, h)
        else:
            new_w, new_h = w, h
        normalized.append({**p, 'width': new_w, 'height': new_h})
    return normalized

def expand_pieces(pieces: List[Dict]) -> List[Dict]:
    expanded = []
    for p in pieces:
        for _ in range(p['quantity']):
            expanded.append({'width': p['width'], 'height': p['height']})
    return expanded

def calculate_metrics(placements, bw, bh, flat_pieces, layout_type):
    if not placements: return None
    total_sheets = max(p['bin_index'] for p in placements) + 1
    total_board_area = total_sheets * (bw * bh)
    
    # Calculate area only for pieces that WERE placed to avoid negative waste
    placed_piece_area = sum(p['width'] * p['height'] for p in placements)
    
    # Total input piece area for comparison
    total_input_area = sum(p['width'] * p['height'] for p in flat_pieces)
    
    waste_percent = round(((total_board_area - placed_piece_area) / total_board_area * 100), 2)
    
    x_cuts = {p['x'] for p in placements} | {p['x']+p['width'] for p in placements}
    y_cuts = {p['y'] for p in placements} | {p['y']+p['height'] for p in placements}
    cut_lines = len([x for x in x_cuts if 0 < x < bw]) + len([y for y in y_cuts if 0 < y < bh])
    
    desc = {
        'horizontal-priority': 'Side-by-side placement prioritizing width conservation.',
        'vertical-priority': 'Stacked column placement prioritizing height conservation.',
        'compact-block': 'Aggressive 2D packing to minimize wasted space.',
        'strip-mode': 'Forced strip layout for simplified manual cutting.',
        'rotated-board': 'Strategic rotation to find alternative optimal fits.'
    }

    return {
        "type": layout_type,
        "score": round((total_sheets * 1000) + (waste_percent * 10) + (cut_lines * 2), 2),
        "total_sheets": total_sheets,
        "waste_percent": abs(waste_percent), # Ensure no negative values
        "used_area": round(placed_piece_area, 2),
        "waste_area": round(total_board_area - placed_piece_area, 2),
        "efficiency_score": round(100 - abs(waste_percent), 2),
        "cut_lines_count": cut_lines,
        "max_cut_length": max(bw, bh),
        "placements": placements,
        "description": desc.get(layout_type, 'Optimized layout.')
    }

def solve_horizontal(pieces, bw, bh):
    packer = rectpack.newPacker(rotation=False, pack_algo=rectpack.MaxRectsBl)
    packer.add_bin(bw, bh, count=float('inf'))
    for p in pieces: packer.add_rect(p['width'], p['height'])
    packer.pack()
    return [{"x": r.x, "y": r.y, "width": r.width, "height": r.height, "bin_index": bi} for bi, b in enumerate(packer) for r in b]

def solve_vertical(pieces, bw, bh):
    packer = rectpack.newPacker(rotation=False, pack_algo=rectpack.MaxRectsBssf)
    packer.add_bin(bw, bh, count=float('inf'))
    for p in pieces: packer.add_rect(p['width'], p['height'])
    packer.pack()
    return [{"x": r.x, "y": r.y, "width": r.width, "height": r.height, "bin_index": bi} for bi, b in enumerate(packer) for r in b]

def solve_compact(pieces, bw, bh):
    packer = rectpack.newPacker(rotation=True, pack_algo=rectpack.MaxRectsBssf)
    packer.add_bin(bw, bh, count=float('inf'))
    for p in pieces: packer.add_rect(p['width'], p['height'])
    packer.pack()
    return [{"x": r.x, "y": r.y, "width": r.width, "height": r.height, "bin_index": bi} for bi, b in enumerate(packer) for r in b]

def solve_strip(pieces, bw, bh):
    """Refined Multi-Sheet Strip Layout Algorithm."""
    placements = []
    # Sort pieces to group by width primarily
    sorted_p = sorted(pieces, key=lambda x: (x['width'], x['height']), reverse=True)
    
    current_bin = 0
    while sorted_p:
        x = 0
        columns = []
        # Fit as many columns as possible into ONE bin
        remaining_in_bin = []
        while sorted_p:
            p = sorted_p[0]
            # Try to start a new column
            if x + p['width'] <= bw:
                col_w = p['width']
                y = 0
                # Fill this column vertically
                temp_p_list = []
                for p_candidate in sorted_p[:]:
                    if p_candidate['width'] == col_w and y + p_candidate['height'] <= bh:
                        placements.append({
                            "x": x, "y": y, 
                            "width": p_candidate['width'], "height": p_candidate['height'], 
                            "bin_index": current_bin
                        })
                        y += p_candidate['height']
                        sorted_p.remove(p_candidate)
                x += col_w
            else:
                # This piece doesn't fit in current bin's remaining width
                # Move to next bin or wait
                break
        
        # If we couldn't place any more pieces in this bin, move to next
        current_bin += 1
        if current_bin > 50: break # Safety break
        
    return placements

def perform_bin_packing(board_width: float, board_height: float, pieces: List[Dict]):
    norm_pieces = normalize_pieces(pieces)
    flat_pieces = expand_pieces(norm_pieces)
    if not flat_pieces: return {"layouts": [], "best_layout": None}

    strategies = [
        ('horizontal-priority', solve_horizontal(flat_pieces, board_width, board_height)),
        ('vertical-priority', solve_vertical(flat_pieces, board_width, board_height)),
        ('compact-block', solve_compact(flat_pieces, board_width, board_height)),
        ('strip-mode', solve_strip(flat_pieces, board_width, board_height)),
        ('rotated-board', None)
    ]
    
    r_placements = solve_compact(flat_pieces, board_height, board_width)
    strategies[4] = ('rotated-board', [{"x":p['y'],"y":p['x'],"width":p['height'],"height":p['width'],"bin_index":p['bin_index']} for p in r_placements])

    results = []
    for name, placements in strategies:
        if placements:
            metrics = calculate_metrics(placements, board_width, board_height, flat_pieces, name)
            if metrics: results.append(metrics)
    
    if not results: return {"layouts": [], "best_layout": None}
    
    valid_results = sorted(results, key=lambda x: x['score'])
    return {
        "layouts": valid_results,
        "best_layout": valid_results[0]
    }

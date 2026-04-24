from pydantic import BaseModel
from typing import List, Optional, Any

class PieceRequest(BaseModel):
    width: float
    height: float
    quantity: int
    rotation: bool = True

class OptimizationRequest(BaseModel):
    board_width: float
    board_height: float
    pieces: List[PieceRequest]

class PlacedPiece(BaseModel):
    x: float
    y: float
    width: float
    height: float
    bin_index: int

class LayoutOption(BaseModel):
    type: str # 'horizontal-priority', 'vertical-priority', etc.
    score: float
    total_sheets: int
    waste_percent: float
    used_area: float
    waste_area: float
    efficiency_score: float
    cut_lines_count: int
    max_cut_length: float
    placements: List[PlacedPiece]
    description: str

class OptimizationResponse(BaseModel):
    layouts: List[LayoutOption]
    best_layout: Optional[LayoutOption] = None

class PDFExportRequest(BaseModel):
    board_width: float
    board_height: float
    placements: List[Any]
    metrics: Any
    material: str = "Standard Material"

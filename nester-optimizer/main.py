from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.schemas import OptimizationRequest, OptimizationResponse, PDFExportRequest
from app.optimizer import perform_bin_packing
from app.pdf_generator import generate_cutting_pdf
import uvicorn

app = FastAPI(title="Nester Optimizer API")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizationRequest):
    try:
        results = perform_bin_packing(
            request.board_width,
            request.board_height,
            [p.model_dump() for p in request.pieces]
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export/pdf")
async def export_pdf(request: PDFExportRequest):
    try:
        pdf_buffer = generate_cutting_pdf(
            request.board_width,
            request.board_height,
            request.placements,
            request.metrics,
            request.material
        )
        
        filename = f"nester-cutting-plan.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"PDF Error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

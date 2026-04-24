import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Table, TableStyle

def generate_cutting_pdf(board_width, board_height, placements, metrics, material="Standard Material"):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width_a4, height_a4 = A4
    
    # QR Code generation
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data("https://nester.ai/project/cutting-plan") 
    qr.make(fit=True)
    img_qr = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = io.BytesIO()
    img_qr.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)

    # Group placements by bin
    bins = {}
    for item in placements:
        idx = item.get('bin_index', 0)
        if idx not in bins: bins[idx] = []
        bins[idx].append(item)
    
    bin_indices = sorted(bins.keys())
    total_sheets_count = len(bin_indices)
    
    for idx in bin_indices:
        sheet_placements = bins[idx]
        
        # Header Info
        p.setFont("Helvetica-Bold", 16)
        p.drawString(20*mm, height_a4 - 20*mm, "NESTER CUTTING PLAN")
        
        p.setFont("Helvetica", 9)
        p.setFillColor(colors.grey)
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        p.drawString(20*mm, height_a4 - 25*mm, f"Date: {date_str} | Material: {material}")
        
        # Summary Box
        p.setStrokeColor(colors.lightgrey)
        p.rect(142*mm, height_a4 - 35*mm, 48*mm, 25*mm, fill=0)
        p.setFont("Helvetica-Bold", 7)
        p.setFillColor(colors.black)
        p.drawString(145*mm, height_a4 - 15*mm, f"EFFICIENCY: {metrics.get('efficiency_score', 0):.1f}%")
        p.setFont("Helvetica", 7)
        p.drawString(145*mm, height_a4 - 20*mm, f"SHEETS: {total_sheets_count}")
        p.drawString(145*mm, height_a4 - 24*mm, f"WASTE: {metrics.get('waste_percent', 0):.1f}%")
        
        from reportlab.lib.utils import ImageReader
        p.drawImage(ImageReader(qr_buffer), 175*mm, height_a4 - 33*mm, width=12*mm, height=12*mm)

        p.setFont("Helvetica-Bold", 13)
        p.setFillColor(colors.black)
        p.drawString(20*mm, height_a4 - 42*mm, f"SHEET #{idx + 1}")

        # --- DRAWING AREA ---
        m_width = 160 * mm
        m_height = 125 * mm
        scale = min(m_width / board_width, m_height / board_height) * 0.92
        
        offset_x = 30 * mm 
        offset_y = (height_a4 / 2) - ((board_height * scale) / 2) + 15*mm
        
        # 1. Outer Dimensions (Arrows & Text)
        p.setStrokeColor(colors.grey)
        p.setLineWidth(0.3)
        p.setFont("Helvetica-Bold", 8)
        p.setFillColor(colors.HexColor("#64748b")) 

        # Horizontal Dimension (Width)
        p.line(offset_x, offset_y - 12*mm, offset_x + board_width * scale, offset_y - 12*mm)
        p.drawCentredString(offset_x + (board_width * scale)/2, offset_y - 16*mm, f"{int(board_width)} mm")
        p.line(offset_x, offset_y - 14*mm, offset_x, offset_y - 10*mm)
        p.line(offset_x + board_width * scale, offset_y - 14*mm, offset_x + board_width * scale, offset_y - 10*mm)

        # Vertical Dimension (Height)
        p.saveState()
        p.translate(offset_x - 14*mm, offset_y + (board_height * scale)/2)
        p.rotate(90)
        p.line(-(board_height * scale)/2, 0, (board_height * scale)/2, 0)
        p.drawCentredString(0, 3*mm, f"{int(board_height)} mm")
        p.line(-(board_height * scale)/2, -2*mm, -(board_height * scale)/2, 2*mm)
        p.line((board_height * scale)/2, -2*mm, (board_height * scale)/2, 2*mm)
        p.restoreState()

        # 2. Draw Main Plate
        p.setStrokeColor(colors.black)
        p.setLineWidth(1)
        p.setFillColor(colors.HexColor("#f1f5f9")) 
        p.rect(offset_x, offset_y, board_width * scale, board_height * scale, fill=1, stroke=1)
        
        # 3. Draw Pieces
        for item in sheet_placements:
            px, py = item['x'] * scale, item['y'] * scale
            pw, ph = item['width'] * scale, item['height'] * scale
            p.setStrokeColor(colors.black)
            p.setFillColor(colors.HexColor("#3b82f6")) 
            p.rect(offset_x + px, offset_y + py, pw, ph, fill=1, stroke=1)
            
            if pw > 25 and ph > 10:
                p.setFillColor(colors.white)
                fs = min(7, pw/6)
                p.setFont("Helvetica-Bold", fs if fs > 4 else 4)
                label = f"{int(item['width'])}x{int(item['height'])}"
                p.drawCentredString(offset_x + px + pw/2, offset_y + py + ph/2 - 1, label)

        # Piece List Table
        p.setFont("Helvetica-Bold", 9)
        p.setFillColor(colors.black)
        p.drawString(20*mm, 52*mm, f"PIECE LIST")
        
        data = [["ID", "DIMENSIONS", "POSITION"]]
        for sub_idx, item in enumerate(sheet_placements):
            data.append([f"#{sub_idx+1}", f"{int(item['width'])} x {int(item['height'])}", f"({int(item['x'])}, {int(item['y'])})"])
        
        t_height = min(40*mm, len(data) * 5 * mm)
        t = Table(data, colWidths=[15*mm, 50*mm, 50*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ]))
        
        t.wrapOn(p, width_a4, height_a4)
        t.drawOn(p, 20*mm, 50*mm - t_height) 

        # Footer
        p.setFont("Helvetica-Oblique", 6)
        p.setFillColor(colors.lightgrey)
        p.drawString(20*mm, 10*mm, f"Generated by NESTER AI | Page {idx+1} of {total_sheets_count}")
        
        p.showPage()
    
    p.save()
    buffer.seek(0)
    return buffer

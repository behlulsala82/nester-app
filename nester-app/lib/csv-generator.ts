export interface CSVPieceInput {
  width: number
  height: number
  quantity: number
  thickness: number
  material: string
  edges: {
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
  }
  label: string
}

export function generatePanelCSV(pieces: CSVPieceInput[]): string {
  const headers = [
    'SIRA NO', 
    'BOY', 
    'EN', 
    'KALINLIK', 
    'ADET', 
    'CNC', 
    'RENK', 
    'DESEN', 
    'PVC_B1', 
    'PVC_B2', 
    'PVC_E1', 
    'PVC_E2', 
    'ACIKLAMA'
  ]

  const rows = pieces.map((p, index) => {
    return [
      index + 1,                     // SIRA NO
      p.height,                      // BOY
      p.width,                       // EN
      p.thickness,                   // KALINLIK
      p.quantity,                    // ADET
      '',                            // CNC (Empty)
      `"${p.material}"`,             // RENK
      '0',                           // DESEN
      p.edges.left ? '0.8' : '',     // PVC_B1 (Left)
      p.edges.right ? '0.8' : '',    // PVC_B2 (Right)
      p.edges.top ? '0.8' : '',      // PVC_E1 (Top)
      p.edges.bottom ? '0.8' : '',   // PVC_E2 (Bottom)
      `"${p.label || ''}"`           // ACIKLAMA
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

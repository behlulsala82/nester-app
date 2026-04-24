# 🛠 Nester Cutting SaaS: Teknik Dokümantasyon ve Mimari Analiz

Bu doküman, Nester projesinin tüm teknik katmanlarını, kullanılan algoritmaları ve teknoloji yığınını başka bir AI modelinin (Gemini vb.) projeyi derinlemesine anlaması için özetler.

---

## 🏗 1. Sistem Mimarisi (Architecture)
Proje, **Microservices-style Monorepo** yapısında kurgulanmıştır:

*   **Frontend (nester-app):** Next.js 14 (App Router) tabanlı, kullanıcı etkileşimi, görselleştirme ve sipariş yönetiminden sorumlu katman.
*   **Backend (nester-optimizer):** FastAPI (Python) tabanlı, ağır matematiksel hesaplamalar ve PDF üretimi yapan yüksek performanslı mikroservis.
*   **Veritabanı & Auth:** Supabase (PostgreSQL) üzerinden gerçek zamanlı veri yönetimi ve kullanıcı kimlik doğrulaması.

---

## 💻 2. Teknoloji Yığını (Tech Stack)

### **Frontend (Next.js)**
*   **UI/UX:** Tailwind CSS & Lucide Icons (Endüstriyel Karanlık Tema).
*   **Görselleştirme:** HTML5 Canvas API (Ölçeklenebilir, dokunmatik destekli `CutVisualizer` motoru).
*   **State Management:** React Hooks (useMemo, useCallback optimizasyonları ile).
*   **Type Safety:** Strict TypeScript (Build-ready, sıfır `any` toleransı).

### **Backend (FastAPI)**
*   **Hesaplama Motoru:** Python 3.x.
*   **Algoritma Kütüphanesi:** `rectpack` (2D Bin Packing).
*   **PDF Motoru:** `reportlab` (Vektörel teknik resim üretimi).
*   **API Standardı:** RESTful (JSON input/output).

---

## 🧬 3. Optimizasyon Algoritmaları (The Engine)

Uygulama, **2D Bin Packing** problemini çözmek için hibrit bir yaklaşım kullanır. `rectpack` kütüphanesi üzerinden şu stratejileri test eder ve en verimli olanı (`Efficiency Score`) seçer:

1.  **Guillotine Stratejisi:** Parçaları plakayı boydan boya kesecek şekilde (giyotin kesim) yerleştirir. Atölye tipi manuel kesim makineleri için idealdir.
2.  **Maximal Rectangles:** Boş alanları maksimum dikdörtgenlere bölerek en sıkı yerleşimi hedefler. CNC makineleri için uygundur.
3.  **Heuristics (Sezgisel Yöntemler):**
    *   `BNF` (Best-Fit): Parçayı en az boşluk bırakacağı alana yerleştirir.
    *   `BSSF` (Best Short Side Fit): Kısa kenar uyumuna göre yerleşim yapar.

**Verimlilik Skoru Formülü:**
`Efficiency = (Kullanılan Alan / Toplam Plaka Alanı) * 100`

---

## 📊 4. Veri Modeli ve Akışı

### **Tablo Yapısı (Supabase)**
*   **Orders:** Sipariş bazlı metrikler (`efficiency_score`, `waste_percent`, `placements_data` JSON formatında).
*   **Pieces:** Siparişe ait her bir parçanın ölçüleri ve kenar bandı (`edge_banding`) bilgileri.

### **İş Akışı (Functional Flow)**
1.  **Input:** Kullanıcı parça listesini ve plaka ölçülerini girer.
2.  **Request:** Next.js, verileri JSON olarak Python API'sine gönderir.
3.  **Process:** Python motoru 5 farklı algoritmayı yarıştırır, en verimli sonucu döner.
4.  **Visualize:** Canvas motoru, gelen koordinatları milimetrik hassasiyetle çizer.
5.  **Export:** `reportlab` ile plaka üzerinde ölçü çizgileri ve QR kod içeren PDF oluşturulur.

---

## 🚀 5. Deployment Bilgileri
*   **Frontend:** Vercel (Root: `nester-app`).
*   **Backend:** Render.com (Root: `nester-optimizer`).
*   **Bağlantı:** `OPTIMIZER_API_URL` çevre değişkeni üzerinden güvenli iletişim.

---

## 📋 6. Geliştirici Notu (Gemini için)
Proje, üretim hızını artırmak ve hammadde firesini minimize etmek amacıyla geliştirilmiştir. Kod tabanı tamamen **Production-Ready** hale getirilmiş, tüm build hataları temizlenmiş ve endüstriyel standartlarda (`mm` bazlı) ölçüm sistemine geçilmiştir.

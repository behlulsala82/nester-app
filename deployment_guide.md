# 🚀 Nester SaaS Deployment Rehberi (Vercel & Render)

Bu rehber, projenin hatasız build süreçlerini takiben, Python Optimizer servisini **Render.com** üzerinde, Next.js Frontend'i ise **Vercel** üzerinde çalıştırmak için hazırlanmıştır.

---

## 🛠 Faz 1: Backend Deployment (Render.com)

Önce Python servisini ayağa kaldırmalıyız çünkü Frontend'in bu adrese ihtiyacı olacak.

1.  **Render Dashboard**'a girin ve **"New + Web Service"** butonuna tıklayın.
2.  GitHub reponuzu bağlayın.
3.  Aşağıdaki ayarları uygulayın:
    *   **Name:** `nester-optimizer`
    *   **Root Directory:** `nester-optimizer`
    *   **Runtime:** `Python 3`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  **Açılan servisin URL'sini kopyalayın** (Örn: `https://nester-optimizer.onrender.com`).

---

## 🎨 Faz 2: Frontend Deployment (Vercel)

1.  **Vercel Dashboard**'da **"Add New Project"** diyerek reponuzu seçin.
2.  **Project Settings** ekranında:
    *   **Framework Preset:** `Next.js`
    *   **Root Directory:** `nester-app` (**KRİTİK ADIM**)
3.  **Environment Variables** kısmına şu 3 değişkeni ekleyin:
    *   `NEXT_PUBLIC_SUPABASE_URL`: (Supabase URL'niz)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Supabase Anon Key)
    *   `OPTIMIZER_API_URL`: (Faz 1'de Render'dan aldığınız URL)
4.  **"Deploy"** butonuna basın.

---

## ✅ Faz 3: Kontrol Listesi

*   [ ] **CORS Kontrolü:** Eğer PDF indirme veya optimizasyon sırasında hata alırsanız, `nester-optimizer/app/main.py` dosyasındaki `allow_origins` listesinde Vercel adresinizin ekli olduğundan emin olun.
*   [ ] **DB Migration:** Supabase üzerinde `orders` ve `pieces` tablolarının `types/database.ts` dosyasındaki yeni alanlara (efficiency_score vb.) sahip olduğunu doğrulayın.

---

## 📝 Notlar
*   Uygulama artık hatasız (`npm run build` testinden geçtiği için) Vercel üzerinde tek seferde yayına girecektir.
*   Render ücretsiz planındaysanız, ilk istekte 30 saniye geç cevap verebilir. Müşteri sunumundan önce sayfayı bir kez yenileyerek servisi uyandırın.

**Nester SaaS artık yayına hazır!** 🚀

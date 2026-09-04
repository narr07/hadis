# Design Direction: Hadis

## 1. Product Identity & Purpose
- **Nama Produk**: Hadis (Kutubut Tis'ah)
- **Kategori**: Ensiklopedia & Pembaca Hadis Digital Berbahasa Indonesia
- **Audiens**: Kaum Muslimin, pelajar, santri, akademisi, dan masyarakat umum yang mencari rujukan hadis shahih dengan cepat dan nyaman.
- **Karakter Visual**: Bersahaja, tenang, khusyuk, berwibawa, dan mengutamakan keterbacaan teks suci (*readability first*).

## 2. Anti-Slop Dials (R-37 & Part 3)
- **ENERGY 1 (Calm)**: Palet warna bernuansa natural (emerald/lime cerah berpadu dengan netral dingin/hangat). Tanpa gradien ungu-biru buatan AI, tanpa ornamen neon atau glow berlebih.
- **RHYTHM 2 (Balanced)**: Struktur katalog yang rapi dan terprediksi, dipadukan dengan halaman bacaan detail hadis yang lapang dan terisolasi dari distraksi.
- **MOTION 1 (Quiet)**: Animasi fungsional semata (slideover drawer responsif pada mobile, transisi hover subtil). Tanpa elemen yang memantul, berdenyut (*pulse*), atau berputar terus-menerus.

## 3. Design Tokens & Hierarchy
- **Typography**:
  - UI Sans: `Plus Jakarta Sans` (modern, jernih, kontras tinggi).
  - Arab Matn: `Amiri` (Naskh tradisional berharakat lengkap, proporsional, line-height 2.3-2.4).
- **Color Palette**:
  - Primary: Emerald / Nuxt Green (`#00DC82`, `#00C16A`, `#007F45`).
  - Neutral Light: Slate/Zinc/Neutral (`#0a0a0a` text on `#fafafa` base, batas kontras WCAG AA >= 4.5:1).
  - Neutral Dark: Charcoal/Onyx (`#ffffff` text on `#0a0a0a` / `#171717` base).
- **Surface Elevation**:
  - Flat base dengan border netral `border-neutral-200 dark:border-neutral-800`.
  - Satu-satunya lapisan *glassmorphism* (`backdrop-blur`) hanya berada pada sticky header navigasi atas.

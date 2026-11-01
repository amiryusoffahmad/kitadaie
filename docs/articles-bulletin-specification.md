# Spesifikasi Articles dan Bulletin KitaDaie

Versi 1.0 | 1 November 2026 | Keputusan yang dipersetujui bersama pengguna

## Tujuan

Bina Articles dan Bulletin bersama dalam aplikasi KitaDaie. Pengguna membaca kandungan yang diterbitkan; admin menyediakan, menyusun, menjadualkan, menerbitkan dan mengarkibkan kandungan. Katalog awal disediakan sebagai draf sehingga isi sebenar tersedia.

## Sumber dan keutamaan

Keputusan dalam dokumen ini mengatasi cadangan yang bercanggah dalam draf asal.

- Dokumen asal: KitaDaie Articles Bulletin Feature Requirements and Design.
- Rujukan visual dalam folder Desktop/Semakan Kita Daie: kitadaie-colors.css, kitadaie-mobile-web.css, kitadaie-typography.css, kitadaie-kd-app-icon.png, kitadaie-kd-header-logo.png, kitadaie-color-reference.pdf dan kitadaie-typography-reference.pdf.
- CSS rujukan menentukan warna, saiz, tema dan susun atur. Dokumen asal menentukan struktur kandungan serta skrin, tertakluk kepada keputusan terkini.

## Keputusan skop

| Perkara | Keputusan |
| --- | --- |
| Penghantaran | Articles dan Bulletin dibina bersama |
| Pengguna biasa | Paparan dan bacaan sahaja; tiada muat turun, Favourite atau Share |
| Kebolehbacaan | Pelarasan saiz teks, Arab RTL, terjemahan dan rujukan |
| Admin | Sediakan, edit, susun, pratonton, terbitkan, jadualkan dan arkibkan |
| Kelulusan | Editor dan kelulusan berasingan ditangguhkan |
| Fail | Tiada upload gambar, PDF atau lampiran dalam skop ini |
| Katalog | Tajuk lengkap dan kategori bernama sahaja, semuanya draf |
| Buletin awal | Tiada buletin contoh direka atau diterbitkan |
| Fasa kemudian | Carian, push notification kandungan, offline, analitik dan jenis blok tambahan |

Kad PDF Hadis 40 yang ditambah dalam Resources sebelum ini tidak menjadi kandungan awal modul ini. Buang kad eksperimen tersebut daripada aliran pengguna supaya tiada pilihan muat turun ditawarkan. Fail asal tidak perlu dipadam dalam pelaksanaan ini.

## Navigasi dan skrin

Navigasi bawah: **Home / Bulletin / TProg / Notification / All**.

- Home menambah pintasan Articles dan Bulletin. Pintasan Bulletin dan tab Bulletin membuka halaman yang sama.
- Profile dan Resources berada dalam All; Mathurat, Mutabaah, HQ Tree, CCS Form serta fungsi Update sedia ada kekal boleh dicapai.
- Notification menggunakan peti notifikasi sedia ada; bilangannya berasingan daripada buletin belum dibaca.
- Articles mempunyai Featured / Latest, kategori dua lajur, senarai siri dan pembaca artikel.
- Kategori membuka siri di dalamnya. Siri memaparkan artikel mengikut susunan admin.
- Bulletin memaparkan kad bertarikh, ringkasan dan penanda belum dibaca, terbaru dahulu.
- Pembaca memaparkan tajuk, tarikh, anggaran masa membaca dan blok kandungan; tindakan kembali, Home dan saiz teks sahaja.
- All menyediakan pautan kepada fungsi sedia ada dan pilihan tema system/light/dark.
- Content manager admin mengurus artikel, buletin, kategori dan siri serta menyediakan pratonton menggunakan pembaca yang sama.
- Semua senarai dan pembaca menyediakan keadaan loading, kosong, tidak ditemui dan ralat dengan cubaan semula apabila sesuai.

## Reka bentuk

Paparan mudah alih pada semua lebar, maksimum 30rem (480px), berpusat pada skrin besar. Kandungan utama sahaja menatal. Navigasi bawah mengambil ruang sebenar dalam susun atur; tiada spacer berasaskan anggaran. Hormati safe area dan ketinggian viewport dinamik.

| Token | Cerah | Gelap |
| --- | --- | --- |
| Canvas | #F8FAFC | #0F172A |
| Kad | #FFFFFF | #1E293B |
| Teks utama | #0F172A | #F8FAFC |
| Teks sekunder | #475569 | #94A3B8 |
| Jenama | #1E40AF | #1E3A8A |
| Tindakan | #2563EB | #3B82F6 |
| Pilihan aktif | #EFF6FF | #172554 |
| Pautan | #1D4ED8 | #60A5FA |

Fon UI menggunakan system-ui. Tajuk halaman 24/32px, seksyen 20/28px, tajuk kad 18/26px, teks utama 16/24px dan metadata 14/20px. Gunakan rem; jangan matikan zoom. Teks penting membalut dan tidak dipotong. Sasaran sentuh sekurang-kurangnya 44px. Label navigasi 12px dan ikon 24px.

Petikan Arab menggunakan Noto Sans Arabic dengan fallback, lang="ar", dir="rtl", saiz asas 20px dan line-height 1.9. Terjemahan kekal berasingan. Saiz pembaca kecil/biasa/besar disimpan pada peranti. Pemilihan fon Arab mesti benar-benar dimuatkan sebelum menganggap paparan selesai.

Logo header dan ikon aplikasi menggunakan aset yang dibekalkan. Rujukan tema ini menggantikan navy/turquoise dan Mulish/Plus Jakarta Sans dalam draf asal.

## Katalog awal

Kategori: **Al-Aqsa, Quran, Knowing Allah, 'Umrah**. 'Umrah kekal kosong sehingga siri dan isi sebenar dibekalkan. Jangan cipta siri placeholder.

| Kategori | Siri | Tajuk draf |
| --- | --- | --- |
| Al-Aqsa | Virtues of al-Aqsa | The Virtues of al-Aqsa & the Blessed Land: Part 1 |
| Quran | The Qur’an: Your Best Friend | Tadabbur: Reflecting Upon the Qur’an |
| Quran | The Qur’an: Your Best Friend | Recite Qur’an Slowly & Beautifully |
| Quran | The Qur’an: Your Best Friend | 20 Quranic Qualities |
| Quran | The Qur’an: Your Best Friend | The Qur’an & Its Virtues |
| Quran | The Qur’an: Your Best Friend | Ramadan: The Month of the Qur’an |
| Knowing Allah | Knowing Allah | Who is Allah |
| Knowing Allah | Knowing Allah | Allahu Akbar: A Magnificent Phrase |
| Knowing Allah | Knowing Allah | Fearing Allah |
| Knowing Allah | Knowing Allah | Hoping in Allah |
| Knowing Allah | Knowing Allah | In the Company of Angels |
| Knowing Allah | Knowing Allah | Loving Allah – Part 1 |
| Knowing Allah | Knowing Allah | Loving Allah – Part 2 |

Jumlah: 4 kategori, 3 siri dan 13 artikel draf. Tiada isi, petikan Quran, tarikh terbit atau ringkasan contoh direka. Tajuk terpotong, Practical Tips for Tadabbur yang belum lengkap dan kategori keempat yang tidak dinamakan tidak dimasukkan. Menandakan Featured tidak menjadikan draf kelihatan kepada pengguna.

## Kandungan dan penerbitan

Status: draft, scheduled, published, archived. Kandungan perlu mempunyai tajuk dan sekurang-kurangnya satu blok yang sah sebelum diterbitkan atau dijadualkan. Admin boleh mempratonton draf.

Blok awal: paragraph, heading, quote dan verse. Verse menyimpan teks Arab, terjemahan dan rujukan. Render teks sebagai teks React, tanpa HTML mentah. Tiada pautan fail, blok download atau input upload.

Masa terbit disimpan sebagai waktu UTC dan dipaparkan dalam Asia/Kuala_Lumpur. Scheduled tidak dipulangkan oleh API pembaca; kerja berjadual menukar kandungan yang telah tiba waktunya kepada published. Kerja tersebut mesti dilindungi dengan secret. API turut menolak published yang waktu terbitnya masih di masa hadapan.

Arkib menyembunyikan kandungan daripada senarai serta pautan terus pembaca, tetapi mengekalkan rekod bacaan dan audit. Penerbitan semula tidak menetapkan semula rekod bacaan. Susunan Latest dan Bulletin berdasarkan waktu terbit, dengan ID sebagai pemutus seri.

## Belum dibaca

- Hanya buletin published yang diterbitkan selepas createdAt akaun dikira.
- Buletin lebih lama masih boleh dibaca, tetapi tidak menambah badge pengguna baharu.
- Jangan menandakan dibaca ketika prefetch atau permintaan senarai.
- Selepas pembaca berjaya menerima dan memaparkan kandungan, hantar permintaan rekod bacaan.
- Satu rekod sahaja bagi setiap pasangan pengguna/item; tindakan berulang selamat.
- Kemas kini badge Home, tab bawah dan penanda senarai selepas simpanan berjaya.
- Kegagalan merekod bacaan tidak menyembunyikan artikel; sediakan cubaan semula.

## Pelaksanaan teknikal

Gunakan Next.js App Router/React, Shadcn, Tailwind, TanStack Query, Better Auth, MySQL dan Knex sedia ada. Gunakan identiti serta user_roles sedia ada.

| Jadual | Tanggungjawab |
| --- | --- |
| art_categories | Kategori, slug unik, susunan dan status aktif |
| art_series | Siri, kategori induk, slug unik dan susunan |
| art_items | Article/bulletin, siri pilihan, tajuk, ringkasan, blok JSON, Featured, status, publish_at, susunan, pembuat/pengemas kini |
| art_reads | user_id, item_id, read_at, kekangan unik pasangan |
| art_audit_logs | Aktor, tindakan, jenis/ID entiti, masa dan metadata |

Kategori artikel bersiri mengikuti kategori sirinya. Buletin tidak memerlukan kategori atau siri. Favourites dan media tidak memerlukan jadual dalam skop ini.

Cadangan route: /articles, /articles/categories/[id], /articles/series/[id], /articles/[id], /bulletin, /bulletin/[id], /all dan /admin-content.

API pembaca memerlukan sesi dan hanya memulangkan published. API admin memeriksa peranan pada setiap operasi. Respons per pengguna tidak boleh dicache secara awam. Paginasikan senarai. Mutasi metadata dan audit dilakukan dalam transaksi. Upload tidak dibina dalam fasa ini.

## Kriteria penerimaan

1. Lima tab baharu berfungsi; Profile, Resources dan Update masih boleh dicapai melalui All.
2. Home membuka Articles/Bulletin dan badge menggunakan kiraan backend yang sama.
3. Featured hanya memaparkan artikel published yang ditandakan Featured; Latest dipaginasikan terbaru dahulu.
4. Kategori, siri kosong dan senarai tanpa kandungan mempunyai mesej yang jelas.
5. Katalog awal mengandungi tepat 13 draf; pengguna tidak boleh membuka draf melalui URL terus atau API.
6. Admin boleh menyediakan, mengedit, menyusun, mempratonton, menerbitkan, menjadualkan dan mengarkibkan; pengguna biasa menerima 403 bagi API admin.
7. Pembaca menyokong blok biasa dan Arab RTL, saiz teks serta tema cerah/gelap tanpa muat turun, Favourite atau Share.
8. Buletin lama sebelum akaun tidak menambah badge; buletin baharu hilang daripada kiraan selepas bacaan berjaya direkodkan.
9. Prefetch tidak mengubah bacaan; tindakan baca berulang tidak menghasilkan pendua; kegagalan rekod boleh dicuba semula.
10. Arkib menghalang akses pembaca tetapi mengekalkan bacaan serta audit.
11. Tiada upload fail, kandungan contoh rekaan atau tajuk belum lengkap dimasukkan.
12. Uji reflow pada 320px, pembesaran teks 200%, fokus papan kekunci, kedua-dua tema dan safe area.

## Pelaksanaan dan pengesahan

Siapkan spesifikasi ini dahulu, kemudian laksanakan migrasi/katalog, API berizin, pengurusan admin, skrin pembaca dan integrasi navigasi/tema. Uji peraturan penerbitan dan kiraan bacaan serta jalankan build. Jangan jalankan migrasi terhadap pangkalan data yang belum dikenal pasti sebagai persekitaran tempatan/ujian. Dokumentasikan arahan pemasangan dan hasil pengesahan sebenar. Commit, push dan deployment memerlukan arahan pengguna yang berkenaan.

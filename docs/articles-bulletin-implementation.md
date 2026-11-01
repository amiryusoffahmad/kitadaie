# Panduan pelaksanaan Articles dan Bulletin

Rujuk [spesifikasi yang dipersetujui](./articles-bulletin-specification.md) untuk skop, katalog dan kriteria penerimaan.

## Menggunakan modul

- Pembaca: buka Articles melalui Home atau All; buka Bulletin melalui Home atau navigasi bawah.
- Admin: buka Articles & Bulletin > Content Manager pada sidebar admin, atau `/admin-content`.
- Tab Kandungan menyediakan senarai, editor blok dan pratonton. Pilih Draf, Diterbitkan, Berjadual atau Arkib sebelum menyimpan.
- Tab Kategori dan Siri membolehkan admin mengurus nama, slug, susunan dan status aktif. Kategori artikel bersiri ditentukan oleh kategori sirinya.
- Sediakan isi sebenar sebelum menerbitkan 13 tajuk katalog. Semak ayat Arab, terjemahan dan rujukan melalui pemilik kandungan.
- Muat turun, Favourite, Share dan upload tidak disediakan. Kad PDF Hadis 40 percubaan telah dibuang daripada Resources; fail sedia ada tidak dipadam.
- Tema diubah melalui All > Paparan. Pilihan saiz teks berada dalam pembaca dan disimpan pada peranti apabila localStorage tersedia.

## Pangkalan data

Migrasi tambahan: `20261101_001_articles_bulletin.js`. Ia mencipta lima jadual `art_*` dan mengisi 4 kategori, 3 siri serta 13 artikel draf. Tiada buletin diterbitkan secara automatik.

Untuk pangkalan data sedia ada, jalankan migrasi ini secara khusus selepas memuatkan pemboleh ubah DB. Jangan jalankan migrasi skema awal terhadap pangkalan data sedia ada yang belum direkodkan dalam sejarah Knex.

```powershell
node -e "require('@next/env').loadEnvConfig(process.cwd()); const k=require('knex')(require('./knexfile').development); k.migrate.up({name:'20261101_001_articles_bulletin.js'}).then(console.log).finally(()=>k.destroy()).catch(e=>{console.error(e.message);process.exitCode=1})"
```

Migration ini sudah dijalankan pada pangkalan data tempatan semasa pembangunan. Untuk persekitaran lain, sahkan DB sasaran dan sandaran sebelum menjalankannya. Jangan guna arahan rollback terhadap pangkalan data yang mempunyai kandungan sebenar tanpa pelan pemulihan.

## Penerbitan berjadual

`/api/cron/publish-content` menukar rekod scheduled yang telah tiba waktunya kepada published dalam transaksi dan menulis audit. `vercel.json` menjadualkan panggilan setiap minit. Hosting perlu menyokong kekerapan ini; jika menggunakan penjadual luaran, gunakan endpoint yang sama.

Tetapkan `CRON_SECRET` pada persekitaran deployment. Penjadual mesti menghantar `Authorization: Bearer <CRON_SECRET>`. Jangan masukkan secret ke dalam kod frontend atau commit. Waktu editor menggunakan Asia/Kuala_Lumpur; waktu kandungan disimpan dalam UTC. Akaun Better Auth dinormalisasi melalui konfigurasi masa mysql2 sedia ada sebelum perbandingan belum dibaca.

Kandungan scheduled kekal tersembunyi sehingga penjadual berjaya. Gunakan Published untuk penerbitan segera. Arkib mengekalkan bacaan dan audit.

## Aset dan tema

Tiga fail CSS rujukan disimpan dalam `src/app/styles`, dengan penyesuaian pemilih tema kepada kelas next-themes. `design-system.css` memetakan token semantik kepada komponen sedia ada. Susun atur pembaca kekal mudah alih pada desktop, maksimum 480px.

Logo yang dibekalkan disimpan dalam `public/brand`; ikon 192px dan 512px dijana daripada ikon asal. Noto Sans Arabic menggunakan next/font, disertakan dalam hasil build dan dihidangkan daripada aplikasi. Fon UI menggunakan fon sistem.

Service worker menggunakan NetworkOnly untuk route Articles/Bulletin dan API kandungan/admin. Cache per pengguna hanya berada dalam TanStack Query semasa sesi; tiada sokongan bacaan offline baharu.

## Pengesahan

Ujian peraturan tidak memerlukan pangkalan data:

```powershell
node --test tests/content-rules.test.mjs
```

Ujian integrasi memerlukan migrasi kandungan, aplikasi tempatan pada port 3105 dan DB tempatan. Ia menyediakan pengguna/sesi/kandungan ujian sementara, menguji kebenaran API dan membersihkan rekodnya dalam finally. Jangan jalankannya terhadap deployment atau DB pengeluaran. Pengguna ujian menggunakan domain `example.invalid` dan tiada e-mel dihantar.

```powershell
# Terminal pertama, selepas build
node node_modules/next/dist/bin/next start -p 3105
# Terminal kedua
node tests/content-api.integration.mjs
```

Untuk port lain, tetapkan `CONTENT_TEST_URL`. Ujian penjadual menggunakan CRON_SECRET persekitaran dan hanya mengubah tarikh kandungan ujian yang diciptanya sendiri.

Build Windows:

```powershell
npm.cmd run build
```

Jika rangkaian menggunakan sijil CA organisasi yang dipercayai Windows, Node 24 boleh menggunakan trust store sistem melalui `NODE_OPTIONS=--use-system-ca`. Jangan matikan pengesahan TLS. Build menghasilkan semula service worker; fail janaan itu bukan sumber perubahan feature.

## Hasil pengesahan pada 1 November 2026

- Build pengeluaran berjaya selepas perubahan akhir.
- 12 ujian peraturan kandungan lulus.
- 22 semakan integrasi API lulus pada DB tempatan, termasuk 401/403, sekatan draf, kategori tidak aktif, bacaan berulang serentak, arkib, audit dan cron.
- Lint bersasar bagi modul kandungan, API dan komponen navigasi baharu: 0 ralat, 0 amaran.
- Semakan pelayar: 320px, pembesaran teks 200%, tema cerah/gelap, lebar maksimum 480px pada desktop, fon Noto Sans Arabic dimuatkan dan arah RTL.
- Pembukaan buletin melalui pembaca mengurangkan badge daripada 1 kepada 0; tiada pautan download dalam pembaca.
- Semua pengguna, sesi dan kandungan ujian sementara dibuang. DB tempatan ditinggalkan dengan 4 kategori, 3 siri dan 13 artikel draf.

Semakan pelayar ini tidak menggantikan ujian telefon sebenar bagi papan kekunci dan safe area sebelum deployment.

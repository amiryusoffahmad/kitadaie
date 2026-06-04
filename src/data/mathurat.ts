export interface MathuratItem {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repeat: number;
}

export const mathuratData: MathuratItem[] = [
  {
    id: 1,
    title: "Al-Fatihah (1-7)",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝١ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝٢ الرَّحْمَنِ الرَّحِيمِ ۝٣ مَالِكِ يَوْمِ الدِّينِ ۝٤ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝٥ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝٦ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝٧",
    transliteration: "Bismillaahir rahmaanir rahiim. Alhamdu lillaahi rabbil 'aalamiin. Ar-rahmaanir rahiim. Maaliki yawmid diin. Iyyaaka na'budu wa iyyaaka nasta'iin. Ihdinas siraatal mustaqiim. Siraatal ladziina an'amta 'alayhim, ghayril maghduubi 'alayhim walad-daalliin.",
    translation: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani. Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam. Yang Maha Pemurah, lagi Maha Mengasihani. Yang Menguasai pemerintahan Hari Pembalasan (Hari Akhirat). Engkaulah sahaja (Ya Allah) yang kami sembah, dan kepada Engkaulah sahaja kami memohon pertolongan. Tunjuklah kami jalan yang lurus. Iaitu jalan orang yang Engkau telah kurniakan nikmat kepada mereka, bukan (jalan) orang Engkau telah murkai, dan bukan pula (jalan) orang yang sesat.",
    repeat: 1
  },
  {
    id: 2,
    title: "Al-Baqarah (1-5)",
    arabic: "الۤمۤ ۝١ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ ۝٢ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ۝٣ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ۝٤ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ۝٥",
    transliteration: "Alif-Laam-Miim. Zaalikal kitaabu laa rayba fiihi hudal lil muttaqiin. Allaziina yu'minuuna bil ghaybi wa yuqiimuunas salaata wa mimmaa razaqnaahum yunfiquun. Wallaziina yu'minuuna bimaa unzila ilayka wa maa unzila min qablika wa bil aakhirati hum yuuqinuun. Ulaa'ika 'alaa hudam mir rabbihim wa ulaa'ika humul muflihuun.",
    translation: "Alif, Laam, Miim. Kitab Al-Quran ini, tidak ada sebarang syak padanya (tentang datangnya dari Allah dan tentang sempurnanya); ia pula menjadi petunjuk bagi orang-orang yang (hendak) bertakwa. Iaitu orang-orang yang beriman kepada perkara-perkara yang ghaib, dan mendirikan (mengerjakan) sembahyang serta membelanjakan (menderma) sebahagian dari rezeki yang Kami berikan kepada mereka. Dan juga orang-orang yang beriman kepada Kitab Al-Quran yang diturunkan kepadamu (wahai Muhammad), dan kitab-kitab yang diturunkan dahulu daripadamu, serta mereka yakin akan (adanya) hari akhirat (dengan sepenuhnya). Mereka itulah yang tetap mendapat pertunjuk dari Tuhan mereka, dan merekalah orang-orang yang berjaya.",
    repeat: 1
  },
  {
    id: 3,
    title: "Al-Baqarah (255) - Ayatul Kursi",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ ۝٢٥٥",
    transliteration: "Allaahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khuzuhuu sinatuw walaa nawm, lahuu maa fis samaawaati wa maa fil ardh, man zallazii yashfa'u 'indahuu illaa bi'iznin, ya'lamu maa bayna aydiihim wa maa khalfahum wa laa yuhiituuna bi shay'im min 'ilmihii illaa bimaa shaa'a, wasi'a kursiyyuhus samaawaati wal ardha wa laa ya'uuduhuu hifzuhumaa wa huwal 'aliyyul 'aziim.",
    translation: "Allah, tiada Tuhan (yang berhak disembah) melainkan Dia, Yang Tetap Hidup, Yang Kekal selama-lamanya mentadbirkan (sekalian makhluk-Nya). Yang tidak mengantuk usahkan tidur. Yang memiliki segala yang ada di langit dan yang ada di bumi. Tiada sesiapa yang dapat memberi syafa'at (pertolongan) di sisi-Nya melainkan dengan izin-Nya. Yang mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedang mereka tidak mengetahui sesuatu pun dari (kandungan) ilmu Allah melainkan apa yang Allah kehendaki (memberitahu kepadanya). Luasnya Kursi Allah (ilmu-Nya dan kekuasaan-Nya) meliputi langit dan bumi dan tiadalah menjadi keberatan kepada Allah menjaga serta memelihara keduanya. Dan Dialah Yang Maha Tinggi (darjat kemuliaan-Nya) lagi Maha Besar (kekuasaan-Nya).",
    repeat: 1
  },
  {
    id: 4,
    title: "Al-Baqarah (256-257)",
    arabic: "لَا إِكْرَاهَ فِي الدِّينِ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ فَمَن يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِن بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انفِصَامَ لَهَا وَاللَّهُ سَمِيعٌ عَلِيمٌ ۝٢٥٦ اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُم مِّنَ النُّورِ إِلَى الظُّلُمَاتِ أُولَٰئِكَ أَصْحَابُ النَّارِ هُمْ فِيهَا خَالِدُونَ ۝٢٥٧",
    transliteration: "Laa ikraaha fid diin, qad tabayyanar rushdu minal ghayy, faman yakfur bit taaghuti wa yu'min billaahi faqadistamsaka bil 'urwatil wuthqaa lan fisaama lahaa wallaahu samii'un 'aliim. Allaahu waliyyul laziina aamanuu yukhrijuhum minaz zulumaati ilan nuur, wallaziina kafaruu awliyaa'uhumut taaghut yukhrijuunahum minan nuuri ilaz zulumaat, ulaa'ika as-haabun naar hum fiihaa khaalidun.",
    translation: "Tiada paksaan dalam agama (Islam), kerana sesungguhnya telah nyata kebenaran (Islam) dari kesesatan (kufur). Oleh itu, sesiapa yang tidak percayakan Taghut (syaitan, berhala dan apa sahaja yang menyesatkan), dan ia pula beriman kepada Allah, maka sesungguhnya ia telah berpegang kepada simpulan (tali agama) yang teguh, yang tidak akan putus. Dan (ingatlah), Allah Maha Mendengar lagi Maha Mengetahui. Allah Pelindung (Yang Mengawal dan Menolong) orang-orang yang beriman. Dia mengeluarkan mereka dari kegelapan kufur kepada cahaya (iman). Dan orang-orang kafir penolong mereka adalah Thaghut yang mengeluarkan mereka daripada cahaya (iman) kepada kegelapan kufur. Mereka itulah ahli neraka, mereka kekal di dalamnya.",
    repeat: 1
  },
  {
    id: 5,
    title: "Al-Baqarah (284-286)",
    arabic: "لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ وَإِن تُبْدُوا مَا فِي أَنفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُم بِهِ اللَّهُ فَيَغْفِرُ لِمَن يَشَاءُ وَيُعَذِّبُ مَن يَشَاءُ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝٢٨٤ آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝٢٨٥ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ۝٢٨٦",
    transliteration: "Lillaahi maa fis samaawaati wa maa fil ardh, wa in tubduu maa fii anfusikum aw tukhfuuhu yuhaasibkum bihillaah, fayaghfiru liman yashaa'u wa yu'azzibu man yashaa', wallaahu 'alaa kulli shay'in qadiir. Aamanar rasuulu bimaa unzila ilayhi mir rabbihii wal mu'minuun, kullun aamana billaahi wa malaa'ikatihii wa kutubihii wa rusulih, laa nufarriqu bayna ahadim mir rusulih, wa qaaluu sami'naa wa ata'naa, ghufraanaka rabbanaa wa ilaykal masiir. Laa yukallifullahu nafsan illaa wus'ahaa, lahaa maa kasabat wa 'alayhaa mak tasabat, rabbanaa laa tu'aakhidznaa in nasiinaa aw akhtha'naa, rabbanaa wa laa tahmil 'alaynaa isran kamaa hamaltahuu 'alal laziina min qablinaa, rabbanaa wa laa tuhammilnaa maa laa taaqata lanaa bih, wa'fu 'annaa waghfir lanaa warhamnaa, anta mawlaanaa fansurnaa 'alal qawmil kaafiriin.",
    translation: "Segala yang ada di langit dan yang ada di bumi adalah kepunyaan Allah. Dan jika kamu melahirkan apa yang ada di dalam hati kamu atau kamu menyembunyikannya, nescaya Allah akan menghitung dan menyatakannya kepada kamu. Kemudian Ia mengampunkan bagi sesiapa yang dikehendaki-Nya dan menyeksa sesiapa yang dikehendaki-Nya. Dan (ingatlah), Allah Maha Kuasa atas tiap-tiap sesuatu. Rasulullah telah beriman kepada apa yang diturunkan kepadanya dari Tuhannya, dan juga orang-orang yang beriman; semuanya beriman kepada Allah, dan Malaikat-malaikat-Nya, dan Kitab-kitab-Nya, dan Rasul-rasul-Nya. (Mereka berkata): 'Kami tidak membezakan antara seorang dengan yang lain dari Rasul-rasul-Nya'. Mereka berkata lagi: 'Kami dengar dan kami taat. (Kami pohonkan) keampunan-Mu wahai Tuhan kami, dan kepada-Mu wahai Tuhan kami, dan kepada-Mu jualah tempat kembali'. Allah tidak memberati seseorang melainkan apa yang terdaya olehnya. (Mereka berdoa): 'Wahai Tuhan kami! Janganlah Engkau mengirakan kami salah jika kami lupa atau kami tersalah. Wahai Tuhan kami! Janganlah Engkau bebankan kepada kami bebanan yang berat sebagaimana yang telah Engkau bebankan kepada orang-orang yang terdahulu daripada kami. Wahai Tuhan kami! Janganlah Engkau pikulkan kepada kami apa yang kami tidak terdaya memikulnya. Dan maafkanlah kesalahan kami serta ampunkanlah dosa kami, dan berilah rahmat kepada kami. Engkaulah Penolong kami; oleh itu, tolonglah kami untuk mencapai kemenangan terhadap kaum-kaum yang kafir.'",
    repeat: 1
  },
  {
    id: 6,
    title: "Al-Ikhlas (1-4)",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝١ اللَّهُ الصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝٤",
    transliteration: "Qul huwallaahu ahad. Allaahus samad. Lam yalid wa lam yuulad. Wa lam yakul lahuu kufuwan ahad.",
    translation: "Katakanlah (wahai Muhammad): '(Tuhanku) ialah Allah Yang Maha Esa. Allah Yang menjadi tumpuan sekalian makhluk untuk memohon sebarang hajat. Ia tiada beranak dan Ia pula tidak diperanakan. Dan tidak ada sesiapa pun yang setara dengan-Nya.'",
    repeat: 3
  },
  {
    id: 7,
    title: "Al-Falaq (1-5)",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥",
    transliteration: "Qul a'uuzu bi rabbil falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin izaa waqab. Wa min sharrin naffaatsaati fil 'uqad. Wa min sharri haasidin izaa hasad.",
    translation: "Katakanlah (wahai Muhammad): 'Aku berlindung kepada (Allah) Tuhan yang menciptakan sekalian makhluk, Dari bencana makhluk-makhluk yang Ia ciptakan; Dan dari bahaya gelap apabila ia masuk; Dari bencana makhluk-makhluk yang menghembus-hembus pada simpulan-simpulan (dan ikatan-ikatan); Dan dari kejahatan orang yang dengki apabila ia melakukan dengkinya.'",
    repeat: 3
  },
  {
    id: 8,
    title: "An-Naas (1-6)",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝١ مَلِكِ النَّاسِ ۝٢ إِلَٰهِ النَّاسِ ۝٣ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝٤ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝٥ مِنَ الْجِنَّةِ وَالنَّاسِ ۝٦",
    transliteration: "Qul a'uuzu bi rabbin naas. Malikin naas. Ilaahin naas. Min sharril waswaasil khannaas. Allazii yuwaswisu fii suduurin naas. Minal jinnati wan naas.",
    translation: "Katakanlah (wahai Muhammad): 'Aku berlindung kepada (Allah) Pemelihara sekalian manusia. Yang Menguasai sekalian manusia. Tuhan yang berhak disembah oleh sekalian manusia. Dari kejahatan pembisik, penghasut yang timbul tenggelam. Yang melemparkan bisikan dan hasutannya ke dalam hati manusia. (Iaitu pembisik dan penghasut) dari kalangan jin dan manusia.'",
    repeat: 3
  },
  {
    id: 9,
    title: "Doa Pujian Kepada Allah SWT",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ (أَمْسَيْنَا وَأَمْسَى) الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا شَرِيكَ لَهُ لَا إِلَهَ إِلَّا هُوَ وَإِلَيْهِ النُّشُورُ الْمَصِيرُ",
    transliteration: "Ashbahnaa wa ashbaha (amsaynaa wa amsal) mulku lillaahi wal hamdu lillaahi laa shariika lahu laa ilaaha illaa huwa wa ilayhin nushuuru (al-masiir).",
    translation: "Sesungguhnya kami terjaga di pagi hari (di petang hari) dengan (kesedaran bahawa) Kerajaan (bumi dan segala isinya) ini seluruhnya adalah milik Allah. Dan segala puji bagi Allah, tiada sekutu bagi-Nya tiada Tuhan selain Dia dan kepada-Nya kami akan dibangkitkan.",
    repeat: 3
  },
  {
    id: 10,
    title: "Doa Teguh Pendirian Dalam Islam",
    arabic: "أَصْبَحْنَا (أَمْسَيْنَا) عَلَى فِطْرَةِ الْإِسْلَامِ وَكَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
    transliteration: "Ashbahnaa (amsaynaa) 'alaa fitratil islaami wa kalimatiil ikhlaasi wa 'alaa diini nabiyyinaa Muhammadin sallallaahu 'alayhi wa sallam wa 'alaa millati abiinaa Ibraahiima haniifaw wa maa kaana minal mushrikiin.",
    translation: "Kami terjaga di pagi hari (petang hari) dalam fitrah Islam, dan kalimah ikhlas dan dalam agama nabi kami, Muhammad SAW, dan dalam millah (ajaran) bapa kami Ibrahim yang hanif (lurus) sedang dia bukan orang musyrik.",
    repeat: 3
  },
  {
    id: 11,
    title: "Doa Mensyukuri Nikmat",
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ (أَمْسَيْتُ) مِنكَ فِي نِعْمَةٍ وَعَافِيَةٍ وَسِتْرٍ فَأَتِمَّ عَلَيَّ نِعْمَتَكَ وَعَافِيَتَكَ وَسِتْرَكَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allaahumma innii ashbahtu (amsaytu) minka fii ni'matiw wa 'aafiyatiw wa sitr, fa atimma 'alayya ni'mataka wa 'aafiyataka wa sitraka fid dunyaa wal aakhirah.",
    translation: "Ya Allah, aku terjaga pada pagi dan petang dalam nikmat-Mu, afiat (keselamatan dari mara bencana), dan terjaganya rahsia-rahsia (dosa-dosa) ku, maka sempurnakan nikmat-Mu, afiat-Mu dan penjagaan-Mu itu di atasku, di dunia dan akhirat.",
    repeat: 3
  },
  {
    id: 12,
    title: "Pengakuan Segala Nikmat Dari Allah",
    arabic: "اللَّهُمَّ مَا أَصْبَحَ (أَمْسَى) بِي مِن نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    transliteration: "Allaahumma maa ashbaha (amsa) bii min ni'matin aw bi ahadin min khalqika faminka wahdaka laa shariika laka falakal hamdu wa lakash shukr.",
    translation: "Ya Allah, tidaklah aku pada waktu pagi dan petang dengan nikmat apa yang aku peroleh dan diperoleh seseorang di antara makhluk-Mu adalah dari-Mu, yang Esa dan tidak bersekutu, maka bagi-Mu segala puji dan syukur.",
    repeat: 3
  },
  {
    id: 13,
    title: "Pujian Bagi Allah",
    arabic: "يَا رَبِّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ",
    transliteration: "Yaa rabbi lakal hamdu kamaa yanbaghi lijallaali wajhika wa 'aziimi sultaanik.",
    translation: "Ya Allah, bagi-Mu segala puji seagung kemuliaan wajah-Mu dan kebesaran kekuasaan-Mu.",
    repeat: 3
  },
  {
    id: 14,
    title: "Ikrar",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا وَرَسُولًا",
    transliteration: "Radhiitu billaahi rabbaw wa bil islaami diinaw wa bi Muhammadin nabiyyaw wa rasuulaa.",
    translation: "Aku telah redha dengan Allah sebagai Tuhanku, dan dengan Islam sebagai agamaku dan dengan Muhammad sebagai nabi dan rasulku.",
    repeat: 3
  },
  {
    id: 15,
    title: "Bertasbih Kepada Allah",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhaanallaahi wa bihamdihii 'adada khalqihii wa ridhaa nafsihii wa zinata 'arshihii wa midaada kalimaaatih.",
    translation: "Maha suci Allah dan segala puji bagi-Nya sebanyak bilangan kejadian-Nya dan keredhaan-Nya, dan seberat timbangan 'arasy-Nya dan sebanyak dakwat (yang terpakai untuk menuliskan) kalimah-Nya.",
    repeat: 3
  },
  {
    id: 16,
    title: "Meninggikan Asma' Allah",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillaahil lazii laa yadhurru ma'as mihii shay'un fil ardhi wa laa fis samaa'i wa huwas samii'ul 'aliim.",
    translation: "Dengan nama Allah, yang dengan nama-Nya akan terhalanglah, segala sesuatu di bumi dan di langit, untuk menimpakan bencana, dan Ia Maha Mendengar dan Mengetahui.",
    repeat: 3
  },
  {
    id: 17,
    title: "Doa Terhindar Dari Syirik",
    arabic: "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ",
    transliteration: "Allaahumma innaa na'uuzu bika min an nushrika bika shay'an na'lamuhuu wa nastaghfiruka limaa laa na'lamuh.",
    translation: "Ya Allah, kami berlindung pada-Mu dari menyekutukan-Mu dengan sesuatu yang kami ketahui, dan kami memohon ampun dari (menyekutukan-Mu) dengan sesuatu yang tidak kami ketahui.",
    repeat: 3
  },
  {
    id: 18,
    title: "Berlindung Dari Kejahatan Makhluk",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِن شَرِّ مَا خَلَقَ",
    transliteration: "A'uuzu bi kalimaatillaahit taammati min sharri maa khalaq.",
    translation: "Aku berlindung pada kalimat Allah yang sempurna, dari kejahatan apa-apa yang diciptakan.",
    repeat: 3
  },
  {
    id: 19,
    title: "Doa Terhindar Dari Belenggu Hutang",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ وَأَعُوذُ بِكَ مِنَ الْبُخْلِ وَالْجُبْنِ وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    transliteration: "Allaahumma innii a'uuzu bika minal hammi wal hazani wa a'uuzu bika minal 'ajzi wal kasali wa a'uuzu bika minal bukhli wal jubni wa a'uuzu bika min ghalabatid dayni wa qahrir rijaal.",
    translation: "Ya Allah, aku berlindung pada-Mu dari rasa sedih dan gelisah, dan aku berlindung pada-Mu dari sikap pengecut dan bakhil, dan aku berlindung pada-Mu dari cengkaman hutang dan penindasan orang.",
    repeat: 3
  },
  {
    id: 20,
    title: "Doa Dilimpahkan Kesihatan",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي",
    transliteration: "Allaahumma 'aajinii fii badanii, allaahumma 'aajinii fii sam'ii, allaahumma 'aajinii fii basarii.",
    translation: "Ya Allah, sihatkanlah badanku, Ya Allah, sihatkanlah pendengaranku, Ya Allah, sihatkanlah penglihatanku.",
    repeat: 3
  },
  {
    id: 21,
    title: "Doa Terhindar Dari Kemiskinan",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration: "Allaahumma innii a'uuzu bika minal kufri wal faqr, allaahumma innii a'uuzu bika min 'azaabil qabri, laa ilaaha illaa anta.",
    translation: "Ya Allah, sesungguhnya aku berlindung pada-Mu dari kekafiran dan kefakiran; Ya Allah, aku berlindung kepada-Mu dari azab kubur; tidak ada Tuhan selain Engkau.",
    repeat: 3
  },
  {
    id: 22,
    title: "Doa Memohon Keampunan (Sayyidul Istighfar)",
    arabic: "اللَّهُمَّ أَنتَ رَبِّي لَا إِلَهَ إِلَّا أَنتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِن شَرِّمَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنتَ",
    transliteration: "Allaahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mastata'tu, a'uuzu bika min sharri maa sana'tu, abuu'u laka bi ni'matika 'alayya wa abuu'u bi dzanbii faghfir lii fa innahuu laa yaghfirud zunuuba illaa anta.",
    translation: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan selain Engkau; Engkau yang menciptakan dan aku abdi-Mu, dan aku berada dalam perjanjian dengan-Mu, ikrar kepada-Mu, (yang akan aku laksanakan dengan) segala kemampuanku; dan aku berlindung pada-Mu, dari kejahatan apa-apa yang telah aku lakukan; aku mengakui (dengan sebenar-benarnya) nikmat-Mu kepadaku; dan aku mengakui dosaku, maka ampunilah aku, kerana tidak ada yang boleh mengampuni dosa-dosa, kecuali Engkau.",
    repeat: 3
  },
  {
    id: 23,
    title: "Istighfar - Mohon Keampunan",
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaahul lazii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilayh.",
    translation: "Aku memohon ampun kepada Allah yang tidak ada Tuhan selain Dia, yang hidup dan selalu jaga; dan aku bertaubat pada-Mu.",
    repeat: 3
  },
  {
    id: 24,
    title: "Selawat Atas Nabi Muhammad SAW",
    arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allaahumma salli 'alaa sayyidinaa Muhammadin wa 'alaa aali sayyidinaa Muhammadin kamaa sallayta 'alaa sayyidinaa Ibraahiima wa 'alaa aali sayyidinaa Ibraahiima wa baarik 'alaa sayyidinaa Muhammadin wa 'alaa aali sayyidinaa Muhammadin kamaa baarakta 'alaa sayyidinaa Ibraahiima wa 'alaa aali sayyidinaa Ibraahiima fil 'aalamiina innaka hamiidun majiid.",
    translation: "Ya Allah, limpahkan selawat (berkat dan rahmat) dan salam atas junjungan kami, Muhammad, dan di atas keluarga junjungan kami, Muhammad, seperti Engkau limpahkan selawat (berkat dan rahmat) atas junjungan kami, dan keluarga junjungan kami, Ibrahim; dan berkatilah junjungan kami, Muhammad, seperti Engkau berkati junjungan kami, Ibrahim, di alam ini sesungguhnya Engkaulah yang Maha Terpuji dan Mulia.",
    repeat: 3
  },
  {
    id: 25,
    title: "Segala Pujian Bagi Allah (Tahlil)",
    arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    transliteration: "Subhaanallaahi wal hamdu lillaahi wa laa ilaaha illallaahu wallaahu akbar.",
    translation: "Maha Suci Allah, dan segala puji bagi Allah, dan tidak ada Tuhan selain Allah, dan Allah Maha Besar.",
    repeat: 3
  },
  {
    id: 26,
    title: "Keesaan Allah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Laa ilaaha illallaahu wahdahuu laa shariika lahu lahul mulku wa lahul hamdu wa huwa 'alaa kulli shay'in qadiir.",
    translation: "Tidak ada Tuhan selain Allah, Yang Maha Esa, tidak ada sekutu bagi-Nya, yang memiliki segala kerajaan/kekuasaan dan segala pujian hanya bagi-Nya, dan Dia berkuasa atas setiap sesuatu.",
    repeat: 3
  },
  {
    id: 27,
    title: "Pujian Dan Mohon Taubat",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَن لَّا إِلَهَ إِلَّا أَنتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhaanakallaahumma wa bihamdika ashhadu al-laa ilaaha illaa anta astaghfiruka wa atuubu ilayk.",
    translation: "Maha Suci Engkau, Ya Allah dan segala pujian bagi-Mu; aku bersaksi bahawa tiada Tuhan selain Allah, aku mohon ampun dan bertaubat pada-Mu.",
    repeat: 3
  },
  {
    id: 28,
    title: "Selawat Ke Atas Nabi",
    arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا عَدَدَ مَا أَحَاطَ بِهِ عِلْمُكَ وَخَطَّ بِهِ قَلَمُكَ وَأَحْصَاهُ كِتَابُكَ",
    transliteration: "Allaahumma salli 'alaa sayyidinaa Muhammadin 'abdika wa nabiyyika wa rasuulikal nabiyyil ummiyyi wa 'alaa aalihi wa sahbihii wa sallim tasliiman 'adada maa ahaata bihii 'ilmuka wa khatta bihii qalamuka wa ahshaahu kitaabuk.",
    translation: "Ya Allah restui dan berkatkanlah junjungan kami Muhammad sebagai hamba, nabi dan rasul-Mu yang ummi. Berkatkan keluarga dan sahabat Baginda. Sejahterakanlah Baginda selama-lamanya sebanyak-banyak bilangan dalam ilmu dan sebanyak-banyak perkara yang ditulis oleh Qalam-Mu dan sebanyak-banyak yang dirangkum oleh kitab-Mu.",
    repeat: 1
  },
  {
    id: 29,
    title: "Doa Selepas Wirid Ma'thurat",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ لِسَانًا رَطْبًا بِذِكْرِكَ وَقَلْبًا مُفْعَمًا بِشُكْرِكَ وَبَدَنًا لَيِّنًا بِطَاعَتِكَ اللَّهُمَّ إِنَّا نَسْأَلُكَ إِيمَانًا كَامِلًا وَنَسْأَلُكَ قَلْبًا خَاشِعًا وَنَسْأَلُكَ عِلْمًا نَافِعًا وَنَسْأَلُكَ يَقِينًا صَادِقًا وَنَسْأَلُكَ دِينًا قَيِّمًا وَنَسْأَلُكَ الْعَافِيَةَ مِن كُلِّ بَلِيَّةٍ وَنَسْأَلُكَ تَمَامَ الْغِنَى عَنِ النَّاسِ وَهَبْ لَنَا حَقِيقَةَ الْإِيمَانِ بِكَ حَتَّى لَا نَخَافُ وَلَا نَرْجُو غَيْرَكَ وَلَا نَعْبُدَ شَيْئًا سِوَاكَ وَاجْعَلْ يَدَكَ مَبْسُوطَةً عَلَيْنَا وَعَلَى أَهْلِينَا وَأَوْلَادِنَا وَمَن مَعَنَا بِرَحْمَتِكَ وَلَا تَكِلْنَا إِلَى أَنفُسِنَا طَرْفَةَ عَيْنٍ وَلَا أَقَلَّ مِن ذَلِكَ يَا نِعْمَ الْمُجِيبُ وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ",
    transliteration: "Allaahumma innaa nas'aluka lisaanaw ratbam bi dzikrika wa qalbam muf'amam bi shukrika wa badanal layyinam bi taa'atik. Allaahumma innaa nas'aluka iimaanan kaamilaw wa nas'aluka qalban khaashi'aw wa nas'aluka 'ilman naafi'aw wa nas'aluka yaqiinan saadiqaw wa nas'aluka diinan qayyimaw wa nas'aluka al'aafiyata min kulli baliyyatin wa nas'aluka tamaamal ghinaa 'anin naasi wa hab lanaa haqiiqatal iimaani bika hattaa laa nakhaafa wa laa narjuu ghayraka wa laa na'buda shay'an siwaaka waj'al yadaka mabsuutatun 'alaynaa wa 'alaa ahliinaa wa awlaadina wa man ma'anaa birahmatika wa laa takilnaa ilaa anfusinaa tarfata 'aynin wa laa aqalla min dzaalika yaa ni'mal mujiib wa sallallaahu 'alaa sayyidinaa Muhammadin an-nabiyyil kariimi wa 'alaa aalihii wa sahbihii ajma'iin.",
    translation: "Ya Allah kurniakanlah kami lisan (lidah) yang lembut membasahi mengingati dan menyebut (nama-Mu), hati yang penuh segar mensyukuri (nikmat-Mu), serta badan yang ringan menyempurnakan ketaatan kepada (perintah-Mu). Ya Allah, kurniakanlah kami iman yang sempurna, hati yang khusyuk, ilmu yang berguna, keyakinan yang benar-benar mantap, din (cara hidup) yang jitu dan unggul, selamat dari segala mara bahaya dan petaka. Kami mohon kepada-Mu Ya Allah kecukupan yang tidak perlu kami terpaksa meminta kepada orang lain. Berikanlah kami Ya Allah iman yang sebenarnya sehingga kami tidak menyekutukan-Mu. Berikanlah rahmat-Mu kepada kami, keluarga dan anak-anak kami serta sesiapa sahaja yang bersama-sama kami. Jangan (Ya Allah) Engkau biarkan nasib kami ditentukan oleh diri kami sendiri; walaupun hanya dalam sekelip mata atau lebih pendek dari masa itu. Wahai Tuhan yang paling mudah dan cepat memperkenankan permintaan. Selawat (berkat dan rahmat) dan restu Allah untuk junjungan kami Muhammad, nabi yang mulia, kepada keluarga Baginda dan para sahabat Baginda amnya.",
    repeat: 1
  },
  {
    id: 30,
    title: "Pengakuan Kepada Kekuasaan Allah (Ali Imraan 26-27)",
    arabic: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ وَتَنزِعُ الْمُلْكَ مِمَّن تَشَاءُ وَتُعِزُّ مَن تَشَاءُ وَتُذِلُّ مَن تَشَاءُ بِيَدِكَ الْخَيْرُ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ۝٢٦ تُولِجُ اللَّيْلَ فِي النَّهَارِ وَتُولِجُ النَّهَارَ فِي اللَّيْلِ وَتُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَتُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ وَتَرْزُقُ مَن تَشَاءُ بِغَيْرِ حِسَابٍ ۝٢٧",
    transliteration: "Qulillaahummaa maalikal mulki tu'til mulka man tashaa'u wa tanzi'ul mulka mimman tashaa'u wa tu'izzu man tashaa'u wa tudzillu man tashaa'u biyadikal khayru innaka 'alaa kulli shay'in qadiir. Tuulijul layla fin nahaari wa tuulijun nahaara fil layl, wa tukhrijul hayya minal mayyiti wa tukhrijul mayyita minal hayy, wa tarzuqu man tashaa'u bighayri hisaab.",
    translation: "Katakanlah (wahai Muhammad): 'Wahai Tuhan yang mempunyai kuasa pemerintahan! Engkaulah yang memberi kuasa pemerintahan kepada sesiapa yang Engkau kehendaki dan Engkaulah yang mencabut kuasa pemerintahan dari sesiapa yang Engkau kehendaki. Engkaulah juga yang memuliakan sesiapa yang Engkau kehendaki, dan Engkaulah yang menghina sesiapa yang Engkau kehendaki. Dalam kekuasaan Engkaulah sahaja adanya segala kebaikan. Sesungguhnya Engkau Maha Kuasa atas tiap-tiap sesuatu. Engkaulah (wahai Tuhan) yang memasukkan waktu malam ke dalam waktu siang, dan Engkaulah yang memasukkan waktu siang ke dalam waktu malam. Engkaulah juga yang mengeluarkan sesuatu yang hidup dari benda yang mati, dan Engkaulah yang mengeluarkan benda yang mati dari sesuatu yang hidup. Engkau jualah yang memberi rezeki sesiapa yang Engkau kehendaki dengan tiada hitungan hisabnya.'",
    repeat: 1
  },
  {
    id: 31,
    title: "Doa Rabitah",
    arabic: "اللَّهُمَّ إِنَّ هَذَا إِقْبَالُ لَيْلِكَ وَإِدْبَارُ نَهَارِكَ وَأَصْوَاتُ دُعَاءِكَ فَاغْفِرْ لِي. اللَّهُمَّ إِنَّكَ تَعْلَمُ أَنَّ هَذِهِ الْقُلُوبَ قَدِ اجْتَمَعَتْ عَلَى مَحَبَّتِكَ وَالْتَقَتْ عَلَى طَاعَتِكَ وَتَوَحَّدَتْ عَلَى دَعْوَتِكَ وَتَعَاهَدَتْ عَلَى نُصْرَةِ شَرِيعَتِكَ فَوَثِّقِ اللَّهُمَّ رَابِطَتَهَا وَأَدِمْ وُدَّهَا وَاهْدِهَا سُبُلَهَا وَامْلَأْهَا بِنُورِكَ الَّذِي لَا يَخْبُو وَاشْرَحْ صُدُورَهَا بِفَيْضِ الْإِيمَانِ وَجَمِيلِ التَّوَكُّلِ عَلَيْكَ وَأَحْيِهَا بِمَعْرِفَتِكَ وَأَمِتْهَا عَلَى الشَّهَادَةِ فِي سَبِيلِكَ إِنَّكَ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ وَصَلَّى اللَّهُمَّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ آمِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    transliteration: "Allaahumma inna hadzaa iqbaalu laylika wa idbaaru nahaarika wa ashwaatu du'aa'ika faghfir lii. Allaahumma innaka ta'lamu anna haadzihil quluuba qadij tama'at 'alaa mahabbatika wal taqat 'alaa taa'atika wa tawahhada 'alaa da'watika wa ta'aahadat 'alaa nusrati shariitatika, fa wathiqil llaahumma raabita tahaa wa adim wuddahaa wa hdiha subalahaa wam la'haa bi nuurikal lazii laa yakhbuu wash rah suduurahaa bifaydil iimaani wa jamiilut tawakkuli 'alayka wa ahyihaa bima'rifatika wa amithaa 'alash shahaadati fii sabiilika innaka ni'mal mawlaa wa ni'man nasiir. Wa sallallaahu 'alaa sayyidinaa Muhammadin wa 'alaa aalihii wa sahbihii wa sallama, aamiin, walhamdu lillaahi rabbil 'aalamiin.",
    translation: "Ya Allah, menjelanglah malam (ciptaan-Mu), beredarlah waktu siang kepada-Mu, inilah keluhan suara yang berdoa kepada-Mu, oleh itu ampunkanlah dosaku. Ya Allah Engkau mengetahui bahawa hati-hati ini (orang yang telah dibayangkan tadi) telah berkumpul kerana mengasihi-Mu, bertemu untuk mematuhi (perintah-Mu), bersatu memikul beban dakwah-Mu, hati-hati ini telah mengikat janji setia untuk mendaulat dan menyokong syariat-Mu, maka eratkanlah Ya Allah akan ikatannya. Kekalkan kemesraan antara hati-hati ini akan jalan-Nya (yang sebenar). Penuhkan (piala) hati ini dengan cahaya Rabbani-Mu yang tidak kunjung malap. Lapangkanlah hati-hati ini dengan limpahan iman/keyakinan dan keindahan tawakkal kepada-Mu. Hidup suburkan hati-hati ini dengan ma'rifat (pengetahuan sebenar) tentang-Mu. (Jika Engkau mentakdirkan mati) maka matikanlah pemilik hati-hati ini sebagai para syuhada dalam perjuangan agama-Mu. Engkaulah sebaik-baik Sandaran dan sebaik-baik Penolong. Ya Allah, restuilah dan sejahterakanlah junjungan kami Muhammad, keluarga dan para sahabat Baginda semuanya, Ya Allah perkenankanlah doa ini (Amin) dan segala puji bagi Allah Tuhan sekalian alam.",
    repeat: 1
  }
];
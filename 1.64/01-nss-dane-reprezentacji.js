/*
 * NSS — dane reprezentacji i sytuacje meczowe
 * Wydzielone z Polska Kariera v0.69.
 * Ładować przed 02-nss-silnik-meczowy.js i 03-nss-turnieje.js.
 */
(function (global) {
  'use strict';

  // Skala gry, kalibrowana względem rankingu FIFA z 20.07.2026.
  // Pełna pula FIFA poza świadomie wykluczonymi: Rosją, Białorusią i Izraelem.
  const TEAM_ROWS = [
    ['Argentyna','Ameryka Południowa',97],['Boliwia','Ameryka Południowa',73],
    ['Brazylia','Ameryka Południowa',94],['Chile','Ameryka Południowa',80],
    ['Ekwador','Ameryka Południowa',84],['Kolumbia','Ameryka Południowa',88],
    ['Paragwaj','Ameryka Południowa',86],['Peru','Ameryka Południowa',80],
    ['Urugwaj','Ameryka Południowa',86],['Wenezuela','Ameryka Południowa',74],

    ['Albania','Europa',78],['Andora','Europa',57],['Anglia','Europa',93],
    ['Armenia','Europa',65],['Austria','Europa',85],['Azerbejdżan','Europa',73],
    ['Belgia','Europa',90],
    ['Bośnia i Hercegowina','Europa',78],['Bułgaria','Europa',74],
    ['Chorwacja','Europa',87],['Cypr','Europa',68],['Czarnogóra','Europa',76],
    ['Czechy','Europa',80],['Dania','Europa',85],['Estonia','Europa',66],
    ['Finlandia','Europa',74],['Francja','Europa',95],['Gibraltar','Europa',58],
    ['Grecja','Europa',81],['Gruzja','Europa',82],['Hiszpania','Europa',98],
    ['Holandia','Europa',91],['Irlandia','Europa',79],['Irlandia Północna','Europa',78],
    ['Islandia','Europa',77],['Kazachstan','Europa',70],
    ['Kosowo','Europa',74],['Liechtenstein','Europa',43],['Litwa','Europa',67],
    ['Luksemburg','Europa',73],['Łotwa','Europa',67],
    ['Macedonia Północna','Europa',77],['Malta','Europa',65],['Mołdawia','Europa',71],
    ['Niemcy','Europa',90],
    ['Norwegia','Europa',90],['Polska','Europa',85],['Portugalia','Europa',90],
    ['Rumunia','Europa',81],['San Marino','Europa',24],['Serbia','Europa',84],
    ['Słowacja','Europa',79],['Słowenia','Europa',80],['Szkocja','Europa',86],
    ['Szwajcaria','Europa',87],['Szwecja','Europa',82],['Turcja','Europa',86],
    ['Ukraina','Europa',84],['Walia','Europa',82],['Węgry','Europa',82],
    ['Włochy','Europa',88],['Wyspy Owcze','Europa',66],

    ['Kanada','Ameryka Północna',83],['Meksyk','Ameryka Północna',88],
    ['USA','Ameryka Północna',89],

    ['Algieria','Afryka',85],['Angola','Afryka',78],['Benin','Afryka',74],
    ['Botswana','Afryka',68],['Burkina Faso','Afryka',79],['Burundi','Afryka',64],
    ['Czad','Afryka',54],
    ['DR Konga','Afryka',81],['Egipt','Afryka',88],['Ghana','Afryka',81],
    ['Dżibuti','Afryka',49],['Erytrea','Afryka',54],['Eswatini','Afryka',59],
    ['Etiopia','Afryka',64],['Gabon','Afryka',76],['Gambia','Afryka',69],
    ['Gwinea','Afryka',76],['Gwinea Bissau','Afryka',66],
    ['Gwinea Równikowa','Afryka',72],['Kamerun','Afryka',81],
    ['Kenia','Afryka',72],['Komory','Afryka',71],['Kongo','Afryka',66],
    ['Lesotho','Afryka',63],['Liberia','Afryka',65],['Libia','Afryka',71],
    ['Madagaskar','Afryka',72],['Malawi','Afryka',67],['Mali','Afryka',79],
    ['Maroko','Afryka',94],['Namibia','Afryka',69],['Nigeria','Afryka',86],
    ['Mauritius','Afryka',56],['Mauretania','Afryka',70],['Mozambik','Afryka',72],
    ['Niger','Afryka',70],['Republika Zielonego Przylądka','Afryka',85],
    ['Republika Środkowoafrykańska','Afryka',65],['RPA','Afryka',84],
    ['Rwanda','Afryka',72],['Senegal','Afryka',90],['Seszele','Afryka',44],
    ['Sierra Leone','Afryka',68],['Somalia','Afryka',47],
    ['Sudan','Afryka',72],['Sudan Południowy','Afryka',58],
    ['São Tomé i Príncipe','Afryka',49],['Tanzania','Afryka',70],
    ['Togo','Afryka',69],['Tunezja','Afryka',80],
    ['Uganda','Afryka',72],
    ['Wybrzeże Kości Słoniowej','Afryka',84],['Zambia','Afryka',75],
    ['Zimbabwe','Afryka',67],

    ['Afganistan','Azja',57],['Arabia Saudyjska','Azja',80],
    ['Bahrajn','Azja',67],['Bangladesz','Azja',52],
    ['Bhutan','Azja',50],['Brunei','Azja',45],['Chiny','Azja',73],
    ['Filipiny','Azja',64],['Hongkong','Azja',62],['Indie','Azja',63],
    ['Guam','Azja',43],['Indonezja','Azja',68],['Irak','Azja',77],['Iran','Azja',84],
    ['Japonia','Azja',90],['Jordania','Azja',75],['Kambodża','Azja',59],
    ['Katar','Azja',77],['Kirgistan','Azja',60],['Korea Południowa','Azja',83],
    ['Korea Północna','Azja',68],
    ['Kuwejt','Azja',69],['Laos','Azja',56],['Liban','Azja',67],['Makau','Azja',44],
    ['Malediwy','Azja',55],['Malezja','Azja',67],['Mjanma','Azja',57],
    ['Mongolia','Azja',54],['Nepal','Azja',56],['Oman','Azja',65],
    ['Pakistan','Azja',48],['Palestyna','Azja',70],['Singapur','Azja',61],
    ['Sri Lanka','Azja',53],['Syria','Azja',73],
    ['Tadżykistan','Azja',58],['Tajlandia','Azja',69],['Tajwan','Azja',69],
    ['Timor Wschodni','Azja',43],['Turkmenistan','Azja',64],
    ['Uzbekistan','Azja',78],['Wietnam','Azja',69],['Jemen','Azja',62],
    ['ZEA','Azja',74],

    ['Australia','Oceania',83],['Fidżi','Oceania',62],['Nowa Kaledonia','Oceania',63],
    ['Nowa Zelandia','Oceania',80],['Papua-Nowa Gwinea','Oceania',61],
    ['Samoa','Oceania',48],['Samoa Amerykańskie','Oceania',42],['Tahiti','Oceania',65],
    ['Tonga','Oceania',45],['Vanuatu','Oceania',59],['Wyspy Cooka','Oceania',43],
    ['Wyspy Salomona','Oceania',67],

    ['Anguilla','Ameryka Środkowa',41],['Antigua i Barbuda','Ameryka Środkowa',59],
    ['Aruba','Ameryka Środkowa',52],['Bahamy','Ameryka Środkowa',43],
    ['Barbados','Ameryka Środkowa',55],['Belize','Ameryka Środkowa',55],
    ['Bermudy','Ameryka Środkowa',58],['Brytyjskie Wyspy Dziewicze','Ameryka Środkowa',42],
    ['Curaçao','Ameryka Środkowa',73],['Dominika','Ameryka Środkowa',54],
    ['Dominikana','Ameryka Środkowa',64],['Grenada','Ameryka Środkowa',59],
    ['Gujana','Ameryka Środkowa',62],['Gwatemala','Ameryka Środkowa',70],
    ['Haiti','Ameryka Środkowa',75],['Honduras','Ameryka Środkowa',72],
    ['Jamajka','Ameryka Środkowa',78],['Kajmany','Ameryka Środkowa',48],
    ['Kostaryka','Ameryka Środkowa',78],['Kuba','Ameryka Środkowa',66],
    ['Montserrat','Ameryka Środkowa',55],['Nikaragua','Ameryka Środkowa',68],
    ['Panama','Ameryka Środkowa',79],['Portoryko','Ameryka Środkowa',61],
    ['Saint Kitts i Nevis','Ameryka Środkowa',62],
    ['Saint Lucia','Ameryka Środkowa',58],
    ['Saint Vincent i Grenadyny','Ameryka Środkowa',57],
    ['Salwador','Ameryka Środkowa',67],['Surinam','Ameryka Środkowa',68],
    ['Trynidad i Tobago','Ameryka Środkowa',70],
    ['Turks i Caicos','Ameryka Środkowa',44],
    ['Wyspy Dziewicze Stanów Zjednoczonych','Ameryka Środkowa',42]
  ];

  function tierFromOvr(ovr) {
    if (ovr >= 89) return 1;
    if (ovr >= 84) return 2;
    if (ovr >= 78) return 3;
    if (ovr >= 68) return 4;
    return 5;
  }

  const teams = TEAM_ROWS.map(([name, zone, baseOvr]) => ({
    name,
    zone,
    baseOvr,
    tier: tierFromOvr(baseOvr),
    range: [Math.max(1, baseOvr - 2), Math.min(99, baseOvr + 2)]
  }));

  const situations = {
    ATAK: [
      {text:'Wychodzisz sam na sam z obrońcą na 18. metrze.',options:[
        {label:'Strzelam od razu',tag:'shot_direct'},
        {label:'Próbuję zmylić obrońcę dryblingiem',tag:'dribble_risky'},
        {label:'Zwalniam, szukam lepszej pozycji',tag:'pass_safe'}]},
      {text:'Piłka odbija się do Ciebie w polu karnym, bramkarz wyszedł do przodu.',options:[
        {label:'Uderzenie w pierwszej piłce',tag:'shot_direct'},
        {label:'Próbuję przelobować bramkarza',tag:'shot_chip'},
        {label:'Przyjęcie i podanie do wolnego kolegi',tag:'pass_safe'}]},
      {text:'Dośrodkowanie leci prosto na Ciebie w polu karnym.',options:[
        {label:'Strzał głową',tag:'shot_header'},
        {label:'Zgranie głową do kolegi z tyłu',tag:'pass_safe'}]},
      {text:'Masz przestrzeń 20 metrów od bramki, nikt Cię nie atakuje.',options:[
        {label:'Strzał z dystansu',tag:'shot_long'},
        {label:'Podanie prostopadłe do napastnika',tag:'pass_risky'},
        {label:'Trzymam piłkę, czekam na wsparcie',tag:'hold_up'}]},
      {text:'Dryblujesz w polu karnym, dwóch obrońców blokuje drogę.',options:[
        {label:'Próbuję przejść siłą',tag:'dribble_risky'},
        {label:'Cofam piłkę, budujemy jeszcze raz',tag:'pass_safe'},
        {label:'Trzymam piłkę, czekam na wsparcie',tag:'hold_up'}]},
      {text:'Masz rzut wolny w dogodnej pozycji pod polem karnym.',options:[
        {label:'Uderzam sam',tag:'shot_setpiece'},
        {label:'Wystawiam koledze do dogrania',tag:'pass_safe'}]}
    ],
    SRODEK: [
      {text:'Masz piłkę na środku pola, obrona rywala się cofa.',options:[
        {label:'Podanie proste, budujemy spokojnie',tag:'pass_safe'},
        {label:'Podanie prostopadłe za linię obrony',tag:'pass_risky'},
        {label:'Sam ruszam do przodu z piłką',tag:'dribble_risky'}]},
      {text:'Rywal naciska wysoko, masz ułamek sekundy na decyzję.',options:[
        {label:'Oddaję piłkę najbliższemu koledze',tag:'pass_safe'},
        {label:'Próbuję zwodu i wyjścia z presji',tag:'dribble_risky'},
        {label:'Trzymam piłkę, osłaniam ciałem',tag:'hold_up'}]},
      {text:'Widzisz niepilnowanego napastnika w polu karnym.',options:[
        {label:'Bezpieczne podanie do nogi',tag:'pass_safe'},
        {label:'Ryzykowne podanie w bieg za obrońców',tag:'pass_risky'}]},
      {text:'Masz czas na rozegranie rzutu rożnego.',options:[
        {label:'Krótki, bezpieczny wariant',tag:'pass_safe'},
        {label:'Dośrodkowanie prosto w pole karne',tag:'pass_risky'}]},
      {text:'Ruszasz kontratakiem przez środek pola.',options:[
        {label:'Zwalniam grę, czekam na wsparcie',tag:'pass_safe'},
        {label:'Idę na przyspieszenie',tag:'dribble_risky'},
        {label:'Podaję prostopadle za obronę',tag:'pass_risky'}]},
      {text:'Piłka wraca do Ciebie po rozegranym stałym fragmencie.',options:[
        {label:'Uderzenie z dystansu',tag:'shot_long'},
        {label:'Rozgrywam do skrzydła',tag:'pass_safe'}]}
    ],
    OBRONA: [
      {text:'Napastnik rywala idzie sam na Ciebie.',options:[
        {label:'Wchodzę ostro w odbiór',tag:'tackle_hard'},
        {label:'Spycham go na bok, gram bezpiecznie',tag:'tackle_safe'},
        {label:'Celowo fauluję, zatrzymuję kontrę',tag:'tackle_professional'}]},
      {text:'Dośrodkowanie leci w pole karne, trwa walka w powietrzu.',options:[
        {label:'Idę w pojedynek powietrzny',tag:'tackle_hard'},
        {label:'Ustawiam się i wybijam na róg',tag:'tackle_safe'}]},
      {text:'Rywal próbuje minąć Cię dryblingiem.',options:[
        {label:'Agresywny odbiór',tag:'tackle_hard'},
        {label:'Cierpliwie czekam na jego błąd',tag:'tackle_safe'},
        {label:'Celowo fauluję, zatrzymuję akcję',tag:'tackle_professional'}]},
      {text:'Masz piłkę pod presją na własnej połowie.',options:[
        {label:'Krótkie, bezpieczne wybicie',tag:'pass_safe'},
        {label:'Próbuję rozegrać od tyłu',tag:'pass_risky'},
        {label:'Trzymam piłkę, czekam na wsparcie',tag:'hold_up'}]},
      {text:'Rzut wolny rywala niedaleko Twojego pola karnego.',options:[
        {label:'Wchodzę w mur, blokuję strzał',tag:'tackle_hard'},
        {label:'Pilnuję rywala przy słupku',tag:'tackle_safe'}]},
      {text:'Sytuacja sam na sam w polu karnym — tylko Ty i napastnik rywala.',options:[
        {label:'Idę zdecydowanie w odbiór',tag:'tackle_hard'},
        {label:'Zwlekam, licząc na jego błąd',tag:'tackle_safe'},
        {label:'Celowo fauluję, nie dam mu strzelić',tag:'tackle_professional'}]}
    ]
  };

  global.NSSNationalData = Object.freeze({
    version: '1.44-user-calibration',
    teams,
    situations,
    scorerRoles: ['napastnik','napastnik','napastnik','pomocnik','pomocnik','obrońca'],
    config: Object.freeze({
      polandBaseOvr: 85,
      tournamentFormSpread: 2,
      goldenGenerationChance: 8,
      goldenGenerationOvr: [90, 91, 92],
      worldSlots: Object.freeze({
        UEFA:{direct:16,playoff:0},
        AFC:{direct:8,playoff:1},
        CAF:{direct:9,playoff:1},
        CONCACAF:{direct:6,playoff:2},
        CONMEBOL:{direct:6,playoff:1},
        OFC:{direct:1,playoff:1}
      }),
      // Jeden rzut 1–100. referenceOvr oznacza 50% szans, a perOvr
      // mówi, o ile punktów procentowych zmienia szansę każdy punkt OVR.
      qualificationModels: Object.freeze({
        WORLD:Object.freeze({
          UEFA:{referenceOvr:85,perOvr:4,min:5,max:95},
          CAF:{referenceOvr:83,perOvr:4,min:5,max:95},
          AFC:{referenceOvr:79,perOvr:4,min:5,max:95},
          CONCACAF:{referenceOvr:78,perOvr:4,min:5,max:95},
          CONMEBOL:{referenceOvr:80,perOvr:4,min:5,max:95},
          OFC:{referenceOvr:70,perOvr:6,min:2,max:95}
        }),
        EURO:Object.freeze({UEFA:{referenceOvr:80,perOvr:5,min:5,max:95}}),
        AFCON:Object.freeze({CAF:{referenceOvr:73,perOvr:4,min:5,max:95}}),
        ASIAN_CUP:Object.freeze({AFC:{referenceOvr:65,perOvr:4,min:5,max:95}}),
        GOLD_CUP:Object.freeze({CONCACAF:{referenceOvr:65,perOvr:4,min:5,max:95}}),
        COPA_AMERICA:Object.freeze({CONMEBOL:{automatic:true}}),
        OFC_NATIONS_CUP:Object.freeze({OFC:{automatic:true}})
      }),
      ofcNationsCup:Object.freeze({firstYear:2028,interval:4,automaticEntry:true})
    })
  });
})(typeof window !== 'undefined' ? window : globalThis);


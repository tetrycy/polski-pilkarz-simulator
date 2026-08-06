/*
 * Polski Piłkarz Simulator — barwy klubów, województw i krajów.
 *
 * primary   = dominujące tło oferty
 * secondary = napis i obramowanie
 * shadow    = opcjonalny trzeci kolor cienia
 *
 * Plik jest celowo oddzielony od danych sportowych. Kolejne kluby można
 * dopisywać bez dotykania silnika transferów. W Polsce ręczne barwy obejmują
 * Ekstraklasę–III ligę, a IV liga i niższe szczeble korzystają z barw
 * województwa. Zagraniczne tiery 1–3 mają ręcznie przypisane rzeczywiste
 * barwy klubowe, a tier 4 i niższe korzystają z barw kraju.
 */
(() => {
  const CLUB_COLOURS={
    // Ekstraklasa
    'Śląsk Wrocław':{primary:'#176b3a',secondary:'#ffffff'},
    'Zagłębie Lubin':{primary:'#e86f19',secondary:'#171717'},
    'Motor Lublin':{primary:'#0757a6',secondary:'#ffd22e'},
    'Widzew Łódź':{primary:'#b7192d',secondary:'#ffffff'},
    'Cracovia':{primary:'#c71f2d',secondary:'#ffffff'},
    'Wieczysta Kraków':{primary:'#f2c400',secondary:'#171717'},
    'Wisła Kraków':{primary:'#bf1e2e',secondary:'#ffffff'},
    'Legia Warszawa':{primary:'#ffffff',secondary:'#17633b'},
    'Radomiak Radom':{primary:'#14713d',secondary:'#ffffff'},
    'Wisła Płock':{primary:'#1764ad',secondary:'#ffffff'},
    'Jagiellonia Białystok':{primary:'#f2c400',secondary:'#a91524'},
    'GKS Katowice':{primary:'#176c3a',secondary:'#f6d22d'},
    'Górnik Zabrze':{primary:'#1875bb',secondary:'#ffffff'},
    'Piast Gliwice':{primary:'#1457a3',secondary:'#ffffff'},
    'Raków Częstochowa':{primary:'#b7192d',secondary:'#dce9ff'},
    'Korona Kielce':{primary:'#f0c900',secondary:'#a81525'},
    'Lech Poznań':{primary:'#0757a6',secondary:'#ffffff'},
    'Pogoń Szczecin':{primary:'#142b53',secondary:'#efb7c0'},

    // I liga
    'Chrobry Głogów':{primary:'#e66a1c',secondary:'#171717'},
    'Miedź Legnica':{primary:'#176b3a',secondary:'#ffffff'},
    'ŁKS Łódź':{primary:'#ffffff',secondary:'#b7192d'},
    'Unia Skierniewice':{primary:'#f1c900',secondary:'#154d91'},
    'Bruk-Bet Termalica Nieciecza':{primary:'#e96719',secondary:'#163c77'},
    'Puszcza Niepołomice':{primary:'#f0cf26',secondary:'#176b3a'},
    'Pogoń Grodzisk Mazowiecki':{primary:'#b7192d',secondary:'#ffffff'},
    'Pogoń Siedlce':{primary:'#175aa5',secondary:'#ffffff'},
    'Polonia Warszawa':{primary:'#171717',secondary:'#ffffff'},
    'Odra Opole':{primary:'#176ab4',secondary:'#ffffff'},
    'Stal Mielec':{primary:'#ffffff',secondary:'#1762a4'},
    'Stal Rzeszów':{primary:'#1764ad',secondary:'#ffffff'},
    'Arka Gdynia':{primary:'#f0cc20',secondary:'#154c8e'},
    'Lechia Gdańsk':{primary:'#16713c',secondary:'#ffffff'},
    'Podbeskidzie Bielsko-Biała':{primary:'#b7192d',secondary:'#dce9ff'},
    'Polonia Bytom':{primary:'#195da6',secondary:'#e9b8c0'},
    'Ruch Chorzów':{primary:'#176fba',secondary:'#ffffff'},
    'Warta Poznań':{primary:'#176b3a',secondary:'#ffffff'},

    // II liga
    'Olimpia Grudziądz':{primary:'#176b3a',secondary:'#ffffff'},
    'Zawisza Bydgoszcz':{primary:'#174f94',secondary:'#ffffff'},
    'Avia Świdnik':{primary:'#f0c900',secondary:'#154e91'},
    'Górnik Łęczna':{primary:'#176b3a',secondary:'#f2d52b'},
    'Lechia Zielona Góra':{primary:'#176b3a',secondary:'#ffffff'},
    'Hutnik Kraków':{primary:'#207cb8',secondary:'#ffffff'},
    'Podhale Nowy Targ':{primary:'#ffffff',secondary:'#1761a5'},
    'Sandecja Nowy Sącz':{primary:'#171717',secondary:'#ffffff'},
    'Znicz Pruszków':{primary:'#f0c900',secondary:'#a81725'},
    'Resovia':{primary:'#ffffff',secondary:'#b7192d'},
    'Stal Stalowa Wola':{primary:'#176b3a',secondary:'#ffffff'},
    'Chojniczanka Chojnice':{primary:'#f0c900',secondary:'#a81725'},
    'GKS Tychy':{primary:'#176b3a',secondary:'#ffffff'},
    'Rekord Bielsko-Biała':{primary:'#176b3a',secondary:'#ffffff'},
    'Sokół Kleczew':{primary:'#176b3a',secondary:'#ffffff'},
    'Świt Szczecin':{primary:'#1768ad',secondary:'#ffffff'},

    // III liga — barwy klubowe. Trzeci kolor, jeżeli istnieje, pracuje jako cień.
    'Barycz Sułów':{primary:'#ffffff',secondary:'#e76f20'},
    'Górnik Polkowice':{primary:'#176b3a',secondary:'#ffffff',shadow:'#171717'},
    'Karkonosze Jelenia Góra':{primary:'#1765ad',secondary:'#f2ce2a'},
    'Ślęza Wrocław':{primary:'#f2ce2a',secondary:'#b7192d'},
    'Chemik Bydgoszcz':{primary:'#1765ad',secondary:'#ffffff'},
    'Elana Toruń':{primary:'#f2ce2a',secondary:'#175ba7'},
    'Wda Świecie':{primary:'#1765ad',secondary:'#ffffff',shadow:'#c82032'},
    'Chełmianka Chełm':{primary:'#ffffff',secondary:'#176b3a'},
    'Hetman Zamość':{primary:'#176b3a',secondary:'#ffffff',shadow:'#c82032'},
    'Podlasie Biała Podlaska':{primary:'#ffffff',secondary:'#176b3a',shadow:'#f2ce2a'},
    'Carina Gubin':{primary:'#176b3a',secondary:'#ffffff',shadow:'#171717'},
    'Odra Bytom Odrzański':{primary:'#f2ce2a',secondary:'#175ba7'},
    'Stilon Gorzów Wielkopolski':{primary:'#175ba7',secondary:'#ffffff'},
    'Warta Gorzów Wielkopolski':{primary:'#175ba7',secondary:'#ffffff',shadow:'#7c2344'},
    'Lechia Tomaszów Mazowiecki':{primary:'#176b3a',secondary:'#ffffff',shadow:'#c82032'},
    'Pelikan Łowicz':{primary:'#ffffff',secondary:'#176b3a'},
    'Warta Sieradz':{primary:'#ffffff',secondary:'#176b3a'},
    'Wiślanie Skawina':{primary:'#172b64',secondary:'#ffffff',shadow:'#c82032'},
    'KS CK Troszyn':{primary:'#171717',secondary:'#f2ce2a'},
    'KTS Weszło Warszawa':{primary:'#171717',secondary:'#ffffff',shadow:'#c82032'},
    'Mazovia Mińsk Mazowiecki':{primary:'#c82032',secondary:'#ffffff',shadow:'#175ba7'},
    'Mławianka Mława':{primary:'#176b3a',secondary:'#ffffff'},
    'Świt Nowy Dwór Mazowiecki':{primary:'#ffffff',secondary:'#176b3a'},
    'Ząbkovia Ząbki':{primary:'#172b64',secondary:'#ffffff',shadow:'#c82032'},
    'MKS Kluczbork':{primary:'#175ba7',secondary:'#ffffff'},
    'Polonia Nysa':{primary:'#175ba7',secondary:'#ffffff',shadow:'#c82032'},
    'Stal Brzeg':{primary:'#175ba7',secondary:'#ffffff'},
    'JKS Jarosław':{primary:'#175ba7',secondary:'#ffffff'},
    'Pogoń-Sokół Lubaczów':{primary:'#c82032',secondary:'#ffffff',shadow:'#175ba7'},
    'Siarka Tarnobrzeg':{primary:'#176b3a',secondary:'#ffffff',shadow:'#171717'},
    'Sokół Kolbuszowa Dolna':{primary:'#176b3a',secondary:'#ffffff'},
    'Wisłoka Dębica':{primary:'#ffffff',secondary:'#176b3a'},
    'ŁKS Łomża':{primary:'#c82032',secondary:'#ffffff'},
    'Olimpia Zambrów':{primary:'#175ba7',secondary:'#ffffff'},
    'Wigry Suwałki':{primary:'#175ba7',secondary:'#ffffff'},
    'Gedania Gdańsk':{primary:'#c82032',secondary:'#ffffff'},
    'Grom Nowy Staw':{primary:'#175ba7',secondary:'#f2ce2a'},
    'Wikęd Luzino':{primary:'#c82032',secondary:'#ffffff',shadow:'#171717'},
    'LKS Goczałkowice-Zdrój':{primary:'#f2ce2a',secondary:'#175ba7'},
    'ROW Rybnik':{primary:'#176b3a',secondary:'#ffffff',shadow:'#171717'},
    'Sparta Katowice':{primary:'#175ba7',secondary:'#ffffff'},
    'Zagłębie Sosnowiec':{primary:'#ffffff',secondary:'#c82032',shadow:'#176b3a'},
    'AKS 1947 Busko-Zdrój':{primary:'#175ba7',secondary:'#ffffff'},
    'Czarni Połaniec':{primary:'#171717',secondary:'#f2ce2a'},
    'KSZO Ostrowiec Świętokrzyski':{primary:'#e86f19',secondary:'#171717'},
    'Moravia Morawica':{primary:'#176b3a',secondary:'#ffffff'},
    'Naprzód Jędrzejów':{primary:'#175ba7',secondary:'#ffffff'},
    'Star Starachowice':{primary:'#176b3a',secondary:'#ffffff',shadow:'#171717'},
    'Olimpia Elbląg':{primary:'#f2ce2a',secondary:'#175ba7'},
    'Polonia Lidzbark Warmiński':{primary:'#c82032',secondary:'#ffffff',shadow:'#175ba7'},
    'KKS Kalisz':{primary:'#175ba7',secondary:'#ffffff'},
    'Kotwica Kórnik':{primary:'#175ba7',secondary:'#ffffff'},
    'Lipno Stęszew':{primary:'#c82032',secondary:'#ffffff'},
    'Noteć Czarnków':{primary:'#175ba7',secondary:'#ffffff'},
    'Polonia Środa Wielkopolska':{primary:'#172b64',secondary:'#ffffff',shadow:'#7c2344'},
    'Unia Swarzędz':{primary:'#175ba7',secondary:'#ffffff'},
    'Victoria Września':{primary:'#176b3a',secondary:'#ffffff'},
    'Bałtyk Koszalin':{primary:'#175ba7',secondary:'#ffffff'},
    'Błękitni Stargard':{primary:'#175ba7',secondary:'#ffffff'},
    'Flota Świnoujście':{primary:'#175ba7',secondary:'#ffffff'},
    'Kluczevia Stargard':{primary:'#c82032',secondary:'#ffffff',shadow:'#175ba7'},

    // Zagraniczny tier 1 — proste, rozpoznawalne barwy największych klubów.
    'FC Barcelona':{primary:'#172b64',secondary:'#e8b5c1',shadow:'#8a1836'},
    'Real Madryt':{primary:'#ffffff',secondary:'#56338a',shadow:'#d2a928'},
    'Arsenal':{primary:'#c82032',secondary:'#ffffff',shadow:'#172b64'},
    'Bayern Monachium':{primary:'#c82032',secondary:'#ffffff',shadow:'#172b64'},
    'Paris Saint-Germain':{primary:'#172b64',secondary:'#ffffff',shadow:'#c82032'},
    'Inter':{primary:'#175ba7',secondary:'#ffffff',shadow:'#171717'},
    'Liverpool':{primary:'#b7192d',secondary:'#ffffff'},
    'Manchester City':{primary:'#8dc8e8',secondary:'#172b64',shadow:'#ffffff'},
    'Atlético Madryt':{primary:'#c82032',secondary:'#ffffff',shadow:'#175ba7'},
    'Chelsea':{primary:'#174f94',secondary:'#ffffff'}
  };

  // Zagraniczny tier 2 — indywidualne, rzeczywiste barwy klubowe.
  Object.assign(CLUB_COLOURS,{
    // Anglia
    'Aston Villa':{primary:'#6a1d45',secondary:'#95cdea'},
    'Bournemouth':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Brentford':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Brighton':{primary:'#0057b8',secondary:'#ffffff'},
    'Everton':{primary:'#003399',secondary:'#ffffff'},
    'Fulham':{primary:'#ffffff',secondary:'#171717',shadow:'#cc1f2f'},
    'Hull City':{primary:'#f5a623',secondary:'#171717'},
    'Ipswich Town':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},
    'Leeds United':{primary:'#ffffff',secondary:'#1d428a',shadow:'#f5cf29'},
    'Manchester United':{primary:'#da291c',secondary:'#ffffff',shadow:'#171717'},
    'Newcastle United':{primary:'#171717',secondary:'#ffffff'},
    'Nottingham Forest':{primary:'#dd0000',secondary:'#ffffff'},
    'Sunderland':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Tottenham':{primary:'#ffffff',secondary:'#132257'},

    // Argentyna
    'Boca Juniors':{primary:'#0b3d91',secondary:'#f5c400'},
    'River Plate':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},

    // Belgia
    'Club Brugge':{primary:'#0057b8',secondary:'#171717'},
    'RSC Anderlecht':{primary:'#552583',secondary:'#ffffff'},

    // Francja
    'AS Monaco':{primary:'#d71920',secondary:'#ffffff'},
    'Lille OSC':{primary:'#d71920',secondary:'#ffffff',shadow:'#172b64'},
    'Olympique Lyon':{primary:'#ffffff',secondary:'#174f9b',shadow:'#d71920'},
    'Olympique Marsylia':{primary:'#ffffff',secondary:'#2faee0'},

    // Grecja
    'Olympiakos':{primary:'#d71920',secondary:'#ffffff'},
    'Panathinaikos':{primary:'#087a3d',secondary:'#ffffff'},

    // Hiszpania
    'Athletic Bilbao':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Real Betis':{primary:'#168a45',secondary:'#ffffff'},
    'Real Sociedad':{primary:'#1769aa',secondary:'#ffffff'},
    'Sevilla':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},
    'Valencia':{primary:'#ffffff',secondary:'#171717',shadow:'#f28c28'},
    'Villarreal':{primary:'#f5d328',secondary:'#174f9b'},

    // Holandia
    'Ajax':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},
    'Feyenoord':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'PSV Eindhoven':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},

    // Meksyk
    'Guadalajara':{primary:'#d71920',secondary:'#ffffff',shadow:'#172b64'},

    // Niemcy
    'Bayer Leverkusen':{primary:'#d71920',secondary:'#171717'},
    'Borussia Dortmund':{primary:'#f6d900',secondary:'#171717'},
    'Eintracht Frankfurt':{primary:'#171717',secondary:'#ffffff',shadow:'#d71920'},
    'RB Leipzig':{primary:'#ffffff',secondary:'#d71920',shadow:'#174f9b'},
    'Union Berlin':{primary:'#d71920',secondary:'#ffffff',shadow:'#f5cf29'},
    'VfB Stuttgart':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},

    // Portugalia
    'Benfica':{primary:'#d71920',secondary:'#ffffff'},
    'FC Porto':{primary:'#1769aa',secondary:'#ffffff'},
    'Sporting CP':{primary:'#168a45',secondary:'#ffffff'},

    // Turcja
    'Beşiktaş':{primary:'#171717',secondary:'#ffffff',shadow:'#d71920'},
    'Fenerbahçe':{primary:'#f6d900',secondary:'#172b64'},
    'Galatasaray':{primary:'#a71930',secondary:'#fdb912'},
    'Trabzonspor':{primary:'#7a263a',secondary:'#87ceeb'},

    // Ukraina
    'Dynamo Kyiv':{primary:'#1769aa',secondary:'#ffffff'},
    'Shakhtar Donetsk':{primary:'#f58220',secondary:'#171717'},

    // USA
    'Inter Miami':{primary:'#f4b6c2',secondary:'#171717'},

    // Włochy
    'AC Milan':{primary:'#d71920',secondary:'#171717'},
    'AS Roma':{primary:'#8e1f2d',secondary:'#f4a900'},
    'Atalanta':{primary:'#1769aa',secondary:'#171717'},
    'Bologna':{primary:'#a71930',secondary:'#172b64'},
    'Juventus':{primary:'#171717',secondary:'#ffffff'},
    'Lazio':{primary:'#87ceeb',secondary:'#ffffff',shadow:'#172b64'},
    'Napoli':{primary:'#2faee0',secondary:'#ffffff',shadow:'#172b64'}
  });

  // Zagraniczny tier 3 — indywidualne, rzeczywiste barwy klubowe.
  Object.assign(CLUB_COLOURS,{
    // Anglia
    'Blackburn Rovers':{primary:'#1769aa',secondary:'#ffffff'},
    'Bolton Wanderers':{primary:'#ffffff',secondary:'#172b64',shadow:'#d71920'},
    'Burnley':{primary:'#6a1d45',secondary:'#95cdea'},
    'Cardiff City':{primary:'#1769aa',secondary:'#ffffff',shadow:'#d71920'},
    'Charlton Athletic':{primary:'#d71920',secondary:'#ffffff'},
    'Coventry City':{primary:'#87ceeb',secondary:'#172b64'},
    'Crystal Palace':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},
    'Derby County':{primary:'#ffffff',secondary:'#171717'},
    'Middlesbrough':{primary:'#d71920',secondary:'#ffffff'},
    'Norwich City':{primary:'#f6d900',secondary:'#087a3d'},
    'Portsmouth':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},
    'Queens Park Rangers':{primary:'#1769aa',secondary:'#ffffff'},
    'Southampton':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Stoke City':{primary:'#d71920',secondary:'#ffffff'},
    'West Bromwich Albion':{primary:'#172b64',secondary:'#ffffff'},
    'West Ham':{primary:'#7a263a',secondary:'#87ceeb'},
    'Wolverhampton Wanderers':{primary:'#f5a623',secondary:'#171717'},

    // Arabia Saudyjska
    'Al-Hilal':{primary:'#174f9b',secondary:'#ffffff'},
    'Al-Ittihad':{primary:'#f6d900',secondary:'#171717'},
    'Al-Nassr':{primary:'#f6d900',secondary:'#174f9b'},

    // Argentyna
    'Estudiantes':{primary:'#d71920',secondary:'#ffffff'},
    'Independiente':{primary:'#d71920',secondary:'#ffffff'},
    'Racing Club':{primary:'#87ceeb',secondary:'#ffffff',shadow:'#172b64'},
    'San Lorenzo':{primary:'#d71920',secondary:'#172b64'},
    'Vélez Sarsfield':{primary:'#ffffff',secondary:'#174f9b'},

    // Australia
    'Sydney FC':{primary:'#87ceeb',secondary:'#172b64'},

    // Austria
    'Austria Wiedeń':{primary:'#552583',secondary:'#ffffff'},
    'Red Bull Salzburg':{primary:'#ffffff',secondary:'#d71920'},
    'Sturm Graz':{primary:'#171717',secondary:'#ffffff'},

    // Azerbejdżan
    'Qarabağ':{primary:'#171717',secondary:'#ffffff',shadow:'#174f9b'},
    'Sabah FK':{primary:'#172b64',secondary:'#ffffff',shadow:'#2faee0'},

    // Belgia
    'KAA Gent':{primary:'#174f9b',secondary:'#ffffff'},
    'KRC Genk':{primary:'#174f9b',secondary:'#ffffff'},
    'Royal Antwerp':{primary:'#d71920',secondary:'#ffffff'},
    'Royale Union Saint-Gilloise':{primary:'#f6d900',secondary:'#172b64'},
    'Standard Liège':{primary:'#d71920',secondary:'#ffffff'},

    // Bośnia i Hercegowina
    'Borac Banja Luka':{primary:'#d71920',secondary:'#174f9b',shadow:'#ffffff'},

    // Brazylia
    'Atlético Mineiro':{primary:'#171717',secondary:'#ffffff'},
    'Botafogo':{primary:'#171717',secondary:'#ffffff'},
    'Corinthians':{primary:'#ffffff',secondary:'#171717'},
    'Cruzeiro':{primary:'#174f9b',secondary:'#ffffff'},
    'Flamengo':{primary:'#d71920',secondary:'#171717'},
    'Fluminense':{primary:'#8e1f2d',secondary:'#ffffff',shadow:'#087a3d'},
    'Grêmio':{primary:'#2faee0',secondary:'#171717',shadow:'#ffffff'},
    'Internacional':{primary:'#d71920',secondary:'#ffffff'},
    'Palmeiras':{primary:'#087a3d',secondary:'#ffffff'},
    'Santos':{primary:'#ffffff',secondary:'#171717'},
    'São Paulo':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},

    // Bułgaria
    'Ludogorets Razgrad':{primary:'#168a45',secondary:'#ffffff'},

    // Chile
    'Colo-Colo':{primary:'#ffffff',secondary:'#171717'},

    // Chorwacja
    'Dinamo Zagrzeb':{primary:'#174f9b',secondary:'#ffffff'},
    'Rijeka':{primary:'#ffffff',secondary:'#2faee0'},

    // Cypr
    'Pafos FC':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d2a928'},

    // Czechy
    'Slavia Praga':{primary:'#d71920',secondary:'#ffffff'},
    'Sparta Praga':{primary:'#8e1f2d',secondary:'#f5cf29',shadow:'#172b64'},
    'Viktoria Pilzno':{primary:'#d71920',secondary:'#174f9b'},

    // Dania
    'Brøndby IF':{primary:'#f6d900',secondary:'#174f9b'},
    'FC København':{primary:'#ffffff',secondary:'#174f9b'},
    'FC Midtjylland':{primary:'#171717',secondary:'#d71920'},

    // Egipt
    'Al Ahly':{primary:'#d71920',secondary:'#ffffff'},
    'Zamalek':{primary:'#ffffff',secondary:'#d71920'}
  });

  Object.assign(CLUB_COLOURS,{
    // Francja
    'AJ Auxerre':{primary:'#ffffff',secondary:'#174f9b'},
    'Angers SCO':{primary:'#171717',secondary:'#ffffff'},
    'FC Lorient':{primary:'#f58220',secondary:'#171717'},
    'Le Havre AC':{primary:'#87ceeb',secondary:'#172b64'},
    'Le Mans FC':{primary:'#d71920',secondary:'#f6d900'},
    'OGC Nice':{primary:'#d71920',secondary:'#171717'},
    'RC Lens':{primary:'#f6d900',secondary:'#d71920'},
    'RC Strasbourg':{primary:'#1769aa',secondary:'#ffffff'},
    'Stade Brestois 29':{primary:'#d71920',secondary:'#ffffff'},
    'Stade Rennais':{primary:'#d71920',secondary:'#171717'},
    'Toulouse FC':{primary:'#552583',secondary:'#ffffff'},

    // Grecja
    'AEK Ateny':{primary:'#f6d900',secondary:'#171717'},
    'Aris Saloniki':{primary:'#f6d900',secondary:'#171717'},
    'PAOK':{primary:'#171717',secondary:'#ffffff'},

    // Hiszpania
    'Alavés':{primary:'#1769aa',secondary:'#ffffff'},
    'Celta Vigo':{primary:'#87ceeb',secondary:'#7a263a'},
    'Deportivo La Coruña':{primary:'#1769aa',secondary:'#ffffff'},
    'Espanyol':{primary:'#1769aa',secondary:'#ffffff'},
    'Getafe':{primary:'#174f9b',secondary:'#ffffff'},
    'Osasuna':{primary:'#d71920',secondary:'#172b64'},
    'Rayo Vallecano':{primary:'#ffffff',secondary:'#d71920',shadow:'#171717'},

    // Holandia
    'AZ Alkmaar':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'FC Twente':{primary:'#d71920',secondary:'#ffffff'},
    'FC Utrecht':{primary:'#d71920',secondary:'#ffffff'},

    // Japonia
    'Urawa Red Diamonds':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Vissel Kobe':{primary:'#8e1f2d',secondary:'#ffffff'},
    'Yokohama F. Marinos':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},

    // Katar
    'Al-Sadd':{primary:'#ffffff',secondary:'#171717'},

    // Kazachstan
    'Aktobe':{primary:'#d71920',secondary:'#ffffff'},
    'Astana':{primary:'#f6d900',secondary:'#2faee0'},

    // Kolumbia
    'Atlético Nacional':{primary:'#168a45',secondary:'#ffffff'},

    // Korea Południowa
    'Jeonbuk Hyundai Motors':{primary:'#087a3d',secondary:'#ffffff'},

    // Meksyk
    'Club América':{primary:'#f6d900',secondary:'#172b64'},
    'Club León':{primary:'#168a45',secondary:'#ffffff'},
    'Cruz Azul':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},
    'Monterrey':{primary:'#172b64',secondary:'#ffffff'},
    'Pachuca':{primary:'#174f9b',secondary:'#ffffff'},
    'Pumas UNAM':{primary:'#f4df9b',secondary:'#172b64'},
    'Tigres UANL':{primary:'#f6d900',secondary:'#174f9b'},
    'Toluca':{primary:'#d71920',secondary:'#ffffff'},

    // Mołdawia
    'Sheriff Tiraspol':{primary:'#f6d900',secondary:'#171717'},

    // Niemcy
    '1. FC Köln':{primary:'#ffffff',secondary:'#d71920'},
    'Borussia Mönchengladbach':{primary:'#ffffff',secondary:'#171717',shadow:'#168a45'},
    'FC Augsburg':{primary:'#ffffff',secondary:'#d71920',shadow:'#168a45'},
    'Hamburger SV':{primary:'#ffffff',secondary:'#174f9b',shadow:'#171717'},
    'Mainz 05':{primary:'#d71920',secondary:'#ffffff'},
    'SC Freiburg':{primary:'#d71920',secondary:'#ffffff',shadow:'#171717'},
    'Schalke 04':{primary:'#174f9b',secondary:'#ffffff'},
    'TSG Hoffenheim':{primary:'#174f9b',secondary:'#ffffff'},
    'Werder Brema':{primary:'#168a45',secondary:'#ffffff'},

    // Norwegia
    'Bodø/Glimt':{primary:'#f6d900',secondary:'#171717'},

    // Portugalia
    'SC Braga':{primary:'#d71920',secondary:'#ffffff'},

    // RPA
    'Mamelodi Sundowns':{primary:'#f6d900',secondary:'#174f9b',shadow:'#168a45'},

    // Rumunia
    'FCSB':{primary:'#d71920',secondary:'#174f9b'},

    // Serbia
    'Crvena zvezda':{primary:'#d71920',secondary:'#ffffff'},
    'Partizan Belgrad':{primary:'#171717',secondary:'#ffffff'},

    // Słowacja
    'Slovan Bratysława':{primary:'#87ceeb',secondary:'#ffffff',shadow:'#172b64'},

    // Słowenia
    'Celje':{primary:'#174f9b',secondary:'#f6d900'},

    // Szkocja
    'Celtic':{primary:'#168a45',secondary:'#ffffff'},
    'Rangers':{primary:'#174f9b',secondary:'#ffffff',shadow:'#d71920'},

    // Szwajcaria
    'FC Basel':{primary:'#d71920',secondary:'#174f9b'},

    // Turcja
    'İstanbul Başakşehir':{primary:'#f58220',secondary:'#172b64'},
    'Samsunspor':{primary:'#d71920',secondary:'#ffffff'},

    // Urugwaj
    'Peñarol':{primary:'#f6d900',secondary:'#171717'},

    // USA
    'FC Cincinnati':{primary:'#f58220',secondary:'#174f9b'},
    'LA Galaxy':{primary:'#ffffff',secondary:'#172b64',shadow:'#d2a928'},
    'Los Angeles FC':{primary:'#171717',secondary:'#d2a928'},
    'New York Red Bulls':{primary:'#ffffff',secondary:'#d71920',shadow:'#174f9b'},
    'Orlando City':{primary:'#552583',secondary:'#ffffff',shadow:'#d2a928'},
    'Seattle Sounders':{primary:'#168a45',secondary:'#174f9b'},

    // Węgry
    'Ferencváros':{primary:'#168a45',secondary:'#ffffff'},

    // Włochy
    'Cagliari':{primary:'#172b64',secondary:'#d71920'},
    'Como':{primary:'#174f9b',secondary:'#ffffff'},
    'Fiorentina':{primary:'#552583',secondary:'#ffffff'},
    'Frosinone':{primary:'#f6d900',secondary:'#174f9b'},
    'Genoa':{primary:'#172b64',secondary:'#d71920'},
    'Lecce':{primary:'#d71920',secondary:'#f6d900'},
    'Monza':{primary:'#d71920',secondary:'#ffffff'},
    'Parma':{primary:'#ffffff',secondary:'#174f9b',shadow:'#f6d900'},
    'Sassuolo':{primary:'#168a45',secondary:'#171717'},
    'Torino':{primary:'#7a263a',secondary:'#ffffff'},
    'Udinese':{primary:'#171717',secondary:'#ffffff'},
    'Venezia':{primary:'#171717',secondary:'#f58220',shadow:'#168a45'},

    // Zjednoczone Emiraty Arabskie
    'Al-Ain':{primary:'#552583',secondary:'#ffffff'}
  });

  const REGION_COLOURS={
    'Dolnośląskie':{primary:'#f2ce2a',secondary:'#171717',shadow:'#c82032'},
    'Kujawsko-pomorskie':{primary:'#ffffff',secondary:'#c82032',shadow:'#171717'},
    'Lubelskie':{primary:'#c82032',secondary:'#ffffff',shadow:'#f2ce2a'},
    'Lubuskie':{primary:'#176b3a',secondary:'#f2ce2a',shadow:'#175ba7'},
    'Łódzkie':{primary:'#c82032',secondary:'#f2ce2a'},
    'Małopolskie':{primary:'#ffffff',secondary:'#c82032',shadow:'#f2ce2a'},
    'Mazowieckie':{primary:'#c82032',secondary:'#ffffff',shadow:'#f2ce2a'},
    'Opolskie':{primary:'#f2ce2a',secondary:'#175ba7'},
    'Podkarpackie':{primary:'#175ba7',secondary:'#ffffff',shadow:'#c82032'},
    'Podlaskie':{primary:'#c82032',secondary:'#ffffff',shadow:'#f2ce2a'},
    'Pomorskie':{primary:'#f2ce2a',secondary:'#171717'},
    'Śląskie':{primary:'#175ba7',secondary:'#f2ce2a'},
    'Świętokrzyskie':{primary:'#175ba7',secondary:'#ffffff',shadow:'#c82032'},
    'Warmińsko-mazurskie':{primary:'#c82032',secondary:'#ffffff',shadow:'#f2ce2a'},
    'Wielkopolskie':{primary:'#ffffff',secondary:'#c82032'},
    'Zachodniopomorskie':{primary:'#ffffff',secondary:'#c82032',shadow:'#175ba7'}
  };

  const COUNTRY_COLOURS={};
  const assign=(names,primary,secondary)=>names.forEach(name=>{
    COUNTRY_COLOURS[name]={primary,secondary};
  });

  // Dwukolorowe skróty flag — również dla każdej zagranicznej ligi z bazy.
  assign(['Polska','Anglia','Austria','Bahrajn','Kanada','Dania','Gruzja','Gibraltar','Indonezja','Japonia','Łotwa','Malta','Monako','Peru','Singapur','Szwajcaria','Tonga','Tunezja','Turcja'], '#ffffff','#c82032');
  assign(['Albania','Angola','Kenia','Malawi','Sudan','Trynidad i Tobago','Uganda'], '#c82032','#171717');
  assign(['Algieria','Bangladesz','Bułgaria','Burundi','Iran','Liban','Malediwy','Madagaskar','Meksyk','Oman','Tadżykistan','Węgry'], '#176b3a','#ffffff');
  assign(['Andora','Bośnia i Hercegowina','Kazachstan','Kosowo','Palau','Szwecja','Ukraina'], '#155bac','#f2ce2a');
  assign(['Argentyna','Botswana','Finlandia','Grecja','Gwatemala','Honduras','Irlandia Północna','Islandia','Nikaragua','San Marino','Szkocja','Somalia'], '#ffffff','#1765ad');
  assign(['Armenia','Azerbejdżan','Chorwacja','Czechy','Francja','Holandia','Luksemburg','Norwegia','Paragwaj','Serbia','Słowacja','Słowenia','USA'], '#175ba7','#ffffff');
  assign(['Australia','Barbados','Belize','Curaçao','Fidżi','Liechtenstein','Nowa Zelandia','Samoa','Samoa Amerykańskie','Tajwan','Tuvalu','Wyspy Cooka'], '#123d78','#ffffff');
  assign(['Belgia','Niemcy'], '#171717','#f2c82b');
  assign(['Arabia Saudyjska'], '#176b3a','#ffffff');
  assign(['Bhutan','Brunei','Hiszpania','Kirgistan','Macedonia Północna','Timor Wschodni','Wietnam'], '#c82032','#f2ce2a');
  assign(['Boliwia','Burkina Faso','Etiopia','Ghana','Gwinea','Kamerun','Kongo','Mali','Senegal','Togo'], '#176b3a','#f2ce2a');
  assign(['Brazylia','Dominika','Grenada','Gujana','Jamajka','Mauretania','RPA','Saint Kitts i Nevis','Tanzania','Vanuatu','Zambia','Zimbabwe'], '#176b3a','#f2ce2a');
  assign(['Chile','Korea Północna','Kostaryka','Kuba','Panama','Portoryko'], '#155bac','#ffffff');
  assign(['Chiny','Czarnogóra','Maroko'], '#c82032','#f2ce2a');
  assign(['Cypr','Irlandia','Niger','Nigeria','Pakistan','Wybrzeże Kości Słoniowej'], '#ffffff','#176b3a');
  assign(['DR Konga','Ekwador','Kolumbia','Rumunia'], '#f2ce2a','#175ba7');
  assign(['Egipt','Irak','Jemen','Syria'], '#c82032','#ffffff');
  assign(['Estonia','Lesotho'], '#1766ad','#171717');
  assign(['Filipiny','Haiti','Laos','Nepal','Tajlandia'], '#175ba7','#c82032');
  assign(['Hongkong','Makau'], '#c82032','#ffffff');
  assign(['Indie','Niger'], '#f08a24','#176b3a');
  assign(['Jordania','Kuwejt','Palestyna','Sudan Południowy','ZEA'], '#176b3a','#ffffff');
  assign(['Kambodża','Korea Południowa'], '#175ba7','#c82032');
  assign(['Katar'], '#7c2344','#ffffff');
  assign(['Litwa'], '#f2ce2a','#176b3a');
  assign(['Malezja'], '#175ba7','#f2ce2a');
  assign(['Mauritius','Seszele'], '#175ba7','#f2ce2a');
  assign(['Mjanma'], '#f2ce2a','#176b3a');
  assign(['Mołdawia'], '#175ba7','#f2ce2a');
  assign(['Mongolia'], '#175ba7','#c82032');
  assign(['Nowa Kaledonia'], '#175ba7','#c82032');
  assign(['Papua-Nowa Gwinea'], '#171717','#f2ce2a');
  assign(['Portugalia'], '#176b3a','#c82032');
  assign(['Rwanda'], '#1765ad','#f2ce2a');
  assign(['Salwador'], '#175ba7','#ffffff');
  assign(['Sri Lanka'], '#7d1835','#f2ce2a');
  assign(['Tajlandia'], '#c82032','#175ba7');
  assign(['Tahiti'], '#ffffff','#c82032');
  assign(['Turkmenistan'], '#176b3a','#ffffff');
  assign(['Urugwaj'], '#ffffff','#1765ad');
  assign(['Uzbekistan'], '#1765ad','#ffffff');
  assign(['Walia'], '#ffffff','#176b3a');
  assign(['Wenezuela'], '#f2ce2a','#7c2344');
  assign(['Włochy'], '#175ba7','#ffffff');
  assign(['Wyspy Owcze'], '#ffffff','#175ba7');
  assign(['Wyspy Salomona'], '#175ba7','#176b3a');

  // Reprezentacje bez własnej ligi klubowej, dodane do pełnej puli FIFA.
  // Dzięki temu w przyszłych turniejach nie wpadają w losowe barwy zastępcze.
  assign(['Benin','Gabon','Gambia','Komory','Mozambik','Republika Zielonego Przylądka','Sierra Leone','São Tomé i Príncipe'], '#176b3a','#f2ce2a');
  assign(['Czad','Republika Środkowoafrykańska'], '#175ba7','#f2ce2a');
  assign(['Dżibuti','Gwinea Równikowa'], '#1765ad','#176b3a');
  assign(['Erytrea','Eswatini','Namibia','Dominikana'], '#175ba7','#c82032');
  assign(['Gwinea Bissau'], '#c82032','#f2ce2a');
  assign(['Liberia','Libia'], '#c82032','#ffffff');
  assign(['Afganistan'], '#171717','#c82032');
  assign(['Guam'], '#175ba7','#c82032');
  assign(['Anguilla','Bermudy','Brytyjskie Wyspy Dziewicze','Kajmany','Turks i Caicos'], '#175ba7','#ffffff');
  assign(['Antigua i Barbuda'], '#c82032','#171717');
  assign(['Aruba','Saint Lucia','Saint Vincent i Grenadyny'], '#1765ad','#f2ce2a');
  assign(['Bahamy'], '#39aeb7','#171717');
  assign(['Montserrat','Surinam'], '#176b3a','#ffffff');
  assign(['Wyspy Dziewicze Stanów Zjednoczonych'], '#ffffff','#175ba7');

  // Rozjaśnione warianty drugiej barwy zachowują charakter flagi, ale nie
  // pozwalają, by napis zniknął na telefonie na równie ciemnym tle.
  assign(['Filipiny','Kambodża','Korea Południowa','Laos','Mongolia','Nepal','Nowa Kaledonia'], '#17457f','#ffd9de');
  assign(['Portugalia'], '#145b33','#ffd7dc');
  assign(['Tajlandia'], '#172b64','#ffd7dc');
  assign(['Indie'], '#f08a24','#073f20');
  assign(['Wyspy Salomona'], '#17457f','#d8f1dd');

  const SAFE_FALLBACKS=[
    {primary:'#ffffff',secondary:'#c82032'},
    {primary:'#175ba7',secondary:'#ffffff'},
    {primary:'#176b3a',secondary:'#ffffff'},
    {primary:'#171717',secondary:'#f2ce2a'}
  ];
  function generatedCountryPalette(country){
    const key=String(country||'Polska');
    const sum=[...key].reduce((total,char)=>total+char.codePointAt(0),0);
    return SAFE_FALLBACKS[sum%SAFE_FALLBACKS.length];
  }
  function resolve(club){
    const name=typeof club==='string'?club:club?.name;
    const country=typeof club==='object'&&club?.country?club.country:'Polska';
    const region=typeof club==='object'?club?.region:null;
    const customPalette=typeof club==='object'&&club?.customColours;
    if(customPalette?.primary&&customPalette?.secondary){
      return {primary:customPalette.primary,secondary:customPalette.secondary,shadow:customPalette.shadow||customPalette.secondary,source:'custom',name};
    }
    const clubPalette=CLUB_COLOURS[name];
    if(clubPalette) return {...clubPalette,source:'club',name};
    const regionPalette=(country==='Polska'&&region)?REGION_COLOURS[region]:null;
    if(regionPalette) return {...regionPalette,source:'region',region};
    const countryPalette=COUNTRY_COLOURS[country]||generatedCountryPalette(country);
    return {...countryPalette,source:'country',country};
  }

  window.PPS_COLOURS={clubs:CLUB_COLOURS,regions:REGION_COLOURS,countries:COUNTRY_COLOURS,resolve};
})();


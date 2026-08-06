/*
 * Polska Kariera — pula imion i nazwisk losowanych na ekranie startowym.
 * Jakub Olkiewicz pozostaje ręcznie wpisywanym easter eggiem i celowo
 * nie znajduje się w tej puli.
 */
(() => {
  const classicNames=[
    'Jacek Cyzio','Andrzej Jaskot','Sławomir Gula','Marek Citko',
    'Marcin Harasimowicz','Ernest Konon','Kazimierz Moskal','Kazimierz Węgrzyn',
    'Zbigniew Czajkowski','Sebastian Mila','Piotr Matys','Dzidosław Żuberek',
    'Zbigniew Mandziejewicz','Arkadiusz Gmur','Dariusz Szubert','Piotr Mandrysz',
    'Zbigniew Wyciszkiewicz','Maciej Terlecki','Andrzej Kubica','Tomasz Lenart',
    'Piotr Przerywacz','Mariusz Ujek','Krzysztof Adamczyk','Paweł Sibik',
    'Robert Mitwerandu','Jan Spychalski','Dariusz Czykier','Jakub Wilk',
    'Tomasz Jasina','Piotr Giza','Piotr Jawny','Arkadiusz Klimek',
    'Dariusz Solnica','Jacek Berensztajn','Wahan Geworgian','Piotr Nowak',
    'Robert Bubnowicz','Artur Faranczuk','Jacek Kosmalski','Sławomir Chałaśkiewicz',
    'Jacek Chańko','Marian Janoszka','Józef Żymańczyk','Cezary Baca',
    'Marcin Florek','Piotr Kuklis'
  ];

  // Metadane służą wyłącznie losowaniu gotowej postaci na ekranie startowym.
  // OVR oznacza start w wieku 16 lat, więc jest projektową oceną potencjału
  // wynikającą ze skali gry, a nie historyczną notą dorosłego zawodnika.
  const sourcedProfiles=[
    {name:'Rafał Jarosz',position:'FWD',region:'Śląskie',startPoint:'syrenka',overall:53},
    {name:'Piotr Szarpak',position:'MID',region:'Łódzkie',startPoint:'syrenka',overall:54},
    {name:'Dariusz Patalan',position:'FWD',region:'Pomorskie',startPoint:'syrenka',overall:54},
    {name:'Andrzej Sazonowicz',position:'FWD',region:'Podlaskie',startPoint:'normal',overall:45},
    {name:'Piotr Sowisz',position:'MID',region:'Śląskie',startPoint:'syrenka',overall:52},
    {name:'Rafał Oprzondek',position:'DEF',region:'Śląskie',startPoint:'normal',overall:45},
    {name:'Piotr Bania',position:'FWD',region:'Małopolskie',startPoint:'syrenka',overall:52},
    {name:'Tadeusz Socha',position:'DEF',region:'Dolnośląskie',startPoint:'syrenka',overall:53},
    {name:'Jacek Ziarkowski',position:'FWD',region:'Lubelskie',startPoint:'syrenka',overall:55},
    {name:'Filip Sysio',position:'FWD',region:'Łódzkie',startPoint:'sysio'},
    {name:'Paweł Strąk',position:'MID',region:'Świętokrzyskie',startPoint:'syrenka',overall:55},
    {name:'Michał Masłowski',position:'MID',region:'Dolnośląskie',startPoint:'wonderkid',overall:60},
    {name:'Grzegorz Żmija',position:'GK',startPoint:'normal',overall:45},
    {name:'Grzegorz Tomala',position:'GK',region:'Śląskie',startPoint:'syrenka',overall:52},
    {name:'Michał Kokoszanek',position:'GK',region:'Wielkopolskie',startPoint:'syrenka',overall:52},
    {name:'Tomasz Zdebel',position:'MID',region:'Śląskie',startPoint:'wonderkid',overall:61},
    {name:'Roman Dąbrowski',position:'FWD',region:'Opolskie',startPoint:'wonderkid',overall:62},
    {name:'Dawid Jarka',position:'FWD',region:'Śląskie',startPoint:'syrenka',overall:51},
    {name:'Mieczysław Ożóg',position:'MID',region:'Podkarpackie',startPoint:'syrenka',overall:53},
    {name:'Mirosław Okoński',position:'MID',region:'Zachodniopomorskie',startPoint:'wonderkid',overall:66},
    {name:'Janusz Gałuszka',position:'DEF',region:'Śląskie',startPoint:'syrenka',overall:53},
    {name:'Paweł Primel',position:'GK',region:'Wielkopolskie',startPoint:'syrenka',overall:52},
    {name:'Sławomir Wojciechowski',position:'MID',region:'Pomorskie',startPoint:'wonderkid',overall:60},
    {name:'Tomasz Mokwa',position:'DEF',region:'Pomorskie',startPoint:'syrenka',overall:51},
    {name:'Roman Żuchnik'},
    {name:'Bogdan Pikuta',position:'FWD',region:'Śląskie',startPoint:'syrenka',overall:54}
  ];

  window.POLISH_PLAYER_PROFILES=Object.freeze([
    ...classicNames.map(name=>Object.freeze({name})),
    ...sourcedProfiles.map(profile=>Object.freeze(profile))
  ]);
  window.POLISH_PLAYER_NAMES=Object.freeze(window.POLISH_PLAYER_PROFILES.map(profile=>profile.name));
})();

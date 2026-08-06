/*
 * Polski Piłkarz Simulator v1.64 — rdzeń silnika (stan, render, symulacja sezonu).
 * Wymaga wcześniej wczytanych: 01–03/06/07 (NSS), 08 (dane klubów),
 * 09 (decyzje) — patrz index.html.
 */
(() => {
  const $ = s => document.querySelector(s);
  const els = {
    newGameView: $('#newGameView'), clubStartView: $('#clubStartView'), createClubView: $('#createClubView'), coopSetupView: $('#coopSetupView'), setupView: $('#setupView'), offersView: $('#offersView'), careerView: $('#careerView'), retirementView: $('#retirementView'),
    setupForm: $('#setupForm'), region: $('#region'), favoriteCompetition: $('#favoriteCompetition'), favoriteRegionWrap: $('#favoriteRegionWrap'), favoriteRegion: $('#favoriteRegion'), favoriteClub: $('#favoriteClub'), offersGrid: $('#offersGrid'), offerRegion: $('#offerRegion'),
    chooseClubModeBtn: $('#chooseClubModeBtn'), normalModeBtn: $('#normalModeBtn'), createClubModeBtn: $('#createClubModeBtn'), coopModeBtn: $('#coopModeBtn'), coopPlayerCount: $('#coopPlayerCount'), coopPlayersConfig: $('#coopPlayersConfig'), coopSetupError: $('#coopSetupError'), startCoopBtn: $('#startCoopBtn'), backFromCoopBtn: $('#backFromCoopBtn'), loadGameStartBtn: $('#loadGameStartBtn'), startClubCompetition: $('#startClubCompetition'), startClub: $('#startClub'), confirmStartClubBtn: $('#confirmStartClubBtn'), backToNewGameBtn: $('#backToNewGameBtn'), setupModeNote: $('#setupModeNote'),
    customClubName: $('#customClubName'), customClubCompetition: $('#customClubCompetition'), customClubReplacement: $('#customClubReplacement'), customClubPrimary: $('#customClubPrimary'), customClubSecondary: $('#customClubSecondary'), customClubShadow: $('#customClubShadow'), customClubPreview: $('#customClubPreview'), customClubError: $('#customClubError'), confirmCustomClubBtn: $('#confirmCustomClubBtn'), backFromCustomClubBtn: $('#backFromCustomClubBtn'),
    newCareerBtn: $('#newCareerBtn'), saveGameBtn: $('#saveGameBtn'), loadGameBanner: $('#loadGameBanner'), loadGameOptionsBtn: $('#loadGameOptionsBtn'), restartBtn: $('#restartBtn'), coopContinueAfterRetireBtn: $('#coopContinueAfterRetireBtn'), playSeasonBtn: $('#playSeasonBtn'),
    playerNameLabel: $('#playerNameLabel'), playerRegionLabel: $('#playerRegionLabel'), playerMeta: $('#playerMeta'), shirtNumber: $('#shirtNumber'),
    overallValue: $('#overallValue'), ageValue: $('#ageValue'), clubValue: $('#clubValue'), clubTierValue: $('#clubTierValue'), statusValue: $('#statusValue'), statusContextValue: $('#statusContextValue'), nationalValue: $('#nationalValue'), nationalContextValue: $('#nationalContextValue'), playChanceValue: $('#playChanceValue'), professionalismValue: $('#professionalismValue'), loyaltyValue: $('#loyaltyValue'), recognitionValue: $('#recognitionValue'), injuryRiskValue: $('#injuryRiskValue'),
    seasonLabel: $('#seasonLabel'), seasonHeadline: $('#seasonHeadline'), valueLabel: $('#valueLabel'), legacyValueLabel: $('#legacyValueLabel'), salaryLabel: $('#salaryLabel'), careerEarningsValue: $('#careerEarningsValue'), currencySelect: $('#currencySelect'), seasonPanelSelect: $('#seasonPanelSelect'), visualThemeSelect: $('#visualThemeSelect'), leagueTableStyleSelect: $('#leagueTableStyleSelect'), legacySeasonHead: $('#legacySeasonHead'), legacySeasonStats: $('#legacySeasonStats'), seasonDashboard: $('#seasonDashboard'), historyPanel: $('.history-panel'), appsStat: $('#appsStat'), goalsStatLabel: $('#goalsStatLabel'), goalsStat: $('#goalsStat'), assistsStatLabel: $('#assistsStatLabel'), assistsStat: $('#assistsStat'), minutesStat: $('#minutesStat'),
    eventBox: $('#eventBox'), decisionBox: $('#decisionBox'), decisionKicker: $('#decisionKicker'), decisionTitle: $('#decisionTitle'), decisionText: $('#decisionText'), decisionChoices: $('#decisionChoices'),
    timeline: $('#timeline'), careerScore: $('#careerScore'), retireTitle: $('#retireTitle'), retireVerdict: $('#retireVerdict'), retireStats: $('#retireStats'), retireClubs: $('#retireClubs'), retireSeasons: $('#retireSeasons'),
    retirementSummary: $('#retirementSummary'), coopFinalResults: $('#coopFinalResults'), profile89Btn: $('#profile89Btn'), profile89View: $('#profile89View'), profile89Content: $('#profile89Content'), profile89BackBtn: $('#profile89BackBtn'),
    saveGameModal: $('#saveGameModal'), saveGameTitle: $('#saveGameTitle'), saveGameText: $('#saveGameText'), saveGameSlots: $('#saveGameSlots'), saveGameClose: $('#saveGameClose'), saveGameCloseX: $('#saveGameCloseX'),
    optionsBtn: $('#optionsBtn'), optionsModal: $('#optionsModal'), optionsClose: $('#optionsClose'), optionsCloseX: $('#optionsCloseX'),
    pwaOptionsBtn: $('#pwaOptionsBtn'), pwaModal: $('#pwaModal'), pwaModalClose: $('#pwaModalClose'), pwaModalCloseX: $('#pwaModalCloseX'), pwaModalEyebrow: $('#pwaModalEyebrow'), pwaModalTitle: $('#pwaModalTitle'), pwaInstallInfo: $('#pwaInstallInfo'), pwaConsent: $('#pwaConsent'), pwaInstallConfirm: $('#pwaInstallConfirm'), pwaUpdateStatus: $('#pwaUpdateStatus'), pwaUpdateLink: $('#pwaUpdateLink'),
    youtubePrompt: $('#youtubePrompt'), youtubePromptClose: $('#youtubePromptClose'), youtubePromptCloseX: $('#youtubePromptCloseX'), youtubePromptLink: $('#youtubePromptLink'),
    patronitePrompt: $('#patronitePrompt'), patronitePromptClose: $('#patronitePromptClose'), patronitePromptCloseX: $('#patronitePromptCloseX'), patronitePromptLink: $('#patronitePromptLink'),
    leagueMatchModal: $('#leagueMatchModal'), leagueMatchKicker: $('#leagueMatchKicker'), leagueMatchTitle: $('#leagueMatchTitle'), leagueMatchContent: $('#leagueMatchContent'), leagueMatchClose: $('#leagueMatchClose'), leagueMatchCloseX: $('#leagueMatchCloseX'),
    coopBar: $('#coopBar'), coopTurnLabel: $('#coopTurnLabel'), coopSeasonLabel: $('#coopSeasonLabel'), coopPlayerPips: $('#coopPlayerPips')
  };

  let state = null;
  let coopSession = null;
  const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  const YOUTUBE_PROMPT_MS=20*60*1000;
  const PATRONITE_PROMPT_MS=30*60*1000;
  const ACTIVE_PLAY_TIME_KEY='pps-active-play-ms';
  const YOUTUBE_SEEN_KEY='pps-youtube-prompt-seen';
  const PATRONITE_SEEN_KEY='pps-patronite-prompt-seen';
  const safeLocalGet=key=>{try{return localStorage.getItem(key);}catch(_){return null;}};
  const safeLocalSet=(key,value)=>{try{localStorage.setItem(key,String(value));}catch(_){/* standalone file:// może nie mieć localStorage */}};
  const SAVE_SLOT_PREFIX='pps-career-save-v1-slot-';
  const SAVE_SLOT_INDEX_KEY='pps-career-save-v1-slot-index';
  const PANEL_MODE_KEY='pps-season-panel-mode';
  const CURRENCY_DISPLAY_KEY='pps-currency-display';
  const VISUAL_THEME_KEY='pps-visual-theme';
  const LEAGUE_TABLE_STYLE_KEY='pps-league-table-style';
  const UI_DEFAULTS_VERSION_KEY='pps-ui-defaults-version';
  let saveModalMode='load';
  let setupSpecialStart=null;
  let setupDrawnIdentity=null;
  let selectedStartingClubName=null;
  let selectedCustomClubDraft=null;
  let sessionVisualTheme=null;

  // Jednorazowa korekta po wersji, która omyłkowo potrafiła odziedziczyć
  // stary panel jako wygląd pierwszej nowej kariery.
  if(safeLocalGet(UI_DEFAULTS_VERSION_KEY)!=='1.54'){
    safeLocalSet(PANEL_MODE_KEY,'new');
    safeLocalSet(VISUAL_THEME_KEY,'club');
    safeLocalSet(LEAGUE_TABLE_STYLE_KEY,'zones');
    safeLocalSet(UI_DEFAULTS_VERSION_KEY,'1.54');
  }

  function preferredPanelMode(){
    return safeLocalGet(PANEL_MODE_KEY)==='old'?'old':'new';
  }
  function activePanelMode(){
    return state?.seasonPanelMode||preferredPanelMode();
  }
  function applyPanelModeAppearance(){
    const old=activePanelMode()==='old';
    document.body.classList.toggle('old-panel-mode',old);
    document.body.dataset.panelMode=old?'old':'new';
  }
  function preferredCurrency(){
    const saved=safeLocalGet(CURRENCY_DISPLAY_KEY);
    return ['PLN','EUR','PLZ','KHR'].includes(saved)?saved:'PLN';
  }
  function preferredVisualTheme(){
    // Motyw klubowy jest ustawieniem domyślnym. Zachowujemy jednak świadomy
    // wybór stylu klasycznego zapisany wcześniej przez gracza.
    const saved=sessionVisualTheme||safeLocalGet(VISUAL_THEME_KEY);
    return ['classic','club','monochrome'].includes(saved)?saved:'club';
  }
  function preferredLeagueTableStyle(){
    return safeLocalGet(LEAGUE_TABLE_STYLE_KEY)==='clubs'?'clubs':'zones';
  }
  function applyLeagueTableStyle(){
    const style=state?.leagueTableStyle||preferredLeagueTableStyle();
    document.body.dataset.leagueTableStyle=style==='clubs'?'club':'zones';
  }
  function colourLuminance(hex){
    const clean=String(hex||'').replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(clean))return 0;
    const channels=[0,2,4].map(i=>parseInt(clean.slice(i,i+2),16)/255)
      .map(x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4));
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
  }
  function readablePaletteInk(background,preferred){
    const bg=colourLuminance(background),fg=colourLuminance(preferred);
    const contrast=(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);
    return contrast>=3?preferred:(bg>.42?'#171717':'#ffffff');
  }
  function applyVisualTheme(){
    const selected=state?.visualTheme||preferredVisualTheme();
    const monochrome=selected==='monochrome';
    document.body.classList.toggle('monochrome-theme',monochrome);
    const themeMeta=document.querySelector('meta[name="theme-color"]');
    if(themeMeta)themeMeta.content=monochrome?'#000000':'#efe9dc';
    const active=!monochrome&&activePanelMode()!=='old'&&selected==='club'&&state?.club&&!state.club.noClub;
    document.body.classList.toggle('club-theme',!!active);
    if(!active){
      ['--theme-primary','--theme-secondary','--theme-shadow','--theme-accent','--theme-ink'].forEach(name=>document.body.style.removeProperty(name));
      document.body.removeAttribute('data-theme-club');
      return;
    }
    const palette=clubOfferPalette(state.club);
    const primary=palette.primary||'#f8f4ea';
    const secondary=palette.secondary||'#171717';
    const shadow=palette.shadow||secondary;
    const accent=colourLuminance(primary)>.78?secondary:primary;
    document.body.style.setProperty('--theme-primary',primary);
    document.body.style.setProperty('--theme-secondary',secondary);
    document.body.style.setProperty('--theme-shadow',shadow);
    document.body.style.setProperty('--theme-accent',accent);
    document.body.style.setProperty('--theme-ink',readablePaletteInk(primary,secondary));
    document.body.dataset.themeClub=state.club.name;
  }
  function closeOptionsModal(){ els.optionsModal?.classList.add('hidden'); }
  function openOptionsModal(){
    applyPanelModeAppearance();
    if(els.currencySelect) els.currencySelect.value=state?.currencyDisplay||preferredCurrency();
    if(els.seasonPanelSelect) els.seasonPanelSelect.value=state?.seasonPanelMode||preferredPanelMode();
    if(els.visualThemeSelect) els.visualThemeSelect.value=state?.visualTheme||preferredVisualTheme();
    if(els.leagueTableStyleSelect) els.leagueTableStyleSelect.value=state?.leagueTableStyle||preferredLeagueTableStyle();
    const coopMidRound=coopIsActive()&&(coopSession.completedPlayerIds||[]).length>0;
    els.saveGameBtn?.classList.toggle('hidden',!state?.club||state?.retired||coopMidRound);
    els.newCareerBtn?.classList.toggle('hidden',!state);
    els.optionsModal?.classList.remove('hidden');
  }

  function readSaveSlot(slot){
    try{
      const raw=safeLocalGet(`${SAVE_SLOT_PREFIX}${slot}`);
      if(!raw) return null;
      const payload=JSON.parse(raw);
      return payload && payload.state ? payload : null;
    }catch(_){ return null; }
  }

  function savedSlotIds(){
    let ids=[];
    try{
      const parsed=JSON.parse(safeLocalGet(SAVE_SLOT_INDEX_KEY)||'[]');
      if(Array.isArray(parsed)) ids=parsed.filter(x=>Number.isInteger(x)&&x>0);
    }catch(_){/* migracja starych czterech slotów poniżej */}
    for(let slot=1;slot<=4;slot++) if(readSaveSlot(slot)&&!ids.includes(slot)) ids.push(slot);
    return [...new Set(ids)].sort((a,b)=>a-b);
  }

  function rememberSaveSlot(slot){
    const ids=savedSlotIds();
    if(!ids.includes(slot)) ids.push(slot);
    safeLocalSet(SAVE_SLOT_INDEX_KEY,JSON.stringify(ids.sort((a,b)=>a-b)));
  }

  function closeSaveGameModal(){ els.saveGameModal?.classList.add('hidden'); }

  function saveSlotDescription(payload){
    if(!payload?.state) return 'Pusty slot';
    const s=payload.state;
    const saved=payload.savedAt?new Date(payload.savedAt).toLocaleString('pl-PL'):'data nieznana';
    if(payload.coop?.players?.length)return `CO-OP • ${payload.coop.players.length} graczy • sezon ${s.seasonYear}/${String((s.seasonYear||0)+1).slice(2)} • ${saved}`;
    return `${s.name||'Piłkarz'} • ${s.age||'?'} lat • OVR ${s.overall||'?'} • ${s.club?.name||'bez klubu'} • ${saved}`;
  }

  function serializedCoopSession(){
    if(!coopIsActive())return null;
    coopSession.players[coopSession.activeIndex]=state;
    const sharedWorld=state.leagueWorld||coopSession.sharedWorld||freshLeagueWorld();
    const players=coopSession.players.map(player=>{
      const copy={...player};
      delete copy.leagueWorld;
      return copy;
    });
    return {version:1,activeIndex:coopSession.activeIndex,roundYear:coopSession.roundYear,players,sharedWorld};
  }

  function saveGameToSlot(slot){
    const coopMidRound=coopIsActive()&&(coopSession.completedPlayerIds||[]).length>0;
    if(!state?.club || state.retired || state.pendingDecision || coopMidRound){
      els.saveGameText.textContent='Zapis jest możliwy między sezonami, gdy żadne pytanie, mecz ani turniej nie czeka na odpowiedź.';
      return;
    }
    const existing=readSaveSlot(slot);
    if(existing && !window.confirm(`Nadpisać zapis w slocie ${slot}?`)) return;
    try{
      const coop=serializedCoopSession();
      safeLocalSet(`${SAVE_SLOT_PREFIX}${slot}`,JSON.stringify({version:'1.64',savedAt:new Date().toISOString(),state,coop}));
      if(!readSaveSlot(slot)) throw new Error('save unavailable');
      rememberSaveSlot(slot);
      els.saveGameText.textContent=`Zapisano karierę w slocie ${slot}.`;
      renderSaveGameSlots();
    }catch(_){
      els.saveGameText.textContent='Nie udało się zapisać gry w pamięci tej przeglądarki.';
    }
  }

  function normalizeLoadedState(loaded){
    loaded.club=hydrateClubSnapshot(loaded.club);
    if(loaded.loanReturn) loaded.loanReturn=hydrateClubSnapshot(loaded.loanReturn);
    loaded.eventMemory=loaded.eventMemory||{};
    loaded.offerHistory=loaded.offerHistory||{};
    loaded.offerCounts=loaded.offerCounts||{};
    loaded.careerSeasons=loaded.careerSeasons||[];
    loaded.ballondorHistory=loaded.ballondorHistory||[];
    loaded.gornikKogutyTotal=Number.isFinite(loaded.gornikKogutyTotal)?loaded.gornikKogutyTotal:0;
    loaded.clubLegendMilestones=loaded.clubLegendMilestones||{};
    loaded.season=loaded.season||{apps:0,goals:0,assists:0,minutes:0};
    loaded.totals=loaded.totals||{apps:0,goals:0,assists:0,minutes:0};
    loaded.seasonMatchExtras=[];
    loaded.nationalSuspensionMatches=Math.max(0,loaded.nationalSuspensionMatches||0);
    loaded.pendingDecision=false;
    loaded.pendingTournament=null;
    loaded.pendingWorldPlayoff=null;
    loaded.seasonClubName=loaded.seasonClubName||loaded.club?.name||null;
    loaded.seasonClubCompetition=loaded.seasonClubCompetition||null;
    loaded.nextAppsFactor=Number.isFinite(loaded.nextAppsFactor)?loaded.nextAppsFactor:1;
    loaded.nextMinutesFactor=Number.isFinite(loaded.nextMinutesFactor)?loaded.nextMinutesFactor:1;
    loaded.currencyDisplay=['PLN','EUR','PLZ','KHR'].includes(loaded.currencyDisplay)?loaded.currencyDisplay:preferredCurrency();
    loaded.seasonPanelMode=loaded.seasonPanelMode==='old'?'old':'new';
    loaded.visualTheme=['classic','club','monochrome'].includes(loaded.visualTheme)?loaded.visualTheme:preferredVisualTheme();
    loaded.leagueTableStyle=loaded.leagueTableStyle==='clubs'?'clubs':'zones';
    loaded.contractAnnualPln=Number.isFinite(loaded.contractAnnualPln)?loaded.contractAnnualPln:null;
    loaded.longContractClubName=loaded.longContractClubName||null;
    loaded.longContractUntilAge=Number.isFinite(loaded.longContractUntilAge)?loaded.longContractUntilAge:null;
    loaded.favoriteClubName=loaded.favoriteClubName||null;
    loaded.pendingEventTransferOffer=null;
    loaded.lastSeasonDashboard=loaded.lastSeasonDashboard||null;
    ensureLeagueWorld(loaded);
    // Nazwy ocen są warstwą językową. Starsze zapisy zachowują indeksy,
    // więc po zmianie słownictwa można je bezpiecznie pokazać nową drabinką.
    loaded.careerSeasons.forEach(season=>{
      if(Number.isFinite(season.gradeIndex)) season.grade=SEASON_GRADE_LABELS[season.gradeIndex]||season.grade;
    });
    if(Number.isFinite(loaded.lastSeasonDashboard?.gradeIndex)){
      loaded.lastSeasonDashboard.gradeLabel=SEASON_GRADE_LABELS[loaded.lastSeasonDashboard.gradeIndex]||loaded.lastSeasonDashboard.gradeLabel;
    }
    loaded.legendReferenceScores=loaded.legendReferenceScores||{};
    loaded.careerEarningsPln=Number.isFinite(loaded.careerEarningsPln)
      ?loaded.careerEarningsPln
      :loaded.careerSeasons.reduce((sum,s)=>sum+(Number.isFinite(s.annualSalaryPln)?s.annualSalaryPln:0),0);
    // v1.24 obniża całą skalę finansów o 25%. Starszy zapis przechodzi tę
    // korektę dokładnie raz, razem z historycznymi zarobkami.
    if((loaded.financeScaleVersion||0)<124){
      const lower=value=>Math.max(0,Math.round(Number(value||0)*.75/500)*500);
      if(Number.isFinite(loaded.contractAnnualPln)) loaded.contractAnnualPln=Math.max(4500,lower(loaded.contractAnnualPln));
      loaded.careerEarningsPln=lower(loaded.careerEarningsPln);
      loaded.careerSeasons.forEach(season=>{
        if(Number.isFinite(season.annualSalaryPln)) season.annualSalaryPln=lower(season.annualSalaryPln);
      });
      loaded.financeScaleVersion=124;
    }
    // v1.48: w klasach A i B zawodnik dopłaca do gry. Przy wczytaniu
    // starszej kariery aktualizujemy wyłącznie bieżący kontrakt; zamkniętych
    // sezonów i ich historycznego bilansu nie przepisujemy wstecz.
    if((loaded.financeScaleVersion||0)<148){
      const contribution=amateurMonthlyContribution(loaded.club);
      if(contribution) loaded.contractAnnualPln=contribution*12;
      loaded.financeScaleVersion=148;
    }
    // v1.56: wszystkie zwykłe ligi wracają do neutralnego mnożnika 1.00.
    // Przeliczamy tylko bieżący kontrakt; zakończone sezony pozostają historią.
    if((loaded.financeScaleVersion||0)<156){
      const contribution=amateurMonthlyContribution(loaded.club);
      loaded.contractAnnualPln=contribution?contribution*12:null;
      loaded.financeScaleVersion=156;
    }
    // v1.57: nowe korekty krajowe zmieniają wyłącznie przyszły/bieżący
    // kontrakt. Zamkniętych sezonów nie przeliczamy wstecz.
    if((loaded.financeScaleVersion||0)<157){
      const contribution=amateurMonthlyContribution(loaded.club);
      loaded.contractAnnualPln=contribution?contribution*12:null;
      loaded.financeScaleVersion=157;
    }
    // v1.58: zawodowa podłoga płacowa Turcji działa dopiero na bieżący i
    // przyszłe kontrakty. Historia finansowa rozegranych sezonów nie zmienia się.
    if((loaded.financeScaleVersion||0)<158){
      const contribution=amateurMonthlyContribution(loaded.club);
      loaded.contractAnnualPln=contribution?contribution*12:null;
      loaded.financeScaleVersion=158;
    }
    // v1.59: polskie ligi zawodowe otrzymują realne minima, a klubowe OVR
    // i stały rzut rynku różnicują oferty w obrębie tych samych rozgrywek.
    if((loaded.financeScaleVersion||0)<159){
      const contribution=amateurMonthlyContribution(loaded.club);
      loaded.contractAnnualPln=contribution?contribution*12:null;
      loaded.financeScaleVersion=159;
    }
    // v1.60: jeden wzór łączy prestiż ligi, OVR klubu, medialność i rzut.
    // Mnożnik finansowy działa na końcu; historia sezonów pozostaje bez zmian.
    if((loaded.financeScaleVersion||0)<160){
      const contribution=amateurMonthlyContribution(loaded.club);
      loaded.contractAnnualPln=contribution?contribution*12:null;
      loaded.financeScaleVersion=160;
    }
    loaded.professionalismCareerTotal=Number.isFinite(loaded.professionalismCareerTotal)
      ?loaded.professionalismCareerTotal
      :loaded.careerSeasons.reduce((sum,s)=>sum+(Number.isFinite(s.professionalism)?s.professionalism:0),0);
    loaded.professionalismCareerSamples=Number.isFinite(loaded.professionalismCareerSamples)
      ?loaded.professionalismCareerSamples
      :loaded.careerSeasons.filter(s=>Number.isFinite(s.professionalism)).length;
    loaded.gamblingGame=loaded.gamblingGame||pick(GAMBLING_GAMES);
    loaded.season.goalsConceded=loaded.season.goalsConceded||0;
    loaded.season.cleanSheets=loaded.season.cleanSheets||0;
    loaded.totals.goalsConceded=loaded.totals.goalsConceded||0;
    loaded.totals.cleanSheets=loaded.totals.cleanSheets||0;
    loaded.nationalGoalsConceded=loaded.nationalGoalsConceded||0;
    loaded.nationalCleanSheets=loaded.nationalCleanSheets||0;
    loaded.seasonNationalGoalsConceded=loaded.seasonNationalGoalsConceded||0;
    loaded.seasonNationalCleanSheets=loaded.seasonNationalCleanSheets||0;
    const savedRepresentedCountry=loaded.representedCountry||null;
    const currentNational=String(loaded.national||'').trim();
    const currentSeniorCountry=currentNational&&currentNational!=='—'&&!/^Polska U-\d+$/i.test(currentNational)
      ?currentNational
      :null;
    loaded.seniorNationalCountry=loaded.seniorNationalCountry||(
      ((loaded.nationalCaps||0)>0||loaded.seniorInternational)
        ?(savedRepresentedCountry||currentSeniorCountry)
        :null
    );
    // Pierwsza seniorska reprezentacja jest wyborem nieodwracalnym. Pole
    // representedCountry może pochodzić ze starszego zapisu, ale nie może
    // już nadpisać kraju, dla którego zawodnik rozegrał seniorski mecz.
    loaded.representedCountry=loaded.seniorNationalCountry||savedRepresentedCountry||'Polska';
    loaded.naturalizationOfferUsed=!!loaded.naturalizationOfferUsed;
    loaded.naturalized=!!loaded.naturalized;
    loaded.nationalTournamentHistory=loaded.nationalTournamentHistory||{};
    loaded.continentalCups=loaded.continentalCups||loaded.euros||0;
    return loaded;
  }

  function loadGameFromSlot(slot){
    const payload=readSaveSlot(slot);
    if(!payload?.state) return;
    if(payload.coop?.players?.length>=2){
      const sharedWorld=payload.coop.sharedWorld||payload.state.leagueWorld||freshLeagueWorld();
      const players=payload.coop.players.map((saved,index)=>normalizeLoadedState({...saved,coopPlayerId:saved.coopPlayerId||`COOP-${index+1}`,leagueWorld:sharedWorld}));
      const activeIndex=clamp(Number(payload.coop.activeIndex)||0,0,players.length-1);
      coopSession={
        enabled:true,version:1,players,activeIndex,completedPlayerIds:[],
        roundYear:Number(payload.coop.roundYear)||players[activeIndex].seasonYear,
        sharedWorld,assignments:[],scopeCache:{year:players[activeIndex].seasonYear,poland:null,foreign:{}},clubCupResults:{}
      };
      state=players[activeIndex];
      coopRefreshAssignments();
    }else{
      coopSession=null;
      state=normalizeLoadedState(payload.state);
    }
    activateLeagueWorldForClub(state.club);
    closeSaveGameModal();
    els.decisionBox.classList.add('hidden');
    els.playSeasonBtn.classList.remove('hidden');
    els.profile89View.classList.add('hidden');
    els.retirementSummary.classList.remove('hidden');
    document.querySelector('#nssTournamentRoot')?.classList.add('nss-hidden');
    show(els.careerView);
    els.newCareerBtn.classList.remove('hidden');
    els.saveGameBtn?.classList.remove('hidden');
    render();
    els.eventBox.dataset.panelRole='event';
    els.eventBox.innerHTML=`<div class="event-kicker">WCZYTANO GRĘ • SLOT ${slot}${coopIsActive()?' • CO-OP':''}</div><h3>${state.name} wraca do gry.</h3><p>${state.club.name} • ${clubCompetition(state.club)} • ${state.age} lat • OVR ${state.overall}.${coopIsActive()?' To pierwsza aktywna tura wspólnego sezonu.':''}</p>`;
    renderSeasonPanels();
  }

  function renderSaveGameSlots(){
    if(!els.saveGameSlots) return;
    els.saveGameSlots.innerHTML='';
    const saved=savedSlotIds();
    const slots=saveModalMode==='save'?[...saved,(saved.length?Math.max(...saved):0)+1]:saved;
    if(!slots.length){
      const empty=document.createElement('p');
      empty.className='save-slots-empty';
      empty.textContent='Na tym urządzeniu nie ma jeszcze żadnego zapisu kariery.';
      els.saveGameSlots.appendChild(empty);
      return;
    }
    for(const slot of slots){
      const payload=readSaveSlot(slot);
      const button=document.createElement('button');
      button.type='button'; button.className='save-slot';
      button.disabled=saveModalMode==='load'&&!payload;
      const action=saveModalMode==='save'?(payload?'NADPISZ':'ZAPISZ'):'WCZYTAJ';
      const actionLabel=document.createElement('strong');
      actionLabel.append(document.createTextNode(action),document.createElement('br'),document.createTextNode(`SLOT ${slot}`));
      const description=document.createElement('span');
      description.textContent=saveSlotDescription(payload);
      button.append(actionLabel,description);
      button.onclick=()=>saveModalMode==='save'?saveGameToSlot(slot):loadGameFromSlot(slot);
      els.saveGameSlots.appendChild(button);
    }
  }

  function openSaveGameModal(mode){
    saveModalMode=mode==='save'?'save':'load';
    els.saveGameTitle.textContent=saveModalMode==='save'?'Zapisz grę':'Wczytaj grę';
    els.saveGameText.textContent=saveModalMode==='save'
      ?'Wybierz istniejący slot albo utwórz nowy. Liczba slotów nie jest ograniczona. Zapis działa między sezonami, poza trwającą decyzją lub meczem.'
      :'Wybierz zapis kariery przechowywany na tym urządzeniu.';
    renderSaveGameSlots();
    els.saveGameModal?.classList.remove('hidden');
  }
  let activePlayMs=Math.max(0,Number(safeLocalGet(ACTIVE_PLAY_TIME_KEY))||0);
  let youtubePromptSeen=safeLocalGet(YOUTUBE_SEEN_KEY)==='1';
  let youtubePromptShown=false;
  let patronitePromptSeen=safeLocalGet(PATRONITE_SEEN_KEY)==='1';
  let patronitePromptShown=false;
  let activePlayLastTick=Date.now();
  let activePlayLastSaved=activePlayMs;

  function closeYouTubePrompt(){
    youtubePromptSeen=true;
    safeLocalSet(YOUTUBE_SEEN_KEY,'1');
    safeLocalSet(ACTIVE_PLAY_TIME_KEY,Math.round(activePlayMs));
    els.youtubePrompt?.classList.add('hidden');
  }

  function showYouTubePrompt(){
    if(youtubePromptSeen || youtubePromptShown || !els.youtubePrompt) return;
    youtubePromptShown=true;
    els.youtubePrompt.classList.remove('hidden');
    els.youtubePromptClose?.focus();
  }

  function closePatronitePrompt(){
    patronitePromptSeen=true;
    safeLocalSet(PATRONITE_SEEN_KEY,'1');
    safeLocalSet(ACTIVE_PLAY_TIME_KEY,Math.round(activePlayMs));
    els.patronitePrompt?.classList.add('hidden');
  }

  function showPatronitePrompt(){
    if(patronitePromptSeen || patronitePromptShown || !els.patronitePrompt) return;
    if(els.youtubePrompt && !els.youtubePrompt.classList.contains('hidden')) return;
    patronitePromptShown=true;
    els.patronitePrompt.classList.remove('hidden');
    els.patronitePromptClose?.focus();
  }

  // Liczymy tylko czas po rozpoczęciu kariery i tylko wtedy, gdy karta jest
  // widoczna. Długi powrót z tła nie dopisuje od razu całej przerwy.
  setInterval(()=>{
    const now=Date.now();
    if(state && document.visibilityState!=='hidden' && (!youtubePromptSeen || !patronitePromptSeen)){
      activePlayMs+=Math.min(2000,Math.max(0,now-activePlayLastTick));
      if(activePlayMs-activePlayLastSaved>=10000){
        safeLocalSet(ACTIVE_PLAY_TIME_KEY,Math.round(activePlayMs));
        activePlayLastSaved=activePlayMs;
      }
      if(activePlayMs>=YOUTUBE_PROMPT_MS) showYouTubePrompt();
      if(activePlayMs>=PATRONITE_PROMPT_MS) showPatronitePrompt();
    }
    activePlayLastTick=now;
  },1000);

  // Umowna skala świata gry. To nie jest "obiektywny ranking historii",
  // tylko punkt odniesienia dla sekretnego endgame'u kariery.
  //
  // Pula ma 25 legend. Cztery największe kotwice są zawsze obecne,
  // a pozostałe pięć nazwisk w historycznym TOP 10 jest losowane
  // przy odblokowaniu Trybu Legendy.
  const FOOTBALL_HISTORY_REFERENCE=[
    {name:'Lionel Messi',min:120,max:125,anchor:true},
    {name:'Pelé',min:119,max:124,anchor:true},
    {name:'Diego Maradona',min:118,max:123,anchor:true},
    {name:'Cristiano Ronaldo',min:117,max:122,anchor:true},

    {name:'Johan Cruyff',min:111,max:117},
    {name:'Ronaldo Nazário',min:111,max:117},
    {name:'Alfredo Di Stéfano',min:110,max:116},
    {name:'Ferenc Puskás',min:109,max:115},
    {name:'Franz Beckenbauer',min:108,max:114},

    {name:'Zinédine Zidane',min:106,max:113},
    {name:'Michel Platini',min:106,max:112},
    {name:'Garrincha',min:106,max:112},
    {name:'Ronaldinho',min:104,max:111},
    {name:'Eusébio',min:104,max:111},
    {name:'Gerd Müller',min:104,max:110},
    {name:'Marco van Basten',min:104,max:110},

    {name:'George Best',min:103,max:109},
    {name:'Zico',min:103,max:109},
    {name:'Romário',min:102,max:108},
    {name:'Andrés Iniesta',min:102,max:108},
    {name:'Xavi',min:101,max:107},

    {name:'Luka Modrić',min:101,max:107},
    {name:'Neymar',min:100,max:106},
    {name:'Kylian Mbappé',min:100,max:106},
    {name:'Lew Jaszyn',min:100,max:106}
  ];

  function overallCap(){
    const standard=state && state.legendEraActive ? 125 : 99;
    return Math.max(standard,state?.grajewskiOverallCap||0);
  }

  function updateLegendPeak(){
    state.peakOverall=Math.max(state.peakOverall||0,state.overall||0);
    if(state.legendUnlocked){
      state.legendPeakOverall=Math.max(state.legendPeakOverall||0,state.overall||0);
    }
  }

  function noteLegendOverallChange(before){
    updateLegendPeak();
    const standardCap=state.legendEraActive?125:99;
    if((state.grajewskiOverallCap||0)>standardCap && state.overall<=standardCap){
      state.grajewskiOverallCap=0;
    }
    if(state.legendEraActive && before>=100 && state.overall<100){
      state.legendEraActive=false;
      if(!state.legendRankingShown) state.legendRankingPending=true;
      log('KONIEC ERY 100+',`Szczyt ${state.legendPeakOverall} OVR • sezony 100+: ${state.legendSeasons100||0}`);
    }
  }

  function ensureLegendReferenceSet(){
    if(Array.isArray(state.legendReferenceNames) && state.legendReferenceNames.length===9){
      state.legendReferenceScores=state.legendReferenceScores||{};
      const used=new Set(Object.values(state.legendReferenceScores).filter(Number.isFinite));
      state.legendReferenceNames.forEach(name=>{
        if(Number.isFinite(state.legendReferenceScores[name])) return;
        const ref=FOOTBALL_HISTORY_REFERENCE.find(x=>x.name===name);
        if(!ref) return;
        let score=rand(ref.min,ref.max);
        for(let tries=0;tries<30&&used.has(score);tries++) score=rand(ref.min,ref.max);
        state.legendReferenceScores[name]=score;
        used.add(score);
      });
      return state.legendReferenceNames;
    }

    const anchors=FOOTBALL_HISTORY_REFERENCE.filter(x=>x.anchor);
    const rest=shuffle(FOOTBALL_HISTORY_REFERENCE.filter(x=>!x.anchor)).slice(0,5);
    state.legendReferenceNames=[...anchors,...rest].map(x=>x.name);
    state.legendReferenceScores={};
    const used=new Set();
    [...anchors,...rest].forEach(ref=>{
      let score=rand(ref.min,ref.max);
      for(let tries=0;tries<30&&used.has(score);tries++) score=rand(ref.min,ref.max);
      state.legendReferenceScores[ref.name]=score;
      used.add(score);
    });
    return state.legendReferenceNames;
  }

  function selectedLegendReferences(){
    const names=ensureLegendReferenceSet();
    return names
      .map(name=>{
        const ref=FOOTBALL_HISTORY_REFERENCE.find(x=>x.name===name);
        return ref?{...ref,ovr:state.legendReferenceScores?.[name]??ref.min}:null;
      })
      .filter(Boolean);
  }

  function legendHistoricalRanking(){
    const player={
      name:state.name,
      ovr:Math.max(state.legendPeakOverall||0,state.peakOverall||0),
      player:true
    };
    return [...selectedLegendReferences(),player]
      .sort((a,b)=>b.ovr-a.ovr || (a.player?1:0)-(b.player?1:0))
      .map((x,i)=>({...x,place:i+1}));
  }

  function legendRankingHtml(){
    const rows=legendHistoricalRanking();
    const playerRow=rows.find(x=>x.player);
    const place=playerRow?playerRow.place:10;
    const peak=Math.max(state.legendPeakOverall||0,state.peakOverall||0);
    return `<div class="legend-ranking">
      <div class="legend-ranking-head">TOP 10 HISTORII • SZCZYT OVR</div>
      ${rows.map(x=>`<div class="legend-row${x.player?' player':''}">
        <strong>${x.place}.</strong><span>${x.player?`${x.name} — TWOJA KARIERA`:x.name}</span><strong>${x.ovr}</strong>
      </div>`).join('')}
    </div>
    <div class="legend-note">Umowny ranking świata gry oparty wyłącznie na najwyższym OVR. Dziewięć legend jest dobieranych z puli 25 nazwisk, a ich poziom jest losowany dla każdej kariery w szerokiej skali 100–125. Messi, Pelé, Maradona i Cristiano Ronaldo pozostają stałymi punktami odniesienia. Twój szczyt: <strong>${peak}</strong> • miejsce: <strong>${place}.</strong>.</div>`;
  }

  function showLegendRanking(onDone){
    state.legendRankingPending=false;
    presentDecision({
      title:'KONIEC ERY • TWOJE MIEJSCE W HISTORII',
      html:`Po raz pierwszy od odblokowania Trybu Legendy spadasz poniżej 100 OVR. Gra zamyka twój historyczny prime i porównuje najwyższy osiągnięty poziom z umowną skalą największych piłkarzy w historii.${legendRankingHtml()}`,
      text:'',
      choices:[{
        label:'DALEJ',
        ovrProfile:null,
        preview:'Ranking zostaje zapisany w historii kariery.',
        act:()=>{ state.legendRankingShown=true; state.legendRankingPending=false; }
      }]
    },onDone);
  }


  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const shuffle = arr => arr.slice().sort(()=>Math.random()-.5);
  const weightedPick = arr => {
    const total=arr.reduce((sum,x)=>sum+Math.max(0.01,x.weight||1),0);
    let roll=Math.random()*total;
    for(const x of arr){ roll-=Math.max(0.01,x.weight||1); if(roll<=0) return x; }
    return arr[arr.length-1];
  };

  Object.keys(GAME_DATA.regions).forEach(r => {
    const o = document.createElement('option'); o.value=r; o.textContent=r; els.region.appendChild(o);
  });

  const favoriteCompetitionGroups=new Map();
  function addFavoriteGroup(area,key,label,clubs,meta={}){
    if(!clubs.length) return;
    favoriteCompetitionGroups.set(key,{area,label,clubs:clubs.slice().sort((a,b)=>a.name.localeCompare(b.name,'pl')),...meta});
  }
  function competitionGroupOrder(a,b){
    const left=a[1],right=b[1];
    if(left.polish&&right.polish){
      const levelDiff=(left.clubs[0]?.pyramidLevel||99)-(right.clubs[0]?.pyramidLevel||99);
      if(levelDiff) return levelDiff;
    }
    return left.label.localeCompare(right.label,'pl');
  }
  const polishByCompetition=new Map();
  CLUBS.filter(c=>!c.reserve).forEach(c=>{
    const key=`PL:${c.competitionKey||`${c.pyramidLevel||c.tier}|${c.leagueName||tierName(c.tier)}|${c.group||''}`}`;
    if(!polishByCompetition.has(key)) polishByCompetition.set(key,[]);
    polishByCompetition.get(key).push(c);
  });
  [...polishByCompetition.entries()]
    .sort((a,b)=>(a[1][0].pyramidLevel||99)-(b[1][0].pyramidLevel||99)||clubCompetition(a[1][0]).localeCompare(clubCompetition(b[1][0]),'pl'))
    .forEach(([key,clubs])=>{
      const sample=clubs[0];
      const area=(sample.pyramidLevel||99)>=5?`Polska — ${sample.region}`:'Polska';
      addFavoriteGroup(area,key,clubCompetition(sample),clubs,{polish:true,tier:sample.tier,detailed:true});
    });
  const foreignByLeague=new Map();
  GAME_DATA.foreignClubs.forEach(c=>{
    const key=`F:${c.country}:${c.league}`;
    if(!foreignByLeague.has(key)) foreignByLeague.set(key,{area:c.zone||'Zagranica',label:`${c.country} — ${c.league}`,clubs:[]});
    foreignByLeague.get(key).clubs.push(c);
  });
  [...foreignByLeague.entries()].sort((a,b)=>a[1].label.localeCompare(b[1].label,'pl')).forEach(([key,g])=>addFavoriteGroup(g.area,key,g.label,g.clubs));

  function populateFavoriteCompetitions(){
    if(!els.favoriteCompetition) return;
    els.favoriteCompetition.innerHTML='<option value="">Nie wybieram klubu</option>';
    const areas=[...new Set([...favoriteCompetitionGroups.values()].map(g=>g.area))].sort((a,b)=>a==='Polska'?-1:b==='Polska'?1:a.startsWith('Polska')&&!b.startsWith('Polska')?-1:b.startsWith('Polska')&&!a.startsWith('Polska')?1:a.localeCompare(b,'pl'));
    areas.forEach(area=>{
      const group=document.createElement('optgroup'); group.label=area;
      [...favoriteCompetitionGroups.entries()].filter(([,g])=>g.area===area).sort(competitionGroupOrder).forEach(([key,g])=>{
        const option=document.createElement('option'); option.value=key; option.textContent=g.label; group.appendChild(option);
      });
      els.favoriteCompetition.appendChild(group);
    });
    updateFavoriteClubs();
  }
  function updateFavoriteClubs(){
    if(!els.favoriteClub) return;
    const group=favoriteCompetitionGroups.get(els.favoriteCompetition?.value);
    els.favoriteClub.innerHTML='';
    if(!group){
      els.favoriteRegionWrap?.classList.add('hidden');
      if(els.favoriteRegion){ els.favoriteRegion.innerHTML=''; els.favoriteRegion.disabled=true; }
      const option=document.createElement('option'); option.value=''; option.textContent='—'; els.favoriteClub.appendChild(option); els.favoriteClub.disabled=true; return;
    }
    const needsRegion=group.polish&&!group.detailed&&group.tier<=3;
    if(els.favoriteRegionWrap) els.favoriteRegionWrap.classList.toggle('hidden',!needsRegion);
    if(els.favoriteRegion){
      if(needsRegion){
        const previous=els.favoriteRegion.value;
        const regions=[...new Set(group.clubs.map(c=>c.region).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pl'));
        els.favoriteRegion.innerHTML='';
        regions.forEach(region=>{const option=document.createElement('option');option.value=region;option.textContent=region;els.favoriteRegion.appendChild(option);});
        els.favoriteRegion.value=regions.includes(previous)?previous:(regions.includes(els.region?.value)?els.region.value:(regions[0]||''));
        els.favoriteRegion.disabled=false;
      }else{
        els.favoriteRegion.innerHTML='';
        els.favoriteRegion.disabled=true;
      }
    }
    const clubs=needsRegion?group.clubs.filter(c=>c.region===els.favoriteRegion?.value):group.clubs;
    els.favoriteClub.disabled=false;
    clubs.forEach(c=>{const option=document.createElement('option'); option.value=c.name; option.textContent=c.name; els.favoriteClub.appendChild(option);});
  }
  els.favoriteCompetition?.addEventListener('change',updateFavoriteClubs);
  els.favoriteRegion?.addEventListener('change',updateFavoriteClubs);
  els.region?.addEventListener('change',()=>{
    const group=favoriteCompetitionGroups.get(els.favoriteCompetition?.value);
    if(group?.polish&&group.tier<=3&&els.favoriteRegion){ els.favoriteRegion.value=els.region.value; updateFavoriteClubs(); }
  });
  populateFavoriteCompetitions();

  function populateStartClubCompetitions(){
    if(!els.startClubCompetition) return;
    els.startClubCompetition.innerHTML='';
    const areas=[...new Set([...favoriteCompetitionGroups.values()].map(g=>g.area))]
      .sort((a,b)=>a==='Polska'?-1:b==='Polska'?1:a.startsWith('Polska')&&!b.startsWith('Polska')?-1:b.startsWith('Polska')&&!a.startsWith('Polska')?1:a.localeCompare(b,'pl'));
    areas.forEach(area=>{
      const optgroup=document.createElement('optgroup');
      optgroup.label=area;
      [...favoriteCompetitionGroups.entries()]
        .filter(([,group])=>group.area===area)
        .sort(competitionGroupOrder)
        .forEach(([key,group])=>{
          const option=document.createElement('option');
          option.value=key;
          option.textContent=group.label;
          optgroup.appendChild(option);
        });
      els.startClubCompetition.appendChild(optgroup);
    });
    updateStartClubOptions();
  }
  function updateStartClubOptions(){
    if(!els.startClub) return;
    const group=favoriteCompetitionGroups.get(els.startClubCompetition?.value);
    els.startClub.innerHTML='';
    (group?.clubs||[]).forEach(club=>{
      const option=document.createElement('option');
      option.value=club.name;
      option.textContent=club.name;
      els.startClub.appendChild(option);
    });
    els.confirmStartClubBtn.disabled=!group?.clubs?.length;
  }
  els.startClubCompetition?.addEventListener('change',updateStartClubOptions);
  populateStartClubCompetitions();

  const COOP_START_LABELS={
    lastPe:'Ostatni na w-fie — 1 OVR',bclassVeteran:'B-klasowy wyjadacz — 10–20 OVR',
    backyard:'Podwórko — 29–34 OVR',normal:'Normalny chłop — 39–45 OVR',
    syrenka:'Puchar Syrenki — 50–55 OVR',wonderkid:'Wonderkid — 60–66 OVR'
  };
  function coopSetupError(message=''){
    if(!els.coopSetupError)return;
    els.coopSetupError.textContent=message;
    els.coopSetupError.classList.toggle('hidden',!message);
  }
  function populateCoopCompetitionSelect(select,preferred=''){
    if(!select)return;
    select.innerHTML='';
    const areas=[...new Set([...favoriteCompetitionGroups.values()].map(group=>group.area))]
      .sort((a,b)=>a==='Polska'?-1:b==='Polska'?1:a.startsWith('Polska')&&!b.startsWith('Polska')?-1:b.startsWith('Polska')&&!a.startsWith('Polska')?1:a.localeCompare(b,'pl'));
    areas.forEach(area=>{
      const optgroup=document.createElement('optgroup');optgroup.label=area;
      [...favoriteCompetitionGroups.entries()].filter(([,group])=>group.area===area).sort(competitionGroupOrder).forEach(([key,group])=>{
        const option=document.createElement('option');option.value=key;option.textContent=group.label;optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });
    const topPolish=[...favoriteCompetitionGroups.entries()].find(([,group])=>group.polish&&group.clubs[0]?.pyramidLevel===1)?.[0];
    if(preferred&&favoriteCompetitionGroups.has(preferred))select.value=preferred;
    else if(topPolish)select.value=topPolish;
  }
  function updateCoopClubSelect(card,preferredId=''){
    const competition=card?.querySelector('[data-coop-field="competition"]');
    const clubSelect=card?.querySelector('[data-coop-field="club"]');
    if(!competition||!clubSelect)return;
    const group=favoriteCompetitionGroups.get(competition.value);
    clubSelect.innerHTML='';
    (group?.clubs||[]).forEach(club=>{
      const option=document.createElement('option');option.value=worldClubId(club);option.textContent=club.name;clubSelect.appendChild(option);
    });
    if(preferredId&&[...clubSelect.options].some(option=>option.value===preferredId))clubSelect.value=preferredId;
  }
  function coopExistingConfigs(){
    return [...(els.coopPlayersConfig?.querySelectorAll('.coop-player-config')||[])].map(card=>({
      name:card.querySelector('[data-coop-field="name"]')?.value||'',
      position:card.querySelector('[data-coop-field="position"]')?.value||'MID',
      foot:card.querySelector('[data-coop-field="foot"]')?.value||'Prawa',
      region:card.querySelector('[data-coop-field="region"]')?.value||Object.keys(GAME_DATA.regions)[0],
      startPoint:card.querySelector('[data-coop-field="startPoint"]')?.value||'normal',
      competition:card.querySelector('[data-coop-field="competition"]')?.value||'',
      clubId:card.querySelector('[data-coop-field="club"]')?.value||''
    }));
  }
  function renderCoopSetup(){
    if(!els.coopPlayersConfig||!state)return;
    coopSetupError('');
    const existing=coopExistingConfigs();
    const count=clamp(Number(els.coopPlayerCount?.value)||2,2,6);
    els.coopPlayersConfig.innerHTML='';
    for(let index=0;index<count;index++){
      const profile=index===0
        ?{name:state.name,position:state.position,foot:state.foot,region:state.region,startPoint:state.startPoint}
        :randomSetupPlayerProfile();
      const previous=existing[index]||{};
      const config={
        name:previous.name||profile.name||randomSetupPlayerName(),
        position:previous.position||(['GK','DEF','MID','FWD'].includes(profile.position)?profile.position:'MID'),
        foot:previous.foot||'Prawa',region:previous.region||(GAME_DATA.regions[profile.region]?profile.region:state.region),
        startPoint:previous.startPoint||(COOP_START_LABELS[profile.startPoint]?profile.startPoint:state.startPoint),
        competition:previous.competition||'',clubId:previous.clubId||''
      };
      const card=document.createElement('article');card.className='coop-player-config';card.dataset.coopIndex=String(index);
      card.innerHTML=`<h3>GRACZ ${index+1}</h3><div class="coop-player-config-grid">
        <label class="full-row"><span>Imię i nazwisko</span><input data-coop-field="name" maxlength="28" value="${escapeDecisionHtml(config.name)}"></label>
        <label><span>Pozycja</span><select data-coop-field="position"><option value="GK">Bramkarz</option><option value="DEF">Obrońca</option><option value="MID">Pomocnik</option><option value="FWD">Napastnik</option></select></label>
        <label><span>Lepsza noga</span><select data-coop-field="foot"><option value="Prawa">Prawa</option><option value="Lewa">Lewa</option></select></label>
        <label><span>Województwo</span><select data-coop-field="region"></select></label>
        <label><span>Punkt startowy</span><select data-coop-field="startPoint"></select></label>
        <label><span>Kraj i rozgrywki</span><select data-coop-field="competition"></select></label>
        <label><span>Klub startowy</span><select data-coop-field="club"></select></label>
      </div>`;
      const positionSelect=card.querySelector('[data-coop-field="position"]');positionSelect.value=config.position;
      const footSelect=card.querySelector('[data-coop-field="foot"]');footSelect.value=config.foot;
      const regionSelect=card.querySelector('[data-coop-field="region"]');
      Object.keys(GAME_DATA.regions).forEach(region=>{const option=document.createElement('option');option.value=region;option.textContent=region;regionSelect.appendChild(option);});
      regionSelect.value=config.region;
      const startSelect=card.querySelector('[data-coop-field="startPoint"]');
      Object.entries(COOP_START_LABELS).forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;startSelect.appendChild(option);});
      startSelect.value=config.startPoint;
      const competitionSelect=card.querySelector('[data-coop-field="competition"]');
      populateCoopCompetitionSelect(competitionSelect,config.competition);
      competitionSelect.addEventListener('change',()=>updateCoopClubSelect(card));
      updateCoopClubSelect(card,config.clubId);
      els.coopPlayersConfig.appendChild(card);
    }
  }
  function readCoopSetupPlayers(){
    const cards=[...(els.coopPlayersConfig?.querySelectorAll('.coop-player-config')||[])];
    const players=cards.map((card,index)=>({
      index,name:String(card.querySelector('[data-coop-field="name"]')?.value||'').trim().replace(/\s+/g,' '),
      position:card.querySelector('[data-coop-field="position"]')?.value||'MID',
      foot:card.querySelector('[data-coop-field="foot"]')?.value||'Prawa',
      region:card.querySelector('[data-coop-field="region"]')?.value||state.region,
      startPoint:card.querySelector('[data-coop-field="startPoint"]')?.value||'normal',
      clubId:card.querySelector('[data-coop-field="club"]')?.value||''
    }));
    if(players.some(player=>player.name.length<2)){coopSetupError('Każdy gracz musi mieć imię i nazwisko lub pseudonim.');return null;}
    const names=players.map(player=>normalizePlayerName(player.name));
    if(new Set(names).size!==names.length){coopSetupError('Gracze muszą mieć różne nazwy, żeby tury i zapis były czytelne.');return null;}
    if(players.some(player=>!worldFindBaseClub(player.clubId))){coopSetupError('Każdy gracz musi wybrać klub startowy.');return null;}
    coopSetupError('');
    return players;
  }
  els.coopPlayerCount?.addEventListener('change',renderCoopSetup);

  function randomSetupPlayerProfile(){
    const profiles=Array.isArray(window.POLISH_PLAYER_PROFILES)?window.POLISH_PLAYER_PROFILES:[];
    if(profiles.length) return pick(profiles);
    const pool=Array.isArray(window.POLISH_PLAYER_NAMES)?window.POLISH_PLAYER_NAMES:[];
    return {name:pool.length?pick(pool):'Jacek Cyzio'};
  }
  function randomSetupPlayerName(){
    return randomSetupPlayerProfile().name;
  }
  function normalizePlayerName(value){
    return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pl-PL');
  }
  function isJakubOlkiewicz(value){ return normalizePlayerName(value)==='jakub olkiewicz'; }
  function isSysioStartEligible(){
    if(!setupDrawnIdentity) return false;
    const currentName=normalizePlayerName($('#playerName').value);
    const currentPosition=$('#position').value;
    return setupDrawnIdentity.name==='filip sysio' &&
      currentPosition==='FWD' &&
      currentPosition===setupDrawnIdentity.position &&
      currentName===setupDrawnIdentity.name;
  }
  function syncSpecialStartOption(){
    const select=$('#startPoint');
    const previous=select.value;
    select.querySelector('option[value="sysio"]')?.remove();
    setupSpecialStart=null;
    if(!isSysioStartEligible()) return;
    const option=document.createElement('option');
    option.value='sysio';
    option.textContent='Filip Sysio — 69–75 OVR';
    select.appendChild(option);
    setupSpecialStart='sysio';
    if(previous==='sysio') select.value='sysio';
  }
  function randomizeSetupScreen(){
    const profile=randomSetupPlayerProfile();
    els.region.value=profile.region&&GAME_DATA.regions[profile.region]?profile.region:pick(Object.keys(GAME_DATA.regions));
    $('#position').value=['GK','DEF','MID','FWD'].includes(profile.position)?profile.position:pick(['DEF','MID','FWD']);
    $('#startPoint').value=profile.startPoint||pick(['backyard','normal','syrenka','wonderkid']);
    $('#playerName').value=profile.name;
    setupDrawnIdentity={
      name:normalizePlayerName($('#playerName').value),
      position:$('#position').value
    };
    syncSpecialStartOption();
  }
  $('#playerName').addEventListener('input',syncSpecialStartOption);
  $('#position').addEventListener('change',syncSpecialStartOption);
  randomizeSetupScreen();

  function tierName(t){
    if(t===0) return 'bez klubu';
    return GAME_DATA.tierNames[t] || (t===7?GAME_DATA.tier7:GAME_DATA.tier8);
  }
  function polishCompetitionName(c){
    if(!c) return '—';
    const league=c.leagueName||tierName(c.tier);
    return c.group?`${league} • ${c.group}`:league;
  }
  function polishCompetitionKey(c){
    if(!c) return '';
    return c.competitionKey||`${c.pyramidLevel||''}|${c.leagueName||tierName(c.tier)}|${c.group||''}`;
  }
  function polishLeaguePeers(c){
    const key=polishCompetitionKey(c);
    return CLUBS.filter(club=>polishCompetitionKey(club)===key);
  }
  function polishStableHash(text){
    let value=2166136261;
    for(const char of String(text||'')){
      value^=char.codePointAt(0);
      value=Math.imul(value,16777619);
    }
    return value>>>0;
  }
  function polishGroupTokens(value){
    const ignored=new Set(['liga','klasa','grupa','polska','polski','polskiej','dolnoslaska','kujawsko','pomorska','lubelska','lubuska','lodzka','malopolska','mazowiecka','opolska','podkarpacka','podlaska','slaska','swietokrzyska','warminsko','mazurska','wielkopolska','zachodniopomorska','polnocna','poludniowa','wschod','zachod','i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv']);
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
      .split(/[^a-z0-9]+/).filter(token=>token&&!ignored.has(token));
  }
  const POLISH_THIRD_LEAGUE_GROUP_BY_REGION=Object.freeze({
    'Łódzkie':'I','Mazowieckie':'I','Podlaskie':'I','Warmińsko-mazurskie':'I',
    'Kujawsko-pomorskie':'II','Pomorskie':'II','Wielkopolskie':'II','Zachodniopomorskie':'II',
    'Dolnośląskie':'III','Lubuskie':'III','Opolskie':'III','Śląskie':'III',
    'Lubelskie':'IV','Małopolskie':'IV','Podkarpackie':'IV','Świętokrzyskie':'IV'
  });
  function polishThirdLeagueGroupForRegion(region){
    return POLISH_THIRD_LEAGUE_GROUP_BY_REGION[region]||null;
  }
  function polishRegionalTransitionValid(club,target){
    if(!club||!target) return false;
    const sourceLevel=Number(club.pyramidLevel)||99;
    const targetLevel=Number(target.pyramidLevel)||99;
    // IV liga i wszystkie niższe poziomy są wojewódzkie. III liga jest
    // pierwszym szczeblem ponadwojewódzkim i przyjmuje klub do grupy I–IV
    // wynikającej z jego stałego województwa.
    if(targetLevel>=5) return target.region===club.region;
    if(targetLevel===4&&(sourceLevel===3||sourceLevel===5)){
      return String(target.group||'')===String(polishThirdLeagueGroupForRegion(club.region)||'');
    }
    return true;
  }
  function polishCompetitionTarget(club,direction){
    if(!club||isForeignClub(club)||!Number.isFinite(club.pyramidLevel)) return null;
    const targetLevel=club.pyramidLevel+direction;
    let candidates=CLUBS.filter(c=>c.pyramidLevel===targetLevel);
    if(!candidates.length) return null;
    if(targetLevel>=5){
      const regional=candidates.filter(c=>c.region===club.region);
      if(!regional.length) return null;
      candidates=regional;
    } else if(targetLevel===4){
      const thirdLeagueGroup=polishThirdLeagueGroupForRegion(club.region);
      const mapped=candidates.filter(c=>c.group===thirdLeagueGroup);
      if(mapped.length) candidates=mapped;
    }
    const groups=new Map();
    candidates.forEach(candidate=>{
      const key=polishCompetitionKey(candidate);
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(candidate);
    });
    const sourceTokens=new Set(polishGroupTokens(`${club.group||''} ${club.city||''}`));
    const ranked=[...groups.values()].map(group=>{
      const sample=group[0];
      const targetTokens=polishGroupTokens(`${sample.group||''}`);
      const overlap=targetTokens.reduce((sum,token)=>sum+(sourceTokens.has(token)?1:0),0);
      const sourceText=String(club.group||'').toLowerCase();
      const targetText=String(sample.group||'').toLowerCase();
      const contains=sourceText&&targetText&&(sourceText.includes(targetText)||targetText.includes(sourceText))?2:0;
      const tie=polishStableHash(`${club.name}|${sample.competitionKey}`)%1000;
      return {group,score:overlap*10+contains,tie};
    }).sort((a,b)=>b.score-a.score||a.tie-b.tie);
    return ranked[0]?.group[0]||null;
  }
  function applyPolishCompetitionTransition(club,direction){
    const target=polishCompetitionTarget(club,direction);
    if(!target) return null;
    const from=polishCompetitionName(club);
    const peers=polishLeaguePeers(target).map(c=>c.strength).sort((a,b)=>a-b);
    const floor=peers[Math.min(peers.length-1,Math.floor(peers.length*.2))]||target.strength;
    Object.assign(club,{
      tier:target.tier,pyramidLevel:target.pyramidLevel,leagueName:target.leagueName,
      group:target.group,competitionKey:target.competitionKey
    });
    club.strength=direction<0
      ?Math.max(club.strength+rand(1,3),floor)
      :Math.max(1,club.strength-rand(1,3));
    const scale=polishLeagueScale(club);
    const prestige=scale?.prestige||target.leaguePrestige||'F-';
    Object.assign(club,{
      leaguePrestige:prestige,
      leagueTier:prestigeToLeagueTier(prestige),
      leagueFinance:scale?.finance??target.leagueFinance??1,
      globalTier:globalClubTier(club.strength)
    });
    return {from,to:polishCompetitionName(club),target};
  }
  function hydratePolishClubSnapshot(club){
    if(!club||Number.isFinite(club.foreignTier)||club.noClub) return club;
    if(Number.isFinite(club.pyramidLevel)&&club.leagueName){
      const databaseClub=CLUBS.find(candidate=>candidate.name===club.name&&candidate.region===club.region)
        ||CLUBS.find(candidate=>candidate.name===club.name);
      const scale=polishLeagueScale(club);
      const prestige=scale?.prestige||club.leaguePrestige||'F-';
      return {...club,
        worldId:club.worldId||databaseClub?.worldId,
        leaguePrestige:prestige,
        leagueTier:prestigeToLeagueTier(prestige),
        leagueFinance:scale?.finance??club.leagueFinance??1,
        globalTier:globalClubTier(club.strength)
      };
    }
    const databaseClub=CLUBS.find(c=>c.name===club.name);
    if(!databaseClub) return club;
    const desiredLevel=({6:1,5:2,4:3,3:4,2:5,1:databaseClub.pyramidLevel||6})[club.tier]||databaseClub.pyramidLevel;
    let profile=databaseClub;
    if(desiredLevel!==databaseClub.pyramidLevel){
      const candidates=CLUBS.filter(c=>c.pyramidLevel===desiredLevel&&c.region===club.region);
      if(candidates.length) profile=candidates[polishStableHash(club.name)%candidates.length];
    }
    const hydrated={...profile,...club,pyramidLevel:profile.pyramidLevel,leagueName:profile.leagueName,group:profile.group,competitionKey:profile.competitionKey};
    const scale=polishLeagueScale(hydrated);
    const prestige=scale?.prestige||profile.leaguePrestige||'F-';
    return {...hydrated,
      leaguePrestige:prestige,
      leagueTier:prestigeToLeagueTier(prestige),
      leagueFinance:scale?.finance??profile.leagueFinance??1,
      globalTier:globalClubTier(hydrated.strength)
    };
  }
  function hydrateClubSnapshot(club){
    if(!club||club.noClub) return club;
    if(!Number.isFinite(club.foreignTier)) return hydratePolishClubSnapshot(club);
    const databaseClub=GAME_DATA.foreignClubs.find(candidate=>candidate.name===club.name&&candidate.country===club.country)
      ||GAME_DATA.foreignClubs.find(candidate=>candidate.name===club.name);
    const hydrated=databaseClub?{...databaseClub,...club}:{...club};
    return {...hydrated,
      globalTier:globalClubTier(hydrated.strength),
      leaguePrestige:databaseClub?.leaguePrestige||hydrated.leaguePrestige||'F',
      leagueTier:databaseClub?.leagueTier||prestigeToLeagueTier(hydrated.leaguePrestige||'F'),
      leagueFinance:databaseClub?.leagueFinance??hydrated.leagueFinance??1
    };
  }
  function isForeignClub(c){ return !!(c && Number.isFinite(c.foreignTier)); }
  function clubTransferRegion(c){
    if(!isForeignClub(c)) return 'POLSKA';
    return c.marketRegion || c.zone || 'Inne';
  }
  function sameLocalTransferRegion(a,b){
    if(!isForeignClub(a) || !isForeignClub(b)) return false;
    if(a.zone==='Europa' || b.zone==='Europa') return a.zone==='Europa' && b.zone==='Europa' && clubTransferRegion(a)===clubTransferRegion(b);
    return a.zone===b.zone;
  }
  function deepLocalForeignAccessible(target,current){
    if(!isForeignClub(target)||!isForeignClub(current))return false;
    if(target.country===current.country)return true;
    const targetRegion=clubTransferRegion(target),currentRegion=clubTransferRegion(current);
    const broadRegions=new Set(['Azja','Afryka','Oceania','Ameryka Północna','Ameryka Południowa','Inne']);
    return !!targetRegion&&targetRegion===currentRegion&&!broadRegions.has(targetRegion);
  }
  function foreignTierName(ft){
    return ({1:'światowa czołówka',2:'bardzo mocny klub',3:'mocna zagranica',4:'poziom Ekstraklasy/I ligi',5:'słabsza zawodowa zagranica',6:'niski poziom krajowy • rynek lokalny',7:'bardzo słaba liga • rynek lokalny',8:'najniższy poziom • rynek lokalny'})[ft]||'zagranica';
  }
  function clubCompetition(c){
    if(!c) return '—';
    if(isForeignClub(c)) return `${c.league||'liga krajowa'} • ${c.country||'zagranica'} • prestiż ligi ${c.leaguePrestige||'F'} • T${c.globalTier||globalClubTier(c.strength)}`;
    return polishCompetitionName(c);
  }
  function liveMarketClub(c){
    if(!c||!state?.leagueWorld) return c;
    return worldClubFromId(worldClubId(c))||c;
  }
  function clubOfferCompetition(c){
    // Nagłówek oferty śledzi awanse i spadki zapisane w żywym świecie.
    const live=liveMarketClub(c);
    const base=clubCompetition(live);
    return !isForeignClub(live) && !live?.group && (live?.tier<=3 || (live?.pyramidLevel||0)>=4) && live.region
      ? `${base} • woj. ${live.region}`
      : base;
  }
  function clubOfferPalette(c){
    return window.PPS_COLOURS?.resolve?.(c)||{primary:'#f8f4ea',secondary:'#151515',source:'fallback'};
  }
  function applyClubOfferPalette(element,c,className='club-colour-card'){
    if(!element||!c) return;
    const palette=clubOfferPalette(c);
    element.classList.add(className);
    element.style.setProperty('--club-primary',palette.primary);
    element.style.setProperty('--club-secondary',palette.secondary);
    element.style.setProperty('--club-shadow',palette.shadow||palette.secondary);
    element.dataset.colourSource=palette.source;
  }
  function leaguePrestigeScore(c){
    const index=LEAGUE_PRESTIGE_ORDER.indexOf(c?.leaguePrestige||'F-');
    if(index<0) return 4;
    return clamp(100-index*6,4,100);
  }
  function clubPrestigeScore(c){
    // Jeden wspólny prestiż klubu: 55% poziomu rozgrywek i 45% OVR zespołu.
    // Dzięki temu dwa kluby z tej samej ligi nadal mogą proponować inne kwoty.
    const leagueScore=leaguePrestigeScore(c);
    const overall=clamp(Number(c?.strength)||1,1,100);
    return Math.round((leagueScore*.55+overall*.45)*10)/10;
  }
  function clubMarketLevel(c){
    const prestige=clubPrestigeScore(c);
    return .70+(8.45-.70)*Math.pow(prestige/100,.90);
  }
  function longContractActive(club=state?.club){
    return !!(
      state && club &&
      state.longContractClubName===club.name &&
      Number.isFinite(state.longContractUntilAge) &&
      state.age<state.longContractUntilAge
    );
  }
  function requiredForeignRecognition(ft){ return ({8:0,7:2,6:6,5:12,4:25,3:39,2:56,1:73})[ft]??30; }
  function requiredForeignOvr(ft){ return ({8:1,7:12,6:24,5:36,4:49,3:65,2:76,1:80})[ft]??50; }

  // v0.53 — jakość rynku transferowego.
  // Geografia wybiera klub DOPIERO w obrębie sensownego poziomu sportowego.
  // Nie może już zepchnąć gwiazdy T1/T2 do przypadkowych ofert T3/T4.
  function foreignTierReachable(ft,performance,fromPoland=false){
    const media=state.recognition||0;
    const ovr=state.overall||0;

    if(fromPoland){
      if(ft>=6)return false;
      // Medialność pomaga, ale nie może zakończyć sportowo gotowej kariery.
      const recSlack=7;
      const ovrSlack=4;
      const reqOvr=requiredForeignOvr(ft);
      const reqPerf=({5:23,4:27,3:34,2:42,1:50})[ft]||30;
      const sportingOverride=ovr>=reqOvr+3&&performance>=reqPerf;
      if(media < requiredForeignRecognition(ft)-recSlack&&!sportingOverride) return false;
      if(ovr < requiredForeignOvr(ft)-ovrSlack) return false;

      if(ft===1 && performance<34 && !state.seniorInternational && media<82) return false;
      if(ft===2 && performance<29 && !state.seniorInternational && media<62) return false;
      return true;
    }

    // Gdy już jesteś za granicą, rozwój kariery jest przede wszystkim SPORTOWY.
    // Medialność wpływa na zainteresowanie konkretnych klubów, ale nie blokuje
    // zwykłego przejścia T4->T3, T3->T2 itd.
    if(ovr < requiredForeignOvr(ft)-6) return false;

    // T1/T2 nadal potrzebują czegoś więcej niż samego "jestem za dobry na obecny klub",
    // ale wysokie OVR albo status reprezentanta mogą zastąpić słabszą medialność.
    if(ft===1 && performance<34 && !state.seniorInternational && ovr<88 && media<55) return false;
    if(ft===2 && performance<29 && !state.seniorInternational && ovr<80 && media<40) return false;

    return true;
  }

  function hasOutgrownForeignClub(current,performance,apps){
    if(!isForeignClub(current)) return false;
    const startChance=projectedStartChance(current,0);

    // 90%+ oznacza, że zawodnik sportowo wyraźnie przerósł otoczenie.
    if(startChance>=90) return true;

    // Alternatywnie: duża przewaga OVR albo pełny, dobry sezon.
    if(state.overall>=current.strength+8) return true;
    if(apps>=scaledLeagueCount(24,current,1) && performance>=43 && state.overall>=current.strength+3) return true;

    return false;
  }

  function severeClubMismatch(club){
    if(!club||club.noClub) return false;
    const apps=Math.max(0,state.season?.apps||0);
    const minutes=Math.max(0,state.season?.minutes||0);
    const last=(state.careerSeasons||[]).slice().reverse().find(season=>season.club===club.name)||null;
    const failedSeason=apps<scaledLeagueCount(8,club,1)||minutes<scaledLeagueCount(6,club,1)*90||(last&&Number.isFinite(last.gradeIndex)&&last.gradeIndex<=2);
    return failedSeason&&(Number(club.strength)||0)-(Number(state.overall)||0)>=20;
  }

  function foreignWorstOfferTier(current,performance,apps,lowStreak){
    if(!isForeignClub(current)) return 4;

    const media=state.recognition||0;
    const ovr=state.overall||0;
    const struggling=apps<scaledLeagueCount(8,current,1) || performance<30 || lowStreak>=2;

    // Normalnie rynek nie proponuje zejścia jakościowego.
    // Przy fatalnej sytuacji sportowej dopuszczamy najwyżej jeden tier w dół.
    let worst=struggling ? Math.min(8,current.foreignTier+1) : current.foreignTier;

    // Status zawodnika może jeszcze bardziej odciąć słabe oferty.
    if(ovr>=92 && media>=75) worst=Math.min(worst,2);
    else if(ovr>=86 && media>=58) worst=Math.min(worst,3);
    else if(ovr>=78 && media>=40) worst=Math.min(worst,4);

    return worst;
  }

  function firstForeignWindow(performance,current){
    const media=state.recognition||0;
    const apps=state.season?.apps||0;
    let chance=
      8 +
      (media-18)*1.05 +
      (performance-32)*.40 +
      Math.max(0,(state.overall||0)-58)*1.10;

    if(state.seniorInternational) chance+=25;
    if(state.age<=21) chance+=8;
    if(current?.tier===6) chance+=5;
    if(apps<scaledLeagueCount(8,current,1)) chance-=12;

    // Młody reprezentant Ekstraklasy nie powinien czekać latami,
    // aż zagranica w ogóle zauważy jego istnienie.
    if(state.seniorInternational && state.age<=21 && current?.tier>=6 && state.overall>=68)
      chance=Math.max(chance,85);

    if(state.overall>=72 && media>=50) chance=Math.max(chance,90);
    if(projectedStartChance(current,0)>=90&&performance>=34) chance=Math.max(chance,62);
    return clamp(Math.round(chance),4,95);
  }
  // Stałe kursy świata gry. Dzięki nim ten sam zapis nie zmienia wartości
  // kontraktu tylko dlatego, że gracz uruchomił plik innego dnia.
  const DISPLAY_CURRENCIES={
    PLN:{rate:1,label:'zł'},
    EUR:{rate:1/4.30,label:'€'},
    PLZ:{rate:10000,label:'starych zł'},
    KHR:{rate:1000,label:'KHR'}
  };
  const GAMBLING_GAMES=[
    'blackjack','domino','bierki','Travian','358','makao',
    'chińczyk na pieniądze','walki kogutów'
  ];
  function compactNumber(n){
    const abs=Math.abs(n);
    const units=abs>=1e12?[1e12,'bln']:abs>=1e9?[1e9,'mld']:abs>=1e6?[1e6,'mln']:abs>=1e3?[1e3,'tys.']:[1,''];
    const scaled=n/units[0];
    const digits=Math.abs(scaled)>=100?0:Math.abs(scaled)>=10?1:2;
    const number=scaled.toLocaleString('pl-PL',{maximumFractionDigits:digits});
    return `${number}${units[1]?` ${units[1]}`:''}`;
  }
  function formatMoney(pln,currency=state?.currencyDisplay||'PLN'){
    const cfg=DISPLAY_CURRENCIES[currency]||DISPLAY_CURRENCIES.PLN;
    const value=Number(pln)||0;
    return `${value<0?'−':''}${compactNumber(Math.abs(value)*cfg.rate)} ${cfg.label}`;
  }
  function careerFinancialsFor(player=state){
    const earned=Number(player?.careerEarningsPln)||0;
    const samples=Math.max(0,Number(player?.professionalismCareerSamples)||0);
    const average=samples
      ?clamp((Number(player?.professionalismCareerTotal)||0)/samples,0,100)
      :clamp(Number(player?.professionalism)||0,0,100);
    const lossRate=clamp((100-average)*.0035,0,.35);
    const positiveEarnings=Math.max(0,earned);
    const lost=Math.min(positiveEarnings,Math.round(positiveEarnings*lossRate/1000)*1000);
    return {earned,lost,net:earned-lost,average,lossRate,game:player?.gamblingGame||'blackjacka'};
  }
  function careerFinancials(){ return careerFinancialsFor(state); }
  function careerFinanceHtml(){
    const f=careerFinancials();
    return `<section class="career-finances"><h3>FINANSE KARIERY</h3><p>Bilans kontraktów: <strong>${formatMoney(f.earned)}</strong>. Średni profesjonalizm z całej kariery: <strong>${f.average.toFixed(1).replace('.',',')}/100</strong>. Pozycja strat „<strong>${f.game}</strong>”: <strong>${formatMoney(f.lost)}</strong>. Zostało ci <strong>${formatMoney(f.net)}</strong>.</p></section>`;
  }
  function show(view){ [els.newGameView,els.clubStartView,els.createClubView,els.coopSetupView,els.setupView,els.offersView,els.careerView,els.retirementView].filter(Boolean).forEach(v=>v.classList.add('hidden')); view?.classList.remove('hidden'); }
  function allPolishClubs(){ return Object.values(GAME_DATA.regions).flat(); }
  function seniorClubs(){ return allPolishClubs().filter(c=>!c.reserve); }
  function findAnyClubByName(name){ return [...seniorClubs(),...GAME_DATA.foreignClubs].find(c=>c.name===name)||null; }
  function isEasy(){ return !!state && state.difficulty==='easy'; }

  const customBClassGroups=new Map();
  CLUBS.filter(club=>!club.reserve&&/(^|\s)(klasa b|b klasa)(\s|$)/i.test(String(club.leagueName||''))).forEach(club=>{
    const key=polishCompetitionKey(club);
    if(!customBClassGroups.has(key))customBClassGroups.set(key,[]);
    customBClassGroups.get(key).push(club);
  });
  function customClubError(message=''){
    if(!els.customClubError)return;
    els.customClubError.textContent=message;
    els.customClubError.classList.toggle('hidden',!message);
  }
  function updateCustomClubPreview(){
    els.customClubPreview?.style.setProperty('--preview-primary',els.customClubPrimary?.value||'#1765ad');
    els.customClubPreview?.style.setProperty('--preview-secondary',els.customClubSecondary?.value||'#ffffff');
    els.customClubPreview?.style.setProperty('--preview-shadow',els.customClubShadow?.value||'#111111');
  }
  const CUSTOM_CLUB_NAME_EXAMPLES=[
    'Cośtamspor','Dobrowianka','Szachtior Koniec Świata','KS Kaesowice',
    '1. FC Żelazowa Wola','W Pile to już jest klub czy go nie ma? Co, jest? OK'
  ];
  function randomizeCustomClubPlaceholder(){
    if(els.customClubName&&!els.customClubName.value)
      els.customClubName.placeholder=pick(CUSTOM_CLUB_NAME_EXAMPLES);
  }
  function updateCustomClubReplacements(){
    if(!els.customClubReplacement)return;
    const clubs=customBClassGroups.get(els.customClubCompetition?.value)||[];
    els.customClubReplacement.innerHTML='';
    clubs.slice().sort((a,b)=>a.name.localeCompare(b.name,'pl')).forEach(club=>{
      const option=document.createElement('option');
      option.value=club.worldId;
      option.textContent=`${club.name}${club.city?` (${club.city})`:''}`;
      els.customClubReplacement.appendChild(option);
    });
    els.confirmCustomClubBtn.disabled=!clubs.length;
  }
  function populateCustomClubCompetitions(){
    if(!els.customClubCompetition)return;
    els.customClubCompetition.innerHTML='';
    [...customBClassGroups.entries()].sort((a,b)=>{
      const first=a[1][0],second=b[1][0];
      return first.region.localeCompare(second.region,'pl')||polishCompetitionName(first).localeCompare(polishCompetitionName(second),'pl');
    }).forEach(([key,clubs])=>{
      const sample=clubs[0],option=document.createElement('option');
      option.value=key;
      option.textContent=`${sample.region} — ${polishCompetitionName(sample)}`;
      els.customClubCompetition.appendChild(option);
    });
    updateCustomClubReplacements();
    updateCustomClubPreview();
  }
  function buildCustomClubDraft(){
    const name=String(els.customClubName?.value||'').trim().replace(/\s+/g,' ');
    if(name.length<2){customClubError('Wpisz nazwę zespołu — przynajmniej 2 znaki.');return null;}
    const duplicate=seniorClubs().some(club=>normalizePlayerName(club.name)===normalizePlayerName(name));
    if(duplicate){customClubError('Taki klub już znajduje się w bazie. Wybierz inną nazwę.');return null;}
    const replacement=CLUBS.find(club=>club.worldId===els.customClubReplacement?.value);
    if(!replacement){customClubError('Wybierz klub B-klasy, którego miejsce przejmujesz.');return null;}
    customClubError('');
    return {
      ...replacement,
      name,
      worldId:replacement.worldId,
      customClub:true,
      replacedClubName:replacement.name,
      customColours:{primary:els.customClubPrimary?.value||'#1765ad',secondary:els.customClubSecondary?.value||'#ffffff',shadow:els.customClubShadow?.value||'#111111'}
    };
  }
  function preparedCareer(){
    if(state)return true;
    show(els.setupView);
    return false;
  }
  function commitFavoriteClub(){
    if(state)state.favoriteClubName=els.favoriteClub?.value||null;
  }
  els.normalModeBtn?.addEventListener('click',()=>{
    if(!preparedCareer())return;
    selectedStartingClubName=null;selectedCustomClubDraft=null;
    state.careerStartMode='normal';
    commitFavoriteClub();
    generateOffers();
  });
  els.chooseClubModeBtn?.addEventListener('click',()=>{if(preparedCareer())show(els.clubStartView);});
  els.coopModeBtn?.addEventListener('click',()=>{if(!preparedCareer())return;renderCoopSetup();show(els.coopSetupView);});
  els.backFromCoopBtn?.addEventListener('click',()=>show(els.newGameView));
  els.startCoopBtn?.addEventListener('click',startCoopCareer);
  els.backToNewGameBtn?.addEventListener('click',()=>show(els.newGameView));
  els.confirmStartClubBtn?.addEventListener('click',()=>{
    if(!preparedCareer())return;
    selectedStartingClubName=els.startClub?.value||null;
    const club=findAnyClubByName(selectedStartingClubName);
    if(!club)return;
    selectedCustomClubDraft=null;
    state.careerStartMode='chosenClub';
    commitFavoriteClub();
    startAtClub(club);
  });
  els.createClubModeBtn?.addEventListener('click',()=>{if(!preparedCareer())return;customClubError('');randomizeCustomClubPlaceholder();updateCustomClubPreview();show(els.createClubView);});
  els.backFromCustomClubBtn?.addEventListener('click',()=>show(els.newGameView));
  els.customClubCompetition?.addEventListener('change',updateCustomClubReplacements);
  els.customClubPrimary?.addEventListener('input',updateCustomClubPreview);
  els.customClubSecondary?.addEventListener('input',updateCustomClubPreview);
  els.customClubShadow?.addEventListener('input',updateCustomClubPreview);
  els.confirmCustomClubBtn?.addEventListener('click',()=>{
    const draft=buildCustomClubDraft();
    if(!draft)return;
    selectedCustomClubDraft=draft;
    selectedStartingClubName=null;
    state.careerStartMode='createdClub';
    state.customClubProfile={name:draft.name,worldId:draft.worldId,replacedClubName:draft.replacedClubName,customColours:{...draft.customColours}};
    commitFavoriteClub();
    startAtClub(draft);
  });
  populateCustomClubCompetitions();

  // Wynik kariery porównuje osiągnięcia, ale uwzględnia też trudność drogi.
  // Słabszy start dostaje premię, a łatwa progresja i wysoki start — redukcję.
  // Surowe punkty pozostają w stanie gry, dzięki czemu wszystkie istniejące
  // nagrody i zdarzenia nadal korzystają z tych samych wartości bazowych.
  function careerScoreScaleFor(player=state){
    const startMultiplier={lastPe:1.70,bclassVeteran:1.50,backyard:1.30,normal:1.15,syrenka:1,wonderkid:.85,sysio:.75}[player?.startPoint]||1;
    const difficultyMultiplier=player?.difficulty==='easy'?.80:1;
    return {startMultiplier,difficultyMultiplier,multiplier:startMultiplier*difficultyMultiplier};
  }
  function careerScoreScale(){ return careerScoreScaleFor(state); }
  function scaledCareerScoreFor(player,raw=player?.score||0){
    return Math.max(0,Math.round((Number(raw)||0)*careerScoreScaleFor(player).multiplier));
  }
  function scaledCareerScore(raw=state?.score||0){
    return scaledCareerScoreFor(state,raw);
  }
  function careerScoreScaleText(){
    const scale=careerScoreScale();
    const startLabel={lastPe:'Ostatni na w-fie',bclassVeteran:'B-klasowy wyjadacz',backyard:'Podwórko',normal:'Normalny chłop',syrenka:'Puchar Syrenki',wonderkid:'Wonderkid',sysio:'Filip Sysio'}[state?.startPoint]||'start standardowy';
    const difficultyLabel=state?.difficulty==='easy'?'łatwy':'normalny';
    return `${startLabel} × ${scale.startMultiplier.toFixed(2).replace('.',',')} • poziom ${difficultyLabel} × ${scale.difficultyMultiplier.toFixed(2).replace('.',',')} • łącznie × ${scale.multiplier.toFixed(2).replace('.',',')}`;
  }

  function clearCareerUiForNewGame(){
    if(els.eventBox){
      els.eventBox.dataset.panelRole='event';
      els.eventBox.innerHTML='<div class="event-kicker">PRZED SEZONEM</div><h3>Wszystko przed tobą.</h3><p>Wejdź do pierwszej drużyny i zacznij budować nazwisko.</p>';
    }
    if(els.timeline) els.timeline.innerHTML='';
    if(els.decisionChoices) els.decisionChoices.innerHTML='';
    els.decisionBox?.classList.add('hidden');
    if(els.seasonDashboard){ els.seasonDashboard.innerHTML=''; els.seasonDashboard.classList.add('hidden'); }
    document.querySelector('[data-nss="match-log"]')?.replaceChildren();
    document.querySelector('[data-nss="match-actions"]')?.replaceChildren();
    document.querySelector('[data-nss="content"]')?.replaceChildren();
    document.querySelector('#nssTournamentRoot')?.classList.add('nss-hidden');
    if(els.coopFinalResults){els.coopFinalResults.innerHTML='';els.coopFinalResults.classList.add('hidden');}
  }

  els.setupForm.addEventListener('submit', e => {
    e.preventDefault();
    coopSession=null;
    clearCareerUiForNewGame();
    const position = $('#position').value;
    const difficulty = $('#difficulty').value;
    const requestedStartPoint=$('#startPoint').value;
    const sysioUnlocked=setupSpecialStart==='sysio'&&isSysioStartEligible();
    const startPoint=requestedStartPoint==='sysio'&&!sysioUnlocked?'wonderkid':requestedStartPoint;
    const namedProfile=(Array.isArray(window.POLISH_PLAYER_PROFILES)?window.POLISH_PLAYER_PROFILES:[])
      .find(p=>normalizePlayerName(p.name)===normalizePlayerName($('#playerName').value));
    const base = namedProfile?.startPoint===startPoint&&Number.isFinite(namedProfile.overall) ? namedProfile.overall
      : startPoint==='lastPe' ? 1
      : startPoint==='bclassVeteran' ? rand(10,20)
      : startPoint==='backyard' ? rand(29,34)
      : startPoint==='syrenka' ? rand(50,55)
      : startPoint==='wonderkid' ? rand(60,66)
      : startPoint==='sysio' ? rand(69,75)
      : rand(39,45);
    state = {
      name: $('#playerName').value.trim() || randomSetupPlayerName(), position, foot: $('#foot').value, region: els.region.value, difficulty, startPoint, favoriteClubName:null, careerStartMode:'pending',
      age:16, seasonYear:2026, overall:base,
      // Awaryjny, ukryty limit długowiecznej kariery. Wylosowany wiek
      // jest ostatnim sezonem gracza; po nim nie pojawi się już rynek.
      hardRetirementAge:rand(52,61),
      talent:rand(35,95),
      professionalism:rand(35,95),
      injuryRisk:rand(8,30),
      club:null, clubHistory:[], shirtNumber: position==='GK'?1:position==='DEF'?rand(2,6):position==='MID'?rand(6,18):rand(9,19), status:'Junior', national:'—', representedCountry:'Polska', seniorNationalCountry:null, naturalizationOfferUsed:false, naturalized:false, nationalCaps:0, nationalGoals:0, nationalGoalsConceded:0, nationalCleanSheets:0, seasonNationalGoalsConceded:0, seasonNationalCleanSheets:0, seniorInternational:false,
      season:{apps:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,minutes:0}, totals:{apps:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,minutes:0}, trophies:[], trophyHistory:[], awards:[], awardHistory:[], promotions:0, timeline:[], score:0,
      retired:false, pendingDecision:false, pendingTournament:null, pendingWorldPlayoff:null, nationalSuspensionMatches:0, boost:0, loyalty:0, loanReturn:null, justRelegated:false, justPromoted:false,
      justNationalCall:false, lastInjuryLost:0, lastInjurySeverity:null, lastInjuryOvrPenalty:0, foreignMoveAge:null, seasonNationalCaps:0, seasonNationalGoals:0,
      adaptability:rand(35,90), recognition:rand(12,32), marketBonus:0, eventMemory:{}, decisionEvery:1,
      offerHistory:{}, offerCounts:{}, lowAppsStreak:0, careerSeasons:[], nationalTournamentHistory:{}, worldCupHistory:{}, worldCups:0, euroHistory:{}, euros:0, continentalCups:0,
      seasonClubName:null,seasonClubCompetition:null,seasonFinished:false,seasonMatchExtras:[],
      corruptionPlan:null, forceCorruptPromotion:false, corruptionShadow:0, nextAppsFactor:1, nextAppsReason:null, nextAppsClubName:null, nextMinutesFactor:1,
      forcedSeasonFormRoll:null, forcedSeasonFormReason:null, forcedSeasonFormClubName:null,
      marketLockSeasons:0, blockMarketOnce:false, guaranteedForeignOffers:0, extraMarketOffer:false,
      currencyDisplay:preferredCurrency(), seasonPanelMode:preferredPanelMode(), visualTheme:preferredVisualTheme(), leagueTableStyle:preferredLeagueTableStyle(), contractAnnualPln:null, longContractClubName:null, longContractUntilAge:null, financeScaleVersion:160,
      careerEarningsPln:0, professionalismCareerTotal:0, professionalismCareerSamples:0, gamblingGame:pick(GAMBLING_GAMES),
      agentMarketJump:0, skipMarketOnce:false, forceNoRenewClubName:null, noRenewClubName:null, noRenewAfterAge:null,
      pendingEventTransferOffer:null, lastSeasonDashboard:null, focusSeasonButtonOnce:false,
      captainEventBonusClub:null, activePlayerEventMultiplier:1, clubLegendMilestones:{},
      finishingBias:rand(86,114)/100, creativeBias:rand(86,114)/100,
      peakOverall:base, highestTier:0, bestForeignTier:null, ekstraklasaSeasons:0, foreignSeasons:0, clubsPlayed:0,
      legend99Streak:0, legendUnlocked:false, legendEraActive:false, legendStartBonus:0,
      legendPeakOverall:base, legendSeasons100:0, legendRankingPending:false, legendRankingShown:false,
      legendReferenceNames:null, legendReferenceScores:{}, grajewskiOverallCap:0, ballondorHistory:[], gornikKogutyTotal:0,
      customClubProfile:null,
      leagueWorld:freshLeagueWorld()
    };
    selectedStartingClubName=null;
    selectedCustomClubDraft=null;
    show(els.newGameView);
  });

  function coopStartOverall(startPoint){
    return startPoint==='lastPe'?1
      :startPoint==='bclassVeteran'?rand(10,20)
      :startPoint==='backyard'?rand(29,34)
      :startPoint==='syrenka'?rand(50,55)
      :startPoint==='wonderkid'?rand(60,66)
      :rand(39,45);
  }
  function coopShirtNumber(position){
    return position==='GK'?1:position==='DEF'?rand(2,6):position==='MID'?rand(6,18):rand(9,19);
  }
  function createCoopPlayerState(base,config,index,sharedWorld){
    const player=JSON.parse(JSON.stringify(base));
    const overall=coopStartOverall(config.startPoint);
    Object.assign(player,{
      name:config.name,position:config.position,foot:config.foot,region:config.region,startPoint:config.startPoint,
      favoriteClubName:index===0?(els.favoriteClub?.value||null):null,careerStartMode:'coop',
      overall,peakOverall:overall,legendPeakOverall:overall,shirtNumber:coopShirtNumber(config.position),
      hardRetirementAge:rand(52,61),talent:rand(35,95),professionalism:rand(35,95),injuryRisk:rand(8,30),
      adaptability:rand(35,90),recognition:rand(12,32),finishingBias:rand(86,114)/100,creativeBias:rand(86,114)/100,
      gamblingGame:pick(GAMBLING_GAMES),coopPlayerId:`COOP-${index+1}`,club:null,clubHistory:[],clubsPlayed:0,
      contractAnnualPln:null,seasonClubName:null,seasonClubCompetition:null,seasonFinished:false,
      leagueWorld:sharedWorld
    });
    return player;
  }
  function attachCoopPlayerToClub(player,club){
    player.club={...club};
    player.clubHistory=[club.name];
    player.clubsPlayed=1;
    player.status=(!isForeignClub(club)&&club.tier>=5)||club.foreignTier<=3?'Junior / akademia':'Junior / rezerwy';
    player.highestTier=isForeignClub(club)?0:club.tier;
    player.seasonClubName=club.name;
    player.seasonClubCompetition=clubCompetition(club);
    player.seasonFinished=false;
    if(isForeignClub(club)){
      player.foreignMoveAge=player.age;
      player.bestForeignTier=club.foreignTier;
    }
    state=player;
    player.contractAnnualPln=calcAnnualSalaryForClub(club);
    activateLeagueWorldForClub(player.club);
    log(`CO-OP: podpisujesz pierwszy kontrakt — ${club.name}.`,`${clubCompetition(club)} • gracz ${player.coopPlayerId.replace('COOP-','')} z ${coopSession?.players?.length||'?'} • 16 lat`);
  }
  function coopIsActive(){return !!(coopSession?.enabled&&Array.isArray(coopSession.players)&&coopSession.players.length>=2);}
  function coopCompletedSet(){return new Set(coopSession?.completedPlayerIds||[]);}
  function coopRefreshAssignments(){
    if(!coopIsActive())return;
    const sharedWorld=coopSession.sharedWorld||state?.leagueWorld||freshLeagueWorld();
    coopSession.sharedWorld=sharedWorld;
    coopSession.players.forEach(player=>{
      player.leagueWorld=sharedWorld;
      if(player.club&&!player.club.noClub)sharedWorld.clubOverrides[worldClubId(player.club)]={
        ...(sharedWorld.clubOverrides[worldClubId(player.club)]||{}),...worldOverrideSnapshot(player.club)
      };
    });
    coopSession.assignments=coopSession.players.filter(player=>!player.retired&&player.club).map(player=>({
      playerId:player.coopPlayerId,clubId:worldClubId(player.club),position:player.position,overall:player.overall,
      professionalism:player.professionalism,boost:player.boost||0,loyalty:player.loyalty||0,name:player.name
    }));
  }
  function coopAssignmentsAtClub(club){
    if(!coopIsActive()||!club)return [];
    const id=worldClubId(club);
    return (coopSession.assignments||[]).filter(assignment=>assignment.clubId===id);
  }
  function renderCoopBar(){
    const active=coopIsActive();
    els.coopBar?.classList.toggle('hidden',!active);
    if(!active)return;
    const completed=coopCompletedSet();
    const player=coopSession.players[coopSession.activeIndex];
    if(els.coopTurnLabel)els.coopTurnLabel.textContent=`TURA ${coopSession.activeIndex+1}/${coopSession.players.length} — ${player.name}`;
    if(els.coopSeasonLabel)els.coopSeasonLabel.textContent=`Wspólny sezon ${player.seasonYear}/${String(player.seasonYear+1).slice(2)} • ${player.club?.name||'bez klubu'}`;
    if(els.coopPlayerPips)els.coopPlayerPips.innerHTML=coopSession.players.map((candidate,index)=>
      `<span class="coop-player-pip${index===coopSession.activeIndex?' active':''}${completed.has(candidate.coopPlayerId)?' done':''}" title="${escapeDecisionHtml(candidate.name)} — ${escapeDecisionHtml(candidate.club?.name||'bez klubu')}">G${index+1}</span>`
    ).join('');
  }
  function coopTurnIntro(message=''){
    if(!coopIsActive())return;
    els.decisionBox?.classList.add('hidden');
    els.playSeasonBtn?.classList.toggle('hidden',!!state.retired);
    els.eventBox.dataset.panelRole='event';
    els.eventBox.innerHTML=`<div class="event-kicker">CO-OP • TURA ${coopSession.activeIndex+1}/${coopSession.players.length}</div><h3>${escapeDecisionHtml(state.name)}</h3><p>${message||`Teraz grasz sezon zawodnika ${state.name}. Klub: ${state.club.name}. Po rynku transferowym kolej przejdzie na następną osobę.`}</p>`;
  }
  function startCoopCareer(){
    if(!state||state.club)return;
    const configs=readCoopSetupPlayers();
    if(!configs)return;
    const base=JSON.parse(JSON.stringify(state));
    const sharedWorld=freshLeagueWorld();
    const players=configs.map((config,index)=>createCoopPlayerState(base,config,index,sharedWorld));
    coopSession={
      enabled:true,version:1,players,activeIndex:0,completedPlayerIds:[],roundYear:2026,
      sharedWorld,assignments:[],scopeCache:{year:2026,poland:null,foreign:{}},clubCupResults:{}
    };
    players.forEach((player,index)=>{
      const club=worldFindBaseClub(configs[index].clubId);
      attachCoopPlayerToClub(player,club);
    });
    coopSession.players=players;
    coopSession.activeIndex=0;
    state=players[0];
    coopRefreshAssignments();
    clearCareerUiForNewGame();
    show(els.careerView);
    els.newCareerBtn.classList.remove('hidden');
    els.saveGameBtn?.classList.remove('hidden');
    coopTurnIntro('Zaczynacie wspólny sezon. Każdy rozgrywa swoją turę, ale tabele i wyniki klubów są wspólne.');
    render();
  }

  function generateOffers(){
    applyPanelModeAppearance();
    show(els.offersView); els.newCareerBtn.classList.remove('hidden');
    const startLabels={
      lastPe:'OSTATNI NA W-FIE • 1 OVR',
      bclassVeteran:'B-KLASOWY WYJADACZ • 10–20 OVR',
      backyard:'PODWÓRKO • 29–34 OVR',
      normal:'NORMALNY CHŁOP',
      syrenka:'PUCHAR SYRENKI • 50–55 OVR',
      wonderkid:'WONDERKID • 60–66 OVR',
      sysio:'FILIP SYSIO • 69–75 OVR'
    };
    els.offerRegion.textContent='';

    const local=GAME_DATA.regions[state.region].filter(c=>!c.reserve);
    const national=seniorClubs();
    // Cztery oferty startowe. Profile ponad PODWÓRKIEM dostają trzy polskie
    // propozycje i jedną proporcjonalną zagraniczną. WONDERKID i FILIP SYSIO
    // zachowują wśród polskich propozycji dokładnie jedną ligę regionalną.
    const targets={
      lastPe:[1,1,1,1],
      bclassVeteran:[1,1,1,1],
      backyard:[1,1,2,3],
      normal:[2,3,4],
      syrenka:[3,4,5],
      wonderkid:[1,5,6],
      sysio:[1,6,6]
    }[state.startPoint] || [2,3,4];

    const offers=[];
    const add=c=>{
      if(c && !offers.some(x=>x.name===c.name)) offers.push(c);
    };

    const candidatesForTier=tier=>{
      const exactLocal=shuffle(local.filter(c=>c.tier===tier));
      const exactNational=shuffle(national.filter(c=>c.tier===tier));
      const nearLocal=shuffle(local.filter(c=>Math.abs(c.tier-tier)===1));
      const nearNational=shuffle(national.filter(c=>Math.abs(c.tier-tier)===1));
      return [...exactLocal,...exactNational,...nearLocal,...nearNational];
    };

    targets.forEach(t=>{
      const candidates=candidatesForTier(t);
      add(candidates.find(c=>!offers.some(o=>o.name===c.name)));
    });

    const startForeignTier={normal:5,syrenka:5,wonderkid:4,sysio:3}[state.startPoint]||null;
    if(startForeignTier){
      let foreignStart=GAME_DATA.foreignClubs.filter(c=>
        c.foreignTier===startForeignTier &&
        c.strength>=state.overall-8 &&
        c.strength<=state.overall+11
      );
      // Przy T4/T5 najpierw pokazujemy logiczny pierwszy krok europejski.
      // T6-T8 są z definicji ścieżkami dostępnymi dopiero lokalnie.
      const european=foreignStart.filter(c=>c.zone==='Europa');
      if(startForeignTier<=5 && european.length) foreignStart=european;
      foreignStart=foreignStart.slice().sort((a,b)=>
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
      );
      const closest=foreignStart.slice(0,Math.min(24,foreignStart.length));
      if(closest.length) add(pick(closest));
    }

    // Kibicowanie nie teleportuje juniora do Realu, ale jeśli wybrany klub
    // jest sportowo sensowną opcją startową, ma 65% szans zastąpić ofertę
    // tego samego rodzaju (polską lub zagraniczną).
    const favorite=findAnyClubByName(state.favoriteClubName);
    if(favorite&&!offers.some(c=>c.name===favorite.name)&&favorite.strength<=state.overall+11&&Math.random()<.65){
      const targetCenter=targets.reduce((a,b)=>a+b,0)/targets.length;
      const suitable=isForeignClub(favorite)
        ? Math.abs((favorite.foreignTier||8)-(startForeignTier||9))<=1
        : Math.abs((favorite.tier||1)-targetCenter)<=2.2;
      if(suitable){
        let replaceIndex=-1;
        if(isForeignClub(favorite)) replaceIndex=offers.findIndex(isForeignClub);
        else if(['wonderkid','sysio'].includes(state.startPoint)&&favorite.tier===1) replaceIndex=offers.findIndex(c=>!isForeignClub(c)&&c.tier===1);
        else{
          for(let i=offers.length-1;i>=0;i--){
            if(!isForeignClub(offers[i])&&!(['wonderkid','sysio'].includes(state.startPoint)&&offers[i].tier===1)){replaceIndex=i;break;}
          }
        }
        if(replaceIndex>=0) offers[replaceIndex]=favorite;
      }
    }

    // Awaryjnie dopełniamy ofertami najbardziej zbliżonymi do oczekiwanego szczebla.
    if(offers.length<4){
      const center=targets.reduce((a,b)=>a+b,0)/targets.length;
      shuffle(national)
        .sort((a,b)=>Math.abs(a.tier-center)-Math.abs(b.tier-center))
        .forEach(add);
    }
    offers.length=4;

    // EASTER EGG: ręcznie wpisany Jakub Olkiewicz zawsze dostaje ofertę
    // od Teofilka. Zachowujemy przy tym obowiązkową ofertę zagraniczną;
    // u WONDERKIDA Teofilek zastępuje regionalny slot.
    if(isJakubOlkiewicz(state.name)){
      const teofilek=allPolishClubs().find(c=>c.name==='Teofilek Łódź');
      if(teofilek && !offers.some(c=>c.name===teofilek.name)){
        let replaceIndex=['wonderkid','sysio'].includes(state.startPoint)
          ?offers.findIndex(c=>!isForeignClub(c)&&c.tier===1)
          :-1;
        for(let i=offers.length-1;replaceIndex<0&&i>=0;i--){
          if(!isForeignClub(offers[i])){ replaceIndex=i; break; }
        }
        if(replaceIndex<0) replaceIndex=Math.max(0,offers.length-1);
        offers[replaceIndex]=teofilek;
      }
    }

    els.offersGrid.innerHTML='';
    shuffle(offers).forEach(c=>{
      const d=document.createElement('article'); d.className='offer-card';
      applyClubOfferPalette(d,c);
      d.innerHTML=`<div class="eyebrow">${c.name===state.favoriteClubName?'KLUB, KTÓREMU KIBICUJESZ':'OFERTA'}</div><h3>${c.name}</h3><p><strong>${clubOfferCompetition(c)}</strong><br>${offerPitch(c)}<br><small>Szacowany kontrakt: <strong>${formatMoney(calcAnnualSalaryForClub(c)/12)} miesięcznie</strong></small></p><button class="primary">WYBIERAM</button>`;
      d.querySelector('button').onclick=()=>startAtClub(c);
      els.offersGrid.appendChild(d);
    });
  }

  function offerPitch(c){
    if(isForeignClub(c)){
      if(c.foreignTier===1) return 'Światowy top już na starcie. Ogromny prestiż, ale minuty trzeba będzie wyrwać.';
      if(c.foreignTier===2) return 'Bardzo mocny klub zagraniczny. Wielka szansa i bardzo trudna walka o skład.';
      if(c.foreignTier===3) return 'Mocna zagranica. Poziom czołówki Ekstraklasy lub wyżej, bez gwarancji minut.';
      if(c.foreignTier===4) return 'Pierwszy zagraniczny krok. Dobry poziom do rozwoju i wejścia na europejski rynek.';
      if(c.foreignTier===5) return 'Słabsza zawodowa zagranica. Dużo zależy od regularnej gry.';
      if(c.foreignTier>=6) return 'Rynek lokalny. Ten kierunek otwiera się dopiero po wejściu do kraju lub właściwego regionu.';
      return 'Egzotyczny rynek. Szansa na grę i zupełnie inną ścieżkę kariery.';
    }
    if(c.tier===1) return 'Najbliżej domu. Seniorskie granie od razu i dużo minut, ale długa droga na szczyt.';
    if(c.tier===2) return 'Prawdziwa seniorska piłka i dobra szansa na szybkie wejście do składu.';
    if(c.tier===3) return 'III liga. Już można się pokazać klubom centralnym, ale trzeba zasłużyć na minuty.';
    if(c.tier===4) return 'II liga. Poziom centralny już na starcie, ale o miejsce w składzie trzeba walczyć.';
    return 'Mocny klub na start. Minuty nie przyjdą za darmo.';
  }
  function startAtClub(c){
    state.club={...c}; state.clubHistory.push(c.name); state.clubsPlayed=1; state.status=(!isForeignClub(c)&&c.tier>=5)||c.foreignTier<=3?'Junior / akademia':'Junior / rezerwy'; state.highestTier=isForeignClub(c)?0:c.tier;
    state.contractAnnualPln=calcAnnualSalaryForClub(c);
    if(isForeignClub(c)){
      state.foreignMoveAge=state.age;
      state.bestForeignTier=c.foreignTier;
    }
    activateLeagueWorldForClub(state.club);
    state.seasonClubName=c.name; state.seasonClubCompetition=clubCompetition(c); state.seasonFinished=false;
    log(`Podpisujesz pierwszy kontrakt: ${c.name}.`, `${clubCompetition(c)} • 16 lat`);
    show(els.careerView); render();
  }

  function render(){
    if(!state) return;
    applyVisualTheme();
    applyLeagueTableStyle();
    renderCoopBar();
    const coopMidRound=coopIsActive()&&(coopSession.completedPlayerIds||[]).length>0;
    els.saveGameBtn?.classList.toggle('hidden',!state.club||state.retired||coopMidRound);
    const startLabel={lastPe:'OSTATNI NA W-FIE',bclassVeteran:'B-KLASOWY WYJADACZ',backyard:'PODWÓRKO',normal:'NORMALNY CHŁOP',syrenka:'PUCHAR SYRENKI',wonderkid:'WONDERKID',sysio:'FILIP SYSIO'}[state.startPoint]||'START';
    const positionLabel={FWD:'N',MID:'P',DEF:'O',GK:'B'}[state.position]||state.position;
    els.playerNameLabel.textContent=state.name; els.playerRegionLabel.textContent=state.region; els.playerMeta.textContent=`${positionLabel} • ${startLabel} • ${isEasy()?'ŁATWY':'NORMALNY'}${state.legendUnlocked?' • LEGENDA FUTBOLU':''}`;
    els.shirtNumber.textContent = state.shirtNumber;
    els.overallValue.textContent=state.overall; els.ageValue.textContent=state.age; els.clubValue.textContent=state.club.name; els.clubTierValue.textContent=clubCompetition(state.club);
    els.statusValue.textContent=state.status;
    const currentPlayChance=state.club?.noClub?'—':`${projectedStartChance(state.club,state.boost||0)}%${state.boost?` (${state.boost>0?'+':''}${state.boost})`:''}`;
    if(els.statusContextValue) els.statusContextValue.textContent=state.club?.noClub?'Bez klubu':`Szansa na grę: ${currentPlayChance}`;
    if(state.seniorInternational){
      const teamName=representedCountryName();
      const ntStatus=state.national===teamName?teamName:`Poza kadrą: ${teamName}`;
      els.nationalValue.textContent=ntStatus;
      if(els.nationalContextValue) els.nationalContextValue.textContent=state.position==='GK'
        ?`${state.nationalCaps} M / ${state.nationalGoalsConceded||0} SG / ${state.nationalCleanSheets||0} CK`
        :`${state.nationalCaps} M / ${state.nationalGoals} G`;
    } else {
      els.nationalValue.textContent=state.national;
      if(els.nationalContextValue) els.nationalContextValue.textContent=state.national==='—'?'Bez debiutu w kadrze':'';
    }
    if(state.club){
      if(els.playChanceValue) els.playChanceValue.textContent=currentPlayChance;
      els.professionalismValue.textContent=`${Math.round(state.professionalism)}/100`;
      els.loyaltyValue.textContent=`${Math.round(clamp(state.loyalty,0,15))}/15`;
      els.recognitionValue.textContent=`${Math.round(state.recognition||0)}/100`;
      els.injuryRiskValue.textContent=`${Math.round(state.injuryRisk)}%`;
    }
    const seasonOwner=state.seasonClubName||state.club?.name||'—';
    els.seasonLabel.textContent=`SEZON ${state.seasonYear}/${String(state.seasonYear+1).slice(2)} • ${seasonOwner}`;
    els.seasonHeadline.textContent=seasonHeadline();
    renderMoneyPanel();
    const goalkeeper=state.position==='GK';
    if(els.goalsStatLabel) els.goalsStatLabel.textContent=goalkeeper?'Stracone gole':'Gole';
    if(els.assistsStatLabel) els.assistsStatLabel.textContent=goalkeeper?'Czyste konta':'Asysty';
    els.appsStat.textContent=state.season.apps;
    els.goalsStat.textContent=goalkeeper?(state.season.goalsConceded||0):state.season.goals;
    els.assistsStat.textContent=goalkeeper?(state.season.cleanSheets||0):state.season.assists;
    els.minutesStat.textContent=state.season.minutes;
    els.careerScore.textContent=`${scaledCareerScore()} pkt`;
    els.careerScore.title=`Punktacja skalowana: ${careerScoreScaleText()}`;
    els.timeline.innerHTML=state.timeline.slice().reverse().map(x=>`<div class="timeline-item"><div class="timeline-age">${x.age} LAT</div><div class="timeline-text"><strong>${x.title}</strong><span>${x.meta}</span></div></div>`).join('');
    renderSeasonPanels();
  }
  function seasonHeadline(){
    if(state.age<=17) return 'Pierwsze kroki w seniorach';
    if(state.overall>=76) return 'Jesteś gwiazdą';
    if(state.overall>=67) return 'Liczą się z tobą';
    if(state.overall>=57) return 'Budujesz pozycję';
    return 'Walczysz o swoje minuty';
  }
  function interpolateLogAnchors(value,anchors){
    if(value<=anchors[0][0]) return anchors[0][1];
    if(value>=anchors[anchors.length-1][0]) return anchors[anchors.length-1][1];
    for(let i=1;i<anchors.length;i++){
      const [x2,y2]=anchors[i],[x1,y1]=anchors[i-1];
      if(value<=x2){
        const t=(value-x1)/(x2-x1);
        return Math.exp(Math.log(y1)+(Math.log(y2)-Math.log(y1))*t);
      }
    }
    return anchors[anchors.length-1][1];
  }
  function marketAgeFactor(age){
    if(age<=18) return 1.30;
    if(age<=22) return 1.20;
    if(age<=27) return 1;
    if(age<=30) return 1-(age-27)*.045;
    return Math.max(.10,.865-(age-30)*.075);
  }
  function marketClubFactor(club){
    const level=clubMarketLevel(club);
    const anchors=[[1,.55],[2,.65],[3,.78],[4,.90],[5,1.05],[6,1.20],[6.9,1.35],[7.65,1.50],[8.45,1.70]];
    if(level<=1) return anchors[0][1];
    for(let i=1;i<anchors.length;i++){
      if(level<=anchors[i][0]){
        const [x2,y2]=anchors[i],[x1,y1]=anchors[i-1];
        return y1+(y2-y1)*(level-x1)/(x2-x1);
      }
    }
    return 1.70;
  }
  function roundedMarketAmount(value){
    const step=value>=100000000?1000000:value>=10000000?100000:value>=1000000?10000:1000;
    return Math.max(1000,Math.round(value/step)*step);
  }
  function calcValue(){
    // Wartość zawodnika jest iloczynem jego OVR, medialności, prestiżu klubu
    // i wieku. Niska medialność obniża wycenę, ale nie zeruje kariery.
    const overall=clamp(Number(state.overall)||1,1,125);
    const anchors=[[1,1000],[10,3000],[20,10000],[30,30000],[40,100000],[50,350000],[60,1200000],[70,4000000],[80,12000000],[90,40000000],[100,100000000],[110,200000000],[125,400000000]];
    const overallValue=interpolateLogAnchors(overall,anchors);
    const mediaFactor=.25+clamp(state.recognition||0,0,100)*.0125;
    const prestigeFactor=.45+clubPrestigeScore(state.club)*.009;
    return roundedMarketAmount(overallValue*mediaFactor*prestigeFactor*marketAgeFactor(state.age));
  }
  function contractLevelBase(club){
    const level=clubMarketLevel(club);
    const anchors=[[1,12000],[2,22000],[3,40000],[4,75000],[5,150000],[6,360000],[6.25,600000],[6.9,1400000],[7.65,3200000],[8.45,7200000]];
    return interpolateLogAnchors(level,anchors);
  }
  function amateurMonthlyContribution(club){
    if(!club||isForeignClub(club)) return 0;
    const level=Number(club.pyramidLevel)||0;
    const league=String(club.leagueName||'').toLocaleLowerCase('pl-PL');
    // Granice słów są konieczne: „Ekstraklasa” kończy się ciągiem „a klasa”
    // po uproszczonym dopasowaniu i wcześniej bywała mylona z A-klasą.
    if(level===8 || /\bklasa\s*b\b|\bb\s*-?\s*klasa\b/.test(league)) return -500;
    if(level===7 || /\bklasa\s*a\b|\ba\s*-?\s*klasa\b/.test(league)) return -300;
    return 0;
  }
  function foreignProfessionalFloorBaseAnnual(club){
    if(!isForeignClub(club)) return 0;
    const country=String(club.country||'');
    const league=String(club.league||'').toLocaleLowerCase('pl-PL');

    // Podłoga jest kwotą PRZED leagueFinance. Zachowujemy więc stary wzór
    // oraz zasadę, że gospodarka kraju jest wyłącznie końcową korektą.
    // Turcja 1.50: 18 tys. bazowo w drugim poziomie daje 27 tys. zł/mies.,
    // a 16 tys. w TFF 2. Lig daje 24 tys. zł/mies. przed rzutem oferty.
    if(country==='Turcja'){
      if(/süper\s+lig/.test(league)) return 40000*12;
      if(/trendyol\s+1\.\s*lig|^1\.\s*lig/.test(league)) return 18000*12;
      if(/tff\s+2\.\s*lig/.test(league)) return 16000*12;
      if(/tff\s+3\.\s*lig/.test(league)) return 7000*12;
    }
    return 0;
  }
  function polishProfessionalFloorBaseAnnual(club){
    if(!club||isForeignClub(club)) return 0;
    // Miesięczne minima bazowe przed zróżnicowaniem klubem i rzutem rynku.
    // A- i B-klasa są wcześniej przechwytywane przez kontrakt ujemny.
    const monthlyByLevel={1:14000,2:7500,3:4500,4:2500,5:1400,6:900};
    return (monthlyByLevel[Number(club.pyramidLevel)]||0)*12;
  }
  function contractMarketFactors(club){
    if(!club) return {roll:50,rollComponent:1,offerFactor:1,prestige:4};
    // 75% propozycji pochodzi z wartości sportowo-medialnej. Pozostałe 25%
    // wyznacza deterministyczny rzut (0,50–1,50), więc ta sama oferta nie
    // zmienia kwoty po ponownym otwarciu panelu.
    const seed=`${state?.name||'zawodnik'}|${state?.seasonYear||0}|${worldClubId(club)}|kontrakt`;
    const roll=1+(polishStableHash(seed)%100);
    const rollComponent=.50+roll/100;
    const offerFactor=.75+.25*rollComponent;
    return {roll,rollComponent,offerFactor,prestige:clubPrestigeScore(club)};
  }
  function contractMarketNote(club){
    const live=liveMarketClub(club);
    if(!live||amateurMonthlyContribution(live)) return '';
    const factors=contractMarketFactors(live);
    const finance=Math.max(.01,Number(live.leagueFinance)||1);
    const development=clubFinanceProgressionFactor(live);
    return `prestiż klubu ${String(factors.prestige.toFixed(1)).replace('.',',')}/100 • medialność ${clamp(state.recognition||0,0,100)}/100 • rzut ${factors.roll}/100 wyznacza 25% oferty • finanse ×${finance.toFixed(2).replace('.',',')}${development>1?` • rozwój klubu ×${development.toFixed(2).replace('.',',')}`:''}`;
  }
  function calcAnnualSalaryForClub(club){
    if(!club) return 0;
    club=liveMarketClub(club);
    const amateurContribution=amateurMonthlyContribution(club);
    if(amateurContribution) return amateurContribution*12;
    // Podstawa kontraktu wynika z prestiżu klubu (prestiż ligi + OVR) oraz
    // medialności zawodnika. Rzut odpowiada za 25% propozycji. Mnożnik
    // finansowy kraju jest stosowany jako ostatnie działanie.
    const mediaFactor=.35+clamp(Number(state.recognition)||0,0,100)*.013;
    const leagueFinance=Math.max(.01,Number(club.leagueFinance)||1);
    const clubDevelopment=clubFinanceProgressionFactor(club);
    const legacyBase=contractLevelBase(club)*mediaFactor*.75;
    const foreignFloor=foreignProfessionalFloorBaseAnnual(club);
    const polishFloor=polishProfessionalFloorBaseAnnual(club);
    const sportingFloor=Math.max(foreignFloor,polishFloor);
    const factors=contractMarketFactors(club);
    const beforeFinance=Math.max(legacyBase,sportingFloor)*factors.offerFactor;
    const raw=beforeFinance*leagueFinance*clubDevelopment;
    const step=raw>=10000000?100000:raw>=1000000?10000:1000;
    return Math.max(4500,Math.round(raw/step)*step);
  }
  function renderMoneyPanel(){
    const currency=['PLN','EUR','PLZ','KHR'].includes(state.currencyDisplay)?state.currencyDisplay:'PLN';
    state.currencyDisplay=currency;
    if(els.currencySelect) els.currencySelect.value=currency;
    if(!Number.isFinite(state.contractAnnualPln)) state.contractAnnualPln=calcAnnualSalaryForClub(state.club);
    const valueText=formatMoney(calcValue(),currency);
    els.valueLabel.textContent=valueText;
    if(els.legacyValueLabel) els.legacyValueLabel.textContent=valueText;
    if(els.salaryLabel) els.salaryLabel.textContent=formatMoney(state.contractAnnualPln/12,currency);
    if(els.careerEarningsValue) els.careerEarningsValue.textContent=formatMoney(state.careerEarningsPln||0,currency);
  }

  function seasonGradeDescription(label){
    return ({
      'BEZNADZIEJNY':'Sezon do zapomnienia — sportowo niemal nic się nie zgadzało.',
      'SŁABY':'Wyraźnie nieudany rok, w którym trudno było znaleźć sportowy punkt zaczepienia.',
      'PONIŻEJ OCZEKIWAŃ':'Nie wszystko się zgadzało, ale nie był to sezon całkowicie stracony.',
      'PRZECIĘTNY':'Bez większego upadku, ale również bez mocnego sportowego śladu.',
      'PRZYZWOITY':'Solidna robota i kilka argumentów, choć bez przełomu.',
      'DOBRY':'Udany sezon, w którym realnie pomogłeś drużynie.',
      'ŚWIETNY':'Jeden z mocnych punktów kariery — regularna, wysoka jakość.',
      'WYBITNY':'Sezon ponad zwykłą skalę, zapamiętywany przez klub i ligę.',
      'HISTORYCZNY':'Rok, który staje się częścią historii klubu i rozgrywek.'
    })[label]||'Podsumowanie sportowej jakości całego sezonu.';
  }

  function dashboardMarker(value,min,max){ return clamp((Number(value)-min)/(max-min)*100,0,100); }
  function dashboardList(items,empty='brak'){
    return items?.length?items.map(x=>escapeDecisionHtml(x)).join('<br>'):empty;
  }
  function renderSeasonPanels(){
    applyPanelModeAppearance();
    const newPanel=state?.seasonPanelMode!=='old';
    if(!newPanel&&els.historyPanel) els.historyPanel.open=true;
    const showNew=!!(newPanel&&state?.seasonFinished&&state?.lastSeasonDashboard);
    els.legacySeasonHead?.classList.toggle('hidden',showNew);
    els.legacySeasonStats?.classList.toggle('hidden',showNew);
    const oldSeasonSummary=els.eventBox?.dataset.panelRole==='season-summary';
    els.eventBox?.classList.toggle('hidden',showNew&&oldSeasonSummary);
    if(showNew) renderSeasonDashboard();
    else els.seasonDashboard?.classList.add('hidden');
  }

  function closeLeagueMatchReport(){ els.leagueMatchModal?.classList.add('hidden'); }
  function openLeagueMatchReport(match,round,competition,table=[]){
    if(!els.leagueMatchModal||!match) return;
    const seed=`${state?.name||''}|${state?.seasonYear||''}|${round}|${match.homeId}|${match.awayId}|${match.homeGoals}:${match.awayGoals}`;
    const random=PPSLeagueEngine.createRandom(seed);
    const homeGoals=Math.max(0,Number(match.homeGoals)||0),awayGoals=Math.max(0,Number(match.awayGoals)||0);
    const homeShots=homeGoals+random.int(5,12),awayShots=awayGoals+random.int(5,12);
    const homeOn=Math.min(homeShots,homeGoals+random.int(2,5)),awayOn=Math.min(awayShots,awayGoals+random.int(2,5));
    const homeRow=table.find(row=>row.id===match.homeId),awayRow=table.find(row=>row.id===match.awayId);
    const tableEdge=(awayRow?.place||9)-(homeRow?.place||9);
    const possession=clamp(50+tableEdge+random.int(-5,5),38,62);
    const goalEvents=[];
    for(let index=0;index<homeGoals;index++) goalEvents.push({minute:random.int(4,89),text:`Gol dla ${match.home}. Gospodarze wykorzystują swoją sytuację.`});
    for(let index=0;index<awayGoals;index++) goalEvents.push({minute:random.int(4,89),text:`Gol dla ${match.away}. Goście odpowiadają skutecznym atakiem.`});
    goalEvents.sort((a,b)=>a.minute-b.minute);
    const events=goalEvents.length?goalEvents:[
      {minute:random.int(12,30),text:`${match.home} tworzy pierwszą groźną sytuację, ale bez gola.`},
      {minute:random.int(48,66),text:`${match.away} odpowiada po przerwie. Bramkarz utrzymuje wynik.`},
      {minute:random.int(72,88),text:'Końcówka jest nerwowa, lecz żadna ze stron nie znajduje drogi do bramki.'}
    ];
    els.leagueMatchKicker.textContent=`${competition||'ROZGRYWKI LIGOWE'} • KOLEJKA ${round}`;
    els.leagueMatchTitle.textContent='Raport po meczu';
    els.leagueMatchContent.innerHTML=`
      <div class="league-report-score"><span>${escapeDecisionHtml(match.home)}</span><strong>${homeGoals}:${awayGoals}</strong><span>${escapeDecisionHtml(match.away)}</span></div>
      <div class="league-report-grid">
        <div><span>Strzały / celne</span><strong>${homeShots} / ${homeOn} — ${awayOn} / ${awayShots}</strong></div>
        <div><span>Posiadanie</span><strong>${possession}% — ${100-possession}%</strong></div>
        <div><span>Tabela po sezonie</span><strong>${homeRow?.place||'—'}. — ${awayRow?.place||'—'}.</strong></div>
      </div>
      <div class="league-report-timeline">${events.map(event=>`<div class="league-report-event"><span>${event.minute}'</span><span>${escapeDecisionHtml(event.text)}</span></div>`).join('')}</div>
      `;
    els.leagueMatchModal.classList.remove('hidden');
  }

  function renderSeasonDashboard(){
    if(!els.seasonDashboard) return;
    const d=state?.lastSeasonDashboard;
    if(!state?.seasonFinished||!d){ els.seasonDashboard.classList.add('hidden'); return; }
    const ovrPct=dashboardMarker(d.ovrAfter,1,125);
    const formPct=dashboardMarker(d.formMeterRoll??d.seasonRoll,1,100);
    const gradePct=dashboardMarker(d.gradeIndex,0,8);
    const yearLabel=`${d.year}/${String(d.year+1).slice(2)}`;
    const productionText=d.position==='GK'
      ?`W ${d.apps||0} meczach wpuściłeś ${d.goalsConceded||0} goli i zachowałeś ${d.cleanSheets||0} czystych kont. To właśnie ten bilans jest podstawą oceny bramkarza.`
      :`Forma wyznaczyła punkt wyjścia, a rzeczywiste liczby z boiska przesunęły ocenę w górę albo w dół.`;
    const trophies=d.trophies||[];
    const awards=d.awards||[];
    const goalkeeper=d.position==='GK';
    const statTwoLabel=goalkeeper?'Stracone':'Gole';
    const statThreeLabel=goalkeeper?'Czyste konta':'Asysty';
    const statTwo=goalkeeper?(d.goalsConceded||0):(d.goals||0);
    const statThree=goalkeeper?(d.cleanSheets||0):(d.assists||0);
    const gradeCorrection=d.gradeContextText||`Forma i występy złożyły się na końcową ocenę ${d.gradeLabel}.`;
    const detailRows=d.rollDetails||[];
    const detailSection=(title,rows)=>`<section class="roll-detail-section"><h4>${title}</h4>${rows.filter(Boolean).map(x=>`<p>${escapeDecisionHtml(x)}</p>`).join('')}</section>`;
    const details=[
      detailSection('Forma i liczby',[detailRows[0],detailRows[1]||productionText]),
      detailSection('Ocena sezonu',[seasonGradeDescription(d.gradeLabel),detailRows[2]||gradeCorrection]),
      detailSection('Rozwój zawodnika',[detailRows[3],detailRows[4]]),
      detailSection('Kontekst sezonu',[detailRows[5],detailRows[6],detailRows[7]])
    ].join('');
    const leagueRows=(d.leagueTable||[]).map(row=>`<tr class="${row.playerClub?'player-club ':''}${row.zone?`zone-${row.zone}`:''}" style="--club-primary:${row.primary||'#777'};--club-secondary:${row.secondary||'#fff'};--club-shadow:${row.shadow||'#777'};--club-ink:${row.ink||readablePaletteInk(row.primary||'#777',row.secondary||'#fff')}">
      <td>${row.place}.</td><td><span class="league-club-name"><span class="league-club-colours" title="Barwy: ${escapeDecisionHtml(row.colourSource||'klub')}"><i></i><i></i></span><span>${escapeDecisionHtml(row.name)}${row.playerClub?' • TWÓJ KLUB':''}${row.zoneLabel?`<small class="league-zone-tag">${escapeDecisionHtml(row.zoneLabel)}</small>`:''}</span></span></td>
      <td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td>
      <td>${row.gf}:${row.ga}</td><td>${row.gd>0?'+':''}${row.gd}</td><td><strong>${row.points}</strong></td>
    </tr>`).join('');
    const clickableLeagueMatches=[];
    const leagueRounds=(d.leagueRounds||[]).map(round=>`<section class="league-round"><h5>Kolejka ${round.round}</h5>${(round.matches||[]).map(match=>{
      const playerMatch=(d.leagueTable||[]).some(row=>row.playerClub&&(row.id===match.homeId||row.id===match.awayId));
      const index=clickableLeagueMatches.push({match,round:round.round})-1;
      return `<button type="button" data-league-match="${index}" class="league-match${playerMatch?' player-match':''}" title="Otwórz raport meczu"><span>${escapeDecisionHtml(match.home)}</span><strong>${match.homeGoals}:${match.awayGoals}</strong><span>${escapeDecisionHtml(match.away)}</span></button>`;
    }).join('')}</section>`).join('');
    const playoffRows=(d.playoffRecords||[]).map(record=>`<p><span>${escapeDecisionHtml(record.label||'Baraż')}</span><span><strong>${escapeDecisionHtml(record.home)} ${record.homeGoals}:${record.awayGoals} ${escapeDecisionHtml(record.away)}</strong>${record.twoLegged?' • dwumecz':''}${record.penalties?' • po rzutach karnych':''} • awans: ${escapeDecisionHtml(record.winner)}</span></p>`).join('');
    const playoffReport=playoffRows?`<section class="league-playoff-report"><h5>Twoje baraże</h5>${playoffRows}</section>`:'';
    const leagueSection=leagueRows?`<section class="league-season-block">
      <div class="league-season-head"><div><span>Rozgrywki ligowe</span><h4>Końcowa tabela</h4></div><strong>${d.leagueMatches||0} meczów</strong></div>
      <div class="league-zone-legend"><span><i class="promotion"></i> awans / puchary</span><span><i class="playoff"></i> baraże</span><span><i class="relegation"></i> spadek</span></div>
      <div class="league-table-wrap"><table class="league-table"><thead><tr><th>#</th><th>Klub</th><th>M</th><th>W</th><th>R</th><th>P</th><th>BR</th><th>RB</th><th>PKT</th></tr></thead><tbody>${leagueRows}</tbody></table></div>
      ${playoffReport}
      ${leagueRounds?`<details class="league-fixtures"><summary>Pokaż wszystkie kolejki i wyniki</summary><div class="league-rounds">${leagueRounds}</div></details>`:''}
    </section>`:'';
    els.seasonDashboard.innerHTML=`
      <div class="season-dashboard-head">
        <div><div class="eyebrow">PANEL SEZONU ${yearLabel}</div><h3>${escapeDecisionHtml(d.club)}</h3><strong>${escapeDecisionHtml(d.competition)}</strong></div>
        <div class="season-dashboard-stats">
          <div><span>Mecze</span><strong>${d.apps||0}</strong></div>
          <div><span>${statTwoLabel}</span><strong>${statTwo}</strong></div>
          <div><span>${statThreeLabel}</span><strong>${statThree}</strong></div>
          <div><span>Minuty</span><strong>${d.minutes||0}</strong></div>
        </div>
      </div>
      <div class="season-meter-block">
        <div class="season-meter-title"><span>Rozwój OVR • skala 1–125</span><strong>${d.ovrBefore} → ${d.ovrAfter}</strong></div>
        <div class="season-meter" style="--meter-value:${ovrPct}%"><i class="season-meter-fill"></i></div>
        <div class="season-meter-scale"><span>1 OVR</span><span>125 OVR</span></div>
        <p class="season-factor-text"><strong>Wpływ na OVR:</strong> ${(d.ovrFactors||[]).map(x=>escapeDecisionHtml(x)).join(' • ')||'brak zmiany'}.</p>
      </div>
      <div class="season-meter-block">
        <div class="season-meter-title"><span>Forma</span><strong>${escapeDecisionHtml(d.formLabel)}</strong></div>
        <div class="season-meter" style="--meter-value:${formPct}%"><i class="season-meter-fill"></i></div>
        <div class="season-meter-scale"><span>kryzys</span><span>normalny</span><span>sezon życia</span></div>
        ${d.breakthrough?`<p class="season-breakthrough-note"><strong>PRZEŁOM.</strong> Niespodziewana seria szans zmieniła twoją pozycję w zespole: ${d.openingStartChance}% → ${d.startChance}% szans na grę.</p>`:''}
      </div>
      <div class="season-meter-block">
        <div class="season-meter-title"><span>Ocena sezonu</span><strong>${escapeDecisionHtml(d.gradeLabel)}</strong></div>
        <div class="season-meter" style="--meter-value:${gradePct}%"><i class="season-meter-fill"></i></div>
        <div class="season-meter-scale"><span>beznadziejny</span><span>przyzwoity</span><span>historyczny</span></div>
        <p class="season-context-note">${escapeDecisionHtml(d.gradeContextText||seasonGradeDescription(d.gradeLabel))}</p>
      </div>
      <div class="season-outcomes">
        <div class="season-outcome"><span>Miejsce w lidze</span><strong>${d.leaguePlace?`${d.leaguePlace}. z ${d.leagueTeams}`:'—'}</strong><small>${escapeDecisionHtml(d.competition)}</small></div>
        <div class="season-outcome"><span>Trofea</span><strong>${dashboardList(trophies)}</strong><small>Osiągnięcia klubowe w tym sezonie</small></div>
        <div class="season-outcome"><span>Nagrody</span><strong>${dashboardList(awards)}</strong><small>Wyróżnienia indywidualne w tym sezonie</small></div>
      </div>
      <div class="season-condition-summary">
        <p><span>Środowisko</span><strong>${escapeDecisionHtml(d.environmentLabel||'—')}</strong></p>
        <p><span>Urazy</span><strong>${escapeDecisionHtml(d.injuryText||'brak danych')}</strong></p>
        <p><span>Medialność</span><strong>${Number.isFinite(d.recognitionBefore)?`${d.recognitionBefore} → ${d.recognitionAfter} (${d.recognitionDelta>=0?'+':''}${d.recognitionDelta})`:'—'}</strong></p>
        ${d.availabilityText?`<p><span>Dostępność</span><strong>${escapeDecisionHtml(d.availabilityText)}</strong></p>`:''}
      </div>
      ${leagueSection}
      <details class="roll-details season-dashboard-details">
        <summary>Pokaż szczegóły losowania</summary>
        <div>${details||'<p>Brak dodatkowych danych losowania.</p>'}</div>
      </details>`;
    els.seasonDashboard.classList.remove('hidden');
    els.seasonDashboard.querySelectorAll('[data-league-match]').forEach(button=>{
      button.addEventListener('click',()=>{
        const item=clickableLeagueMatches[Number(button.dataset.leagueMatch)];
        if(item) openLeagueMatchReport(item.match,item.round,d.competition,d.leagueTable||[]);
      });
    });
  }

  els.currencySelect?.addEventListener('change',()=>{
    safeLocalSet(CURRENCY_DISPLAY_KEY,els.currencySelect.value);
    if(state){
      state.currencyDisplay=els.currencySelect.value;
      renderMoneyPanel();
    }
  });

  els.seasonPanelSelect?.addEventListener('change',()=>{
    const mode=els.seasonPanelSelect.value==='old'?'old':'new';
    safeLocalSet(PANEL_MODE_KEY,mode);
    if(state) state.seasonPanelMode=mode;
    applyPanelModeAppearance();
    applyVisualTheme();
    renderSeasonPanels();
  });

  els.visualThemeSelect?.addEventListener('change',()=>{
    const theme=['classic','club','monochrome'].includes(els.visualThemeSelect.value)?els.visualThemeSelect.value:'classic';
    sessionVisualTheme=theme;
    safeLocalSet(VISUAL_THEME_KEY,theme);
    if(state) state.visualTheme=theme;
    applyVisualTheme();
  });

  els.leagueTableStyleSelect?.addEventListener('change',()=>{
    const tableStyle=els.leagueTableStyleSelect.value==='clubs'?'clubs':'zones';
    safeLocalSet(LEAGUE_TABLE_STYLE_KEY,tableStyle);
    if(state)state.leagueTableStyle=tableStyle;
    applyLeagueTableStyle();
  });

  els.playSeasonBtn.addEventListener('click', ()=>{ if(!state.pendingDecision) simulateSeason(); });


  function weightedDelta(rows){
    const total=rows.reduce((a,x)=>a+x[0],0);
    let r=Math.random()*total;
    for(const [w,d] of rows){ r-=w; if(r<=0) return d; }
    return rows[rows.length-1][1];
  }

  // Naturalna krzywa OVR przed dodatkowymi modyfikatorami
  // sezonu, środowiska, talentu i liczby występów.
  // Wiek to tylko biologiczny dryf, nie wyrok. Nawet stary zawodnik
  // zachowuje małą szansę poprawy; wynik sezonu jest liczony osobno.
  function veteranProfessionalismProtection(age){
    if(age<35) return 0;

    const p=state.professionalism||50;
    if(p<60) return 0;

    // Po 39. roku życia regres pozostaje brutalny:
    // profesjonalizm może uratować najwyżej 1 OVR w danym roku.
    if(age>=39){
      const chance =
        p>=95 ? 65 :
        p>=85 ? 50 :
        p>=75 ? 35 :
        p>=60 ? 18 : 0;
      return rand(1,100)<=chance ? 1 : 0;
    }

    // 35–38: najlepsi profesjonaliści realnie starzeją się wolniej.
    // Najczęściej oznacza to uratowanie 1 OVR, czasem 2.
    if(p>=95){
      const r=rand(1,100);
      return r<=20 ? 2 : r<=75 ? 1 : 0;   // EV +0.95
    }
    if(p>=85){
      const r=rand(1,100);
      return r<=10 ? 2 : r<=60 ? 1 : 0;   // EV +0.70
    }
    if(p>=75) return rand(1,100)<=42 ? 1 : 0;
    return rand(1,100)<=20 ? 1 : 0;
  }

  function rollNaturalGrowth(age){
    // v0.61 — SCHYŁEK KARIERY.
    // Od 35 lat biologiczny regres jest mocny i taki sam na obu poziomach trudności.
    // Od 39 lat staje się brutalny, ale nadal jest losowany.
    if(age===35) return weightedDelta([[10,-1],[45,-2],[35,-3],[10,-4]]);
    if(age===36) return weightedDelta([[5,-1],[35,-2],[45,-3],[15,-4]]);
    if(age===37) return weightedDelta([[20,-2],[45,-3],[25,-4],[10,-5]]);
    if(age===38) return weightedDelta([[10,-2],[35,-3],[40,-4],[15,-5]]);
    if(age>=39 && age<=40) return weightedDelta([[15,-3],[35,-4],[35,-5],[15,-6]]);
    if(age>=41 && age<=42) return weightedDelta([[10,-4],[35,-5],[35,-6],[20,-7]]);
    if(age>=43) return weightedDelta([[10,-5],[30,-6],[40,-7],[20,-8]]);

    // Do 34 roku życia trudność nadal wpływa na rozwój.
    if(isEasy()){
      if(age<=18) return weightedDelta([[4,0],[38,1],[45,2],[13,3]]);
      if(age<=21) return weightedDelta([[17,0],[55,1],[23,2],[5,3]]);
      if(age<=23) return weightedDelta([[34,0],[56,1],[10,2]]);
      if(age<=24) return weightedDelta([[4,-1],[30,0],[56,1],[10,2]]);
      if(age<=27) return weightedDelta([[7,-1],[50,0],[39,1],[4,2]]);
      if(age<=30) return weightedDelta([[12,-1],[60,0],[26,1],[2,2]]);
      if(age===31) return weightedDelta([[2,-2],[20,-1],[65,0],[13,1]]);
      if(age<=33) return weightedDelta([[5,-2],[30,-1],[58,0],[7,1]]);
      if(age===34) return weightedDelta([[12,-2],[40,-1],[45,0],[3,1]]);
      return weightedDelta([[12,-2],[40,-1],[45,0],[3,1]]);
    }

    if(age<=18) return weightedDelta([[10,0],[50,1],[35,2],[5,3]]);
    if(age<=21) return weightedDelta([[30,0],[52,1],[15,2],[3,3]]);
    if(age<=23) return weightedDelta([[50,0],[45,1],[5,2]]);
    if(age<=24) return weightedDelta([[10,-1],[40,0],[45,1],[5,2]]);
    if(age<=27) return weightedDelta([[15,-1],[55,0],[28,1],[2,2]]);
    if(age<=30) return weightedDelta([[22,-1],[60,0],[17,1],[1,2]]);
    if(age===31) return weightedDelta([[5,-2],[30,-1],[55,0],[10,1]]);
    if(age<=33) return weightedDelta([[12,-2],[40,-1],[43,0],[5,1]]);
    if(age===34) return weightedDelta([[22,-2],[45,-1],[31,0],[2,1]]);
    return weightedDelta([[22,-2],[45,-1],[31,0],[2,1]]);
  }

  // Sezon jest JEDNYM czytelnym rzutem DYSPOZYCJI.
  // Początkowa szansa na grę NIE wpływa na to, czy wylosujesz świetny czy słaby rok.
  // Profesjonalizm tylko lekko przesuwa rozkład; głównym rozstrzygnięciem pozostaje rzut.
  function rollSeasonForm(){
    const profMod=clamp(Math.round((state.professionalism-50)/18),-3,3);
    const qualityMod=profMod;

    const rows=[
      {key:'crisis',label:'KRYZYS',base:4,grade:-2,hierarchy:-18,productionRange:[.30,.50],gradePair:[0,1],gradeBounds:[0,1],performanceMod:-6,seasonBonus:-2},
      {key:'poor',label:'SŁABY',base:9,grade:-1,hierarchy:-8,productionRange:[.75,1.05],gradePair:[2,3],gradeBounds:[1,4],performanceMod:-3,seasonBonus:-1},
      {key:'normal',label:'NORMALNY',base:49,grade:0,hierarchy:0,productionRange:[.80,1.20],gradePair:[3,4],gradeBounds:[3,5],performanceMod:0,seasonBonus:0},
      {key:'good',label:'DOBRY',base:25,grade:1,hierarchy:15,productionRange:[1.05,1.35],gradePair:[5,6],gradeBounds:[4,7],performanceMod:3,seasonBonus:1},
      {key:'great',label:'ŚWIETNY',base:11,grade:2,hierarchy:35,productionRange:[1.20,1.50],gradePair:[6,7],gradeBounds:[5,7],performanceMod:6,seasonBonus:2},
      {key:'career',label:'SEZON ŻYCIA',base:2,grade:3,hierarchy:50,productionRange:[1.40,1.65],gradePair:[7,8],gradeBounds:[7,8],performanceMod:10,seasonBonus:3}
    ];

    // Profesjonalizm i tryb gry tylko lekko przesuwają rozkład.
    // Hierarchia przed sezonem nie zmienia szans na wylosowanie dobrej dyspozycji.
    const weighted=rows.map(x=>({...x,w:x.base*Math.exp(qualityMod*x.grade/22)}));
    const sum=weighted.reduce((a,x)=>a+x.w,0);
    const exact=weighted.map(x=>100*x.w/sum);
    const chances=exact.map(Math.floor);
    let missing=100-chances.reduce((a,x)=>a+x,0);
    const remainderOrder=exact.map((v,i)=>({i,frac:v-Math.floor(v)})).sort((a,b)=>b.frac-a.frac);
    for(let k=0;k<missing;k++) chances[remainderOrder[k%remainderOrder.length].i]++;

    const forcedRoll=Number.isFinite(state.forcedSeasonFormRoll)
      ?clamp(Math.round(state.forcedSeasonFormRoll),1,100)
      :null;
    const forcedReason=forcedRoll===null?null:(state.forcedSeasonFormReason||'Wymuszony wynik zdarzenia.');
    state.forcedSeasonFormRoll=null;
    state.forcedSeasonFormReason=null;
    state.forcedSeasonFormClubName=null;
    const roll=forcedRoll===null?rand(1,100):forcedRoll;
    let cursor=0;
    let bandStart=1;
    let bandSize=chances[chances.length-1];
    let chosen=weighted[weighted.length-1];
    for(let i=0;i<weighted.length;i++){
      const before=cursor;
      cursor+=chances[i];
      if(roll<=cursor){
        chosen=weighted[i];
        bandStart=before+1;
        bandSize=chances[i];
        break;
      }
    }

    const probabilities=Object.fromEntries(weighted.map((x,i)=>[x.key,chances[i]]));
    // 0 = sam dół wylosowanego przedziału, 1 = sam szczyt. Przy jedno-
    // punktowym przedziale przyjmujemy środek, żeby uniknąć sztucznej skrajności.
    const position=bandSize<=1 ? .5 : clamp((roll-bandStart)/(bandSize-1),0,1);
    return {
      ...chosen,roll,profMod,qualityMod,probabilities,forced:forcedRoll!==null,forcedReason,
      bandStart,bandEnd:bandStart+bandSize-1,bandSize,position,
      positionPct:Math.round(position*100)
    };
  }

  // Profile natychmiastowych decyzji międzysezonowych.
  const OVR_PROFILES = {
    // Również profile awaryjne mają tylko dwa wyniki.
    breakout:{outcomes:[[30,3],[70,-1]], name:'PRÓBA PRZEŁOMU'},
    highrisk:{outcomes:[[35,2],[65,-1]], name:'DUŻE RYZYKO'},
    aggressive:{outcomes:[[40,1],[60,0]], name:'AGRESYWNIE'},
    balanced:{outcomes:[[30,1],[70,0]], name:'ZRÓWNOWAŻENIE'},
    safe:{outcomes:[[20,1],[80,0]], name:'OSTROŻNIE'}
  };

  const HIGH_RISK_LABELS = new Set([
    'Wchodzę na sto procent','Dodatkowy trening','Walczę o miejsce','Zostaję po treningu',
    'Podkręcam atmosferę','Chcę nadal grać wszystko','Tylko piłka','Gram i trenuję normalnie',
    'Wszystko stawiam na piłkę','Walczę o każdą minutę','Wracam jak najszybciej',
    'Od razu pokazuję charakter','Nie wiążę się','Sprawdzam oferty',
    'Chcę jeszcze spróbować wyżej','Biorę ostatnią szansę','Słucham ofert','Szukam odejścia',
    'Bronię się publicznie','Wolę swoją pozycję'
  ]);
  const AGGRESSIVE_LABELS = new Set([
    'Zostaję i walczę','Od razu go przekonuję','Odpowiadam na boisku','Korzystam z momentu',
    'Korzystam z rozgłosu','Próbuję','Uczę się tego','Przekonuję go na treningach',
    'Wierzę w swoją pozycję','Jeszcze jestem piłkarzem','Biorę odpowiedzialność','Podpisuję z nim','Pytam o odejście',
    'Szukam stabilności','Chcę znowu grać','Wracam'
  ]);
  const SAFE_LABELS = new Set([
    'Bez pośpiechu','Odpoczywam','Czekam na swoją szansę','Nie dokładam obciążeń',
    'Mówię tylko o boisku','Wyłączam telefon','Regeneracja przede wszystkim',
    'Pełna rehabilitacja','Słucham i chłonę','Czekam, co będzie',
    'Podpisuję','Zostaję przy swoim','Nie ruszam się','Zostaję na tym poziomie',
    'Nie mieszam się','Nic nie zmieniam','Bronię po staremu','Skupiam się na grze'
  ]);
  const BALANCED_LABELS = new Set([
    'Trzymam się z boku','Biorę odpowiedzialność',
    'Przyjmuję rolę mentora','Uczę się życia tutaj','Łączę piłkę z nauką',
    'Pomagam mu wejść do zespołu','Robię kurs','Zostaję z drużyną','Zostaję po awansie',
    'Chcę wypożyczenia','Wracam po minuty','Szukam gry','Wchodzę w ten plan',
    'Chcę zostać','Jeszcze nie','Próbuję uspokoić sytuację','Zgadzam się','Zostaję'
  ]);

  function ovrProfileForChoice(ch){
    // null jest zarezerwowane wyłącznie dla rynku klubowego: sam podpis z klubem
    // nie wykonuje natychmiastowego rzutu OVR. Zwykłe zdarzenia ZAWSZE mają stawkę.
    if(ch.ovrProfile===null) return null;
    if(ch.ovrProfile && OVR_PROFILES[ch.ovrProfile]) return OVR_PROFILES[ch.ovrProfile];
    const l=ch.label||'';
    if(HIGH_RISK_LABELS.has(l)) return OVR_PROFILES.highrisk;
    if(AGGRESSIVE_LABELS.has(l)) return OVR_PROFILES.aggressive;
    if(SAFE_LABELS.has(l)) return OVR_PROFILES.safe;
    if(BALANCED_LABELS.has(l)) return OVR_PROFILES.balanced;

    const src=String(ch.act||'');
    const injPlus=src.match(/injuryRisk[^;]*?injuryRisk\s*\+\s*(\d+)/) || src.match(/injuryRisk[^;]*?\+\s*(\d+)/);
    const injMinus=src.match(/injuryRisk[^;]*?injuryRisk\s*-\s*(\d+)/) || src.match(/injuryRisk[^;]*?-\s*(\d+)/);
    const boostPlus=src.match(/boost\s*\+=\s*(\d+)/);
    if(/findTransferClub|moveClub|regionalReturn|loanMove|findLowerClub|findPlayableClub/.test(src)) return OVR_PROFILES.aggressive;
    if(injPlus && Number(injPlus[1])>=2) return OVR_PROFILES.highrisk;
    if(injMinus) return OVR_PROFILES.safe;
    if(boostPlus && Number(boostPlus[1])>=4) return OVR_PROFILES.aggressive;
    if(/professionalism/.test(src) || /loyalty/.test(src)) return OVR_PROFILES.balanced;
    return OVR_PROFILES.balanced;
  }

  function extractEffectSummary(ch){
    if(ch.preview) return ch.preview;
    const src=String(ch.act||'');
    const bits=[];
    const add=(name, regex, suffix='')=>{
      const m=src.match(regex);
      if(m){
        const n=Number(m[1]);
        bits.push(`${name} ${n>=0?'+':''}${n}${suffix}`);
      }
    };
    const boost=src.match(/boost\s*([+-])=\s*(\d+)/);
    if(boost) bits.push(`szansa na minuty ${boost[1]==='+'?'+':'-'}${boost[2]} p.p.`);

    // Precise common hidden-stat changes.
    const pairs=[
      ['profesjonalizm','professionalism'],
      ['adaptacja','adaptability']
    ];
    for(const [name,key] of pairs){
      const m=src.match(new RegExp(key+"[^;]*?"+key+"\\s*([+-])\\s*(\\d+)"));
      if(m) bits.push(`${name} ${m[1]==='+'?'+':'-'}${m[2]}`);
    }
    const inj=src.match(/injuryRisk[^;]*?injuryRisk\s*([+-])\s*(\d+)/);
    if(inj) bits.push(`ryzyko urazu ${inj[1]==='+'?'+':'-'}${inj[2]} p.p.`);
    const market=src.match(/marketBonus[^;]*?\+\s*(\d+)/);
    if(market) bits.push(`szansa na ambitniejszą ofertę +${market[1]} p.p. tego lata`);
    if(/loanMove\(/.test(src)) bits.push('możliwe wypożyczenie');
    else if(/moveClub\(|regionalReturn\(|findTransferClub|findLowerClub|findPlayableClub/.test(src)) bits.push('możliwa zmiana klubu');
    if(/loyalty\s*\+=/.test(src)) bits.push('lojalność rośnie');
    if(/loyalty--|loyalty\s*-/.test(src)) bits.push('lojalność spada');
    return bits.length?bits.join(' • '):'Brak bezpośredniej zmiany OVR; wpływ głównie na dalszą historię kariery.';
  }

  function choiceStakeText(ch){
    const p=ovrProfileForChoice(ch);
    const effects=extractEffectSummary(ch);
    if(!p) return effects;
    if(p.outcomes){
      const parts=p.outcomes.map(([pct,delta])=>`${pct}% → ${delta>0?'+':''}${delta===0?'bez zmian':delta}`);
      return `${p.name} • OVR: ${parts.join(' • ')} • ${effects}`;
    }
    return `${p.name} • OVR: ${p.up}% → +${p.upDelta} • ${p.flat}% → bez zmian • ${p.down}% → ${p.downDelta} • ${effects}`;
  }

  function applyChoiceOvrRoll(ch){
    const p=ovrProfileForChoice(ch);
    if(!p) return null;
    const before=state.overall;
    const r=rand(1,100);
    let delta=0, band='NEUTRALNIE';

    if(p.outcomes){
      let cursor=0;
      for(const [pct,d] of p.outcomes){
        cursor+=pct;
        if(r<=cursor){ delta=d; break; }
      }
      band=delta>0?'SUKCES':delta<0?'PORAŻKA':'NEUTRALNIE';
    } else {
      if(r<=p.up){ delta=p.upDelta; band='SUKCES'; }
      else if(r>p.up+p.flat){ delta=p.downDelta; band='PORAŻKA'; }
    }

    state.overall=clamp(state.overall+delta,1,overallCap());
    noteLegendOverallChange(before);
    const result=state.overall>before?`OVR ${before} → ${state.overall}`:state.overall<before?`OVR ${before} → ${state.overall}`:`OVR bez zmian (${state.overall})`;
    log('Skutek decyzji', `Rzut ${r}/100 • ${band} • ${result}`);
    return {roll:r,band,delta,before,after:state.overall,result,profile:p};
  }

  function projectedStartChance(club, extraBoost=0){
    const qualityGap=state.overall-club.strength;
    // Lojalność jest relacją z AKTUALNYM klubem: znajomość systemu, zaufanie sztabu,
    // pozycja w szatni. Nie przenosi się w pełnej wartości po transferze.
    const loyaltyBonus=(state.club && club.name===state.club.name) ? Math.min(7,Math.max(0,state.loyalty)*.65) : 0;
    const raw=
      // Dawna regularność dawała przeciętnie ok. +1 p.p.; stała 48 zachowuje
      // dotychczasowy średni poziom szans po usunięciu tej martwej cechy.
      48+qualityGap*4+(state.professionalism-50)*.18+extraBoost+loyaltyBonus;
    // Przy gigantycznej różnicy poziomu dopuszczamy faktyczne 1%, zamiast
    // sztucznej podłogi 4%. Dla normalnych relacji zawodnik–klub zachowujemy
    // dotychczasowe minimum, więc zmiana nie rozlewa się na całą grę.
    const minimum=qualityGap<=-25?1:4;
    return Math.round(clamp(raw,minimum,97));
  }

  // Rzeczywisty rozmiar ligi wyznacza długość sezonu. Żadna liga nie jest
  // sztucznie rozciągana: grupa może mieć 9, 10, 12, 16 czy 18 klubów.
  function leagueSeasonTeamCount(club=state?.club){
    if(!club||club.noClub)return 0;
    const key=worldCompetitionKey(club);
    const peers=worldScopeClubs(isForeignClub(club)?'foreign':'poland',isForeignClub(club)?club.country:null)
      .filter(candidate=>worldCompetitionKey(candidate)===key);
    return peers.length;
  }
  function leagueSeasonMatchCount(club=state?.club){
    const teams=leagueSeasonTeamCount(club);
    return teams>=2?(teams-1)*2:0;
  }
  function scaledLeagueCount(reference,club=state?.club,minimum=0){
    const matches=leagueSeasonMatchCount(club);
    if(matches<=0)return 0;
    return Math.max(minimum,Math.round(reference*matches/34));
  }
  function leagueProductionScale(club=state?.club){
    return leagueSeasonMatchCount(club)/34;
  }
  function leagueEquivalentCount(actual,club=state?.club){
    const scale=leagueProductionScale(club);
    return scale>0?actual/scale:0;
  }

  function qualityGapStartChanceCap(qualityGap){
    if(qualityGap<=-40) return 2;
    if(qualityGap<=-30) return 5;
    if(qualityGap<=-22) return 10;
    if(qualityGap<=-15) return 22;
    if(qualityGap<=-10) return 38;
    return 97;
  }

  function rollSeasonAppearances(startChance,breakthrough=false,club=state?.club){
    const matches=leagueSeasonMatchCount(club);
    // Jedna próba na każdy prawdziwy mecz ligowy. Wszystkie dodatki są
    // skalowane względem 34 kolejek ligi osiemnastozespołowej.
    let apps=0;
    for(let matchday=0;matchday<matches;matchday++){
      if(Math.random()*100<startChance) apps++;
    }
    const rotationMax=startChance>=20?scaledLeagueCount(5,club):startChance>=10?scaledLeagueCount(2,club):0;
    const rotationBonus=rotationMax?rand(0,rotationMax):0;
    const breakthroughBonus=breakthrough?scaledLeagueCount(2,club):0;
    return clamp(apps+rotationBonus+breakthroughBonus,0,matches);
  }

  function careerSeasonAppsFloor(qualityGap,breakthrough=false,club=state?.club){
    if(breakthrough || qualityGap>=-8) return scaledLeagueCount(28,club);
    if(qualityGap>=-15) return scaledLeagueCount(20,club);
    if(qualityGap>=-22) return scaledLeagueCount(12,club);
    return 0;
  }


  function environmentTierBase(tier){
    // To nie jest już bezpośredni bonus OVR. Wyższy poziom klubu oznacza
    // lepszy POZIOM TRENINGU, a osobne środowisko opisuje dopasowanie.
    return ({1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0}[tier] ?? 0);
  }

  function rollClubEnvironment(club, age){
    // ŚRODOWISKO = trener, szatnia, dopasowanie, codzienny komfort pracy.
    // POZIOM TRENINGU jest liczony osobno z tieru klubu.
    // Niższe ligi mają szerszy rozrzut organizacyjny: można trafić na
    // fantastycznie zgraną ekipę, ale też na kompletny chaos.
    const cultureRange=club.tier<=2?[-16,14]:club.tier===3?[-15,14]:club.tier===4?[-14,13]:[-12,12];
    let score=rand(cultureRange[0],cultureRange[1]);

    // Adaptacja jest tylko jedną ze składowych, nie gwarancją dobrego środowiska.
    score += Math.round((state.adaptability-60)/14);

    // Lojalność pomaga tylko w aktualnym klubie: znasz ludzi, system i swoją pozycję.
    if(state.club && club.name===state.club.name){
      // Maksymalnie +4: lojalność pomaga, ale nawet klubowy symbol może
      // trafić na toksyczny rok, zmianę trenera czy rozwaloną szatnię.
      score += Math.min(4,Math.floor(Math.max(0,state.loyalty)/3));
    }

    // Wielki klub daje młodemu większą wariancję dopasowania:
    // możesz trafić na świetnego trenera albo kompletnie zginąć w tłumie.
    if(age<=23 && club.tier>=6) score += rand(-4,4);

    let label='NEUTRALNE', injuryMod=0, growthFactor=1, negativeRisk=6;
    if(score<=-10){
      label='TOKSYCZNE'; injuryMod=4; growthFactor=.35; negativeRisk=28;
    } else if(score<=-4){
      label='TRUDNE'; injuryMod=2; growthFactor=.65; negativeRisk=15;
    } else if(score<=4){
      label='NEUTRALNE'; injuryMod=0; growthFactor=1; negativeRisk=6;
    } else if(score<=9){
      label='DOBRE'; injuryMod=-1; growthFactor=1.20; negativeRisk=3;
    } else if(score<=14){
      label='ŚWIETNE'; injuryMod=-2; growthFactor=1.45; negativeRisk=1;
    } else {
      label='WYJĄTKOWE'; injuryMod=-3; growthFactor=1.65; negativeRisk=0;
    }

    return {score,label,injuryMod,growthFactor,negativeRisk};
  }

  function trainingLevelLabel(tier){
    return ({
      1:'lokalny',
      2:'regionalny',
      3:'III liga',
      4:'II liga',
      5:'I liga',
      6:'Ekstraklasa',
      7:'mocna zagranica',
      8:'europejska czołówka'
    })[tier] || 'nieznany';
  }

  function baseEnvironmentLearning(age,tier){
    // To jest sedno "młody uczy się wyżej nawet bez minut".
    // Tier zwiększa szansę na naukę; wraz z wiekiem efekt gwałtownie maleje.
    let plus1=0, plus2=0;

    if(age<=18){
      plus1=6+tier*3.5;
      plus2=Math.max(0,tier-3)*1.35;
    } else if(age<=21){
      plus1=5+tier*3.0;
      plus2=Math.max(0,tier-4)*1.25;
    } else if(age<=24){
      plus1=3+tier*2.5;
      plus2=Math.max(0,tier-5)*.8;
    } else if(age<=27){
      plus1=2+tier*1.55;
    } else if(age<=30){
      plus1=1+tier*1.05;
    } else if(age<=33){
      plus1=.5+tier*.65;
    } else if(age<=36){
      plus1=Math.max(.5,tier*.28);
    } else {
      plus1=.5;
    }

    return {plus1,plus2};
  }

  function rollEnvironmentGrowth(env,age,tier){
    const base=baseEnvironmentLearning(age,tier);

    const difficultyGrowthFactor=isEasy()?1.25:1;
    let plus1=base.plus1*env.growthFactor*difficultyGrowthFactor;
    let plus2=base.plus2*env.growthFactor*difficultyGrowthFactor;

    // Niższy poziom ma nie tylko słabszy upside treningowy, ale również
    // większą szansę złych nawyków / słabego szkolenia / organizacyjnego chaosu.
    // Dobra szatnia i trener potrafią to prawie całkowicie skompensować.
    const tierNegativeBase=({1:10,2:7,3:5,4:3,5:1,6:0,7:0,8:0}[tier] ?? 0);
    const cultureShield=
      env.label==='WYJĄTKOWE'?0:
      env.label==='ŚWIETNE'?.20:
      env.label==='DOBRE'?.45:
      env.label==='NEUTRALNE'?.75:1;
    let minus1=(env.negativeRisk + tierNegativeBase*cultureShield)*(isEasy()?.65:1);

    // ŚWIETNE i WYJĄTKOWE środowisko może utrzymać albo rozwinąć gracza,
    // ale nie może samo z siebie odebrać mu OVR.
    if(env.label==='ŚWIETNE' || env.label==='WYJĄTKOWE') minus1=0;

    // Toksyczna szatnia może co najwyżej nie zaszkodzić. Nigdy nie daje
    // dodatniego rozwoju OVR, niezależnie od wieku i poziomu rozgrywek.
    if(env.label==='TOKSYCZNE'){
      plus1=0;
      plus2=0;
    }

    // Po 30. roku życia dobre środowisko pomaga raczej utrzymać poziom niż "uczyć".
    if(age>=35){
      plus1*=.30;
      plus2=0;
      // Weteran jest bardziej podatny na negatywny wpływ złego środowiska.
      minus1*=1.15;
    } else if(age>=31){
      plus1*=.75;
      plus2=0;
    }

    plus1=clamp(Math.round(plus1),0,62);
    plus2=clamp(Math.round(plus2),0,14);
    minus1=clamp(Math.round(minus1),0,35);

    // Pilnujemy pełnego rozkładu 100%.
    const total=plus1+plus2+minus1;
    if(total>82){
      const scale=82/total;
      plus1=Math.round(plus1*scale);
      plus2=Math.round(plus2*scale);
      minus1=Math.round(minus1*scale);
    }
    const flat=100-plus1-plus2-minus1;

    const roll=rand(1,100);
    let delta=0;
    if(roll<=minus1) delta=-1;
    else if(roll<=minus1+flat) delta=0;
    else if(roll<=minus1+flat+plus1) delta=1;
    else delta=2;

    return {
      delta,roll,
      probabilities:{minus1,flat,plus1,plus2},
      trainingLevel:trainingLevelLabel(tier)
    };
  }

  function competitionBonus(tier, apps, club=null){
    // Minuty na wyższym poziomie są cenniejsze, ale bonus jest celowo mały.
    let perGame=({1:0,2:.03,3:.05,4:.10,5:.16,6:.24,7:.27,8:.32}[tier] ?? 0);
    if(isForeignClub(club)) perGame=({4:.24,3:.28,2:.33,1:.37})[club.foreignTier]||perGame;
    return Math.min(10, leagueEquivalentCount(apps,club||state.club)*perGame);
  }

  function breakthroughChance(baseStartChance, form, env, club){
    if(state.age>25 || baseStartChance>=45) return 0;
    let chance=1;
    if(form.key==='good') chance+=3;
    if(form.key==='great') chance+=9;
    if(form.key==='career') chance+=20;
    if(state.professionalism>=75) chance+=3;
    if(state.adaptability>=75) chance+=2;
    if(state.club && club.name===state.club.name) chance+=Math.min(3,Math.floor(Math.max(0,state.loyalty)/4));
    if(club.tier>=6) chance+=2;

    // Młody wyraźnie poniżej poziomu mocnego klubu to specjalny zakład:
    // częściej straci rok, ale istnieje realna szansa, że jedna okazja zmieni hierarchię.
    const challenge=club.strength-state.overall;
    if(state.age<=23 && club.tier>=5 && challenge>=7){
      chance += 5 + Math.min(7,Math.floor((challenge-7)/2));
    }
    return clamp(chance,1,42);
  }

  function clubEnvironmentPreview(club){
    const challenge=club.strength-state.overall;
    if(state.age<=23 && club.tier>=5 && challenge>=7)
      return 'HIGH RISK / HIGH REWARD • możesz stracić rok na ławce, ale wysoki poziom treningu nadal daje młodemu osobny rzut rozwojowy';
    if(isForeignClub(club)) return `${foreignTierName(club.foreignTier)} • ${club.league||'liga krajowa'} • wysoki poziom treningu i konkurencji`;
    if(club.tier===6) return 'wysoki poziom treningu • młody może rozwijać się także przy małej liczbie minut • mocna konkurencja';
    if(club.tier===5) return 'dobry poziom treningu • rozsądny balans minut i presji';
    if(club.tier===4) return 'solidne środowisko • minuty zwykle ważniejsze niż zaplecze';
    if(club.tier===3) return 'stabilniejszy zakład na minuty • zaplecze rozwojowe bywa nierówne';
    return 'najważniejsze są minuty • jakość środowiska może mocno się wahać';
  }


  function poisson(lambda){
    if(lambda<=0) return 0;
    const L=Math.exp(-lambda);
    let k=0,p=1;
    do { k++; p*=Math.random(); } while(p>L && k<60);
    return k-1;
  }

  const SEASON_GRADE_LABELS=[
    'BEZNADZIEJNY','SŁABY','PONIŻEJ OCZEKIWAŃ','PRZECIĘTNY','PRZYZWOITY',
    'DOBRY','ŚWIETNY','WYBITNY','HISTORYCZNY'
  ];

  const CLUB_LEGEND_TIERS=[
    {key:'remembered',label:'Pamiętany',minSeasons:5,minPoints:125,minGreatSeasons:1},
    {key:'fan',label:'Ulubieniec kibiców',minSeasons:8,minPoints:200,minGreatSeasons:2},
    {key:'alltime11',label:'Jedenastka wszechczasów klubu',minSeasons:10,minPoints:300,minOutstandingSeasons:2,requiresClubOvr:true},
    {key:'retiredNumber',label:'Zastrzeżony numer',minSeasons:15,minPoints:450,minOutstandingSeasons:3,requiresClubOvr:true},
    {key:'stadium',label:'Stadion Twojego imienia',minSeasons:20,minPoints:650,minOutstandingSeasons:3,minHistoricSeasons:1,requiresClubOvr:true}
  ];

  function clubTrophyLegacyPoints(name){
    if(/Liga Mistrzów|Copa Libertadores/i.test(name)) return 40;
    if(/Liga Europy|Liga Konferencji|Champions League|Champions Cup|Copa Sudamericana/i.test(name)) return 30;
    if(/Mistrzostwo Polski|^Mistrzostwo:/i.test(name)) return 24;
    if(/^Mistrzostwo ligi:/i.test(name)) return 20;
    if(/Puchar Polski|^Puchar kraju/i.test(name)) return 18;
    if(/^Puchar /i.test(name)) return 12;
    return 10;
  }

  function clubAwardLegacyPoints(name){
    if(/Złota Piłka/i.test(name)) return 40;
    if(/Piłkarz Roku w Polsce/i.test(name)) return 28;
    if(/^Piłkarz sezonu/i.test(name)) return 20;
    if(/^Odkrycie Roku w Polsce|^Młody piłkarz sezonu/i.test(name)) return 12;
    if(/^Król strzelców/i.test(name)) return 12;
    if(/^Jedenastka sezonu/i.test(name)) return 10;
    return 8;
  }

  function calculateClubSeasonPoints(club,grade,minutes,clubResult){
    const minuteShare=clamp(minutes/(Math.max(1,leagueSeasonMatchCount(club))*90),0,1);
    const participation=Math.round(minuteShare*12);
    const gradePoints=[0,1,2,4,6,10,16,25,40][grade.index]||0;
    const place=clubResult?.place||99;
    const teams=clubResult?.teams||18;
    const tablePoints=place===1?18:place<=3?10:place<=Math.ceil(teams/2)?4:0;
    const promotionPoints=clubResult?.promoted?15:0;
    const trophyPoints=(state.trophyHistory||[])
      .filter(t=>t.year===state.seasonYear && t.club===club.name && t.clubCredit)
      .reduce((sum,t)=>sum+clubTrophyLegacyPoints(t.name),0);
    const awardPoints=(state.awardHistory||[])
      .filter(a=>a.year===state.seasonYear && a.club===club.name)
      .reduce((sum,a)=>sum+clubAwardLegacyPoints(a.name),0);
    const points=participation+gradePoints+tablePoints+promotionPoints+trophyPoints+awardPoints;
    return {points,participation,gradePoints,tablePoints,promotionPoints,trophyPoints,awardPoints};
  }

  function clubLegendStatus(){
    const grouped=new Map();
    (state.careerSeasons||[]).forEach(season=>{
      if(!season.club || season.club==='Bez klubu') return;
      if(!grouped.has(season.club)) grouped.set(season.club,{
        club:season.club,seasons:0,points:0,bestSeason:null,peakOvr:0,reachedClubOvr:false,
        greatSeasons:0,outstandingSeasons:0,historicSeasons:0
      });
      const row=grouped.get(season.club);
      row.seasons++;
      row.points+=season.clubPoints||0;
      const seasonPeak=Math.max(season.ovrBefore||0,season.ovrAfter||0);
      row.peakOvr=Math.max(row.peakOvr,seasonPeak);
      if(Number.isFinite(season.clubStrength) && seasonPeak>=season.clubStrength) row.reachedClubOvr=true;
      if((season.gradeIndex??-1)>=6) row.greatSeasons++;
      if((season.gradeIndex??-1)>=7) row.outstandingSeasons++;
      if((season.gradeIndex??-1)>=8) row.historicSeasons++;
      if(!row.bestSeason || (season.gradeIndex??-1)>(row.bestSeason.gradeIndex??-1)) row.bestSeason=season;
    });
    return [...grouped.values()].map(row=>{
      const tiers=CLUB_LEGEND_TIERS.filter(t=>
        row.seasons>=t.minSeasons &&
        row.points>=t.minPoints &&
        row.greatSeasons>=(t.minGreatSeasons||0) &&
        row.outstandingSeasons>=(t.minOutstandingSeasons||0) &&
        row.historicSeasons>=(t.minHistoricSeasons||0) &&
        (!t.requiresClubOvr || row.reachedClubOvr)
      );
      return {...row,tiers};
    }).filter(row=>row.tiers.length>0).sort((a,b)=>b.points-a.points);
  }

  function updateClubLegendMilestones(clubName){
    const row=clubLegendStatus().find(x=>x.club===clubName);
    if(!row) return '';
    state.clubLegendMilestones=state.clubLegendMilestones||{};
    const previous=new Set(state.clubLegendMilestones[clubName]||[]);
    const fresh=row.tiers.filter(t=>!previous.has(t.key));
    state.clubLegendMilestones[clubName]=row.tiers.map(t=>t.key);
    fresh.forEach(t=>log(`${t.label}: ${clubName}`,`${row.points} punktów klubowej legendy • ${row.seasons} sezonów`));
    return fresh.length?fresh.map(t=>`⭐ ${clubName}: ${t.label}`).join(' • '):'';
  }

  const lerp=(a,b,t)=>a+(b-a)*t;

  function formPositionText(position){
    if(position<.18) return 'sam dół przedziału';
    if(position<.40) return 'dolna część przedziału';
    if(position<.62) return 'środek przedziału';
    if(position<.84) return 'górna część przedziału';
    return 'sam szczyt przedziału';
  }

  function goalkeeperSeasonQuality(apps,goalsConceded,cleanSheets){
    if(apps<=0) return 0;
    const concededPerGame=goalsConceded/apps;
    const cleanSheetRate=cleanSheets/apps;
    // Bramkarza ocenia przede wszystkim to, co obronił: 0,8 gola na mecz
    // i 40% czystych kont to poziom kandydata do miana bramkarza sezonu.
    const concededQuality=clamp((1.75-concededPerGame)/1.20,0,1);
    const cleanSheetQuality=clamp((cleanSheetRate-.06)/.38,0,1);
    return clamp(concededQuality*.65+cleanSheetQuality*.35,0,1);
  }

  function goalkeeperBalanceLabel(quality){
    if(quality>=.82) return 'bilans na poziomie kandydata do miana bramkarza sezonu';
    if(quality>=.68) return 'bardzo dobry sezon między słupkami';
    if(quality>=.52) return 'solidny bilans bramkarski';
    if(quality>=.36) return 'nierówny sezon bramkarski';
    return 'słaby bilans bramkarski';
  }

  function minuteGradeCap(minutes,apps=Math.round(minutes/90),position=state.position){
    const maxMinutes=Math.max(1,leagueSeasonMatchCount(state.club))*90;
    const share=clamp(minutes/maxMinutes,0,1);
    if(position==='GK'){
      if(apps===0) return {share,cap:0,text:'Stracony sezon — nie zagrałeś ani jednego meczu.'};
      if(apps<scaledLeagueCount(3,state.club,1)) return {share,cap:2,text:'Pojedyncze występy nie wystarczą do oceny całego sezonu.'};
      if(apps<scaledLeagueCount(6,state.club,1)) return {share,cap:4,text:'Bardzo mała liczba występów ograniczyła ocenę sezonu.'};
      if(apps<scaledLeagueCount(10,state.club,1)) return {share,cap:5,text:'Bilans ma znaczenie, ale przy tej liczbie meczów próba jest jeszcze mała.'};
      if(apps<scaledLeagueCount(15,state.club,1)) return {share,cap:6,text:'Dobry bilans może dać ŚWIETNY sezon, lecz potrzeba proporcjonalnie dużej części spotkań ligi.'};
      if(apps<scaledLeagueCount(25,state.club,1)) return {share,cap:7,text:'Znakomity bilans może dać sezon WYBITNY, ale HISTORYCZNY wymaga jeszcze większego udziału.'};
      return {share,cap:8,text:''};
    }
    if(share<.05) return {share,cap:0,text:'Stracony sezon — praktycznie nie grałeś.'};
    if(share<.15) return {share,cap:2,text:'Bardzo mało minut ograniczyło ocenę sezonu.'};
    if(share<.25) return {share,cap:4,text:'Mała rola w drużynie ograniczyła ocenę sezonu.'};
    if(share<.40) return {share,cap:6,text:'Liczba minut nie pozwoliła wejść wyżej niż ŚWIETNY.'};
    if(share<.55) return {share,cap:7,text:'Do oceny HISTORYCZNEJ zabrakło udziału w sezonie.'};
    return {share,cap:8,text:''};
  }

  // Wyjątkowe, rzeczywiście uzyskane liczby mogą przebić typowy sufit
  // wylosowanej dyspozycji. Działa to tylko dla ofensywnych pozycji i tylko
  // przy naprawdę dominującej produkcji; zwykły „normalny” sezon nadal
  // pozostaje w swoim dotychczasowym zakresie.
  function exceptionalProductionFloor(form,production,apps,minutes,seasonTier){
    if(!production?.hasVisibleProduction)
      return {index:-1,label:null,metric:0,threshold:0,text:''};
    if(state.position==='GK'
      ?apps<scaledLeagueCount(10,state.club,1)
      :(apps<scaledLeagueCount(15,state.club,1)||minutes<scaledLeagueCount(10,state.club,1)*90))
      return {index:-1,label:null,metric:0,threshold:0,text:''};

    // W niższych ligach do tego samego wyróżnienia potrzeba nieco większych
    // liczb, na szczycie — nieco mniejszych. I liga jest punktem odniesienia.
    const levelScale=seasonTier<=2?1.40:seasonTier===3?1.25:seasonTier===4?1.12:seasonTier===5?1:seasonTier===6?.92:.86;
    const seasonScale=Math.max(.01,leagueProductionScale(state.club));
    let metric=0;
    let greatThreshold=0;
    let outstandingThreshold=0;
    if(state.position==='GK'){
      metric=production.goalkeeperGradeQuality??goalkeeperSeasonQuality(apps,production.goalsConceded,production.cleanSheets);
      greatThreshold=.68;
      outstandingThreshold=.82;
    } else if(state.position==='FWD'){
      metric=production.goals+production.assists*.70;
      greatThreshold=23*levelScale*seasonScale;
      outstandingThreshold=32*levelScale*seasonScale;
    } else {
      metric=production.goals*1.15+production.assists;
      greatThreshold=19*levelScale*seasonScale;
      outstandingThreshold=28*levelScale*seasonScale;
    }

    let index=-1;
    let threshold=0;
    if(metric>=outstandingThreshold && (state.position!=='GK'||apps>=scaledLeagueCount(15,state.club,1))){ index=7; threshold=outstandingThreshold; }
    else if(metric>=greatThreshold){ index=6; threshold=greatThreshold; }
    if(index<0) return {index,label:null,metric,threshold:greatThreshold,text:''};

    // Dyspozycja nadal jest szkieletem sezonu. Wielkie liczby mogą uratować
    // słaby rok, ale HISTORYCZNY pozostaje domeną sezonu życia, a normalna
    // dyspozycja nie wskakuje od samych statystyk wyżej niż ŚWIETNY.
    const formCap=state.position==='GK'?7:({crisis:4,poor:5,normal:6,good:7,great:7,career:8}[form.key]??6);
    index=Math.min(index,formCap);
    return {
      index,label:SEASON_GRADE_LABELS[index],metric,threshold,
      text:state.position==='GK'
        ?`${production.goalsConceded} straconych goli i ${production.cleanSheets} czystych kont w ${apps} meczach oznacza ${goalkeeperBalanceLabel(metric)} i podnosi ocenę co najmniej do ${SEASON_GRADE_LABELS[index]}.`
        :`Wyjątkowa produkcja ofensywna (${production.goals} G / ${production.assists} A) podniosła ocenę co najmniej do ${SEASON_GRADE_LABELS[index]}.`
    };
  }

  function evaluateSeasonGrade(form,production,apps,minutes,club,seasonTier){
    const [pairLow,pairHigh]=form.gradePair;
    const [boundLow,boundHigh]=form.gradeBounds;
    // Pozycja w przedziale buduje środek pary, ale nie przykuwa oceny do
    // jednego końca. Dzięki temu skrajny rzut produkcji wciąż może uratować
    // ledwo złapaną dyspozycję — bez przeskakiwania kilku poziomów.
    const baseScore=pairLow+.20+.70*form.position;

    // Produkcja wybiera głównie miejsce w parze i przy skrajności może liznąć
    // jeden sąsiedni stopień. Twarde granice dyspozycji blokują dalsze skoki.
    const productionDelta=production.gradeQuality-.5;
    // Słaba produkcja nadal boli, ale nie spycha już oceny równie łatwo jak
    // dobra produkcja ją podnosi. „SŁABY” ma oznaczać faktycznie zły rok.
    const productionNudge=productionDelta<0?productionDelta*1.40:productionDelta*2;
    const skillGap=state.overall-club.strength;
    const levelBonus=competitionBonus(seasonTier,apps,club);
    const contextNudge=clamp(skillGap/30+levelBonus/30,-.20,.35);
    const rawScore=baseScore+productionNudge+contextNudge;
    const dispositionIndex=clamp(Math.round(rawScore),boundLow,boundHigh);
    const productionFloor=exceptionalProductionFloor(form,production,apps,minutes,seasonTier);
    const beforeMinutesIndex=Math.max(dispositionIndex,productionFloor.index);
    const liftedByOutput=beforeMinutesIndex>dispositionIndex;

    const minuteLimit=minuteGradeCap(minutes,apps,state.position);
    const finalIndex=Math.min(beforeMinutesIndex,minuteLimit.cap);
    const limitedByMinutes=finalIndex<beforeMinutesIndex;
    const pairText=`${SEASON_GRADE_LABELS[pairLow]} / ${SEASON_GRADE_LABELS[pairHigh]}`;
    const explanationParts=[];
    if(liftedByOutput) explanationParts.push(productionFloor.text);
    if(limitedByMinutes) explanationParts.push(minuteLimit.text);

    return {
      index:finalIndex,
      label:SEASON_GRADE_LABELS[finalIndex],
      dispositionIndex,
      dispositionLabel:SEASON_GRADE_LABELS[dispositionIndex],
      beforeMinutesIndex,
      beforeMinutesLabel:SEASON_GRADE_LABELS[beforeMinutesIndex],
      baseScore,productionNudge,contextNudge,rawScore,skillGap,levelBonus,
      pairLow,pairHigh,pairText,
      productionFloor,liftedByOutput,
      minuteShare:minuteLimit.share,
      minuteCap:minuteLimit.cap,
      minuteCapLabel:SEASON_GRADE_LABELS[minuteLimit.cap],
      limitedByMinutes,
      explanation:explanationParts.join(' ')
    };
  }

  function seasonAgeContext(form,grade,apps,breakthrough=false){
    const age=state.age;
    const formKey=form.originalKey||form.key;
    const strongForm=['good','great','career'].includes(formKey);
    const playedLittle=state.position==='GK'
      ?apps<scaledLeagueCount(10,state.club,1)
      :(apps<scaledLeagueCount(10,state.club,1)||(grade.minuteShare||0)<.25);
    const trainingText=formKey==='great'||formKey==='career'
      ?'Na treningach wyglądałeś bardzo dobrze'
      :formKey==='good'
        ?'Na treningach wyglądałeś dobrze'
        :formKey==='normal'
          ?'Na treningach wyglądałeś przyzwoicie'
          :'Także na treningach nie dawałeś sztabowi wielu argumentów';
    if(age<=20){
      if(apps===0) return `Masz ${age} lat — brak gry oznacza stracony rok, ale nie przekreśla dopiero zaczynającej się kariery.`;
      if(playedLittle&&breakthrough) return `Masz ${age} lat. ${trainingText} i dostałeś pierwszą serię szans, ale nie utrzymałeś jeszcze regularnego miejsca w składzie.`;
      if(playedLittle&&strongForm) return `Masz ${age} lat. ${trainingText}, ale nie przebiłeś się jeszcze do regularnej gry; na razie jest to obietnica, a nie pełny seniorski sezon.`;
      if(playedLittle) return `Masz ${age} lat. ${trainingText}, lecz nie przebiłeś się jeszcze do regularnej gry. Niewielka rola może być częścią wejścia w seniorską piłkę, ale ogranicza ocenę tego sezonu.`;
      if(grade.index>=5) return `Tak udany pełny sezon w wieku ${age} lat jest mocnym wejściem w seniorską piłkę.`;
    }
    if(age<=23){
      if(apps===0) return `W wieku ${age} lat sezon bez gry zabrał ważny rok rozwoju.`;
      if(playedLittle&&breakthrough) return `W wieku ${age} lat dostałeś przełomową serię szans, ale nie wywalczyłeś jeszcze stałego miejsca w składzie.`;
      if(playedLittle&&strongForm) return `W wieku ${age} lat ${trainingText.toLowerCase()}, lecz nie przebiłeś się do regularnej gry. Potencjał był widoczny, pełnego sezonu jeszcze nie było.`;
      if(playedLittle) return `W wieku ${age} lat ${trainingText.toLowerCase()}, ale nie wywalczyłeś regularnego miejsca. Te minuty są doświadczeniem, nie przełomem.`;
    }
    if(age>=39){
      if(apps===0) return `W wieku ${age} lat sezon bez występu jest już wyraźnym sygnałem, że kariera dobiega końca.`;
      if(grade.limitedByMinutes&&strongForm) return `W wieku ${age} lat wysoka forma wciąż była widoczna, lecz mała rola nie pozwoliła zbudować z niej pełnego sezonu.`;
      if(grade.limitedByMinutes) return `W wieku ${age} lat coraz trudniej odzyskać miejsce w składzie, a ograniczona rola waży szczególnie mocno.`;
      if(grade.index>=5) return `Udany sezon w wieku ${age} lat potwierdza, że wciąż potrafisz grać na wysokim poziomie.`;
    }
    if(age>=34){
      if(apps===0) return `W wieku ${age} lat cały sezon bez gry jest poważnym cofnięciem kariery.`;
      if(grade.limitedByMinutes&&strongForm) return `W wieku ${age} lat forma dopisywała, ale zabrakło regularnej roli, by sezon został oceniony równie wysoko.`;
      if(grade.limitedByMinutes) return `Na tym etapie kariery mała liczba minut oznacza wyraźnie stracony sezon.`;
      if(grade.index>=6) return `Tak mocny sezon w wieku ${age} lat ma dodatkową wagę — utrzymałeś poziom mimo upływu czasu.`;
    }
    if(grade.limitedByMinutes) return `Jesteś w najlepszym piłkarskim wieku, dlatego tak mała rola oznacza przede wszystkim niewykorzystany sezon.`;
    return '';
  }

  function seasonGradeNarrative(form,production,grade,apps,minutes,club,availabilityNote='',breakthrough=false){
    const final=grade.label;
    const numbersPct=Math.round((production.gradeQuality||0)*100);
    const share=Math.round((grade.minuteShare||0)*100);
    const ageText=seasonAgeContext(form,grade,apps,breakthrough);

    if(apps===0){
      const reason=availabilityNote?`${availabilityNote.replace(/\.$/,'')}. `:'';
      return `${reason}Nie zagrałeś ani jednego meczu, więc nie było podstaw do sportowej oceny ani premii OVR za formę. ${ageText} Sezon kończy się jako ${final}.`;
    }

    if(state.position==='GK'){
      const concededPerGame=production.goalsConceded/apps;
      const cleanRate=production.cleanSheets/apps;
      const balance=goalkeeperBalanceLabel(production.goalkeeperGradeQuality||0);
      const facts=`${production.goalsConceded} straconych goli w ${apps} meczach (${concededPerGame.toFixed(2).replace('.',',')} na mecz) i ${production.cleanSheets} czystych kont (${Math.round(cleanRate*100)}%)`;
      const suffix=ageText?` ${ageText}`:'';
      if(grade.liftedByOutput) return `${facts} to ${balance}. Rzeczywisty bilans był ważniejszy od wstępnej formy i podniósł ocenę do ${final}.${suffix}`;
      if(grade.limitedByMinutes) return `${facts} oznacza ${balance}, ale mała liczba występów nie pozwoliła ocenić sezonu wyżej niż ${final}.${suffix}`;
      if((production.goalkeeperGradeQuality||0)>=.68) return `${facts} oznacza ${balance}. Dlatego sezon bramkarza otrzymuje ocenę ${final}.${suffix}`;
      if((production.goalkeeperGradeQuality||0)<.36) return `${facts} składa się na ${balance}; to on, a nie sam rzut formy, sprowadził ocenę do ${final}.${suffix}`;
      return `${facts} daje ${balance}. Po uwzględnieniu liczby występów końcowa ocena to ${final}.${suffix}`;
    }

    const formText={
      crisis:'Miałeś KRYZYS — punkt wyjścia do oceny sezonu był najniższy.',
      poor:'Miałeś SŁABĄ formę — przez większość sezonu grałeś poniżej swojego zwykłego poziomu.',
      normal:'Miałeś NORMALNĄ formę — punkt wyjścia był przeciętny.',
      good:'Miałeś DOBRĄ formę — punkt wyjścia był wyraźnie powyżej normy.',
      great:'Miałeś ŚWIETNĄ formę — punkt wyjścia był bardzo wysoki.',
      career:'Miałeś SEZON ŻYCIA — punkt wyjścia był najwyższy.'
    }[form.key]||`Miałeś formę na poziomie ${form.label}.`;
    const outputText=numbersPct>=62
      ?'Dobrze wykorzystałeś swoje okazje i wypracowałeś mocne liczby.'
      :numbersPct<40
        ?'Mogłeś mieć jeszcze lepsze liczby, ale czegoś zabrakło.'
        :'Liczby były solidne, choć bez wyraźnego przełomu.';
    const changeText=grade.liftedByOutput
      ?`Podniosły ocenę z ${grade.dispositionLabel} do ${grade.beforeMinutesLabel}.`
      :grade.beforeMinutesLabel!==grade.dispositionLabel
        ?`Po uwzględnieniu liczb i poziomu rozgrywek ocena zmieniła się z ${grade.dispositionLabel} na ${grade.beforeMinutesLabel}.`
        :`Po uwzględnieniu liczb i poziomu rozgrywek ocena pozostała na poziomie ${grade.beforeMinutesLabel}.`;
    const minutesText=grade.limitedByMinutes
      ?` Zagrałeś ${minutes} minut (${share}% możliwego czasu), dlatego ocena nie mogła przekroczyć ${grade.minuteCapLabel}.`
      :'';
    return `${formText} ${outputText} ${changeText}${minutesText}${ageText?` ${ageText}`:''} Końcowa ocena sezonu: ${final}.`;
  }

  function productionRates(position){
    if(position==='GK') return {g:.001,a:.008};
    if(position==='DEF') return {g:.035,a:.055};
    if(position==='MID') return {g:.12,a:.22};
    return {g:.34,a:.13};
  }

  function rollSeasonProduction(minutes,form,club,apps=Math.round(minutes/75)){
    // Rzut jest niezależny, ale pozycja w przedziale dyspozycji przesuwa go
    // najwyżej o ±12. Nawet z samego dołu można więc wylosować świetną
    // produkcję, a z samej góry — słabą.
    const rawRoll=rand(1,100);
    const bias=Math.round((form.position-.5)*24);
    const adjustedRoll=clamp(rawRoll+bias,1,100);
    const quality=(adjustedRoll-1)/99;
    const [rangeMin,rangeMax]=form.productionRange;
    const multiplier=lerp(rangeMin,rangeMax,quality);

    const n90=minutes/90;
    const rates=productionRates(state.position);
    const footProduction=String(state.foot||'').toLocaleLowerCase('pl-PL').startsWith('lew')?1.01:1;
    const skill=clamp(.68+(state.overall-38)/48,.58,1.42);
    const opposition=clamp(1-(club.strength-state.overall)*.012,.72,1.18);
    const goalLambda=n90*rates.g*skill*multiplier*opposition*(state.finishingBias||1)*footProduction;
    const assistLambda=n90*rates.a*skill*multiplier*opposition*(state.creativeBias||1)*footProduction;
    const goals=state.position==='GK'?0:(minutes>0?poisson(goalLambda):0);
    const assists=state.position==='GK'?0:(minutes>0?poisson(assistLambda):0);
    let goalsConceded=0,cleanSheets=0,cleanSheetChance=0,expectedConceded=0;
    if(state.position==='GK'&&apps>0){
      const keeperEdge=state.overall-club.strength;
      // Stracone gole i czyste konta wynikają z jednego profilu jakości.
      // To usuwa sprzeczne bilanse w rodzaju 19 czystych kont i 39
      // straconych goli: po wylosowaniu czystych kont bramki powstają
      // wyłącznie w pozostałych spotkaniach.
      const concededPerGame=clamp((1.32-keeperEdge*.014-(quality-.5)*.75)/footProduction,.58,1.95);
      expectedConceded=apps*concededPerGame;
      cleanSheetChance=clamp((.31+keeperEdge*.0045+(quality-.5)*.22-(concededPerGame-1.18)*.10)*footProduction,.08,.50);
      for(let i=0;i<apps;i++) if(Math.random()<cleanSheetChance) cleanSheets++;
      cleanSheets=Math.min(Math.floor(apps/2),cleanSheets);
      const nonCleanMatches=apps-cleanSheets;
      const baseNonCleanMean=clamp(concededPerGame/Math.max(.35,1-cleanSheetChance),1.12,2.45);
      const coherenceMean=clamp(2.25-(cleanSheets/apps)*1.65,1.35,2.15);
      const nonCleanMean=Math.min(baseNonCleanMean,coherenceMean);
      goalsConceded=nonCleanMatches+poisson(nonCleanMatches*(nonCleanMean-1));
      goalsConceded=Math.min(goalsConceded,Math.round(nonCleanMatches*(coherenceMean+.25)));
    }

    // U napastników i pomocników ocena widzi również to, co faktycznie
    // wpadło do statystyk, nie tylko ukryty rzut produkcji. Realizacja ma
    // jednak mniejszą wagę (40%), żeby seria szczęśliwych odbić nie mogła
    // przykryć całej dyspozycji. U bramkarzy i obrońców produkcja pozostaje
    // świadomie niewidocznym wkładem pozycyjnym — bez sztucznych statystyk.
    const hasVisibleProduction=state.position==='GK'||state.position==='MID'||state.position==='FWD';
    const actualOutput=goals+assists*.7;
    const expectedOutput=goalLambda+assistLambda*.7;
    // Ocena bramkarza czyta wyłącznie to, co widać w jego bilansie.
    // Ukryte oczekiwania służą do wylosowania statystyk, ale nie mogą
    // później unieważnić np. 12 straconych bramek i 6 czystych kont w 15 meczach.
    const goalkeeperGradeQuality=state.position==='GK'
      ?goalkeeperSeasonQuality(apps,goalsConceded,cleanSheets)
      :null;
    const realizedQuality=state.position==='GK'
      ?goalkeeperGradeQuality
      :hasVisibleProduction
        ?clamp(.5+(actualOutput-expectedOutput)/(2*Math.max(2,expectedOutput)),0,1)
        :.5;
    const gradeQuality=state.position==='GK'
      ?goalkeeperGradeQuality
      :hasVisibleProduction
        ?quality*.60+realizedQuality*.40
        :quality;

    return {
      goals,assists,goalsConceded,cleanSheets,cleanSheetChance,expectedConceded,
      rawRoll,bias,adjustedRoll,quality,realizedQuality,gradeQuality,goalkeeperGradeQuality,
      hasVisibleProduction,actualOutput,expectedOutput,
      multiplier,rangeMin,rangeMax,footProduction,
      goalLambda,assistLambda,skill,opposition
    };
  }

  function calculatePerformance(apps,minutes,goals,assists,form,seasonTier,statsProduction=null){
    // Widoczne liczby są mniejsze dokładnie w proporcji długości ligi, ale
    // ocena jakości pełnego sezonu pozostaje porównywalna z ligą 18-zespołową.
    const seasonScale=Math.max(.01,leagueProductionScale(state.club));
    const n90=minutes/90/seasonScale;
    const levelBonus=competitionBonus(seasonTier,apps,state.club);
    if(state.position==='GK'){
      // U bramkarza bilans jest najważniejszy; liczba występów mówi tylko,
      // jak duża była próbka. Forma pozostaje lekkim tłem, nie drugim wynikiem.
      const quality=statsProduction?.goalkeeperGradeQuality
        ??goalkeeperSeasonQuality(apps,statsProduction?.goalsConceded||0,statsProduction?.cleanSheets||0);
      const appearanceValue=Math.min(12,leagueEquivalentCount(apps,state.club)*.48);
      return Math.max(0,quality*52+appearanceValue+levelBonus+form.performanceMod*.25);
    }
    let production=0;
    if(state.position==='DEF') production=(goals*3.1+assists*2.4)/seasonScale;
    if(state.position==='MID') production=(goals*3.1+assists*3.4)/seasonScale;
    if(state.position==='FWD') production=(goals*2.6+assists*2.2)/seasonScale;

    // Dyspozycja jest tłem. Ostateczna ocena ma przede wszystkim opisywać
    // to, co naprawdę zrobiłeś w minutach, które dostałeś.
    const minutesValue=Math.min(40,n90*1.18);
    const availabilityBonus=apps>=scaledLeagueCount(25,state.club,1)?5:apps>=scaledLeagueCount(15,state.club,1)?2:0;
    const formInfluence=form.performanceMod;
    return Math.max(0,minutesValue+Math.min(30,production)+availabilityBonus+levelBonus+formInfluence);
  }

  // v0.60 — DODATKOWA SPORTOWA WARSTWA MEDIALNOŚCI.
  // Nie zastępuje zdarzeń fabularnych ani ich nie osłabia.
  // Pełny sezon, gra w mocnym klubie i realna produkcja boiskowa
  // same budują (lub odbierają) medialność.
  function sportMediaLayer(performance,club,apps){
    let performanceMedia=0;
    if(performance>=56) performanceMedia=4;
    else if(performance>=43) performanceMedia=2;
    else if(performance>=28) performanceMedia=1;
    else if(performance<16) performanceMedia=-2;

    let clubMedia=0;
    if(isForeignClub(club)){
      clubMedia=({1:3,2:2,3:1,4:0,5:-1,6:-2,7:-3,8:-4})[club.foreignTier] ?? 0;

      // Najmocniejsze marki w obrębie tieru są jeszcze bardziej widoczne.
      if(club.foreignTier===1 && club.strength>=94) clubMedia+=1;
      else if(club.foreignTier===2 && club.strength>=87) clubMedia+=1;
      else if(club.foreignTier===3 && club.strength>=80) clubMedia+=1;
    } else {
      if(club.tier===6) clubMedia=club.strength>=76?2:1;
      else if(club.tier===5) clubMedia=0;
      else if(club.tier<=3) clubMedia=-1;
    }

    // Sam prestiż klubu działa tylko, jeśli faktycznie jesteś widoczny.
    if(clubMedia>0){
      const exposure=apps>=scaledLeagueCount(25,club,1)?1:apps>=scaledLeagueCount(15,club,1)?.75:apps>=scaledLeagueCount(8,club,1)?.4:0;
      clubMedia=Math.round(clubMedia*exposure);
    }

    let playingMedia=0;
    if(apps>=scaledLeagueCount(30,club,1)) playingMedia=2;
    else if(apps>=scaledLeagueCount(20,club,1)) playingMedia=1;
    else if(apps<scaledLeagueCount(8,club,1)) playingMedia=-2;

    const total=clamp(performanceMedia+clubMedia+playingMedia,-6,8);
    return {performanceMedia,clubMedia,playingMedia,total};
  }

  function addSportMedia(delta,reason=''){
    if(!delta) return 0;
    const before=state.recognition||0;
    state.recognition=clamp(before+delta,0,100);
    const actual=state.recognition-before;
    if(actual && reason) log(`Medialność ${actual>0?'+':''}${actual}`,reason);
    return actual;
  }

  function aclAnnualChance(age, injuryRisk){
    // Szansa ROCZNA, niezależna od zwykłego rzutu urazu.
    // Dostępna dopiero dla bardzo podatnych zawodników (40+).
    if(injuryRisk<40) return 0;

    // Sama podatność 40–42 daje połowę punktu procentowego,
    // 43–45 daje 1%. Wiek dokłada kolejne niewielkie ryzyko.
    let chance=injuryRisk>=43 ? 1.0 : 0.5;

    if(age>=40) chance+=2.0;
    else if(age>=37) chance+=1.5;
    else if(age>=34) chance+=1.0;
    else if(age>=30) chance+=0.5;

    return chance; // procent na sezon, maksymalnie 3%
  }

  function simulateSeason(){
    const club={...state.club};
    const seasonTier=club.tier;
    state.seasonClubName=club.name;
    state.seasonClubCompetition=clubCompetition(club);
    state.seasonFinished=false;
    state.seasonMatchExtras=[];
    state.justRelegated=false; state.justPromoted=false; state.justNationalCall=false;
    state.lastInjuryLost=0; state.lastInjurySeverity=null; state.lastInjuryOvrPenalty=0;
    state.seasonNationalCaps=0; state.seasonNationalGoals=0;
    state.seasonNationalGoalsConceded=0; state.seasonNationalCleanSheets=0;
    state.forceCorruptPromotion=false;

    // Udany układ z poprzedniego lata: sezon gramy normalnie, ale awans jest zapewniony.
    if(state.corruptionPlan && !state.corruptionPlan.caught && state.corruptionPlan.clubName===club.name){
      const plan=state.corruptionPlan;
      state.corruptionPlan=null;
      state.forceCorruptPromotion=true;
      log('Układ nie został wykryty.',`Rzut ${plan.roll}/100 • klub ma zapewniony awans po sezonie.`);
    }

    const qualityGap=state.overall-club.strength;
    const openingStartChance=projectedStartChance(club,state.boost);

    // Najpierw losujemy środowisko, potem niezależny od hierarchii rzut formy.
    const env=rollClubEnvironment(club,state.age);
    let form=rollSeasonForm();

    // Forma zmienia pozycję w hierarchii W TRAKCIE sezonu.
    // Dlatego rezerwowy może rozegrać mnóstwo meczów po świetnym roku.
    let startChance=clamp(openingStartChance+form.hierarchy,1,97);

    // Przełom: nawet młody rezerwowy w wielkim klubie może niespodziewanie dostać szansę.
    const bChance=breakthroughChance(openingStartChance,form,env,club);
    let breakthrough=false;
    if(bChance>0 && rand(1,100)<=bChance){
      breakthrough=true;
      startChance=clamp(startChance+rand(44,68),1,97);
      state.loyalty=15;
    }

    // Sama dyspozycja nie może zmienić zawodnika 20 OVR w regularnego gracza
    // Ekstraklasy. Wyjątkiem pozostaje istniejący młodzieżowy „przełom”.
    if(!breakthrough) startChance=Math.min(startChance,qualityGapStartChanceCap(qualityGap));

    const leagueSeasonMatches=leagueSeasonMatchCount(club);
    let apps=rollSeasonAppearances(startChance,breakthrough,club);
    // Sezon życia musi oznaczać realnie dużą rolę. Zawieszenie lub późniejszy
    // uraz nadal mogą tę liczbę obniżyć. Podłoga skaluje się jednak do realnej
    // różnicy poziomu — przy przepaści sportowej nie działa wcale.
    const careerAppsFloor=form.key==='career'?careerSeasonAppsFloor(qualityGap,breakthrough,club):0;
    if(careerAppsFloor) apps=Math.max(apps,careerAppsFloor);
    let availabilityNote='';
    const pendingAppsFactor=Number.isFinite(state.nextAppsFactor)?state.nextAppsFactor:1;
    if(pendingAppsFactor<1){
      const beforeApps=apps;
      apps=Math.floor(apps*pendingAppsFactor);
      availabilityNote=state.nextAppsReason||`Zawieszenie ograniczyło występy: ${beforeApps} → ${apps}.`;
      state.nextAppsFactor=1;
      state.nextAppsReason=null;
      state.nextAppsClubName=null;
    }
    const starter = startChance>62 || careerAppsFloor>=scaledLeagueCount(20,club);

    // v0.69 — URAZY.
    // 1) Bardzo rzadka katastrofa: zerwanie więzadeł krzyżowych.
    //    Tylko przy bazowej podatności 40+; wiek zwiększa ryzyko.
    // 2) Jeśli ACL nie wypada, wykonujemy dotychczasowy zwykły rzut urazu.
    let injury='';
    let injuryOvrPenalty=0;
    const injuryChance=clamp(state.injuryRisk+env.injuryMod,3,50);
    const aclChance=aclAnnualChance(state.age,state.injuryRisk);
    let aclHappened=false;

    if(apps>0 && aclChance>0 && rand(1,1000)<=Math.round(aclChance*10)){
      aclHappened=true;
      const lost=apps; // cały sportowo dostępny sezon przepada
      apps=0;
      injuryOvrPenalty=-2;
      state.lastInjuryLost=lost;
      state.lastInjurySeverity='ZERWANIE WIĘZADEŁ KRZYŻOWYCH';
      state.lastInjuryOvrPenalty=injuryOvrPenalty;
      state.injuryRisk=clamp(state.injuryRisk+5,5,45);
      injury=` URAZ — ZERWANIE WIĘZADEŁ KRZYŻOWYCH: cały sezon bez gry (${lost} potencjalnych występów) • skutek rozwojowy -2 OVR • roczna szansa tego urazu: ${aclChance.toFixed(1)}%.`;
      availabilityNote+=(availabilityNote?' ':'')+'Zerwanie więzadeł wykluczyło cię z całego sezonu.';
    }

    if(!aclHappened && apps>0 && rand(1,100)<=injuryChance){
      // Starszy i bardziej podatny zawodnik ma trochę większą szansę na ciężki uraz,
      // ale nawet przy wysokim ryzyku większość urazów pozostaje drobna/średnia.
      let severityRoll=rand(1,100);
      if(state.injuryRisk>=30) severityRoll+=4;
      if(state.age>=32) severityRoll+=3;
      if(state.age>=36) severityRoll+=3;

      let severity='DROBNY';
      let minLost=1, maxLost=4, riskRise=1;

      if(severityRoll>=96){
        severity='BARDZO CIĘŻKI';
        minLost=scaledLeagueCount(17,club,1); maxLost=scaledLeagueCount(28,club,1); riskRise=5; injuryOvrPenalty=-2;
      } else if(severityRoll>=83){
        severity='POWAŻNY';
        minLost=scaledLeagueCount(10,club,1); maxLost=scaledLeagueCount(16,club,1); riskRise=3; injuryOvrPenalty=-1;
      } else if(severityRoll>=56){
        severity='ŚREDNI';
        minLost=scaledLeagueCount(5,club,1); maxLost=scaledLeagueCount(9,club,1); riskRise=2;
      } else {
        minLost=scaledLeagueCount(1,club,1); maxLost=scaledLeagueCount(4,club,1);
      }

      const plannedLost=rand(minLost,maxLost);
      const lost=Math.min(apps,plannedLost);
      apps=Math.max(0,apps-lost);

      state.lastInjuryLost=lost;
      state.lastInjurySeverity=severity;
      state.lastInjuryOvrPenalty=injuryOvrPenalty;
      state.injuryRisk=clamp(state.injuryRisk+riskRise,5,45);

      injury=` URAZ — ${severity}: straciłeś ${lost} ${lost===1?'mecz':lost>=2&&lost<=4?'mecze':'meczów'}${injuryOvrPenalty?` • skutek rozwojowy ${injuryOvrPenalty} OVR`:''} (ryzyko zwykłego urazu: ${injuryChance}%).`;
      if(apps===0) availabilityNote+=(availabilityNote?' ':'')+`Uraz ${severity.toLowerCase()} zabrał wszystkie występy.`;
    }

    const pendingMinutesFactor=Number.isFinite(state.nextMinutesFactor)?state.nextMinutesFactor:1;
    if(state.position==='GK'&&pendingMinutesFactor<1){
      const beforeApps=apps;
      apps=Math.floor(apps*pendingMinutesFactor);
      availabilityNote+=(availabilityNote?' ':'')+`Kłopoty zdrowotne ograniczyły występy: ${beforeApps} → ${apps}.`;
      state.nextMinutesFactor=1;
    }
    let minutes=state.position==='GK'?apps*90:(apps===0?0:Math.round(apps*(starter?rand(68,88):rand(20,58))));
    if(state.position!=='GK'&&pendingMinutesFactor<1){
      const beforeMinutes=minutes;
      minutes=Math.floor(minutes*pendingMinutesFactor);
      availabilityNote+=(availabilityNote?' ':'')+`Uraz ograniczył minuty: ${beforeMinutes} → ${minutes}.`;
      state.nextMinutesFactor=1;
    }

    // Bez występu nie ma sportowej formy sezonu. Zachowujemy pierwotny rzut
    // tylko w szczegółach, ale kasujemy premię rozwojową i ocenę z boiska.
    const playedForm={...form};
    if(apps===0){
      if(!availabilityNote) availabilityNote='Trener nie dał ci ani jednej szansy w meczu.';
      form={
        ...form,
        originalKey:form.key,originalLabel:form.label,originalSeasonBonus:form.seasonBonus,
        key:'no_games',label:'BRAK GRY',seasonBonus:0,performanceMod:-8,hierarchy:0,
        gradePair:[0,0],gradeBounds:[0,0],productionRange:[.5,.5]
      };
    }
    let production=rollSeasonProduction(minutes,form,club,apps);
    let goals=production.goals;
    let assists=production.assists;
    let goalsConceded=production.goalsConceded||0;
    let cleanSheets=Math.min(Math.floor(apps/2),production.cleanSheets||0);

    let levelBonus=competitionBonus(seasonTier,apps,club);
    let performance=calculatePerformance(apps,minutes,goals,assists,form,seasonTier,production);
    let grade=evaluateSeasonGrade(form,production,apps,minutes,club,seasonTier);
    let gradeContextText=seasonGradeNarrative(form,production,grade,apps,minutes,club,availabilityNote,breakthrough);
    state.status = apps===0?'Rezerwowy'
      :apps<scaledLeagueCount(8,club,1)?'Rezerwowy'
      :apps<scaledLeagueCount(16,club,1)?'Rotacja'
      :apps>=scaledLeagueCount(28,club,1)&&startChance>82?'Gwiazda zespołu'
      :apps>=scaledLeagueCount(20,club,1)?'Podstawowy'
      :'Rotacja';

    const before=state.overall;    const rawAgeDrift=rollNaturalGrowth(state.age);
    const profAgeProtection=rawAgeDrift<0 ? Math.min(-rawAgeDrift,veteranProfessionalismProtection(state.age)) : 0;
    const ageDrift=rawAgeDrift+profAgeProtection;
    const seasonGrowth=form.seasonBonus;

    // MEDIALNOŚĆ = forma sezonu + ekspozycja poziomu rozgrywek.
    // Granie nisko samo w sobie zjada medialność. Świetny rok może tę stratę
    // częściowo lub wyjątkowo całkowicie odrobić, ale normalny sezon nisko oznacza spadek.
    const recognitionBefore=state.recognition||0;
    const visibilityBonus=seasonTier<=2?0:seasonTier<=4?1:seasonTier===5?2:seasonTier===6?3:4;

    let formMedia=0;
    if(form.key==='career') formMedia=6+visibilityBonus;
    else if(form.key==='great') formMedia=3+visibilityBonus;
    else if(form.key==='good') formMedia=1+Math.floor(visibilityBonus/2);
    else if(form.key==='poor') formMedia=-1;
    else if(form.key==='crisis') formMedia=-2;

    let levelMedia=0;
    if(isForeignClub(club)){
      levelMedia=({1:1,2:1,3:0,4:-2,5:-4,6:-6,7:-8,8:-10})[club.foreignTier] ?? 0;
    } else {
      levelMedia=({1:-6,2:-5,3:-4,4:-2,5:-1,6:0})[seasonTier] ?? 0;
    }

    const baseSeasonRecognition=formMedia+levelMedia;
    const sportMedia=sportMediaLayer(performance,club,apps);
    const seasonRecognition=baseSeasonRecognition+sportMedia.total;
    state.recognition=clamp(recognitionBefore+seasonRecognition,0,100);

    // OSOBNY MODYFIKATOR ŚRODOWISKA:
    // może rozwijać młodego nawet przy małej liczbie występów.
    const environmentGrowth=rollEnvironmentGrowth(env,state.age,seasonTier);

    let talentMod=0;
    let talentChance=0;
    let talentRoll=null;
    let minutesMod=0;

    // TALENT NIE JEST SUFITEM.
    // To wrodzona skłonność do szybszego uczenia się w młodości.
    // Nie określa maksymalnego OVR i nie blokuje wzrostu nigdy.
    if(state.age<=18) talentChance=clamp(Math.round(8+state.talent*.35),12,43);
    else if(state.age<=21) talentChance=clamp(Math.round(5+state.talent*.30),10,35);
    else if(state.age<=24) talentChance=clamp(Math.round(4+state.talent*.20),7,24);
    else if(state.age<=27) talentChance=clamp(Math.round(2+state.talent*.10),4,12);

    if(isEasy() && talentChance>0) talentChance=clamp(talentChance+10,0,60);

    if(talentChance>0){
      talentRoll=rand(1,100);
      if(talentRoll<=talentChance) talentMod=1;
    }

    // Brak minut jest osobnym, jawnym ryzykiem rozwojowym młodego.
    if(apps<scaledLeagueCount(8,club,1) && state.age<=27){
      const baseNoMinutesRisk=state.age<=20?65:state.age<=23?50:30;
      const noMinutesRisk=Math.round(baseNoMinutesRisk*(isEasy()?.65:1));
      if(rand(1,100)<=noMinutesRisk) minutesMod=-1;
    }

    const rawGrowth=ageDrift+seasonGrowth+environmentGrowth.delta+talentMod+minutesMod+injuryOvrPenalty;
    let growth=rawGrowth;
    let formGuarantee=0;
    // Ostateczna gwarancja kierunku: pozostałe składniki ustalają skalę,
    // ale nie mogą odwrócić znaczenia dwóch skrajnych dyspozycji.
    if(form.key==='crisis' && growth>-1){
      formGuarantee=-1-growth;
      growth=-1;
    } else if(form.key==='career' && growth<1){
      formGuarantee=1-growth;
      growth=1;
    }
    // Nie istnieje żaden indywidualny sufit potencjału.
    // Jeśli wszystkie składowe rozwoju są dodatnie, OVR rośnie bez dodatkowego hamulca.

    // Brak limitu rocznej zmiany OVR.
    // Wyjątkowy zbieg: sezon życia + wiek + środowisko + rezerwa talentu
    // może dać naprawdę wyjątkowy skok. Analogicznie fatalny rok może boleć.
    state.overall=clamp(state.overall+growth,1,overallCap());
    noteLegendOverallChange(before);
    state.boost=0;

    const simulatedSeasonBase={apps,goals,assists,goalsConceded,cleanSheets,minutes};
    state.season={...simulatedSeasonBase};
    state.seasonMatchExtras=[];

    // Dwa kolejne ZAKOŃCZONE sezony na 99 otwierają Tryb Legendy
    // przed rozpoczęciem następnego sezonu.
    if(!state.legendUnlocked){
      if(state.overall===99) state.legend99Streak=(state.legend99Streak||0)+1;
      else state.legend99Streak=0;
    }

    // Sezon liczy się jako 100+, jeśli zawodnik zaczynał go już ponad zwykłym sufitem.
    if(state.legendUnlocked && before>=100){
      state.legendSeasons100=(state.legendSeasons100||0)+1;
    }

    const signed=n=>n>0?`+${n}`:`${n}`;
    const ovrText = state.overall!==before?`OVR ${before} → ${state.overall}.`:`OVR ${state.overall}.`;
    const visibleOvrParts=[
      `wiek ${signed(ageDrift)}${profAgeProtection?` (profesjonalizm +${profAgeProtection})`:''}`,
      `sezon ${signed(seasonGrowth)}`,
      `środowisko ${signed(environmentGrowth.delta)}`
    ];
    if(talentMod) visibleOvrParts.push(`talent ${signed(talentMod)}`);
    if(minutesMod) visibleOvrParts.push(`brak minut ${signed(minutesMod)}`);
    if(injuryOvrPenalty) visibleOvrParts.push(`uraz ${signed(injuryOvrPenalty)}`);
    if(formGuarantee) visibleOvrParts.push(`gwarancja ${form.key==='crisis'?'kryzysu':'sezonu życia'} ${signed(formGuarantee)}`);
    const visibleOvrBreakdown=`OVR ${before} → ${state.overall} • ${visibleOvrParts.join(' • ')}`;
    const visibleRecognition=seasonRecognition
      ? ` Medialność: ${recognitionBefore} → ${state.recognition}.`
      : '';
    const talentText=talentChance>0
      ? `talent: ${talentChance}% na +1, rzut ${talentRoll}/100 → ${talentMod?'+1':'0'}`
      : `talent: w tym wieku nie daje już osobnego bonusu rozwojowego`;
    const growthBreakdown=`OVR: wiek ${signed(ageDrift)}${profAgeProtection?` (bazowo ${signed(rawAgeDrift)}, profesjonalizm uratował +${profAgeProtection})`:''} • sezon ${signed(seasonGrowth)} • środowisko ${signed(environmentGrowth.delta)} • ${talentText}${minutesMod?` • brak minut ${signed(minutesMod)}`:''}${injuryOvrPenalty?` • uraz ${signed(injuryOvrPenalty)}`:''}${formGuarantee?` • gwarancja ${form.key==='crisis'?'kryzysu':'sezonu życia'} ${signed(formGuarantee)}`:''} = ${signed(growth)}.`;
    const rolledFormLabel=form.originalLabel||form.label;
    let seasonRollText=`Forma: rzut ${form.roll}/100 dał poziom ${rolledFormLabel}${form.forced?` — wymusiło go zdarzenie: ${form.forcedReason}`:''}. ${apps===0?`Nie wszedłeś na boisko, więc forma nie dała premii OVR${availabilityNote?` (${availabilityNote})`:''}.`:`Przełożyło się to na pozycję w zespole: szansa gry ${openingStartChance}% → ${startChance}%${breakthrough?' po przełomie':''}, a premia rozwojowa wyniosła ${signed(form.seasonBonus)} OVR.`}`;
    let productionRollText=state.position==='GK'
      ?apps===0
        ?'Bilans bramkarza: bez występów, więc nie ma goli straconych ani czystych kont do oceny.'
        :`Bilans bramkarza: ${goalsConceded} straconych goli w ${apps} meczach (${(goalsConceded/apps).toFixed(2).replace('.',',')} na mecz) i ${cleanSheets} czystych kont (${Math.round(cleanSheets/apps*100)}%). To daje ${goalkeeperBalanceLabel(production.goalkeeperGradeQuality||0)} i jest główną podstawą oceny.`
      :`Liczby z boiska: ${goals} goli i ${assists} asyst w ${minutes} minutach. Rzut liczb ${production.adjustedRoll}/100 określił, jak dobrze wykorzystałeś swoją formę; nie daje osobnej premii OVR.`;
    let gradeRollText=apps===0
      ?`Ocena sezonu: brak meczu oznacza ocenę ${grade.label}, niezależnie od tego, w jakiej byłeś formie.`
      :state.position==='GK'
        ?`Ocena sezonu: decydują bilans bramkarski i liczba występów. ${grade.liftedByOutput?`Znakomite wyniki podniosły ocenę do ${grade.beforeMinutesLabel}. `:''}${grade.limitedByMinutes?`${grade.minuteCapLabel} było najwyższą oceną możliwą przy ${apps} występach. `:''}Końcowo: ${grade.label}.`
        :`Ocena sezonu: forma wskazywała poziom ${grade.dispositionLabel}, a gole, asysty i rola w drużynie ustaliły wynik końcowy ${grade.label}.${grade.liftedByOutput?' Wyjątkowe liczby wyraźnie podniosły notę.':''}${grade.limitedByMinutes?' Mała liczba minut ograniczyła ocenę.':''}`;
    const envText=`Środowisko: ${env.label}. Poziom treningu: ${environmentGrowth.trainingLevel}. Rzut rozwoju ${environmentGrowth.roll}/100 zmienił OVR o ${signed(environmentGrowth.delta)}.${state.lastInjurySeverity?` Uraz: ${state.lastInjurySeverity}; stracone mecze ${state.lastInjuryLost}${injuryOvrPenalty?`, wpływ na OVR ${injuryOvrPenalty}`:''}.`:' Sezon bez urazu.'}`;

    const injurySeasonText=state.lastInjurySeverity
      ? `Uraz: ${state.lastInjurySeverity}${state.lastInjuryLost?` • stracone mecze: ${state.lastInjuryLost}`:''}${state.lastInjuryOvrPenalty?` • OVR ${state.lastInjuryOvrPenalty}`:''}.`
      : `Uraz: brak.`;

    const seasonNotes=[];
    if(availabilityNote) seasonNotes.push(availabilityNote);
    if(breakthrough) seasonNotes.push(`⚡ PRZEŁOM: dostałeś niespodziewaną serię szans`);
    if(seasonTier===6) state.ekstraklasaSeasons++;
    if(isForeignClub(club)) state.foreignSeasons++;
    resolveClubSeason(performance, club, seasonTier, form, grade, minutes, function(clubNote,clubSeasonResult){
    const mergedStats=mergedSeasonStats(simulatedSeasonBase,state.seasonMatchExtras);
    const teamAlignedProduction=alignProductionWithTeamResult(mergedStats,production,clubSeasonResult);
    const coopAlignedProduction=alignCoopProductionWithClubLedger(teamAlignedProduction.stats,clubSeasonResult);
    const finalStats=coopAlignedProduction.stats;
    apps=finalStats.apps;
    goals=finalStats.goals;
    assists=finalStats.assists;
    goalsConceded=finalStats.goalsConceded;
    cleanSheets=finalStats.cleanSheets;
    minutes=finalStats.minutes;
    if(apps>0&&form.key==='no_games')form={...playedForm,seasonBonus:0,originalLabel:playedForm.label};
    production=reconciledSeasonProduction(production,finalStats,apps);
    levelBonus=competitionBonus(seasonTier,apps,club);
    performance=calculatePerformance(apps,minutes,goals,assists,form,seasonTier,production);
    grade=evaluateSeasonGrade(form,production,apps,minutes,club,seasonTier);
    gradeContextText=seasonGradeNarrative(form,production,grade,apps,minutes,club,availabilityNote,breakthrough);
    seasonRollText=`Forma: rzut ${form.roll}/100 dał poziom ${rolledFormLabel}${form.forced?` — wymusiło go zdarzenie: ${form.forcedReason}`:''}. ${apps===0?`Nie wszedłeś na boisko, więc forma nie dała premii OVR${availabilityNote?` (${availabilityNote})`:''}.`:`Przełożyło się to na pozycję w zespole: szansa gry ${openingStartChance}% → ${startChance}%${breakthrough?' po przełomie':''}, a premia rozwojowa wyniosła ${signed(form.seasonBonus)} OVR.`}`;
    productionRollText=state.position==='GK'
      ?apps===0
        ?'Bilans bramkarza: bez występów, więc nie ma goli straconych ani czystych kont do oceny.'
        :`Bilans bramkarza: ${goalsConceded} straconych goli w ${apps} meczach (${(goalsConceded/apps).toFixed(2).replace('.',',')} na mecz) i ${cleanSheets} czystych kont (${Math.round(cleanSheets/apps*100)}%). To daje ${goalkeeperBalanceLabel(production.goalkeeperGradeQuality||0)} i jest główną podstawą oceny.`
      :`Liczby z boiska: ${goals} goli i ${assists} asyst w ${minutes} minutach. Rzut liczb ${production.adjustedRoll}/100 określił, jak dobrze wykorzystałeś swoją formę; nie daje osobnej premii OVR.`;
    if(teamAlignedProduction.changed){
      productionRollText+=` Produkcja została domknięta do wyniku zespołu (${clubSeasonResult.place}. miejsce z ${clubSeasonResult.teams}), aby liczby zawodnika nie przerastały ani nie zaniżały sezonu drużyny.`;
    }
    if(coopAlignedProduction.shared){
      productionRollText+=` Co-op: ${coopAlignedProduction.details.players} graczy w ${club.name} korzystało z jednej księgi zespołu (${coopAlignedProduction.details.clubGoals} goli strzelonych, ${coopAlignedProduction.details.clubConceded} straconych); gole, asysty i minuty nie były losowane jako osobne sezony klubu.`;
    }
    const productionScale=leagueProductionScale(club);
    productionRollText+=` Liga ma ${leagueSeasonTeamCount(club)} zespołów i ${leagueSeasonMatches} meczów na klub; produkcja jest liczona ×${productionScale.toFixed(3).replace('.',',')} względem 34 meczów ligi 18-zespołowej.`;
    gradeRollText=apps===0
      ?`Ocena sezonu: brak meczu oznacza ocenę ${grade.label}, niezależnie od tego, w jakiej byłeś formie.`
      :state.position==='GK'
        ?`Ocena sezonu: decydują bilans bramkarski i liczba występów. ${grade.liftedByOutput?`Znakomite wyniki podniosły ocenę do ${grade.beforeMinutesLabel}. `:''}${grade.limitedByMinutes?`${grade.minuteCapLabel} było najwyższą oceną możliwą przy ${apps} występach. `:''}Końcowo: ${grade.label}.`
        :`Ocena sezonu: forma wskazywała poziom ${grade.dispositionLabel}, a gole, asysty i rola w drużynie ustaliły wynik końcowy ${grade.label}.${grade.liftedByOutput?' Wyjątkowe liczby wyraźnie podniosły notę.':''}${grade.limitedByMinutes?' Mała liczba minut ograniczyła ocenę.':''}`;
    state.status = apps===0?'Rezerwowy'
      :apps<scaledLeagueCount(8,club,1)?'Rezerwowy'
      :apps<scaledLeagueCount(16,club,1)?'Rotacja'
      :apps>=scaledLeagueCount(28,club,1)&&startChance>82?'Gwiazda zespołu'
      :apps>=scaledLeagueCount(20,club,1)?'Podstawowy'
      :'Rotacja';
    state.season={...finalStats};
    addSeasonStatsToTotals(finalStats);
    if(apps<scaledLeagueCount(8,club,1)) state.lowAppsStreak=(state.lowAppsStreak||0)+1;
    else state.lowAppsStreak=0;
    if(clubNote) seasonNotes.push(clubNote);
    const nationalNote=maybeNationalTeam(performance, seasonTier, club); if(nationalNote) seasonNotes.push(nationalNote);
    const tournamentNotes=nssPolska.checkSeasonTournaments();
    if(tournamentNotes.length)seasonNotes.push(...tournamentNotes);
    const ballonDorNote=maybeBallonDorTop50(form,performance,club,apps);
    if(ballonDorNote) seasonNotes.push(ballonDorNote);
    const kogutyNote=maybeGornikKoguty(apps,grade,club);
    if(kogutyNote) seasonNotes.push(kogutyNote);
    const awardNotes=maybeAward(goals,assists,apps,grade,seasonTier,club);
    if(awardNotes.length) seasonNotes.push(...awardNotes);
    state.score += Math.round(performance/3)+Math.max(0,seasonTier*2)+(state.seasonNationalCaps>0?12:0);

    // Pieniądze zapisujemy sezon po sezonie według faktycznego kontraktu,
    // a profesjonalizm próbkujemy w tym samym momencie. Dzięki temu końcowe
    // rozliczenie nie zależy od ostatniej wartości cechy.
    const annualSalaryPln=Number.isFinite(state.contractAnnualPln)
      ?state.contractAnnualPln
      :calcAnnualSalaryForClub(club);
    state.careerEarningsPln=(state.careerEarningsPln||0)+annualSalaryPln;
    state.professionalismCareerTotal=(state.professionalismCareerTotal||0)+state.professionalism;
    state.professionalismCareerSamples=(state.professionalismCareerSamples||0)+1;

    const clubPointBreakdown=calculateClubSeasonPoints(club,grade,minutes,clubSeasonResult);
    const careerClubSeasonResult={...clubSeasonResult,leagueTable:[],leagueRounds:[]};
    const seasonRecord={
      year:state.seasonYear,age:state.age,club:club.name,tier:seasonTier,clubStrength:club.strength,breakthrough,
      ovrBefore:before,ovrAfter:state.overall,apps,goals,assists,goalsConceded,cleanSheets,minutes,
      grade:grade.label,gradeIndex:grade.index,gradeBeforeMinutes:grade.beforeMinutesLabel,gradeExplanation:gradeContextText,
      minuteShare:grade.minuteShare,form:form.label,seasonRoll:form.roll,formPosition:form.position,
      productionRoll:production.rawRoll,productionAdjustedRoll:production.adjustedRoll,productionMultiplier:production.multiplier,
      competition:clubCompetition(club),country:club.country||null,foreignTier:club.foreignTier||null,
      leaguePlace:clubSeasonResult.place,leagueTeams:clubSeasonResult.teams,clubSeasonResult:careerClubSeasonResult,
      leagueTable:clubSeasonResult.leagueTable||[],leagueMatches:clubSeasonResult.leagueMatches||0,
      effectiveClubStrength:clubSeasonResult.effectiveClubStrength,
      playerOvrImpact:clubSeasonResult.playerOvrImpact,playerSeasonImpact:clubSeasonResult.playerSeasonImpact,
      clubPoints:clubPointBreakdown.points,clubPointBreakdown,
      environment:env.label,environmentGrowth:environmentGrowth.delta,environmentRoll:environmentGrowth.roll,
      annualSalaryPln,professionalism:state.professionalism,
      recognitionBefore,recognitionAfter:state.recognition,recognitionDelta:seasonRecognition,
      nationalTeam:representedCountryName(),nationalCaps:state.seasonNationalCaps||0,nationalGoals:state.seasonNationalGoals||0,nationalGoalsConceded:state.seasonNationalGoalsConceded||0,nationalCleanSheets:state.seasonNationalCleanSheets||0,note:''
    };
    const ballonDorEntry=(state.ballondorHistory||[]).find(x=>x.year===state.seasonYear);
    if(ballonDorEntry) seasonRecord.ballondorRank=ballonDorEntry.rank;
    state.careerSeasons.push(seasonRecord);
    const naturalizationTeam=club.country
      ?window.NSSNationalData.teams.find(team=>team.name===club.country)
      :null;
    const naturalizationOffer=window.PPSNaturalization.evaluateOffer({
      state,
      team:naturalizationTeam,
      club,
      isTopDivision:isForeignClub(club)&&!foreignLowerLeagueInfo(club)
    });
    if(naturalizationOffer.eligible)window.PPSNaturalization.reserveOffer(state);
    state.seasonFinished=true;
    const legendMilestone=updateClubLegendMilestones(club.name);
    if(legendMilestone) seasonNotes.push(legendMilestone);

    const seasonNoteParts=[];
    if(breakthrough) seasonNoteParts.push('przełom');
    seasonNoteParts.push(injurySeasonText);
    if(seasonNotes.length) seasonNoteParts.push(...seasonNotes);
    seasonRecord.note=seasonNoteParts.join(' • ');

    const dashboardTrophies=(state.trophyHistory||[])
      .filter(x=>x.year===state.seasonYear)
      .map(x=>x.name);
    const dashboardAwards=(state.awardHistory||[])
      .filter(x=>x.year===state.seasonYear)
      .map(awardDisplayName);
    state.lastSeasonDashboard={
      year:state.seasonYear,age:state.age,club:club.name,competition:clubCompetition(club),breakthrough,openingStartChance,startChance,
      position:state.position,apps,goals,assists,goalsConceded,cleanSheets,minutes,
      ovrBefore:before,ovrAfter:state.overall,ovrFactors:visibleOvrParts,
      formLabel:form.label,formOriginalLabel:form.originalLabel||null,formMeterRoll:apps===0?1:form.roll,seasonRoll:form.roll,formPosition:form.position,
      productionRoll:production.rawRoll,productionAdjustedRoll:production.adjustedRoll,
      gradeLabel:grade.label,gradeIndex:grade.index,
      gradeContextText,
      gradeDispositionLabel:grade.dispositionLabel,gradeBeforeMinutesLabel:grade.beforeMinutesLabel,
      gradeProductionNudge:grade.productionNudge,gradeContextNudge:grade.contextNudge,
      gradeMinuteShare:grade.minuteShare,gradeLimitedByMinutes:grade.limitedByMinutes,
      gradeMinuteCapLabel:grade.minuteCapLabel,
      leaguePlace:clubSeasonResult.place,leagueTeams:clubSeasonResult.teams,
      leagueTable:clubSeasonResult.leagueTable||[],leagueRounds:clubSeasonResult.leagueRounds||[],
      leagueMatches:clubSeasonResult.leagueMatches||0,playoffRecords:clubSeasonResult.playoffRecords||[],worldSummary:clubSeasonResult.worldSummary||null,
      trophies:[...new Set(dashboardTrophies)],awards:[...new Set(dashboardAwards)],
      environmentLabel:env.label,injuryText:injurySeasonText.replace(/^Uraz:\s*/i,''),availabilityText:availabilityNote||null,
      recognitionBefore,recognitionAfter:state.recognition,recognitionDelta:seasonRecognition,
      rollDetails:[
        seasonRollText,productionRollText,gradeRollText,envText,growthBreakdown,
        `Medialność: dotychczasowa warstwa ${baseSeasonRecognition>0?'+':''}${baseSeasonRecognition}; sport — boisko ${sportMedia.performanceMedia>0?'+':''}${sportMedia.performanceMedia}, klub ${sportMedia.clubMedia>0?'+':''}${sportMedia.clubMedia}, regularna gra ${sportMedia.playingMedia>0?'+':''}${sportMedia.playingMedia}; razem ${seasonRecognition>0?'+':''}${seasonRecognition} (${recognitionBefore} → ${state.recognition}).`,
        `Wpływ na zespół: bazowa siła ${club.strength.toFixed(1)} → efektywna ${Number(clubSeasonResult.effectiveClubStrength||club.strength).toFixed(1)} OVR; przewaga twojego OVR ${Number(clubSeasonResult.playerOvrImpact||0)>=0?'+':''}${Number(clubSeasonResult.playerOvrImpact||0).toFixed(2)}; jakość sezonu ${Number(clubSeasonResult.playerSeasonImpact||0)>=0?'+':''}${Number(clubSeasonResult.playerSeasonImpact||0).toFixed(2)}. Jesteś liczony jako jeden z 11 zawodników, oba składniki są ważone minutami.`,
        `Wewnętrzny wynik sportowy: ${performance.toFixed(1)} — używany przez rynek, reprezentację, nagrody i wyniki klubu. Nie jest drugą oceną sezonu. Poziom rywali: +${levelBonus.toFixed(1)}.`
      ]
    };
    if(coopAlignedProduction.shared){
      state.lastSeasonDashboard.coopLedger={...coopAlignedProduction.details};
      state.lastSeasonDashboard.rollDetails.push(`CO-OP — wspólna księga ${club.name}: ${coopAlignedProduction.details.players} ludzi • bilans ligi ${coopAlignedProduction.details.clubGoals}:${coopAlignedProduction.details.clubConceded} • pozycja ${state.position}: ${coopAlignedProduction.details.samePositionPlayers} graczy na ${coopAlignedProduction.details.positionSlots} ${coopAlignedProduction.details.positionSlots===1?'miejsce':'miejsca'}.`);
    }

    els.eventBox.classList.remove('special-event'); void els.eventBox.offsetWidth; els.eventBox.classList.add('special-event');
    els.eventBox.dataset.panelRole='season-summary';
    const seasonStatHeadline=state.position==='GK'?`${apps} meczów. ${goalsConceded} straconych goli. ${cleanSheets} czystych kont.`:`${apps} meczów. ${goals} goli. ${assists} asyst.`;
    const oldNationalSummary=state.seasonNationalCaps
      ?(state.position==='GK'
        ?` Kadra ${representedCountryName()}: ${state.seasonNationalCaps} M / ${state.seasonNationalGoalsConceded||0} SG / ${state.seasonNationalCleanSheets||0} CK.`
        :` Kadra ${representedCountryName()}: ${state.seasonNationalCaps} M / ${state.seasonNationalGoals} G.`)
      :'';
    els.eventBox.innerHTML=`<div class="event-kicker">KONIEC SEZONU • ${form.label}</div>
      <h3>${seasonStatHeadline}</h3>
      <p><strong>${visibleOvrBreakdown}</strong><br>Dyspozycja: <strong>${form.label}</strong>. Ocena sezonu: <strong>${grade.label}</strong>.${grade.explanation?` ${grade.explanation}`:''} Środowisko: <strong>${env.label}</strong>.${visibleRecognition} ${state.status}.${Math.abs(form.hierarchy)>=15?` Hierarchia w sezonie: ${openingStartChance}% → ${startChance}%.`:''}${oldNationalSummary}<br><strong>${injurySeasonText}</strong>${seasonNotes.length?' '+seasonNotes.join(' • '):''}</p>
      <details class="roll-details">
        <summary>Pokaż szczegóły losowania</summary>
        <div>${seasonRollText}<br>${productionRollText}<br>${gradeRollText}<br>${envText}<br>${growthBreakdown}<br>Medialność: dotychczasowa warstwa ${baseSeasonRecognition>0?'+':''}${baseSeasonRecognition} • sport: boisko ${sportMedia.performanceMedia>0?'+':''}${sportMedia.performanceMedia}, klub ${sportMedia.clubMedia>0?'+':''}${sportMedia.clubMedia}, regularna gra ${sportMedia.playingMedia>0?'+':''}${sportMedia.playingMedia} • razem ${seasonRecognition>0?'+':''}${seasonRecognition} (${recognitionBefore} → ${state.recognition}).<br>Wpływ na zespół: bazowa siła ${club.strength.toFixed(1)} → efektywna ${Number(clubSeasonResult.effectiveClubStrength||club.strength).toFixed(1)} OVR • przewaga twojego OVR ${Number(clubSeasonResult.playerOvrImpact||0)>=0?'+':''}${Number(clubSeasonResult.playerOvrImpact||0).toFixed(2)} • jakość sezonu ${Number(clubSeasonResult.playerSeasonImpact||0)>=0?'+':''}${Number(clubSeasonResult.playerSeasonImpact||0).toFixed(2)}. Jesteś liczony jako jeden z 11 zawodników, a oba składniki są ważone minutami.<br>Wewnętrzny wynik sportowy: ${performance.toFixed(1)} — używany przez rynek, reprezentację, nagrody i wyniki klubu. Nie jest drugą oceną sezonu. Poziom rywali: +${levelBonus.toFixed(1)} do tego wyniku.</div>
      </details>`;
    log(state.position==='GK'?`${club.name}: ${apps} M / ${goalsConceded} SG / ${cleanSheets} CK`:`${club.name}: ${apps} M / ${goals} G / ${assists} A`, `${tierName(seasonTier)} • forma ${form.label} (rzut ${form.roll}) • ocena ${grade.label} • ${growthBreakdown}`);

    if(state.loanReturn) returnFromLoan();
    render();

    // NSS: po awansie gracz sam wybiera między pełnym turniejem a natychmiastową
    // symulacją wyniku Polski. Turniej nie uruchamia się już automatycznie.
    function afterSeasonFlow(){
      const continueCareer=()=>{
        const decision=makeDecision(performance);
        if(decision) presentDecision(decision, ()=>presentClubChoice(performance));
        else presentClubChoice(performance);
      };
      if(naturalizationOffer.eligible)offerNaturalizationChoice(naturalizationOffer,continueCareer);
      else continueCareer();
    }
    const afterWorldPlayoff=()=>{
      if(state.pendingTournament)offerTournamentChoice(afterSeasonFlow);
      else afterSeasonFlow();
    };
    if(state.pendingWorldPlayoff)offerWorldPlayoffChoice(afterWorldPlayoff);
    else afterWorldPlayoff();
    });
  }


  // v0.48 — UNIWERSALNE AWANSE ZAGRANICZNE.
  // Każda realna niższa liga istniejąca w bazie może dać awans o JEDEN poziom.
  // Wyjątki bez awansu (np. zamknięte systemy) nadal mogą mieć mistrza swojej ligi.
  // Pełna tabela nie jest potrzebna: liczymy wynik klubu względem poziomu ligi.

  const FOREIGN_LOWER_LEAGUES=FOREIGN_LEAGUE_MODEL.transitions;

  function foreignLowerLeagueInfo(club){
    if(!club) return null;
    return FOREIGN_LOWER_LEAGUES[`${club.country}|${club.league}`] || null;
  }

  function foreignPromotionInfo(club){
    const info=foreignLowerLeagueInfo(club);
    return info && info.to ? info : null;
  }

  function foreignRelegationInfo(club){
    if(!club?.country || !club?.league) return null;
    const candidates=Object.entries(FOREIGN_LOWER_LEAGUES)
      .filter(([key,info])=>key.startsWith(`${club.country}|`) && info?.to===club.league)
      .map(([key])=>key.slice(key.indexOf('|')+1));
    if(!candidates.length) return null;
    candidates.sort((a,b)=>
      GAME_DATA.foreignClubs.filter(c=>c.country===club.country&&c.league===b).length-
      GAME_DATA.foreignClubs.filter(c=>c.country===club.country&&c.league===a).length
    );
    return {to:candidates[0]};
  }

  function foreignLeaguePeers(club){
    return GAME_DATA.foreignClubs.filter(c=>c.country===club.country && c.league===club.league);
  }

  function foreignLeagueStrengthGap(club){
    const peers=foreignLeaguePeers(club);
    if(!peers.length) return 0;
    return Math.max(0,Math.max(...peers.map(c=>c.strength))-club.strength);
  }

  // Najwyższa liga: zawsze istnieje szansa na mistrzostwo kraju/lokalnej najwyższej ligi.
  // Nie wymaga pełnej tabeli. Liczy się poziom klubu i dystans do najmocniejszego
  // wpisanego klubu z tych rozgrywek.
  function foreignNationalTitleChance(club,performance){
    const ft=club.foreignTier||4;
    const base=({1:18,2:13,3:8,4:4,5:2,6:1,7:1,8:1})[ft]||1;
    const gap=foreignLeagueStrengthGap(club);
    const relative=12-gap*1.4;
    const formBonus=performance>=62?4:performance>=52?2:performance>=43?1:0;
    return clamp(Math.round(base+relative+formBonus),1,38);
  }

  // Mistrzostwo niższej ligi — osobna rzecz od mistrzostwa kraju.
  function foreignLowerLeagueTitleChance(club,performance){
    const ft=club.foreignTier||5;
    const base=({1:10,2:9,3:8,4:7,5:6,6:5,7:4,8:3})[ft]||3;
    const gap=foreignLeagueStrengthGap(club);
    const relative=10-gap*1.25;
    const formBonus=performance>=60?4:performance>=50?2:performance>=42?1:0;
    return clamp(Math.round(base+relative+formBonus),1,30);
  }

  function foreignPromotionChance(club,performance){
    const gap=foreignLeagueStrengthGap(club);
    const formBonus=performance>=60?7:performance>=50?4:performance>=42?2:0;
    const tierBonus=club.foreignTier===3?3:club.foreignTier===4?2:0;
    return clamp(Math.round(17-gap*1.55+formBonus+tierBonus),2,34);
  }

  // ============================================================
  // TABELA LIGOWA — pozycja klubu jest wspólną podstawą dla opisu
  // sezonu, mistrzostwa, awansu i spadku. Nie wymaga kompletnej bazy:
  // brakujące zespoły są wirtualnymi rywalami o sile wynikającej ze
  // średniej i rozrzutu danej ligi.
  // ============================================================
  function normalish(){
    let sum=0;
    for(let i=0;i<6;i++) sum+=Math.random();
    return (sum-3)*1.41421356237;
  }

  function leagueStandingContext(club,seasonTier){
    let exact=[];
    let reference=[];
    let teams=18;

    if(isForeignClub(club)){
      exact=foreignLeaguePeers(club);
      reference=exact.length>=3
        ? exact
        : GAME_DATA.foreignClubs.filter(c=>c.foreignTier===club.foreignTier && c.zone===club.zone);
      if(reference.length<3) reference=GAME_DATA.foreignClubs.filter(c=>c.foreignTier===club.foreignTier);
      // Pełniejsze ligi zachowują rzeczywistą liczebność bazy. Małe wycinki
      // są uzupełniane do neutralnej, osiemnastozespołowej tabeli.
      teams=exact.length>=10?clamp(exact.length,10,24):18;
    } else {
      exact=polishLeaguePeers(club);
      reference=exact.length?exact:CLUBS.filter(c=>c.tier===seasonTier && (seasonTier>3 || c.region===club.region));
      teams=exact.length>=3?clamp(exact.length,3,24):18;
    }

    const strengths=(reference.length?reference:[club]).map(c=>c.strength);
    const average=strengths.reduce((a,b)=>a+b,0)/strengths.length;
    const variance=strengths.reduce((a,b)=>a+(b-average)**2,0)/strengths.length;
    const spread=clamp(Math.sqrt(variance)||3,2.5,8);
    return {teams,average,spread};
  }

  function seasonPlayerTeamImpact(club,grade,minutes){
    const minuteShare=clamp(minutes/(Math.max(1,leagueSeasonMatchCount(club))*90),0,1);
    // Jeśli piłkarz ma np. 88 OVR w klubie 66 OVR, wymienia jednego z jedenastu
    // zawodników: (88-66)/11 = +2,0 do siły całej jedenastki przy pełnym sezonie.
    // Nie ma już sztucznego sufitu +2,5 — ograniczeniem jest sama arytmetyka XI.
    const ovr=((state.overall-club.strength)/11)*minuteShare;
    // Jakość faktycznie rozegranego sezonu jest drugą, mniejszą warstwą.
    // ŚWIETNY/WYBITNY/HISTORYCZNY pomagają zespołowi coraz mocniej, ale tylko
    // proporcjonalnie do minut; sam status bez gry nie przesuwa tabeli.
    const gradeBoost=({5:.35,6:1.15,7:2.15,8:3.25})[grade?.index]||0;
    const season=gradeBoost*minuteShare;
    const total=ovr+season;
    return {minuteShare,ovr,season,total,effectiveStrength:clamp(club.strength+total,1,110)};
  }

  function effectiveClubStrength(club,grade,minutes){
    return seasonPlayerTeamImpact(club,grade,minutes).effectiveStrength;
  }

  // ============================================================
  // ŻYWY ŚWIAT LIGOWY
  // Polska rozgrywa wszystkie swoje grupy w każdym sezonie. Zagranica
  // budzi się tylko w kraju, w którym gra zawodnik; po jego odejściu stan
  // klubów zostaje zapisany i zamrożony. W zapisie kariery przechowujemy
  // wyłącznie zmiany względem bazy, a nie kilka tysięcy kopii klubów.
  // ============================================================
  function freshLeagueWorld(){
    return {version:4,activeForeignCountry:null,clubOverrides:{},lastPositions:{},polishHistory:[],foreignCountries:{},lastSeason:null};
  }
  function ensureLeagueWorld(target=state){
    if(!target) return freshLeagueWorld();
    target.leagueWorld=target.leagueWorld&&typeof target.leagueWorld==='object'?target.leagueWorld:freshLeagueWorld();
    const world=target.leagueWorld;
    world.version=4;
    world.clubOverrides=world.clubOverrides&&typeof world.clubOverrides==='object'?world.clubOverrides:{};
    world.lastPositions=world.lastPositions&&typeof world.lastPositions==='object'?world.lastPositions:{};
    world.polishHistory=Array.isArray(world.polishHistory)?world.polishHistory:[];
    world.foreignCountries=world.foreignCountries&&typeof world.foreignCountries==='object'?world.foreignCountries:{};
    return world;
  }
  function worldRememberLastPositions(scopeResults,year=state?.seasonYear){
    const world=ensureLeagueWorld();
    if(!scopeResults) return;
    for(const result of scopeResults.values()){
      const clubsById=new Map((result.clubs||[]).map(club=>[worldClubId(club),club]));
      (result.table||[]).forEach(row=>{
        if(row.virtual) return;
        const club=clubsById.get(row.id);
        if(!club) return;
        world.lastPositions[row.id]={
          year,place:row.place,teams:result.table.length,
          competition:clubCompetition(club),competitionKey:worldCompetitionKey(club)
        };
      });
    }
  }
  function clubLastLeaguePosition(club){
    if(!club||club.noClub) return 'brak danych';
    const entry=ensureLeagueWorld().lastPositions[worldClubId(club)];
    if(!entry) return 'brak zapisanego sezonu';
    const seasonLabel=Number.isFinite(entry.year)?`${entry.year}/${String(entry.year+1).slice(2)}`:'poprzedni sezon';
    return `${entry.place}. z ${entry.teams} • ${entry.competition} • ${seasonLabel}`;
  }
  function worldClubId(club){
    if(!club) return '';
    if(club.worldId) return club.worldId;
    return isForeignClub(club)
      ?`INT:${club.country||''}|${club.name}`
      :`PL:${club.region||''}|${club.name}`;
  }
  function worldCompetitionKey(club){
    return isForeignClub(club)
      ?`INT:${club.country||''}|${club.league||''}`
      :`PL:${polishCompetitionKey(club)}`;
  }
  function worldOverrideSnapshot(club){
    const development={
      clubPeakStrength:Number(club.clubPeakStrength)||Number(club.strength)||1,
      clubFinanceLevel:Math.max(0,Number(club.clubFinanceLevel)||0),
      clubFinanceProgression:Math.max(1,Number(club.clubFinanceProgression)||1),
      promotionChain:Math.max(0,Number(club.promotionChain)||0),
      relegationChain:Math.max(0,Number(club.relegationChain)||0),
      lastPromotionYear:Number.isFinite(club.lastPromotionYear)?club.lastPromotionYear:null,
      lastRelegationYear:Number.isFinite(club.lastRelegationYear)?club.lastRelegationYear:null,
      collapseUntilYear:Number.isFinite(club.collapseUntilYear)?club.collapseUntilYear:null
    };
    if(isForeignClub(club)){
      return {
        country:club.country,league:club.league,foreignTier:club.foreignTier,tier:club.tier,
        competitionKey:club.competitionKey,strength:club.strength,globalTier:globalClubTier(club.strength),
        leagueSportLevel:club.leagueSportLevel,leaguePrestige:club.leaguePrestige,
        leagueTier:club.leagueTier,leagueFinance:club.leagueFinance,
        bestDomesticLevel:Math.max(1,Number(club.bestDomesticLevel)||Number(FOREIGN_LEAGUE_MODEL.config[`${club.country}|${club.league}`]?.domesticLevel)||1),
        ...development
      };
    }
    return {
      name:club.name,city:club.city,worldId:club.worldId,customClub:!!club.customClub,
      replacedClubName:club.replacedClubName||null,customColours:club.customColours?{...club.customColours}:null,
      tier:club.tier,pyramidLevel:club.pyramidLevel,leagueName:club.leagueName,group:club.group,
      competitionKey:club.competitionKey,strength:club.strength,globalTier:globalClubTier(club.strength),
      leaguePrestige:club.leaguePrestige,leagueTier:club.leagueTier,leagueFinance:club.leagueFinance,
      bestPyramidLevel:Math.max(1,Number(club.bestPyramidLevel)||Number(club.pyramidLevel)||9),
      ...development
    };
  }
  function worldHydrateBaseClub(base,world=ensureLeagueWorld()){
    return {...base,...(world.clubOverrides[worldClubId(base)]||{})};
  }
  function worldFindBaseClub(id){
    if(id.startsWith('INT:')) return GAME_DATA.foreignClubs.find(club=>worldClubId(club)===id)||null;
    return CLUBS.find(club=>!club.reserve&&worldClubId(club)===id)||null;
  }
  function worldClubFromId(id,world=ensureLeagueWorld()){
    const base=worldFindBaseClub(id);
    return base?worldHydrateBaseClub(base,world):null;
  }
  function syncLeagueWorldClub(club=state?.club){
    if(!club||club.noClub) return;
    const world=ensureLeagueWorld();
    world.clubOverrides[worldClubId(club)]={
      ...(world.clubOverrides[worldClubId(club)]||{}),...worldOverrideSnapshot(club)
    };
    if(isForeignClub(club)){
      world.activeForeignCountry=club.country;
      world.foreignCountries[club.country]=world.foreignCountries[club.country]||{lastActiveYear:null,history:[]};
    } else world.activeForeignCountry=null;
  }
  function activateLeagueWorldForClub(club=state?.club){
    if(!club||club.noClub) return;
    const world=ensureLeagueWorld();
    if(isForeignClub(club)){
      world.activeForeignCountry=club.country;
      world.foreignCountries[club.country]=world.foreignCountries[club.country]||{lastActiveYear:null,history:[]};
    } else world.activeForeignCountry=null;
    syncLeagueWorldClub(club);
  }
  function worldScopeClubs(kind,country=null){
    const world=ensureLeagueWorld();
    const bases=kind==='poland'
      ?CLUBS.filter(club=>!club.reserve)
      :GAME_DATA.foreignClubs.filter(club=>club.country===country);
    return bases.map(base=>worldHydrateBaseClub(base,world));
  }
  function worldLeagueProfile(club){
    const peers=(isForeignClub(club)?GAME_DATA.foreignClubs:CLUBS)
      .filter(candidate=>!candidate.reserve&&worldCompetitionKey(candidate)===worldCompetitionKey(club));
    return peers[0]||club;
  }
  function clubFinanceProgressionForLevel(level){
    return [1,1.08,1.18,1.30,1.45,1.60,1.75][clamp(Math.round(Number(level)||0),0,6)];
  }
  function nationalPowerhouseActive(club){
    return isNationalPowerhouseClub(club)&&(Number(club.pyramidLevel)||1)>1;
  }
  function nationalPowerhouseStrengthFloor(club,peers=[]){
    if(!isNationalPowerhouseClub(club)||isForeignClub(club)) return 0;
    const level=Number(club.pyramidLevel)||1;
    const strengths=peers
      .filter(peer=>peer&&!peer.virtual&&worldClubId(peer)!==worldClubId(club))
      .map(peer=>Number(peer.strength)||0).filter(Number.isFinite)
      .sort((a,b)=>b-a);
    if(!strengths.length) return Number(club.strength)||1;
    if(level===1){
      // Powrót do Ekstraklasy: nie słabiej niż okolice 12. siły ligi.
      return strengths[Math.min(11,strengths.length-1)];
    }
    if(level===2){
      // Co najmniej pasmo TOP 3 OVR I ligi. +1 usuwa przypadkowy remis
      // z czwartym klubem; kilka potęg może jednocześnie dzielić to pasmo.
      return strengths[Math.min(2,strengths.length-1)]+1;
    }
    // Gdyby mimo wszystko zdarzył się kolejny spadek, potęga staje się
    // zdecydowanym faworytem bieżącej ligi i zachowuje drogę powrotną.
    return strengths[0]+3;
  }
  function clubFinanceProgressionFactor(club){
    const earned=Math.max(1,Number(club?.clubFinanceProgression)||clubFinanceProgressionForLevel(club?.clubFinanceLevel));
    return nationalPowerhouseActive(club)?Math.max(1.30,earned):earned;
  }
  function worldClubBaseProfile(club){
    return worldFindBaseClub(worldClubId(club))||club;
  }
  function worldClubInstitution(club){
    const base=worldClubBaseProfile(club);
    const peak=Math.max(Number(base?.strength)||1,Number(club?.clubPeakStrength)||1,Number(club?.strength)||1);
    if(isForeignClub(club)){
      const baseLevel=Number(FOREIGN_LEAGUE_MODEL.config[`${base.country}|${base.league}`]?.domesticLevel)||1;
      return {peak,bestLevel:Math.min(Number(club.bestDomesticLevel)||baseLevel,baseLevel),base};
    }
    return {peak,bestLevel:Math.min(Number(club.bestPyramidLevel)||Number(base?.pyramidLevel)||9,Number(base?.pyramidLevel)||9),base};
  }
  function worldTargetStrength(targetClubs,type,random,club,targetProfile){
    const oldStrength=Number(club?.strength)||1;
    const strengths=targetClubs.filter(club=>!club.virtual).map(club=>Number(club.strength)||0).sort((a,b)=>a-b);
    if(!strengths.length) return {strength:Math.max(1,oldStrength+(type==='promotion'?1:-1)),collapse:false};
    // Beniaminek najczęściej zaczyna w dolnej połowie nowej ligi. To kończy
    // automatyczną windę, w której sam awans od razu robił z niego kandydata
    // do następnego. Mocny projekt zachowuje jednak wypracowany OVR.
    // Spadkowicz z reguły pozostaje czołowym klubem niższej ligi. Tylko 2%
    // przypadków oznacza prawdziwe rozsypanie zespołu.
    const roll=random();
    let low,high,collapse=false;
    if(type==='promotion'){
      if(roll<.65){low=.10;high=.35;}
      else if(roll<.92){low=.35;high=.55;}
      else{low=.55;high=.72;}
    } else {
      if(roll<.65){low=0;high=.15;}
      else if(roll<.90){low=.15;high=.35;}
      else if(roll<.98){low=.35;high=.60;}
      else{low=.65;high=.90;collapse=true;}
      // KRAJOWA POTĘGA nie losuje instytucjonalnej rozsypki. Może spaść
      // sportowo, lecz zachowuje kadrę i zaplecze potrzebne do powrotu.
      if(isNationalPowerhouseClub(club)){low=0;high=.15;collapse=false;}
    }
    // Tablica jest rosnąca: mały percentyl to słabszy klub. Dla spadkowicza
    // chcemy czołówkę niższej ligi, więc odwracamy jego zakres.
    const percentile=type==='promotion'
      ?low+random()*(high-low)
      :1-(low+random()*(high-low));
    const index=clamp(Math.round(percentile*(strengths.length-1)),0,strengths.length-1);
    const jitter=(random()-.5)*1.5;
    let target=Math.round((strengths[index]+jitter)*10)/10;
    if(type==='promotion'){
      target=Math.max(oldStrength,target);
    }else if(!collapse){
      const institution=worldClubInstitution(club);
      const targetLevel=isForeignClub(club)
        ?Number(FOREIGN_LEAGUE_MODEL.config[`${targetProfile.country}|${targetProfile.league}`]?.domesticLevel)||institution.bestLevel+1
        :Number(targetProfile?.pyramidLevel)||institution.bestLevel+1;
      const distance=Math.max(1,targetLevel-institution.bestLevel);
      const institutionalFloor=institution.peak-distance*(isForeignClub(club)?9:10);
      const leagueCeiling=strengths[strengths.length-1]+5;
      // Pamięć marki/zaplecza nie robi z klubu nadklubu, ale nie pozwala też,
      // by po jednym sezonie utracił po kilkanaście OVR i rozpoczął lawinę.
      target=Math.max(target,Math.min(leagueCeiling,institutionalFloor),oldStrength-7);
    }
    const resolved=type==='promotion'?target:Math.min(oldStrength,target);
    return {strength:clamp(Math.round(resolved*10)/10,1,110),collapse};
  }
  function worldApplyCompetitionMove(club,targetProfile,targetClubs,type,random){
    const moved={...club};
    if(!isForeignClub(club)){
      // Twarda gwarancja regionalna. Profil przekazany przez bilans miejsc
      // nigdy nie może przenieść spadkowicza do grupy zwolnionej w innym
      // województwie; właściwą grupę wyznacza wyłącznie macierz klubu.
      const regionalTarget=polishCompetitionTarget(club,type==='promotion'?-1:1);
      if(regionalTarget) targetProfile=regionalTarget;
      if(!polishRegionalTransitionValid(club,targetProfile)){
        return moved;
      }
      if(targetClubs[0]&&worldCompetitionKey(targetClubs[0])!==worldCompetitionKey(targetProfile)){
        targetClubs=worldScopeClubs('poland').filter(candidate=>worldCompetitionKey(candidate)===worldCompetitionKey(targetProfile));
      }
    }
    if(isForeignClub(club)){
      Object.assign(moved,{
        country:targetProfile.country,league:targetProfile.league,foreignTier:targetProfile.foreignTier,
        tier:targetProfile.tier,competitionKey:targetProfile.competitionKey,
        leagueSportLevel:targetProfile.leagueSportLevel,leaguePrestige:targetProfile.leaguePrestige,
        leagueTier:targetProfile.leagueTier,leagueFinance:targetProfile.leagueFinance
      });
    } else {
      Object.assign(moved,{
        tier:targetProfile.tier,pyramidLevel:targetProfile.pyramidLevel,leagueName:targetProfile.leagueName,
        group:targetProfile.group,competitionKey:targetProfile.competitionKey
      });
      const scale=polishLeagueScale(moved);
      moved.leaguePrestige=scale?.prestige||targetProfile.leaguePrestige||'F-';
      moved.leagueTier=prestigeToLeagueTier(moved.leaguePrestige);
      moved.leagueFinance=scale?.finance??targetProfile.leagueFinance??1;
    }
    const strengthResult=worldTargetStrength(targetClubs,type,random,club,targetProfile);
    moved.strength=strengthResult.strength;
    if(isNationalPowerhouseClub(moved)){
      moved.strength=clamp(Math.max(moved.strength,nationalPowerhouseStrengthFloor(moved,targetClubs)),1,110);
    }
    const institution=worldClubInstitution(club);
    moved.clubPeakStrength=Math.max(institution.peak,moved.strength);
    if(isForeignClub(moved)) moved.bestDomesticLevel=institution.bestLevel;
    else moved.bestPyramidLevel=institution.bestLevel;
    const movementYear=Number(state?.seasonYear)||2026;
    let financeLevel=Math.max(0,Number(club.clubFinanceLevel)||0);
    if(type==='promotion'){
      const consecutive=Number.isFinite(club.lastPromotionYear)&&club.lastPromotionYear===movementYear-1;
      moved.promotionChain=consecutive?Math.max(1,Number(club.promotionChain)||1)+1:1;
      financeLevel=Math.min(6,financeLevel+1);
      moved.lastPromotionYear=movementYear;
      moved.relegationChain=0;
      moved.collapseUntilYear=null;
      if(isForeignClub(moved)){
        const level=Number(FOREIGN_LEAGUE_MODEL.config[`${moved.country}|${moved.league}`]?.domesticLevel)||1;
        moved.bestDomesticLevel=Math.min(Number(club.bestDomesticLevel)||99,level);
      }else moved.bestPyramidLevel=Math.min(Number(club.bestPyramidLevel)||99,Number(moved.pyramidLevel)||99);
    }else{
      moved.promotionChain=0;
      const recentRelegation=Number.isFinite(club.lastRelegationYear)&&club.lastRelegationYear>=movementYear-2;
      moved.relegationChain=recentRelegation?Math.max(1,Number(club.relegationChain)||1)+1:1;
      financeLevel=Math.max(0,financeLevel-1);
      moved.lastRelegationYear=movementYear;
      moved.collapseUntilYear=strengthResult.collapse?movementYear+2:null;
    }
    if(nationalPowerhouseActive(moved)) financeLevel=Math.max(3,financeLevel);
    moved.clubFinanceLevel=financeLevel;
    moved.clubFinanceProgression=clubFinanceProgressionForLevel(financeLevel);
    moved.globalTier=globalClubTier(moved.strength);
    const world=ensureLeagueWorld();
    world.clubOverrides[worldClubId(club)]={...(world.clubOverrides[worldClubId(club)]||{}),...worldOverrideSnapshot(moved)};
    return moved;
  }
  function coopProjectedStartChance(assignment,club){
    const gap=(assignment.overall||0)-(club.strength||0);
    const loyaltyBonus=Math.min(7,Math.max(0,assignment.loyalty||0)*.65);
    let chance=48+gap*4+((assignment.professionalism||50)-50)*.18+(assignment.boost||0)+loyaltyBonus;
    chance=Math.min(chance,qualityGapStartChanceCap(gap));
    return clamp(chance,gap<=-25?1:4,97);
  }
  function coopClubStrengthOverrides(){
    if(!coopIsActive())return null;
    const world=ensureLeagueWorld();
    const grouped=new Map();
    (coopSession.assignments||[]).forEach(assignment=>{
      if(!grouped.has(assignment.clubId))grouped.set(assignment.clubId,[]);
      grouped.get(assignment.clubId).push(assignment);
    });
    const overrides=new Map();
    for(const [clubId,assignments] of grouped){
      const club=worldClubFromId(clubId,world);
      if(!club)continue;
      const raw=assignments.map(assignment=>{
        const minuteShare=clamp(coopProjectedStartChance(assignment,club)/100*.92,.02,.90);
        return {assignment,impact:((assignment.overall-club.strength)/11)*minuteShare};
      }).sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact));
      const factors=[1,.86,.74,.64,.56,.50];
      const total=raw.reduce((sum,item,index)=>sum+item.impact*(factors[index]||.45),0);
      overrides.set(clubId,clamp(club.strength+total,1,110));
    }
    return overrides;
  }
  function coopRuntimeScopeCache(){
    if(!coopIsActive())return null;
    if(!coopSession.scopeCache||coopSession.scopeCache.year!==state.seasonYear){
      coopSession.scopeCache={year:state.seasonYear,poland:null,foreign:{}};
      coopSession.clubCupResults={};
    }
    return coopSession.scopeCache;
  }
  function worldSeasonStrength(club,rawStrength,leaguePeers=[]){
    let strength=Number(rawStrength)||Number(club?.strength)||1;
    const year=Number(state?.seasonYear)||2026;
    const relegated=Number(club?.lastRelegationYear);
    const promoted=Number(club?.lastPromotionYear);
    const collapsed=Number(club?.collapseUntilYear)>=year;
    // Dwa sezony „spadochronu sportowego”: zachowane zaplecze, budżet i kadra
    // dają spadkowiczowi +4/+2 OVR w symulacji. Po awansie lub prawdziwej
    // rozsypce ochrona natychmiast znika.
    if(Number.isFinite(relegated)&&(!Number.isFinite(promoted)||promoted<relegated)&&!collapsed){
      const elapsed=year-relegated;
      const pedigree=worldClubInstitution(club).peak;
      const cascade=Math.max(1,Number(club.relegationChain)||1);
      const firstYear=pedigree>=80?10:pedigree>=65?7:4;
      if(elapsed===1) strength+=firstYear+Math.min(6,(cascade-1)*3);
      else if(elapsed===2) strength+=Math.round(firstYear/2);
    }
    if(nationalPowerhouseActive(club)){
      strength=Math.max(strength,nationalPowerhouseStrengthFloor(club,leaguePeers));
    }
    return clamp(strength,1,110);
  }
  function worldSimulateScope(clubs,activeClubId,scopeSeed,activeStrength=null,strengthOverrides=null){
    const groups=new Map();
    clubs.forEach(club=>{
      const key=worldCompetitionKey(club);
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(club);
    });
    const results=new Map();
    for(const [key,realClubs] of groups){
      const active=realClubs.some(club=>worldClubId(club)===activeClubId||(strengthOverrides?.has(worldClubId(club))));
      const teams=realClubs.map(club=>{
        const rawStrength=strengthOverrides?.has(worldClubId(club))
          ?strengthOverrides.get(worldClubId(club))
          :worldClubId(club)===activeClubId&&Number.isFinite(activeStrength)?activeStrength:club.strength;
        return {
          id:worldClubId(club),name:club.name,
          strength:worldSeasonStrength(club,rawStrength,realClubs),
          virtual:false,club
        };
      });
      // Gramy dokładnie składem zapisanym w grupie — bez sztucznego dopełniania
      // do osiemnastu zespołów i bez wpisów „Rywal 10”, „Rywal 11” itd.
      if(teams.length<2){
        const only=teams[0];
        results.set(key,{table:only?[{...only,place:1,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0}]:[],rounds:[],matches:0,clubs:realClubs});
        continue;
      }
      const simulation=PPSLeagueEngine.simulateLeague({teams,seed:`${scopeSeed}|${key}`,keepRounds:active,doubleRound:true});
      results.set(key,{...simulation,clubs:realClubs});
    }
    return results;
  }
  function worldPolishTargetProfile(club,direction){
    return polishCompetitionTarget(club,direction);
  }
  function worldForeignTargetProfile(club,direction){
    if(direction<0){
      const info=foreignPromotionInfo(club);
      return info?.to?GAME_DATA.foreignClubs.find(candidate=>candidate.country===club.country&&candidate.league===info.to)||null:null;
    }
    const info=foreignRelegationInfo(club);
    return info?.to?GAME_DATA.foreignClubs.find(candidate=>candidate.country===club.country&&candidate.league===info.to)||null:null;
  }

  function worldDirectPromotionCount(club,teams,kind){
    const hasTarget=kind==='poland'?!!worldPolishTargetProfile(club,-1):!!worldForeignTargetProfile(club,-1);
    if(!hasTarget) return 0;
    if(kind==='foreign') return teams>=12?2:1;
    const level=club.pyramidLevel||99;
    if(level===2||level===3) return 2;
    return level>=4?1:0;
  }
  function worldDirectRelegationCount(club,teams,kind){
    const hasTarget=kind==='poland'?!!worldPolishTargetProfile(club,1):!!worldForeignTargetProfile(club,1);
    if(!hasTarget) return 0;
    if(kind==='foreign') return clamp(Math.round(teams/6),1,Math.max(1,teams-2));
    const level=club.pyramidLevel||99;
    if(level===1||level===2) return clamp(Math.round(teams/6),1,Math.min(3,Math.max(1,teams-2)));
    if(level===3||level===4) return clamp(Math.round(teams*4/18),1,Math.min(4,Math.max(1,teams-2)));
    return clamp(Math.round(teams/6),1,Math.max(1,teams-2));
  }
  function worldPlayoffEntries(result,places){
    return places.map(place=>{
      const row=result.table.find(item=>!item.virtual&&item.place===place);
      const club=row&&result.clubs.find(candidate=>worldClubId(candidate)===row.id);
      return row&&club?{row,club,id:row.id,fromKey:worldCompetitionKey(club),result}:null;
    }).filter(Boolean);
  }
  function worldPlayoffDuel(first,second,random,label){
    const teams=[
      {id:first.id,name:first.club.name,strength:first.club.strength},
      {id:second.id,name:second.club.name,strength:second.club.strength}
    ];
    const result=PPSLeagueEngine.resolveShadowMatch(teams[0],teams[1],PPSLeagueEngine.leagueStats(teams),random);
    let winner=first,penalties=false;
    if(result.homeGoals<result.awayGoals) winner=second;
    else if(result.homeGoals===result.awayGoals){ penalties=true; winner=random()<.5?first:second; }
    return {
      winner,
      record:{label,home:first.club.name,away:second.club.name,homeGoals:result.homeGoals,awayGoals:result.awayGoals,penalties,winner:winner.club.name}
    };
  }
  function worldPlayoffTwoLegDuel(challenger,defender,random,label){
    const teams=[
      {id:challenger.id,name:challenger.club.name,strength:challenger.club.strength},
      {id:defender.id,name:defender.club.name,strength:defender.club.strength}
    ];
    const stats=PPSLeagueEngine.leagueStats(teams);
    const first=PPSLeagueEngine.resolveShadowMatch(teams[0],teams[1],stats,random);
    const second=PPSLeagueEngine.resolveShadowMatch(teams[1],teams[0],stats,random);
    const challengerGoals=first.homeGoals+second.awayGoals;
    const defenderGoals=first.awayGoals+second.homeGoals;
    let winner=challenger,penalties=false;
    if(challengerGoals<defenderGoals) winner=defender;
    else if(challengerGoals===defenderGoals){penalties=true;winner=random()<.5?challenger:defender;}
    return {
      winner,
      record:{label,home:challenger.club.name,away:defender.club.name,homeGoals:challengerGoals,awayGoals:defenderGoals,penalties,winner:winner.club.name,twoLegged:true}
    };
  }
  function worldRememberPlayoff(playoffLog,record,entries){
    if(!playoffLog||!record)return;
    entries.filter(Boolean).forEach(entry=>{
      if(!playoffLog.has(entry.id))playoffLog.set(entry.id,[]);
      playoffLog.get(entry.id).push({...record});
    });
  }
  function worldPlayoffTournament(entries,random,label,playoffLog=null){
    if(entries.length<2) return {winner:null,records:[]};
    let round=entries.slice();
    const records=[];
    while(round.length>1){
      const next=[];
      for(let index=0;index<Math.floor(round.length/2);index++){
        const duel=worldPlayoffDuel(round[index],round[round.length-1-index],random,label);
        worldRememberPlayoff(playoffLog,duel.record,[round[index],round[round.length-1-index]]);
        records.push(duel.record); next.push(duel.winner);
      }
      if(round.length%2) next.push(round[Math.floor(round.length/2)]);
      round=next;
    }
    return {winner:round[0]||null,records};
  }
  function worldPromotionCandidate(entry,result,kind,viaPlayoff=false,playoffRecords=[]){
    if(!entry) return null;
    const targetProfile=kind==='poland'?worldPolishTargetProfile(entry.club,-1):worldForeignTargetProfile(entry.club,-1);
    if(!targetProfile) return null;
    return {
      club:entry.club,id:entry.id,fromKey:worldCompetitionKey(entry.club),toKey:worldCompetitionKey(targetProfile),
      targetProfile,fromProfile:result?.clubs?.[0]||entry.club,row:entry.row,
      viaPlayoff,playoffRecords
    };
  }
  function worldPromotionCandidates(scopeResults,kind,random){
    const candidates=[];
    const playoffLog=new Map();
    const lowerRunners=[];
    const thirdLeagueRunners=[];
    for(const [fromKey,result] of scopeResults){
      const sample=result.clubs[0];
      if(!sample) continue;
      const realRows=result.table.filter(row=>!row.virtual);
      const directCount=worldDirectPromotionCount(sample,realRows.length,kind);
      for(let place=1;place<=directCount;place++){
        const entry=worldPlayoffEntries(result,[place])[0];
        const candidate=worldPromotionCandidate(entry,result,kind,false,[]);
        if(candidate) candidates.push(candidate);
      }
      if(!directCount) continue;
      if(kind==='foreign'||(sample.pyramidLevel===2||sample.pyramidLevel===3)){
        const entrants=worldPlayoffEntries(result,[directCount+1,directCount+2,directCount+3,directCount+4]);
        const playoff=worldPlayoffTournament(entrants,random,'Baraż o awans',playoffLog);
        const candidate=worldPromotionCandidate(playoff.winner,result,kind,true,playoff.records);
        if(candidate) candidates.push(candidate);
      } else if(kind==='poland'&&sample.pyramidLevel===4){
        const runner=worldPlayoffEntries(result,[2])[0];
        if(runner) thirdLeagueRunners.push(runner);
      } else if(kind==='poland'&&(sample.pyramidLevel||0)>=5){
        const runner=worldPlayoffEntries(result,[2])[0];
        if(runner){
          runner.result=result;
          runner.targetProfile=worldPolishTargetProfile(runner.club,-1);
          runner.toKey=runner.targetProfile?worldCompetitionKey(runner.targetProfile):null;
          lowerRunners.push(runner);
        }
      }
    }

    // Prawdziwy schemat PZPN: wicemistrzowie czterech grup III ligi grają
    // pierwszy etap parami I–III i IV–II. Zwycięzcy mierzą się w dwumeczach
    // z klubami zajmującymi dwa miejsca nad bezpośrednią strefą spadkową II ligi.
    if(kind==='poland'&&thirdLeagueRunners.length>=4){
      const byGroup=new Map(thirdLeagueRunners.map(entry=>[String(entry.club.group||''),entry]));
      const secondLeague=[...scopeResults.values()].find(result=>result.clubs[0]?.pyramidLevel===3);
      const realRows=secondLeague?.table.filter(row=>!row.virtual)||[];
      const directDown=secondLeague?worldDirectRelegationCount(secondLeague.clubs[0],realRows.length,'poland'):0;
      const survivalPlaces=[realRows.length-directDown-1,realRows.length-directDown];
      const defenders=secondLeague?worldPlayoffEntries(secondLeague,survivalPlaces):[];
      const pairs=[[byGroup.get('I'),byGroup.get('III')],[byGroup.get('IV'),byGroup.get('II')]];
      pairs.forEach((pair,index)=>{
        if(!pair[0]||!pair[1]||!defenders[index]) return;
        const firstStage=worldPlayoffDuel(pair[0],pair[1],random,'I etap baraży III ligi');
        worldRememberPlayoff(playoffLog,firstStage.record,pair);
        const finalStage=worldPlayoffTwoLegDuel(firstStage.winner,defenders[index],random,'Dwumecz o Betclic II ligę');
        worldRememberPlayoff(playoffLog,finalStage.record,[firstStage.winner,defenders[index]]);
        if(finalStage.winner.id!==firstStage.winner.id) return;
        const candidate=worldPromotionCandidate(firstStage.winner,firstStage.winner.result,kind,true,[firstStage.record,finalStage.record]);
        if(candidate){
          candidate.swapOpponent=defenders[index];
          candidates.push(candidate);
        }
      });
    }

    // IV liga: wicemistrzowie z czterech wojewódzkich lig prowadzących do
    // tej samej grupy III ligi grają uproszczony turniej o jedno miejsce.
    const fourthLeague=new Map();
    lowerRunners.filter(entry=>entry.club.pyramidLevel===5&&entry.toKey).forEach(entry=>{
      if(!fourthLeague.has(entry.toKey)) fourthLeague.set(entry.toKey,[]);
      fourthLeague.get(entry.toKey).push(entry);
    });
    for(const entries of fourthLeague.values()){
      const playoff=worldPlayoffTournament(entries,random,'Baraże wicemistrzów IV ligi',playoffLog);
      const winner=playoff.winner;
      if(!winner) continue;
      const candidate=worldPromotionCandidate(winner,winner.result,kind,true,playoff.records);
      if(candidate) candidates.push(candidate);
    }

    // V liga i niżej: parujemy wicemistrzów na tym samym poziomie w obrębie
    // województwa. Przy nieparzystej liczbie ostatni nie dostaje wolnego awansu.
    const regional=new Map();
    lowerRunners.filter(entry=>entry.club.pyramidLevel>5&&entry.toKey).forEach(entry=>{
      const key=`${entry.club.region}|${entry.club.pyramidLevel}`;
      if(!regional.has(key)) regional.set(key,[]);
      regional.get(key).push(entry);
    });
    for(const entries of regional.values()){
      entries.sort((a,b)=>a.toKey.localeCompare(b.toKey,'pl')||b.row.points-a.row.points||b.row.gd-a.row.gd);
      for(let index=0;index+1<entries.length;index+=2){
        const playoff=worldPlayoffDuel(entries[index],entries[index+1],random,'Regionalny baraż wicemistrzów');
        worldRememberPlayoff(playoffLog,playoff.record,[entries[index],entries[index+1]]);
        const winner=playoff.winner;
        const candidate=worldPromotionCandidate(winner,winner.result,kind,true,[playoff.record]);
        if(candidate) candidates.push(candidate);
      }
    }
    candidates.playoffLog=playoffLog;
    return candidates;
  }
  function worldMovementPriority(candidate,activeKey){
    return (candidate.fromKey===activeKey?1000000:0)+(candidate.viaPlayoff?0:100000)+
      (candidate.row?.points||0)*100+(candidate.row?.gd||0);
  }
  function worldResolveMovements(scopeResults,kind,seasonSeed,activeKey=''){
    const random=PPSLeagueEngine.createRandom(`${seasonSeed}|movements|${kind}`);
    const promotionCandidates=worldPromotionCandidates(scopeResults,kind,random);
    const playoffLog=promotionCandidates.playoffLog||new Map();
    const promotions=promotionCandidates.filter(candidate=>scopeResults.has(candidate.toKey));
    const movements=[];
    const regularPromotions=promotions.filter(candidate=>!candidate.swapOpponent);
    promotions.filter(candidate=>candidate.swapOpponent).forEach(move=>{
      const targetResult=scopeResults.get(move.toKey);
      const sourceResult=scopeResults.get(move.fromKey);
      if(!targetResult||!sourceResult) return;
      const promotedClub=worldApplyCompetitionMove(move.club,move.targetProfile,targetResult.clubs,'promotion',random);
      const defender=move.swapOpponent;
      const sourceProfile=sourceResult.clubs[0]||move.fromProfile;
      const relegatedClub=worldApplyCompetitionMove(defender.club,sourceProfile,sourceResult.clubs,'relegation',random);
      movements.push({id:move.id,name:move.club.name,type:'promotion',from:move.fromKey,to:move.toKey,moved:promotedClub,viaPlayoff:true,playoffRecords:move.playoffRecords||[]});
      movements.push({id:defender.id,name:defender.club.name,type:'relegation',from:move.toKey,to:move.fromKey,moved:relegatedClub,viaPlayoff:true,playoffRecords:move.playoffRecords||[]});
    });
    const byTarget=new Map();
    regularPromotions.forEach(move=>{
      if(!byTarget.has(move.toKey)) byTarget.set(move.toKey,[]);
      byTarget.get(move.toKey).push(move);
    });
    for(const [toKey,incoming] of byTarget){
      const targetResult=scopeResults.get(toKey);
      if(!targetResult) continue;
      const realRows=targetResult.table.filter(row=>!row.virtual).slice().sort((a,b)=>b.place-a.place);
      const targetSample=targetResult.clubs[0];
      let capacity=worldDirectRelegationCount(targetSample,realRows.length,kind);
      // Zwycięzca baraży IV ligi oznacza piątego beniaminka III ligi, więc
      // zgodnie z polską zasadą spadków zależnych powiększa strefę o miejsce.
      if(kind==='poland'&&targetSample?.pyramidLevel===4&&incoming.some(candidate=>candidate.viaPlayoff)) capacity++;
      const movementCount=Math.min(incoming.length,capacity,Math.max(0,realRows.length-2));
      const admitted=incoming.slice().sort((a,b)=>worldMovementPriority(b,activeKey)-worldMovementPriority(a,activeKey)).slice(0,movementCount);
      const relegatedRows=realRows.slice(0,movementCount);
      const availableSources=admitted.slice();
      admitted.forEach(move=>{
        const targetClubs=targetResult.clubs;
        const moved=worldApplyCompetitionMove(move.club,move.targetProfile,targetClubs,'promotion',random);
        movements.push({id:move.id,name:move.club.name,type:'promotion',from:move.fromKey,to:move.toKey,moved,viaPlayoff:move.viaPlayoff,playoffRecords:move.playoffRecords||[]});
      });
      relegatedRows.forEach((row,index)=>{
        const club=targetResult.clubs.find(candidate=>worldClubId(candidate)===row.id);
        if(!club) return;
        const desired=kind==='poland'?worldPolishTargetProfile(club,1):worldForeignTargetProfile(club,1);
        if(kind==='poland'){
          // Liczba spadkowiczów nadal bilansuje liczbę przyjętych beniaminków,
          // ale ich kierunek nie jest już związany z grupą, z której akurat
          // ktoś awansował. Klub trafia wyłącznie do własnego województwa.
          if(!desired||!polishRegionalTransitionValid(club,desired)) return;
          const destinationKey=worldCompetitionKey(desired);
          const destinationResult=scopeResults.get(destinationKey);
          const moved=worldApplyCompetitionMove(club,desired,destinationResult?.clubs||[],'relegation',random);
          movements.push({id:row.id,name:club.name,type:'relegation',from:toKey,to:destinationKey,moved});
          return;
        }
        if(!availableSources.length) return;
        let sourceIndex=desired?availableSources.findIndex(source=>source.fromKey===worldCompetitionKey(desired)):-1;
        if(sourceIndex<0) sourceIndex=index%availableSources.length;
        const source=availableSources.splice(sourceIndex,1)[0];
        const sourceResult=scopeResults.get(source.fromKey);
        const targetProfile=desired&&worldCompetitionKey(desired)===source.fromKey?desired:source.fromProfile;
        const moved=worldApplyCompetitionMove(club,targetProfile,sourceResult?.clubs||[], 'relegation',random);
        movements.push({id:row.id,name:club.name,type:'relegation',from:toKey,to:source.fromKey,moved});
      });
    }
    movements.playoffLog=playoffLog;
    return movements;
  }
  function worldRefreshCareerClub(){
    if(!state?.club||state.club.noClub) return;
    const current=worldClubFromId(worldClubId(state.club));
    if(current) state.club={...state.club,...current};
    if(state.loanReturn){
      const parent=worldClubFromId(worldClubId(state.loanReturn));
      if(parent) state.loanReturn={...state.loanReturn,...parent};
    }
  }
  function worldTableZones(club,table,kind){
    const zones=new Map();
    const teams=table.length;
    const directPromotion=worldDirectPromotionCount(club,teams,kind);
    const relegation=worldDirectRelegationCount(club,teams,kind);
    const set=(place,zone,label)=>{
      if(place>=1&&place<=teams&&!zones.has(place)) zones.set(place,{zone,label});
    };
    if(kind==='poland'){
      const level=club.pyramidLevel||99;
      if(level===1){
        set(1,'champion','Mistrzostwo Polski');
        for(let place=2;place<=Math.min(4,teams);place++) set(place,'continental','Europejskie puchary');
      } else {
        for(let place=1;place<=directPromotion;place++) set(place,'promotion','Awans bezpośredni');
        if(level===2||level===3){
          for(let place=directPromotion+1;place<=Math.min(directPromotion+4,teams-relegation);place++) set(place,'playoff','Baraże o awans');
          if(level===3){
            set(teams-relegation-1,'playoff','Baraż o utrzymanie');
            set(teams-relegation,'playoff','Baraż o utrzymanie');
          }
        } else if(level===4&&directPromotion){
          set(2,'playoff','Baraże o II ligę');
        } else if(level>=5&&directPromotion){
          set(2,'playoff','Baraż o awans');
        }
      }
    } else {
      if(directPromotion){
        for(let place=1;place<=directPromotion;place++) set(place,'promotion','Awans bezpośredni');
        for(let place=directPromotion+1;place<=Math.min(directPromotion+4,teams-relegation);place++) set(place,'playoff','Baraże o awans');
      } else {
        const cups=clamp(Math.round(teams*.22),3,5);
        for(let place=1;place<=Math.min(cups,teams);place++) set(place,'continental','Puchary kontynentalne');
      }
    }
    for(let place=Math.max(1,teams-relegation+1);place<=teams;place++){
      zones.set(place,{zone:'relegation',label:'Spadek'});
    }
    return zones;
  }
  function simulateLeagueWorld(club,grade,minutes){
    const world=ensureLeagueWorld();
    const coop=coopIsActive();
    if(!coop)syncLeagueWorldClub(club);
    const activeId=worldClubId(club);
    const seasonSeed=coop?`COOP|${state.seasonYear}`:`${state.name}|${state.seasonYear}|${activeId}`;
    const impact=seasonPlayerTeamImpact(club,grade,minutes);
    const strengthOverrides=coop?coopClubStrengthOverrides():null;
    const sharedStrength=strengthOverrides?.get(activeId);
    const activeStrength=state.forceCorruptPromotion
      ?Math.max(Number.isFinite(sharedStrength)?sharedStrength:impact.effectiveStrength,150)
      :(Number.isFinite(sharedStrength)?sharedStrength:impact.effectiveStrength);
    if(state.forceCorruptPromotion&&strengthOverrides)strengthOverrides.set(activeId,activeStrength);
    const scopeCache=coopRuntimeScopeCache();

    let polishResults,polishMoves;
    if(scopeCache?.poland){
      ({results:polishResults,moves:polishMoves}=scopeCache.poland);
    }else{
      polishResults=worldSimulateScope(
        worldScopeClubs('poland'),isForeignClub(club)?'':activeId,
        `${seasonSeed}|POLSKA`,activeStrength,strengthOverrides
      );
      worldRememberLastPositions(polishResults);
      polishMoves=worldResolveMovements(polishResults,'poland',seasonSeed,isForeignClub(club)?'':worldCompetitionKey(club));
      world.polishHistory.push({year:state.seasonYear,leagues:polishResults.size,promotions:polishMoves.filter(move=>move.type==='promotion').length});
      world.polishHistory=world.polishHistory.slice(-12);
      if(scopeCache)scopeCache.poland={results:polishResults,moves:polishMoves};
    }
    let activeResults=isForeignClub(club)?null:polishResults;
    let foreignMoves=[];
    if(isForeignClub(club)){
      world.activeForeignCountry=club.country;
      const countryState=world.foreignCountries[club.country]=world.foreignCountries[club.country]||{lastActiveYear:null,history:[]};
      const cachedForeign=scopeCache?.foreign?.[club.country];
      if(cachedForeign){
        activeResults=cachedForeign.results;
        foreignMoves=cachedForeign.moves;
      }else{
        activeResults=worldSimulateScope(
          worldScopeClubs('foreign',club.country),activeId,`${seasonSeed}|${club.country}`,
          activeStrength,strengthOverrides
        );
        worldRememberLastPositions(activeResults);
        foreignMoves=worldResolveMovements(activeResults,'foreign',seasonSeed,worldCompetitionKey(club));
        countryState.lastActiveYear=state.seasonYear;
        countryState.history.push({year:state.seasonYear,leagues:activeResults.size,promotions:foreignMoves.filter(move=>move.type==='promotion').length});
        countryState.history=countryState.history.slice(-12);
        if(scopeCache)scopeCache.foreign[club.country]={results:activeResults,moves:foreignMoves};
      }
    } else world.activeForeignCountry=null;
    const activeKey=worldCompetitionKey(club);
    const group=activeResults?.get(activeKey);
    const row=group?.table.find(item=>item.id===activeId);
    const allMoves=[...polishMoves,...foreignMoves];
    const playerMovement=allMoves.find(move=>move.id===activeId)||null;
    const activePlayoffLog=(isForeignClub(club)?foreignMoves:polishMoves).playoffLog||new Map();
    const playerPlayoffRecords=activePlayoffLog.get(activeId)||playerMovement?.playoffRecords||[];
    const promoted=allMoves.some(move=>move.id===activeId&&move.type==='promotion');
    const relegated=allMoves.some(move=>move.id===activeId&&move.type==='relegation');
    world.lastSeason={year:state.seasonYear,polishLeagues:polishResults.size,foreignCountry:isForeignClub(club)?club.country:null,foreignLeagues:isForeignClub(club)?activeResults.size:0};
    worldRefreshCareerClub();
    const zones=worldTableZones(club,group?.table||[],isForeignClub(club)?'foreign':'poland');
    return {
      place:row?.place||1,teams:group?.table.length||1,competition:clubCompetition(club),
      playerImpact:impact.total,playerOvrImpact:impact.ovr,playerSeasonImpact:impact.season,
      effectiveClubStrength:activeStrength,champion:row?.place===1,
      promoted,relegated,cups:[],realLeague:true,engineVersion:2,
      promotionViaPlayoff:!!(playerMovement?.type==='promotion'&&playerMovement.viaPlayoff),
      relegationViaPlayoff:!!(playerMovement?.type==='relegation'&&playerMovement.viaPlayoff),
      playoffRecords:playerPlayoffRecords,
      leagueTable:(group?.table||[]).map(item=>{
        const tableClub=group?.clubs?.find(candidate=>worldClubId(candidate)===item.id)||null;
        const palette=tableClub?clubOfferPalette(tableClub):{primary:'#777777',secondary:'#ffffff',shadow:'#222222',source:'virtual'};
        const zone=zones.get(item.place)||{};
        const movement=allMoves.find(move=>move.id===item.id);
        return {
          place:item.place,id:item.id,name:item.name,played:item.played,won:item.won,drawn:item.drawn,
          lost:item.lost,gf:item.gf,ga:item.ga,gd:item.gd,points:item.points,virtual:!!item.virtual,
          playerClub:item.id===activeId,zone:zone.zone||null,zoneLabel:zone.label||null,
          movement:movement?.type||null,promotionViaPlayoff:!!movement?.viaPlayoff,
          playoffRecords:activePlayoffLog.get(item.id)||movement?.playoffRecords||[],
          primary:palette.primary,secondary:palette.secondary,shadow:palette.shadow||palette.secondary,
          ink:readablePaletteInk(palette.primary,palette.secondary),
          colourSource:palette.source
        };
      }),
      leagueRounds:group?.rounds||[],leagueMatches:group?.matches||0,
      worldSummary:{polishLeagues:polishResults.size,foreignCountry:isForeignClub(club)?club.country:null,foreignLeagues:isForeignClub(club)?activeResults.size:0}
    };
  }

  function simulateLeagueStanding(club,seasonTier,grade,minutes){
    return simulateLeagueWorld(club,grade,minutes);
  }

  function relegationPlaces(teams){ return teams<=12?2:3; }
  function setTitleSuccess(result){ result.place=1; result.champion=true; }
  function setTitleFailure(result){ result.place=clamp(Math.max(2,result.place),2,result.teams); }
  function setPromotionSuccess(result){ result.place=clamp(result.place,1,2); result.promoted=true; }
  function setPromotionFailure(result){ result.place=clamp(Math.max(3,result.place),3,result.teams); }
  function setRelegation(result){
    const firstDown=result.teams-relegationPlaces(result.teams)+1;
    result.place=clamp(Math.max(firstDown,result.place),firstDown,result.teams);
    result.relegated=true;
  }

  function promotedLeagueFloor(club,toLeague){
    const peers=GAME_DATA.foreignClubs.filter(c=>c.country===club.country && c.league===toLeague);
    if(!peers.length) return club.strength+2;
    const strengths=peers.map(c=>c.strength).sort((a,b)=>a-b);
    // Promowany klub ma wejść jako raczej słabszy zespół nowej ligi,
    // ale nie jako kompletnie oderwany od jej poziomu.
    const idx=Math.min(strengths.length-1,Math.floor(strengths.length*.2));
    return Math.max(club.strength+2,strengths[idx]-2);
  }

  function closestForeignLeagueProfile(club,league,strength){
    const peers=GAME_DATA.foreignClubs.filter(c=>c.country===club.country&&c.league===league);
    if(!peers.length) return null;
    return peers.slice().sort((a,b)=>Math.abs(a.strength-strength)-Math.abs(b.strength-strength))[0];
  }

  function relegatedLeagueStrength(club,toLeague){
    const peers=GAME_DATA.foreignClubs
      .filter(c=>c.country===club.country&&c.league===toLeague)
      .slice().sort((a,b)=>b.strength-a.strength);
    if(!peers.length) return Math.max(1,club.strength-rand(2,4));

    // Spadkowicz najczęściej pozostaje jednym z mocniejszych zespołów niższej
    // ligi, czasem staje się średniakiem, a sporadycznie naprawdę się rozpada.
    const roll=rand(1,100);
    const from=roll<=60?0:roll<=90?.25:.60;
    const to=roll<=60?.25:roll<=90?.60:.90;
    const first=Math.min(peers.length-1,Math.floor((peers.length-1)*from));
    const last=Math.min(peers.length-1,Math.max(first,Math.floor((peers.length-1)*to)));
    return Math.max(1,peers[rand(first,last)].strength+rand(-1,1));
  }

  function grantPromotionHierarchyBonus(oldClub,newClub,grade,minutes){
    if(!oldClub||!newClub||state.loanReturn) return 0;
    const minuteShare=clamp(minutes/(Math.max(1,leagueSeasonMatchCount(oldClub))*90),0,1);
    const leadingPlayer=
      ((grade?.index||0)>=5 && minuteShare>=.50) ||
      ((grade?.index||0)>=6 && minuteShare>=.35) ||
      (state.overall>=(oldClub.strength||0)+5 && minuteShare>=.35);
    if(!leadingPlayer) return 0;

    const beforeChance=projectedStartChance(oldClub,0);
    const afterChance=projectedStartChance(newClub,0);
    // Czołowy zawodnik wywalczył awans na boisku. Podwyższony poziom ligi
    // nadal zwiększa konkurencję, ale klub nie traktuje go jak obcego rezerwowego.
    const bonus=clamp(Math.max(10,beforeChance+8-afterChance),10,30);
    state.boost=Math.max(state.boost||0,bonus);
    log('BONUS HIERARCHII PO AWANSIE',`${newClub.name} • czołowy zawodnik zespołu • +${bonus} p.p. do szansy na grę w pierwszym sezonie po awansie`);
    return bonus;
  }

  function applyPromotionFinancialProgression(oldClub,newClub){
    if(!oldClub||!newClub||state.loanReturn||worldClubId(oldClub)!==worldClubId(newClub)) return null;
    const previous=Number.isFinite(state.contractAnnualPln)?state.contractAnnualPln:null;
    const recalculated=calcAnnualSalaryForClub(newClub);
    if(previous===null||recalculated>previous) state.contractAnnualPln=recalculated;
    const factor=clubFinanceProgressionFactor(newClub);
    const level=Math.max(0,Number(newClub.clubFinanceLevel)||0);
    log('ROZWÓJ FINANSOWY KLUBU',`${newClub.name} • poziom awansów ${level} • mnożnik ×${factor.toFixed(2)}${previous!==null&&state.contractAnnualPln>previous?` • kontrakt ${formatMoney(previous/12)} → ${formatMoney(state.contractAnnualPln/12)} miesięcznie`:''}`);
    return {factor,level,previous,current:state.contractAnnualPln};
  }

  function applyForeignPromotion(club,info,asChampion=false,grade=null,minutes=0){
    if(!info || !info.to || state.loanReturn) return false;

    const oldLeague=club.league;
    const floor=promotedLeagueFloor(club,info.to);

    state.promotions++;
    state.justPromoted=true;
    state.club.league=info.to;
    state.club.strength=Math.min(99,Math.max(state.club.strength+rand(2,4),floor));
    const profile=closestForeignLeagueProfile(club,info.to,state.club.strength);
    if(profile){
      state.club.foreignTier=Math.min(state.club.foreignTier,profile.foreignTier);
      state.club.tier=Math.max(state.club.tier,profile.tier);
    }
    state.bestForeignTier=state.bestForeignTier
      ?Math.min(state.bestForeignTier,state.club.foreignTier)
      :state.club.foreignTier;
    state.highestTier=Math.max(state.highestTier,state.club.tier);

    // Nie mutujemy globalnej bazy klubów. Awans dotyczy tej konkretnej kariery.
    // Dzięki temu rozpoczęcie nowej kariery na tej samej stronie nie dziedziczy
    // losowych awansów z poprzedniej.
    state.score+=18;
    grantPromotionHierarchyBonus(club,state.club,grade,minutes);
    log(`AWANS: ${club.name}`,`${oldLeague} → ${info.to}${asChampion?' • mistrz ligi':''}`);
    return true;
  }

  function applyForeignRelegation(club,info){
    if(!info?.to || state.loanReturn) return false;
    const oldLeague=club.league;
    state.justRelegated=true;
    state.club.league=info.to;
    state.club.strength=relegatedLeagueStrength(club,info.to);
    const profile=closestForeignLeagueProfile(club,info.to,state.club.strength);
    if(profile){
      state.club.foreignTier=Math.max(state.club.foreignTier,profile.foreignTier);
      state.club.tier=Math.min(state.club.tier,profile.tier);
    } else {
      state.club.foreignTier=Math.min(8,state.club.foreignTier+1);
    }
    log(`SPADEK: ${club.name}`,`${oldLeague} → ${info.to}`);
    return true;
  }

  function maybeBallonDorAfterChampionsLeague(form,performance){
    if(!form || (form.key!=='great' && form.key!=='career')) return '';
    const chance=form.key==='career' ? 100 : 50;
    const roll=rand(1,100);

    if(roll<=chance){
      grantSeasonAward('Złota Piłka',110,10,state.club,`Liga Mistrzów + ${form.label} • szansa ${chance}% • rzut ${roll}/100`);
      return `🥇 ZŁOTA PIŁKA`;
    }

    log('Głosowanie Złotej Piłki',`Liga Mistrzów + ${form.label} • szansa ${chance}% • rzut ${roll}/100 → bez nagrody`);
    return '';
  }

  function maybeBallonDorTop50(form,performance,club,apps){
    if(!isForeignClub(club) || club.foreignTier!==1 || state.overall<=92) return '';
    // Bramą jest DYspozycja, nie końcowa ocena sezonu: tylko ŚWIETNY albo
    // SEZON ŻYCIA. Dokładna pozycja w wylosowanym przedziale ma duże znaczenie.
    if(!form || (form.key!=='great' && form.key!=='career')) return '';
    state.ballondorHistory=state.ballondorHistory||[];
    if(state.ballondorHistory.some(x=>x.year===state.seasonYear)) return '';

    const alreadyWon=(state.awardHistory||[]).some(a=>a.year===state.seasonYear && a.name==='Złota Piłka');
    const position=clamp(Number(form.positionPct)||0,0,100);
    const dispositionBase=form.key==='career'?55:30;
    const dispositionRange=form.key==='career'?22:18;
    const ovrBonus=Math.max(0,state.overall-93)*5;
    const performanceBonus=clamp((performance-45)*.45,0,14);
    const appsBonus=apps>=scaledLeagueCount(30,club,1)?5:apps>=scaledLeagueCount(24,club,1)?2:apps<scaledLeagueCount(18,club,1)?-10:0;
    const chance=alreadyWon?100:clamp(Math.round(dispositionBase+position/100*dispositionRange+ovrBonus+performanceBonus+appsBonus),12,98);
    const roll=alreadyWon?1:rand(1,100);

    if(roll>chance){
      log('Głosowanie Złotej Piłki — poza TOP 50',`${club.name} • ${form.label} (${Math.round(position)}% przedziału) • OVR ${state.overall} • szansa ${chance}% • rzut ${roll}/100`);
      return '';
    }

    let rank=1;
    if(!alreadyWon){
      const rankPower=
        Math.max(0,state.overall-92)*2.2+
        (form.key==='career'?16:7)+
        position*.14+
        clamp((performance-42)*.22,0,8)+
        (apps>=scaledLeagueCount(30,club,1)?3:0)+rand(-5,5);
      rank=clamp(51-Math.round(rankPower),1,50);
    }
    const entry={year:state.seasonYear,rank,club:club.name,competition:clubCompetition(club),overall:state.overall,form:form.label,formPosition:position,chance,roll};
    state.ballondorHistory.push(entry);
    addSportMedia(rank<=10?6:rank<=25?4:2,`TOP 50 Złotej Piłki: ${rank}. miejsce`);
    log(`Złota Piłka — ${rank}. miejsce w głosowaniu`,`${club.name} • ${form.label} (${Math.round(position)}% przedziału) • OVR ${state.overall} • szansa ${chance}% • rzut ${roll}/100`);
    return `🌍 Złota Piłka: ${rank}. miejsce w TOP 50`;
  }

  // Wybiera losowego rywala z puli klubów (wykluczając własny klub).
  // Zwraca {name, strength}; przy pustej puli daje bezpieczny fallback.
  function pickRivalClub(pool, ownName, fallbackStrength){
    const candidates=(pool||[]).filter(c=>c && c.name && c.name!==ownName);
    if(!candidates.length) return {name:'Rywal', strength:fallbackStrength};
    return candidates[rand(0,candidates.length-1)];
  }

  function simulateDecisiveResult(homeStrength,opponent,drawCountsAsSuccess){
    const gap=homeStrength-(opponent?.strength||homeStrength);
    // Przy remisie wystarczającym do sukcesu gospodarz ma kilka dodatkowych
    // punktów procentowych. Poza tym liczy się wyłącznie różnica siły drużyn.
    const chance=clamp(Math.round((drawCountsAsSuccess?56:50)+gap*3),12,90);
    const roll=rand(1,100);
    const success=roll<=chance;
    let gf=rand(0,3),ga=rand(0,3);
    if(success){
      if(drawCountsAsSuccess&&Math.random()<.3)ga=gf;
      else if(gf<=ga)gf=ga+1;
    }else if(gf>=ga)ga=gf+1;
    let matchGf=gf,matchGa=ga;
    const extra=!drawCountsAsSuccess&&Math.random()<.22;
    const penalties=extra&&Math.random()<.45;
    if(penalties){
      matchGf=matchGa=rand(0,2);
      gf=matchGf+(success?1:0);
      ga=matchGa+(success?0:1);
    }
    return {success,chance,roll,gf,ga,matchGf,matchGa,extra,penalties,winner:success?'home':'away'};
  }

  function playedHomeWon(result){
    if(result?.winner) return result.winner==='home';
    return (result?.gf||0)>(result?.ga||0);
  }

  function playedMatchScoreText(result){
    const gf=result?.matchGf??result?.gf??0;
    const ga=result?.matchGa??result?.ga??0;
    const pens=result?.penalties&&result?.penaltyScore
      ?` • karne ${result.penaltyScore.home}:${result.penaltyScore.away}`
      :result?.extra?' • po dogrywce':'';
    return `${gf}:${ga}${pens}`;
  }

  function emptySeasonStats(){
    return {apps:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,minutes:0};
  }

  function mergedSeasonStats(base,extras){
    return (extras||[]).reduce((sum,item)=>{
      Object.keys(sum).forEach(key=>{sum[key]+=(Number(item?.[key])||0);});
      return sum;
    },{...emptySeasonStats(),...(base||{})});
  }

  function alignProductionWithTeamResult(stats,production,standing){
    const out={...stats};
    const apps=Math.max(0,Number(out.apps)||0);
    const teams=Math.max(2,Number(standing?.teams)||2);
    const place=clamp(Number(standing?.place)||teams,1,teams);
    const teamQuality=1-(place-1)/(teams-1);
    if(apps<5) return {stats:out,teamQuality,changed:false};
    const before={goals:out.goals||0,assists:out.assists||0,goalsConceded:out.goalsConceded||0,cleanSheets:out.cleanSheets||0};

    if(state.position==='GK'){
      const band=teamQuality>=.80?[.55,1.15,.25,.50]
        :teamQuality>=.60?[.75,1.35,.18,.42]
        :teamQuality>=.40?[.95,1.55,.12,.35]
        :teamQuality>=.20?[1.15,1.85,.06,.28]
        :[1.35,2.20,0,.20];
      out.goalsConceded=clamp(Math.round(out.goalsConceded||0),Math.floor(apps*band[0]),Math.ceil(apps*band[1]));
      out.cleanSheets=clamp(Math.round(out.cleanSheets||0),Math.floor(apps*band[2]),Math.min(Math.floor(apps/2),Math.ceil(apps*band[3])));
      // Każde czyste konto musi mieścić się w tym samym, spójnym bilansie.
      out.cleanSheets=Math.min(out.cleanSheets,Math.max(0,apps-Math.ceil(out.goalsConceded/3)));
    }else{
      const factorBand=teamQuality>=.80?[.85,1.65]
        :teamQuality>=.60?[.65,1.45]
        :teamQuality>=.40?[.45,1.25]
        :teamQuality>=.20?[.30,.95]
        :[.15,.75];
      const expected=Math.max(.75,Number(production?.expectedOutput)||0);
      const minimum=expected*factorBand[0],maximum=Math.max(minimum,expected*factorBand[1]);
      const output=()=>Math.max(0,(out.goals||0)+(out.assists||0)*.7);
      let guard=0;
      while(output()+.001<minimum&&guard++<80){
        if(state.position==='FWD'||(state.position==='MID'&&guard%3===0)) out.goals=(out.goals||0)+1;
        else out.assists=(out.assists||0)+1;
      }
      guard=0;
      while(output()-.001>maximum&&guard++<80){
        if((out.goals||0)>0&&(state.position==='FWD'||!(out.assists||0))) out.goals--;
        else if((out.assists||0)>0) out.assists--;
        else break;
      }
    }
    const changed=before.goals!==(out.goals||0)||before.assists!==(out.assists||0)||before.goalsConceded!==(out.goalsConceded||0)||before.cleanSheets!==(out.cleanSheets||0);
    return {stats:out,teamQuality,changed,before};
  }

  function coopWeightedShare(assignments,current,weightFn){
    const rows=assignments.map(assignment=>({assignment,weight:Math.max(.03,weightFn(assignment))}));
    const total=rows.reduce((sum,row)=>sum+row.weight,0)||1;
    const mine=rows.find(row=>row.assignment.playerId===current.playerId)?.weight||0;
    return mine/total;
  }
  function alignCoopProductionWithClubLedger(stats,standing){
    if(!coopIsActive())return {stats:{...stats},changed:false,shared:false};
    const assignments=coopAssignmentsAtClub(state.club);
    if(assignments.length<2)return {stats:{...stats},changed:false,shared:false};
    const current=assignments.find(assignment=>assignment.playerId===state.coopPlayerId);
    const row=(standing?.leagueTable||[]).find(item=>item.playerClub||item.id===worldClubId(state.club));
    if(!current||!row)return {stats:{...stats},changed:false,shared:false};
    const out={...stats};
    const before={...out};
    const matches=Math.max(1,Number(row.played)||Math.round(Number(standing?.leagueMatches||0)/Math.max(1,standing?.teams||1))||38);
    const clubGoals=Math.max(0,Number(row.gf)||0);
    const clubConceded=Math.max(0,Number(row.ga)||0);
    const positionSlots={GK:1,DEF:4,MID:4,FWD:2};
    const samePosition=assignments.filter(assignment=>assignment.position===state.position);
    const availabilityWeight=assignment=>clamp(1+(assignment.overall-state.club.strength)/35+(assignment.professionalism-50)/220,.35,1.75);
    const samePositionShare=coopWeightedShare(samePosition,current,availabilityWeight);
    const slots=positionSlots[state.position]||1;

    if(state.position==='GK'&&samePosition.length>1){
      const appCap=Math.max(0,Math.floor(matches*samePositionShare));
      out.apps=Math.min(out.apps||0,appCap);
      out.minutes=out.apps*90;
      const actualRatio=appCap>0?out.apps/appCap:0;
      out.goalsConceded=Math.min(out.goalsConceded||0,Math.floor(clubConceded*samePositionShare*actualRatio));
      const estimatedClubCleanSheets=clamp(Math.round(matches*.38-clubConceded*.09),0,Math.floor(matches/2));
      out.cleanSheets=Math.min(out.cleanSheets||0,Math.floor(estimatedClubCleanSheets*samePositionShare*actualRatio));
    }else if(samePosition.length>slots){
      const positionMinutes=matches*90*slots;
      const minuteCap=Math.max(0,Math.floor(positionMinutes*samePositionShare));
      out.minutes=Math.min(out.minutes||0,minuteCap);
      if(out.minutes<=0)out.apps=0;
      else out.apps=Math.min(out.apps||0,matches,Math.max(1,Math.ceil(out.minutes/12)));
    }

    if(state.position!=='GK'){
      const goalWeights={GK:.02,DEF:.18,MID:.65,FWD:1};
      const assistWeights={GK:.02,DEF:.32,MID:1,FWD:.48};
      const humanGoalPool=Math.floor(clubGoals*.72);
      const humanAssistPool=Math.floor(clubGoals*.78);
      const goalShare=coopWeightedShare(assignments,current,assignment=>goalWeights[assignment.position]||.1);
      const assistShare=coopWeightedShare(assignments,current,assignment=>assistWeights[assignment.position]||.1);
      out.goals=Math.min(out.goals||0,Math.floor(humanGoalPool*goalShare));
      out.assists=Math.min(out.assists||0,Math.floor(humanAssistPool*assistShare));
    }
    const changed=['apps','minutes','goals','assists','goalsConceded','cleanSheets'].some(key=>(before[key]||0)!==(out[key]||0));
    return {
      stats:out,changed,shared:true,
      details:{players:assignments.length,clubGoals,clubConceded,matches,samePositionPlayers:samePosition.length,positionSlots:slots}
    };
  }

  function reconciledSeasonProduction(production,stats,apps){
    const out={...production,...stats};
    if(state.position==='GK'){
      const quality=goalkeeperSeasonQuality(apps,stats.goalsConceded||0,stats.cleanSheets||0);
      out.goalkeeperGradeQuality=quality;
      out.realizedQuality=quality;
      out.gradeQuality=quality;
      return out;
    }
    if(out.hasVisibleProduction){
      out.actualOutput=(stats.goals||0)+(stats.assists||0)*.7;
      out.realizedQuality=clamp(.5+(out.actualOutput-(out.expectedOutput||0))/(2*Math.max(2,out.expectedOutput||0)),0,1);
      out.gradeQuality=(out.quality||.5)*.60+out.realizedQuality*.40;
    }
    return out;
  }

  function addSeasonStatsToTotals(stats){
    state.totals=state.totals||emptySeasonStats();
    Object.keys(emptySeasonStats()).forEach(key=>{
      state.totals[key]=(state.totals[key]||0)+(Number(stats?.[key])||0);
    });
  }

  function recordPlayedClubMatch(result,homeName,kicker){
    if(!result) return;
    const appearance=result.myAppearance===1?1:0;
    const goals=appearance?Math.max(0,result.myGoals||0):0;
    const assists=appearance?Math.max(0,result.myAssists||0):0;
    const goalkeeper=state.position==='GK';
    const matchMinutes=appearance?Math.max(0,Number.isFinite(result.myMinutes)?result.myMinutes:((result.extra?120:90)-(result.myEntryMinute||0))):0;
    const goalsConceded=goalkeeper&&appearance?Math.max(0,result.myGoalsConceded||0):0;
    const cleanSheet=goalkeeper&&appearance?(result.myCleanSheet?1:0):0;
    const extra={
      apps:appearance,goals,assists,goalsConceded,cleanSheets:cleanSheet,minutes:matchMinutes,
      source:kicker,club:homeName,entryMinute:appearance?result.myEntryMinute:null,
      exitMinute:appearance?result.myExitMinute:null,dismissalMinute:result.myDismissalMinute??null,
      yellowCards:result.myYellowCards||0,redCards:result.myRedCards||0
    };
    state.seasonMatchExtras=state.seasonMatchExtras||[];
    state.seasonMatchExtras.push(extra);
    const appearanceText=appearance?`+1 mecz • +${matchMinutes} minut`:'0 meczów • 0 minut (bez wejścia)';
    log(`${kicker}: występ zapisany do rozliczenia sezonu`, goalkeeper?`${appearanceText} • +${goalsConceded} straconych • +${cleanSheet} czyste konto`:`${appearanceText} • +${goals} G • +${assists} A`);
  }

  // Pokazuje wybór "zagraj mecz / zasymuluj automatycznie" w istniejącym
  // decisionBox, bez przechodzenia przez pełną maszynerię presentDecision
  // (ta zakłada synchroniczne act() i nie nadaje się do meczu asynchronicznego).
  function offerDecisiveMatch(descriptor, next){
    const {kicker,title,text,homeName,homeStrength,opponent,knockout,drawCountsAsSuccess,onSuccess,onFailure}=descriptor;

    state.pendingDecision=true;
    els.playSeasonBtn.classList.add('hidden');
    els.decisionBox.classList.remove('hidden');
    els.decisionTitle.textContent=title;
    els.decisionText.innerHTML=`<strong>${text}</strong>`;
    els.decisionChoices.innerHTML='';

    function finish(){
      state.pendingDecision=false;
      els.decisionBox.classList.add('hidden');
      els.playSeasonBtn.classList.remove('hidden');
      render();
      next();
    }

    const playBtn=document.createElement('button'); playBtn.className='choice-btn';
    playBtn.innerHTML=`<span class="choice-main">ZAGRAJ MECZ</span><span class="choice-stake">Decydujące starcie z ${opponent.name} (${opponent.strength} OVR).</span>`;
    playBtn.onclick=()=>{
      els.decisionChoices.innerHTML='<p class="choice-stake">Trwa mecz…</p>';
      const previousMultiplier=state.activePlayerEventMultiplier||1;
      state.activePlayerEventMultiplier=state.captainEventBonusClub===state.club.name?2:1;
      nssPolska.playClubDecisiveMatch({kicker,homeName,homeStrength,opponent,knockout}).then(result=>{
        state.activePlayerEventMultiplier=previousMultiplier;
        recordPlayedClubMatch(result,homeName,kicker);
        const success=playedHomeWon(result) || (drawCountsAsSuccess && (result.matchGf??result.gf)===(result.matchGa??result.ga));
        if(success){ if(onSuccess) onSuccess(); } else if(onFailure){ onFailure(); }
        finish();
      });
    };

    const simBtn=document.createElement('button'); simBtn.className='choice-btn';
    simBtn.innerHTML=`<span class="choice-main">ZASYMULUJ AUTOMATYCZNIE</span><span class="choice-stake">Wynik zostanie uczciwie wylosowany według siły obu drużyn.</span>`;
    simBtn.onclick=()=>{
      const simulated=simulateDecisiveResult(homeStrength,opponent,drawCountsAsSuccess);
      const playerResult=nssPolska.simulateClubDecisiveAppearance(simulated);
      recordPlayedClubMatch({...simulated,...playerResult},homeName,kicker);
      if(simulated.success){ if(onSuccess) onSuccess(); }
      else if(onFailure) onFailure();
      log(`Symulacja: ${homeName} — ${opponent.name}`,`Szansa sukcesu ${simulated.chance}% • rzut ${simulated.roll}/100 • ${simulated.success?'sukces':'porażka'}`);
      els.decisionTitle.textContent='WYNIK DECYZJI';
      els.decisionText.innerHTML=`<strong>${escapeDecisionHtml(homeName)} — ${escapeDecisionHtml(opponent.name)}: ${simulated.success?'sukces':'porażka'}.</strong><br>Szansa sukcesu ${simulated.chance}% • rzut ${simulated.roll}/100.`;
      els.decisionChoices.innerHTML='';
      const nextBtn=document.createElement('button');
      nextBtn.className='primary full';
      nextBtn.textContent='DALEJ';
      nextBtn.onclick=finish;
      els.decisionChoices.appendChild(nextBtn);
      focusDecisionResult();
    };

    els.decisionChoices.appendChild(playBtn);
    els.decisionChoices.appendChild(simBtn);
  }

  function offerNaturalizationChoice(offer,next){
    if(!offer?.eligible){next();return;}
    const country=offer.country;
    state.pendingDecision=true;
    els.playSeasonBtn.classList.add('hidden');
    els.decisionBox.classList.remove('hidden');
    els.decisionKicker.textContent='OFERTA REPREZENTACYJNA';
    els.decisionTitle.textContent=`${country} proponuje ci naturalizację`;
    els.decisionText.textContent=`Po trzech kolejnych sezonach w kraju i wybitnym roku w najwyższej lidze możesz związać całą dalszą karierę reprezentacyjną z kadrą ${country}. To jedyna taka oferta w tej karierze. Decyzja jest nieodwracalna.`;
    els.decisionChoices.innerHTML='';

    const finish=()=>{
      state.pendingDecision=false;
      els.decisionBox.classList.add('hidden');
      els.playSeasonBtn.classList.remove('hidden');
      render();
      next();
    };

    const accept=document.createElement('button');
    accept.className='choice-btn';
    accept.innerHTML=`<span class="choice-main">PRZYJMUJĘ — GRAM DLA ${escapeDecisionHtml(country.toUpperCase())}</span><span class="choice-stake">Od tej chwili nie możesz już reprezentować Polski. Powołania i turnieje będą dotyczyły nowej kadry.</span>`;
    accept.onclick=()=>{
      window.PPSNaturalization.acceptOffer(state,country);
      log(`Przyjmujesz naturalizację: ${country}.`,`OVR reprezentacji ${offer.teamOvr} • decyzja nieodwracalna`);
      finish();
    };

    const reject=document.createElement('button');
    reject.className='choice-btn';
    reject.innerHTML='<span class="choice-main">ODMAWIAM</span><span class="choice-stake">Pozostajesz przy Polsce. Druga oferta naturalizacji już się nie pojawi.</span>';
    reject.onclick=()=>{
      log(`Odrzucasz naturalizację: ${country}.`,'Jednorazowa możliwość została wykorzystana.');
      finish();
    };

    els.decisionChoices.appendChild(accept);
    els.decisionChoices.appendChild(reject);
  }

  function offerWorldPlayoffChoice(next){
    const fixture=nssPolska.getPendingWorldPlayoffMatch();
    if(!fixture){next();return;}
    state.pendingDecision=true;
    els.playSeasonBtn.classList.add('hidden');
    els.decisionBox.classList.remove('hidden');
    els.decisionKicker.textContent=`WIELKI MECZ • BARAŻ INTERKONTYNENTALNY • ŚCIEŻKA ${fixture.path}`;
    els.decisionTitle.textContent=`${fixture.label}: ${fixture.teamName} — ${fixture.opponentName}`;
    els.decisionText.innerHTML=`<strong>Stawką jest ${fixture.key==='FINAL'?'awans na mundial':'miejsce w finale barażu'}.</strong><br>To pojedynczy mecz pucharowy. Remis oznacza dogrywkę i, jeśli trzeba, rzuty karne.`;
    els.decisionChoices.innerHTML='';

    const leaveScreen=()=>{
      state.pendingDecision=false;
      els.decisionBox.classList.add('hidden');
      els.playSeasonBtn.classList.remove('hidden');
      render();
      if(state.pendingWorldPlayoff)offerWorldPlayoffChoice(next);
      else next();
    };

    const showResult=outcome=>{
      const score=playedMatchScoreText({
        gf:outcome.match.gf,ga:outcome.match.ga,
        extra:outcome.match.extra,penalties:outcome.match.penalties,
        penaltyScore:outcome.match.penaltyScore
      });
      els.decisionKicker.textContent='WIELKI MECZ • WYNIK';
      els.decisionTitle.textContent=outcome.qualified
        ?`${fixture.teamName} JEDZIE NA MUNDIAL!`
        :outcome.won
          ?`${fixture.teamName} AWANSUJE DO FINAŁU BARAŻU!`
          :`${fixture.teamName} ODPADA Z WALKI O MUNDIAL`;
      els.decisionText.innerHTML=`<strong>${escapeDecisionHtml(fixture.teamName)} ${score} ${escapeDecisionHtml(fixture.opponentName)}</strong><br>${outcome.qualified?'Baraż wygrany — miejsce w turnieju finałowym jest zapewnione.':outcome.won?'Przed tobą jeszcze finał ścieżki barażowej.':'Ta porażka kończy eliminacje.'}`;
      els.decisionChoices.innerHTML='';
      const continueBtn=document.createElement('button');
      continueBtn.className='primary full';
      continueBtn.textContent=state.pendingWorldPlayoff?'DALEJ — FINAŁ BARAŻU':'DALEJ';
      continueBtn.onclick=leaveScreen;
      els.decisionChoices.appendChild(continueBtn);
      focusDecisionResult();
    };

    const playBtn=document.createElement('button');
    playBtn.className='choice-btn';
    playBtn.innerHTML=`<span class="choice-main">ZAGRAJ WIELKI MECZ</span><span class="choice-stake">${escapeDecisionHtml(fixture.teamName)} (${fixture.homeStrength} OVR) — ${escapeDecisionHtml(fixture.opponentName)} (${fixture.opponentStrength} OVR).</span>`;
    playBtn.onclick=()=>{
      els.decisionChoices.innerHTML='<p class="choice-stake">Przechodzimy na stadion…</p>';
      nssPolska.playPendingWorldPlayoffMatch().then(showResult).catch(error=>{
        els.decisionTitle.textContent='NIE UDAŁO SIĘ URUCHOMIĆ MECZU';
        els.decisionText.textContent=error?.message||'Nieznany błąd barażu.';
        els.decisionChoices.innerHTML='';
        const back=document.createElement('button');back.className='primary full';back.textContent='WRÓĆ';
        back.onclick=()=>offerWorldPlayoffChoice(next);els.decisionChoices.appendChild(back);
      });
    };

    const simulateBtn=document.createElement('button');
    simulateBtn.className='choice-btn';
    simulateBtn.innerHTML='<span class="choice-main">ZASYMULUJ MECZ</span><span class="choice-stake">Wynik zależy od siły obu reprezentacji; w razie remisu zostanie wyłoniony zwycięzca.</span>';
    simulateBtn.onclick=()=>showResult(nssPolska.simulatePendingWorldPlayoffMatch());

    els.decisionChoices.appendChild(playBtn);
    els.decisionChoices.appendChild(simulateBtn);
  }

  // Po awansie reprezentacji turniej nigdy nie uruchamia się sam. Gracz wybiera,
  // czy chce przejść przez wszystkie mecze, czy od razu poznać wylosowany
  // wynik kadry. Obie ścieżki zapisują ten sam typ historii turniejowej.
  function offerTournamentChoice(next){
    const pending=state.pendingTournament;
    if(!pending){ next(); return; }
    const teamName=pending.teamName||representedCountryName();
    const label=window.PPSNaturalization.TOURNAMENT_LABELS[pending.kind]||pending.kind;

    state.pendingDecision=true;
    els.playSeasonBtn.classList.add('hidden');
    els.decisionBox.classList.remove('hidden');
    els.decisionTitle.textContent=`${teamName} jedzie na ${label} ${pending.year}!`;
    els.decisionText.textContent=`Chcesz rozegrać turniej mecz po meczu, czy od razu poznać szybki wynik reprezentacji ${teamName}?`;
    els.decisionChoices.innerHTML='';

    const finish=()=>{
      state.pendingDecision=false;
      els.decisionBox.classList.add('hidden');
      els.playSeasonBtn.classList.remove('hidden');
      render();
      next();
    };

    const playBtn=document.createElement('button');
    playBtn.className='choice-btn';
    playBtn.innerHTML=`<span class="choice-main">GRAM TURNIEJ</span><span class="choice-stake">Faza grupowa, tabele i kolejne mecze reprezentacji ${escapeDecisionHtml(teamName)} będą rozgrywane interaktywnie.</span>`;
    playBtn.onclick=()=>{
      els.decisionChoices.innerHTML='<p class="choice-stake">Przechodzimy do turnieju…</p>';
      nssPolska.playPendingTournament(()=>finish());
    };

    const simulateBtn=document.createElement('button');
    simulateBtn.className='choice-btn';
    simulateBtn.innerHTML=`<span class="choice-main">SZYBKI WYNIK</span><span class="choice-stake">Gra rozegra cały turniej w tle i pokaże drogę oraz końcowy wynik reprezentacji ${escapeDecisionHtml(teamName)}.</span>`;
    simulateBtn.onclick=()=>{
      const result=nssPolska.simulatePendingTournament();
      const champion=result.champion
        ? `${teamName} wygrywa turniej!`
        : `${teamName} kończy turniej na etapie: ${result.stage}.`;
      const matches=(result.polandMatches||[]).map(match=>
        `<div class="tournament-sim-match"><span>${match.phase}</span><strong>${escapeDecisionHtml(teamName)} ${match.gf}:${match.ga} ${match.opponent}</strong></div>`
      ).join('');
      els.decisionTitle.textContent=`${label} ${pending.year} — SZYBKI WYNIK`;
      els.decisionText.innerHTML=`<strong>${champion}</strong>${result.tournamentChampion?`<br>Mistrz turnieju: <strong>${result.tournamentChampion}</strong>.`:''}<br>Twój dorobek: <strong>${result.stats.goals||0} G / ${result.stats.assists||0} A</strong>.${matches?`<div class="tournament-sim-report">${matches}</div>`:''}`;
      els.decisionChoices.innerHTML='';
      const nextBtn=document.createElement('button');
      nextBtn.className='primary full';
      nextBtn.textContent='DALEJ';
      nextBtn.onclick=finish;
      els.decisionChoices.appendChild(nextBtn);
    };

    els.decisionChoices.appendChild(playBtn);
    els.decisionChoices.appendChild(simulateBtn);
  }

  // Przetwarza kolejkę meczów decydujących jeden po drugim (może być ich
  // kilka w tym samym sezonie — np. puchar i awans naraz).
  function processDecisiveQueue(queue,idx,finalize){
    if(idx>=queue.length){ finalize(); return; }
    offerDecisiveMatch(queue[idx],()=>processDecisiveQueue(queue,idx+1,finalize));
  }

  const REGION_CUP_NAME={
    'Dolnośląskie':'Dolnego Śląska','Kujawsko-pomorskie':'Kujaw i Pomorza',
    'Lubelskie':'Lubelszczyzny','Lubuskie':'Ziemi Lubuskiej','Łódzkie':'Ziemi Łódzkiej',
    'Małopolskie':'Małopolski','Mazowieckie':'Mazowsza','Opolskie':'Opolszczyzny',
    'Podkarpackie':'Podkarpacia','Podlaskie':'Podlasia','Pomorskie':'Pomorza',
    'Śląskie':'Śląska','Świętokrzyskie':'Ziemi Świętokrzyskiej',
    'Warmińsko-mazurskie':'Warmii i Mazur','Wielkopolskie':'Wielkopolski',
    'Zachodniopomorskie':'Pomorza Zachodniego'
  };

  // Sześć najmocniejszych polskich klubów według bazowej siły. Nie wpisujemy
  // nazw na sztywno, więc zmiana danych automatycznie aktualizuje kwalifikację.
  const POLISH_CONFERENCE_TOP6=CLUBS
    .filter(c=>c.tier===6&&!c.reserve)
    .slice()
    .sort((a,b)=>b.strength-a.strength||a.name.localeCompare(b.name,'pl'))
    .slice(0,6)
    .map(c=>c.name);

  function conferenceLeagueChance(club,grade,performance,polishClub=false){
    const gradeIndex=clamp(grade?.index??4,0,8);
    const seasonModifier=[-1.2,-1,-.7,-.4,-.1,.35,.85,1.4,2.1][gradeIndex];
    const performanceModifier=clamp((performance-38)*.025,-.35,.55);

    if(polishClub){
      if(!POLISH_CONFERENCE_TOP6.includes(club.name)) return 0;
      // Lech (80 OVR klubu) zaczyna w okolicach 4,5–5%, a świetny sezon
      // podnosi szansę w okolice 5,5–6%. Kolejne kluby schodzą stopniowo.
      const strengthBase=1.4+Math.max(0,club.strength-74)*.55;
      return clamp(strengthBase+seasonModifier+performanceModifier,.35,7.5);
    }

    if(!isForeignClub(club)||club.foreignTier!==3||club.zone!=='Europa') return 0;
    // Europejskie T3: od ok. 1% dla dołu tieru do ok. 4–5% dla jego czołówki.
    const strengthBase=1.25+Math.max(0,club.strength-74)*.26;
    return clamp(strengthBase+seasonModifier+performanceModifier,.5,7);
  }

  function conferenceFinalOpponent(homeClub){
    const eligible=GAME_DATA.foreignClubs
      .filter(c=>
        c.name!==homeClub.name &&
        c.zone==='Europa' &&
        c.foreignTier===3 &&
        !foreignLowerLeagueInfo(c)
      )
      .slice()
      .sort((a,b)=>b.strength-a.strength||a.name.localeCompare(b.name,'pl'));
    // Losujemy wyłącznie z czołówki prawidłowego T3. Kluby Championship,
    // Serie B, 2. Bundesligi itd. odpadają przez foreignLowerLeagueInfo().
    const topPool=eligible.slice(0,12);
    return topPool.length?{...pick(topPool)}:null;
  }

  function queueConferenceLeagueFinal(queue,club,standing,notes,homeStrength=club.strength){
    const opponent=conferenceFinalOpponent(club);
    if(!opponent) return false;
    queue.push({
      kicker:'LIGA KONFERENCJI',
      title:'Finał Ligi Konferencji!',
      text:`${club.name} gra w finale Ligi Konferencji z ${opponent.name}. Remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
      homeName:club.name,homeStrength,
      opponent,
      knockout:true,drawCountsAsSuccess:false,
      onSuccess:()=>{
        addTrophy('Liga Konferencji',55);
        standing.cups.push('Liga Konferencji');
        notes.push('🌍 🏆 Liga Konferencji');
      }
    });
    return true;
  }

  // Najmocniejsze kluby południowoamerykańskiego T3 mogą dojść zarówno do
  // finału Libertadores, jak i Sudamericany. Lista wynika z danych, więc nie
  // trzeba jej ręcznie aktualizować po zmianie overalli klubów.
  const SOUTH_AMERICAN_LIBERTADORES_T3=GAME_DATA.foreignClubs
    .filter(c=>c.zone==='Ameryka Południowa'&&c.foreignTier===3&&!foreignLowerLeagueInfo(c))
    .slice()
    .sort((a,b)=>b.strength-a.strength||a.name.localeCompare(b.name,'pl'))
    .slice(0,12)
    .map(c=>c.name);

  function continentalFinalOpponent(homeClub,competition){
    const confederationMatch=c=>{
      if(competition==='Liga Mistrzów'||competition==='Liga Europy') return c.zone==='Europa';
      if(/Copa Libertadores|Copa Sudamericana/.test(competition)) return c.zone==='Ameryka Południowa';
      if(competition==='CONCACAF Champions Cup') return c.zone==='Ameryka Północna'||c.zone==='Ameryka Środkowa';
      if(/^AFC /.test(competition)) return c.zone==='Azja';
      if(competition==='CAF Champions League') return c.zone==='Afryka';
      if(competition==='OFC Champions League') return c.zone==='Oceania';
      return false;
    };
    const tournamentLevelMatch=c=>{
      if(competition==='Liga Mistrzów') return c.foreignTier===1;
      if(competition==='Liga Europy') return c.foreignTier===2;
      if(competition==='Copa Libertadores') return c.foreignTier<=3;
      if(competition==='Copa Sudamericana') return c.foreignTier>=3;
      if(competition==='AFC Champions League') return c.foreignTier<=3;
      if(competition==='AFC Champions League Two') return c.foreignTier>=4;
      if(competition==='AFC Challenge League') return c.foreignTier>=5;
      return true;
    };
    const eligible=GAME_DATA.foreignClubs
      .filter(c=>
        c.name!==homeClub.name &&
        confederationMatch(c) &&
        tournamentLevelMatch(c) &&
        !foreignLowerLeagueInfo(c)
      )
      .slice()
      .sort((a,b)=>b.strength-a.strength||a.name.localeCompare(b.name,'pl'));
    const topPool=eligible.slice(0,12);
    return topPool.length?{...pick(topPool)}:null;
  }

  function queueContinentalFinal(queue,club,competition,standing,notes,afterSuccess=null,homeStrength=club.strength){
    const opponent=continentalFinalOpponent(club,competition);
    if(!opponent) return false;
    queue.push({
      kicker:competition.toUpperCase(),
      title:`Finał: ${competition}!`,
      text:`${club.name} gra w finale ${competition} z ${opponent.name}. Remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
      homeName:club.name,homeStrength,
      opponent,
      knockout:true,drawCountsAsSuccess:false,
      onSuccess:()=>{
        addTrophy(competition,55);
        standing.cups.push(competition);
        notes.push(`🌍 🏆 ${competition}`);
        if(typeof afterSuccess==='function') afterSuccess();
      }
    });
    return true;
  }

  function queueRealLeagueCupFinals(queue,club,seasonTier,performance,form,grade,standing,notes,teamStrength){
    if(isForeignClub(club)){
      const ft=club.foreignTier;
      const lower=!!foreignLowerLeagueInfo(club);
      const rivalPool=foreignLeaguePeers(club);
      const domesticCupChance=clamp((({1:12,2:8,3:4,4:2,5:1,6:1,7:1,8:1})[ft]||1)+(teamStrength-club.strength)*.16,.25,15);
      if(rand(1,100)<=domesticCupChance){
        const trophy=`Puchar kraju (${club.country})`;
        queue.push({
          kicker:'PUCHAR KRAJU',title:`Finał pucharu — ${club.country}!`,
          text:`${club.name} gra w finale pucharu krajowego. Remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name,homeStrength:teamStrength,
          opponent:pickRivalClub(rivalPool,club.name,club.strength),knockout:true,drawCountsAsSuccess:false,
          onSuccess:()=>{addTrophy(trophy,32);standing.cups.push(trophy);notes.push(`🏆 ${trophy}`);}
        });
      }
      let continental=null,continentalChance=0,qualified=false;
      if(!lower){
        if(club.zone==='Europa'){
          if(ft===1){continental='Liga Mistrzów';continentalChance=7+Math.max(0,teamStrength-95);}
          else if(ft===2){continental='Liga Europy';continentalChance=4;}
          else if(ft===3){continental='Liga Konferencji';continentalChance=conferenceLeagueChance(club,grade,performance,false);}
        } else if(club.zone==='Ameryka Południowa'){
          if(ft===3&&SOUTH_AMERICAN_LIBERTADORES_T3.includes(club.name)&&Math.random()*100<4){continental='Copa Libertadores';qualified=true;}
          else{continental=ft<=2?'Copa Libertadores':'Copa Sudamericana';continentalChance=ft<=2?6:ft===3?3:1;}
        } else if(club.zone==='Ameryka Północna'||club.zone==='Ameryka Środkowa'){
          continental='CONCACAF Champions Cup';continentalChance=ft===2?5:ft===3?3:1;
        } else if(club.zone==='Azja'){
          if(ft<=3){continental='AFC Champions League';continentalChance=ft===2?5:ft===3?3:2;}
          else if(ft===4){continental='AFC Champions League Two';continentalChance=2;}
          else{continental='AFC Challenge League';continentalChance=ft===5?2:1;}
        } else if(club.zone==='Afryka'){
          continental='CAF Champions League';continentalChance=ft===3?4:2;
        } else if(club.zone==='Oceania'){
          continental='OFC Champions League';continentalChance=club.name==='Auckland City'?9:(ft>=6?1:3);
        }
      }
      if(continentalChance>0) continentalChance=clamp(continentalChance+(teamStrength-club.strength)*.18,.25,15);
      if(continental&&(qualified||Math.random()*100<continentalChance)){
        if(continental==='Liga Konferencji') queueConferenceLeagueFinal(queue,club,standing,notes,teamStrength);
        else queueContinentalFinal(queue,club,continental,standing,notes,continental==='Liga Mistrzów'?()=>{
          const award=maybeBallonDorAfterChampionsLeague(form,performance);
          if(award) notes.push(award);
        }:null,teamStrength);
      }
      return;
    }

    if(seasonTier>=3){
      const cupChance=seasonTier===6?Math.max(1.5,2.4+(teamStrength-74)*.55):seasonTier===5?1.4+Math.max(0,teamStrength-club.strength)*.12:.35;
      if(Math.random()*100<cupChance){
        const cupPool=CLUBS.filter(candidate=>candidate.tier>=Math.max(3,seasonTier-1)&&candidate.tier<=Math.min(6,seasonTier+1));
        queue.push({
          kicker:'PUCHAR POLSKI',title:'Finał Pucharu Polski!',
          text:`${club.name} gra w finale Pucharu Polski. Remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name,homeStrength:teamStrength,opponent:pickRivalClub(cupPool,club.name,club.strength),
          knockout:true,drawCountsAsSuccess:false,
          onSuccess:()=>{addTrophy('Puchar Polski',38);standing.cups.push('Puchar Polski');notes.push('🏆 Puchar Polski');}
        });
      }
    }
    if(seasonTier<=3&&club.region){
      const context=leagueStandingContext(club,seasonTier);
      const chance=(seasonTier===3?4:seasonTier===2?3:2)*clamp(1+(teamStrength-context.average)*.08,.55,1.8);
      if(Math.random()*100<chance){
        const regionalPool=CLUBS.filter(candidate=>candidate.region===club.region&&candidate.name!==club.name&&candidate.tier<=4);
        const trophy=`Puchar ${REGION_CUP_NAME[club.region]||club.region}`;
        queue.push({
          kicker:trophy.toUpperCase(),title:`Finał: ${trophy}!`,
          text:`${club.name} gra w finale pucharu regionalnego. Remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name,homeStrength:teamStrength,opponent:pickRivalClub(regionalPool,club.name,club.strength),
          knockout:true,drawCountsAsSuccess:false,
          onSuccess:()=>{addTrophy(trophy,18);standing.cups.push(trophy);notes.push(`🏆 ${trophy}`);}
        });
      }
    }
    const conferenceChance=seasonTier===6?conferenceLeagueChance({...club,strength:teamStrength},grade,performance,true):0;
    if(conferenceChance>0&&Math.random()*100<conferenceChance) queueConferenceLeagueFinal(queue,club,standing,notes,teamStrength);
  }

  function coopClubSeasonKey(club){return `${state.seasonYear}|${worldClubId(club)}`;}
  function coopSharedClubCups(club){
    if(!coopIsActive()||coopAssignmentsAtClub(club).length<2)return null;
    return coopSession.clubCupResults?.[coopClubSeasonKey(club)]||null;
  }
  function coopRememberClubCups(club,standing){
    if(!coopIsActive()||coopAssignmentsAtClub(club).length<2)return;
    coopSession.clubCupResults=coopSession.clubCupResults||{};
    const records=(standing.cups||[]).map(name=>{
      const trophy=(state.trophyHistory||[]).find(item=>item.year===state.seasonYear&&item.club===club.name&&item.name===name);
      return {name,score:trophy?.score||clubTrophyLegacyPoints(name)};
    });
    coopSession.clubCupResults[coopClubSeasonKey(club)]=records;
  }
  function coopApplySharedClubCups(club,standing,notes,records){
    (records||[]).forEach(record=>{
      const already=(state.trophyHistory||[]).some(item=>item.year===state.seasonYear&&item.club===club.name&&item.name===record.name);
      if(!already)addTrophy(record.name,record.score);
      if(!standing.cups.includes(record.name))standing.cups.push(record.name);
      if(!notes.some(note=>note.includes(record.name)))notes.push(`🏆 ${record.name} • wspólny wynik klubu w co-opie`);
    });
  }

  function resolveClubSeason(performance, club, seasonTier, form, grade, minutes, done){
    const notes=[];
    const queue=[];
    const standing=simulateLeagueStanding(club,seasonTier,grade,minutes);
    const teamStrength=standing.effectiveClubStrength||effectiveClubStrength(club,grade,minutes);
    const finishClubSeason=()=>{
      coopRememberClubCups(club,standing);
      notes.unshift(`${standing.place}. miejsce w ${standing.competition}`);
      done(notes.join(' • '),{...standing,cups:standing.cups.slice()});
    };

    if(standing.realLeague){
      if(standing.champion){
        const trophy=isForeignClub(club)
          ?(foreignLowerLeagueInfo(club)?`Mistrzostwo ligi: ${club.league}`:`Mistrzostwo: ${club.league||club.country}`)
          :(seasonTier===6?'Mistrzostwo Polski':`Mistrzostwo ligi: ${polishCompetitionName(club)}`);
        const points=isForeignClub(club)?(foreignLowerLeagueInfo(club)?28:42):(seasonTier===6?45:28);
        addTrophy(trophy,points); standing.cups.push(trophy); notes.push(`🏆 ${trophy}`);
      }
      if(standing.promoted){
        state.promotions++;
        if(state.loanReturn){
          state.score+=12;
          notes.push(`⬆️ Pomagasz ${club.name} awansować${standing.promotionViaPlayoff?' po barażach':''} do ${clubCompetition(state.club)}`);
        } else {
          state.justPromoted=true; state.score+=18;
          const hierarchyBonus=grantPromotionHierarchyBonus(club,state.club,grade,minutes);
          const financialProgress=applyPromotionFinancialProgression(club,state.club);
          if(!isForeignClub(state.club)) state.highestTier=Math.max(state.highestTier,state.club.tier||0);
          else state.bestForeignTier=state.bestForeignTier?Math.min(state.bestForeignTier,state.club.foreignTier):state.club.foreignTier;
          notes.push(`⬆️ Awans${standing.promotionViaPlayoff?' po barażach':''} do ${clubCompetition(state.club)}${hierarchyBonus?` • czołowa rola: +${hierarchyBonus} p.p. do szansy na grę`:''}`);
          if(financialProgress) notes.push(`💰 Rozwój finansów klubu ×${financialProgress.factor.toFixed(2).replace('.',',')}${financialProgress.previous!==null&&financialProgress.current>financialProgress.previous?` • nowy kontrakt ${formatMoney(financialProgress.current/12)} miesięcznie`:''}`);
          log(`AWANS: ${club.name}`,`${standing.competition} → ${clubCompetition(state.club)}`);
        }
      }
      if(standing.relegated){
        if(!state.loanReturn) state.justRelegated=true;
        notes.push(`⬇️ Spadek${standing.relegationViaPlayoff?' po barażach':''} do ${clubCompetition(state.club)}`);
        log(`SPADEK: ${club.name}`,`${standing.competition} → ${clubCompetition(state.club)}`);
      }
      state.forceCorruptPromotion=false;
      const sharedCups=coopSharedClubCups(club);
      if(sharedCups){
        coopApplySharedClubCups(club,standing,notes,sharedCups);
        finishClubSeason();
        return;
      }
      queueRealLeagueCupFinals(queue,club,seasonTier,performance,form,grade,standing,notes,teamStrength);
      processDecisiveQueue(queue,0,finishClubSeason);
      return;
    }

    if(isForeignClub(club)){
      const ft=club.foreignTier;
      const lowerInfo=foreignLowerLeagueInfo(club);
      const promotionInfo=foreignPromotionInfo(club);
      const relegationInfo=foreignRelegationInfo(club);
      const isLower=!!lowerInfo;
      const domesticCupChance=clamp((({1:12,2:8,3:4,4:2,5:1,6:1,7:1,8:1})[ft]||1)+(teamStrength-club.strength)*.16,.25,15);
      const rivalPool=foreignLeaguePeers(club);

      // Miejsce w tabeli otwiera mecz o tytuł albo awans. Jego wynik może
      // przesunąć końcową pozycję, ale nigdy nie stworzy sprzecznego opisu.
      function maybeForeignPromotionWithoutTitle(){
        if(!promotionInfo || state.loanReturn || standing.place>3) return;
        queue.push({
          kicker:'BARAŻ O AWANS',
          title:`Baraż o awans do ${promotionInfo.to}!`,
          text:`${club.name} kończy sezon w czołówce i ma szansę na awans przez baraż. Remis też awansuje. Zagrać decydujący mecz, czy zasymulować wynik?`,
          homeName:club.name, homeStrength:teamStrength,
          opponent:pickRivalClub(rivalPool,club.name,club.strength),
          knockout:false, drawCountsAsSuccess:true,
          onSuccess:()=>{
            if(applyForeignPromotion(club,promotionInfo,false,grade,minutes)){
              setPromotionSuccess(standing); notes.push(`⬆️ Awans do ${promotionInfo.to}`);
            }
          },
          onFailure:()=>setPromotionFailure(standing)
        });
      }

      if(isLower){
        // Na niższym szczeblu można zostać mistrzem SWOJEJ ligi.
        // Jeśli istnieje normalny szczebel wyżej, tytuł automatycznie daje awans.
        if(standing.place===1){
          const t=`Mistrzostwo ligi: ${club.league}`;
          queue.push({
            kicker:'MISTRZOSTWO LIGI',
            title:`Walczysz o mistrzostwo ligi (${club.league})!`,
            text:`${club.name} może zostać mistrzem. Remis też wystarcza do tytułu. Zagrać decydujący mecz, czy zasymulować wynik?`,
            homeName:club.name, homeStrength:teamStrength,
            opponent:pickRivalClub(rivalPool,club.name,club.strength),
            knockout:false, drawCountsAsSuccess:true,
            onSuccess:()=>{
              setTitleSuccess(standing); addTrophy(t,28); standing.cups.push(t); notes.push(`🏆 ${t}`);
              if(promotionInfo && applyForeignPromotion(club,promotionInfo,true,grade,minutes)){
                standing.promoted=true; notes.push(`⬆️ Awans do ${promotionInfo.to}`);
              }
            },
            onFailure:()=>{ setTitleFailure(standing); maybeForeignPromotionWithoutTitle(); }
          });
        } else {
          maybeForeignPromotionWithoutTitle();
        }
      } else {
        // Najwyższy szczebel: pierwsze miejsce otwiera decydujący mecz o tytuł.
        if(standing.place===1){
          const t=`Mistrzostwo: ${club.league||club.country}`;
          queue.push({
            kicker:'MISTRZOSTWO KRAJU',
            title:`Walczysz o mistrzostwo kraju (${club.league||club.country})!`,
            text:`${club.name} może zdobyć tytuł. Remis też wystarcza. Zagrać decydujący mecz, czy zasymulować wynik?`,
            homeName:club.name, homeStrength:teamStrength,
            opponent:pickRivalClub(rivalPool,club.name,club.strength),
            knockout:false, drawCountsAsSuccess:true,
            onSuccess:()=>{ setTitleSuccess(standing); addTrophy(t,42); standing.cups.push(t); notes.push(`🏆 ${t}`); },
            onFailure:()=>setTitleFailure(standing)
          });
        }
      }

      // Każda liga, która ma w bazie realny szczebel niżej, może też z niego
      // skorzystać w drugą stronę. Dotyczy to zarówno najwyższych lig, jak i
      // Championship/2. Bundesligi/Serie B mających jeszcze poziom pod sobą.
      const firstDown=standing.teams-relegationPlaces(standing.teams)+1;
      if(relegationInfo && standing.place>=firstDown && !state.loanReturn){
        setRelegation(standing);
        if(applyForeignRelegation(club,relegationInfo)){
          notes.push(`⬇️ Spadek do ${relegationInfo.to}`);
        }
      }

      // Puchar jest niezależnym rzutem — możliwy jest dublet / potrójna korona.
      if(rand(1,100)<=domesticCupChance){
        const t=`Puchar kraju (${club.country})`;
        queue.push({
          kicker:'PUCHAR KRAJU',
          title:`Finał pucharu — ${club.country}!`,
          text:`${club.name} gra w finale pucharu krajowego. Tu liczy się tylko zwycięstwo — remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name, homeStrength:teamStrength,
          opponent:pickRivalClub(rivalPool,club.name,club.strength),
          knockout:true, drawCountsAsSuccess:false,
          onSuccess:()=>{ addTrophy(t,32); standing.cups.push(t); notes.push(`🏆 ${t}`); }
        });
      }

      // Procent oznacza szansę dotarcia do finału. Każdy puchar kontynentalny
      // prowadzi do grywalnego finału; trofeum wpada dopiero po zwycięstwie.
      let continental=null, continentalChance=0, continentalQualified=false;
      if(!isLower){
        if(club.zone==='Europa'){
          if(ft===1){ continental='Liga Mistrzów'; continentalChance=7+Math.max(0,teamStrength-95); }
          else if(ft===2){ continental='Liga Europy'; continentalChance=4; }
          else if(ft===3){ continental='Liga Konferencji'; continentalChance=conferenceLeagueChance(club,grade,performance,false); }
        } else if(club.zone==='Ameryka Południowa'){
          if(ft===3 && SOUTH_AMERICAN_LIBERTADORES_T3.includes(club.name) && Math.random()*100<4){
            continental='Copa Libertadores';
            continentalQualified=true;
          } else {
            continental=ft<=2?'Copa Libertadores':'Copa Sudamericana';
            continentalChance=ft<=2?6:ft===3?3:1;
          }
        } else if(club.zone==='Ameryka Północna' || club.zone==='Ameryka Środkowa'){
          continental='CONCACAF Champions Cup'; continentalChance=ft===2?5:ft===3?3:1;
        } else if(club.zone==='Azja'){
          if(ft<=3){
            continental='AFC Champions League';
            continentalChance=ft===2?5:ft===3?3:2;
          } else if(ft===4){
            continental='AFC Champions League Two';
            continentalChance=2;
          } else {
            continental='AFC Challenge League';
            continentalChance=ft===5?2:1;
          }
        } else if(club.zone==='Afryka'){
          continental='CAF Champions League'; continentalChance=ft===3?4:2;
        } else if(club.zone==='Oceania'){
          continental='OFC Champions League'; continentalChance=club.name==='Auckland City'?9:(ft>=6?1:3);
        }
      }
      if(continentalChance>0) continentalChance=clamp(continentalChance+(teamStrength-club.strength)*.18,.25,15);
      if(continental && (continentalQualified || Math.random()*100<continentalChance)){
        if(continental==='Liga Konferencji'){
          queueConferenceLeagueFinal(queue,club,standing,notes,teamStrength);
        } else {
          const afterSuccess=continental==='Liga Mistrzów'?()=>{
            const bd=maybeBallonDorAfterChampionsLeague(form,performance);
            if(bd) notes.push(bd);
          }:null;
          queueContinentalFinal(queue,club,continental,standing,notes,afterSuccess,teamStrength);
        }
      }

      processDecisiveQueue(queue,0,finishClubSeason);
      return;
    }

    // Kluby polskie.
    // Puchar Polski może wygrać także klub spoza Ekstraklasy, ale to rzadkie.
    if(seasonTier>=3){
      const cupChance = seasonTier===6 ? Math.max(1.5, 2.4+(teamStrength-74)*.55) : seasonTier===5 ? 1.4+Math.max(0,teamStrength-club.strength)*.12 : .35;
      if(Math.random()*100<cupChance){
        const cupPool=CLUBS.filter(c=>c.tier>=Math.max(3,seasonTier-1) && c.tier<=Math.min(6,seasonTier+1));
        queue.push({
          kicker:'PUCHAR POLSKI',
          title:'Finał Pucharu Polski!',
          text:`${club.name} gra w finale Pucharu Polski. Tu liczy się tylko zwycięstwo — remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name, homeStrength:teamStrength,
          opponent:pickRivalClub(cupPool,club.name,club.strength),
          knockout:true, drawCountsAsSuccess:false,
          onSuccess:()=>{ addTrophy('Puchar Polski',38); standing.cups.push('Puchar Polski'); notes.push('🏆 Puchar Polski'); }
        });
      }
    }

    // Osobny Puchar Regionalny dla III ligi i niżej. Szansa zależy trochę
    // od siły klubu względem regionalnej konkurencji, ale pozostaje rzadka.
    if(seasonTier<=3 && club.region){
      const context=leagueStandingContext(club,seasonTier);
      const baseChance=seasonTier===3?4:seasonTier===2?3:2;
      const strengthFactor=clamp(1+(teamStrength-context.average)*.08,.55,1.8);
      const regionalCupChance=baseChance*strengthFactor;
      if(Math.random()*100<regionalCupChance){
        const regionalPool=CLUBS.filter(c=>c.region===club.region && c.name!==club.name && c.tier<=4);
        const cupName=`Puchar ${REGION_CUP_NAME[club.region]||club.region}`;
        queue.push({
          kicker:cupName.toUpperCase(),
          title:`Finał: ${cupName}!`,
          text:`${club.name} gra w finale pucharu regionalnego. Tu liczy się tylko zwycięstwo — remis oznacza dogrywkę i rzuty karne. Zagrać finał, czy zasymulować wynik?`,
          homeName:club.name,homeStrength:teamStrength,
          opponent:pickRivalClub(regionalPool,club.name,club.strength),
          knockout:true,drawCountsAsSuccess:false,
          onSuccess:()=>{ addTrophy(cupName,18); standing.cups.push(cupName); notes.push(`🏆 ${cupName}`); }
        });
      }
    }

    // Czołowa szóstka polskiej bazy może wygrać Ligę Konferencji. To osobny,
    // rzadki rzut: Lech ma realną, ale nadal jednocyfrową szansę; słabsze
    // kluby z TOP 6 odpowiednio mniejszą. Forma sezonu delikatnie ją przesuwa.
    const polishConferenceChance=seasonTier===6
      ?conferenceLeagueChance({...club,strength:teamStrength},grade,performance,true)
      :0;
    if(polishConferenceChance>0 && Math.random()*100<polishConferenceChance){
      queueConferenceLeagueFinal(queue,club,standing,notes,teamStrength);
    }

    if(seasonTier===6){
      if(standing.place===1){
        const titlePool=CLUBS.filter(c=>c.tier===6);
        queue.push({
          kicker:'MISTRZOSTWO POLSKI',
          title:'Walczysz o Mistrzostwo Polski!',
          text:`${club.name} może zdobyć tytuł mistrza Polski. Remis też wystarcza do mistrzostwa. Zagrać decydujący mecz, czy zasymulować wynik?`,
          homeName:club.name, homeStrength:teamStrength,
          opponent:pickRivalClub(titlePool,club.name,club.strength),
          knockout:false, drawCountsAsSuccess:true,
          onSuccess:()=>{ setTitleSuccess(standing); addTrophy('Mistrzostwo Polski',45); standing.cups.push('Mistrzostwo Polski'); notes.push('🏆 Mistrzostwo Polski'); },
          onFailure:()=>setTitleFailure(standing)
        });
      }
      const firstDown=standing.teams-relegationPlaces(standing.teams)+1;
      if(standing.place>=firstDown && !state.loanReturn){
        setRelegation(standing);
        const transition=applyPolishCompetitionTransition(state.club,1);
        state.justRelegated=!!transition;
        if(transition){
          log(`SPADEK: ${state.club.name}`,`${transition.from} → ${transition.to}`);
          notes.push(`⬇️ Spadek do ${transition.to}`);
        }
      }
      processDecisiveQueue(queue,0,finishClubSeason);
      return;
    }

    if(seasonTier<=5){
      if(state.forceCorruptPromotion){
        state.forceCorruptPromotion=false;
        const old=seasonTier;
        state.promotions++;
        setPromotionSuccess(standing);
        if(state.loanReturn){
          notes.push(`⬆️ ${club.name} awansuje po ustawionym meczu`);
          processDecisiveQueue(queue,0,finishClubSeason);
          return;
        }
        const transition=applyPolishCompetitionTransition(state.club,-1);
        if(!transition){
          processDecisiveQueue(queue,0,finishClubSeason);
          return;
        }
        grantPromotionHierarchyBonus(club,state.club,grade,minutes);
        state.highestTier=Math.max(state.highestTier,state.club.tier);
        state.justPromoted=true;
        log(`AWANS: ${state.club.name}`,`${transition.from} → ${transition.to} • ustawiony kluczowy mecz`);
        notes.push(`⬆️ Awans do ${transition.to} po ustawionym meczu`);
        processDecisiveQueue(queue,0,finishClubSeason);
        return;
      }

      function maybeRelegation(){
        if(state.loanReturn || !polishCompetitionTarget(state.club,1)) return;
        const firstDown=standing.teams-relegationPlaces(standing.teams)+1;
        if(standing.place>=firstDown){
          setRelegation(standing);
          const transition=applyPolishCompetitionTransition(state.club,1);
          state.justRelegated=!!transition;
          if(transition){
            log(`SPADEK: ${state.club.name}`,`${transition.from} → ${transition.to}`);
            notes.push(`⬇️ Spadek do ${transition.to}`);
          }
        }
      }

      const promotionTarget=polishCompetitionTarget(state.club,-1);
      if(standing.place<=2 && promotionTarget){
        if(state.loanReturn){
          standing.promoted=true;
          state.score+=12; notes.push(`⬆️ Pomagasz ${club.name} awansować`);
          processDecisiveQueue(queue,0,finishClubSeason);
          return;
        }
        const promoPool=polishLeaguePeers(club);
        queue.push({
          kicker:'AWANS',
          title:`Walczysz o awans do ${polishCompetitionName(promotionTarget)}!`,
          text:`${club.name} ma szansę na awans. Remis też awansuje. Zagrać decydujący mecz, czy zasymulować wynik?`,
          homeName:club.name, homeStrength:teamStrength,
          opponent:pickRivalClub(promoPool,club.name,club.strength),
          knockout:false, drawCountsAsSuccess:true,
          onSuccess:()=>{
            setPromotionSuccess(standing);
            state.promotions++;
            const transition=applyPolishCompetitionTransition(state.club,-1);
            const hierarchyBonus=grantPromotionHierarchyBonus(club,state.club,grade,minutes);
            state.highestTier=Math.max(state.highestTier,state.club.tier); state.justPromoted=true; state.score+=18;
            if(transition){
              log(`AWANS: ${state.club.name}`,`${transition.from} → ${transition.to}`);
              notes.push(`⬆️ Awans do ${transition.to}${hierarchyBonus?` • czołowa rola: +${hierarchyBonus} p.p. do szansy na grę`:''}`);
            }
          },
          onFailure:()=>setPromotionFailure(standing)
        });
      } else {
        maybeRelegation();
      }
    }
    processDecisiveQueue(queue,0,finishClubSeason);
  }
  function trophyMediaBonus(name){
    const n=String(name||'');
    if(/Mistrzostwo Świata/i.test(n)) return 8;
    if(/Mistrzostwo Europy/i.test(n)) return 7;
    if(/Liga Mistrzów/i.test(n)) return 6;
    if(/Copa Libertadores|CAF Champions League|AFC Champions League|CONCACAF Champions Cup/i.test(n)) return 4;
    if(/Liga Europy/i.test(n)) return 3;
    if(/Liga Konferencji|Copa Sudamericana|OFC Champions League/i.test(n)) return 2;
    if(/Mistrzostwo Polski/i.test(n)) return 3;
    if(/^Mistrzostwo:/i.test(n)) return 3;
    if(/Puchar Polski|^Puchar kraju/i.test(n)) return 2;
    if(/^Mistrzostwo ligi:/i.test(n)) return 1;
    return 1;
  }

  function addTrophy(name,score){
    const seasonLabel=`${state.seasonYear}/${String(state.seasonYear+1).slice(2)}`;
    state.trophies.push(`${name} (${seasonLabel})`);
    state.trophyHistory=state.trophyHistory||[];
    const national=/Mistrzostwo Świata|Mistrzostwo Europy/i.test(name);
    state.trophyHistory.push({
      name,year:state.seasonYear,club:state.club?.name||null,score,
      clubCredit:!national
    });
    state.score+=score;
    addSportMedia(trophyMediaBonus(name),`Trofeum: ${name}`);
  }

  function grantSeasonAward(name,score,media,club,detail=''){
    const seasonLabel=`${state.seasonYear}/${String(state.seasonYear+1).slice(2)}`;
    state.awardHistory=state.awardHistory||[];
    if(state.awardHistory.some(a=>a.name===name && a.year===state.seasonYear && a.club===club?.name)) return false;
    state.awards.push(`${name} (${seasonLabel})`);
    state.awardHistory.push({name,year:state.seasonYear,club:club?.name||null,competition:clubCompetition(club),score});
    state.score+=score;
    addSportMedia(media,name);
    log(name,detail||`${club?.name||'—'} • ${clubCompetition(club)}`);
    return true;
  }

  function awardDisplayName(award){
    return award?.type==='gornik_koguty'&&Number.isFinite(award.count)
      ?`Koguty × ${award.count}`
      :award?.name||'—';
  }

  function maybeGornikKoguty(apps,grade,club){
    if(club?.name!=='Górnik Zabrze'||!grade||grade.index<3||apps<1) return null;
    const ranges={
      3:[0,1], // PRZECIĘTNY
      4:[0,2], // PRZYZWOITY
      5:[1,3], // DOBRY
      6:[2,5], // ŚWIETNY
      7:[4,7], // WYBITNY
      8:[8,8]  // HISTORYCZNY — sezon życia
    };
    const [minimum,maximum]=ranges[grade.index]||[0,0];
    const homeAppearances=Math.ceil(apps/2);
    const count=Math.min(homeAppearances,rand(minimum,maximum));
    if(count<1) return null;
    const name='Koguty';
    const detail=`${count} ${count===1?'raz':'razy'} wybrany piłkarzem domowego meczu • ${grade.label} • ${apps} występów`;
    if(!grantSeasonAward(name,count*3,Math.min(6,count),club,detail)) return null;
    const entry=(state.awardHistory||[]).find(award=>award.name===name&&award.year===state.seasonYear&&award.club===club.name);
    if(entry){ entry.type='gornik_koguty'; entry.count=count; }
    state.gornikKogutyTotal=(state.gornikKogutyTotal||0)+count;
    return `🐓 Koguty × ${count}`;
  }

  function maybeAward(g,a,apps,grade,tier,club){
    const won=[];
    if(tier<3 || apps<scaledLeagueCount(18,club,1) || !grade) return won;
    const competition=clubCompetition(club);
    const add=(name,score,media,detail)=>{
      if(grantSeasonAward(name,score,media,club,detail)){ won.push(`🏅 ${name}`); return true; }
      return false;
    };

    // Sam próg 18 goli nie oznacza już automatycznej korony. Im większy
    // dorobek, tym większa szansa, że nikt w lidze nie strzelił więcej.
    const goals18=scaledLeagueCount(18,club,1),goals21=scaledLeagueCount(21,club,1),goals24=scaledLeagueCount(24,club,1),goals27=scaledLeagueCount(27,club,1),goals30=scaledLeagueCount(30,club,1);
    if(state.position==='FWD' && tier>=4 && g>=goals18){
      const chance=g>=goals30?100:g>=goals27?90:g>=goals24?70:g>=goals21?40:15;
      const roll=rand(1,100);
      if(roll<=chance)
        add(`Król strzelców — ${competition}`,25,4,`${g} goli • szansa ${chance}% • rzut ${roll}/100`);
      else
        log('Walka o koronę króla strzelców',`${competition} • ${g} goli • szansa ${chance}% • rzut ${roll}/100 → inny zawodnik zdobył więcej bramek`);
    }

    if(grade.index>=6){
      // Jeśli ocenę do ŚWIETNEJ podniosły naprawdę wyjątkowe liczby, gracz
      // jest mocnym kandydatem do XI sezonu, ale nagroda nadal nie jest pewna.
      const chance=grade.index>=8?100:grade.index>=7?75:grade.liftedByOutput?70:35;
      if(rand(1,100)<=chance)
        add(`Jedenastka sezonu — ${competition}`,22,4,`${grade.label} • ${apps} meczów`);
    }

    if(grade.index>=7){
      const chance=grade.index>=8?70:25;
      if(rand(1,100)<=chance)
        add(`Piłkarz sezonu — ${competition}`,34,6,`${grade.label} • ${apps} meczów`);
    }

    // Jednorazowe Odkrycie Roku. Można je zdobyć tylko jako młody zawodnik
    // Ekstraklasy albo odpowiednio mocnej ligi zagranicznej (foreignTier 1–3).
    const discoveryLevel=(!isForeignClub(club) && tier===6) || (isForeignClub(club) && club.foreignTier<=3);
    const discoveryAlreadyWon=(state.awardHistory||[]).some(a=>a.name==='Odkrycie Roku w Polsce');
    if(!discoveryAlreadyWon && state.age<=21 && discoveryLevel && grade.index>=6){
      const chance=grade.index>=8?100:grade.index>=7?80:40;
      if(rand(1,100)<=chance)
        add('Odkrycie Roku w Polsce',24,5,`${state.age} lat • ${grade.label} • ${competition}`);
    }

    const highPolishLevel=(!isForeignClub(club) && tier===6) || (isForeignClub(club) && club.foreignTier<=3);
    if(highPolishLevel && state.overall>=85 && grade.index>=5 && apps>=scaledLeagueCount(18,club,1)){
      // Pierwsze, rzadkie losowania otwierają się przy 85 OVR. Od 90 OVR
      // zawodnik jest już jednym z głównych kandydatów niezależnie od tego,
      // czy gra w Polsce, czy w mocnej lidze zagranicznej.
      let chance=state.overall>=90
        ?75+(state.overall-90)*4
        :({85:4,86:7,87:11,88:17,89:28}[state.overall]||4);
      if(grade.index>=8) chance+=10;
      else if(grade.index>=7) chance+=5;
      if(isForeignClub(club) && club.foreignTier<=2) chance+=4;
      if((state.seasonNationalCaps||0)>0) chance+=3;
      chance=clamp(chance,1,97);
      const roll=rand(1,100);
      if(roll<=chance)
        add('Piłkarz Roku w Polsce',55,8,`${grade.label} • OVR ${state.overall} • ${competition} • ${apps} meczów • szansa ${chance}% • rzut ${roll}/100`);
      else
        log('Głosowanie: Piłkarz Roku w Polsce',`${grade.label} • OVR ${state.overall} • ${competition} • szansa ${chance}% • rzut ${roll}/100 → bez nagrody`);
    }
    return won;
  }

  function representedCountryName(){ return state.seniorNationalCountry||state.representedCountry||'Polska'; }
  function representedNationalTeam(){
    return window.NSSNationalData?.teams?.find(team=>team.name===representedCountryName())||null;
  }
  function nationalSelectionOverall(){
    const teamOvr=representedNationalTeam()?.baseOvr||85;
    return state.overall+(85-teamOvr);
  }
  function foreignNationalRelativeCall(){
    const teamName=representedCountryName();
    if(teamName==='Polska')return null;
    const team=representedNationalTeam();
    if(!team||!Number.isFinite(Number(team.baseOvr)))return null;
    const teamOvr=Number(team.baseOvr);
    const playerOvr=Number(state.overall)||0;
    const gap=playerOvr-teamOvr;
    if(gap>=0)return {teamName,teamOvr,playerOvr,gap,guaranteed:true,chance:100};
    const deficit=Math.abs(gap);
    if(deficit<=5){
      const chance=({1:85,2:70,3:55,4:40,5:25})[deficit];
      return {teamName,teamOvr,playerOvr,gap,deficit,guaranteed:false,chance};
    }
    return {teamName,teamOvr,playerOvr,gap,deficit,guaranteed:false,chance:null};
  }

  function nationalSquadRole(overall=nationalSelectionOverall()){
    if(overall<=76) return 'awaryjny debiutant — pojedynczy sparing';
    if(overall<=80) return 'szeroki skład — rezerwowy';
    if(overall<=84) return 'rotacja reprezentacji';
    return 'regularna kadra';
  }

  function nationalCapsRoll(firstCall, returning){
    const ovr=nationalSelectionOverall();
    // OVR kadry to około 85. Zawodnik 74–76 może wyjątkowo dostać próbny
    // sparing, 77–80 jest rezerwowym, a regularne granie zaczyna się wyżej.
    if(ovr<=76) return weightedDelta([[88,1],[12,2]]);
    if(ovr<=80){
      if(firstCall) return weightedDelta([[58,1],[32,2],[10,3]]);
      if(returning) return weightedDelta([[42,1],[38,2],[16,3],[4,4]]);
      return weightedDelta([[28,1],[38,2],[24,3],[8,4],[2,5]]);
    }
    if(ovr<=84){
      if(firstCall) return weightedDelta([[20,1],[32,2],[28,3],[15,4],[5,5]]);
      if(returning) return weightedDelta([[12,1],[24,2],[30,3],[22,4],[9,5],[3,6]]);
      return weightedDelta([[8,1],[17,2],[26,3],[25,4],[15,5],[7,6],[2,7]]);
    }
    if(firstCall) return weightedDelta([[8,1],[17,2],[27,3],[25,4],[16,5],[7,6]]);
    if(returning) return weightedDelta([[5,1],[10,2],[18,3],[24,4],[22,5],[14,6],[7,7]]);
    return weightedDelta([[3,1],[7,2],[13,3],[20,4],[22,5],[18,6],[11,7],[6,8]]);
  }

  function nationalGoalsRoll(caps){
    if(caps<=0) return 0;
    const skill=clamp(.75+(state.overall-65)*.025,.7,1.3);
    const rate=state.position==='FWD'?.28:state.position==='MID'?.10:state.position==='DEF'?.035:.003;
    return poisson(caps*rate*skill);
  }
  function nationalGoalkeeperRoll(caps){
    if(caps<=0) return {goalsConceded:0,cleanSheets:0};
    const perGame=clamp(1.35-(state.overall-77)*.025,.55,1.55);
    let cleanSheets=0;
    const cleanChance=clamp(.24+(state.overall-77)*.012,.18,.48);
    for(let i=0;i<caps;i++) if(Math.random()<cleanChance) cleanSheets++;
    cleanSheets=Math.min(Math.floor(caps/2),cleanSheets);
    const nonClean=caps-cleanSheets;
    const nonCleanMean=clamp(perGame/Math.max(.35,1-cleanChance),1.12,2.45);
    return {goalsConceded:nonClean+poisson(nonClean*(nonCleanMean-1)),cleanSheets};
  }

  function seniorNationalEligibleClub(club,seasonTier){
    if(isForeignClub(club)) return (club.foreignTier||99)<=3;
    return seasonTier>=6; // Polska: wyłącznie Ekstraklasa.
  }

  function seniorNationalCallChance(performance, seasonTier, club=state.club){
    const recognition=state.recognition||20;
    const apps=state.season?.apps||0;
    // Te same progi zachowują kalibrację Polski (OVR kadry 85), ale dla
    // słabszej reprezentacji oceniają zawodnika względem poziomu jej kadry.
    const ovr=nationalSelectionOverall();
    let chance=0;

    // Dla naturalizowanego reprezentanta najpierw liczy się relacja do
    // poziomu jego kadry. Równy lub wyższy OVR daje pewną grę, a zakres
    // od -1 do -5 OVR uruchamia stopniowany rzut niezależny od ligi klubu.
    const foreignRelative=foreignNationalRelativeCall();
    if(foreignRelative?.guaranteed)return 100;
    if(Number.isFinite(foreignRelative?.chance))return foreignRelative.chance;

    // Przy surowym OVR 88+ zawodnik jest bezdyskusyjnym reprezentantem:
    // nie obowiązuje go ani bramka ligi, ani losowanie powołania.
    if((state.overall||0)>=88) return 100;

    // Twarda bramka jakości rozgrywek:
    // Polska = Ekstraklasa; zagranica = tylko T1, T2, T3.
    if(!seniorNationalEligibleClub(club,seasonTier)) return 0;

    if(!state.seniorInternational){
      if(ovr<74) return 0;

      if(ovr<=76){
        // Rzadki debiut próbny: świetny rok na boisku, dużo minut i zwykle
        // jeden sparing. Nie otwiera regularnego grania przy niskim OVR.
        if(performance<62 || apps<scaledLeagueCount(24,club,1)) return 0;
        chance=2+(ovr-74)*4+clamp((performance-62)*.8,0,8)+recognition*.04;
      } else if(ovr<=80){
        if(performance<40 || apps<scaledLeagueCount(15,club,1)) return 0;
        chance=8+(ovr-77)*7+clamp((performance-42)*.8,0,16)+recognition*.10;
      } else if(ovr<=84){
        chance=35+(ovr-81)*9+clamp((performance-35)*.7,0,16)+recognition*.12;
      } else {
        chance=70+Math.min(15,(ovr-85)*3)+clamp((performance-35)*.45,0,10)+recognition*.08;
      }
    } else {
      // Historia reprezentacyjna pomaga, ale nie utrzymuje w kadrze gracza,
      // który zjechał daleko poniżej poziomu szerokiego składu.
      if(ovr<74) return 0;
      if(ovr<=76){
        if(performance<52 || apps<scaledLeagueCount(18,club,1)) return 0;
        chance=6+(ovr-74)*4+clamp((performance-52)*.6,0,9)+recognition*.05;
      } else if(ovr<=80){
        chance=28+(ovr-77)*7+clamp((performance-36)*.7,0,15)+recognition*.12;
      } else if(ovr<=84){
        chance=55+(ovr-81)*8+clamp((performance-32)*.55,0,13)+recognition*.12;
      } else {
        chance=82+Math.min(9,(ovr-85)*2)+clamp((performance-32)*.35,0,7)+recognition*.05;
      }
      if(state.national===representedCountryName()) chance+=6;
    }

    if(performance<22) chance-=18;
    if(apps<scaledLeagueCount(8,club,1)) chance-=15;

    return clamp(Math.round(chance),1,94);
  }


  // Stary, jednorzutowy system kwalifikacji i wyników EURO/mundialu
  // został zastąpiony przez paczkę NSS — patrz nssPolska.checkEuro()/
  // checkWorldCup()/playPendingTournament() poniżej.

  function maybeNationalTeam(performance, seasonTier, club=state.club){
    const old=state.national;
    const wasSeniorInternational=state.seniorInternational;
    const teamName=representedCountryName();
    const icon=teamName==='Polska'?'🇵🇱':'🌐';
    state.seasonNationalCaps=0;
    state.seasonNationalGoals=0;
    state.seasonNationalGoalsConceded=0;
    state.seasonNationalCleanSheets=0;

    if((state.corruptionShadow||0)>0){
      state.national='—';
      return old===teamName?`${icon} Poza kadrą ${teamName} po aferze korupcyjnej`:'';
    }

    const foreignRelative=foreignNationalRelativeCall();
    const automaticCall=(state.overall||0)>=88||!!foreignRelative?.guaranteed;
    const callChance=seniorNationalCallChance(performance,seasonTier,club);
    const callRoll=!automaticCall&&callChance>0?rand(1,100):null;
    const called=automaticCall||(callChance>0&&callRoll<=callChance);

    if(called){
      const firstSeniorCall=!wasSeniorInternational;
      const returning=wasSeniorInternational && old!==teamName;

      state.national=teamName;
      state.seniorInternational=true;
      state.seniorNationalCountry=state.seniorNationalCountry||teamName;
      state.representedCountry=state.seniorNationalCountry;
      state.justNationalCall=firstSeniorCall;

      const caps=nationalCapsRoll(firstSeniorCall,returning);
      const goals=nationalGoalsRoll(caps);
      const goalkeeperStats=state.position==='GK'?nationalGoalkeeperRoll(caps):{goalsConceded:0,cleanSheets:0};
      state.seasonNationalCaps=caps;
      state.seasonNationalGoals=goals;
      state.nationalCaps+=caps;
      state.nationalGoals+=goals;
      state.seasonNationalGoalsConceded=goalkeeperStats.goalsConceded;
      state.seasonNationalCleanSheets=goalkeeperStats.cleanSheets;
      state.nationalGoalsConceded=(state.nationalGoalsConceded||0)+goalkeeperStats.goalsConceded;
      state.nationalCleanSheets=(state.nationalCleanSheets||0)+goalkeeperStats.cleanSheets;

      addSportMedia(firstSeniorCall?5:(caps>=5?3:2),
        firstSeniorCall?`Pierwsze powołanie do reprezentacji ${teamName}`:`${caps} meczów w reprezentacji ${teamName}`);

      const goalText=state.position==='GK'
        ?` • ${goalkeeperStats.goalsConceded} straconych • ${goalkeeperStats.cleanSheets} czystych kont`
        :goals?` • ${goals} ${goals===1?'gol':'gole'}`:'';
      let label;
      if(firstSeniorCall) label=`${icon} PIERWSZE POWOŁANIE: ${teamName.toUpperCase()}`;
      else if(returning) label=`${icon} POWRÓT DO REPREZENTACJI: ${teamName.toUpperCase()}`;
      else label=`${icon} REPREZENTACJA: ${teamName.toUpperCase()}`;

      const squadRole=nationalSquadRole();
      const callMeta=automaticCall
        ?foreignRelative?.guaranteed
          ?`powołanie automatyczne • OVR zawodnika ${foreignRelative.playerOvr} ≥ OVR kadry ${foreignRelative.teamOvr}`
          :`powołanie automatyczne • OVR ${state.overall}`
        :`szansa powołania ${callChance}% • rzut ${callRoll}/100`;
      const meta=`${caps} ${caps===1?'mecz':'mecze'}${goalText} • ${squadRole} • ${callMeta}`;
      log(label,meta);
      return `${label}: ${caps} ${caps===1?'mecz':'mecze'}${goalText} • ${squadRole} (${callMeta})`;
    }

    // Brak powołania seniorów nie wymazuje historii reprezentanta.
    if(wasSeniorInternational){
      state.national='—';
      if(callChance>0){
        const text=`${icon} Poza kadrą ${teamName} w tym sezonie (szansa ${callChance}%, rzut ${callRoll})`;
        if(old===teamName) log(`Wypadasz z reprezentacji ${teamName}.`,`Szansa ${callChance}% • rzut ${callRoll}/100`);
        return text;
      }
      return old===teamName?`${icon} W tym sezonie nie dostajesz powołania: ${teamName}`:'';
    }

    // Polskie młodzieżówki nie blokują naturalizacji. Po przyjęciu innej
    // reprezentacji zawodnik nie wraca już do ścieżki Polski.
    if(teamName==='Polska'&&state.age<=19 && state.overall>=51 && seasonTier>=3 && performance>30){
      state.national='Polska U-19';
      if(old!==state.national){
        const text='Powołanie: Polska U-19';
        log(text,`${state.age} lat • ${state.club.name} • OVR ${state.overall}`);
        return text;
      }
      return '';
    }

    if(teamName==='Polska'&&state.age<=22 && state.overall>=58 && seasonTier>=4 && performance>33){
      state.national='Polska U-21';
      if(old!==state.national){
        const text='Powołanie: Polska U-21';
        log(text,`${state.age} lat • ${state.club.name} • OVR ${state.overall}`);
        return text;
      }
      return '';
    }

    state.national='—';
    return '';
  }

  function eventAllowed(id,cooldown=4,maxUses=1){
    const m=state.eventMemory[id];
    if(!m) return true;
    if(m.count>=maxUses) return false;
    return state.age-m.lastAge>=cooldown;
  }


  const ROLL = {
    // Każda odpowiedź ma najwyżej dwa możliwe skutki. Gracz wybiera kierunek,
    // a losowanie rozstrzyga tylko: udało się albo nie.
    ovrSafe:       {stat:'overall', name:'OVR — ostrożnie', outcomes:[[20,1],[80,0]]},
    ovrBalanced:   {stat:'overall', name:'OVR — próba rozwoju', outcomes:[[30,1],[70,0]]},
    ovrRisky:      {stat:'overall', name:'OVR — ryzyko', outcomes:[[35,2],[65,-1]]},
    ovrBreakout:   {stat:'overall', name:'OVR — próba przełomu', outcomes:[[30,3],[70,-1]]},

    playSafe:      {stat:'playChance', name:'Hierarchia — spokojnie', outcomes:[[70,3],[30,-2]]},
    playBalanced:  {stat:'playChance', name:'Hierarchia — próba', outcomes:[[60,6],[40,-4]]},
    playRisky:     {stat:'playChance', name:'Hierarchia — ryzyko', outcomes:[[50,10],[50,-7]]},

    healthSafe:    {stat:'injuryRisk', name:'Zdrowie — ostrożnie', outcomes:[[80,-3],[20,2]]},
    healthBalanced:{stat:'injuryRisk', name:'Zdrowie — próba', outcomes:[[60,-4],[40,3]]},
    healthRisky:   {stat:'injuryRisk', name:'Zdrowie — ryzyko', outcomes:[[40,-4],[60,6]]},

    profSafe:      {stat:'professionalism', name:'Profesjonalizm — spokojnie', outcomes:[[75,3],[25,-1]]},
    profRisky:     {stat:'professionalism', name:'Profesjonalizm — ryzyko', outcomes:[[55,6],[45,-4]]},

    recogSafe:     {stat:'recognition', name:'Medialność — spokojnie', outcomes:[[75,5],[25,-3]]},
    recogRisky:    {stat:'recognition', name:'Medialność — ryzyko', outcomes:[[55,10],[45,-7]]},

    loyaltySafe:   {stat:'loyalty', name:'Lojalność — spokojnie', outcomes:[[75,2],[25,-1]]},
    loyaltyRisky:  {stat:'loyalty', name:'Lojalność — ryzyko', outcomes:[[55,4],[45,-3]]},

    fanRefusal:    {stat:'recognition', name:'Reakcja kibiców', outcomes:[[70,0],[30,-6]]},
    interview:     {stat:'recognition', name:'Wywiad', outcomes:[[70,8],[30,-4]]},
    extraTraining: {stat:'overall', name:'Dodatkowy trening', outcomes:[[25,1],[75,0]]},
    kaleDiet:      {stat:'overall', name:'Jarmuż', outcomes:[[50,2],[50,-2]]},
    normalDiet:    {stat:'injuryRisk', name:'Normalna dieta', outcomes:[[80,-2],[20,2]]},

    linkVote:      {stat:'recognition', name:'Podejrzany link', outcomes:[[50,10],[50,-20]]},
    padel:         {stat:'loyalty', name:'Wyjście z drużyną', outcomes:[[70,2],[30,-1]]},
    bookSale:      {stat:'loyalty', name:'Pomoc koledze', outcomes:[[70,1],[30,-1]]},
    bengayLaugh:   {stat:'loyalty', name:'Żart w szatni', outcomes:[[70,2],[30,-2]]},
    bengayPrank:   {stat:'loyalty', name:'Żart z bramkarza', outcomes:[[60,2],[40,-2]]},
    honestRun:     {stat:'overall', name:'Uczciwy trening', outcomes:[[30,2],[70,0]]},
    pubNight:      {stat:'recognition', name:'Stary lokal', outcomes:[[60,5],[40,-5]]},
    fashionBoots:  {stat:'recognition', name:'Modne buty', outcomes:[[65,8],[35,-5]]},
    bengayProof:   {stat:'injuryRisk', name:'Nowy wynalazek', outcomes:[[50,-8],[50,8]]}
  };

  // Jedna decyzja = jeden jawny rzut. Stare wielopakietowe efekty z act()
  // są ignorowane dla zdarzeń fabularnych. Rynek klubowy pozostaje wyjątkiem.
  const DECISION_ROLLS = {
    young_minutes:[ROLL.playRisky,null],
    puchar_fatigue:[ROLL.ovrRisky,ROLL.healthSafe],
    studies:[ROLL.profSafe,ROLL.ovrRisky],
    serious_injury:[ROLL.playRisky,ROLL.healthSafe],
    first_national_camp:[ROLL.profSafe,ROLL.recogRisky],
    reserve_warning:[ROLL.playRisky,null],
    position_coach:[ROLL.ovrBalanced,ROLL.playBalanced],
    local_tv_preseason:[ROLL.recogSafe,ROLL.profSafe],
    ultras_flares:[null,ROLL.fanRefusal],
    cwiakala_interview:[ROLL.interview,ROLL.extraTraining],
    helti_plan:[ROLL.kaleDiet,ROLL.normalDiet],
    wisnicz_festival:[null,ROLL.extraTraining],

    kuba_x_vote:[ROLL.linkVote,null],
    kuba_padel:[ROLL.padel,ROLL.healthSafe],
    kuba_futbol_na_tak:[ROLL.bookSale,ROLL.loyaltyRisky],
    kuba_bengay_target:[ROLL.bengayLaugh,ROLL.loyaltyRisky],
    kuba_bengay_keeper:[ROLL.bengayPrank,ROLL.profSafe],
    kuba_tree_run:[ROLL.honestRun,ROLL.healthSafe],
    kuba_favourite_pub:[ROLL.pubNight,ROLL.healthSafe],
    kuba_dynamic_sock:[ROLL.fashionBoots,ROLL.healthSafe],
    kuba_bengay_boxers:[ROLL.bengayProof,null]
  };

  function attachDecisionRolls(d,id){
    if(!d || !Array.isArray(d.choices)) return d;
    const specs=DECISION_ROLLS[id];
    if(specs){
      d.choices.forEach((ch,i)=>{
        if(specs[i]){
          ch.rollSpec=specs[i];
          ch.ignoreLegacyAct=true;
          ch.ovrProfile=null;
        }
      });
    }
    return d;
  }

  function statLabel(stat){
    return ({
      overall:'OVR',
      playChance:'szansa na grę',
      injuryRisk:'ryzyko urazu',
      professionalism:'profesjonalizm',
      recognition:'medialność',
      loyalty:'lojalność'
    })[stat]||stat;
  }

  function rollSpecText(spec){
    if(!spec) return '';
    return spec.outcomes.map(([pct,delta])=>{
      let value;
      if(spec.stat==='injuryRisk'){
        value=delta<0?`ryzyko urazu ${delta} p.p.`:delta>0?`ryzyko urazu +${delta} p.p.`:'bez zmian';
      } else if(spec.stat==='playChance'){
        value=delta===0?'bez zmian':`szansa na grę ${delta>0?'+':''}${delta} p.p.`;
      } else if(spec.stat==='overall'){
        value=delta===0?'bez zmian':`${delta>0?'+':''}${delta} OVR`;
      } else if(spec.stat==='professionalism'){
        value=delta===0?'bez zmian':`profesjonalizm ${delta>0?'+':''}${delta}`;
      } else if(spec.stat==='recognition'){
        value=delta===0?'bez zmian':`medialność ${delta>0?'+':''}${delta}`;
      } else if(spec.stat==='loyalty'){
        value=delta===0?'bez zmian':`lojalność ${delta>0?'+':''}${delta}`;
      } else {
        value=delta===0?'bez zmian':`${delta>0?'+':''}${delta}`;
      }
      return `${pct}% → ${value}`;
    }).join(' • ');
  }

  function applyDecisionRoll(ch){
    const spec=ch.rollSpec;
    if(!spec) return null;
    const r=rand(1,100);
    let cursor=0,delta=0;
    for(const [pct,d] of spec.outcomes){
      cursor+=pct;
      if(r<=cursor){delta=d;break;}
    }
    const before={
      overall:state.overall,
      playChance:projectedStartChance(state.club,state.boost||0),
      injuryRisk:state.injuryRisk,
      professionalism:state.professionalism,
      recognition:state.recognition||0,
      loyalty:state.loyalty
    }[spec.stat];

    if(spec.stat==='overall'){
      const beforeOverall=state.overall;
      state.overall=clamp(state.overall+delta,1,overallCap());
      noteLegendOverallChange(beforeOverall);
    } else if(spec.stat==='playChance'){
      state.boost=clamp((state.boost||0)+delta,-20,25);
    } else if(spec.stat==='injuryRisk'){
      state.injuryRisk=clamp(state.injuryRisk+delta,5,50);
    } else if(spec.stat==='professionalism'){
      state.professionalism=clamp(state.professionalism+delta,0,100);
    } else if(spec.stat==='recognition'){
      state.recognition=clamp((state.recognition||0)+delta,0,100);
    } else if(spec.stat==='loyalty'){
      state.loyalty=clamp((state.loyalty||0)+delta,0,15);
    }

    const after={
      overall:state.overall,
      playChance:projectedStartChance(state.club,state.boost||0),
      injuryRisk:state.injuryRisk,
      professionalism:state.professionalism,
      recognition:state.recognition||0,
      loyalty:state.loyalty
    }[spec.stat];

    const better = spec.stat==='injuryRisk' ? after<before : after>before;
    const worse  = spec.stat==='injuryRisk' ? after>before : after<before;
    const band=better?'SUKCES':worse?'PORAŻKA':'NEUTRALNIE';
    const suffix=(spec.stat==='playChance'||spec.stat==='injuryRisk')?'%':'';
    const result=`${statLabel(spec.stat)}: ${Math.round(before)}${suffix} → ${Math.round(after)}${suffix}`;
    log('Skutek decyzji',`Rzut ${r}/100 • ${band} • ${result}`);
    render();
    return {roll:r,band,result,spec};
  }

  function tagEvent(d,id,weight=1,cooldown=4,maxUses=1){
    if(!d) return null;
    d.id=id;
    d.baseWeight=weight;
    // Dawne wagi 4–6 spychały część zdarzeń do ok. 1–2% w zatłoczonym
    // sezonie. Siedem jest od teraz minimalną realną wagą fabularną.
    d.weight=Math.max(7,weight);
    d.cooldown=cooldown; d.maxUses=maxUses;
    attachDecisionRolls(d,id);
    return d;
  }

  function rememberEvent(d){
    if(!d || !d.id) return;
    const m=state.eventMemory[d.id] || {count:0,lastAge:-99};
    state.eventMemory[d.id]={count:m.count+1,lastAge:state.age};
  }

  function storyContext(performance){
    return {
      s:state, performance, clamp, rand, pick, tierName, log,
      loanMove, moveClub, regionalReturn, findTransferClub, findLowerClub, findPlayableClub,
      playChance:()=>projectedStartChance(state.club,state.boost||0),
      data:GAME_DATA
    };
  }

  const MOVEMENT_EVENT_IDS = new Set([]);
  const CONTRACT_MOVEMENT_EVENT_IDS = new Set(['homecoming','four_men_on_couches','grajewski_agent']);

  // Zdarzenia z krótkim albo wyjątkowym oknem nie mogą przegrać jedynej
  // okazji z ogólnym wywiadem czy treningiem. Wyższy numer oznacza, że po
  // spełnieniu warunku to zdarzenie ma pierwszeństwo przed pozostałymi.
  const STORY_EVENT_PRIORITY={
    license_chaos:100,
    four_men_on_couches:95,
    german_anti_polish_coach:90,
    breakthrough_hype_sport:85,
    first_team_invite:80,
    early_contract:75,
    young_minutes:70,
    last_big_offer:65,
    breakthrough_hype_pnplus:60,
    breakthrough_hype_tempo:55
  };

  function storyEventCandidates(performance){
    if(!window.CAREER_EVENT_DEFS) return [];
    const h=storyContext(performance);
    const out=[];
    CAREER_EVENT_DEFS.forEach(def=>{
      // Zmiana klubu ma własny, obowiązkowy etap po KAŻDYM sezonie.
      // Dzięki temu losowe wydarzenie nie może zastąpić rynku transferowego.
      if(MOVEMENT_EVENT_IDS.has(def.id)) return;
      // Dziesięcioletnia umowa oznacza naprawdę dziesięć sezonów bez
      // bocznej furtki transferowej ukrytej w losowym zdarzeniu.
      if(longContractActive()&&CONTRACT_MOVEMENT_EVENT_IDS.has(def.id)) return;
      if(!eventAllowed(def.id,def.cooldown,def.maxUses)) return;
      let ok=false;
      try { ok=!!def.when(h); } catch(e){ console.warn('Event condition failed',def.id,e); }
      if(!ok) return;
      let d=null;
      try { d=def.make(h); } catch(e){ console.warn('Event build failed',def.id,e); }
      if(d) out.push(tagEvent(d,def.id,def.weight,def.cooldown,def.maxUses));
    });
    return out;
  }

  function seriousInjuryDecision(){
    const acl=state.lastInjurySeverity==='ZERWANIE WIĘZADEŁ KRZYŻOWYCH';
    const verySerious=acl || state.lastInjurySeverity==='BARDZO CIĘŻKI';
    return tagEvent({
      title:acl?'Rok po zerwaniu więzadeł.':verySerious?'Powrót po bardzo ciężkiej kontuzji.':'Rehabilitacja czy szybki powrót?',
      text:acl
        ? `Cały sezon spędziłeś poza boiskiem po zerwaniu więzadeł krzyżowych. Rehabilitacja trwała cały rok; teraz decydujesz, jak wejść w powrót do gry.`
        : `${state.lastInjurySeverity} uraz zabrał ci ${state.lastInjuryLost} meczów${state.lastInjuryOvrPenalty?` i kosztował ${Math.abs(state.lastInjuryOvrPenalty)} OVR`:''}. Sztab daje dwie drogi przed kolejnym sezonem.`,
      choices:[
        {
          label:'Wracam jak najszybciej',
          preview:`Pełna dostępność od początku • hierarchia +5 p.p. • ryzyko urazu +${verySerious?8:6} p.p.`,
          act:()=>{
            state.boost+=5;
            state.injuryRisk=clamp(state.injuryRisk+(verySerious?8:6),5,45);
            log('Przyspieszasz powrót po urazie.','Od początku walczysz o skład, ale mocno zwiększasz ryzyko nawrotu.');
          }
        },
        {
          label:'Pełna rehabilitacja',
          preview:acl
            ? `Rok rehabilitacji jest już za tobą • ryzyko urazu -8 p.p. • profesjonalizm +2 • bez dodatkowej utraty kolejnego sezonu`
            : `Ryzyko urazu -${verySerious?8:6} p.p. • profesjonalizm +2 • początek następnego sezonu: ok. ${verySerious?'20':'10'}% mniej meczów`,
          act:()=>{
            state.boost-=1;
            state.injuryRisk=clamp(state.injuryRisk-(verySerious?8:6),5,45);
            state.professionalism=clamp(state.professionalism+2,0,100);
            if(!acl) state.nextAppsFactor=Math.min(state.nextAppsFactor||1,verySerious?.80:.90);
            log('Wybierasz pełną rehabilitację.',acl
              ? `Rok leczenia jest zakończony. Wracasz ostrożnie, ale bez automatycznej utraty kolejnego sezonu.`
              : `Chronisz zdrowie, ale początek następnego sezonu tracisz na odbudowę.`);
          }
        }
      ]
    },'serious_injury',18,0,99);
  }

  function firstNationalDecision(){
    return tagEvent({
      title:'Pierwsze zgrupowanie reprezentacji.',
      text:'Wchodzisz do szatni reprezentacji Polski. Nagle trenujesz z zawodnikami, których jeszcze niedawno oglądałeś w telewizji.',
      choices:[
        {label:'Słucham i chłonę',act:()=>{state.professionalism=clamp(state.professionalism+2,0,100);state.score+=5;log('Pierwsze zgrupowanie kadry.','Nie próbujesz niczego udowadniać na siłę.');}},
        {label:'Od razu pokazuję charakter',act:()=>{state.boost+=5;state.injuryRisk=clamp(state.injuryRisk+1,5,45);state.score+=5;log('Pierwsze zgrupowanie kadry.','Od pierwszego treningu walczysz o swoją pozycję.');}}
      ]
    },'first_national_camp',30,99,1);
  }

  function makeDecision(performance){
    // Spadek nie wymusza już osobnego transferowego eventu — za chwilę i tak
    // pojawi się coroczny wybór klubu z opcją pozostania albo odejścia.
    if(state.justNationalCall) return firstNationalDecision();
    if((state.lastInjurySeverity==='POWAŻNY' || state.lastInjurySeverity==='BARDZO CIĘŻKI' || state.lastInjurySeverity==='ZERWANIE WIĘZADEŁ KRZYŻOWYCH') && eventAllowed('serious_injury',0,99)) return seriousInjuryDecision();

    const decisions=storyEventCandidates(performance);
    // We Włoszech trener Italiano jest osobnym, dokładnym rzutem sezonowym:
    // 5%, a nie częścią ważonego losowania wszystkich zwykłych zdarzeń.
    const italiano=decisions.find(d=>d.id==='italiano_anti_polish_coach');
    if(italiano&&rand(1,100)<=5) return italiano;
    const regularDecisions=decisions.filter(d=>d.id!=='italiano_anti_polish_coach');
    const priority=regularDecisions.filter(d=>STORY_EVENT_PRIORITY[d.id]);
    // Od 46 lat wcześniejsze założenie „zawsze spokojny rok” pozostaje twarde.
    // Priorytet ratuje krótkie okna tylko do końca 45. roku życia.
    if(priority.length && state.age<46){
      const top=Math.max(...priority.map(d=>STORY_EVENT_PRIORITY[d.id]));
      return weightedPick(priority.filter(d=>STORY_EVENT_PRIORITY[d.id]===top));
    }

    // Po 38. roku życia coraz częściej trafia się po prostu spokojny rok.
    // To celowe zdarzenie, a nie brak pasujących wpisów w bazie decyzji.
    // 39 lat: 30%, potem +10 p.p. rocznie; od 46 lat już zawsze.
    if(state.age>=39){
      const quietChance=clamp(30+(state.age-39)*10,30,100);
      if(rand(1,100)<=quietChance){
        return {
          title:'Nic ci się nie wydarzyło.',
          text:'Kolejny rok kariery mija bez historii, która zmieniałaby twoją sytuację. Treningi, mecze, regeneracja — zwykły rytm weterana.',
          choices:[{label:'DALEJ',act:()=>{}}]
        };
      }
    }
    if(!regularDecisions.length) return null;
    // Dopóki istnieje pasujące zdarzenie, którego ta kariera jeszcze nie
    // widziała, powtórki nie zajmują mu miejsca. Dopiero po wyczerpaniu
    // świeżej puli wracamy do zdarzeń wielokrotnych.
    const unseen=regularDecisions.filter(d=>!(state.eventMemory[d.id]?.count));
    return weightedPick(unseen.length?unseen:regularDecisions);
  }

  function relegationDecision(){
    return {title:'Spadliście z ligi.',text:`${state.club.name} zacznie kolejny sezon w ${tierName(state.club.tier)}. Klub chce, żebyś został i pomógł wrócić.`,choices:[
      {label:'Zostaję',act:()=>{state.loyalty=clamp((state.loyalty||0)+3,0,15);state.boost+=5;log('Zostajesz po spadku.','Chcesz pomóc klubowi wrócić wyżej.');}},
      {label:'Szukam odejścia',act:()=>{const t=findTransferClub(true); if(t) moveClub(t); else {state.boost-=1;log('Nie znajdujesz odpowiedniej oferty.','Zostajesz przynajmniej do zimy.');}}}
    ]};
  }

  function transferDecision(mode){
    let target=null;
    if(mode==='foreign'){
      const fromPoland=!isForeignClub(state.club);
      const performance=45; // zdarzenie jest ofertą "w tle"; używamy neutralnie dobrego sezonu.
      const worst=fromPoland?4:foreignWorstOfferTier(state.club,performance,state.season?.apps||0,state.lowAppsStreak||0);
      let pool=GAME_DATA.foreignClubs.filter(c=>
        c.name!==state.club.name &&
        c.foreignTier<=worst &&
        (fromPoland?c.foreignTier<6:(c.foreignTier<6 || deepLocalForeignAccessible(c,state.club))) &&
        foreignTierReachable(c.foreignTier,performance,fromPoland) &&
        c.strength<=state.overall+8
      );
      if(pool.length){
        const best=Math.min(...pool.map(c=>c.foreignTier));
        const bestPool=pool.filter(c=>c.foreignTier===best);
        target=pick(bestPool);
      }
    } else if(mode==='eliteForeign'){
      const pool=GAME_DATA.foreignClubs.filter(c=>
        c.foreignTier<=2 &&
        foreignTierReachable(c.foreignTier,50,!isForeignClub(state.club)) &&
        c.strength<=state.overall+8
      );
      if(pool.length){
        const best=Math.min(...pool.map(c=>c.foreignTier));
        target=pick(pool.filter(c=>c.foreignTier===best));
      }
    } else if(mode==='sameTier') target=findSameTierUpgrade();
    else target=findHigherPolishClub();
    if(!target) return null;
    const abroad=mode==='foreign'||mode==='eliteForeign';
    return {
      title: abroad?'Telefon z zagranicy.':mode==='sameTier'?'Większy klub z tej samej ligi.':'Oferta z wyższej ligi.',
      text:`${target.name} (${clubCompetition(target)}) chce cię sprowadzić. W obecnym klubie masz już wyrobioną pozycję.`,
      choices:[
        {label:`Idę do ${target.name}`,act:()=>moveClub(target)},
        {label:'Zostaję',act:()=>{state.loyalty=clamp((state.loyalty||0)+2,0,15);state.boost+=3;log(`Odrzucasz ofertę ${target.name}.`,`Zostajesz w ${state.club.name}.`);}}
      ]
    };
  }

  function trainingDecision(){
    return {title:'Masz wolne lato.',text:'Możesz wejść w dodatkowy indywidualny cykl treningowy albo po prostu odpocząć po sezonie.',choices:[
      {label:'Dodatkowy trening',act:()=>{state.professionalism=clamp(state.professionalism+5,0,100);state.boost+=4;state.injuryRisk=clamp(state.injuryRisk+2,5,45);log('Robisz dodatkowy trening.','Większa szansa rozwoju, trochę większe ryzyko przeciążenia.');}},
      {label:'Odpoczywam',act:()=>{state.injuryRisk=clamp(state.injuryRisk-3,5,45);log('Stawiasz na odpoczynek.','Mniej ryzyka urazu w kolejnym sezonie.');}}
    ]};
  }
  function positionStory(){
    const role=state.position==='FWD'?'skrzydle':state.position==='MID'?'bardziej ofensywnej roli':state.position==='DEF'?'wahadle':'grze wyżej od bramki';
    return {title:'Trener ma dla ciebie nową rolę.',text:`Chce częściej ustawiać cię na ${role}.`,choices:[
      {label:'Zgadzam się',act:()=>{state.boost+=2;log('Przyjmujesz nową rolę.','Stajesz się bardziej uniwersalny.');}},
      {label:'Wolę swoją pozycję',act:()=>{state.boost-=2;state.loyalty=clamp((state.loyalty||0)-1,0,15);log('Bronisz swojej pozycji.','Trener nie jest zachwycony, ale wiesz czego chcesz.');}}
    ]};
  }
  function agentDecision(){
    return {title:'Odzywa się agent.',text:'Obiecuje, że szybciej wyciągnie cię do większego klubu. W zamian chce, żebyś zaczął mocniej naciskać na transfer.',choices:[
      {label:'Podpisuję z nim',act:()=>{state.loyalty=clamp((state.loyalty||0)-1,0,15);state.boost+=1;log('Zmieniasz otoczenie.','Od teraz częściej patrzysz na kolejny krok.');}},
      {label:'Zostaję przy swoim',act:()=>{state.loyalty=clamp((state.loyalty||0)+2,0,15);log('Nie zmieniasz agenta.','Wolisz spokój i regularne granie.');}}
    ]};
  }
  function coachChangeDecision(){
    return {title:'Klub zmienia trenera.',text:'Nowy szkoleniowiec zaczyna od czystej kartki i chce zobaczyć cię w innej roli w zespole.',choices:[
      {label:'Przekonuję go na treningach',act:()=>{state.professionalism=clamp(state.professionalism+3,0,100);state.boost+=3;log('Dobrze wchodzisz we współpracę z nowym trenerem.','Masz szansę poprawić swoją pozycję.');}},
      {label:'Czekam, co będzie',act:()=>{state.boost-=1;state.injuryRisk=clamp(state.injuryRisk-1,5,45);log('Nie szarżujesz po zmianie trenera.','Stawiasz na cierpliwość.');}}
    ]};
  }
  function captainDecision(){
    return {title:'Szatnia widzi w tobie lidera.',text:'Trener proponuje ci wejście do rady drużyny, ale oznacza to więcej odpowiedzialności i mniej świętego spokoju.',choices:[
      {label:'Biorę odpowiedzialność',act:()=>{state.loyalty=clamp((state.loyalty||0)+2,0,15);log('Stajesz się jednym z liderów zespołu.','Twoja pozycja w klubie rośnie.');}},
      {label:'Skupiam się na grze',act:()=>{state.boost+=2;log('Odmawiasz funkcji lidera.','Chcesz odpowiadać przede wszystkim na boisku.');}}
    ]};
  }
  function contractDecision(){
    return {title:'Klub proponuje nowy kontrakt.',text:'Możesz związać się na dłużej albo zostawić sobie otwartą drogę do transferu.',choices:[
      {label:'Podpisuję',ovrProfile:'safe',act:()=>{state.loyalty=clamp((state.loyalty||0)+3,0,15);state.boost+=2;log('Przedłużasz kontrakt.','Klub daje ci mocniejszą pozycję.');}},
      {label:'Czekam z decyzją',ovrProfile:'highrisk',act:()=>{state.loyalty=clamp((state.loyalty||0)-1,0,15);state.marketBonus=clamp((state.marketBonus||0)+25,0,60);log('Nie przedłużasz umowy.','Ryzykujesz stabilność, ale agent szerzej otwiera rynek na najbliższe lato.');}}
    ]};
  }


  function corruptionReturnOffers(originTier){
    const targetTier=Math.max(1,originTier-1);
    let pool=shuffle(seniorClubs().filter(c=>c.tier===targetTier && !c.reserve));
    const regional=pool.filter(c=>c.region===state.region);
    const ordered=[...shuffle(regional),...pool.filter(c=>c.region!==state.region)];
    const out=[];
    for(const c of ordered){
      if(!out.some(x=>x.name===c.name)) out.push(c);
      if(out.length>=4) break;
    }
    return out;
  }

  function presentCorruptionReturnMarket(originTier,originClub){
    const offers=corruptionReturnOffers(originTier);
    const choices=offers.map(c=>({
      label:`${c.name} — ${tierName(c.tier)}`,
      ovrProfile:null,
      preview:`Powrót po dyskwalifikacji • dokładnie poziom niżej niż ${originClub} • bazowa prognoza gry ok. ${projectedStartChance(c,0)}%`,
      act:()=>moveClub(c)
    }));

    const d={
      title:'Rok dyskwalifikacji minął. Wracasz na rynek.',
      text:`Po roku bez klubu możesz wrócić do gry, ale reputacja nie pozwala od razu odzyskać dawnego poziomu. Dostajesz oferty z ${tierName(Math.max(1,originTier-1))}.`,
      choices
    };
    presentDecision(d,advanceYear);
  }

  function processCorruptionSuspension(){
    const plan=state.corruptionPlan;
    if(!plan || !plan.caught) return false;

    const originClub=plan.clubName;
    const originTier=plan.originTier;
    const loss=plan.loss;
    state.corruptionPlan=null;

    // Natychmiastowe rozwiązanie kontraktu.
    log(`${originClub} rozwiązuje z tobą kontrakt.`,`Afera korupcyjna • dyskwalifikacja na cały następny sezon`);
    state.club={name:'Bez klubu — dyskwalifikacja',tier:0,strength:0,region:state.region,noClub:true};
    state.status='Dyskwalifikowany';
    state.loyalty=0;
    state.national='—';

    // Wchodzimy w następny sezon i cały go tracimy.
    state.age++;
    state.seasonYear++;
    const before=state.overall;
    state.overall=clamp(state.overall-loss,1,overallCap());
    noteLegendOverallChange(before);
    state.corruptionShadow=3;
    state.season={apps:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,minutes:0};
    state.seasonMatchExtras=[];
    state.seasonClubName='Bez klubu';
    state.seasonClubCompetition='Dyskwalifikacja';
    state.seasonFinished=true;
    state.seasonNationalCaps=0;
    state.seasonNationalGoals=0;
    state.lowAppsStreak=(state.lowAppsStreak||0)+1;

    state.careerSeasons.push({
      year:state.seasonYear,age:state.age,club:'Bez klubu',tier:0,
      ovrBefore:before,ovrAfter:state.overall,apps:0,goals:0,assists:0,minutes:0,
      grade:'DYSKWALIFIKACJA',form:'—',environment:'—',nationalCaps:0,nationalGoals:0,
      note:`Afera korupcyjna • ${originClub} zerwał kontrakt • rzut ${plan.roll}/100 • OVR -${loss}`
    });

    els.eventBox.classList.remove('special-event'); void els.eventBox.offsetWidth; els.eventBox.classList.add('special-event');
    els.eventBox.dataset.panelRole='event';
    els.eventBox.innerHTML=`<div class="event-kicker">SEZON ${state.seasonYear}/${String(state.seasonYear+1).slice(2)} • DYSKWALIFIKACJA</div><h3>Cały rok poza piłką.</h3><p>${originClub} zerwał kontrakt. 0 meczów, 0 minut. OVR ${before} → ${state.overall}. Po tym sezonie możesz wrócić wyłącznie poziom niżej.</p>`;
    render();

    presentCorruptionReturnMarket(originTier,originClub);
    return true;
  }

  function escapeDecisionHtml(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[ch]);
  }

  function decisionSnapshot(){
    return {
      timelineLength:(state.timeline||[]).length,
      club:state.club?.name||'—',
      overall:state.overall,
      professionalism:state.professionalism,
      recognition:state.recognition||0,
      loyalty:state.loyalty||0,
      injuryRisk:state.injuryRisk,
      playChance:projectedStartChance(state.club,state.boost||0)
    };
  }

  function decisionOutcome(ch,before){
    const after=decisionSnapshot();
    const changes=[];
    if(before.club!==after.club) changes.push(`klub: ${before.club} → ${after.club}`);
    if(before.overall!==after.overall) changes.push(`OVR: ${before.overall} → ${after.overall}`);
    if(before.playChance!==after.playChance) changes.push(`szansa na grę: ${before.playChance}% → ${after.playChance}%`);
    if(before.professionalism!==after.professionalism) changes.push(`profesjonalizm: ${before.professionalism} → ${after.professionalism}`);
    if(before.recognition!==after.recognition) changes.push(`medialność: ${before.recognition} → ${after.recognition}`);
    if(before.loyalty!==after.loyalty) changes.push(`lojalność: ${before.loyalty} → ${after.loyalty}`);
    if(before.injuryRisk!==after.injuryRisk) changes.push(`ryzyko urazu: ${before.injuryRisk}% → ${after.injuryRisk}%`);

    const freshLogs=(state.timeline||[]).slice(before.timelineLength);
    const latest=freshLogs[freshLogs.length-1]||null;
    const summary=latest
      ? `${latest.title}${latest.meta?` — ${latest.meta}`:''}`
      : changes.length
        ? `Zrealizowano wybór: ${ch.label}.`
        : `Zrealizowano wybór: ${ch.label}. Bez dodatkowego efektu.`;
    return {summary,details:changes.length?changes.join(' • '):'Stan kariery nie zmienił się bezpośrednio.'};
  }

  function focusDecisionResult(){
    try { els.decisionBox.scrollIntoView({behavior:'smooth',block:'center'}); } catch(_e){}
  }

  function showDecisionResult(summary,details,onDone){
    els.decisionTitle.textContent='WYNIK DECYZJI';
    els.decisionText.innerHTML=`<strong>${escapeDecisionHtml(summary)}</strong>
      <details class="roll-details">
        <summary>Pokaż szczegóły</summary>
        <div>${escapeDecisionHtml(details||'')}</div>
      </details>`;
    els.decisionChoices.innerHTML='';

    const next=document.createElement('button');
    next.className='primary full';
    next.textContent='DALEJ';
    next.onclick=()=>{
      state.pendingDecision=false;
      els.decisionBox.classList.add('hidden');
      els.playSeasonBtn.classList.remove('hidden');
      if(state.corruptionPlan && state.corruptionPlan.caught){
        processCorruptionSuspension();
        return;
      }
      onDone();
    };
    els.decisionChoices.appendChild(next);
    focusDecisionResult();
  }

  function polishReturnChoiceCandidates(){
    const ovr=state.overall||50;
    const ranked=seniorClubs()
      .filter(c=>c.name!==state.club.name)
      .map(c=>({
        club:c,
        // Najważniejszy jest OVR klubu. Województwo i szczebel rozstrzygają
        // dopiero remisy, więc 99 OVR nie może spaść do III ligi przez sam tier.
        gap:Math.abs(c.strength-ovr),
        home:c.region===state.region?1:0,
        pyramid:Number(c.pyramidLevel)||99
      }))
      .sort((a,b)=>a.gap-b.gap || b.club.strength-a.club.strength || b.home-a.home || a.pyramid-b.pyramid);
    if(!ranked.length) return [];

    // Z puli ośmiu najbliższych sportowo klubów losujemy
    // trzy różne propozycje. Dzięki temu powrót nie pokazuje stale tej samej trójki.
    const close=ranked.slice(0,8);
    const shortlist=shuffle(close).slice(0,3).map(item=>item.club);
    if(shortlist.length<3){
      const used=new Set(shortlist.map(c=>c.name));
      for(const item of ranked){
        if(used.has(item.club.name)) continue;
        shortlist.push(item.club);
        used.add(item.club.name);
        if(shortlist.length===3) break;
      }
    }
    return shortlist;
  }

  function presentPolishReturnChoice(ch,onDone){
    const candidates=polishReturnChoiceCandidates();
    els.decisionTitle.textContent='WYBIERZ KLUB W POLSCE';
    els.decisionText.textContent=candidates.length
      ? 'Trzy propozycje odpowiadają twojemu aktualnemu poziomowi. To ty wybierasz, gdzie wracasz.'
      : 'Nie znaleziono odpowiedniego polskiego klubu.';
    els.decisionChoices.innerHTML='';

    if(!candidates.length){
      showDecisionResult('Nie dochodzi do powrotu do Polski.','W bazie nie znaleziono klubu odpowiadającego twojemu poziomowi.',onDone);
      return;
    }

    candidates.forEach(club=>{
      const button=document.createElement('button');
      button.className='choice-btn';
      const chance=projectedStartChance(club,0);
      button.innerHTML=`<span class="choice-main">${escapeDecisionHtml(club.name)}</span><span class="choice-stake">${escapeDecisionHtml(clubCompetition(club))} • siła ${club.strength} OVR • prognoza gry ok. ${chance}%</span>`;
      button.onclick=()=>{
        const before=decisionSnapshot();
        moveClub(club);
        state.skipMarketOnce=true;
        render();
        const result=decisionOutcome(ch,before);
        showDecisionResult(result.summary,result.details,onDone);
      };
      els.decisionChoices.appendChild(button);
    });
    focusDecisionResult();
  }

  function presentEventTransferConfirmation(payload,onDone){
    const club=payload?.club;
    if(!club){ onDone(); return; }
    state.pendingDecision=true;
    els.decisionTitle.textContent='DOSTAJESZ OFERTĘ TRANSFEROWĄ';
    els.decisionText.textContent=`${payload.reason||'Po zdarzeniu pojawia się oferta'}: ${club.name} (${clubCompetition(club)}). Klub nie przeniesie cię bez twojej zgody.`;
    els.decisionChoices.innerHTML='';
    const options=[
      {label:`PRZYJMUJĘ — ${club.name}`,act:()=>{
        const old=state.club.name;
        moveClub(club);
        state.skipMarketOnce=true;
        log(`Przyjmujesz ofertę ${club.name}.`,`${old} → ${club.name} • świadomie zatwierdzony transfer po zdarzeniu`);
        render();
        showDecisionResult(`Przechodzisz do ${club.name}.`,`${clubCompetition(club)} • transfer został zatwierdzony osobną decyzją.`,onDone);
      }},
      {label:'ODRZUCAM OFERTĘ',act:()=>{
        log(`Odrzucasz ofertę ${club.name}.`,'Pozostajesz w obecnym klubie.');
        render();
        showDecisionResult('Odrzucasz transfer.','Pozostajesz w obecnym klubie.',onDone);
      }}
    ];
    options.forEach(option=>{
      const button=document.createElement('button');
      button.className='choice-btn';
      button.innerHTML=`<span class="choice-main">${escapeDecisionHtml(option.label)}</span>`;
      button.onclick=option.act;
      els.decisionChoices.appendChild(button);
    });
    focusDecisionResult();
  }

  function presentDecision(d,onDone=advanceYear){
    rememberEvent(d);
    state.pendingDecision=true; els.playSeasonBtn.classList.add('hidden'); els.decisionBox.classList.remove('hidden');
    els.decisionBox.classList.toggle('market-decision',!!d.market);
    if(els.decisionKicker) els.decisionKicker.textContent=d.market?'RYNEK TRANSFEROWY':'DECYZJA';
    els.decisionTitle.textContent=d.title;
    if(d.html) els.decisionText.innerHTML=d.html;
    else els.decisionText.textContent=d.text;
    els.decisionChoices.innerHTML='';

    d.choices.forEach(ch=>{
      const b=document.createElement('button'); b.className='choice-btn';
      if(d.market&&ch.club) applyClubOfferPalette(b,ch.club,'club-offer-choice');
      let stake='';
      if(ch.specialRoll==='corruption' || ch.specialRoll==='ultras_flares' || ch.specialRoll==='wisnicz_brawl' || ch.specialRoll==='grajewski_friendly' || ch.specialRoll==='olympic_supplements') stake=ch.preview;
      else if(ch.rollSpec) stake=rollSpecText(ch.rollSpec);
      else stake=choiceStakeText(ch);
      b.innerHTML=`<span class="choice-main">${ch.label}</span><span class="choice-stake">${stake}</span>`;

      b.onclick=()=>{
        if(d.market&&!ch.endCareer) state.focusSeasonButtonOnce=true;
        let simpleResult='';
        let detailResult='';

        if(ch.specialRoll==='polish_return_choice'){
          presentPolishReturnChoice(ch,onDone);
          return;
        }

        // MECZ PRZYJACIÓŁ ANDRZEJA GRAJEWSKIEGO — pełny, grywalny mecz.
        else if(ch.specialRoll==='grajewski_friendly'){
          els.decisionChoices.innerHTML='<p class="choice-stake">Przechodzimy do meczu…</p>';
          nssPolska.playClubDecisiveMatch({
            kicker:'MECZ TOWARZYSKI',
            homeName:'Przyjaciele Andrzeja Grajewskiego',
            homeStrength:62,
            opponent:{name:'Reszta Świata',strength:64},
            // Musi paść rozstrzygnięcie: remis uruchamia dogrywkę i karne.
            knockout:true
          }).then(result=>{
            const win=playedHomeWon(result);
            const scoreText=playedMatchScoreText(result);
            if(win){
              const before=state.overall;
              const bonus=Math.max(1,Math.round(before*.25));
              state.overall=before+bonus;
              state.grajewskiOverallCap=Math.max(state.grajewskiOverallCap||0,state.overall);
              noteLegendOverallChange(before);
              log('Przyjaciele Andrzeja Grajewskiego — Reszta Świata',`${scoreText} • zwycięstwo • OVR ${before} → ${state.overall} (+${bonus}, czyli 25%)`);
            } else {
              log('Przyjaciele Andrzeja Grajewskiego — Reszta Świata',`${scoreText} • porażka • natychmiastowy koniec kariery`);
            }
            state.pendingDecision=false;
            els.decisionBox.classList.add('hidden');
            els.playSeasonBtn.classList.remove('hidden');
            render();
            if(win) onDone();
            else retire();
          });
          return;
        }

        // KORUPCJA
        else if(ch.specialRoll==='corruption'){
          const r=rand(1,100);
          const caught=r>70;
          if(caught){
            const loss = 5;
            state.corruptionPlan={clubName:state.club.name,originTier:state.club.tier,caught:true,roll:r,loss};
            simpleResult=`WYKRYCIE. Dyskwalifikacja na cały sezon i -${loss} OVR.`;
          } else {
            const oldLeague=clubCompetition(state.club);
            state.corruptionPlan=null;
            state.forceCorruptPromotion=false;
            state.promotions++;
            const transition=applyPolishCompetitionTransition(state.club,-1);
            state.highestTier=Math.max(state.highestTier,state.club.tier);
            state.justPromoted=true;
            state.score+=18;

            // Zdarzenie wypada po zapisaniu sezonu, więc dopisujemy awans do
            // świeżego rekordu zamiast odkładać go na kolejny rok.
            const recent=(state.careerSeasons||[])[state.careerSeasons.length-1];
            if(recent && recent.club===state.club.name){
              recent.clubSeasonResult=recent.clubSeasonResult||{};
              setPromotionSuccess(recent.clubSeasonResult);
              recent.leaguePlace=recent.clubSeasonResult.place;
              recent.clubPointBreakdown=recent.clubPointBreakdown||{};
              recent.clubPointBreakdown.promotionPoints=15;
              recent.clubPointBreakdown.points=(recent.clubPointBreakdown.points||recent.clubPoints||0)+15;
              recent.clubPoints=recent.clubPointBreakdown.points;
              recent.note=[recent.note,'⬆️ Awans po ustawionym meczu'].filter(Boolean).join(' • ');
            }
            const newLeague=transition?.to||clubCompetition(state.club);
            simpleResult=`UKŁAD PRZECHODZI. ${state.club.name} awansuje: ${oldLeague} → ${newLeague}.`;
            log(`AWANS: ${state.club.name}`,`${oldLeague} → ${newLeague} • ustawiony kluczowy mecz`);
          }
          detailResult=`Rzut d100: ${r}. ${ch.preview}`;
          log('Decyzja korupcyjna',`Rzut ${r}/100 • ${caught?'WYKRYCIE':'UKŁAD PRZECHODZI'}`);
        }

        // ULTRASI / RACE — jedna kość, dwa bardzo różne skutki.
        else if(ch.specialRoll==='ultras_flares'){
          const r=rand(1,6);
          if(r<=3){
            const before=state.recognition||0;
            state.recognition=clamp(before+12,0,100);
            simpleResult=`Medialność ${before} → ${state.recognition}.`;
          } else {
            state.nextAppsFactor=Math.min(state.nextAppsFactor||1,.8);
            simpleResult='Zawieszenie: w następnym sezonie rozegrasz o 20% mniej meczów.';
          }
          detailResult=`Rzut kostką: ${r}. 1–3 → medialność +12 • 4–6 → -20% meczów w następnym sezonie.`;
          log('Race na stadionie',`Rzut k6: ${r} • ${simpleResult}`);
          render();
        }

        // DNI WIŚNICZA — jedna kość, sława albo uraz.
        else if(ch.specialRoll==='wisnicz_brawl'){
          const r=rand(1,6);
          if(r<=3){
            const before=state.recognition||0;
            state.recognition=clamp(before+10,0,100);
            simpleResult=`Medialność ${before} → ${state.recognition}.`;
          } else {
            state.nextMinutesFactor=Math.min(state.nextMinutesFactor||1,.8);
            simpleResult='Uraz: w następnym sezonie rozegrasz o 20% mniej minut.';
          }
          detailResult=`Rzut kostką: ${r}. 1–3 → medialność +10 • 4–6 → -20% minut w następnym sezonie.`;
          log('Dni Wiśnicza Małego',`Rzut k6: ${r} • ${simpleResult}`);
          render();
        }

        // SUPLEMENTY DOKTORA KADRY OLIMPIJSKIEJ — dokładnie jeden z jedenastu
        // równoprawdopodobnych wyników całkowitych: -5, -4, ... 0, ... +4, +5.
        else if(ch.specialRoll==='olympic_supplements'){
          const before=state.overall;
          const delta=rand(-5,5);
          state.overall=clamp(before+delta,1,overallCap());
          noteLegendOverallChange(before);
          const applied=state.overall-before;
          simpleResult=applied===0
            ?`Wylosowano ${delta>=0?'+':''}${delta} OVR. Twój OVR pozostaje na poziomie ${state.overall}.`
            :`Wylosowano ${delta>0?'+':''}${delta} OVR. OVR ${before} → ${state.overall}.`;
          detailResult=`Losowanie całkowite z przedziału -5…+5: ${delta>=0?'+':''}${delta}. Każdy z 11 wyników miał taką samą szansę.`;
          log('Suplementy doktora kadry olimpijskiej',`Losowanie ${delta>=0?'+':''}${delta} • OVR ${before} → ${state.overall}`);
          render();
        }

        // ZWYKŁY JEDEN RZUT
        else if(ch.rollSpec){
          const result=applyDecisionRoll(ch);
          simpleResult=result.result;
          detailResult=`Rzut d100: ${result.roll}. Możliwe wyniki: ${rollSpecText(ch.rollSpec)}.`;
        }

        else {
          if(ch.endCareer){
            if(ch.act) ch.act();
            state.pendingDecision=false;
            els.decisionBox.classList.add('hidden');
            els.playSeasonBtn.classList.remove('hidden');
            return;
          }

          const before=decisionSnapshot();
          if(ch.act) ch.act();
          if(state.pendingEventTransferOffer){
            const payload=state.pendingEventTransferOffer;
            state.pendingEventTransferOffer=null;
            render();
            presentEventTransferConfirmation(payload,onDone);
            return;
          }
          render();
          const result=decisionOutcome(ch,before);
          showDecisionResult(result.summary,result.details,onDone);
          return;
        }

        els.decisionTitle.textContent='WYNIK DECYZJI';
        els.decisionText.innerHTML=`<strong>${simpleResult}</strong>
          <details class="roll-details">
            <summary>Pokaż szczegóły losowania</summary>
            <div>${detailResult}</div>
          </details>`;
        els.decisionChoices.innerHTML='';

        const next=document.createElement('button');
        next.className='primary full';
        next.textContent='DALEJ';
        next.onclick=()=>{
          state.pendingDecision=false;
          els.decisionBox.classList.add('hidden');
          els.playSeasonBtn.classList.remove('hidden');
          if(state.corruptionPlan && state.corruptionPlan.caught){
            processCorruptionSuspension();
            return;
          }
          onDone();
        };
        els.decisionChoices.appendChild(next);
        focusDecisionResult();
      };
      els.decisionChoices.appendChild(b);
    });

    // Rynek pojawia się po podsumowaniu oraz ewentualnym zdarzeniu. Na długim
    // ekranie telefonu mógł zostać poniżej aktualnego kadru i wyglądać tak,
    // jakby zniknął. Każde zwykłe okno transferowe jest teraz jawnie oznaczone
    // i automatycznie sprowadzone do widoku.
    if(d.market){
      setTimeout(()=>els.decisionBox.scrollIntoView?.({behavior:'smooth',block:'start'}),0);
    }
  }


  // v0.52 — POLSKI RYNEK REGIONALNY.
  // Im niższa liga, tym mocniej liczy się geografia:
  // aktualne województwo klubu -> sąsiednie -> rodzinne -> reszta Polski.
  const POLISH_REGION_NEIGHBORS={
    'Dolnośląskie':['Lubuskie','Wielkopolskie','Opolskie'],
    'Kujawsko-pomorskie':['Pomorskie','Warmińsko-mazurskie','Mazowieckie','Łódzkie','Wielkopolskie'],
    'Lubelskie':['Podlaskie','Mazowieckie','Świętokrzyskie','Podkarpackie'],
    'Lubuskie':['Zachodniopomorskie','Wielkopolskie','Dolnośląskie'],
    'Łódzkie':['Wielkopolskie','Kujawsko-pomorskie','Mazowieckie','Świętokrzyskie','Śląskie','Opolskie'],
    'Małopolskie':['Śląskie','Świętokrzyskie','Podkarpackie'],
    'Mazowieckie':['Warmińsko-mazurskie','Podlaskie','Lubelskie','Świętokrzyskie','Łódzkie','Kujawsko-pomorskie'],
    'Opolskie':['Dolnośląskie','Wielkopolskie','Łódzkie','Śląskie'],
    'Podkarpackie':['Małopolskie','Świętokrzyskie','Lubelskie'],
    'Podlaskie':['Warmińsko-mazurskie','Mazowieckie','Lubelskie'],
    'Pomorskie':['Zachodniopomorskie','Wielkopolskie','Kujawsko-pomorskie','Warmińsko-mazurskie'],
    'Śląskie':['Opolskie','Łódzkie','Świętokrzyskie','Małopolskie'],
    'Świętokrzyskie':['Łódzkie','Mazowieckie','Lubelskie','Podkarpackie','Małopolskie','Śląskie'],
    'Warmińsko-mazurskie':['Pomorskie','Kujawsko-pomorskie','Mazowieckie','Podlaskie'],
    'Wielkopolskie':['Zachodniopomorskie','Pomorskie','Kujawsko-pomorskie','Łódzkie','Opolskie','Dolnośląskie','Lubuskie'],
    'Zachodniopomorskie':['Pomorskie','Wielkopolskie','Lubuskie']
  };

  function polishRegionsAdjacent(a,b){
    return !!(a && b && (POLISH_REGION_NEIGHBORS[a]||[]).includes(b));
  }

  function polishLocalityClass(c,current=state.club){
    if(!c || isForeignClub(c)) return 'none';
    const currentRegion=current && current.region ? current.region : state.region;
    const homeRegion=state.region;

    if(c.region===currentRegion) return 'current';
    if(polishRegionsAdjacent(currentRegion,c.region)) return 'neighbor';
    if(c.region===homeRegion) return 'home';
    return 'far';
  }

  function polishLocalityBonus(c,current=state.club){
    if(!c || isForeignClub(c)) return 0;

    // tier 1 = głęboka lokalna piłka, tier 6 = Ekstraklasa.
    // Bierzemy niższy z poziomów klubu obecnego i zainteresowanego,
    // bo transfer na dole piramidy jest najbardziej lokalny.
    const localTier=Math.min(c.tier||6,current?.tier||6);
    const cls=polishLocalityClass(c,current);

    const same={1:28,2:24,3:18,4:11,5:5,6:2};
    const near={1:16,2:13,3:9,4:5,5:2,6:0};
    const home={1:13,2:11,3:8,4:6,5:4,6:2};
    const farPenalty={1:-9,2:-7,3:-4,4:-2,5:0,6:0};

    if(cls==='current') return same[localTier]||0;
    if(cls==='neighbor') return near[localTier]||0;
    if(cls==='home') return home[localTier]||0;
    return farPenalty[localTier]||0;
  }

  function veteranCareerText(){
    if(state.age<35) return '';
    if(state.age<=37) return 'Wiek coraz mocniej odbija się na OVR.';
    if(state.age===38) return 'Wiek coraz mocniej odbija się na OVR. Przed tobą być może ostatni pełny sezon bez pytania o zakończenie kariery.';
    if(state.age===39) return 'Regres fizyczny przyspiesza. Od teraz możesz też sam zakończyć karierę z poziomu rynku.';
    return 'Jesteś weteranem, ale kluby nadal oceniają cię po aktualnym OVR i formie, nie po metryce.';
  }

  function annualMarketOffers(performance){
    const current={...state.club};
    const contractLocked=longContractActive(current);
    const marketTarget=state.extraMarketOffer?10:4;
    const result=[];
    const polish=seniorClubs().filter(c=>c.name!==current.name);
    const history=state.offerHistory||{};
    const offerCounts=state.offerCounts||{};
    const apps=state.season?.apps||0;
    const lowStreak=state.lowAppsStreak||0;
    const talentLevel=state.talent||50;
    const media=state.recognition||0;
    const lastCompleted=(state.careerSeasons||[]).slice().reverse().find(s=>s.club&&s.club!=='Bez klubu')||null;
    const seasonGradeIndex=lastCompleted?.club===current.name?(lastCompleted.gradeIndex??-1):-1;
    const outstandingSeason=seasonGradeIndex>=7;
    const greatSeason=seasonGradeIndex===6;
    const standoutInterestBonus=outstandingSeason?16:greatSeason?8:0;
    const standoutStrengthWindow=outstandingSeason?5:greatSeason?2:0;

    const recentlyOffered=c=>{
      const y=history[c.name];
      return Number.isFinite(y) && state.seasonYear-y<=4;
    };
    const add=c=>{
      if(!c || c.name===current.name || result.some(x=>x.name===c.name) || recentlyOffered(c)) return false;
      result.push({...c});
      return true;
    };

    // Awaryjne dopełnienie rynku nadal może sięgnąć po klub z historii,
    // ale zaczyna od nazw widzianych najrzadziej i najdawniej. Dzięki temu
    // wąska pula nie przykleja co roku tych samych 3–4 zespołów.
    const addEvenIfRecent=c=>{
      if(!c || c.name===current.name || result.some(x=>x.name===c.name)) return false;
      result.push({...c});
      return true;
    };

    const forceFill=(pool,target=marketTarget)=>{
      const ranked=pool.filter(c=>
        c && c.name!==current.name && !result.some(x=>x.name===c.name)
      ).map(c=>({c,tie:Math.random()})).sort((a,b)=>{
        const countDiff=(offerCounts[a.c.name]||0)-(offerCounts[b.c.name]||0);
        if(countDiff) return countDiff;
        const aYear=Number.isFinite(history[a.c.name])?history[a.c.name]:-9999;
        const bYear=Number.isFinite(history[b.c.name])?history[b.c.name]:-9999;
        return aYear-bYear||a.tie-b.tie;
      });
      for(const {c} of ranked){
        addEvenIfRecent(c);
        if(result.length>=target) break;
      }
      return result.length>=target;
    };

    const struggling = apps<scaledLeagueCount(8,current,1) || performance<30 || lowStreak>=2;
    const perfGood=performance>=43;
    const perfGreat=performance>=56;

    function interestChance(c,kind='normal'){
      // T6-T8 są lokalne. T5 pozostaje słabszym, ale normalnym rynkiem zagranicznym.
      if(isForeignClub(c) && c.foreignTier>=6){
        if(!isForeignClub(current) || !deepLocalForeignAccessible(c,current)) return 0;
      }

      const levelDiff=clubMarketLevel(c)-clubMarketLevel(current);
      const strengthDiff=state.overall-c.strength;
      let chance=34;

      chance += strengthDiff*1.8;
      chance += clamp((performance-36)*.65,-18,22);
      chance += Math.min(11,apps*.35);
      chance += (media-25)*.18;
      // Końcowa jakość sezonu podbija realne zainteresowanie całego rynku,
      // nie tylko jeden ręcznie gwarantowany klub.
      chance += standoutInterestBonus;
      if(c.name===state.favoriteClubName) chance+=30;

      if(levelDiff>0) chance-=levelDiff*13;
      if(levelDiff<0) chance+=Math.min(10,Math.abs(levelDiff)*4);

      if(apps<scaledLeagueCount(8,current,1) && clubMarketLevel(c)>=clubMarketLevel(current)) chance-=16;
      if(apps<scaledLeagueCount(4,current,1) && clubMarketLevel(c)>=clubMarketLevel(current)) chance-=10;
      if(lowStreak>=2 && clubMarketLevel(c)>=clubMarketLevel(current)) chance-=18;
      if(lowStreak>=3 && clubMarketLevel(c)>=clubMarketLevel(current)) chance-=10;
      if((state.corruptionShadow||0)>0 && clubMarketLevel(c)>=clubMarketLevel(current)) chance-=28;

      if(state.age<=22 && talentLevel>=70)
        chance += kind==='project' ? 20+Math.round((talentLevel-70)*.25) : 4;

      if(!isForeignClub(c)) chance += polishLocalityBonus(c,current);
      if(kind==='safe') chance+=12;
      if(kind==='ambitious') chance-=3;

      if(isForeignClub(c)){
        const reqMedia=requiredForeignRecognition(c.foreignTier);
        const reqOvr=requiredForeignOvr(c.foreignTier);

        if(!isForeignClub(current)){
          // Sportowy profil ogranicza karę niskiej medialności. Nadal łatwiej
          // wyjechać nazwisku rozpoznawalnemu, ale 2/100 nie zamyka kariery.
          const reqPerf=({5:23,4:27,3:34,2:42,1:50})[c.foreignTier]||30;
          const sportingOverride=state.overall>=reqOvr+3&&performance>=reqPerf;
          if(sportingOverride) chance+=Math.max(-8,(media-reqMedia)*.25);
          else{
            chance += (media-reqMedia)*1.10;
            if(media<reqMedia) chance -= (reqMedia-media)*1.55;
          }
          if(state.overall<reqOvr) chance -= (reqOvr-state.overall)*3.0;
          if(state.seniorInternational) chance+=10;
          if(state.age<=21 && state.seniorInternational) chance+=6;
        } else {
          // Za granicą geografia pomaga, ale NIE wyznacza już jakości ofert.
          if(c.country===current.country) chance+=18;
          else if(current.zone==='Europa' && c.zone==='Europa' && clubTransferRegion(c)===clubTransferRegion(current)) chance+=10;
          else if(c.zone===current.zone) chance+=5;

          if(current.zone && current.zone!=='Europa'){
            if(c.country===current.country) chance+=8;
            else if(c.zone===current.zone) chance+=6;
          }

          // Lepszy tier jest trudniejszym transferem, ale kara jest niewielka:
          // status sportowy i medialność mają być ważniejsze od geografii.
          if(c.foreignTier<current.foreignTier)
            chance-=(current.foreignTier-c.foreignTier)*4;

          // Medialność jest ważna, lecz po wejściu na zagraniczny rynek
          // sportowa jakość ma większą wagę niż szum wokół nazwiska.
          chance += (media-reqMedia)*.18;
        }
      }

      chance+=rand(-12,12);
      return clamp(Math.round(chance),2,96);
    }

    function tryFrom(pool,kind){
      const shuffled=shuffle(pool.filter(c=>!recentlyOffered(c) && !result.some(x=>x.name===c.name)));
      for(const c of shuffled){
        if(rand(1,100)<=interestChance(c,kind)){
          add(c);
          return true;
        }
      }
      return false;
    }

    function tryFavoriteOffer(){
      const favorite=findAnyClubByName(state.favoriteClubName);
      if(!favorite||favorite.name===current.name) return false;
      const currentLevel=clubMarketLevel(current);
      const targetLevel=clubMarketLevel(favorite);
      const allowedRise=outstandingSeason?2.4:greatSeason?1.8:1.2;
      if(favorite.strength>state.overall+(outstandingSeason?15:greatSeason?11:8)) return false;
      if(targetLevel>currentLevel+allowedRise) return false;
      if(isForeignClub(favorite)){
        if(favorite.foreignTier>=6&&(!isForeignClub(current)||!deepLocalForeignAccessible(favorite,current))) return false;
        if(!foreignTierReachable(favorite.foreignTier,performance,!isForeignClub(current))) return false;
      }
      const chance=clamp(Math.round(48+(performance-35)*.35+(state.recognition||0)*.10+(greatSeason?10:0)+(outstandingSeason?22:0)),38,88);
      return rand(1,100)<=chance?addEvenIfRecent({...favorite,favoriteOffer:true}):false;
    }

    // Zagraniczne pule zawsze sprawdzamy od NAJLEPSZEGO dostępnego tieru.
    // To naprawia wcześniejszy błąd, gdzie sortowanie zaczynało od T4.
    function tryFromBestForeignTier(pool,kind='normal'){
      const clean=pool.filter(c=>isForeignClub(c) && !recentlyOffered(c) && !result.some(x=>x.name===c.name));
      const tiers=[...new Set(clean.map(c=>c.foreignTier))].sort((a,b)=>a-b);
      for(const ft of tiers){
        if(tryFrom(clean.filter(c=>c.foreignTier===ft),kind)) return true;
      }
      return false;
    }

    // Jedna konkretna próba z najlepszego dostępnego tieru.
    // Używana dla zawodnika, który jeszcze wyraźnie nie przerósł klubu:
    // awans ma być możliwy, ale nie automatyczny.
    function trySingleBestForeignTier(pool,kind='ambitious'){
      const clean=pool.filter(c=>isForeignClub(c) && !recentlyOffered(c) && !result.some(x=>x.name===c.name));
      if(!clean.length) return false;
      const bestTier=Math.min(...clean.map(c=>c.foreignTier));
      const candidates=shuffle(clean.filter(c=>c.foreignTier===bestTier));
      const c=candidates[0];
      if(!c) return false;
      if(rand(1,100)<=interestChance(c,kind)) return add(c);
      return false;
    }

    // ŚWIETNY/WYBITNY sezon musi być widoczny na rynku niezależnie od tego,
    // czy wewnętrzna metryka performance akurat znalazła się tuż pod progiem.
    // WYBITNY gwarantuje jeden naturalny krok wyżej i może dać drugi;
    // ŚWIETNY daje mniejszą, ale wyraźną szansę na jeden taki kierunek.
    function addStandoutCareerOffer(slot=1){
      if(!outstandingSeason&&!greatSeason) return false;
      const gate=outstandingSeason?(slot===1?100:65):72;
      if(rand(1,100)>gate) return false;

      const currentLevel=clubMarketLevel(current);
      const strengthSlack=outstandingSeason?18:12;
      const pool=[...polish,...GAME_DATA.foreignClubs].filter(c=>{
        if(!c||c.name===current.name||clubMarketLevel(c)<=currentLevel+.05) return false;
        if(c.strength>state.overall+strengthSlack) return false;
        if(isForeignClub(c)){
          if(c.foreignTier>=6 && (!isForeignClub(current)||!deepLocalForeignAccessible(c,current))) return false;
          if(!isForeignClub(current)){
            if(current.tier<5) return false;
            // Kapitalny sezon rozluźnia medialność, ale nie pozwala 55 OVR
            // wskoczyć do światowej czołówki.
            const ovrSlack=outstandingSeason?7:4;
            if(state.overall<requiredForeignOvr(c.foreignTier)-ovrSlack) return false;
          } else if(c.foreignTier>=current.foreignTier){
            return false;
          }
        }
        return true;
      });
      if(!pool.length) return false;

      const bestStep=Math.min(...pool.map(clubMarketLevel));
      const natural=pool.filter(c=>clubMarketLevel(c)<=bestStep+.75);
      const foreign=natural.filter(isForeignClub);
      const domestic=natural.filter(c=>!isForeignClub(c));
      let candidates=natural;
      const foreignPreference=isForeignClub(current)
        ?100
        :current.tier>=6
          ?(outstandingSeason?72:48)
          :(outstandingSeason?42:24);
      if(foreign.length&&rand(1,100)<=foreignPreference) candidates=foreign;
      else if(domestic.length) candidates=domestic;

      candidates=candidates.slice().sort((a,b)=>
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall) ||
        clubMarketLevel(a)-clubMarketLevel(b)
      );
      const sample=candidates.slice(0,Math.min(12,candidates.length));
      const chosen=sample.length?pick(sample):null;
      return chosen?addEvenIfRecent({...chosen,formBreakthrough:outstandingSeason?'WYBITNY':'ŚWIETNY'}):false;
    }

    tryFavoriteOffer();
    addStandoutCareerOffer(1);
    if(outstandingSeason) addStandoutCareerOffer(2);

    // ==========================================================
    // JESTEŚ JUŻ ZA GRANICĄ
    // Jakość -> dopiero potem kraj/region/kontynent.
    // ==========================================================
    if(isForeignClub(current)){
      const strengthWindow=(perfGreat?12:perfGood?9:7)+standoutStrengthWindow;
      const worstTier=foreignWorstOfferTier(current,performance,apps,lowStreak);
      const forcedStepDown=severeClubMismatch(current);
      const crisisTargetTier=Math.min(8,current.foreignTier+1);

      const foreignPool=GAME_DATA.foreignClubs.filter(c=>
        c.name!==current.name &&
        !recentlyOffered(c) &&
        c.foreignTier<=worstTier &&
        (forcedStepDown
          ? c.foreignTier===crisisTargetTier
          : (c.foreignTier===current.foreignTier || foreignTierReachable(c.foreignTier,performance,false))) &&
        (forcedStepDown || c.foreignTier===current.foreignTier || c.strength<=state.overall+strengthWindow) &&
        (c.foreignTier<6 || deepLocalForeignAccessible(c,current))
      );

      const better=foreignPool.filter(c=>c.foreignTier<current.foreignTier);
      const sameTier=foreignPool.filter(c=>c.foreignTier===current.foreignTier);
      const allowedStepDown=foreignPool.filter(c=>c.foreignTier>current.foreignTier);
      const outgrown=hasOutgrownForeignClub(current,performance,apps);

      const addCareerStep=()=>{
        if(!better.length || current.foreignTier<=1) return false;

        // Naturalny awans to przede wszystkim JEDEN tier wyżej.
        // Nie teleportujemy automatycznie z T4 do T1 tylko dlatego, że rynek jest otwarty.
        const nextTier=Math.max(1,current.foreignTier-1);
        let stepPool=better.filter(c=>c.foreignTier===nextTier);
        if(!stepPool.length) stepPool=better;

        // Najpierw próbujemy normalnego zainteresowania.
        if(tryFromBestForeignTier(stepPool,outgrown?'normal':'ambitious')) return true;

        if(!outgrown) return false;

        // Jeśli zawodnik wyraźnie przerósł klub (np. 97% szans gry),
        // medialność nie może zamrozić kariery. Gwarantujemy jedną
        // sportowo osiągalną ofertę z kolejnego poziomu.
        const candidates=shuffle(stepPool.filter(c=>
          !recentlyOffered(c) &&
          !result.some(x=>x.name===c.name)
        ));
        if(!candidates.length) return false;

        // Preferuj znajomy rynek, ale globalna oferta nadal jest możliwa.
        candidates.sort((a,b)=>{
          const aLocal=a.country===current.country?0:
            clubTransferRegion(a)===clubTransferRegion(current)?1:
            a.zone===current.zone?2:3;
          const bLocal=b.country===current.country?0:
            clubTransferRegion(b)===clubTransferRegion(current)?1:
            b.zone===current.zone?2:3;
          return aLocal-bLocal || Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall);
        });

        return add(candidates[0]);
      };

      // Jeżeli wyraźnie przerosłeś klub, dostajesz realną drogę sportowego awansu.
      // Jeżeli jeszcze nie — lepszy tier nadal może się odezwać, ale wykonujemy
      // tylko JEDNĄ próbę zainteresowania, a nie serię prób po całej bazie.
      if(better.length){
        if(outgrown) addCareerStep();
        else trySingleBestForeignTier(better,'ambitious');
      }

      // Potem podobny poziom, z geografią jako tie-breakerem.
      const sameCountry=sameTier.filter(c=>c.country===current.country);
      const sameRegion=sameTier.filter(c=>c.country!==current.country && clubTransferRegion(c)===clubTransferRegion(current));
      const sameZone=sameTier.filter(c=>c.country!==current.country && clubTransferRegion(c)!==clubTransferRegion(current) && c.zone===current.zone);

      if(result.length<2) tryFromBestForeignTier(sameCountry,'normal');
      if(result.length<2) tryFromBestForeignTier(sameRegion,'normal');
      if(result.length<marketTarget) tryFromBestForeignTier(sameZone,'normal');

      // Brak regionalnego dopasowania nie blokuje globalnego rynku.
      while(result.length<marketTarget && tryFromBestForeignTier(foreignPool,'normal')){}

      // Zejście o tier w dół może pojawić się tylko przy realnym kryzysie/minutach.
      if(result.length<marketTarget && struggling)
        while(result.length<marketTarget && tryFromBestForeignTier(allowedStepDown,'safe')){}

      // Powrót do Polski wynika z sytuacji sportowej, nie z wieku zawodnika.
      const returnChance=struggling?26:5;
      if(result.length<marketTarget && rand(1,100)<=returnChance){
        const minReturnTier=state.overall>=66?6:5;
        const polishReturn=polish.filter(c=>c.tier>=minReturnTier && c.strength<=state.overall+4);
        tryFrom(polishReturn,'safe');
      }

      // Rynek ma zawsze dać trzy kluby. Najpierw powtarzamy tylko sportowo
      // sensowne zagraniczne kierunki; historia ofert ustępuje miejsca grywalności.
      if(result.length<marketTarget){
        const fallbackWorst=current.foreignTier;
        const foreignFallback=GAME_DATA.foreignClubs.filter(c=>
          c.name!==current.name &&
          c.foreignTier>=Math.max(1,current.foreignTier-1) &&
          c.foreignTier<=fallbackWorst &&
          c.strength<=state.overall+12 &&
          (c.foreignTier<6 || deepLocalForeignAccessible(c,current))
        );
        forceFill(foreignFallback,marketTarget);
      }

      // Skrajny fallback przy realnym kryzysie sportowym. Powrót jest jednak
      // stopniowy: z czołowej ligi zagranicznej nie spada się jednym oknem
      // prosto do lig regionalnych.
      if(result.length<marketTarget && struggling){
        const returnFloor=current.foreignTier<=2?6:current.foreignTier===3?5:current.foreignTier===4?4:1;
        const returnMax=current.foreignTier<=3?6:current.foreignTier===4?5:3;
        forceFill(polish.filter(c=>c.tier>=returnFloor&&c.tier<=returnMax&&c.strength<=Math.max(state.overall+8,55)),marketTarget);
      }

      return result.slice(0,marketTarget);
    }

    // ==========================================================
    // JESTEŚ W POLSCE
    // ==========================================================
    let naturalMax = state.overall>=66?6:state.overall>=59?5:state.overall>=52?4:state.overall>=46?3:2;
    naturalMax=Math.max(naturalMax,Math.min(6,current.tier));
    if(perfGood) naturalMax=Math.min(6,naturalMax+1);
    if(outstandingSeason) naturalMax=Math.min(6,naturalMax+1);
    if(lowStreak>=2 && apps<scaledLeagueCount(8,current,1)) naturalMax=Math.min(naturalMax,current.tier);

    const marketBonus=state.marketBonus||0;
    const marketHit=marketBonus>0 && rand(1,100)<=marketBonus;
    if(marketHit) naturalMax=Math.min(6,naturalMax+1+(state.agentMarketJump||0));
    state.marketBonus=0;
    state.agentMarketJump=0;

    // Normalny coroczny rynek NIE zasypuje zawodnika ofertami w dół.
    // Zejście o szczebel pojawia się tylko przy problemach z grą/formą.
    const minPolishTier=struggling
      ? Math.max(1,current.tier-1)
      : current.tier;
    const strengthWindow=(perfGreat?12:perfGood?9:6)+(marketHit?5:0)+standoutStrengthWindow;

    const attainable=polish.filter(c=>
      c.tier>=minPolishTier &&
      c.tier<=naturalMax &&
      c.strength<=state.overall+strengthWindow
    );

    // ----------------------------------------------------------
    // III LIGA I NIŻEJ — TWARDY KLUCZ WOJEWÓDZKI.
    // Cztery propozycje na ekranie:
    // 1) przedłużenie z obecnym klubem,
    // 2) klub z TEGO SAMEGO województwa,
    // 3) drugi klub z TEGO SAMEGO województwa,
    // 4) dopiero jeden klub SPOZA województwa.
    //
    // Sąsiednie województwa nie liczą się do dwóch obowiązkowych
    // lokalnych slotów. Geografia buduje zestaw ofert.
    // ----------------------------------------------------------
    if(current.tier<=3){
      const lowerMinTier=struggling ? Math.max(1,current.tier-1) : current.tier;

      const broad=polish.filter(c=>
        c.tier>=lowerMinTier &&
        c.tier<=naturalMax &&
        c.strength<=state.overall+strengthWindow+2
      );

      const fresh=pool=>shuffle(pool.filter(c=>
        !recentlyOffered(c) &&
        !result.some(x=>x.name===c.name)
      ));

      const addGuaranteed=(pool,kind='normal')=>{
        const candidates=fresh(pool);
        if(!candidates.length) return false;

        for(const c of candidates){
          if(rand(1,100)<=interestChance(c,kind)){
            add(c);
            return true;
          }
        }

        candidates.sort((a,b)=>
          Math.abs(a.tier-current.tier)-Math.abs(b.tier-current.tier) ||
          Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
        );
        return add(candidates[0]);
      };

      const currentProvince=current.region||state.region;

      // DWA obowiązkowe sloty z dokładnie tego samego województwa.
      const sameProvince=broad.filter(c=>c.region===currentProvince);

      addGuaranteed(sameProvince,'normal');
      if(result.length<2) addGuaranteed(sameProvince,'normal');

      // Jeżeli w podstawowym oknie sportowym zabrakło drugiego klubu,
      // szukamy szerzej PO SZCZEBLACH, ale nadal tylko w tym województwie.
      if(result.length<2){
        const sameProvinceFallback=polish.filter(c=>
          c.region===currentProvince &&
          c.tier<=Math.max(current.tier,naturalMax) &&
          c.tier>=Math.max(1,current.tier-2) &&
          c.strength<=state.overall+strengthWindow+5
        );
        while(result.length<2 && addGuaranteed(sameProvinceFallback,'safe')){}
      }

      // Dopiero trzeci transfer jest spoza województwa.
      const outsideProvince=broad.filter(c=>c.region!==currentProvince);
      if(result.length<3) addGuaranteed(outsideProvince,'normal');

      if(result.length<3){
        const outsideFallback=polish.filter(c=>
          c.region!==currentProvince &&
          c.tier>=Math.max(1,current.tier-1) &&
          c.tier<=Math.max(current.tier,naturalMax) &&
          c.strength<=state.overall+strengthWindow+5
        );
        addGuaranteed(outsideFallback,'safe');
      }

      // Ostateczna siatka bezpieczeństwa nigdy nie omija już poziomu sportowego.
      // Przy skrajnie niskim OVR wolno zejść prosto do tieru 1, ale nie wolno
      // dopełnić ekranu przypadkową ofertą z Ekstraklasy.
      const regionalSafetyCeiling=Math.max(30,state.overall+10);
      const sameProvinceSafety=polish.filter(c=>
        c.region===currentProvince&&c.tier===1&&c.strength<=regionalSafetyCeiling
      );
      const outsideSafety=polish.filter(c=>
        c.region!==currentProvince&&c.tier===1&&c.strength<=regionalSafetyCeiling
      );

      while(result.length<2 && addGuaranteed(sameProvinceSafety,'safe')){}
      if(result.length<3) addGuaranteed(outsideSafety,'safe');

      // Czwarta oferta jest stałą częścią zwykłego rynku; agent Piekarskiego
      // rozszerza tę samą logikę do dziesięciu kart. Po dwóch lokalnych i
      // jednej wyjazdowej kolejne miejsca dobieramy z całej sensownej puli.
      while(result.length<marketTarget && addGuaranteed(broad,'normal')){}

      // Historia ofert nie może wyczyścić całego rynku. Powtórki są dozwolone,
      // lecz nadal wyłącznie w najniższych ligach regionalnych.
      if(result.length<2) forceFill(sameProvinceSafety,2);
      if(result.length<3) forceFill(outsideSafety,3);
      if(result.length<marketTarget) forceFill([...sameProvinceSafety,...outsideSafety,...broad],marketTarget);

      // Awaria danych nie tworzy oferty z wyższej ligi: szukamy najbliższych
      // OVR klubów tieru 1, najpierw w bieżącym województwie.
      const fillClosest=(pool,target)=>{
        const ordered=pool.slice().sort((a,b)=>
          Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
        );
        for(const c of ordered){
          addEvenIfRecent(c);
          if(result.length>=target) break;
        }
      };
      if(result.length<2) fillClosest(polish.filter(c=>c.region===currentProvince&&c.tier===1),2);
      if(result.length<3) fillClosest(polish.filter(c=>c.region!==currentProvince&&c.tier===1),3);
      if(result.length<marketTarget) fillClosest(polish.filter(c=>c.tier===1),marketTarget);

      return result.slice(0,marketTarget);
    }

    // ----------------------------------------------------------
    // PIERWSZY WYJAZD ZA GRANICĘ
    // Najpierw wyznaczamy poziom, potem losujemy klub.
    // ----------------------------------------------------------
    const foreignPool=GAME_DATA.foreignClubs.filter(c=>{
      if(c.foreignTier>=6) return false; // T6-T8 są dostępne dopiero lokalnie.
      if(recentlyOffered(c)) return false;
      if(!foreignTierReachable(c.foreignTier,performance,true)) return false;

      const reqPerf=({5:23,4:27,3:34,2:42,1:50})[c.foreignTier]||30;
      if(performance<reqPerf-5 && !state.seniorInternational) return false;

      return c.strength<=state.overall+(perfGreat?10:perfGood?7:5);
    });

    const abroadWindow=firstForeignWindow(performance,current);
    const foreignPriority=
      current.tier>=6 &&
      (
        state.seniorInternational ||
        (state.age<=21 && state.overall>=66 && media>=35) ||
        (state.overall>=70 && media>=45)
      );

    let foreignGatePassed=false;
    const tryForeignGate=()=>{
      if(foreignGatePassed || !foreignPool.length || state.age<18 || apps<6) return false;
      foreignGatePassed=true;
      if(rand(1,100)>abroadWindow) return false;
      return tryFromBestForeignTier(foreignPool,'normal');
    };

    // 18-letni reprezentant / duży talent z ESA: zagranica jest sprawdzana PRZED
    // zapełnieniem trzech miejsc ofertami krajowymi.
    if(foreignPriority){
      tryForeignGate();

      // Bardzo mocny i medialny zawodnik może dostać więcej niż jeden telefon z zagranicy.
      if(result.length<2 && foreignPool.length && state.overall>=72 && media>=50)
        tryFromBestForeignTier(foreignPool,'normal');
    }

    // Projekt młodego w Polsce.
    if(state.age<=22 && talentLevel>=70 && result.length<marketTarget){
      let scoutChance=5+(talentLevel-70)*.45;
      if(performance>=34) scoutChance+=(performance-34)*.25;
      if(apps<scaledLeagueCount(8,current,1)) scoutChance-=4;
      if(lowStreak>=2) scoutChance-=5;
      scoutChance=clamp(Math.round(scoutChance),3,28);

      if(rand(1,100)<=scoutChance){
        const projectPool=polish.filter(c=>
          c.tier>=Math.min(6,current.tier+1) &&
          c.tier<=6 &&
          c.strength>=state.overall+7 &&
          c.strength<=state.overall+24
        );
        for(const c of shuffle(projectPool)){
          if(rand(1,100)<=interestChance(c,'project')){
            add({...c,talentProject:true});
            break;
          }
        }
      }
    }

    const ambitious=attainable.filter(c=>
      c.tier>current.tier ||
      (c.tier===current.tier && c.strength>current.strength+2)
    );
    const lateral=attainable.filter(c=>c.tier===current.tier);

    // Regionalność pozostaje silna nisko, ale tylko w sensownej sportowo puli.
    const localAttainable=attainable.filter(c=>{
      const cls=polishLocalityClass(c,current);
      return cls==='current' || cls==='neighbor' || cls==='home';
    });

    if(current.tier<=3 && result.length<marketTarget){
      tryFrom(localAttainable,'normal');
    } else if(current.tier===4 && result.length<marketTarget && rand(1,100)<=60){
      tryFrom(localAttainable,'normal');
    }

    while(result.length<marketTarget && tryFrom(ambitious,'ambitious')){}
    while(result.length<marketTarget && tryFrom(lateral,'normal')){}

    // Zwykły zawodnik dostaje szansę zagraniczną po polskich naturalnych ofertach.
    // Priorytetowy profil dostał tę szansę już wcześniej.
    if(!foreignPriority && result.length<marketTarget) tryForeignGate();

    // Jeśli bramka zagraniczna przeszła, a zawodnik jest naprawdę mocny,
    // dopuszczamy drugą sensowną ofertę z zagranicy.
    if(foreignGatePassed && result.length<marketTarget && state.overall>=74 && media>=55)
      tryFromBestForeignTier(foreignPool,'normal');

    // Bezpieczne zejście jest awaryjne i tylko dla zawodnika, który ma problem z grą.
    if(struggling && result.length<marketTarget){
      const safe=polish.filter(c=>
        c.tier>=Math.max(1,current.tier-1) &&
        c.tier<=current.tier &&
        c.strength<=state.overall+4
      );
      while(result.length<marketTarget && tryFrom(safe,'safe')){}
    }

    // Fallback NIE może już wrzucić gwiazdy ESA do II/III ligi.
    if(result.length<marketTarget){
      const fallback=shuffle(polish.filter(c=>
        !recentlyOffered(c) &&
        c.tier>=minPolishTier &&
        c.tier<=Math.max(current.tier,naturalMax) &&
        c.strength<=state.overall+Math.max(6,strengthWindow)
      ));
      for(const c of fallback){
        add(c);
        if(result.length>=marketTarget) break;
      }
    }

    // Ostatnia siatka bezpieczeństwa: trzy oferty mają być elementem
    // rytmu gry. W razie potrzeby pozwalamy klubowi powtórzyć ofertę.
    if(result.length<marketTarget){
      forceFill(polish.filter(c=>
        c.tier>=minPolishTier &&
        c.tier<=Math.max(current.tier,naturalMax) &&
        c.strength<=state.overall+Math.max(8,strengthWindow+2)
      ),marketTarget);
    }

    return result.slice(0,marketTarget);
  }

  function offerReason(c,performance){
    if(c.favoriteOffer) return 'klub, któremu kibicujesz';
    const current=state.club;
    if(c.formBreakthrough) return `${c.formBreakthrough} sezon • oferta z lepszego poziomu`;
    if(c.veteranRoute==='homecoming') return 'Jesień kariery • powrót do Ekstraklasy';
    if(c.veteranRoute==='polishReturn') return 'Weteran • oferta powrotu do Polski';
    if(c.veteranRoute==='exotic') return 'Jesień kariery • egzotyczny kontrakt';
    if(c.talentProject) return 'Klub stawia na twój talent';
    if(isForeignClub(c)){
      if(c.foreignTier>=6) return `${foreignTierName(c.foreignTier)} • lokalny rynek: ${clubTransferRegion(c)}`;
      if(isForeignClub(current) && c.country===current.country) return `${foreignTierName(c.foreignTier)} • znajomy rynek`;
      if(isForeignClub(current) && clubTransferRegion(c)===clubTransferRegion(current)) return `${foreignTierName(c.foreignTier)} • region ${clubTransferRegion(c)}`;
      if(isForeignClub(current) && c.zone===current.zone) return `${foreignTierName(c.foreignTier)} • ten sam kontynent`;
      return `${foreignTierName(c.foreignTier)} • medialność ${Math.round(state.recognition||0)}/100`;
    }
    const locality=polishLocalityClass(c,current);
    if(c.tier>current.tier) return locality==='current'?'Krok wyżej • lokalny rynek':'Krok wyżej';
    if(c.tier===current.tier && c.strength>current.strength+2) return locality==='current'?'Mocniejszy klub z regionu':'Mocniejszy klub';
    if(locality==='current') return 'Lokalny rynek';
    if(locality==='neighbor') return 'Sąsiednie województwo';
    if(locality==='home') return 'Powrót w rodzinne strony';
    if(c.tier<current.tier) return 'Większa szansa na regularną grę';
    return 'Zmiana otoczenia';
  }

  function veteranPolishReturnOffer(current){
    if(!isForeignClub(current) || state.age<35) return null;
    const returnFloor=current.foreignTier<=2?6:current.foreignTier===3?5:current.foreignTier===4?4:1;
    const polish=seniorClubs().filter(c=>c.name!==current.name&&c.tier>=returnFloor);
    if(!polish.length) return null;

    // Poziom wybiera bieżący OVR, nie metryka. Weteran 85 OVR powinien
    // wracać do czołówki Ekstraklasy, a zawodnik po mocnym regresie do ligi,
    // która rzeczywiście odpowiada jego obecnym możliwościom.
    let candidates=polish.filter(c=>
      c.strength<=state.overall+7 &&
      c.strength>=state.overall-12
    );
    if(!candidates.length) candidates=polish;
    const bestGap=Math.min(...candidates.map(c=>Math.abs(c.strength-state.overall)));
    const close=candidates.filter(c=>Math.abs(c.strength-state.overall)<=bestGap+3);
    const home=close.filter(c=>c.region===state.region);
    const pool=home.length && rand(1,100)<=35 ? home : close;
    const chosen=pick(pool.length?pool:close);
    return chosen?{...chosen,veteranRoute:'polishReturn'}:null;
  }

  function balanceAnnualMarketOffers(offers,performance,target){
    const current=state.club;
    const result=(offers||[]).slice(0,target);
    const protectedOffer=c=>!!(c?.favoriteOffer||c?.veteranRoute||c?.formBreakthrough||c?.talentProject);
    const used=()=>new Set([current.name,...result.map(c=>c.name)]);
    const accessible=c=>{
      if(!c||c.reserve||c.name===current.name) return false;
      if(isForeignClub(c)&&c.foreignTier>=6){
        return isForeignClub(current)&&deepLocalForeignAccessible(c,current);
      }
      if(!isForeignClub(current)&&isForeignClub(c)){
        return c.foreignTier<=5&&foreignTierReachable(c.foreignTier,performance,true);
      }
      if(isForeignClub(current)&&isForeignClub(c)&&c.foreignTier>current.foreignTier+1) return false;
      return true;
    };

    // Maksymalnie jedna karta może być czystą „bezpieczną przystanią” 90%+.
    // Kolejne zastępujemy klubami, w których zawodnik musi realnie walczyć.
    let safeSeen=0;
    for(let index=0;index<result.length;index++){
      const chance=projectedStartChance(result[index],0);
      if(chance<90) continue;
      safeSeen++;
      if(safeSeen===1||protectedOffer(result[index])) continue;
      const occupied=used();
      const candidates=[...seniorClubs(),...GAME_DATA.foreignClubs]
        .filter(c=>!occupied.has(c.name)&&accessible(c))
        .map(c=>({c,chance:projectedStartChance(c,0)}))
        .filter(item=>item.chance>=18&&item.chance<=88&&item.c.strength<=state.overall+18)
        .sort((a,b)=>
          Math.abs(a.chance-62)-Math.abs(b.chance-62)||
          Math.abs(clubMarketLevel(a.c)-clubMarketLevel(current))-Math.abs(clubMarketLevel(b.c)-clubMarketLevel(current))||
          Math.abs(a.c.strength-state.overall)-Math.abs(b.c.strength-state.overall)
        );
      if(candidates.length) result[index]={...candidates[0].c,marketChallenge:true};
    }

    // W polskim klubie co najmniej jedna karta zawsze prowadzi poza bieżące
    // województwo. Sąsiad ma sześciokrotnie większą wagę niż dalszy region.
    if(!isForeignClub(current)){
      const province=current.region||state.region;
      const hasOutside=result.some(c=>!isForeignClub(c)&&c.region&&c.region!==province);
      if(!hasOutside){
        const occupied=used();
        const pool=seniorClubs().filter(c=>
          !occupied.has(c.name)&&c.region&&c.region!==province&&accessible(c)&&
          c.strength<=state.overall+14&&Math.abs(clubMarketLevel(c)-clubMarketLevel(current))<=1.65
        );
        if(pool.length){
          const chosen=weightedPick(pool.map(c=>({
            c,weight:polishRegionsAdjacent(province,c.region)?6:1
          }))).c;
          let replaceIndex=result.findIndex(c=>!protectedOffer(c)&&!isForeignClub(c)&&c.region===province&&projectedStartChance(c,0)>=90);
          if(replaceIndex<0) replaceIndex=result.map((c,index)=>({c,index})).reverse().find(item=>!protectedOffer(item.c))?.index??result.length-1;
          if(replaceIndex>=0) result[replaceIndex]={...chosen,outsideProvinceOffer:true};
        }
      }
    }
    return result.slice(0,target);
  }

  function applySpecialMarketOffers(baseOffers,performance){
    const current=state.club;
    const marketCrisis=severeClubMismatch(current);
    const target=state.extraMarketOffer?10:4;
    let offers=(baseOffers||[]).slice();
    const veteranReturn=veteranPolishReturnOffer(current);

    // Od 35. roku życia zawodnik grający za granicą ma w każdym normalnym
    // oknie jedną sportowo adekwatną drogę powrotu do Polski.
    if(veteranReturn){
      offers=[veteranReturn,...offers.filter(c=>c.name!==veteranReturn.name)];
    }

    // Za granicą zwykły generator kończy się wcześniej niż polska gałąź
    // marketBonus. Jeżeli agent obiecał skok, dokładamy tu ambitniejszy klub
    // i dopiero potem czyścimy jednorazowy bonus.
    if((state.agentMarketJump||0)>0){
      const ambitious=[...seniorClubs(),...GAME_DATA.foreignClubs].filter(c=>
        c.name!==current.name &&
        clubMarketLevel(c)>clubMarketLevel(current) &&
        c.strength<=state.overall+15 &&
        (!isForeignClub(c) || c.foreignTier<=4)
      ).sort((a,b)=>
        clubMarketLevel(a)-clubMarketLevel(b) ||
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
      );
      if(ambitious.length){
        const c=pick(ambitious.slice(0,Math.min(20,ambitious.length)));
        offers=[{...c},...offers.filter(x=>x.name!==c.name)];
      }
      state.agentMarketJump=0;
      state.marketBonus=0;
    }

    // Testy zagraniczne gwarantują dokładnie dwa zagraniczne kierunki przy
    // najbliższej realnej okazji. Wybieramy kluby możliwie bliskie poziomowi
    // zawodnika, ale nie przepuszczamy ich ponownie przez bramkę medialności.
    const guaranteed=Math.max(0,state.guaranteedForeignOffers||0);
    if(guaranteed){
      let foreign=GAME_DATA.foreignClubs.filter(c=>
        c.name!==current.name && c.foreignTier<=4 && c.strength<=state.overall+12
      );
      // Sama gwarancja jest ważniejsza od zwykłego okna siły: bardzo młody
      // zawodnik po testach ma dostać dwie zagraniczne propozycje nawet wtedy,
      // gdy obie będą dla niego wyraźnie ryzykowne.
      if(foreign.length<guaranteed){
        foreign=GAME_DATA.foreignClubs.filter(c=>c.name!==current.name && c.foreignTier<=4);
      }
      foreign.sort((a,b)=>
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall) ||
        a.foreignTier-b.foreignTier
      );
      const picked=[];
      for(const c of shuffle(foreign.slice(0,Math.min(40,foreign.length)))){
        if(!picked.some(x=>x.name===c.name)) picked.push({...c});
        if(picked.length>=guaranteed) break;
      }
      offers=[...picked,...offers.filter(c=>!picked.some(x=>x.name===c.name))];
      state.guaranteedForeignOffers=0;
    }

    // Agent Piekarski rozszerza zwykłe okno do dziesięciu kart. Brakujące
    // miejsca uzupełniamy sportowo zbliżonymi kierunkami bez duplikatów.
    if(state.extraMarketOffer && offers.length<target){
      const used=new Set(offers.map(c=>c.name));
      const pool=[...seniorClubs(),...GAME_DATA.foreignClubs].filter(c=>
        c.name!==current.name &&
        !used.has(c.name) &&
        c.strength<=state.overall+12 &&
        (!isForeignClub(c) || c.foreignTier<=4)
      ).sort((a,b)=>
        Math.abs(clubMarketLevel(a)-clubMarketLevel(current))-
        Math.abs(clubMarketLevel(b)-clubMarketLevel(current)) ||
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
      );
      while(offers.length<target && pool.length){
        const sample=pool.splice(0,Math.min(20,pool.length));
        const c=pick(sample);
        if(c) offers.push({...c});
      }
    }

    let finalOffers=offers.slice(0,target);

    // Jednorazowe efekty agentów mogą dołożyć oferty przed zwykłym rynkiem.
    // Nawet wtedy obowiązkowa propozycja powrotu nie może wypaść poza ekran.
    if(veteranReturn && !finalOffers.some(c=>c.name===veteranReturn.name)){
      finalOffers=[veteranReturn,...finalOffers.filter(c=>c.name!==veteranReturn.name)].slice(0,target);
    }

    // Na całym widocznym ekranie (obecny klub + oferty) nie mogą pojawić się
    // cztery kluby z tego samego POZIOMU rozgrywek. Zasada obejmuje zarówno
    // zagraniczne tiery, jak i polskie ligi (np. cztery kluby z IV ligi).
    const offerLevelKey=c=>isForeignClub(c)?`F${c.foreignTier}`:`P${c?.tier||0}`;
    const visibleLevelCounts=new Map();
    const currentLevelKey=offerLevelKey(current);
    visibleLevelCounts.set(currentLevelKey,1);
    const usedNames=new Set(finalOffers.map(c=>c.name));
    const levelHasRoom=c=>(visibleLevelCounts.get(offerLevelKey(c))||0)<3;
    const findLevelAlternative=(forbiddenLevel,original)=>{
      const eligible=c=>
        c.name!==current.name &&
        !usedNames.has(c.name) &&
        levelHasRoom(c) &&
        offerLevelKey(c)!==forbiddenLevel &&
        (!marketCrisis||clubMarketLevel(c)<=clubMarketLevel(original));
      const localityRank=c=>{
        if(isForeignClub(current) || isForeignClub(c)) return 2;
        if(c.region===(current.region||state.region)) return 0;
        return 1;
      };
      const originalLevel=clubMarketLevel(original||current);
      const sportAlternatives=[...GAME_DATA.foreignClubs,...seniorClubs()]
        .filter(c=>
          eligible(c) &&
          c.strength<=state.overall+12 &&
          Math.abs(clubMarketLevel(c)-originalLevel)<=1.25
        )
        .sort((a,b)=>
          localityRank(a)-localityRank(b) ||
          Math.abs(clubMarketLevel(a)-originalLevel)-Math.abs(clubMarketLevel(b)-originalLevel) ||
          Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
        );
      return sportAlternatives[0]||null;
    };
    for(let i=0;i<finalOffers.length;i++){
      let offer=finalOffers[i];
      let levelKey=offerLevelKey(offer);
      const visibleCount=visibleLevelCounts.get(levelKey)||0;
      if(visibleCount>=3){
        const replacement=findLevelAlternative(levelKey,offer);
        if(replacement){
          usedNames.delete(offer.name);
          finalOffers[i]={...replacement};
          usedNames.add(replacement.name);
          offer=finalOffers[i];
          levelKey=offerLevelKey(offer);
        }
      }
      visibleLevelCounts.set(levelKey,(visibleLevelCounts.get(levelKey)||0)+1);
    }

    return balanceAnnualMarketOffers(finalOffers,performance,target);
  }

  function fillAnnualMarketOffers(baseOffers,performance){
    const current=state.club;
    const target=state.extraMarketOffer?10:4;
    const result=[];
    const used=new Set([current.name]);
    (baseOffers||[]).forEach(c=>{
      if(c&&!used.has(c.name)){ result.push({...c}); used.add(c.name); }
    });
    if(result.length>=target) return result;

    // To zabezpieczenie uruchamia się wyłącznie wtedy, gdy zwykły generator
    // oddał mniej klubów niż liczba slotów. Nie podnosi jakości rynku — tylko
    // uzupełnia go sportowo sensownymi kierunkami z normalnej ścieżki.
    const currentLevel=clubMarketLevel(current);
    const forcedStepDown=isForeignClub(current)&&severeClubMismatch(current);
    const crisisTargetTier=isForeignClub(current)?Math.min(8,current.foreignTier+1):null;
    const source=isForeignClub(current)
      ? [...GAME_DATA.foreignClubs,...seniorClubs()]
      : seniorClubs();
    const candidates=shuffle(source.filter(c=>{
      if(!c||c.reserve||used.has(c.name)) return false;
      if(forcedStepDown) return isForeignClub(c)&&c.foreignTier===crisisTargetTier&&(c.foreignTier<6||deepLocalForeignAccessible(c,current));
      if(isForeignClub(c)&&c.foreignTier>=6&&!deepLocalForeignAccessible(c,current)) return false;
      if(c.strength>state.overall+12) return false;
      const levelGap=Math.abs(clubMarketLevel(c)-currentLevel);
      if(levelGap>1.35) return false;
      if(!isForeignClub(current)&&isForeignClub(c)) return false;
      if(isForeignClub(current)&&isForeignClub(c) && Math.abs(c.foreignTier-current.foreignTier)>1) return false;
      return true;
    })).sort((a,b)=>
      Math.abs(clubMarketLevel(a)-currentLevel)-Math.abs(clubMarketLevel(b)-currentLevel) ||
      Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
    );

    for(const c of candidates){
      if(used.has(c.name)) continue;
      result.push({...c});
      used.add(c.name);
      if(result.length>=target) break;
    }

    // Dla klubu zagranicznego ignorujemy na końcu historię ofert i dobieramy
    // kluby z tego samego lub sąsiedniego tieru. Nawet przy wielkim kryzysie
    // Valencia nie może więc wygenerować nagle trzech ofert z A/B klasy.
    if(result.length<target){
      const emergency=isForeignClub(current)
        ? GAME_DATA.foreignClubs.filter(c=>
            c.name!==current.name &&
            !used.has(c.name) &&
            (forcedStepDown?c.foreignTier===crisisTargetTier:Math.abs(c.foreignTier-current.foreignTier)<=1) &&
            (c.foreignTier<6 || deepLocalForeignAccessible(c,current))
          )
        : seniorClubs().filter(c=>
            c.tier===1 && !c.reserve && !used.has(c.name) && c.name!==current.name
          );
      const orderedEmergency=shuffle(emergency).sort((a,b)=>
        Math.abs(clubMarketLevel(a)-currentLevel)-Math.abs(clubMarketLevel(b)-currentLevel) ||
        Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall)
      );
      for(const c of orderedEmergency){
        result.push({...c});
        used.add(c.name);
        if(result.length>=target) break;
      }
    }
    return result;
  }

  function clubRenewalRisk(club){
    const apps=Math.max(0,state.season?.apps||0);
    const minutes=Math.max(0,state.season?.minutes||0);
    const seasons=state.careerSeasons||[];
    const lastSeason=seasons[seasons.length-1]||null;

    // DOBRY lub lepszy sezon zawsze oznacza ofertę pozostania. Klub nie może
    // po takim roku losowo zrezygnować z zawodnika.
    if(lastSeason?.club===club.name && (lastSeason.gradeIndex??-1)>=5){
      return {chance:0,apps,minutes,goodSeasonGuarantee:true,lowSeasons:0};
    }

    // Tylko trzy rodzaje klubów są bezpieczną przystanią na zawsze:
    // polskie ligi regionalne oraz najniższe lokalne rynki zagraniczne.
    // Ekstraklasa ani żaden inny polski lub zagraniczny szczebel nie ma ochrony.
    const permanentSafeHarbour=
      (!isForeignClub(club) && club.tier===1) ||
      (isForeignClub(club) && club.foreignTier>=6 && (club.zone==='Azja'||club.zone==='Oceania'));
    if(permanentSafeHarbour){
      return {chance:0,apps,minutes,regionalGuarantee:true,lowSeasons:0};
    }

    // Skrajna różnica poziomu po straconym sezonie kończy ochronę umowy.
    // Klub nie może przez kolejne lata trzymać zawodnika 20 OVR w Valencii
    // tylko dlatego, że wylosował długi kontrakt albo szczęśliwy rzut odnowienia.
    if(severeClubMismatch(club)){
      const qualityGap=Math.round((Number(club.strength)||0)-(Number(state.overall)||0));
      return {chance:100,apps,minutes,sportingRelease:true,qualityGap,lowSeasons:1};
    }

    // Jeden rok na marginesie nie wystarcza. Ryzyko pojawia się dopiero po
    // co najmniej DWÓCH kolejnych sezonach bardzo małej gry w tym samym klubie.
    // Za bardzo małą grę uznajemy maksymalnie 4 występy albo mniej niż 360 minut.
    let lowSeasons=0;
    for(let i=seasons.length-1;i>=0;i--){
      const season=seasons[i];
      if(season.club!==club.name) break;
      if((season.apps||0)<=4 || (season.minutes||0)<360) lowSeasons++;
      else break;
    }
    if(lowSeasons<2) return {chance:0,apps,minutes,regionalGuarantee:false,lowSeasons};

    // Drugi stracony rok daje realne ostrzeżenie, trzeci i kolejne — wysokie
    // ryzyko końca umowy. Wiek sam w sobie nadal nie ma znaczenia.
    const extremelyMarginal=apps<=2 || minutes<180;
    const base=lowSeasons>=3
      ? (extremelyMarginal?82:68)
      : (extremelyMarginal?42:28);
    const streakBonus=Math.min(12,Math.max(0,lowSeasons-3)*6);
    const qualityGap=(club.strength||0)-state.overall;
    const qualityBonus=qualityGap>=15?10:qualityGap>=8?5:0;
    const loyaltyProtection=Math.min(12,Math.round((state.loyalty||0)*.8));
    const chance=clamp(base+streakBonus+qualityBonus-loyaltyProtection,5,95);
    return {chance,apps,minutes,base,streakBonus,qualityBonus,loyaltyProtection,regionalGuarantee:false,lowSeasons};
  }

  function rollClubRenewal(club){
    const risk=clubRenewalRisk(club);
    if(!risk.chance) return {...risk,roll:null,refused:false};
    const roll=rand(1,100);
    return {...risk,roll,refused:roll<=risk.chance};
  }

  function presentClubChoice(performance){
    if(shouldRetire()){
      log('Twardy koniec kariery.',`Osiągasz wylosowany limit: ${state.hardRetirementAge} lat • ostatni klub: ${state.club.name}`);
      retire();
      return;
    }
    if(state.skipMarketOnce){
      state.skipMarketOnce=false;
      advanceYear();
      return;
    }
    if(state.legendRankingPending && !state.legendRankingShown){
      showLegendRanking(()=>presentClubChoice(performance));
      return;
    }

    const current={...state.club};
    const renewalRisk=clubRenewalRisk(current);
    const sportingRelease=!!renewalRisk.sportingRelease;
    if(sportingRelease){
      state.longContractClubName=null;
      state.longContractUntilAge=null;
    }
    const contractLocked=longContractActive(current)&&!sportingRelease;
    const delayedNoRenew=
      state.noRenewClubName===current.name &&
      Number.isFinite(state.noRenewAfterAge) &&
      state.age>=state.noRenewAfterAge;
    const scriptedNoRenew=!contractLocked&&(state.forceNoRenewClubName===current.name || delayedNoRenew);
    const renewal=sportingRelease
      ? {...renewalRisk,roll:null,refused:true}
      : contractLocked
      ? {chance:0,roll:null,refused:false,apps:state.season?.apps||0,minutes:state.season?.minutes||0}
      : scriptedNoRenew
      ? {chance:0,roll:null,refused:false,apps:state.season?.apps||0,minutes:state.season?.minutes||0}
      : rollClubRenewal(current);
    const forcedNoRenew=scriptedNoRenew || renewal.refused;
    // Wiek nie stanowi osobnej bramki kontraktowej. Jeżeli zawodnik nadal
    // gra wystarczająco dużo, rynek traktuje go tak samo jak młodszego.
    const normallyCanRenew=true;
    const requestedMarketBlock=contractLocked || !!state.blockMarketOnce || (state.marketLockSeasons||0)>0;
    const marketBlocked=requestedMarketBlock && normallyCanRenew && !forcedNoRenew;

    const ordinaryOffers=marketBlocked?[]:fillAnnualMarketOffers(annualMarketOffers(performance),performance);
    let offers=marketBlocked?[]:applySpecialMarketOffers(ordinaryOffers,performance);
    // Zwolnienie nie może zablokować kariery pustym ekranem. Jeżeli normalny
    // rynek nie znalazł niczego, zawsze pozostaje klub regionalny.
    if(forcedNoRenew && !offers.length){
      const regional=(GAME_DATA.regions[state.region]||[])
        .filter(c=>!c.reserve&&c.tier===1&&c.name!==current.name);
      const fallback=regional.length?pick(regional):seniorClubs().find(c=>c.tier===1&&c.name!==current.name);
      if(fallback) offers=[{...fallback}];
    }
    if(state.blockMarketOnce) state.blockMarketOnce=false;
    if((state.marketLockSeasons||0)>0) state.marketLockSeasons--;
    state.offerHistory=state.offerHistory||{};
    state.offerCounts=state.offerCounts||{};
    offers.forEach(c=>{
      state.offerHistory[c.name]=state.seasonYear;
      state.offerCounts[c.name]=(state.offerCounts[c.name]||0)+1;
    });

    const canRenew=normallyCanRenew && !forcedNoRenew;
    if(sportingRelease){
      log(
        'Klub kończy współpracę z powodów sportowych.',
        `${current.name} • różnica poziomu ${renewal.qualityGap} OVR • ${renewal.apps} meczów / ${renewal.minutes} minut • umowa nie chroni już przed odejściem`
      );
    }else if(renewal.roll!==null){
      log(
        renewal.refused?'Klub nie przedłuża kontraktu.':'Klub daje ci jeszcze jeden kontrakt.',
        `${current.name} • ${renewal.apps} meczów / ${renewal.minutes} minut • ryzyko odmowy ${renewal.chance}% • rzut ${renewal.roll}/100${renewal.refused?' • koniec umowy':' • zostajesz w planach'}`
      );
    }
    if(state.forceNoRenewClubName===current.name) state.forceNoRenewClubName=null;
    if(delayedNoRenew){ state.noRenewClubName=null; state.noRenewAfterAge=null; }
    const veteranNote=veteranCareerText();
    const renewalNote=renewal.refused
      ? `Po sezonie z bilansem ${renewal.apps} meczów i ${renewal.minutes} minut klub rezygnuje z przedłużenia umowy (szansa ${renewal.chance}%, rzut ${renewal.roll}/100).`
      : '';

    const heading=contractLocked
      ?`Obowiązuje kontrakt z ${current.name}.`
      :marketBlocked
      ?'W tym oknie nie dostajesz żadnej oferty.'
      :state.justRelegated
      ?'Po spadku musisz zdecydować, co dalej.'
      :state.justPromoted
        ?'Po awansie czas wybrać klub na następny sezon.'
        :!canRenew
          ?`${current.name} nie proponuje ci nowego kontraktu.`
          :'Gdzie grasz w przyszłym sezonie?';

    const stayChance=projectedStartChance(current,(state.boost||0)+1);
    const lowerRegionalMarket=!isForeignClub(current) && current.tier<=3;
    const choices=[];

    if(canRenew){
      const stayRole=stayChance>=65?'duża szansa na regularną grę':stayChance>=40?'realna walka o skład':'ryzyko ławki';
      const stayMonthly=(contractLocked&&Number.isFinite(state.contractAnnualPln)?state.contractAnnualPln:calcAnnualSalaryForClub(current))/12;
      choices.push({
        label:lowerRegionalMarket
          ? `PRZEDŁUŻAM KONTRAKT — ${current.name} (${clubCompetition(current)})`
          : `ZOSTAJĘ — ${current.name} (${clubCompetition(current)})`,
        ovrProfile:null,
        club:current,
        preview:`<span class="offer-detail-line"><span>Szacowany kontrakt</span><strong>${formatMoney(stayMonthly)} miesięcznie</strong></span><span class="offer-detail-line"><span>Szacowane szanse na grę</span><strong>${stayChance}% — ${stayRole}</strong></span><span class="offer-detail-line"><span>Pozycja w lidze w zeszłym sezonie</span><strong>${escapeDecisionHtml(clubLastLeaguePosition(current))}</strong></span><span class="offer-detail-note">Lojalność: ${Math.round(state.loyalty||0)}/15; pozostanie daje +2 albo +3 z równymi szansami i pomaga w walce o skład, środowisku oraz przedłużeniu umowy.${contractLocked?` Obecna umowa blokuje transfer jeszcze przez ${state.longContractUntilAge-state.age} ${state.longContractUntilAge-state.age===1?'okno':'okien'}.`:''}</span>`,
        act:()=>{
          const loyaltyGain=rand(2,3);
          state.loyalty=clamp((state.loyalty||0)+loyaltyGain,0,15);
          state.boost+=1;
          if(!contractLocked) state.contractAnnualPln=calcAnnualSalaryForClub(current);
          log(lowerRegionalMarket?`Przedłużasz kontrakt z ${current.name}.`:`Zostajesz w ${current.name}.`, `${clubCompetition(current)} • kolejny sezon w tym samym klubie • lojalność +${loyaltyGain}`);
        }
      });
    }

    const retirementAvailable=state.age>=39;

    // "Koniec kariery" jest dodatkową decyzją i nigdy nie zabiera miejsca
    // normalnej ofercie. Od 39 lat rynek pokazuje więc pozostanie + pełne
    // trzy transfery + koniec kariery (albo cztery transfery przy dodatkowym
    // slocie agenta). Powrót do Polski i egzotyka nie mogą wyciąć naturalnego,
    // konsekwentnego kroku po klasycznej ścieżce kariery.
    const normalTransferSlots=state.extraMarketOffer?10:4;
    const transferSlots=normalTransferSlots;

    offers.slice(0,transferSlots).forEach(offeredClub=>{
      const c={...offeredClub,...liveMarketClub(offeredClub)};
      const chance=projectedStartChance(c,0);
      const risk=chance>=65?'duża szansa na regularną grę':chance>=40?'realna walka o skład':'duże ryzyko ławki';
      const marketNote=contractMarketNote(c);
      choices.push({
        label:`${c.name} — ${clubOfferCompetition(c)} • ${offerReason(c,performance)}`,
        ovrProfile:null,
        club:c,
        preview:`<span class="offer-detail-line"><span>Szacowany kontrakt</span><strong>${formatMoney(calcAnnualSalaryForClub(c)/12)} miesięcznie</strong></span><span class="offer-detail-line"><span>Szacowane szanse na grę</span><strong>${chance}% — ${risk}</strong></span><span class="offer-detail-line"><span>Pozycja w lidze w zeszłym sezonie</span><strong>${escapeDecisionHtml(clubLastLeaguePosition(c))}</strong></span>${marketNote?`<span class="offer-detail-note">Wycena rynku: ${escapeDecisionHtml(marketNote)}.</span>`:''}`,
        act:()=>moveClub(c)
      });
    });

    if(retirementAvailable){
      choices.push({
        label:'KONIEC KARIERY',
        endCareer:true,
        ovrProfile:null,
        preview:`To jedna z opcji rynku, nie osobne pytanie. Kończysz w wieku ${state.age} lat • OVR ${state.overall} • ${state.totals.apps} meczów`,
        act:()=>{
          log('Kończysz karierę.',`${state.age} lat • ostatni klub: ${current.name}`);
          retire();
        }
      });
    }

    const d={
      market:true,
      title:heading,
      text:`Twój sezon się skończył. ${contractLocked?`Dziesięcioletnia umowa wciąż wiąże cię z ${current.name}; do swobodnego rynku zostało ${state.longContractUntilAge-state.age} ${state.longContractUntilAge-state.age===1?'okno':'okien'}.`:marketBlocked?`Agent nie przyniósł żadnej oferty; pozostaje ${current.name}.`:canRenew?`${current.name} chce, żebyś został.`:`Kontrakt z ${current.name} dobiega końca i klub idzie w inną stronę.`}${renewalNote?` ${renewalNote}`:''} ${offers.length?'Rynek daje ci inne możliwości.':''}${veteranNote?` ${veteranNote}`:''}`,
      choices
    };
    presentDecision(d,advanceYear);
  }

  function moveClub(c){
    c=worldClubFromId(worldClubId(c))||c;
    const oldClub={...state.club}; const old=oldClub.name;
    state.club={...c}; if(state.clubHistory[state.clubHistory.length-1]!==c.name){state.clubHistory.push(c.name);state.clubsPlayed++;} state.status='Nowy zawodnik';
    state.contractAnnualPln=calcAnnualSalaryForClub(c);
    if(state.longContractClubName===old){state.longContractClubName=null;state.longContractUntilAge=null;}
    // Bonus hierarchii/szansy na grę dotyczy konkretnego sztabu i nie przechodzi z transferem.
    state.boost=0;
    state.loyalty=0;
    if(state.forceNoRenewClubName===old) state.forceNoRenewClubName=null;
    if(state.noRenewClubName===old){state.noRenewClubName=null;state.noRenewAfterAge=null;}
    // Konflikt z konkretnym trenerem nie może zabrać sezonu już po transferze.
    // Kary osobiste (uraz, zawieszenie) nie mają znacznika klubu i nadal jadą z graczem.
    if(state.nextAppsClubName===old){state.nextAppsFactor=1;state.nextAppsReason=null;state.nextAppsClubName=null;}
    if(state.forcedSeasonFormClubName===old){state.forcedSeasonFormRoll=null;state.forcedSeasonFormReason=null;state.forcedSeasonFormClubName=null;}
    if(state.captainEventBonusClub===old) state.captainEventBonusClub=null;
    if(state.corruptionPlan && !state.corruptionPlan.caught && state.corruptionPlan.clubName!==c.name) state.corruptionPlan=null;
    if(isForeignClub(c) && !isForeignClub(oldClub) && !Number.isFinite(state.foreignMoveAge))
      state.foreignMoveAge=state.seasonFinished?state.age+1:state.age;
    if(!isForeignClub(c)) state.highestTier=Math.max(state.highestTier||0,c.tier||0);
    if(isForeignClub(c)) state.bestForeignTier=state.bestForeignTier?Math.min(state.bestForeignTier,c.foreignTier):c.foreignTier;
    state.justRelegated=false; state.justPromoted=false;
    activateLeagueWorldForClub(state.club);
    log(`TRANSFER: ${old} → ${c.name}`, `${clubCompetition(c)} • ${state.age} lat`);
  }
  function loanMove(){
    const parent={...state.club};
    const parentLoyalty=state.loyalty;
    const candidates=seniorClubs().filter(c=>c.tier===Math.max(1,parent.tier-1)&&c.name!==parent.name);
    const c=candidates.length?pick(candidates):null;
    if(!c){state.boost+=5;log('Nie udaje się znaleźć wypożyczenia.','Zostajesz i walczysz o minuty.');return;}
    c=worldClubFromId(worldClubId(c))||c;
    state.loanReturn={...parent,_loyalty:parentLoyalty}; state.club={...c}; state.loyalty=0; if(state.clubHistory[state.clubHistory.length-1]!==c.name){state.clubHistory.push(c.name);state.clubsPlayed++;} state.status='Wypożyczony'; state.boost+=8;
    activateLeagueWorldForClub(state.club);
    log(`WYPOŻYCZENIE: ${parent.name} → ${c.name}`, `${tierName(c.tier)} • po minuty`);
  }
  function returnFromLoan(){
    const loanClub=state.club.name; const _ret={...state.loanReturn}; state.loanReturn=null; const _loy=_ret._loyalty||0; delete _ret._loyalty; state.club=_ret; state.loyalty=clamp(_loy,0,15); state.status='Powrót z wypożyczenia';
    if(state.clubHistory[state.clubHistory.length-1]!==state.club.name) state.clubHistory.push(state.club.name);
    activateLeagueWorldForClub(state.club);
    log(`Koniec wypożyczenia: wracasz do ${state.club.name}.`, `Sezon w ${loanClub} za tobą.`);
  }
  function regionalReturn(){
    const all=(GAME_DATA.regions[state.region]||[]).filter(c=>!c.reserve&&c.tier<=6&&c.name!==state.club.name);
    let candidates=all.filter(c=>c.strength<=state.overall+10);
    if(!candidates.length) candidates=all.filter(c=>c.tier===1).sort((a,b)=>Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall));
    candidates=candidates.sort((a,b)=>b.tier-a.tier||Math.abs(a.strength-state.overall)-Math.abs(b.strength-state.overall));
    const shortlist=candidates.slice(0,Math.min(3,candidates.length)); if(!shortlist.length){state.loyalty=clamp((state.loyalty||0)+2,0,15);log('Zostajesz w obecnym klubie.','Nie ma sensownej oferty z rodzinnego regionu.');return;} const c=pick(shortlist); moveClub(c); state.loyalty=clamp((state.loyalty||0)+3,0,15);
  }
  function pickRegionalClubName(){ return pick(GAME_DATA.regions[state.region].filter(c=>!c.reserve)).name; }
  function findHigherPolishClub(){
    const eligible=seniorClubs().filter(c=>c.name!==state.club.name && c.tier>state.club.tier && c.tier<=6 && c.strength<=state.overall+13);
    const nextStep=eligible.filter(c=>c.tier===state.club.tier+1);
    const pool=nextStep.length?nextStep:eligible;
    return pool.length?pick(pool):null;
  }
  function findSameTierUpgrade(){
    const pool=seniorClubs().filter(c=>c.name!==state.club.name && c.tier===state.club.tier && c.strength>=state.club.strength+4 && c.strength<=state.overall+11);
    return pool.length?pick(pool):null;
  }
  function findTransferClub(afterRelegation=false){
    const minTier=afterRelegation?state.club.tier+1:state.club.tier;
    const pool=seniorClubs().filter(c=>c.name!==state.club.name && c.tier>=minTier && c.tier<=6 && c.strength<=state.overall+12);
    return pool.length?pick(pool):null;
  }

  function findLowerClub(){
    const targetTier=Math.max(1,state.club.tier-1);
    let pool=seniorClubs().filter(c=>c.name!==state.club.name && c.tier===targetTier && c.strength<=state.overall+7);

    const currentRegion=state.club?.region||state.region;
    const same=pool.filter(c=>c.region===currentRegion);
    const near=pool.filter(c=>polishRegionsAdjacent(currentRegion,c.region));
    const home=pool.filter(c=>c.region===state.region);

    if(same.length) pool=same;
    else if(near.length) pool=near;
    else if(home.length) pool=home;

    return pool.length?pick(pool):null;
  }
  function findPlayableClub(){
    const current=Math.min(6,state.club.tier);
    let pool=seniorClubs().filter(c=>c.name!==state.club.name && c.tier>=Math.max(3,current-1) && c.tier<=current && c.strength<=state.overall+4);
    pool=pool.sort((a,b)=>b.tier-a.tier||b.strength-a.strength);
    return pool.length?pick(pool.slice(0,Math.min(8,pool.length))):null;
  }

  function advanceYearForCurrentPlayer(){
    state.age++; state.seasonYear++; if((state.corruptionShadow||0)>0) state.corruptionShadow--; state.season={apps:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,minutes:0};
    state.seasonMatchExtras=[];
    state.seasonClubName=state.club?.name||null;
    state.seasonClubCompetition=state.club?clubCompetition(state.club):null;
    state.seasonFinished=false;

    let legendActivation='';
    if(!state.legendUnlocked && (state.legend99Streak||0)>=2 && state.overall===99){
      const bonus=rand(1,5);
      state.legendUnlocked=true;
      state.legendEraActive=true;
      state.legendStartBonus=bonus;
      state.overall=99+bonus;
      state.legendPeakOverall=state.overall;
      ensureLegendReferenceSet();
      state.peakOverall=Math.max(state.peakOverall,state.overall);
      state.legend99Streak=0;
      log('TRYB LEGENDY FUTBOLU',`Dwa kolejne sezony na 99 OVR • rzut +${bonus} • OVR ${state.overall}`);
      legendActivation=`<div class="event-kicker">TRYB LEGENDY FUTBOLU</div><h3>Przebijasz sufit: 99 → ${state.overall} OVR.</h3><p>Dwa kolejne sezony zakończyłeś na 99 OVR. Przed trzecim sezonem specjalny rzut daje ci <strong>+${bonus} OVR</strong>. Od tej chwili zwykły limit 99 nie obowiązuje podczas twojego historycznego prime'u.</p>`;
    }

    const veteranNote=veteranCareerText();
    els.eventBox.dataset.panelRole='event';
    els.eventBox.innerHTML=legendActivation || `<div class="event-kicker">NOWY SEZON • PROGRESJA ${isEasy()?'ŁATWA':'NORMALNA'}</div><h3>${state.age} lat.</h3><p>${state.club.name} • ${clubCompetition(state.club)}. ${state.status}. OVR ${state.overall}. Kariera trwa.${veteranNote?` ${veteranNote}`:''}</p>`;
    render();
    if(state.focusSeasonButtonOnce){
      state.focusSeasonButtonOnce=false;
      if(window.matchMedia?.('(max-width: 800px)').matches){
        setTimeout(()=>els.playSeasonBtn?.scrollIntoView({behavior:'smooth',block:'center'}),60);
      }
    }
  }
  function nextCoopPlayerIndex(incompleteIds){
    if(!coopIsActive())return -1;
    for(let offset=1;offset<=coopSession.players.length;offset++){
      const index=(coopSession.activeIndex+offset)%coopSession.players.length;
      const candidate=coopSession.players[index];
      if(!candidate.retired&&incompleteIds.has(candidate.coopPlayerId))return index;
    }
    return -1;
  }
  function coopFinalMetrics(players){
    return players.map(player=>({
      player,
      career:scaledCareerScoreFor(player),
      money:careerFinancialsFor(player).net,
      timorCaps:(player.seniorNationalCountry||player.representedCountry)==='Timor Wschodni'
        ?Math.max(0,Number(player.nationalCaps)||0)
        :0,
      wins:0
    }));
  }
  function coopMetricWinners(rows,key,{requirePositive=false}={}){
    const best=Math.max(...rows.map(row=>row[key]));
    if(requirePositive&&best<=0)return {best,winners:[]};
    return {best,winners:rows.filter(row=>row[key]===best)};
  }
  function renderCoopFinalResults(players){
    if(!els.coopFinalResults||!players?.length)return;
    const rows=coopFinalMetrics(players);
    const categories=[
      {key:'career',label:'Lepsza kariera',...coopMetricWinners(rows,'career')},
      {key:'money',label:'Więcej pieniędzy',...coopMetricWinners(rows,'money')},
      {key:'timorCaps',label:'Mecze dla Timoru Wschodniego',...coopMetricWinners(rows,'timorCaps',{requirePositive:true})}
    ];
    categories.forEach(category=>category.winners.forEach(row=>row.wins++));
    const topWins=Math.max(...rows.map(row=>row.wins));
    const overall=rows.filter(row=>row.wins===topWins);
    const names=list=>list.map(row=>escapeDecisionHtml(row.player.name)).join(', ');
    const overallText=overall.length===1
      ?`Zwycięzca co-opu: <strong>${names(overall)}</strong> — ${topWins} ${topWins===1?'wygrana kategoria':'wygrane kategorie'}.`
      :`Remis w co-opie: <strong>${names(overall)}</strong> — po ${topWins} ${topWins===1?'wygranej kategorii':'wygrane kategorie'}.`;
    els.coopFinalResults.innerHTML=`
      <div class="eyebrow">KONIEC CO-OPU</div>
      <h3>Wyniki wspólnej gry</h3>
      <p class="coop-final-winner">${overallText}</p>
      <table class="coop-final-table"><thead><tr><th>Gracz</th><th>Wynik kariery</th><th>Majątek</th><th>Timor Wschodni</th><th>Wygrane kategorie</th></tr></thead><tbody>
        ${rows.slice().sort((a,b)=>b.wins-a.wins||b.career-a.career).map(row=>`<tr class="${overall.includes(row)?'overall-winner':''}"><td><strong>${escapeDecisionHtml(row.player.name)}</strong></td><td>${row.career} pkt</td><td>${formatMoney(row.money,'PLN')}</td><td>${row.timorCaps} meczów</td><td>${row.wins}</td></tr>`).join('')}
      </tbody></table>
      <ul class="coop-category-winners">${categories.map(category=>`<li><strong>${category.label}:</strong> ${category.winners.length?names(category.winners):'nikt nie zagrał dla Timoru Wschodniego'}</li>`).join('')}</ul>`;
    els.coopFinalResults.classList.remove('hidden');
  }
  function finishCoopTurn(){
    if(!coopIsActive())return;
    coopSession.players[coopSession.activeIndex]=state;
    const completed=coopCompletedSet();
    completed.add(state.coopPlayerId);
    coopSession.completedPlayerIds=[...completed];
    const incomplete=new Set(coopSession.players.filter(player=>!player.retired&&!completed.has(player.coopPlayerId)).map(player=>player.coopPlayerId));
    const nextIndex=nextCoopPlayerIndex(incomplete);
    if(nextIndex>=0){
      coopSession.activeIndex=nextIndex;
      state=coopSession.players[nextIndex];
      show(els.careerView);
      coopTurnIntro(`Poprzednia tura jest zamknięta. Teraz ${state.name} rozgrywa sezon ${state.seasonYear}/${String(state.seasonYear+1).slice(2)} w klubie ${state.club.name}.`);
      render();
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }

    coopSession.completedPlayerIds=[];
    const activePlayers=coopSession.players.filter(player=>!player.retired);
    if(!activePlayers.length){
      const finishedPlayers=coopSession.players.slice();
      renderCoopFinalResults(finishedPlayers);
      els.coopContinueAfterRetireBtn?.classList.add('hidden');
      els.restartBtn?.classList.remove('hidden');
      els.coopBar?.classList.add('hidden');
      coopSession=null;
      return;
    }
    const sharedWorld=coopSession.sharedWorld;
    coopSession.players.forEach(player=>{
      if(player.retired)return;
      state=player;
      player.leagueWorld=sharedWorld;
      worldRefreshCareerClub();
    });
    coopSession.roundYear=Math.max(...activePlayers.map(player=>player.seasonYear));
    coopSession.scopeCache={year:coopSession.roundYear,poland:null,foreign:{}};
    coopSession.clubCupResults={};
    coopSession.activeIndex=coopSession.players.findIndex(player=>!player.retired);
    state=coopSession.players[coopSession.activeIndex];
    coopRefreshAssignments();
    show(els.careerView);
    coopTurnIntro(`Wszyscy zakończyli poprzedni rok. Zaczyna się nowy wspólny sezon ${state.seasonYear}/${String(state.seasonYear+1).slice(2)}.`);
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function advanceYear(){
    advanceYearForCurrentPlayer();
    if(coopIsActive())finishCoopTurn();
  }
  function shouldRetire(){
    return Number.isFinite(state?.hardRetirementAge) && state.age>=state.hardRetirementAge;
  }
  function log(title,meta){
    const entry={age:state.age,title,meta};
    state.timeline.push(entry);
    return entry;
  }

  function longestClubRun(seasons){
    let best=null,current=null;
    seasons.forEach(season=>{
      if(current && current.club===season.club) current.length++;
      else current={club:season.club,length:1};
      if(!best || current.length>best.length) best={...current};
    });
    return best;
  }

  function clubLegendHtml(){
    const rows=clubLegendStatus();
    if(!rows.length) return '';
    return `<section class="career-curiosities">
      <h3>STATUS W KLUBACH</h3>
      <div class="career-curiosity-list">${rows.map(row=>{
        const top=row.tiers[row.tiers.length-1];
        const best=row.bestSeason;
        return `<div><span>${row.club}</span><strong>${top.label}</strong><small>${row.points} pkt • ${row.seasons} sezonów • ŚWIETNE+: ${row.greatSeasons} • WYBITNE+: ${row.outstandingSeasons} • HISTORYCZNE: ${row.historicSeasons}<br>najlepszy: ${best.grade} (${best.year}/${String(best.year+1).slice(2)}) • najwyższy OVR w klubie: ${row.peakOvr}<br>${row.tiers.map(t=>t.label).join(' → ')}</small></div>`;
      }).join('')}</div>
    </section>`;
  }

  function careerCuriositiesHtml(){
    const allSeasons=state.careerSeasons||[];
    const seasons=allSeasons.filter(s=>s.club && s.club!=='Bez klubu');
    if(!seasons.length) return '';
    const best=seasons.slice().sort((a,b)=>(b.gradeIndex??-1)-(a.gradeIndex??-1)||(b.minuteShare||0)-(a.minuteShare||0))[0];
    const highestPlace=seasons.filter(s=>Number.isFinite(s.leaguePlace)).sort((a,b)=>a.leaguePlace-b.leaguePlace||(b.tier||0)-(a.tier||0))[0];
    const counts={}; seasons.forEach(s=>{counts[s.club]=(counts[s.club]||0)+1;});
    const mostClub=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    const longest=longestClubRun(seasons);
    const rises=seasons.map(s=>({season:s,delta:(s.ovrAfter||0)-(s.ovrBefore||0)}));
    const rise=rises.slice().sort((a,b)=>b.delta-a.delta)[0];
    const fall=rises.slice().sort((a,b)=>a.delta-b.delta)[0];
    const lost=allSeasons.filter(s=>s.club==='Bez klubu' || (s.minuteShare||0)<.05).length;
    const clubs=new Set(seasons.map(s=>s.club)).size;
    const countries=new Set(seasons.map(s=>s.country||'Polska')).size;
    const leagues=new Set(seasons.map(s=>s.competition)).size;
    const relegations=seasons.filter(s=>s.clubSeasonResult?.relegated).length;
    const bestBallon=(state.ballondorHistory||[]).slice().sort((a,b)=>a.rank-b.rank)[0];
    const firstCall=(state.timeline||[]).find(x=>/PIERWSZE POWOŁANIE/i.test(x.title));
    const fmt=s=>`${s.year}/${String(s.year+1).slice(2)} • ${s.club}`;
    const items=[
      ['Najwyższy osiągnięty OVR',String(state.peakOverall)],
      ['Najlepszy sezon',`${best.grade} • ${fmt(best)}`],
      ['Najwyższe miejsce klubu',highestPlace?`${highestPlace.leaguePlace}. miejsce • ${fmt(highestPlace)}`:'—'],
      ['Najwięcej sezonów',`${mostClub[0]} • ${mostClub[1]}`],
      ['Najdłuższy nieprzerwany pobyt',`${longest.club} • ${longest.length} sezonów`],
      ['Największy wzrost OVR',rise.delta>0?`+${rise.delta} • ${fmt(rise.season)}`:'brak'],
      ['Największy spadek OVR',fall.delta<0?`${fall.delta} • ${fmt(fall.season)}`:'brak'],
      ['Praktycznie stracone sezony',String(lost)],
      ['Kluby / ligi / kraje',`${clubs} / ${leagues} / ${countries}`],
      ['Awanse / spadki',`${state.promotions} / ${relegations}`]
    ];
    if(Number.isFinite(state.foreignMoveAge)) items.push(['Pierwszy wyjazd za granicę',`${state.foreignMoveAge} lat`]);
    if(bestBallon) items.push(['Najwyżej w głosowaniu Złotej Piłki',`${bestBallon.rank}. miejsce • ${profileSeasonLabel(bestBallon.year)}`]);
    if(firstCall) items.push(['Debiut w seniorskiej reprezentacji',`${firstCall.age} lat`]);
    return `<section class="career-curiosities">
      <h3>CIEKAWOSTKI KARIERY</h3>
      <div class="career-curiosity-list">${items.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
    </section>`;
  }

  function escapeProfileHtml(value){
    return String(value??'').replace(/[&<>'"]/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[ch]);
  }

  function profileSeasonLabel(year){
    return `${year}/${String(year+1).slice(2)}`;
  }

  function profile89List(items,empty='brak'){
    return items.length
      ? `<ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul>`
      : `<p class="profile89-empty">${empty}</p>`;
  }

  function profile89TournamentRows(){
    const rows=[];
    const add=(history,label)=>{
      Object.entries(history||{}).forEach(([year,result])=>{
        const status=result.qualified
          ? (result.result||result.pending?'zakwalifikowany — turniej do rozegrania':'udział')
          : result.playoff&&result.result?`odpadł: ${result.result}`:'brak awansu';
        const allMatches=[...(result.worldPlayoffMatches||[]),...(result.polandMatches||[])];
        rows.push({
          year:Number(year),label,
          status:result.qualified && result.result ? result.result : status,
          goals:result.myGoals||0,assists:result.myAssists||0,goalsConceded:result.myGoalsConceded||0,cleanSheets:result.myCleanSheets||0,
          matches:allMatches.map(match=>`${match.gf}:${match.ga} ${match.opponent}`).join(' • ')
        });
      });
    };
    const generic=state.nationalTournamentHistory||{};
    const genericKinds=Object.keys(generic);
    if(genericKinds.length){
      genericKinds.forEach(kind=>add(generic[kind],window.PPSNaturalization.TOURNAMENT_LABELS[kind]||kind));
    }else{
      add(state.worldCupHistory,'Mundial');
      add(state.euroHistory,'EURO');
    }
    return rows.sort((a,b)=>a.year-b.year);
  }

  function profile89Html(){
    const seasons=state.careerSeasons||[];
    const awards=(state.awardHistory||[]).slice().sort((a,b)=>a.year-b.year);
    const ballonDor=(state.ballondorHistory||[]).slice().sort((a,b)=>a.year-b.year);
    const clubTrophies=(state.trophyHistory||[]).filter(t=>t.clubCredit!==false).sort((a,b)=>a.year-b.year);
    const nationalTrophies=(state.trophyHistory||[]).filter(t=>t.clubCredit===false).sort((a,b)=>a.year-b.year);
    const tournaments=profile89TournamentRows();
    const position={GK:'bramkarz',DEF:'obrońca',MID:'pomocnik',FWD:'napastnik'}[state.position]||state.position;
    const goalkeeper=state.position==='GK';
    const nationalTeam=representedCountryName();
    const birthYear=state.seasonYear-state.age;
    const clubs=new Set(seasons.filter(s=>s.club && !s.club.startsWith('Bez klubu')).map(s=>s.club)).size;
    const legendItems=clubLegendStatus().map(row=>{
      const top=row.tiers[row.tiers.length-1];
      return `<strong>${escapeProfileHtml(row.club)} — ${escapeProfileHtml(top.label)}</strong><br><span>${row.tiers.map(t=>escapeProfileHtml(t.label)).join(' → ')} • ${row.points} pkt klubowych</span>`;
    });

    const seasonRows=seasons.map(s=>{
      const place=Number.isFinite(s.leaguePlace)?`${s.leaguePlace}. / ${s.leagueTeams||'—'}`:'—';
      const league=s.competition||tierName(s.tier||0);
      return `<tr>
        <td>${escapeProfileHtml(profileSeasonLabel(s.year))}</td>
        <td>${escapeProfileHtml(s.club||'—')}</td>
        <td>${escapeProfileHtml(league||'—')}</td>
        <td>${escapeProfileHtml(place)}</td>
        <td>${s.apps||0}</td><td>${goalkeeper?(s.goalsConceded||0):(s.goals||0)}</td><td>${goalkeeper?(s.cleanSheets||0):(s.assists||0)}</td>
        <td>${escapeProfileHtml(s.grade||'—')}</td>
        <td>${s.ovrBefore??'—'} → ${s.ovrAfter??'—'}</td>
      </tr>`;
    }).join('');

    const awardItems=awards.map(a=>
      `<strong>${escapeProfileHtml(awardDisplayName(a))}</strong> — ${escapeProfileHtml(profileSeasonLabel(a.year))}${a.club?` • ${escapeProfileHtml(a.club)}`:''}`
    );
    ballonDor.forEach(entry=>{
      const hasWin=entry.rank===1&&awards.some(a=>a.year===entry.year&&a.name==='Złota Piłka');
      if(!hasWin) awardItems.push(`<strong>Głosowanie Złotej Piłki — ${entry.rank}. miejsce</strong> — ${escapeProfileHtml(profileSeasonLabel(entry.year))} • ${escapeProfileHtml(entry.club||'—')}`);
    });
    const trophyItems=clubTrophies.map(t=>
      `<strong>${escapeProfileHtml(t.name)}</strong> — ${escapeProfileHtml(profileSeasonLabel(t.year))}${t.club?` • ${escapeProfileHtml(t.club)}`:''}`
    );
    const nationalItems=nationalTrophies.map(t=>
      `<strong>${escapeProfileHtml(t.name)}</strong> — ${escapeProfileHtml(profileSeasonLabel(t.year))}`
    );

    const tournamentTable=tournaments.length?`<div class="profile89-table-wrap"><table class="profile89-table compact">
      <thead><tr><th>Turniej</th><th>Rok</th><th>Wynik: ${escapeProfileHtml(nationalTeam)}</th><th>Mecze kadry</th><th>${goalkeeper?'SG':'G'}</th><th>${goalkeeper?'CK':'A'}</th></tr></thead>
      <tbody>${tournaments.map(t=>`<tr><td>${escapeProfileHtml(t.label)}</td><td>${t.year}</td><td>${escapeProfileHtml(t.status)}</td><td>${escapeProfileHtml(t.matches||'—')}</td><td>${goalkeeper?t.goalsConceded:t.goals}</td><td>${goalkeeper?t.cleanSheets:t.assists}</td></tr>`).join('')}</tbody>
    </table></div>`:'<p class="profile89-empty">Brak udziału w turniejach reprezentacyjnych.</p>';

    return `<article class="profile89-card">
      <header class="profile89-header">
        <div class="profile89-brand"><strong>89</strong><span>minut.pl</span></div>
        <div><div class="profile89-kicker">PROFIL ZAWODNIKA</div><h2>${escapeProfileHtml(state.name)}</h2></div>
      </header>

      <div class="profile89-facts">
        <div><span>Rok urodzenia</span><strong>${birthYear}</strong></div>
        <div><span>Pozycja</span><strong>${escapeProfileHtml(position)}</strong></div>
        <div><span>Lepsza noga</span><strong>${escapeProfileHtml(state.foot)}</strong></div>
        <div><span>Województwo</span><strong>${escapeProfileHtml(state.region)}</strong></div>
        <div><span>Maksymalny OVR</span><strong>${state.peakOverall}</strong></div>
        <div><span>Kluby</span><strong>${clubs}</strong></div>
        <div><span>${goalkeeper?'Mecze / stracone / czyste konta':'Mecze / gole / asysty'}</span><strong>${state.totals.apps} / ${goalkeeper?(state.totals.goalsConceded||0):state.totals.goals} / ${goalkeeper?(state.totals.cleanSheets||0):state.totals.assists}</strong></div>
        <div><span>${escapeProfileHtml(nationalTeam)}</span><strong>${state.nationalCaps} M / ${goalkeeper?`${state.nationalGoalsConceded||0} SG / ${state.nationalCleanSheets||0} CK`:`${state.nationalGoals} G`}</strong></div>
      </div>

      <section class="profile89-section">
        <h3>Kariera klubowa — sezon po sezonie</h3>
        <div class="profile89-table-wrap"><table class="profile89-table">
          <thead><tr><th>Sezon</th><th>Klub</th><th>Liga</th><th>Miejsce</th><th>M</th><th>${goalkeeper?'SG':'G'}</th><th>${goalkeeper?'CK':'A'}</th><th>Ocena</th><th>OVR</th></tr></thead>
          <tbody>${seasonRows||'<tr><td colspan="9">Brak rozegranych sezonów.</td></tr>'}</tbody>
          <tfoot><tr><th colspan="4">Razem</th><th>${state.totals.apps}</th><th>${goalkeeper?(state.totals.goalsConceded||0):state.totals.goals}</th><th>${goalkeeper?(state.totals.cleanSheets||0):state.totals.assists}</th><th colspan="2">max OVR ${state.peakOverall}</th></tr></tfoot>
        </table></div>
      </section>

      <div class="profile89-columns">
        <section class="profile89-section"><h3>Osiągnięcia indywidualne</h3>${profile89List(awardItems)}</section>
        <section class="profile89-section"><h3>Trofea klubowe</h3>${profile89List(trophyItems)}</section>
      </div>

      <section class="profile89-section">
        <h3>Status w klubach</h3>
        ${profile89List(legendItems,'Brak osiągniętej rangi klubowej.')}
      </section>

      <section class="profile89-section">
        <h3>Reprezentacja: ${escapeProfileHtml(nationalTeam)}</h3>
        <p><strong>${state.nationalCaps}</strong> meczów • ${goalkeeper?`<strong>${state.nationalGoalsConceded||0}</strong> straconych • <strong>${state.nationalCleanSheets||0}</strong> czystych kont`:`<strong>${state.nationalGoals}</strong> goli`} • mundiale: <strong>${state.worldCups||0}</strong> • puchary kontynentalne: <strong>${state.continentalCups||state.euros||0}</strong></p>
        ${tournamentTable}
        ${nationalItems.length?`<h4>Sukcesy z reprezentacją</h4>${profile89List(nationalItems)}`:''}
      </section>
    </article>`;
  }

  function profile89CanvasLines(ctx,value,maxWidth){
    const text=String(value??'—').trim()||'—';
    const words=text.split(/\s+/);
    const lines=[];
    let line='';
    words.forEach(word=>{
      const candidate=line?`${line} ${word}`:word;
      if(line && ctx.measureText(candidate).width>maxWidth){
        lines.push(line);
        line=word;
      } else line=candidate;
    });
    if(line) lines.push(line);
    return lines.length?lines:['—'];
  }

  function profile89SafeFileName(value){
    return String(value||'pilkarz')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'')
      .toLowerCase()||'pilkarz';
  }

  // Zewnętrzny profil do udostępnienia: pełna kariera jest rysowana na
  // płótnie i zapisywana jako zwykły JPG. Nie wymaga sieci ani biblioteki.
  function exportProfile89Jpg(){
    if(!state?.retired) return;

    // Szeroki arkusz do publikacji: dawny eksport 1600 px układał wszystkie
    // sekcje jedna pod drugą i przy długiej karierze tworzył wąski „paragon”.
    // 2800 px oraz dwie kolumny zachowują czytelność bez mocnego zbliżania.
    const W=2800;
    const PAD=80;
    const CONTENT=W-PAD*2;
    const GAP=56;
    const COL_W=(CONTENT-GAP)/2;
    const LEFT_X=PAD;
    const RIGHT_X=PAD+COL_W+GAP;
    const RED='#c9252d';
    const DARK='#211718';
    const MUTED='#6d5758';
    const LINE='#d7b2b4';
    const LIGHT='#f8e9ea';
    const ALT='#fff7f7';
    const seasons=state.careerSeasons||[];
    const awards=(state.awardHistory||[]).slice().sort((a,b)=>a.year-b.year);
    const ballonDor=(state.ballondorHistory||[]).slice().sort((a,b)=>a.year-b.year);
    const clubTrophies=(state.trophyHistory||[]).filter(t=>t.clubCredit!==false).sort((a,b)=>a.year-b.year);
    const nationalTrophies=(state.trophyHistory||[]).filter(t=>t.clubCredit===false).sort((a,b)=>a.year-b.year);
    const tournaments=profile89TournamentRows().filter(t=>t.status!=='brak awansu');
    const position={GK:'bramkarz',DEF:'obrońca',MID:'pomocnik',FWD:'napastnik'}[state.position]||state.position;
    const goalkeeper=state.position==='GK';
    const nationalTeam=representedCountryName();
    const birthYear=state.seasonYear-state.age;
    const clubs=new Set(seasons.filter(s=>s.club && !s.club.startsWith('Bez klubu')).map(s=>s.club)).size;
    const legendLines=clubLegendStatus().map(row=>{
      const top=row.tiers[row.tiers.length-1];
      return `${row.club} — ${top.label} • ${row.tiers.map(t=>t.label).join(' → ')} • ${row.points} pkt klubowych`;
    });

    const measureCanvas=document.createElement('canvas');
    measureCanvas.width=W;
    const measure=measureCanvas.getContext('2d');
    measure.font='28px Arial, sans-serif';

    const listHeight=(items,width=CONTENT)=>{
      if(!items.length) return 58;
      measure.font='28px Arial, sans-serif';
      return items.reduce((sum,item)=>sum+Math.max(50,profile89CanvasLines(measure,item,width-66).length*38+10),0);
    };
    const awardLines=awards.map(a=>`${awardDisplayName(a)} — ${profileSeasonLabel(a.year)}${a.club?` • ${a.club}`:''}`);
    ballonDor.forEach(entry=>{
      const hasWin=entry.rank===1&&awards.some(a=>a.year===entry.year&&a.name==='Złota Piłka');
      if(!hasWin) awardLines.push(`Głosowanie Złotej Piłki — ${entry.rank}. miejsce — ${profileSeasonLabel(entry.year)} • ${entry.club||'—'}`);
    });
    const trophyLines=clubTrophies.map(t=>`${t.name} — ${profileSeasonLabel(t.year)}${t.club?` • ${t.club}`:''}`);
    const nationalLines=nationalTrophies.map(t=>`${t.name} — ${profileSeasonLabel(t.year)}`);
    const tournamentRows=tournaments.map(t=>({
      title:`${t.label} ${t.year} — ${t.status}`,
      detail:`Mecze kadry ${nationalTeam}: ${t.matches||'brak zapisanych wyników'} • zawodnik: ${goalkeeper?`${t.goalsConceded} SG / ${t.cleanSheets} CK`:`${t.goals} G / ${t.assists} A`}`
    }));
    measure.font='30px Arial, sans-serif';
    const representationText=goalkeeper
      ?`${state.nationalCaps} meczów • ${state.nationalGoalsConceded||0} straconych • ${state.nationalCleanSheets||0} czystych kont • mundiale: ${state.worldCups||0} • puchary kont.: ${state.continentalCups||state.euros||0}`
      :`${state.nationalCaps} meczów • ${state.nationalGoals} goli • mundiale: ${state.worldCups||0} • puchary kont.: ${state.continentalCups||state.euros||0}`;
    const representationIntroH=Math.max(82,profile89CanvasLines(measure,representationText,COL_W-42).length*40+22);
    const tournamentHeight=tournamentRows.length
      ? tournamentRows.reduce((sum,row)=>{
          measure.font='30px Arial, sans-serif';
          const title=profile89CanvasLines(measure,row.title,COL_W-48).length;
          measure.font='26px Arial, sans-serif';
          const detail=profile89CanvasLines(measure,row.detail,COL_W-48).length;
          return sum+Math.max(96,title*40+detail*34+24);
        },0)
      : 68;

    const headerH=200;
    const factsH=210;
    const sectionHeadH=76;
    const tableHeadH=62;
    const seasonRowH=64;
    const tableFootH=64;
    const footerH=96;
    const leftColumnH=
      sectionHeadH+listHeight(awardLines,COL_W)+
      sectionHeadH+listHeight(trophyLines,COL_W);
    const rightColumnH=
      sectionHeadH+listHeight(legendLines,COL_W)+
      sectionHeadH+representationIntroH+tournamentHeight+
      (nationalLines.length?sectionHeadH+listHeight(nationalLines,COL_W):0);
    const totalH=Math.max(1200,
      headerH+factsH+
      sectionHeadH+tableHeadH+Math.max(1,seasons.length)*seasonRowH+tableFootH+
      Math.max(leftColumnH,rightColumnH)+24+footerH
    );

    const canvas=document.createElement('canvas');
    canvas.width=W;
    canvas.height=Math.ceil(totalH);
    const ctx=canvas.getContext('2d');
    ctx.textBaseline='middle';
    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,W,canvas.height);

    const setFont=(size,weight=400)=>{ctx.font=`${weight} ${size}px Arial, sans-serif`;};
    const line=(x1,y1,x2,y2,color=LINE,width=1)=>{
      ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    };
    const fitText=(value,maxWidth)=>{
      const original=String(value??'—');
      if(ctx.measureText(original).width<=maxWidth) return original;
      let text=original;
      while(text.length>1 && ctx.measureText(`${text}…`).width>maxWidth) text=text.slice(0,-1);
      return `${text}…`;
    };
    const drawWrapped=(value,x,y,maxWidth,lineHeight,color=DARK)=>{
      const lines=profile89CanvasLines(ctx,value,maxWidth);
      ctx.fillStyle=color;
      lines.forEach((txt,i)=>ctx.fillText(txt,x,y+i*lineHeight));
      return lines.length;
    };
    const sectionTitle=(title,y,x=0,width=W)=>{
      const inset=x===0?PAD:22;
      ctx.fillStyle=LIGHT; ctx.fillRect(x,y,width,sectionHeadH);
      ctx.fillStyle=RED; setFont(32,800); ctx.fillText(fitText(title.toUpperCase(),width-inset*2),x+inset,y+sectionHeadH/2);
      line(x+inset,y+sectionHeadH-1,x+width-inset,y+sectionHeadH-1,RED,2);
      return y+sectionHeadH;
    };
    const drawList=(items,y,x=PAD,width=CONTENT)=>{
      if(!items.length){
        ctx.fillStyle=MUTED; setFont(27,400); ctx.fillText('brak',x+22,y+29);
        return y+58;
      }
      items.forEach((item,index)=>{
        setFont(28,400);
        const lines=profile89CanvasLines(ctx,item,width-66);
        const h=Math.max(50,lines.length*38+10);
        if(index%2===1){ctx.fillStyle=ALT;ctx.fillRect(x,y,width,h);}
        ctx.fillStyle=RED; ctx.beginPath(); ctx.arc(x+17,y+27,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=DARK;
        lines.forEach((txt,i)=>ctx.fillText(txt,x+39,y+26+i*38));
        y+=h;
      });
      return y;
    };

    let y=0;
    ctx.fillStyle=RED; ctx.fillRect(0,0,W,headerH);
    ctx.fillStyle='#fff'; setFont(84,900); ctx.fillText('89',PAD,96);
    setFont(40,800); ctx.fillText('minut.pl',PAD+122,108);
    setFont(25,800); ctx.fillText('PROFIL ZAWODNIKA • POLSKI PIŁKARZ SIMULATOR',PAD+460,62);
    setFont(64,800); ctx.fillText(fitText(state.name,CONTENT-460),PAD+460,132);
    y=headerH;

    const facts=[
      ['Rok urodzenia',birthYear],['Pozycja',position],['Lepsza noga',state.foot],['Województwo',state.region],
      ['Maksymalny OVR',state.peakOverall],['Kluby',clubs],[goalkeeper?'M / SG / CK':'M / G / A',`${state.totals.apps} / ${goalkeeper?(state.totals.goalsConceded||0):state.totals.goals} / ${goalkeeper?(state.totals.cleanSheets||0):state.totals.assists}`],[nationalTeam,goalkeeper?`${state.nationalCaps} M / ${state.nationalGoalsConceded||0} SG / ${state.nationalCleanSheets||0} CK`:`${state.nationalCaps} M / ${state.nationalGoals} G`]
    ];
    const factW=CONTENT/4;
    const factH=factsH/2;
    facts.forEach((fact,i)=>{
      const col=i%4,row=Math.floor(i/4),x=PAD+col*factW,fy=y+row*factH;
      if((row+col)%2===0){ctx.fillStyle=ALT;ctx.fillRect(x,fy,factW,factH);}
      line(x+factW,fy,x+factW,fy+factH,LINE,1); line(x,fy+factH,x+factW,fy+factH,LINE,1);
      ctx.fillStyle=MUTED; setFont(20,800); ctx.fillText(String(fact[0]).toUpperCase(),x+20,fy+32);
      ctx.fillStyle=DARK; setFont(31,700); ctx.fillText(fitText(fact[1],factW-40),x+20,fy+76);
    });
    y+=factsH;

    y=sectionTitle('Kariera klubowa — sezon po sezonie',y);
    const columns=[
      {name:'SEZON / WIEK',w:200},{name:'KLUB',w:600},{name:'LIGA',w:800},{name:'MIEJSCE',w:170},
      {name:'M',w:85},{name:goalkeeper?'SG':'G',w:85},{name:goalkeeper?'CK':'A',w:85},{name:'OCENA',w:270},{name:'OVR',w:345}
    ];
    ctx.fillStyle=RED;ctx.fillRect(PAD,y,CONTENT,tableHeadH);
    let x=PAD;
    columns.forEach(col=>{ctx.fillStyle='#fff';setFont(20,800);ctx.fillText(col.name,x+12,y+tableHeadH/2);x+=col.w;});
    y+=tableHeadH;
    if(!seasons.length){
      ctx.fillStyle=DARK;setFont(28,400);ctx.fillText('Brak rozegranych sezonów.',PAD+14,y+seasonRowH/2);y+=seasonRowH;
    } else seasons.forEach((s,rowIndex)=>{
      if(rowIndex%2===1){ctx.fillStyle=ALT;ctx.fillRect(PAD,y,CONTENT,seasonRowH);}
      const place=Number.isFinite(s.leaguePlace)?`${s.leaguePlace}. / ${s.leagueTeams||'—'}`:'—';
      const values=[`${profileSeasonLabel(s.year)} • ${s.age} l.`,s.club||'—',s.competition||tierName(s.tier||0),place,s.apps||0,goalkeeper?(s.goalsConceded||0):(s.goals||0),goalkeeper?(s.cleanSheets||0):(s.assists||0),s.grade||'—',`${s.ovrBefore??'—'} → ${s.ovrAfter??'—'}`];
      let cx=PAD;
      values.forEach((value,i)=>{
        ctx.fillStyle=DARK; setFont(i===1?27:25,i===1?700:400);
        ctx.fillText(fitText(value,columns[i].w-24),cx+12,y+seasonRowH/2);
        cx+=columns[i].w;
        if(i<values.length-1) line(cx,y,cx,y+seasonRowH,LINE,1);
      });
      line(PAD,y+seasonRowH,W-PAD,y+seasonRowH,LINE,1);
      y+=seasonRowH;
    });
    ctx.fillStyle='#f1d3d5';ctx.fillRect(PAD,y,CONTENT,tableFootH);
    ctx.fillStyle=RED;setFont(26,800);ctx.fillText(goalkeeper?`RAZEM: ${state.totals.apps} MECZÓW • ${state.totals.goalsConceded||0} STRACONYCH • ${state.totals.cleanSheets||0} CZYSTYCH KONT • MAX OVR ${state.peakOverall}`:`RAZEM: ${state.totals.apps} MECZÓW • ${state.totals.goals} GOLI • ${state.totals.assists} ASYST • MAX OVR ${state.peakOverall}`,PAD+14,y+tableFootH/2);
    y+=tableFootH;

    const lowerTop=y;
    let leftY=y;
    let rightY=y;
    leftY=sectionTitle('Osiągnięcia indywidualne',leftY,LEFT_X,COL_W);
    leftY=drawList(awardLines,leftY,LEFT_X,COL_W);
    leftY=sectionTitle('Trofea klubowe',leftY,LEFT_X,COL_W);
    leftY=drawList(trophyLines,leftY,LEFT_X,COL_W);

    rightY=sectionTitle('Status w klubach',rightY,RIGHT_X,COL_W);
    rightY=drawList(legendLines,rightY,RIGHT_X,COL_W);
    rightY=sectionTitle(`Reprezentacja: ${nationalTeam}`,rightY,RIGHT_X,COL_W);
    setFont(30,700);
    drawWrapped(representationText,RIGHT_X+22,rightY+28,COL_W-44,40,DARK);
    rightY+=representationIntroH;
    if(!tournamentRows.length){
      ctx.fillStyle=MUTED;setFont(27,400);ctx.fillText('Brak udziału w turniejach reprezentacyjnych.',RIGHT_X+22,rightY+34);rightY+=68;
    } else tournamentRows.forEach((row,index)=>{
      ctx.font='700 30px Arial, sans-serif';
      const titleLines=profile89CanvasLines(ctx,row.title,COL_W-48);
      ctx.font='400 26px Arial, sans-serif';
      const detailLines=profile89CanvasLines(ctx,row.detail,COL_W-48);
      const h=Math.max(96,titleLines.length*40+detailLines.length*34+24);
      if(index%2===1){ctx.fillStyle=ALT;ctx.fillRect(RIGHT_X,rightY,COL_W,h);}
      setFont(30,700);ctx.fillStyle=RED;titleLines.forEach((txt,i)=>ctx.fillText(txt,RIGHT_X+22,rightY+26+i*40));
      setFont(26,400);ctx.fillStyle=DARK;const detailY=rightY+26+titleLines.length*40;detailLines.forEach((txt,i)=>ctx.fillText(txt,RIGHT_X+22,detailY+i*34));
      line(RIGHT_X,rightY+h,RIGHT_X+COL_W,rightY+h,LINE,1); rightY+=h;
    });
    if(nationalLines.length){
      rightY=sectionTitle('Sukcesy z reprezentacją',rightY,RIGHT_X,COL_W);
      rightY=drawList(nationalLines,rightY,RIGHT_X,COL_W);
    }
    y=Math.max(leftY,rightY)+24;
    line(PAD+COL_W+GAP/2,lowerTop,PAD+COL_W+GAP/2,y-24,LINE,2);

    ctx.fillStyle=LIGHT;ctx.fillRect(0,y,W,footerH);
    ctx.fillStyle=MUTED;setFont(23,700);ctx.fillText(`Wygenerowano w Polski Piłkarz Simulator • wynik kariery: ${scaledCareerScore()} pkt`,PAD,y+footerH/2);

    const fileName=`profil-89minut-${profile89SafeFileName(state.name)}.jpg`;
    const download=blob=>{
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),2000);
    };
    if(canvas.toBlob){
      canvas.toBlob(blob=>{
        if(blob) download(blob);
        else {
          const a=document.createElement('a');a.href=canvas.toDataURL('image/jpeg',.92);a.download=fileName;document.body.appendChild(a);a.click();a.remove();
        }
      },'image/jpeg',.92);
    } else {
      const a=document.createElement('a');a.href=canvas.toDataURL('image/jpeg',.92);a.download=fileName;document.body.appendChild(a);a.click();a.remove();
    }
  }

  function openProfile89(){
    if(!state?.retired) return;
    els.profile89Content.innerHTML=profile89Html();
    els.retirementSummary.classList.add('hidden');
    els.profile89View.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function closeProfile89(){
    els.profile89View.classList.add('hidden');
    els.retirementSummary.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function finalCareerVerdict(){
    const caps=state.nationalCaps||0;
    const peak=state.peakOverall||0;
    const trophies=state.trophies?.length||0;
    const awards=state.awards?.length||0;
    const topSeasons=(state.ekstraklasaSeasons||0)+(state.foreignSeasons||0);
    const apps=state.totals?.apps||0;
    const media=state.recognition||0;
    const professionalism=state.professionalism||0;
    const seasons=(state.careerSeasons||[]).filter(s=>s.club&&s.club!=='Bez klubu');
    const clubs=new Set(seasons.map(s=>s.club)).size;
    const longest=longestClubRun(seasons)||{club:'',length:0};
    const clubRows=clubLegendStatus();
    const clubWith=key=>clubRows.find(row=>row.tiers.some(t=>t.key===key));
    const stadiumClub=clubWith('stadium');
    const retiredNumberClub=clubWith('retiredNumber');
    const alltimeClub=clubWith('alltime11');
    const fanClub=clubWith('fan');
    const rememberedClub=clubWith('remembered');
    const nationalTeam=representedCountryName();

    // Sama wartość 85 OVR nie daje już statusu legendy. To poziom kadrowy,
    // który musi zostać poparty długim dorobkiem, występami i sukcesami.
    const worldIcon=
      state.legendUnlocked && peak>=100 && caps>=70 && topSeasons>=12 && trophies>=5;
    const polishLegend=
      (caps>=75 && peak>=88 && topSeasons>=10 && (trophies>=3 || awards>=5)) ||
      (caps>=55 && peak>=92 && topSeasons>=12 && trophies>=5);
    const generationElite=
      (caps>=50 && peak>=86 && topSeasons>=8) ||
      (peak>=90 && topSeasons>=10 && trophies>=3);

    let primary;
    if(worldIcon) primary='Ikona światowego futbolu.';
    else if(polishLegend) primary='Legenda polskiej piłki.';
    else if(stadiumClub) primary=`Największa legenda w historii klubu ${stadiumClub.club}.`;
    else if(retiredNumberClub) primary=`Legenda jednego klubu — ${retiredNumberClub.club}.`;
    else if(generationElite) primary='Jeden z najlepszych polskich piłkarzy swojego pokolenia.';
    else if(alltimeClub) primary=`Członek jedenastki wszechczasów klubu ${alltimeClub.club}.`;
    else if(caps>=45 && peak>=83) primary=`Gwiazda reprezentacji ${nationalTeam}.`;
    else if((state.foreignSeasons||0)>=9 && peak>=80) primary='Polski piłkarz z dużą karierą zagraniczną.';
    else if(caps>=20) primary=`Uznany reprezentant kadry ${nationalTeam}.`;
    else if((state.ekstraklasaSeasons||0)>=8 && (trophies>=2 || awards>=2 || peak>=80)) primary='Ikona Ekstraklasy.';
    else if(fanClub) primary=`Ulubieniec kibiców klubu ${fanClub.club}.`;
    else if(peak>=82 && apps<180 && topSeasons<5) primary='Wielki talent, po którym pozostał niedosyt.';
    else if((state.foreignSeasons||0)>=4) primary='Solidna kariera zagraniczna.';
    else if((state.ekstraklasaSeasons||0)>=5 || (apps>=250 && state.highestTier>=5)) primary='Uznany ligowiec.';
    else if(rememberedClub) primary=`Ważna postać w historii klubu ${rememberedClub.club}.`;
    else if(state.highestTier>=4 && apps>=160) primary='Solidny zawodowiec.';
    else if(apps>=180) primary='Ważna postać niższych lig.';
    else if(apps>=90) primary='Kariera ligowego rzemieślnika.';
    else primary='Krótka kariera, która nie rozwinęła pełnego potencjału.';

    const substantial=caps>=25 || topSeasons>=8 || trophies>=2 || awards>=3 || peak>=87;
    const notes=[];
    if(media>=85 && substantial) notes.push('Medialna ikona swojej epoki.');
    else if(media>=80 && !substantial) notes.push('Rozpoznawalność przerosła sportowy dorobek.');
    else if(media<=20 && substantial) notes.push('Wielka kariera bez wielkiego rozgłosu.');

    if(professionalism>=90) notes.push('Wzór profesjonalizmu.');
    else if(professionalism<=25 && peak>=75) notes.push('Talent wyraźnie większy niż profesjonalizm.');

    if((state.loyalty||0)>=12 && clubs<=3 && longest.length>=8)
      notes.push('Symbol przywiązania do klubowych barw.');
    else if(clubs>=10) notes.push('Piłkarski obieżyświat.');
    else if((state.foreignSeasons||0)>=12) notes.push('Przez lata sprawdzony na zagranicznych boiskach.');

    return [primary,...notes.slice(0,2)].join(' ');
  }

  function retire(){
    state.retired=true; show(els.retirementView); els.newCareerBtn.classList.add('hidden');
    els.saveGameBtn?.classList.add('hidden');
    els.coopContinueAfterRetireBtn?.classList.toggle('hidden',!coopIsActive());
    if(coopIsActive()&&els.coopContinueAfterRetireBtn){
      const hasAnother=coopSession.players.some((player,index)=>index!==coopSession.activeIndex&&!player.retired);
      els.coopContinueAfterRetireBtn.textContent=hasAnother?'DALEJ — NASTĘPNY GRACZ':'PODSUMUJ CO-OP';
    }
    if(els.coopFinalResults){els.coopFinalResults.innerHTML='';els.coopFinalResults.classList.add('hidden');}
    els.profile89View.classList.add('hidden'); els.retirementSummary.classList.remove('hidden');
    state.score += state.nationalCaps*3 + state.trophies.length*24 + state.awards.length*18 + Math.max(0,state.peakOverall-60)*2;
    const finalScore=scaledCareerScore();
    const level=finalCareerVerdict();
    const goalkeeper=state.position==='GK';
    const nationalTeam=representedCountryName();
    els.retireTitle.textContent=`${state.name} kończy karierę w wieku ${state.age} lat.`; els.retireVerdict.textContent=level;
    els.retireStats.innerHTML=`
      <div><span>Mecze</span><strong>${state.totals.apps}</strong></div><div><span>${goalkeeper?'Stracone gole':'Gole'}</span><strong>${goalkeeper?(state.totals.goalsConceded||0):state.totals.goals}</strong></div><div><span>${goalkeeper?'Czyste konta':'Asysty'}</span><strong>${goalkeeper?(state.totals.cleanSheets||0):state.totals.assists}</strong></div><div><span>Kadra</span><strong>${state.nationalCaps}</strong></div><div><span>Mundiale</span><strong>${state.worldCups||0}</strong></div><div><span>Puchary kont.</span><strong>${state.continentalCups||state.euros||0}</strong></div><div><span>Awanse</span><strong>${state.promotions}</strong></div><div><span>Wynik</span><strong>${finalScore}</strong></div>`;
    els.retireClubs.innerHTML=`<strong>Kluby:</strong> ${state.clubHistory.join(' → ')}<br><strong>Najwyższy poziom:</strong> ${state.bestForeignTier?foreignTierName(state.bestForeignTier):tierName(state.highestTier)}<br><strong>Trofea:</strong> ${state.trophies.length?state.trophies.join(', '):'brak'}<br><strong>Wyróżnienia:</strong> ${state.awards.length?state.awards.join(', '):'brak'}${goalkeeper&&state.nationalCaps?`<br><strong>${nationalTeam}:</strong> ${state.nationalGoalsConceded||0} straconych / ${state.nationalCleanSheets||0} czystych kont`:state.nationalGoals?`<br><strong>Gole dla ${nationalTeam}:</strong> ${state.nationalGoals}`:''}<br><strong>Punktacja:</strong> ${state.score} pkt surowych → ${finalScore} pkt (${careerScoreScaleText()})${careerFinanceHtml()}${careerCuriositiesHtml()}${clubLegendHtml()}${state.legendUnlocked?legendRankingHtml():''}`;

    els.retireSeasons.innerHTML=(state.careerSeasons||[]).map(x=>`
      <div class="season-review-item">
        <div class="season-review-year">${x.year}/${String(x.year+1).slice(2)}<br>${x.age} LAT</div>
        <div class="season-review-club"><strong>${x.club}</strong><span>${x.competition||tierName(x.tier)}${Number.isFinite(x.leaguePlace)?` • ${x.leaguePlace}. miejsce`:''}</span><br><span class="season-grade">${x.grade}</span>${Number.isFinite(x.clubPoints)?` <span class="season-grade">${x.clubPoints} pkt klubu</span>`:''}${x.note?`<br><span>${x.note}</span>`:''}</div>
        <div class="season-review-stats">${goalkeeper?`${x.apps} M • ${x.goalsConceded||0} SG • ${x.cleanSheets||0} CK`:`${x.apps} M • ${x.goals} G • ${x.assists} A`}<br><span class="season-review-meta">${x.minutes} min • sezon ${x.form}${x.seasonRoll?` (${x.seasonRoll})`:''}${x.nationalCaps?goalkeeper?`<br>🌐 ${x.nationalTeam||nationalTeam}: ${x.nationalCaps} M / ${x.nationalGoalsConceded||0} SG / ${x.nationalCleanSheets||0} CK`:`<br>🌐 ${x.nationalTeam||nationalTeam}: ${x.nationalCaps} M / ${x.nationalGoals||0} G`:''}</span></div>
        <div class="season-review-ovr">OVR ${x.ovrBefore} → ${x.ovrAfter}<br><span class="season-review-meta">środ. ${x.environment}${Number.isFinite(x.environmentGrowth)?` (${x.environmentGrowth>0?'+':''}${x.environmentGrowth} OVR)`:''}</span></div>
      </div>`).join('');
  }

  // ============================================================
  // NSS — podłączenie paczki turniejów reprezentacji do stanu kariery.
  // Jedyne miejsce łączące bibliotekę NSS z 'state'/'els'/'log'/'render'.
  // Wymaga wcześniejszego wczytania 01–03, 06 i 07 (patrz index.html).
  // ============================================================
  const nssPolska = installPolskaKarieraNSS({
    tournamentRoot: '#nssTournamentRoot',
    getState: () => state,
    log: (title, meta) => log(title, meta),
    addTrophy: (name, score) => addTrophy(name, score),
    render: () => render(),
    setCareerVisible: visible => { els.careerView.classList.toggle('hidden', !visible); }
  });

  const APP_VERSION='1.64';
  const PUBLIC_GAME_URL='https://www.tetrycy.com.pl/pilkarz.html';
  let deferredPwaPrompt=null;
  function runningAsInstalledApp(){
    return !!(window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true);
  }
  function closePwaModal(){ els.pwaModal?.classList.add('hidden'); }
  function setPwaStatus(text){
    if(els.pwaUpdateStatus) els.pwaUpdateStatus.innerHTML=text||'';
  }
  function resetPwaModal(){
    setPwaStatus('');
    if(els.pwaUpdateLink){
      els.pwaUpdateLink.textContent='OTWÓRZ AKTUALIZACJĘ';
      els.pwaUpdateLink.classList.add('hidden');
    }
    els.pwaInstallInfo?.classList.remove('hidden');
    els.pwaInstallConfirm?.classList.remove('hidden');
    if(els.pwaConsent) els.pwaConsent.checked=false;
    if(els.pwaInstallConfirm) els.pwaInstallConfirm.disabled=true;
  }
  function openPwaInstallInfo(){
    resetPwaModal();
    if(els.pwaModalEyebrow) els.pwaModalEyebrow.textContent='APLIKACJA NA TELEFON';
    if(els.pwaModalTitle) els.pwaModalTitle.textContent='Zainstaluj grę';
    els.pwaModal?.classList.remove('hidden');
  }
  function remoteGameUrl(){
    return (location.hostname||'').toLowerCase().endsWith('tetrycy.com.pl')
      ? `${location.origin}/pilkarz.html`
      : PUBLIC_GAME_URL;
  }
  function compareVersions(left,right){
    const a=String(left||'').split('.').map(x=>parseInt(x,10)||0);
    const b=String(right||'').split('.').map(x=>parseInt(x,10)||0);
    for(let i=0;i<Math.max(a.length,b.length);i++){
      if((a[i]||0)!==(b[i]||0)) return (a[i]||0)-(b[i]||0);
    }
    return 0;
  }
  function extractPublishedVersion(html){
    const source=String(html||'');
    const meta=source.match(/<meta[^>]+name=["']pps-version["'][^>]+content=["']([^"']+)["']/i)
      ||source.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']pps-version["']/i);
    if(meta?.[1]){
      const version=meta[1].replace(/^v/i,'').trim();
      if(/^\d+(?:\.\d+)+$/.test(version)) return version;
    }
    const badge=source.match(/\bv(\d+(?:\.\d+)+)\b/i);
    return badge?.[1]||null;
  }
  async function checkForPwaUpdate(){
    resetPwaModal();
    if(els.pwaModalEyebrow) els.pwaModalEyebrow.textContent='AKTUALIZACJE';
    if(els.pwaModalTitle) els.pwaModalTitle.textContent='Sprawdź aktualizacje';
    els.pwaInstallInfo?.classList.add('hidden');
    els.pwaInstallConfirm?.classList.add('hidden');
    els.pwaModal?.classList.remove('hidden');
    setPwaStatus('Sprawdzam wersję opublikowaną na stronie Tetryków…');
    try{
      const joiner=remoteGameUrl().includes('?')?'&':'?';
      const response=await fetch(`${remoteGameUrl()}${joiner}pps-update-check=${Date.now()}`,{cache:'no-store',credentials:'omit'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const publishedVersion=extractPublishedVersion(await response.text());
      if(!publishedVersion) throw new Error('Brak numeru wersji');
      const comparison=compareVersions(publishedVersion,APP_VERSION);
      if(comparison>0){
        setPwaStatus(`Jest nowsza wersja: <strong>v${publishedVersion}</strong> (masz v${APP_VERSION}). Wejdź na stronę gry, aby uruchomić aktualizację.`);
        if(els.pwaUpdateLink){
          els.pwaUpdateLink.href=`${PUBLIC_GAME_URL}?pps-update=${encodeURIComponent(publishedVersion)}&t=${Date.now()}`;
          els.pwaUpdateLink.classList.remove('hidden');
        }
      }else if(comparison===0){
        setPwaStatus(`Masz najnowszą wersję gry: <strong>v${APP_VERSION}</strong>.`);
      }else{
        setPwaStatus(`Masz wersję <strong>v${APP_VERSION}</strong>, nowszą niż obecnie opublikowana na stronie.`);
      }
    }catch(_){
      setPwaStatus('Nie udało się teraz sprawdzić aktualizacji. Sprawdź połączenie z internetem i spróbuj ponownie.');
    }
  }
  function configurePwaOption(){
    if(!els.pwaOptionsBtn) return;
    const installed=runningAsInstalledApp();
    els.pwaOptionsBtn.classList.toggle('update-mode',installed);
    const title=els.pwaOptionsBtn.querySelector('strong');
    if(title) title.textContent=installed?'SPRAWDŹ AKTUALIZACJE':'ZAINSTALUJ NA TELEFONIE';
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPwaPrompt=event;
  });
  window.addEventListener('appinstalled',()=>{
    deferredPwaPrompt=null;
    setPwaStatus('Gra została zainstalowana. Ikony „Polski Piłkarz” szukaj na ekranie głównym telefonu lub na liście aplikacji.');
  });
  async function installPwaWithConsent(){
    if(!els.pwaConsent?.checked) return;
    if(els.pwaInstallConfirm) els.pwaInstallConfirm.disabled=true;
    if(runningAsInstalledApp()){
      await checkForPwaUpdate();
      return;
    }
    if(deferredPwaPrompt){
      const prompt=deferredPwaPrompt;
      deferredPwaPrompt=null;
      const result=await prompt.prompt();
      setPwaStatus(result.outcome==='accepted'?'Instalacja została zaakceptowana. Po zakończeniu ikony „Polski Piłkarz” szukaj na ekranie głównym telefonu lub na liście aplikacji.':'Instalacja została anulowana. Możesz uruchomić ją ponownie z ekranu głównego gry.');
      return;
    }
    if(location.protocol==='file:'){
      setPwaStatus('Pobrany plik standalone działa offline, ale nie może uruchomić instalatora PWA. Użyj przycisku poniżej, aby otworzyć internetową wersję gry przez HTTPS, a następnie ponownie wybierz „Zainstaluj na telefonie”.');
      if(els.pwaUpdateLink){
        els.pwaUpdateLink.textContent='OTWÓRZ WERSJĘ DO INSTALACJI';
        els.pwaUpdateLink.href=PUBLIC_GAME_URL;
        els.pwaUpdateLink.classList.remove('hidden');
      }
      return;
    }
    if(/iphone|ipad|ipod/i.test(navigator.userAgent||'')){
      setPwaStatus('Na iPhonie lub iPadzie wybierz w przeglądarce „Udostępnij”, a potem „Do ekranu początkowego”.');
      return;
    }
    setPwaStatus('Przeglądarka nie udostępniła własnego okna instalacji. W jej menu wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.');
  }
  configurePwaOption();
  els.pwaOptionsBtn?.addEventListener('click',()=>{
    closeOptionsModal();
    if(runningAsInstalledApp()) checkForPwaUpdate();
    else openPwaInstallInfo();
  });
  els.pwaConsent?.addEventListener('change',()=>{ if(els.pwaInstallConfirm) els.pwaInstallConfirm.disabled=!els.pwaConsent.checked; });
  els.pwaInstallConfirm?.addEventListener('click',installPwaWithConsent);
  els.pwaModalClose?.addEventListener('click',closePwaModal);
  els.pwaModalCloseX?.addEventListener('click',closePwaModal);
  async function registerPwaServiceWorker(){
    try{
      // Wersje 1.26–1.29 używały ogólnego service-worker.js ze zbyt szerokim
      // zakresem. Usuwamy wyłącznie tę rejestrację, gdy rozpoznajemy cache gry.
      const ppsCaches='caches' in window
        ?(await caches.keys()).some(name=>name.startsWith('polski-pilkarz-current-'))
        :false;
      if(ppsCaches&&navigator.serviceWorker.getRegistrations){
        const registrations=await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations
          .filter(registration=>/\/service-worker\.js$/.test(registration.active?.scriptURL||registration.waiting?.scriptURL||registration.installing?.scriptURL||''))
          .map(registration=>registration.unregister()));
      }
      await navigator.serviceWorker.register('./pilkarz-service-worker.js',{scope:'./'});
    }catch(_){/* Gra w przeglądarce działa także bez trybu offline. */}
  }
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load',registerPwaServiceWorker);
  }


  function resetGame(){ state=null; coopSession=null; selectedStartingClubName=null; selectedCustomClubDraft=null; customClubError(''); randomizeSetupScreen(); applyVisualTheme(); applyPanelModeAppearance(); applyLeagueTableStyle(); closeOptionsModal(); closeLeagueMatchReport(); clearCareerUiForNewGame(); els.coopBar?.classList.add('hidden'); els.coopContinueAfterRetireBtn?.classList.add('hidden'); show(els.setupView); els.newCareerBtn.classList.add('hidden'); els.saveGameBtn?.classList.add('hidden'); els.decisionBox.classList.add('hidden'); els.playSeasonBtn.classList.remove('hidden'); els.profile89View.classList.add('hidden'); els.retirementSummary.classList.remove('hidden'); closeSaveGameModal(); }
  els.optionsBtn?.addEventListener('click',openOptionsModal);
  els.optionsClose?.addEventListener('click',closeOptionsModal);
  els.optionsCloseX?.addEventListener('click',closeOptionsModal);
  els.saveGameBtn?.addEventListener('click',()=>{ closeOptionsModal(); openSaveGameModal('save'); });
  els.loadGameBanner?.addEventListener('click',()=>openSaveGameModal('load'));
  els.loadGameStartBtn?.addEventListener('click',()=>openSaveGameModal('load'));
  els.loadGameOptionsBtn?.addEventListener('click',()=>{ closeOptionsModal(); openSaveGameModal('load'); });
  els.saveGameClose?.addEventListener('click',closeSaveGameModal);
  els.saveGameCloseX?.addEventListener('click',closeSaveGameModal);
  els.leagueMatchClose?.addEventListener('click',closeLeagueMatchReport);
  els.leagueMatchCloseX?.addEventListener('click',closeLeagueMatchReport);
  els.leagueMatchModal?.addEventListener('click',event=>{if(event.target===els.leagueMatchModal)closeLeagueMatchReport();});
  els.profile89Btn.addEventListener('click',exportProfile89Jpg); els.profile89BackBtn.addEventListener('click',closeProfile89);
  els.youtubePromptClose?.addEventListener('click',closeYouTubePrompt);
  els.youtubePromptCloseX?.addEventListener('click',closeYouTubePrompt);
  els.youtubePromptLink?.addEventListener('click',closeYouTubePrompt);
  els.patronitePromptClose?.addEventListener('click',closePatronitePrompt);
  els.patronitePromptCloseX?.addEventListener('click',closePatronitePrompt);
  els.patronitePromptLink?.addEventListener('click',closePatronitePrompt);
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape') return;
    if(els.pwaModal && !els.pwaModal.classList.contains('hidden')) closePwaModal();
    else if(els.leagueMatchModal && !els.leagueMatchModal.classList.contains('hidden')) closeLeagueMatchReport();
    else if(els.saveGameModal && !els.saveGameModal.classList.contains('hidden')) closeSaveGameModal();
    else if(els.optionsModal && !els.optionsModal.classList.contains('hidden')) closeOptionsModal();
    else if(els.youtubePrompt && !els.youtubePrompt.classList.contains('hidden')) closeYouTubePrompt();
    else if(els.patronitePrompt && !els.patronitePrompt.classList.contains('hidden')) closePatronitePrompt();
  });
  els.newCareerBtn.addEventListener('click',resetGame); els.restartBtn.addEventListener('click',resetGame);
  els.coopContinueAfterRetireBtn?.addEventListener('click',()=>{
    if(!coopIsActive())return;
    coopSession.players[coopSession.activeIndex]=state;
    finishCoopTurn();
  });
  applyPanelModeAppearance();
  applyVisualTheme();
  applyLeagueTableStyle();
})();

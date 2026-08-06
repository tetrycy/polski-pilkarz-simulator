/*
 * Polski Piłkarz Simulator — naturalizacja i kalendarz reprezentacji.
 * Moduł jest czysty: nie zna DOM-u ani zamkniętego stanu kariery.
 * Wczytać po danych klubów i przed 10-polska-kariera-core.js.
 */
(function (global) {
  'use strict';

  const CUP_BY_CONFEDERATION=Object.freeze({
    UEFA:'EURO',
    CAF:'AFCON',
    AFC:'ASIAN_CUP',
    CONCACAF:'GOLD_CUP',
    CONMEBOL:'COPA_AMERICA',
    OFC:'OFC_NATIONS_CUP'
  });

  const TOURNAMENT_LABELS=Object.freeze({
    WORLD:'MUNDIAL',
    EURO:'EURO',
    AFCON:'PUCHAR NARODÓW AFRYKI',
    ASIAN_CUP:'PUCHAR AZJI',
    GOLD_CUP:'ZŁOTY PUCHAR CONCACAF',
    COPA_AMERICA:'COPA AMÉRICA',
    OFC_NATIONS_CUP:'PUCHAR NARODÓW OFC'
  });

  // Rok oznacza rok turnieju następujący po rozegranym sezonie klubowym.
  // EURO, Copa América i OFC są rozgrywane w latach parzystych; pozostałe
  // puchary kontynentalne w nieparzystych, dzięki czemu nie zderzają się
  // w tej samej turze kariery z mundialem.
  const SCHEDULE=Object.freeze({
    WORLD:Object.freeze({first:2030,interval:4}),
    EURO:Object.freeze({first:2028,interval:4}),
    AFCON:Object.freeze({first:2027,interval:2}),
    ASIAN_CUP:Object.freeze({first:2027,interval:4}),
    GOLD_CUP:Object.freeze({first:2027,interval:2}),
    COPA_AMERICA:Object.freeze({first:2028,interval:4}),
    OFC_NATIONS_CUP:Object.freeze({first:2028,interval:4})
  });

  function confederation(team) {
    if(!team)return null;
    if(team.name==='Australia')return 'AFC';
    if(team.zone==='Europa')return 'UEFA';
    if(team.zone==='Afryka')return 'CAF';
    if(team.zone==='Azja')return 'AFC';
    if(team.zone==='Ameryka Południowa')return 'CONMEBOL';
    if(team.zone==='Ameryka Północna'||team.zone==='Ameryka Środkowa')return 'CONCACAF';
    return 'OFC';
  }

  function continentalCup(team) {
    return CUP_BY_CONFEDERATION[confederation(team)]||null;
  }

  function tournamentYear(kind,seasonYear) {
    const spec=SCHEDULE[kind];
    const year=Number(seasonYear)+1;
    if(!spec||!Number.isFinite(year)||year<spec.first)return null;
    return (year-spec.first)%spec.interval===0?year:null;
  }

  function representedCountry(state) {
    return state?.seniorNationalCountry||state?.representedCountry||'Polska';
  }

  function evaluateOffer({state,team,club,isTopDivision}) {
    const seasons=Array.isArray(state?.careerSeasons)?state.careerSeasons:[];
    const country=club?.country||null;
    const fail=reason=>({eligible:false,reason,country,team:team||null});

    if(!state||!club||!country||!team)return fail('NO_COUNTRY_TEAM');
    if(state.naturalizationOfferUsed)return fail('OFFER_ALREADY_USED');
    if(state.naturalized||representedCountry(state)!=='Polska')return fail('ALREADY_COMMITTED');
    if((state.nationalCaps||0)>0)return fail('SENIOR_CAPS');
    if(!(Number(team.baseOvr)<75))return fail('TEAM_OVR_TOO_HIGH');
    if(!isTopDivision)return fail('NOT_TOP_DIVISION');

    const current=seasons[seasons.length-1];
    if(!current||current.country!==country)return fail('CURRENT_SEASON_COUNTRY');
    if((current.gradeIndex??-1)<7)return fail('LAST_SEASON_NOT_OUTSTANDING');

    const lastThree=seasons.slice(-3);
    if(lastThree.length<3)return fail('LESS_THAN_THREE_SEASONS');
    if(lastThree.some(season=>season.country!==country))return fail('COUNTRY_STREAK_BROKEN');
    if(lastThree.some((season,index)=>index>0&&season.year!==lastThree[index-1].year+1))return fail('SEASONS_NOT_CONSECUTIVE');

    return {
      eligible:true,
      reason:null,
      country,
      team,
      seasons:lastThree.map(season=>season.year),
      teamOvr:team.baseOvr
    };
  }

  function reserveOffer(state) {
    if(!state||state.naturalizationOfferUsed)return false;
    state.naturalizationOfferUsed=true;
    return true;
  }

  function acceptOffer(state,country) {
    if(!state||!country)return false;
    if(state.seniorNationalCountry&&state.seniorNationalCountry!==country)return false;
    state.naturalizationOfferUsed=true;
    state.naturalized=true;
    state.representedCountry=country;
    state.national='—';
    return true;
  }

  global.PPSNaturalization=Object.freeze({
    version:'1.64',
    SCHEDULE,
    TOURNAMENT_LABELS,
    confederation,
    continentalCup,
    tournamentYear,
    representedCountry,
    evaluateOffer,
    reserveOffer,
    acceptOffer
  });
})(typeof window!=='undefined'?window:globalThis);


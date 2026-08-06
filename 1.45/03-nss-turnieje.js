/*
 * NSS — eliminacje i turnieje reprezentacji wszystkich konfederacji.
 * Moduł nie zna głównego stanu kariery ani DOM-u.
 *
 * Zależność: 01-nss-dane-reprezentacji.js
 */
(function (global) {
  'use strict';

  if (!global.NSSNationalData) {
    throw new Error('Najpierw załaduj 01-nss-dane-reprezentacji.js');
  }

  const DATA=global.NSSNationalData;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const GROUP_PAIRS=[[[0,3],[1,2]],[[0,2],[3,1]],[[0,1],[2,3]]];
  const TOURNAMENT_SPECS=Object.freeze({
    WORLD:{expected:48,groupCount:12,thirdAdvanceCount:8,knockoutSize:32,confederation:null},
    EURO:{expected:24,groupCount:6,thirdAdvanceCount:4,knockoutSize:16,confederation:'UEFA'},
    AFCON:{expected:24,groupCount:6,thirdAdvanceCount:4,knockoutSize:16,confederation:'CAF'},
    ASIAN_CUP:{expected:24,groupCount:6,thirdAdvanceCount:4,knockoutSize:16,confederation:'AFC'},
    GOLD_CUP:{expected:16,groupCount:4,thirdAdvanceCount:0,knockoutSize:8,confederation:'CONCACAF'},
    // Dziesięć kadr CONMEBOL ma miejsce automatyczne, a stawkę uzupełnia
    // sześciu gości CONCACAF. Cztery grupy po cztery zachowują czytelny
    // przebieg turnieju i współczesny, szesnastozespołowy format.
    COPA_AMERICA:{expected:16,groupCount:4,thirdAdvanceCount:0,knockoutSize:8,allowedConfederations:['CONMEBOL','CONCACAF']},
    OFC_NATIONS_CUP:{expected:8,groupCount:2,thirdAdvanceCount:0,knockoutSize:4,confederation:'OFC'}
  });

  function createEngine(options={}) {
    const random=options.random||Math.random;
    const rand=(a,b)=>Math.floor(random()*(b-a+1))+a;
    const pick=arr=>arr[Math.floor(random()*arr.length)];
    const shuffle=arr=>{
      const out=arr.slice();
      for(let i=out.length-1;i>0;i--){
        const j=Math.floor(random()*(i+1));
        [out[i],out[j]]=[out[j],out[i]];
      }
      return out;
    };
    const poisson=lambda=>{
      if(lambda<=0) return 0;
      const limit=Math.exp(-lambda);
      let k=0,p=1;
      do{k++;p*=random();}while(p>limit&&k<60);
      return k-1;
    };
    const byName=new Map(DATA.teams.map(team=>[team.name,team]));

    function rankQualificationPool(teams,spreadA=12,spreadB=8) {
      return teams.map(team=>({
        team,
        score:team.baseOvr+rand(-spreadA,spreadA)+rand(-spreadB,spreadB),
        tie:random()
      })).sort((a,b)=>b.score-a.score||b.team.baseOvr-a.team.baseOvr||b.tie-a.tie);
    }

    function confederation(team) {
      if(team.name==='Australia') return 'AFC';
      if(team.zone==='Europa') return 'UEFA';
      if(team.zone==='Afryka') return 'CAF';
      if(team.zone==='Azja') return 'AFC';
      if(team.zone==='Ameryka Południowa') return 'CONMEBOL';
      if(team.zone==='Ameryka Północna'||team.zone==='Ameryka Środkowa') return 'CONCACAF';
      return 'OFC';
    }

    function qualificationChance(kind,teamOrOvr,confederationOverride=null) {
      const team=typeof teamOrOvr==='object'&&teamOrOvr?teamOrOvr:null;
      const fixed=team&&global.PPSNationalQualificationChances?.chance?.(kind,team.name);
      if(Number.isFinite(fixed))return clamp(Math.round(fixed),0,100);
      const ovr=Number(team?team.baseOvr:teamOrOvr);
      const confed=confederationOverride||(team?confederation(team):null);
      const model=DATA.config.qualificationModels?.[kind]?.[confed];
      if(!model||!Number.isFinite(ovr))return 0;
      if(model.automatic)return 100;
      return clamp(
        Math.round(50+(ovr-model.referenceOvr)*model.perOvr),
        Number.isFinite(model.min)?model.min:0,
        Number.isFinite(model.max)?model.max:100
      );
    }

    function rollQualification(kind,teamOrOvr,confederationOverride=null) {
      const chance=qualificationChance(kind,teamOrOvr,confederationOverride);
      const roll=rand(1,100);
      return {kind,chance,roll,qualified:roll<=chance};
    }

    function playoffWinner(a,b) {
      const chanceA=clamp(Math.round(50+(a.baseOvr-b.baseOvr)*2.5),18,82);
      return rand(1,100)<=chanceA?a:b;
    }

    // Baraż FIFA 2026: dwie ścieżki po trzy zespoły. CAF i AFC są
    // rozstawione w finałach, a pozostali uczestnicy grają półfinały.
    function resolveWorldPlayoff(playoffCandidates) {
      const grouped={AFC:[],CAF:[],CONCACAF:[],CONMEBOL:[],OFC:[]};
      playoffCandidates.forEach(team=>grouped[confederation(team)]?.push(team));
      const path1Semi=playoffWinner(grouped.OFC[0],grouped.CONCACAF[0]);
      const path2Semi=playoffWinner(grouped.CONMEBOL[0],grouped.CONCACAF[1]);
      return {
        paths:[
          {number:1,semifinal:[grouped.OFC[0],grouped.CONCACAF[0]],seeded:grouped.CAF[0],semifinalWinner:path1Semi},
          {number:2,semifinal:[grouped.CONMEBOL[0],grouped.CONCACAF[1]],seeded:grouped.AFC[0],semifinalWinner:path2Semi}
        ],
        winners:[playoffWinner(grouped.CAF[0],path1Semi),playoffWinner(grouped.AFC[0],path2Semi)]
      };
    }

    function worldQualificationRoute(teamOrName,chanceOverride=null,rollOverride=null) {
      const team=typeof teamOrName==='string'?byName.get(teamOrName):teamOrName;
      if(!team)throw new Error('Nieznana reprezentacja w eliminacjach mundialu.');
      const confed=confederation(team);
      const chance=clamp(Math.round(Number.isFinite(chanceOverride)
        ?chanceOverride:qualificationChance('WORLD',team)),0,100);
      const roll=Number.isFinite(rollOverride)?clamp(Math.round(rollOverride),1,100):rand(1,100);
      if(confed==='UEFA')return {confederation:confed,chance,roll,outcome:roll<=chance?'DIRECT':'OUT',window:0};
      const baseWindows={AFC:8,CAF:7,CONCACAF:12,CONMEBOL:10,OFC:20};
      const window=Math.min(baseWindows[confed]||0,chance,100-chance);
      const directLimit=chance-window;
      const playoffLimit=chance+window;
      const outcome=roll<=directLimit?'DIRECT':roll<=playoffLimit?'PLAYOFF':'OUT';
      return {confederation:confed,chance,roll,outcome,window,directLimit,playoffLimit};
    }

    function qualifyEuro(forceTeamName=null) {
      const europe=DATA.teams.filter(team=>team.zone==='Europa');
      const ranking=rankQualificationPool(europe,14,9);
      const polandEntry=ranking.find(entry=>entry.team.name==='Polska');
      let direct=ranking.slice(0,24);
      const forced=forceTeamName?ranking.find(entry=>entry.team.name===forceTeamName):null;
      if(forced&&!direct.some(entry=>entry.team.name===forceTeamName)){
        direct=ranking.filter(entry=>entry.team.name!==forceTeamName).slice(0,23).concat(forced);
      }
      return {
        kind:'EURO',
        teams:direct.map(entry=>entry.team),
        qualifiedTeamNames:direct.map(entry=>entry.team.name),
        polandQualified:direct.some(entry=>entry.team.name==='Polska'),
        polandRank:ranking.indexOf(polandEntry)+1,
        polandScore:polandEntry.score,
        ranking
      };
    }

    function qualifyWorld(forceTeamName=null) {
      const pools={UEFA:[],AFC:[],CAF:[],CONCACAF:[],CONMEBOL:[],OFC:[]};
      DATA.teams.forEach(team=>pools[confederation(team)].push(team));
      const directTeams=[],playoffCandidates=[],rankings={};
      let polandRank=null,polandScore=null;

      Object.keys(DATA.config.worldSlots).forEach(confed=>{
        const spec=DATA.config.worldSlots[confed];
        const ranking=confed==='UEFA'
          ? rankQualificationPool(pools[confed],18,12)
          : rankQualificationPool(pools[confed]);
        rankings[confed]=ranking;

        if(confed==='UEFA'){
          const polandEntry=ranking.find(entry=>entry.team.name==='Polska');
          polandRank=ranking.indexOf(polandEntry)+1;
          polandScore=polandEntry.score;
          let direct=ranking.slice(0,spec.direct);
          directTeams.push(...direct.map(entry=>entry.team));
        } else {
          directTeams.push(...ranking.slice(0,spec.direct).map(entry=>entry.team));
          playoffCandidates.push(...ranking
            .slice(spec.direct,spec.direct+spec.playoff).map(entry=>entry.team));
        }
      });

      const playoff=resolveWorldPlayoff(playoffCandidates);
      const playoffWinners=playoff.winners;
      let teams=directTeams.concat(playoffWinners);
      const forced=forceTeamName?byName.get(forceTeamName):null;
      if(forced&&!teams.some(team=>team.name===forceTeamName)){
        const forcedConfed=confederation(forced);
        let replaceIndex=-1;
        for(let i=teams.length-1;i>=0;i--){
          if(confederation(teams[i])===forcedConfed){replaceIndex=i;break;}
        }
        if(replaceIndex>=0)teams=teams.map((team,index)=>index===replaceIndex?forced:team);
      }

      return {
        kind:'WORLD',
        teams,
        qualifiedTeamNames:teams.map(team=>team.name),
        polandQualified:teams.some(team=>team.name==='Polska'),
        polandRank,
        polandScore,
        rankings,
        directTeams,
        playoffCandidates,
        playoffWinners,
        playoffPaths:playoff.paths
      };
    }

    function createWorldPlayoffRoute(controlledTeamName) {
      const controlled=byName.get(controlledTeamName);
      if(!controlled)throw new Error(`Nieznana reprezentacja: ${controlledTeamName}.`);
      const controlledConfed=confederation(controlled);
      if(controlledConfed==='UEFA')throw new Error('UEFA nie uczestniczy w barażu interkontynentalnym.');
      const generated=qualifyWorld();
      const grouped={AFC:[],CAF:[],CONCACAF:[],CONMEBOL:[],OFC:[]};
      generated.playoffCandidates.forEach(team=>grouped[confederation(team)].push(team));
      const concaPath=controlledConfed==='CONCACAF'?rand(0,1):null;
      if(controlledConfed==='CONCACAF'){
        const other=grouped.CONCACAF.find(team=>team.name!==controlled.name);
        grouped.CONCACAF=concaPath===0?[controlled,other]:[other,controlled];
      }
      else grouped[controlledConfed][0]=controlled;
      const routes=[
        {number:1,semi:[grouped.OFC[0],grouped.CONCACAF[0]],seeded:grouped.CAF[0]},
        {number:2,semi:[grouped.CONMEBOL[0],grouped.CONCACAF[1]],seeded:grouped.AFC[0]}
      ];
      const selected=controlledConfed==='CONCACAF'
        ?routes[concaPath]
        :routes.find(route=>route.semi.includes(controlled)||route.seeded===controlled);
      if(!selected)throw new Error('Nie udało się utworzyć ścieżki barażowej.');
      let stages;
      if(selected.seeded===controlled){
        const semifinalWinner=playoffWinner(selected.semi[0],selected.semi[1]);
        stages=[{key:'FINAL',label:'FINAŁ BARAŻU',opponent:semifinalWinner}];
      }else{
        const semifinalOpponent=selected.semi.find(team=>team!==controlled);
        stages=[
          {key:'SEMIFINAL',label:'PÓŁFINAŁ BARAŻU',opponent:semifinalOpponent},
          {key:'FINAL',label:'FINAŁ BARAŻU',opponent:selected.seeded}
        ];
      }
      return {
        format:'FIFA_2026',path:selected.number,controlledTeamName,controlledConfederation:controlledConfed,
        stages:stages.map(stage=>({
          key:stage.key,label:stage.label,
          opponentName:stage.opponent.name,
          opponentConfederation:confederation(stage.opponent),
          opponentBaseOvr:stage.opponent.baseOvr
        }))
      };
    }

    function qualifyAsianCup(forceTeamName=null) {
      const asia=DATA.teams.filter(team=>confederation(team)==='AFC');
      const ranking=rankQualificationPool(asia,14,9);
      let direct=ranking.slice(0,24);
      const forced=forceTeamName?ranking.find(entry=>entry.team.name===forceTeamName):null;
      if(forced&&!direct.some(entry=>entry.team.name===forceTeamName)){
        direct=ranking.filter(entry=>entry.team.name!==forceTeamName).slice(0,23).concat(forced);
      }
      return {
        kind:'ASIAN_CUP',teams:direct.map(entry=>entry.team),
        qualifiedTeamNames:direct.map(entry=>entry.team.name),ranking
      };
    }

    function qualifyRegional(kind,confed,count,forceTeamName=null) {
      const pool=DATA.teams.filter(team=>confederation(team)===confed);
      const ranking=rankQualificationPool(pool,14,9);
      let direct=ranking.slice(0,count);
      const forced=forceTeamName?ranking.find(entry=>entry.team.name===forceTeamName):null;
      if(forced&&!direct.some(entry=>entry.team.name===forceTeamName)){
        direct=ranking.filter(entry=>entry.team.name!==forceTeamName).slice(0,count-1).concat(forced);
      }
      return {kind,teams:direct.map(entry=>entry.team),qualifiedTeamNames:direct.map(entry=>entry.team.name),ranking};
    }

    function qualifyCopaAmerica() {
      const south=DATA.teams.filter(team=>confederation(team)==='CONMEBOL');
      const guests=rankQualificationPool(DATA.teams.filter(team=>confederation(team)==='CONCACAF'),12,8)
        .slice(0,6).map(entry=>entry.team);
      const teams=shuffle(south.concat(guests));
      return {kind:'COPA_AMERICA',teams,qualifiedTeamNames:teams.map(team=>team.name),automaticTeamNames:south.map(team=>team.name)};
    }

    function qualifyOfcNationsCup(forceTeamName=null) {
      const newZealand=byName.get('Nowa Zelandia');
      const others=DATA.teams.filter(team=>confederation(team)==='OFC'&&team.name!=='Nowa Zelandia');
      // OFC ma w bazie 11 kadr. Nowa Zelandia gra zawsze, a spośród
      // pozostałych dziesięciu losujemy siedem. Cztery drużyny odpadają
      // później w dwóch grupach turnieju (po dwie z każdej grupy).
      let selected=[newZealand,...shuffle(others).slice(0,7)].filter(Boolean);
      if(forceTeamName&&forceTeamName!=='Nowa Zelandia'&&!selected.some(team=>team.name===forceTeamName)){
        const forced=byName.get(forceTeamName);
        if(forced&&confederation(forced)==='OFC')selected[selected.length-1]=forced;
      }
      selected=shuffle(selected);
      return {
        kind:'OFC_NATIONS_CUP',teams:selected,
        qualifiedTeamNames:selected.map(team=>team.name),
        guaranteedTeamName:'Nowa Zelandia'
      };
    }

    function qualify(kind,settings={}) {
      const forced=settings.forceTeamName||(settings.forcePoland?'Polska':null);
      if(kind==='WORLD')return qualifyWorld(forced);
      if(kind==='EURO')return qualifyEuro(forced);
      if(kind==='AFCON')return qualifyRegional(kind,'CAF',24,forced);
      if(kind==='ASIAN_CUP')return qualifyAsianCup(settings.forceTeamName||null);
      if(kind==='GOLD_CUP')return qualifyRegional(kind,'CONCACAF',16,forced);
      if(kind==='COPA_AMERICA')return qualifyCopaAmerica();
      if(kind==='OFC_NATIONS_CUP')return qualifyOfcNationsCup(settings.forceTeamName||null);
      throw new Error(`Nieznany turniej: ${kind}.`);
    }

    function assertTournamentField(kind,teams,stage){
      const spec=TOURNAMENT_SPECS[kind];
      if(!spec)throw new Error(`Nieznany turniej: ${kind}.`);
      if(!spec.confederation&&!spec.allowedConfederations)return;
      const outsider=(teams||[]).find(team=>spec.confederation
        ?confederation(team)!==spec.confederation
        :!spec.allowedConfederations.includes(confederation(team)));
      if(outsider)throw new Error(`${kind} ${stage||'turniej'}: reprezentacja z niewłaściwej konfederacji — ${outsider.name}.`);
    }

    function createField(kind,qualifiedTeamNames=null,controlledTeamName='Polska') {
      const spec=TOURNAMENT_SPECS[kind];
      if(!spec)throw new Error(`Nieznany turniej: ${kind}.`);
      const expected=spec.expected;
      let selected=Array.isArray(qualifiedTeamNames)
        ? qualifiedTeamNames.map(name=>byName.get(name)).filter(Boolean)
        : [];
      // Stare lub uszkodzone zapisy mogły zawierać prawidłową liczbę nazw,
      // ale pomieszaną pulę turniejów. Sam komplet 24 drużyn nie wystarcza:
      // na EURO każda z nich musi należeć do europejskiej puli danych.
      const invalidTeam=selected.some(team=>spec.confederation
        ?confederation(team)!==spec.confederation
        :spec.allowedConfederations&&!spec.allowedConfederations.includes(confederation(team)));
      if(selected.length!==expected||!selected.some(team=>team.name===controlledTeamName)||invalidTeam){
        selected=qualify(kind,{
          forcePoland:controlledTeamName==='Polska',
          forceTeamName:controlledTeamName
        }).teams;
      }
      assertTournamentField(kind,selected,'lista uczestników');
      const controlledBase=byName.get(controlledTeamName)?.baseOvr||85;
      const golden=controlledTeamName==='Polska'&&random()<DATA.config.goldenGenerationChance/100;
      const controlledStrength=golden
        ? pick(DATA.config.goldenGenerationOvr)
        : rand(controlledBase-DATA.config.tournamentFormSpread,controlledBase+DATA.config.tournamentFormSpread);
      return selected.map(team=>({
        name:team.name,
        zone:team.zone,
        tier:team.tier,
        baseOvr:team.baseOvr,
        strength:team.name===controlledTeamName
          ? controlledStrength
          : rand(team.range[0],team.range[1]),
        isPoland:team.name===controlledTeamName,
        goldenGeneration:team.name===controlledTeamName&&golden
      }));
    }

    function resolveAbstractMatch(strengthA,strengthB) {
      const diff=strengthA-strengthB;
      const swing=clamp(diff/16,-1.3,1.3);
      return {
        gf:poisson(Math.max(.18,1.30+swing*.85)),
        ga:poisson(Math.max(.18,1.30-swing*.85))
      };
    }

    function buildFixtures(teams) {
      return GROUP_PAIRS.map(round=>round.map(([i,j])=>[teams[i],teams[j]]));
    }

    function recordResult(standings,a,b,gfA,gfB) {
      const sa=standings[a.name],sb=standings[b.name];
      sa.played++;sb.played++;
      sa.gf+=gfA;sa.ga+=gfB;sb.gf+=gfB;sb.ga+=gfA;
      if(gfA>gfB)sa.pts+=3;
      else if(gfA<gfB)sb.pts+=3;
      else{sa.pts++;sb.pts++;}
    }

    function rankStandings(standings) {
      return Object.values(standings).sort((a,b)=>
        b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||
        (a.team.name<b.team.name?-1:1)
      );
    }

    function assignWorldGroups(field,groupCount) {
      const sorted=field.slice().sort((a,b)=>b.strength-a.strength);
      const pots=Array.from({length:4},(_,i)=>sorted.slice(i*groupCount,(i+1)*groupCount));
      const names=Array.from({length:groupCount},(_,i)=>String.fromCharCode(65+i));
      const allowed=(groups,team,index)=>{
        const same=groups[index].filter(other=>confederation(other)===confederation(team)).length;
        return same<(confederation(team)==='UEFA'?2:1);
      };
      function placePot(groups,teams,index=0,used=new Set()){
        if(index===teams.length)return true;
        const team=teams[index];
        const candidates=shuffle(names.map((_,i)=>i).filter(i=>!used.has(i)&&allowed(groups,team,i)));
        for(const groupIndex of candidates){
          groups[groupIndex].push(team);used.add(groupIndex);
          if(placePot(groups,teams,index+1,used))return true;
          used.delete(groupIndex);groups[groupIndex].pop();
        }
        return false;
      }
      for(let attempt=0;attempt<500;attempt++){
        const groups=Array.from({length:groupCount},()=>[]);
        let valid=true;
        for(const pot of pots){
          if(!placePot(groups,shuffle(pot))){valid=false;break;}
        }
        if(valid&&groups.every(group=>group.some(team=>confederation(team)==='UEFA'))){
          return {groups:Object.fromEntries(names.map((name,i)=>[name,groups[i]])),groupNames:names};
        }
      }
      throw new Error('Nie udało się rozlosować grup mundialu zgodnie z limitami konfederacji.');
    }

    function assignGroups(kind,field,groupCount) {
      if(kind==='WORLD')return assignWorldGroups(field,groupCount);
      const sorted=field.slice().sort((a,b)=>b.strength-a.strength);
      const pots=Array.from({length:4},(_,i)=>sorted.slice(i*groupCount,(i+1)*groupCount));
      const names=Array.from({length:groupCount},(_,i)=>String.fromCharCode(65+i));
      const groups=Object.fromEntries(names.map(name=>[name,[]]));
      pots.forEach(pot=>shuffle(pot).forEach((team,i)=>groups[names[i]].push(team)));
      return {groups,groupNames:names};
    }

    function createGroupStage(kind,field) {
      assertTournamentField(kind,field,'faza grupowa');
      const spec=TOURNAMENT_SPECS[kind];
      const groupCount=spec.groupCount;
      const thirdAdvanceCount=spec.thirdAdvanceCount;
      const {groups,groupNames}=assignGroups(kind,field,groupCount);
      const polandGroup=groupNames.find(name=>groups[name].some(team=>team.isPoland));
      const fixtures={},results={},standings={},prepared=new Set(),recorded=new Set();

      groupNames.forEach(name=>{
        fixtures[name]=buildFixtures(groups[name]);
        results[name]=[[],[],[]];
        standings[name]={};
        groups[name].forEach(team=>{
          standings[name][team.name]={team,pts:0,gf:0,ga:0,played:0};
        });
      });

      function prepareRound(roundIndex) {
        if(roundIndex<0||roundIndex>2) throw new Error('Kolejka musi być od 0 do 2.');
        if(!prepared.has(roundIndex)){
          groupNames.forEach(group=>{
            fixtures[group][roundIndex].forEach(([a,b])=>{
              if(a.isPoland||b.isPoland)return;
              const score=resolveAbstractMatch(a.strength,b.strength);
              recordResult(standings[group],a,b,score.gf,score.ga);
              results[group][roundIndex].push({a,b,...score});
            });
          });
          prepared.add(roundIndex);
        }
        const pair=fixtures[polandGroup][roundIndex].find(([a,b])=>a.isPoland||b.isPoland);
        const [a,b]=pair;
        return {
          roundIndex,
          a,b,
          poland:a.isPoland?a:b,
          opponent:a.isPoland?b:a
        };
      }

      function recordPolandMatch(roundIndex,polandScore) {
        if(recorded.has(roundIndex)) throw new Error('Wynik Polski w tej kolejce już zapisano.');
        const fixture=prepareRound(roundIndex);
        const gfA=fixture.a.isPoland?polandScore.gf:polandScore.ga;
        const gfB=fixture.a.isPoland?polandScore.ga:polandScore.gf;
        recordResult(standings[polandGroup],fixture.a,fixture.b,gfA,gfB);
        results[polandGroup][roundIndex].push({a:fixture.a,b:fixture.b,gf:gfA,ga:gfB});
        recorded.add(roundIndex);
      }

      function finish() {
        if(recorded.size!==3) throw new Error('Najpierw rozegraj trzy mecze Polski.');
        const rankings={};
        groupNames.forEach(name=>rankings[name]=rankStandings(standings[name]));
        const allThirds=thirdAdvanceCount?groupNames.map(group=>({...rankings[group][2],group}))
          .sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||
            (a.team.name<b.team.name?-1:1)):[];
        const bestThirds=thirdAdvanceCount?allThirds.slice(0,thirdAdvanceCount):[];
        const qualifiedTeams=[];
        groupNames.forEach(group=>{
          rankings[group].slice(0,2).forEach((row,index)=>qualifiedTeams.push({
            ...row.team,
            group,
            groupPosition:index+1,
            groupPts:row.pts,
            groupGf:row.gf,
            groupGa:row.ga
          }));
        });
        bestThirds.forEach(row=>qualifiedTeams.push({
          ...row.team,
          group:row.group,
          groupPosition:3,
          groupPts:row.pts,
          groupGf:row.gf,
          groupGa:row.ga
        }));
        const polandTable=rankings[polandGroup];
        const polandRow=polandTable.find(row=>row.team.isPoland);
        const polandPosition=polandTable.indexOf(polandRow)+1;
        return {
          kind,groups,groupNames,polandGroup,standings,rankings,results,
          allThirds,bestThirds,qualifiedTeams,polandRow,polandPosition,
          polandQualified:qualifiedTeams.some(team=>team.isPoland)
        };
      }

      return {
        kind,groups,groupNames,polandGroup,standings,results,
        prepareRound,recordPolandMatch,
        getPolandTable:()=>rankStandings(standings[polandGroup]),
        getRoundResults:index=>results[polandGroup][index].slice(),
        finish
      };
    }

    function compareSeeds(a,b) {
      return a.groupPosition-b.groupPosition||
        b.groupPts-a.groupPts||
        ((b.groupGf-b.groupGa)-(a.groupGf-a.groupGa))||
        b.groupGf-a.groupGf||(a.name<b.name?-1:1);
    }

    function buildInitialRound(qualifiedTeams) {
      const ordered=qualifiedTeams.slice().sort(compareSeeds);
      const half=ordered.length/2;
      const seededBase=ordered.slice(0,half);
      const unseededBase=ordered.slice(half);
      for(let attempt=0;attempt<200;attempt++){
        const seeded=shuffle(seededBase),available=shuffle(unseededBase),matches=[];
        let valid=true;
        for(const a of seeded){
          const candidates=available.filter(b=>b.group!==a.group);
          if(!candidates.length){valid=false;break;}
          const b=pick(candidates);
          available.splice(available.indexOf(b),1);
          matches.push({a,b,result:null,winner:null});
        }
        if(valid)return matches;
      }
      throw new Error('Nie udało się utworzyć drabinki bez rewanżu grupowego.');
    }

    function resolveKnockoutMatch(a,b) {
      let {gf,ga}=resolveAbstractMatch(a.strength,b.strength);
      let extra=false,penalties=false;
      if(gf===ga){
        extra=true;
        const diff=(a.strength-b.strength)/22;
        gf+=poisson(Math.max(.08,.32+diff*.22));
        ga+=poisson(Math.max(.08,.32-diff*.22));
      }
      if(gf===ga){
        penalties=true;
        const chanceA=clamp(.5+(a.strength-b.strength)/260,.36,.64);
        if(random()<chanceA)gf++;else ga++;
      }
      return {gf,ga,extra,penalties};
    }

    function roundName(size) {
      if(size===32)return '1/16 FINAŁU';
      if(size===16)return '1/8 FINAŁU';
      if(size===8)return 'ĆWIERĆFINAŁ';
      if(size===4)return 'PÓŁFINAŁ';
      return 'FINAŁ';
    }

    function simulateRemainder(resolvedMatches) {
      let winners=resolvedMatches.map(match=>match.winner);
      const rounds=[];
      while(winners.length>1){
        const matches=[];
        for(let i=0;i<winners.length;i+=2){
          const match={a:winners[i],b:winners[i+1],result:null,winner:null};
          match.result=resolveKnockoutMatch(match.a,match.b);
          match.winner=match.result.gf>match.result.ga?match.a:match.b;
          matches.push(match);
        }
        rounds.push({name:roundName(winners.length),matches});
        winners=matches.map(match=>match.winner);
      }
      return {champion:winners[0],rounds};
    }

    function createKnockout(kind,qualifiedTeams) {
      assertTournamentField(kind,qualifiedTeams,'faza pucharowa');
      let size=TOURNAMENT_SPECS[kind].knockoutSize;
      let matches=buildInitialRound(qualifiedTeams);
      let resolved=false,finished=false;

      function getPolandMatch() {
        return matches.find(match=>match.a.isPoland||match.b.isPoland)||null;
      }

      function resolveRound(polandResult) {
        if(finished)throw new Error('Turniej jest zakończony.');
        if(resolved)throw new Error('Ta runda została już rozstrzygnięta.');
        const polandMatch=getPolandMatch();
        if(!polandMatch)throw new Error('Polska nie znajduje się w aktywnej rundzie.');
        const result=polandMatch.a.isPoland
          ? {
              gf:polandResult.gf,ga:polandResult.ga,
              matchGf:polandResult.matchGf??polandResult.gf,matchGa:polandResult.matchGa??polandResult.ga,
              extra:!!polandResult.extra,penalties:!!polandResult.penalties,
              penaltyScore:polandResult.penaltyScore?{...polandResult.penaltyScore}:null
            }
          : {
              gf:polandResult.ga,ga:polandResult.gf,
              matchGf:polandResult.matchGa??polandResult.ga,matchGa:polandResult.matchGf??polandResult.gf,
              extra:!!polandResult.extra,penalties:!!polandResult.penalties,
              penaltyScore:polandResult.penaltyScore?{home:polandResult.penaltyScore.away,away:polandResult.penaltyScore.home}:null
            };
        polandMatch.result=result;
        polandMatch.winner=result.gf>result.ga?polandMatch.a:polandMatch.b;
        matches.forEach(match=>{
          if(match===polandMatch)return;
          match.result=resolveKnockoutMatch(match.a,match.b);
          match.winner=match.result.gf>match.result.ga?match.a:match.b;
        });
        resolved=true;
        const polandWon=polandMatch.winner.isPoland;
        if(!polandWon){
          const remainder=simulateRemainder(matches);
          finished=true;
          return {polandWon:false,finished:true,champion:remainder.champion,matches:matches.slice(),remainder};
        }
        if(size===2){
          finished=true;
          return {polandWon:true,finished:true,champion:polandMatch.winner,matches:matches.slice()};
        }
        return {polandWon:true,finished:false,matches:matches.slice()};
      }

      function advance() {
        if(finished)throw new Error('Turniej jest zakończony.');
        if(!resolved)throw new Error('Najpierw rozstrzygnij bieżącą rundę.');
        const winners=matches.map(match=>match.winner),next=[];
        for(let i=0;i<winners.length;i+=2){
          next.push({a:winners[i],b:winners[i+1],result:null,winner:null});
        }
        matches=next;
        size/=2;
        resolved=false;
        return {size,name:roundName(size),matches:matches.slice(),polandMatch:getPolandMatch()};
      }

      return {
        kind,
        getRound:()=>({size,name:roundName(size),matches:matches.slice(),resolved,finished}),
        getPolandMatch,
        resolveRound,
        advance
      };
    }

    return {
      qualify,
      createField,
      createGroupStage,
      createKnockout,
      resolveAbstractMatch,
      confederation,
      qualificationChance,
      rollQualification,
      worldQualificationRoute,
      createWorldPlayoffRoute,
      roundName,
      tournamentSpecs:TOURNAMENT_SPECS
    };
  }

  global.NSSTournamentEngine=Object.freeze({
    version:'1.45-world-playoff',
    createEngine
  });
})(typeof window !== 'undefined' ? window : globalThis);

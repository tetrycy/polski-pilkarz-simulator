/*
 * NSS — adapter do gry typu Polska Kariera.
 *
 * Ten plik jest jedynym miejscem, które powinno wymagać dopasowania
 * do nowszej wersji gry. Rdzenie 01–03 pozostają nietknięte.
 */
(function (global) {
  'use strict';

  function installPolskaKarieraNSS(host) {
    const state=()=>host.getState();
    const tournamentEngine=global.NSSTournamentEngine.createEngine();
    const matchEngine=global.NSSMatchEngine.createEngine();
    const naturalization=global.PPSNaturalization;
    let afterTournament=null;

    const representedCountry=()=>naturalization?.representedCountry(state())||state().representedCountry||'Polska';
    const tournamentLabel=kind=>naturalization?.TOURNAMENT_LABELS?.[kind]||kind;
    const tournamentIcon=kind=>kind==='WORLD'?'🌍':kind==='EURO'?'🇪🇺':'🏆';
    const titleForKind=kind=>({
      WORLD:'Mistrzostwo Świata',EURO:'Mistrzostwo Europy',AFCON:'Mistrzostwo Afryki',
      ASIAN_CUP:'Puchar Azji',GOLD_CUP:'Złoty Puchar CONCACAF',
      COPA_AMERICA:'Copa América',OFC_NATIONS_CUP:'Mistrzostwo Oceanii'
    }[kind]||tournamentLabel(kind));

    function simulatePlayerMatch(match,{forceUnavailable=false}={}){
      const s=state();
      const gf=Math.max(0,Number(match?.matchGf??match?.gf)||0);
      const ga=Math.max(0,Number(match?.matchGa??match?.ga)||0);
      const matchEnd=match?.extra?120:90;
      const reserve=s.status==='Rezerwowy';
      const appearanceChance=forceUnavailable?0:s.position==='GK'
        ?(reserve ? .10 : 1)
        :(reserve ? .44 : 1);
      const appeared=Math.random()<appearanceChance?1:0;
      if(!appeared){
        return {myAppearance:0,myEntryMinute:null,myExitMinute:null,myDismissalMinute:null,myMinutes:0,myGoals:0,myAssists:0,myGoalsConceded:0,myCleanSheet:0,mySaves:0,myYellowCards:0,myRedCards:0};
      }
      const entryMinute=reserve
        ?Math.min(matchEnd-1,Math.floor(50+Math.random()*28))
        :0;
      let exitMinute=matchEnd,dismissalMinute=null;
      let yellowCards=s.position==='GK'?0:(Math.random()<.12?1:0);
      let redCards=s.position==='GK'?0:(Math.random()<.012?1:0);
      if(redCards){
        dismissalMinute=Math.min(matchEnd-1,Math.max(entryMinute+1,Math.floor(entryMinute+8+Math.random()*Math.max(1,matchEnd-entryMinute-9))));
        exitMinute=dismissalMinute;
      }
      const quality=Math.max(.72,Math.min(1.35,.82+((s.overall||60)-60)*.018));
      const rates=s.position==='FWD'
        ? {goalShare:.25,assistShare:.13}
        : s.position==='MID'
          ? {goalShare:.10,assistShare:.23}
          : {goalShare:.025,assistShare:.055};
      if(s.position==='GK'){
        let goalsConceded=0;
        const share=Math.max(0,Math.min(1,(exitMinute-entryMinute)/matchEnd));
        for(let i=0;i<ga;i++)if(Math.random()<share)goalsConceded++;
        return {myAppearance:1,myEntryMinute:entryMinute,myExitMinute:exitMinute,myDismissalMinute:dismissalMinute,myMinutes:Math.max(0,exitMinute-entryMinute),myGoals:0,myAssists:0,myGoalsConceded:goalsConceded,myCleanSheet:goalsConceded===0?1:0,mySaves:Math.max(0,Math.round((exitMinute-entryMinute)/90*(2.5+(85-(s.overall||77))*.06))),myYellowCards:yellowCards,myRedCards:redCards};
      }
      let goals=0,assists=0;
      for(let i=0;i<gf;i++)if(Math.random()<Math.min(.58,rates.goalShare*quality))goals++;
      for(let i=0;i<gf-goals;i++)if(Math.random()<Math.min(.62,rates.assistShare*quality))assists++;
      return {myAppearance:1,myEntryMinute:entryMinute,myExitMinute:exitMinute,myDismissalMinute:dismissalMinute,myMinutes:Math.max(0,exitMinute-entryMinute),myGoals:goals,myAssists:assists,myGoalsConceded:0,myCleanSheet:0,mySaves:0,myYellowCards:yellowCards,myRedCards:redCards};
    }

    function simulateTournamentPlayerStats(matches){
      const s=state();
      const stats={appearances:0,minutes:0,goals:0,assists:0,goalsConceded:0,cleanSheets:0,saves:0,yellowCards:0,redCards:0};
      let suspension=Math.max(0,s.nationalSuspensionMatches||0);
      (matches||[]).forEach(match=>{
        const suspended=suspension>0;
        const player=simulatePlayerMatch(match,{forceUnavailable:suspended});
        if(suspended)suspension--;
        if(player.myRedCards)suspension=Math.max(suspension,1);
        stats.appearances+=player.myAppearance;
        stats.minutes+=player.myMinutes;
        stats.goals+=player.myGoals;
        stats.assists+=player.myAssists;
        stats.goalsConceded+=player.myGoalsConceded;
        stats.cleanSheets+=player.myCleanSheet;
        stats.saves+=player.mySaves;
        stats.yellowCards+=player.myYellowCards;
        stats.redCards+=player.myRedCards;
        Object.assign(match,{playerAppeared:!!player.myAppearance,...player});
      });
      s.nationalSuspensionMatches=suspension;
      return stats;
    }

    function resolveAutomaticKnockout(poland,opponent){
      const result=tournamentEngine.resolveAbstractMatch(poland.strength,opponent.strength);
      result.matchGf=result.gf;
      result.matchGa=result.ga;
      if(result.gf!==result.ga)return result;
      const chance=Math.max(.36,Math.min(.64,.5+(poland.strength-opponent.strength)/260));
      if(Math.random()<chance)result.gf++;
      else result.ga++;
      result.extra=true;
      result.penalties=true;
      return result;
    }

    function simulateNationalTournament(kind,qualifiedTeamNames,controlledTeamName=representedCountry()){
      const field=tournamentEngine.createField(kind,qualifiedTeamNames,controlledTeamName);
      const groups=tournamentEngine.createGroupStage(kind,field);
      const polandMatches=[];

      for(let round=0;round<3;round++){
        const fixture=groups.prepareRound(round);
        const result=tournamentEngine.resolveAbstractMatch(fixture.poland.strength,fixture.opponent.strength);
        groups.recordPolandMatch(round,result);
        polandMatches.push({
          phase:`GRUPA ${groups.polandGroup} • ${round+1}. KOLEJKA`,
          opponent:fixture.opponent.name,gf:result.gf,ga:result.ga,extra:false,penalties:false
        });
      }

      const groupResult=groups.finish();
      if(!groupResult.polandQualified){
        return {kind,champion:false,stage:'faza grupowa',tournamentChampion:null,field,groupResult,polandMatches};
      }

      const knockout=tournamentEngine.createKnockout(kind,groupResult.qualifiedTeams);
      while(true){
        const round=knockout.getRound();
        const match=knockout.getPolandMatch();
        const poland=match.a.isPoland?match.a:match.b;
        const opponent=match.a.isPoland?match.b:match.a;
        const result=resolveAutomaticKnockout(poland,opponent);
        const resolved=knockout.resolveRound(result);
        polandMatches.push({phase:round.name,opponent:opponent.name,gf:result.matchGf??result.gf,ga:result.matchGa??result.ga,extra:!!result.extra,penalties:!!result.penalties});
        if(resolved.finished){
          const champion=!!resolved.champion?.isPoland;
          return {
            kind,champion,
            stage:champion?titleForKind(kind).toUpperCase():round.name,
            tournamentChampion:resolved.champion?.name||null,
            field,groupResult,polandMatches
          };
        }
        knockout.advance();
      }
    }

    function recordTournamentResult(result,watched){
      const s=state();
      const pending=s.pendingTournament;
      const teamName=pending?.teamName||representedCountry();
      const isWorld=result.kind==='WORLD';
      const label=tournamentLabel(result.kind);

      const tournamentMatches=Number.isFinite(result.stats?.appearances)
        ?result.stats.appearances
        :(result.polandMatches||[]).length;
      const tournamentGoals=result.stats.goals||0;
      const tournamentConceded=s.position==='GK'?(result.stats.goalsConceded||0):0;
      const tournamentCleanSheets=s.position==='GK'?(result.stats.cleanSheets||0):0;
      s.nationalCaps=(s.nationalCaps||0)+tournamentMatches;
      s.nationalGoals=(s.nationalGoals||0)+tournamentGoals;
      s.seasonNationalCaps=(s.seasonNationalCaps||0)+tournamentMatches;
      s.seasonNationalGoals=(s.seasonNationalGoals||0)+tournamentGoals;
      s.nationalGoalsConceded=(s.nationalGoalsConceded||0)+tournamentConceded;
      s.nationalCleanSheets=(s.nationalCleanSheets||0)+tournamentCleanSheets;
      s.seasonNationalGoalsConceded=(s.seasonNationalGoalsConceded||0)+tournamentConceded;
      s.seasonNationalCleanSheets=(s.seasonNationalCleanSheets||0)+tournamentCleanSheets;
      const season=(s.careerSeasons||[])[(s.careerSeasons||[]).length-1];
      if(season && season.year===s.seasonYear){
        season.nationalCaps=(season.nationalCaps||0)+tournamentMatches;
        season.nationalGoals=(season.nationalGoals||0)+tournamentGoals;
        season.nationalGoalsConceded=(season.nationalGoalsConceded||0)+tournamentConceded;
        season.nationalCleanSheets=(season.nationalCleanSheets||0)+tournamentCleanSheets;
        const tournamentNote=s.position==='GK'?`${label} ${result.year}: ${tournamentMatches} M / ${tournamentConceded} SG / ${tournamentCleanSheets} CK`:`${label} ${result.year}: ${tournamentMatches} M / ${tournamentGoals} G`;
        season.note=season.note?`${season.note} • ${tournamentNote}`:tournamentNote;
      }
      s.score=(s.score||0)+Math.round((result.stats.goals||0)*4+(result.stats.assists||0)*3);
      if(result.champion){
        host.addTrophy(
          `${titleForKind(result.kind)} ${result.year} — ${teamName}`,
          isWorld?120:90
        );
      }

      const controlled=result.field.find(team=>team.isPoland);
      s.nationalTournamentHistory=s.nationalTournamentHistory||{};
      s.nationalTournamentHistory[result.kind]=s.nationalTournamentHistory[result.kind]||{};
      const previousEntry=s.nationalTournamentHistory?.[result.kind]?.[result.year]||{};
      const entry={
        qualified:true,
        teamName,
        kind:result.kind,
        qualificationRank:pending?.qualificationRank??previousEntry.qualificationRank??null,
        qualificationChance:pending?.qualificationChance??previousEntry.qualificationChance??null,
        qualRoll:pending?.qualRoll??previousEntry.qualRoll??null,
        qualifiedTeamNames:pending?.qualifiedTeamNames?.slice()||null,
        result:result.stage,
        text:`${tournamentIcon(result.kind)} ${label} ${result.year}: ${teamName} — ${result.stage}.`,
        watched:!!watched,
        simulated:!watched,
        myGoals:result.stats.goals||0,
        myAssists:result.stats.assists||0,
        myGoalsConceded:tournamentConceded,
        myCleanSheets:tournamentCleanSheets,
        mySaves:result.stats.saves||0,
        myMinutes:result.stats.minutes||0,
        myYellowCards:result.stats.yellowCards||0,
        myRedCards:result.stats.redCards||0,
        controlledStrength:controlled?.strength||null,
        polandStrength:controlled?.strength||null,
        goldenGeneration:!!controlled?.goldenGeneration,
        tournamentChampion:result.tournamentChampion||null,
        worldPlayoffMatches:(previousEntry.worldPlayoffMatches||[]).map(match=>({...match})),
        polandMatches:(result.polandMatches||[]).map(match=>({...match}))
      };
      s.nationalTournamentHistory[result.kind][result.year]=entry;
      // Zachowanie zgodności ze starszym profilem i zapisami Polski.
      if(teamName==='Polska'&&result.kind==='WORLD'){
        s.worldCupHistory=s.worldCupHistory||{};
        s.worldCupHistory[result.year]=entry;
      }
      if(teamName==='Polska'&&result.kind==='EURO'){
        s.euroHistory=s.euroHistory||{};
        s.euroHistory[result.year]=entry;
      }
      delete s.pendingTournament;
      host.log(
        `${label} ${result.year}: ${teamName} — ${result.stage}.`,
        `${watched?'turniej rozegrany':'wynik wylosowany'}${result.tournamentChampion?` • mistrz: ${result.tournamentChampion}`:''}`
      );
      host.render();
      return result;
    }

    const controller=global.NSSTournamentUI.createController({
      root:host.tournamentRoot||'#nssTournamentRoot',
      tournamentEngine,
      matchEngine,
      delays:host.uiDelays,
      getPlayer:()=>{
        const s=state();
        return {
          overall:s.overall,
          position:s.position,
          status:s.status,
          isCaptain:s.isCaptain,
          finishingBias:s.finishingBias,
          creativeBias:s.creativeBias,
          nextMinutesFactor:s.nextMinutesFactor,
          eventMultiplier:s.activePlayerEventMultiplier||1,
          name:s.name,
          teammates:Math.max(0,Math.min(100,Math.round(((s.loyalty||0)/15)*100)))
        };
      },
      getTeamPalette:({name,team,national,home})=>{
        const colours=global.PPS_COLOURS;
        if(!colours?.resolve)return null;
        if(national){
          return colours.resolve({name:`Reprezentacja: ${name}`,country:name});
        }
        const current=state().club;
        const target=home&&current?.name===name?current:team;
        if(!target||target.name!==name)return null;
        return colours.resolve(target);
      },
      getNationalSuspension:()=>Math.max(0,state().nationalSuspensionMatches||0),
      consumeNationalSuspension:()=>{
        const s=state();
        s.nationalSuspensionMatches=Math.max(0,(s.nationalSuspensionMatches||0)-1);
      },
      registerNationalRedCard:()=>{
        const s=state();
        s.nationalSuspensionMatches=Math.max(1,s.nationalSuspensionMatches||0);
      },
      applyPlayerPatch:patch=>{
        const s=state();
        if(Number.isFinite(patch.nextMinutesFactor)){
          s.nextMinutesFactor=Math.min(s.nextMinutesFactor||1,patch.nextMinutesFactor);
        }
      },
      log:(title,meta)=>host.log(title,meta),
      setHostVisible:visible=>host.setCareerVisible(visible),
      onTournamentComplete:result=>{
        recordTournamentResult(result,true);
        if(afterTournament){
          const done=afterTournament;
          afterTournament=null;
          done(result);
        }
      }
    });

    function qualificationYear(kind,seasonYear) {
      return naturalization?.tournamentYear(kind,seasonYear)||null;
    }

    function checkQualification(kind) {
      const s=state();
      const year=qualificationYear(kind,s.seasonYear);
      const teamName=representedCountry();
      if(!year||s.national!==teamName||!(s.seasonNationalCaps>0))return '';
      s.nationalTournamentHistory=s.nationalTournamentHistory||{};
      s.nationalTournamentHistory[kind]=s.nationalTournamentHistory[kind]||{};
      if(s.nationalTournamentHistory[kind][year])return s.nationalTournamentHistory[kind][year].text||'';

      const team=global.NSSNationalData.teams.find(candidate=>candidate.name===teamName);
      if(!team)return '';
      const qualificationRoll=tournamentEngine.rollQualification(kind,team);
      const worldRoute=kind==='WORLD'
        ?tournamentEngine.worldQualificationRoute(team,qualificationRoll.chance,qualificationRoll.roll)
        :null;
      const playoff=worldRoute?.outcome==='PLAYOFF';
      const qualified=kind==='WORLD'?worldRoute.outcome==='DIRECT':qualificationRoll.qualified;
      const label=tournamentLabel(kind);
      const icon=tournamentIcon(kind);
      const fieldQualification=qualified?tournamentEngine.qualify(kind,{forceTeamName:teamName}):null;
      const qualifiedTeamNames=fieldQualification?.qualifiedTeamNames?.slice()||null;
      let text;

      if(qualified){
        if(kind==='WORLD')s.worldCups=(s.worldCups||0)+1;
        else{
          s.continentalCups=(s.continentalCups||0)+1;
          if(kind==='EURO')s.euros=(s.euros||0)+1;
        }
        text=`${icon} ${label} ${year}: ${teamName} awansuje! Szansa ${qualificationRoll.chance}% • rzut ${qualificationRoll.roll}/100.`;
        s.pendingTournament={
          kind,year,teamName,qualRoll:qualificationRoll.roll,
          qualificationChance:qualificationRoll.chance,
          qualificationRank:null,
          qualifiedTeamNames
        };
      }else if(playoff){
        const route=tournamentEngine.createWorldPlayoffRoute(teamName);
        const homeStrength=Math.floor(Math.random()*(team.range[1]-team.range[0]+1))+team.range[0];
        route.stages=route.stages.map(stage=>{
          const opponent=global.NSSNationalData.teams.find(candidate=>candidate.name===stage.opponentName);
          const opponentStrength=opponent
            ?Math.floor(Math.random()*(opponent.range[1]-opponent.range[0]+1))+opponent.range[0]
            :stage.opponentBaseOvr;
          return {...stage,opponentStrength};
        });
        s.pendingWorldPlayoff={
          kind:'WORLD_PLAYOFF',year,teamName,
          qualRoll:qualificationRoll.roll,qualificationChance:qualificationRoll.chance,
          route,stageIndex:0,homeStrength,matches:[]
        };
        text=`🌐 Mundial ${year}: ${teamName} trafia do barażu interkontynentalnego! Szansa bazowa ${qualificationRoll.chance}% • rzut ${qualificationRoll.roll}/100.`;
      }else{
        text=`${icon} ${label} ${year}: ${teamName} nie awansuje. Szansa ${qualificationRoll.chance}% • rzut ${qualificationRoll.roll}/100.`;
      }
      const entry={
        qualified,
        teamName,
        kind,
        qualificationRank:null,
        qualificationChance:qualificationRoll.chance,
        qualRoll:qualificationRoll.roll,
        qualifiedTeamNames,
        pending:qualified,
        playoff,
        playoffPending:playoff,
        worldPlayoffMatches:[],
        text
      };
      s.nationalTournamentHistory[kind][year]=entry;
      if(teamName==='Polska'&&kind==='WORLD'){
        s.worldCupHistory=s.worldCupHistory||{};
        s.worldCupHistory[year]=entry;
      }
      if(teamName==='Polska'&&kind==='EURO'){
        s.euroHistory=s.euroHistory||{};
        s.euroHistory[year]=entry;
      }
      host.log(
        `${label} ${year}: ${teamName} ${qualified?'awansuje':playoff?'zagra w barażu':'nie awansuje'}.`,
        `Szansa ${qualificationRoll.chance}% • rzut ${qualificationRoll.roll}/100 • OVR ${team.baseOvr}`
      );
      return text;
    }

    function getPendingWorldPlayoffMatch(){
      const pending=state().pendingWorldPlayoff;
      if(!pending)return null;
      const stage=pending.route?.stages?.[pending.stageIndex];
      if(!stage)return null;
      return {
        year:pending.year,teamName:pending.teamName,path:pending.route.path,
        stageIndex:pending.stageIndex,stageCount:pending.route.stages.length,
        homeStrength:pending.homeStrength,
        ...stage
      };
    }

    function applyWorldPlayoffStats(result){
      const s=state();
      const appeared=Number.isFinite(result.myAppearance)?result.myAppearance:0;
      const goals=result.myGoals||0,assists=result.myAssists||0;
      const conceded=s.position==='GK'?(result.myGoalsConceded||0):0;
      const clean=s.position==='GK'?(result.myCleanSheet||0):0;
      s.nationalCaps=(s.nationalCaps||0)+appeared;
      s.nationalGoals=(s.nationalGoals||0)+goals;
      s.seasonNationalCaps=(s.seasonNationalCaps||0)+appeared;
      s.seasonNationalGoals=(s.seasonNationalGoals||0)+goals;
      s.nationalGoalsConceded=(s.nationalGoalsConceded||0)+conceded;
      s.nationalCleanSheets=(s.nationalCleanSheets||0)+clean;
      s.seasonNationalGoalsConceded=(s.seasonNationalGoalsConceded||0)+conceded;
      s.seasonNationalCleanSheets=(s.seasonNationalCleanSheets||0)+clean;
      s.score=(s.score||0)+goals*4+assists*3;
      const season=(s.careerSeasons||[])[(s.careerSeasons||[]).length-1];
      if(season&&season.year===s.seasonYear){
        season.nationalCaps=(season.nationalCaps||0)+appeared;
        season.nationalGoals=(season.nationalGoals||0)+goals;
        season.nationalGoalsConceded=(season.nationalGoalsConceded||0)+conceded;
        season.nationalCleanSheets=(season.nationalCleanSheets||0)+clean;
      }
      return {appeared,minutes:result.myMinutes||0,goals,assists,conceded,clean,saves:result.mySaves||0,yellowCards:result.myYellowCards||0,redCards:result.myRedCards||0};
    }

    function finishWorldPlayoffMatch(result,watched){
      const s=state(),pending=s.pendingWorldPlayoff;
      if(!pending)throw new Error('Brak aktywnego barażu interkontynentalnego.');
      const stage=pending.route.stages[pending.stageIndex];
      const gf=result.matchGf??result.gf??0,ga=result.matchGa??result.ga??0;
      const won=(result.gf??gf)>(result.ga??ga);
      const stats=applyWorldPlayoffStats(result);
      const match={
        phase:stage.label,opponent:stage.opponentName,gf,ga,won,
        watched:!!watched,playerAppeared:!!stats.appeared,
        myGoals:stats.goals,myAssists:stats.assists,myGoalsConceded:stats.conceded,
        myCleanSheet:stats.clean,mySaves:stats.saves,
        myMinutes:stats.minutes,myYellowCards:stats.yellowCards,myRedCards:stats.redCards,
        extra:!!result.extra,penalties:!!result.penalties,penaltyScore:result.penaltyScore||null
      };
      pending.matches.push(match);
      const history=s.nationalTournamentHistory?.WORLD?.[pending.year];
      if(history)history.worldPlayoffMatches=pending.matches.map(item=>({...item}));
      if(!won){
        if(history){
          history.playoffPending=false;history.pending=false;history.qualified=false;
          history.result=stage.label;
          history.text=`🌐 Mundial ${pending.year}: ${pending.teamName} odpada w ${stage.label.toLowerCase()} barażu interkontynentalnego.`;
        }
        host.log(`Baraż interkontynentalny: ${pending.teamName} odpada.`,`${gf}:${ga} z ${stage.opponentName}`);
        delete s.pendingWorldPlayoff;
        host.render();
        return {won:false,finished:true,qualified:false,match,stage};
      }
      if(pending.stageIndex<pending.route.stages.length-1){
        pending.stageIndex++;
        if(history)history.text=`🌐 Mundial ${pending.year}: ${pending.teamName} wygrywa półfinał barażu i zagra w finale.`;
        host.log(`Baraż interkontynentalny: ${pending.teamName} w finale.`,`${gf}:${ga} z ${stage.opponentName}`);
        host.render();
        return {won:true,finished:false,qualified:false,match,stage};
      }
      const fieldQualification=tournamentEngine.qualify('WORLD',{forceTeamName:pending.teamName});
      s.worldCups=(s.worldCups||0)+1;
      s.pendingTournament={
        kind:'WORLD',year:pending.year,teamName:pending.teamName,
        qualRoll:pending.qualRoll,qualificationChance:pending.qualificationChance,
        qualificationRank:null,qualifiedTeamNames:fieldQualification.qualifiedTeamNames.slice()
      };
      if(history){
        history.qualified=true;history.playoffPending=false;history.pending=true;
        history.qualifiedTeamNames=fieldQualification.qualifiedTeamNames.slice();
        history.result='awans po barażu';
        history.text=`🌍 Mundial ${pending.year}: ${pending.teamName} awansuje po wygranym barażu interkontynentalnym!`;
      }
      host.log(`Baraż interkontynentalny: ${pending.teamName} jedzie na mundial!`,`${gf}:${ga} z ${stage.opponentName}`);
      delete s.pendingWorldPlayoff;
      host.render();
      return {won:true,finished:true,qualified:true,match,stage};
    }

    async function playPendingWorldPlayoffMatch(){
      const fixture=getPendingWorldPlayoffMatch();
      if(!fixture)throw new Error('Brak meczu barażu oczekującego na rozegranie.');
      const result=await controller.playStandaloneMatch({
        kicker:`WIELKI MECZ • ${fixture.label} • ŚCIEŻKA ${fixture.path}`,
        homeName:fixture.teamName,
        fixture:{
          poland:{name:fixture.teamName,strength:fixture.homeStrength},
          opponent:{name:fixture.opponentName,strength:fixture.opponentStrength}
        },
        knockout:true,national:true,
        playerOverride:(state().nationalSuspensionMatches||0)>0?{suspended:true,status:'Zawieszony'}:null
      });
      if((state().nationalSuspensionMatches||0)>0)state().nationalSuspensionMatches--;
      if((result.myRedCards||0)>0)state().nationalSuspensionMatches=Math.max(state().nationalSuspensionMatches||0,1);
      return finishWorldPlayoffMatch(result,true);
    }

    function simulatePendingWorldPlayoffMatch(){
      const fixture=getPendingWorldPlayoffMatch();
      if(!fixture)throw new Error('Brak meczu barażu oczekującego na wylosowanie.');
      const result=resolveAutomaticKnockout(
        {strength:fixture.homeStrength},{strength:fixture.opponentStrength}
      );
      const suspended=(state().nationalSuspensionMatches||0)>0;
      const player=simulatePlayerMatch(result,{forceUnavailable:suspended});
      if(suspended)state().nationalSuspensionMatches--;
      if(player.myRedCards)state().nationalSuspensionMatches=Math.max(state().nationalSuspensionMatches||0,1);
      return finishWorldPlayoffMatch({...result,...player},false);
    }

    function checkSeasonTournaments(){
      const team=global.NSSNationalData.teams.find(candidate=>candidate.name===representedCountry());
      if(!team)return [];
      const kinds=['WORLD'];
      const continental=naturalization?.continentalCup(team);
      if(continental)kinds.unshift(continental);
      return kinds.map(checkQualification).filter(Boolean);
    }

    function playPendingTournament(onDone=()=>{}) {
      const pending=state().pendingTournament;
      if(!pending)throw new Error('Brak turnieju oczekującego na rozegranie.');
      afterTournament=onDone;
      return controller.playTournament({
        kind:pending.kind,
        year:pending.year,
        qualifiedTeamNames:pending.qualifiedTeamNames,
        controlledTeamName:pending.teamName||representedCountry()
      });
    }

    function simulatePendingTournament() {
      const pending=state().pendingTournament;
      if(!pending)throw new Error('Brak turnieju oczekującego na wylosowanie.');
      const simulated=simulateNationalTournament(pending.kind,pending.qualifiedTeamNames,pending.teamName||representedCountry());
      const stats=simulateTournamentPlayerStats(simulated.polandMatches);
      return recordTournamentResult({
        ...simulated,
        year:pending.year,
        stats
      },false);
    }

    // Pojedynczy mecz decydujący na poziomie klubu (mistrzostwo, awans, puchar —
    // krajowy lub zagraniczny). Nie dotyczy reprezentacji, więc nie rusza
    // pendingTournament/historii EURO-mundial. Zwraca wynik meczu (gf/ga/...).
    function playClubDecisiveMatch({kicker,homeName,homeStrength,opponent,knockout}) {
      return controller.playStandaloneMatch({
        kicker,
        homeName,
        fixture:{poland:{strength:homeStrength}, opponent},
        knockout
      });
    }

    return {
      tournamentEngine,
      matchEngine,
      controller,
      checkEuro:()=>checkQualification('EURO'),
      checkWorldCup:()=>checkQualification('WORLD'),
      checkQualification,
      checkSeasonTournaments,
      getPendingWorldPlayoffMatch,
      playPendingWorldPlayoffMatch,
      simulatePendingWorldPlayoffMatch,
      playPendingTournament,
      simulatePendingTournament,
      playClubDecisiveMatch,
      simulateClubDecisiveAppearance:result=>simulatePlayerMatch(result)
    };
  }

  global.installPolskaKarieraNSS=installPolskaKarieraNSS;
})(typeof window !== 'undefined' ? window : globalThis);

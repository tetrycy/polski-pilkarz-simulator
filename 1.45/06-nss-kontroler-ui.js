/*
 * NSS — gotowy kontroler łączący czysty silnik turnieju i meczu z DOM-em.
 *
 * Zależności (w tej kolejności):
 * 01-nss-dane-reprezentacji.js
 * 02-nss-silnik-meczowy.js
 * 03-nss-turnieje.js
 * 04-nss-turnieje-ui.css
 * 05-nss-turnieje-ui.html
 */
(function (global) {
  'use strict';

  if(!global.NSSMatchEngine||!global.NSSTournamentEngine){
    throw new Error('Brakuje NSSMatchEngine lub NSSTournamentEngine.');
  }

  const escapeHtml=value=>String(value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);

  // Silnik przyjmuje zatrzymanie jako wartość względem środka (0.5), ale
  // gracz widzi piksele: piłkę, tor i okrąg rękawic. Przeliczenie sprawia,
  // że krawędź widocznego okręgu jest dokładnie krawędzią udanej obrony,
  // niezależnie od długości oraz prędkości wylosowanej trajektorii.
  function goalkeeperVisualValue(phaseValue,pathHalf,zoneRadius,tolerance){
    const half=Math.max(1,Number(pathHalf)||1);
    const radius=Math.max(1,Number(zoneRadius)||1);
    const allowed=Math.max(.001,Number(tolerance)||.001);
    const spatialOffset=((Number(phaseValue)||0)*2-1)*half;
    return Math.max(0,Math.min(1,.5+(spatialOffset/radius)*allowed));
  }

  function createController(config) {
    const root=typeof config.root==='string'?document.querySelector(config.root):config.root;
    if(!root)throw new Error('Nie znaleziono elementu interfejsu turnieju.');
    const tournament=config.tournamentEngine||global.NSSTournamentEngine.createEngine();
    const match=config.matchEngine||global.NSSMatchEngine.createEngine();
    const hooks={
      getPlayer:config.getPlayer||(()=>({overall:65,position:'MID',status:'Podstawowy'})),
      applyPlayerPatch:config.applyPlayerPatch||(()=>{}),
      log:config.log||(()=>{}),
      setHostVisible:config.setHostVisible||(()=>{}),
      onTournamentComplete:config.onTournamentComplete||(()=>{}),
      getTeamPalette:config.getTeamPalette||(()=>null),
      getNationalSuspension:config.getNationalSuspension||(()=>0),
      consumeNationalSuspension:config.consumeNationalSuspension||(()=>{}),
      registerNationalRedCard:config.registerNationalRedCard||(()=>{})
    };

    const overview=root.querySelector('[data-nss-view="overview"]');
    const matchView=root.querySelector('[data-nss-view="match"]');
    const el=name=>root.querySelector(`[data-nss="${name}"]`);
    const speedButtons=[...root.querySelectorAll('[data-nss-speed]')];
    const delays=config.delays||{slow:2400,normal:1300,fast:550};
    let speed='normal';

    speedButtons.forEach(button=>button.addEventListener('click',()=>{
      speed=button.dataset.nssSpeed;
      speedButtons.forEach(item=>item.classList.toggle('nss-active',item===button));
    }));

    function show(which) {
      overview.classList.toggle('nss-hidden',which!=='overview');
      matchView.classList.toggle('nss-hidden',which!=='match');
    }

    function primaryButton(label) {
      return new Promise(resolve=>{
        const actions=el('actions');
        actions.innerHTML='';
        const button=document.createElement('button');
        button.type='button';
        button.className='nss-button nss-primary';
        button.textContent=label;
        button.onclick=resolve;
        actions.appendChild(button);
      });
    }

    async function overviewScreen({kicker,title,summary,content,button}) {
      show('overview');
      el('kicker').textContent=kicker;
      el('title').textContent=title;
      el('summary').textContent=summary||'';
      el('content').innerHTML=content||'';
      await primaryButton(button||'DALEJ →');
    }

    function tableHtml(rows,{third=false,thirdAdvance=8}={}) {
      const body=rows.map((row,index)=>{
        const gd=row.gf-row.ga;
        const classes=[
          row.team.isPoland?'nss-poland':'',
          third&&index===thirdAdvance-1?'nss-cut':'',
          !third&&index===1?'nss-cut':''
        ].filter(Boolean).join(' ');
        return `<tr class="${classes}">
          <td>${index+1}</td><td>${escapeHtml(row.team.name)}</td>
          ${third?`<td>${escapeHtml(row.group)}</td>`:''}
          <td>${row.played}</td><td>${row.pts}</td><td>${row.gf}:${row.ga}</td>
          <td>${gd>0?'+':''}${gd}</td><td>${row.team.strength}</td>
        </tr>`;
      }).join('');
      return `<div class="nss-table-wrap"><table class="nss-table"><thead><tr>
        <th>#</th><th>Drużyna</th>${third?'<th>Grupa</th>':''}
        <th>M</th><th>Pkt</th><th>Bramki</th><th>Bilans</th><th>OVR</th>
      </tr></thead><tbody>${body}</tbody></table></div>`;
    }

    function resultListHtml(results) {
      return `<div class="nss-results">${results.map(item=>
        `<div class="nss-result">${escapeHtml(item.a.name)}
          <span class="nss-score-inline">${item.gf}:${item.ga}</span><br>
          ${escapeHtml(item.b.name)}</div>`
      ).join('')}</div>`;
    }

    function bracketHtml(matches,withScores=false) {
      return `<div class="nss-bracket">${matches.map(item=>{
        const poland=item.a.isPoland||item.b.isPoland;
        const suffix=withScores&&item.result
          ? `${item.result.matchGf??item.result.gf}:${item.result.matchGa??item.result.ga}${item.result.penalties&&item.result.penaltyScore?` (k. ${item.result.penaltyScore.home}:${item.result.penaltyScore.away})`:item.result.penalties?' k.':item.result.extra?' d.':''}`
          : '';
        return `<div class="nss-bracket-match${poland?' nss-poland':''}">
          ${escapeHtml(item.a.name)}
          ${suffix?`<span class="nss-score-inline">${suffix}</span>`:''}<br>
          ${escapeHtml(item.b.name)}</div>`;
      }).join('')}</div>`;
    }

    function appendMatchLine(text,className='') {
      const line=document.createElement('div');
      line.className=`nss-log-line ${className}`.trim();
      line.textContent=text;
      el('match-log').appendChild(line);
      el('match-log').scrollTop=el('match-log').scrollHeight;
    }

    function updateScore(score) {
      el('match-score').textContent=`${score.poland} : ${score.opponent}`;
    }

    function matchPalette(palette){
      return palette&&palette.primary&&palette.secondary
        ?palette
        :{primary:'#f8f4ea',secondary:'#171717',shadow:'#c9252d',source:'neutral'};
    }

    function paletteLuminance(hex){
      const clean=String(hex||'').replace('#','');
      if(!/^[0-9a-f]{6}$/i.test(clean))return 0;
      const values=[0,2,4].map(i=>parseInt(clean.slice(i,i+2),16)/255)
        .map(x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4));
      return values[0]*.2126+values[1]*.7152+values[2]*.0722;
    }

    function readableTeamInk(primary,secondary){
      const bg=paletteLuminance(primary),fg=paletteLuminance(secondary);
      const contrast=(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);
      return contrast>=3?secondary:(bg>.42?'#171717':'#ffffff');
    }

    function styleTeamName(element,name,palette){
      if(!element)return;
      const colours=matchPalette(palette);
      element.textContent=name;
      element.style.setProperty('--team-primary',colours.primary);
      element.style.setProperty('--team-secondary',colours.secondary);
      element.style.setProperty('--team-shadow',colours.shadow||colours.secondary);
      element.style.setProperty('--team-ink',readableTeamInk(colours.primary,colours.secondary));
      element.dataset.colourSource=colours.source||'club';
    }

    function wait(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }

    const SKILLS=global.NSSMatchEngine.SKILLS;
    const ATTR_GROUPS=global.NSSMatchEngine.ATTR_GROUPS;
    const ATTR_LABELS=global.NSSMatchEngine.ATTR_LABELS;
    const SKILL_LABELS=Object.fromEntries(SKILLS.map(([key,label])=>[key,label]));

    function updateStatusPanel(session) {
      const status=session.getStatus();
      const s=status.stats;
      el('stat-rating').textContent=s.rating.toFixed(1);
      el('stat-personal').textContent=`${status.personalEventsSeen} / ${status.personalTarget}`;
      el('stat-goals').textContent=s.goals;
      el('stat-assists').textContent=s.assists;
      el('stat-saves').textContent=s.saves||0;
      el('stat-conceded').textContent=s.goalsConceded||0;
      el('stat-shots').textContent=`${s.shots} / ${s.shotsOn}`;
      el('stat-passes').textContent=`${s.passesOk} / ${s.passes}`;
      el('stat-dribbles').textContent=`${s.dribblesOk} / ${s.dribbles}`;
      el('stat-tackles').textContent=`${s.tacklesOk} / ${s.tackles}`;
      el('stat-turnovers').textContent=s.turnovers;
      const cards=el('stat-cards');
      if(cards) cards.textContent=s.yellowCards||s.redCards?`🟨 ${s.yellowCards} • 🟥 ${s.redCards}`:'—';
      el('condition-meter').style.width=`${status.conditionPct.toFixed(0)}%`;
      el('condition-text').textContent=`Kondycja ${status.conditionPct.toFixed(0)}% • zużycie tylko meczowe`;
      return status;
    }

    function renderSkillBars(status) {
      const wrap=el('skill-bars');
      wrap.innerHTML='';
      Object.entries(ATTR_LABELS).forEach(([key,label])=>{
        const value=status.current[key];
        const row=document.createElement('div');
        row.className='nss-skill-row';
        row.dataset.nssSkillRow=key;
        row.innerHTML=`<span>${escapeHtml(label)}</span><div class="nss-mini-track"><div class="nss-mini-fill" style="width:${clampPct(value)}%"></div></div><b>${(value*30/99).toFixed(1)}</b>`;
        wrap.appendChild(row);
      });
    }
    function clampPct(v){ return Math.max(0,Math.min(100,v/99*100)); }

    function flashSkillRow(key) {
      if(!key) return;
      const row=root.querySelector(`[data-nss-skill-row="${key}"]`);
      if(!row) return;
      row.classList.remove('nss-flash');
      void row.offsetWidth;
      row.classList.add('nss-flash');
    }

    async function playMatch({kicker,homeName='Polska',fixture,knockout,national=false,playerOverride=null}) {
      show('match');
      const player={...hooks.getPlayer(),...(playerOverride||{})};
      const nationalMatch=!!national||homeName==='Polska';
      const homePalette=matchPalette(hooks.getTeamPalette({name:homeName,team:null,national:nationalMatch,home:true}));
      const awayPalette=matchPalette(hooks.getTeamPalette({name:fixture.opponent.name,team:fixture.opponent,national:nationalMatch,home:false}));
      const session=match.createMatch({
        player,
        homeName,
        polandStrength:fixture.poland.strength,
        opponent:fixture.opponent,
        knockout
      });
      el('match-kicker').textContent=kicker;
      const homeNameEl=el('match-home-name');
      const awayNameEl=el('match-away-name');
      if(homeNameEl&&awayNameEl){
        styleTeamName(homeNameEl,homeName,homePalette);
        styleTeamName(awayNameEl,fixture.opponent.name,awayPalette);
      }else{
        el('match-title').textContent=`${homeName} vs ${fixture.opponent.name}`;
      }
      matchView.style.setProperty('--match-home-accent',homePalette.shadow||homePalette.primary);
      matchView.style.setProperty('--match-away-accent',awayPalette.shadow||awayPalette.primary);
      el('match-score').textContent='0 : 0';
      el('match-meta').textContent=`Siła: ${homeName} ${Math.round(session.meta.home.effectiveRating)} • ${fixture.opponent.name} ${fixture.opponent.strength}${fixture.poland.goldenGeneration?' • ZŁOTE POKOLENIE':''}`;
      el('match-log').innerHTML='';
      el('match-actions').innerHTML='';
      el('decision').classList.add('nss-hidden');
      appendMatchLine(session.meta.roleText);
      updateStatusPanel(session);

      await new Promise(resolve=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='nss-button nss-primary';
        button.textContent='GRAMY →';
        button.onclick=resolve;
        el('match-actions').appendChild(button);
      });
      el('match-actions').innerHTML='';

      // Prezentuje jedną decyzję (świeżą albo kontynuację łańcucha) i zwraca wybór gracza.
      function presentDecision(event) {
        if(event.context.type==='goalkeeper'){
          return new Promise(resolve=>{
            const ctx=event.context;
            const decision=el('decision');
            const reaction=decision.querySelector('.nss-reaction-wrap');
            const clear=el('clear-btn');
            const play=el('play-btn');
            const playRow=play.closest('.nss-play-row');
            const tip=el('tip');
            const secondary=el('secondary-actions');
            decision.classList.remove('nss-hidden');
            reaction.classList.add('nss-hidden');
            clear.classList.add('nss-hidden');
            playRow?.classList.add('nss-hidden');
            tip.classList.add('nss-hidden');
            el('decision-title').textContent=event.text;
            secondary.innerHTML=`<div class="nss-gk-layout">
              <div class="nss-gk-goal-row">
                <div class="nss-gk-game" aria-label="prostokąt bramki piłkarskiej">
                  <div class="nss-gk-net"></div><div class="nss-gk-path"></div>
                  <div class="nss-gk-center" aria-label="miejsce rękawic"><span>🧤</span></div>
                  <div class="nss-gk-ball" aria-label="piłka nożna"></div>
                </div>
                <div class="nss-gk-timer" aria-label="czas na interwencję"><i></i></div>
              </div>
              <div class="nss-gk-underbar">
                <div class="nss-gk-radar" aria-label="prostokątny radar boiska i źródła strzału">
                  <div class="nss-gk-radar-box home"></div><div class="nss-gk-radar-box away"></div>
                  <div class="nss-gk-radar-goal home"></div><div class="nss-gk-radar-goal away"></div>
                  <div class="nss-gk-shot-origin"><span></span></div>
                </div>
                <button type="button" class="nss-gk-defend-btn">BROŃ!</button>
              </div>
            </div>`;
            const game=secondary.querySelector('.nss-gk-game');
            const ball=secondary.querySelector('.nss-gk-ball');
            const pathLine=secondary.querySelector('.nss-gk-path');
            const center=secondary.querySelector('.nss-gk-center');
            const timerFill=secondary.querySelector('.nss-gk-timer i');
            const defendBtn=secondary.querySelector('.nss-gk-defend-btn');
            const tolerance=Math.max(.04,Math.min(.20,Number(ctx.tolerance)||.10));
            const targetX=Math.max(.12,Math.min(.88,Number(ctx.goalTargetX)||.5));
            const targetY=Math.max(.14,Math.min(.86,Number(ctx.goalTargetY)||.5));
            center.style.left=`${targetX*100}%`;
            center.style.top=`${targetY*100}%`;
            const zoneDiameter=Math.round(Math.max(28,Math.min(86,tolerance*460)));
            const zoneRadius=zoneDiameter/2;
            center.style.width=center.style.height=`${zoneDiameter}px`;
            const shotOrigin=secondary.querySelector('.nss-gk-shot-origin');
            const distance=Math.max(4,Math.min(40,Number(ctx.distance)||20));
            const pitchLength=Math.max(90,Number(ctx.pitchLength)||105);
            const shotDepth=Math.max(1,Number(ctx.shotDepth)||distance);
            // Pełne boisko ma 105 m. 37 m wypada więc na 35,2% długości,
            // wyraźnie przed linią środkową, a nie niemal na niej.
            shotOrigin.style.left=`${Math.max(2,Math.min(48,shotDepth/pitchLength*100))}%`;
            shotOrigin.style.top=`${Math.max(4,Math.min(96,Number(ctx.shotOriginX||.5)*100))}%`;
            let phase=0,started=0,deadline=0,raf=0,current=0,currentHalf=16,first=null,running=false,resolved=false;
            const cycle=Math.max(500,Number(ctx.cycleMs)||1800);
            const responseMs=Math.max(3000,Number(ctx.responseMs)||3000);
            const pathScale=Math.max(.45,Math.min(1,Number(ctx.pathScale)||.72));
            const angles=Array.isArray(ctx.pathAngles)?ctx.pathAngles:[Math.random()*Math.PI*2,Math.random()*Math.PI*2];
            function valueAt(now){
              return ((now-started)%cycle)/cycle;
            }
            function positionBall(value){
              const rect=game.getBoundingClientRect();
              // Nigdy nie licz pozycji dla fikcyjnej planszy większej niż
              // widoczny prostokąt — to właśnie wypychało piłkę poza bramkę
              // na telefonach i zostawiało na ekranie wąski pionowy pasek.
              const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
              const cx=w*targetX,cy=h*targetY;
              const angle=angles[phase]||0;
              const dx=Math.cos(angle),dy=Math.sin(angle);
              const edgeX=Math.min(cx-18,w-cx-18);
              const edgeY=Math.min(cy-18,h-cy-18);
              const available=Math.max(16,Math.min(edgeX/Math.max(.08,Math.abs(dx)),edgeY/Math.max(.08,Math.abs(dy))));
              const half=Math.max(16,available*pathScale);
              currentHalf=half;
              const offset=(value*2-1)*half;
              ball.style.left=`${cx+dx*offset}px`;
              ball.style.top=`${cy+dy*offset}px`;
              pathLine.style.width=`${half*2}px`;
              pathLine.style.left=`${cx-half}px`;
              pathLine.style.top=`${cy}px`;
              // Linia ma przecinać dokładny środek strefy obrony. translateY
              // kompensuje własną wysokość kreski przed jej obrotem.
              pathLine.style.transform=`translateY(-50%) rotate(${angle}rad)`;
            }
            function animate(now){
              if(!running||resolved) return;
              current=valueAt(now);
              positionBall(current);
              const remaining=Math.max(0,(deadline-now)/responseMs);
              timerFill.style.height=`${remaining*100}%`;
              if(now>=deadline){
                running=false;
                advancePhase(0);
                return;
              }
              raf=requestAnimationFrame(animate);
            }
            function cleanup(){
              resolved=true; running=false; cancelAnimationFrame(raf);
              reaction.classList.remove('nss-hidden'); clear.classList.remove('nss-hidden');
              playRow?.classList.remove('nss-hidden'); tip.classList.remove('nss-hidden');
              play.textContent='GRAJ'; play.onclick=null; secondary.innerHTML='';
            }
            function startPhase(){
              cancelAnimationFrame(raf);
              started=performance.now(); deadline=started+responseMs; running=true;
              timerFill.style.height='100%';
              defendBtn.textContent=`ZATRZYMAJ PIŁKĘ ${phase+1}`;
              raf=requestAnimationFrame(animate);
            }
            function finish(firstValue,secondValue){
              if(resolved) return;
              cleanup();
              resolve({selected:['goalkeeper'],secondary:{first:firstValue,second:secondValue}});
            }
            function advancePhase(value){
              cancelAnimationFrame(raf);
              if(phase===0){ first=value; phase=1; startPhase(); }
              else finish(first,value);
            }
            function interventionValue(){
              return goalkeeperVisualValue(current,currentHalf,zoneRadius,tolerance);
            }
            positionBall(0);
            timerFill.style.height='100%';
            defendBtn.onclick=()=>{
              if(!running){ startPhase(); return; }
              running=false;
              advancePhase(interventionValue());
            };
          });
        }
        return new Promise(resolve=>{
          const ctx=event.context;
          const decision=el('decision');
          const reaction=decision.querySelector('.nss-reaction-wrap');
          const clear=el('clear-btn');
          const play=el('play-btn');
          const playRow=play.closest('.nss-play-row');
          const tip=el('tip');

          // Decyzja bramkarza na czas ukrywa zwykłe sterowanie. Każda akcja
          // gracza z pola musi jawnie odtworzyć cały panel; dzięki temu żaden
          // poprzedni stan ani ponowne użycie kontrolera nie może wyłączyć
          // STRZAŁU, PODANIA albo przycisku zatwierdzającego.
          reaction.classList.remove('nss-hidden');
          clear.classList.remove('nss-hidden');
          playRow?.classList.remove('nss-hidden');
          tip.classList.remove('nss-hidden');
          play.onclick=null;
          clear.onclick=null;

          // Rzut rożny zaczyna się jako dogranie, a rzut wolny jako strzał.
          // Gracz nadal może ręcznie przełączyć wolny na krótkie rozegranie
          // albo dośrodkowanie.
          let selected=ctx.type==='penalty' ? ['shoot'] : ctx.corner ? ['setPiece','pass'] : ctx.type==='setpiece' ? ['setPiece','shoot'] : [];
          let secondary=null;

          decision.classList.remove('nss-hidden');
          el('decision-title').textContent=event.text;
          el('secondary-actions').innerHTML='';

          function currentStatus(){ return session.getStatus(); }

          function updatePlayState(){
            const needsAction=ctx.side!=='away';
            const canPlay=!needsAction||selected.length>0;
            play.disabled=!canPlay;
            if(!canPlay) play.textContent='WYBIERZ AKCJĘ';
            else if(selected.includes('shoot')) play.textContent='GRAJ: STRZAŁ';
            else if(selected.includes('pass')) play.textContent='GRAJ: PODANIE';
            else if(selected.includes('header')) play.textContent='GRAJ: GŁÓWKA';
            else if(selected.includes('dribble')) play.textContent='GRAJ: DRYBLING';
            else if(selected.includes('tackle')) play.textContent='GRAJ: ODBIÓR';
            else play.textContent='GRAJ';
          }

          function renderButtons(){
            const wrap=el('skill-buttons');
            wrap.innerHTML='';
            SKILLS.forEach(([key,label])=>{
              const b=document.createElement('button');
              b.type='button';
              b.className='nss-skill-btn';
              b.textContent=label;
              b.disabled=!ctx.allowed.includes(key);
              b.classList.toggle('nss-selected',selected.includes(key));
              b.setAttribute('aria-pressed',selected.includes(key)?'true':'false');
              b.onclick=()=>{
                selected=session.toggleSkill(selected,key);
                secondary=null;
                renderButtons();
                renderSecondary();
                el('tip').textContent=session.getTip(selected,secondary);
                updatePlayState();
              };
              wrap.appendChild(b);
            });
          }
          function renderSecondary(){
            const wrap=el('secondary-actions');
            wrap.innerHTML='';
            const options=session.getSecondaryOptions(selected);
            if(!options.length) return;
            if(!secondary) secondary=options[0][0];
            options.forEach(([key,label])=>{
              const b=document.createElement('button');
              b.type='button';
              b.className=secondary===key?'nss-active':'';
              b.textContent=label;
              b.onclick=()=>{ secondary=key; renderSecondary(); el('tip').textContent=session.getTip(selected,secondary); };
              wrap.appendChild(b);
            });
          }

          renderButtons();
          renderSecondary();
          renderSkillBars(currentStatus());
          el('tip').textContent=session.getTip(selected,secondary)||'Wybierz umiejętność i naciśnij Graj.';
          updatePlayState();

          function finish(){
            if(play.disabled) return;
            el('clear-btn').onclick=null;
            el('play-btn').onclick=null;
            resolve({selected,secondary});
          }

          el('clear-btn').onclick=()=>{
            selected=[]; secondary=null;
            renderButtons(); renderSecondary();
            el('tip').textContent=session.getTip(selected,secondary);
            updatePlayState();
          };
          el('play-btn').onclick=finish;
        });
      }

      while(true){
        await wait(delays[speed]);
        const event=session.next();
        updateScore(event.score);

        if(event.type==='substitution'){
          appendMatchLine(event.text);
          continue;
        }
        if(event.type==='commentary'){
          appendMatchLine(`${event.minute}' ${event.text}`,event.goal?(event.side==='my'?'nss-goal-us':'nss-goal-against'):'');
          flashSkillRow(event.flashKey);
          updateStatusPanel(session);
          continue;
        }
        if(event.type==='phase'){
          appendMatchLine(event.text,'nss-final');
          updateStatusPanel(session);
          continue;
        }
        if(event.type==='decision'){
          appendMatchLine(`${event.minute}' ${event.text}`,'nss-decision');
          const {selected,secondary}=await presentDecision(event);
          el('decision').classList.add('nss-hidden');

          const outcome=session.choose(selected,secondary);
          updateScore(outcome.score);
          appendMatchLine(
            outcome.effect.text,
            outcome.effect.kind==='goal'||outcome.effect.kind==='assist'||outcome.effect.kind==='penalty-goal'
              ?'nss-goal-us'
              :outcome.effect.kind==='goal-conceded'?'nss-goal-against':''
          );
          flashSkillRow(outcome.flashKey);
          updateStatusPanel(session);

          if(outcome.chained){
            await wait(600);
          }
          continue;
        }
        if(event.type==='finished'){
          event.notes.forEach(note=>appendMatchLine(note));
          const result=event.result;
          const label=result.gf>result.ga?'WYGRANA':result.gf<result.ga?'PRZEGRANA':'REMIS';
          const fieldGf=result.matchGf??result.gf;
          const fieldGa=result.matchGa??result.ga;
          const shootout=result.penalties&&result.penaltyScore
            ? ` • karne ${result.penaltyScore.home}:${result.penaltyScore.away}`
            : result.extra?' • po dogrywce':'';
          appendMatchLine(`KONIEC: ${homeName} ${fieldGf}:${fieldGa} ${fixture.opponent.name}${shootout} — ${label}.`,'nss-final');
          hooks.applyPlayerPatch(result.playerPatch||{});
          hooks.log(
            `${kicker}: ${homeName} ${fieldGf}:${fieldGa} ${fixture.opponent.name}${shootout}`,
            label
          );
          await new Promise(resolve=>{
            const button=document.createElement('button');
            button.type='button';
            button.className='nss-button nss-primary';
            button.textContent='DALEJ →';
            button.onclick=resolve;
            el('match-actions').appendChild(button);
          });
          return result;
        }
      }
    }

    async function playNationalTournamentMatch(params){
      const suspended=(hooks.getNationalSuspension()||0)>0;
      const result=await playMatch({
        ...params,
        national:true,
        playerOverride:suspended?{suspended:true,status:'Zawieszony'}:null
      });
      if(suspended)hooks.consumeNationalSuspension();
      if((result.myRedCards||0)>0)hooks.registerNationalRedCard();
      return result;
    }

    async function playTournament({kind,year,qualifiedTeamNames,controlledTeamName='Polska'}) {
      root.classList.remove('nss-hidden');
      hooks.setHostVisible(false);
      const field=tournament.createField(kind,qualifiedTeamNames,controlledTeamName);
      const poland=field.find(team=>team.isPoland);
      const stats={appearances:0,minutes:0,goals:0,assists:0,saves:0,goalsConceded:0,cleanSheets:0,yellowCards:0,redCards:0};
      const polandMatches=[];
      const labels={WORLD:'MUNDIAL',EURO:'EURO',AFCON:'PUCHAR NARODÓW AFRYKI',ASIAN_CUP:'PUCHAR AZJI',GOLD_CUP:'ZŁOTY PUCHAR CONCACAF',COPA_AMERICA:'COPA AMÉRICA',OFC_NATIONS_CUP:'PUCHAR NARODÓW OFC'};
      const trophyLabels={WORLD:'MISTRZEM ŚWIATA',EURO:'MISTRZEM EUROPY',AFCON:'MISTRZEM AFRYKI',ASIAN_CUP:'ZDOBYWCĄ PUCHARU AZJI',GOLD_CUP:'ZDOBYWCĄ ZŁOTEGO PUCHARU',COPA_AMERICA:'ZDOBYWCĄ COPA AMÉRICA',OFC_NATIONS_CUP:'MISTRZEM OCEANII'};
      const stageLabels={WORLD:'MISTRZOSTWO ŚWIATA',EURO:'MISTRZOSTWO EUROPY',AFCON:'MISTRZOSTWO AFRYKI',ASIAN_CUP:'PUCHAR AZJI',GOLD_CUP:'ZŁOTY PUCHAR CONCACAF',COPA_AMERICA:'COPA AMÉRICA',OFC_NATIONS_CUP:'PUCHAR NARODÓW OFC'};
      const label=labels[kind]||kind;
      if(poland.goldenGeneration)hooks.log(
        `🌟 ZŁOTE POKOLENIE POLSKI — OVR ${poland.strength}.`,
        `${label} ${year}`
      );

      const groups=tournament.createGroupStage(kind,field);
      const thirdAdvance=tournament.tournamentSpecs[kind].thirdAdvanceCount;
      await overviewScreen({
        kicker:`${label} ${year} • FAZA GRUPOWA`,
        title:`${controlledTeamName} w grupie ${groups.polandGroup}`,
        summary:'Przed tobą trzy mecze. Tabela jest aktualizowana po każdej kolejce.',
        content:`<section><h3>Grupa ${groups.polandGroup}</h3>${tableHtml(groups.getPolandTable())}</section>`,
        button:'ZAGRAJ 1. KOLEJKĘ →'
      });

      for(let round=0;round<3;round++){
        const fixture=groups.prepareRound(round);
        const result=await playNationalTournamentMatch({
          kicker:`${label} ${year} • GRUPA ${groups.polandGroup} • KOLEJKA ${round+1}/3`,
          homeName:controlledTeamName,fixture,knockout:false
        });
        stats.appearances+=result.myAppearance||0;
        stats.minutes+=result.myMinutes||0;
        stats.goals+=result.myGoals||0;
        stats.assists+=result.myAssists||0;
        stats.saves+=result.mySaves||0;
        stats.goalsConceded+=result.myGoalsConceded||0;
        stats.cleanSheets+=result.myCleanSheet||0;
        stats.yellowCards+=result.myYellowCards||0;
        stats.redCards+=result.myRedCards||0;
        groups.recordPolandMatch(round,result);
        polandMatches.push({
          phase:`GRUPA ${groups.polandGroup} • ${round+1}. KOLEJKA`,
          opponent:fixture.opponent.name,gf:result.matchGf??result.gf,ga:result.matchGa??result.ga,
          playerAppeared:!!result.myAppearance,
          myMinutes:result.myMinutes||0,myGoals:result.myGoals||0,myAssists:result.myAssists||0,
          myGoalsConceded:result.myGoalsConceded||0,myCleanSheet:result.myCleanSheet||0,
          myYellowCards:result.myYellowCards||0,myRedCards:result.myRedCards||0,
          extra:!!result.extra,penalties:!!result.penalties,penaltyScore:result.penaltyScore||null
        });
        if(round<2){
          await overviewScreen({
            kicker:`${label} ${year} • PO ${round+1}. KOLEJCE`,
            title:`Tabela grupy ${groups.polandGroup}`,
            summary:'Wszystkie grupy rozegrały tę samą kolejkę.',
            content:`<section><h3>Tabela</h3>${tableHtml(groups.getPolandTable())}</section>
              <section><h3>Wyniki kolejki</h3>${resultListHtml(groups.getRoundResults(round))}</section>`,
            button:`ZAGRAJ ${round+2}. KOLEJKĘ →`
          });
        }
      }

      const groupResult=groups.finish();
      await overviewScreen({
        kicker:`${label} ${year} • KONIEC FAZY GRUPOWEJ`,
        title:`${groupResult.polandPosition}. miejsce: ${controlledTeamName} w grupie ${groupResult.polandGroup}`,
        summary:groupResult.polandQualified?`${controlledTeamName} awansuje do fazy pucharowej.`:`${controlledTeamName} odpada po fazie grupowej.`,
        content:`<section><h3>Końcowa tabela grupy</h3>${tableHtml(groupResult.rankings[groupResult.polandGroup])}</section>
          ${thirdAdvance?`<section><h3>Tabela trzecich miejsc</h3>${tableHtml(groupResult.allThirds,{third:true,thirdAdvance})}
          <p class="nss-note">Gruba linia oddziela zespoły awansujące.</p></section>`:''}`,
        button:groupResult.polandQualified?'PRZEJDŹ DO FAZY PUCHAROWEJ →':'ZAKOŃCZ TURNIEJ →'
      });

      if(!groupResult.polandQualified){
        const outcome={kind,year,champion:false,stage:'faza grupowa',stats,field,groupResult,polandMatches};
        hooks.onTournamentComplete(outcome);
        hooks.setHostVisible(true);
        root.classList.add('nss-hidden');
        return outcome;
      }

      const knockout=tournament.createKnockout(kind,groupResult.qualifiedTeams);
      while(true){
        const round=knockout.getRound();
        const polandMatch=knockout.getPolandMatch();
        const fixture={
          poland:polandMatch.a.isPoland?polandMatch.a:polandMatch.b,
          opponent:polandMatch.a.isPoland?polandMatch.b:polandMatch.a
        };
        await overviewScreen({
          kicker:`${label} ${year} • ${round.name}`,
          title:`${controlledTeamName} zagra z ${fixture.opponent.name}`,
          summary:'Pary wynikają ze stałej drabinki. Nie ma ponownego losowania.',
          content:`<section><h3>Pary — ${round.name}</h3>${bracketHtml(round.matches)}</section>`,
          button:`ZAGRAJ MECZ: ${controlledTeamName.toUpperCase()} →`
        });
        const result=await playNationalTournamentMatch({kicker:`${label} ${year} • ${round.name}`,homeName:controlledTeamName,fixture,knockout:true});
        stats.appearances+=result.myAppearance||0;
        stats.minutes+=result.myMinutes||0;
        stats.goals+=result.myGoals||0;
        stats.assists+=result.myAssists||0;
        stats.saves+=result.mySaves||0;
        stats.goalsConceded+=result.myGoalsConceded||0;
        stats.cleanSheets+=result.myCleanSheet||0;
        stats.yellowCards+=result.myYellowCards||0;
        stats.redCards+=result.myRedCards||0;
        polandMatches.push({phase:round.name,opponent:fixture.opponent.name,gf:result.matchGf??result.gf,ga:result.matchGa??result.ga,playerAppeared:!!result.myAppearance,myMinutes:result.myMinutes||0,myGoals:result.myGoals||0,myAssists:result.myAssists||0,myGoalsConceded:result.myGoalsConceded||0,myCleanSheet:result.myCleanSheet||0,myYellowCards:result.myYellowCards||0,myRedCards:result.myRedCards||0,extra:!!result.extra,penalties:!!result.penalties,penaltyScore:result.penaltyScore||null});
        const resolved=knockout.resolveRound(result);

        if(resolved.finished){
          const polandChampion=resolved.champion?.isPoland;
          const title=polandChampion
            ? `🏆 ${controlledTeamName.toUpperCase()} ${trophyLabels[kind]||'WYGRYWA TURNIEJ'}!`
            : `${controlledTeamName} odpada w rundzie ${round.name}`;
          await overviewScreen({
            kicker:`${label} ${year} • ${round.name}`,
            title,
            summary:polandChampion
              ? `${controlledTeamName} wygrywa ${label}.`
              : `Mistrzem zostaje ${resolved.champion.name}.`,
            content:`<section><h3>Wyniki</h3>${bracketHtml(resolved.matches,true)}</section>`,
            button:polandChampion?'ODBIERZ PUCHAR →':'ZAKOŃCZ TURNIEJ →'
          });
          const outcome={
            kind,year,champion:!!polandChampion,
            stage:polandChampion?(stageLabels[kind]||label):round.name,
            tournamentChampion:resolved.champion.name,
            stats,field,groupResult,polandMatches
          };
          hooks.onTournamentComplete(outcome);
          hooks.setHostVisible(true);
          root.classList.add('nss-hidden');
          return outcome;
        }

        await overviewScreen({
          kicker:`${label} ${year} • ${round.name}`,
          title:`${controlledTeamName} gra dalej`,
          summary:'Cała runda została rozegrana.',
          content:`<section><h3>Wyniki</h3>${bracketHtml(resolved.matches,true)}</section>`,
          button:'ZOBACZ KOLEJNĄ RUNDĘ →'
        });
        knockout.advance();
      }
    }

    async function playStandaloneMatch(params) {
      root.classList.remove('nss-hidden');
      hooks.setHostVisible(false);
      const result = await playMatch(params);
      hooks.setHostVisible(true);
      root.classList.add('nss-hidden');
      return result;
    }

    return {playTournament,playStandaloneMatch,tournamentEngine:tournament,matchEngine:match};
  }

  global.NSSTournamentUI=Object.freeze({
    version:'1.45-career-national',
    createController
  });
})(typeof window !== 'undefined' ? window : globalThis);

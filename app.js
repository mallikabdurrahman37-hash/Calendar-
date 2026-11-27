'use strict';
const $=s=>document.querySelector(s),MN='january february march april may june july august september october november december'.split(' ');
const KEY='cal.v1',COL={Personal:'#2f7bff',Work:'#0d9488',Family:'#db2777',Urgent:'#ef4444',Other:'#d97706'};
const STK=['🎂','✈️','🩺','🏋️','🎉','💼','📞','🛒','📚','🎬','🍽️','💊','🎓','💍','🏖️','⚽'];
const REM=[[0,'At start'],[10,'10 min before'],[60,'1 hour before'],[1440,'1 day before']];
const HOL={'01-01':"New Year's Day",'02-14':"Valentine's Day",'03-08':"Women's Day",'04-22':'Earth Day','05-01':'Labour Day','10-31':'Halloween','12-25':'Christmas','12-31':"New Year's Eve"};
let D=JSON.parse(localStorage.getItem(KEY)||'null')||{ev:[],set:{fdow:0,wk:false,hol:true,alert:'medium',theme:'auto'},fired:{}};
let V='month',cur=new Date(),sel=ds(new Date()),dip;
const save=()=>localStorage.setItem(KEY,JSON.stringify(D));
function ds(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
const P=s=>{const[a,b,c]=s.split('-');return new Date(+a,b-1,+c)},add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mname=(m,y)=>new Date(y,m,1).toLocaleString(undefined,{month:'long'}),tm=t=>t;
function occ(e,s){const d=P(s),b=P(e.date);if(d<b)return false;
 if(e.repeat=='daily')return true;
 if(e.repeat=='weekly')return(e.days&&e.days.length?e.days:[b.getDay()]).includes(d.getDay());
 if(e.repeat=='monthly')return d.getDate()==b.getDate();
 if(e.repeat=='yearly')return d.getDate()==b.getDate()&&d.getMonth()==b.getMonth();
 return s<=(e.endDate||e.date)}
const evOn=s=>D.ev.filter(e=>occ(e,s)).sort((a,b)=>(b.allDay-a.allDay)||(a.start||'').localeCompare(b.start||''));
const hol=s=>D.set.hol&&HOL[s.slice(5)];
const wkNo=d=>{const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);return Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7)};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e.t);e.t=setTimeout(()=>e.classList.remove('on'),3000)}
const dnames=()=>{const o=[];for(let i=0;i<7;i++)o.push(new Date(2023,0,1+(i+D.set.fdow)%7).toLocaleString(undefined,{weekday:'narrow'}));return o};
const when=e=>e.allDay?'All day':e.start+(e.end?' – '+e.end:'');

/* ---------- views ---------- */
function monthCells(y,m,mini){
 const off=(new Date(y,m,1).getDay()-D.set.fdow+7)%7,n=new Date(y,m+1,0).getDate(),rows=Math.ceil((off+n)/7),t=ds(new Date());let h='';
 for(let i=0;i<rows*7;i++){
  if(i%7==0&&D.set.wk&&!mini)h+=`<div class="wk">${wkNo(new Date(y,m,i-off+1+3))}</div>`;
  const d=new Date(y,m,i-off+1),s=ds(d),o=d.getMonth()!=m;
  if(mini){h+=o?'<span></span>':`<span class="${s==t?'t':''}">${d.getDate()}</span>`;continue}
  const ev=evOn(s),hl=hol(s);
  h+=`<div class="c${o?' o':''}${s==t?' t':''}${s==sel?' sel':''}" data-d="${s}"><b>${d.getDate()}</b>${hl?'<i>★</i>':''}`+ev.slice(0,3).map(e=>`<span class="chip" data-id="${e.id}" style="background:${COL[e.color]||COL.Personal}">${e.sticker||''}${esc(e.title)}</span>`).join('')+(ev.length>3?`<i>+${ev.length-3}</i>`:'')+'</div>'}
 return h}
function card(e,s){return `<div class="card" data-id="${e.id}" data-d="${s}" style="border-color:${COL[e.color]||COL.Personal}"><span class="e">${e.sticker||'📌'}</span><div><b>${esc(e.title)}</b><small>${when(e)}${e.loc?' · '+esc(e.loc):''}</small></div>${e.loc?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.loc)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">📍</a>`:''}</div>`}
function dayList(s){const ev=evOn(s),h=hol(s);return (h?`<div class="card h"><span class="e">★</span><div>${h}</div></div>`:'')+ev.map(e=>card(e,s)).join('')||(h?'':'<div class="empty">Nothing planned. Tap + to add an event.</div>')}
const longD=s=>P(s).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
function render(){
 const y=cur.getFullYear(),m=cur.getMonth(),M=$('#main');
 document.querySelectorAll('#drawer [data-v]').forEach(b=>b.classList.toggle('a',b.dataset.v==V));
 $('#ttl').textContent=V=='year'?y:V=='day'?cur.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):V=='schedule'?'Schedule':mname(m,y)+' '+y;
 if(V=='month')M.innerHTML=`<div class="mc" style="background-image:url(img/${MN[m]}.webp)"><div class="in"><h2>${mname(m,y)}</h2><div class="${D.set.wk?'g w':'g'}">${D.set.wk?'<div></div>':''}${dnames().map(n=>`<div class="dn">${n}</div>`).join('')}${monthCells(y,m)}</div></div></div><h4>${longD(sel)}</h4>${dayList(sel)}`;
 else if(V=='year')M.innerHTML='<div class="yg">'+MN.map((n,i)=>`<div class="mc" data-m="${i}" style="background-image:url(img/${n}.webp)"><div class="in"><h3>${mname(i,y)}</h3><div class="g">${dnames().map(x=>`<span>${x}</span>`).join('')}${monthCells(y,i,1)}</div></div></div>`).join('')+'</div>';
 else if(V=='week'){const st=add(cur,-((cur.getDay()-D.set.fdow+7)%7));M.innerHTML=[...Array(7)].map((_,i)=>{const d=add(st,i),s=ds(d);return `<h4 data-d="${s}">${longD(s)}${s==ds(new Date())?' · Today':''}</h4>${dayList(s)}`}).join('')}
 else if(V=='day'){const s=ds(cur),ev=evOn(s);let h=(hol(s)?`<div class="card h"><span class="e">★</span><div>${hol(s)}</div></div>`:'')+ev.filter(e=>e.allDay).map(e=>card(e,s)).join('');
  for(let i=0;i<24;i++){const k=String(i).padStart(2,'0');h+=`<div class="hr"><span>${k}:00</span><div>${ev.filter(e=>!e.allDay&&e.start.slice(0,2)==k).map(e=>card(e,s)).join('')}</div></div>`}M.innerHTML=h}
 else{let h='',n=0;for(let i=0;i<90;i++){const s=ds(add(new Date(),i)),l=dayList(s);if(l.includes('empty'))continue;n++;h+=`<h4>${longD(s)}</h4>${l}`}M.innerHTML=h||'<div class="empty">No upcoming events.</div>'}
 const cd=D.ev.filter(e=>e.cd&&e.date>=ds(new Date())).sort((a,b)=>a.date.localeCompare(b.date));
 $('#cd').innerHTML=cd.map(e=>{const n=Math.round((P(e.date)-P(ds(new Date())))/864e5);return `<span>${e.sticker||'⏳'} ${esc(e.title)}: ${n?n+' days':'today'}</span>`}).join('')}
function nav(n){if(V=='year')cur.setFullYear(cur.getFullYear()+n);else if(V=='month'){cur=new Date(cur.getFullYear(),cur.getMonth()+n,1);sel=ds(cur)}else if(V=='week')cur=add(cur,7*n);else if(V=='day'){cur=add(cur,n);sel=ds(cur)}render()}
function setV(v){V=v;$('#drawer').classList.remove('on');$('#scrim').classList.remove('on');render()}

/* ---------- event editor ---------- */
function editor(id,date){
 const e=D.ev.find(x=>x.id==id)||{id:'',title:'',sticker:'',date:date||sel,endDate:'',allDay:false,start:'09:00',end:'10:00',loc:'',repeat:'none',rem:[10],color:'Personal',guests:'',notes:'',cd:false};
 const dg=$('#dlg');dg.innerHTML=`<input class="t" id="f-t" placeholder="Add title" value="${esc(e.title)}">
 <label>Sticker</label><div class="st">${STK.map(s=>`<button type="button" class="${s==e.sticker?'on':''}">${s}</button>`).join('')}</div>
 <div class="sw"><span>All day</span><input type="checkbox" id="f-ad" ${e.allDay?'checked':''}></div>
 <div class="row"><div><label>Starts</label><input type="date" id="f-d" value="${e.date}"></div><div><label>Ends</label><input type="date" id="f-ed" value="${e.endDate||e.date}"></div></div>
 <div class="row" id="f-tm"><div><label>From</label><input type="time" id="f-s" value="${e.start}"></div><div><label>To</label><input type="time" id="f-e" value="${e.end}"></div></div>
 <label>Location</label><input id="f-l" placeholder="Place or address" value="${esc(e.loc)}">
 <label>Repeat</label><select id="f-r">${['none','daily','weekly','monthly','yearly'].map(r=>`<option value="${r}" ${r==e.repeat?'selected':''}>${r=='none'?'Does not repeat':r[0].toUpperCase()+r.slice(1)}</option>`).join('')}</select>
 <label>Reminders</label><div class="rm">${REM.map(([m,l])=>`<label><input type="checkbox" value="${m}" ${e.rem.includes(m)?'checked':''}>${l}</label>`).join('')}</div>
 <label>Category</label><div class="cl">${Object.keys(COL).map(c=>`<button type="button" style="background:${COL[c]}" class="${c==e.color?'on':''}">${c}</button>`).join('')}</div>
 <label>Guests (emails)</label><input id="f-g" value="${esc(e.guests)}" placeholder="name@example.com, …">
 <label>Notes</label><textarea id="f-n" rows="3">${esc(e.notes)}</textarea>
 <div class="sw"><span>Show countdown</span><input type="checkbox" id="f-cd" ${e.cd?'checked':''}></div>
 <div class="act">${e.id?'<button class="d" id="f-x">Delete</button>':''}<button id="f-c">Cancel</button><button class="p" id="f-ok">Save</button></div>`;
 let stk=e.sticker,col=e.color;const tg=()=>$('#f-tm').style.display=$('#f-ad').checked?'none':'flex';tg();$('#f-ad').onchange=tg;
 dg.querySelectorAll('.st button').forEach(b=>b.onclick=()=>{stk=stk==b.textContent?'':b.textContent;dg.querySelectorAll('.st button').forEach(x=>x.classList.toggle('on',x.textContent==stk))});
 dg.querySelectorAll('.cl button').forEach(b=>b.onclick=()=>{col=b.textContent;dg.querySelectorAll('.cl button').forEach(x=>x.classList.toggle('on',x==b))});
 $('#f-c').onclick=()=>dg.close();if(e.id)$('#f-x').onclick=()=>{if(confirm('Delete this event?')){D.ev=D.ev.filter(x=>x.id!=e.id);save();dg.close();render()}};
 $('#f-ok').onclick=()=>{const t=$('#f-t').value.trim();if(!t){toast('Add a title first');return}
  const n={id:e.id||'e'+Date.now(),title:t,sticker:stk,date:$('#f-d').value,endDate:$('#f-ed').value,allDay:$('#f-ad').checked,start:$('#f-s').value,end:$('#f-e').value,loc:$('#f-l').value.trim(),repeat:$('#f-r').value,rem:[...dg.querySelectorAll('.rm input:checked')].map(x=>+x.value),color:col,guests:$('#f-g').value.trim(),notes:$('#f-n').value,cd:$('#f-cd').checked};
  if(!n.date){toast('Pick a date');return}if(n.endDate<n.date)n.endDate=n.date;
  D.ev=D.ev.filter(x=>x.id!=n.id).concat(n);save();dg.close();sel=n.date;cur=P(n.date);render();if(n.rem.length)askNotif()};
 dg.showModal()}
function askNotif(){if('Notification'in window&&Notification.permission=='default')Notification.requestPermission()}

/* ---------- settings ---------- */
function settings(){const s=D.set,dg=$('#dlg');
 dg.innerHTML=`<h3 style="margin:0 0 6px;font-family:Georgia,serif">Settings</h3>
 <div class="sw">First day of week<select id="s-f">${[[0,'Sunday'],[1,'Monday'],[6,'Saturday']].map(([v,l])=>`<option value="${v}" ${s.fdow==v?'selected':''}>${l}</option>`).join('')}</select></div>
 <div class="sw">Show week numbers<input type="checkbox" id="s-w" ${s.wk?'checked':''}></div>
 <div class="sw">Show holidays<input type="checkbox" id="s-h" ${s.hol?'checked':''}></div>
 <div class="sw">Alert style<select id="s-a">${['light','medium','strong'].map(a=>`<option ${s.alert==a?'selected':''}>${a}</option>`).join('')}</select></div>
 <div class="sw">Theme<select id="s-t">${['auto','light','dark'].map(a=>`<option ${s.theme==a?'selected':''}>${a}</option>`).join('')}</select></div>
 <p style="color:var(--mut);font-size:13px">Light: notification. Medium: notification and sound. Strong: full-screen alarm until you dismiss it. Alerts fire while the app is open or running in the background.</p>
 <div class="act"><button id="s-n">Allow notifications</button>${dip?'<button id="s-i">Install app</button>':''}</div>
 <div class="act"><button id="s-ex">Back up events</button><button id="s-im">Restore backup</button></div>
 <p style="color:var(--mut);font-size:13px">Events live only on this device. Uninstalling the app erases them, so back up first.</p>
 <div class="act"><button class="p" id="s-ok">Done</button></div>`;
 $('#s-ok').onclick=()=>{s.fdow=+$('#s-f').value;s.wk=$('#s-w').checked;s.hol=$('#s-h').checked;s.alert=$('#s-a').value;s.theme=$('#s-t').value;save();theme();dg.close();render()};
 $('#s-n').onclick=()=>'Notification'in window?Notification.requestPermission().then(p=>toast('Notifications '+p)):toast('Not supported here');
 if(dip)$('#s-i').onclick=()=>{dip.prompt();dip=null};
 $('#s-ex').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:'application/json'}));a.download='calendar-backup.json';a.click()};
 $('#s-im').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=()=>i.files[0].text().then(t=>{try{const x=JSON.parse(t);if(!x.ev)throw 0;D=x;save();theme();dg.close();render();toast('Backup restored')}catch{toast('That file is not a valid backup')}});i.click()};
 dg.showModal()}
const theme=()=>D.set.theme=='auto'?document.documentElement.removeAttribute('data-theme'):document.documentElement.dataset.theme=D.set.theme;

/* ---------- reminders ---------- */
function beep(){try{const a=new AudioContext(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();o.stop(a.currentTime+.4)}catch{}}
function ring(e,r){const m=e.title+' · '+(r?REM.find(x=>x[0]==r)[1].toLowerCase():'now');
 if(D.set.alert=='strong'){const d=document.createElement('dialog');d.innerHTML=`<h2 style="text-align:center">${e.sticker||'⏰'} ${esc(e.title)}</h2><p style="text-align:center">${m}</p><div class="act"><button class="p">Dismiss</button></div>`;document.body.append(d);d.showModal();navigator.vibrate&&navigator.vibrate([400,200,400,200,400]);beep();d.querySelector('button').onclick=()=>d.remove()}
 else{toast('⏰ '+m);if(D.set.alert=='medium')beep()}
 if('Notification'in window&&Notification.permission=='granted')navigator.serviceWorker?.ready.then(r=>r.showNotification(e.title,{body:m,icon:'icons/icon-192.png',tag:e.id}))}
function tick(){const now=Date.now();let ch=0;for(let i=0;i<3;i++){const s=ds(add(new Date(),i));evOn(s).forEach(e=>{const st=new Date(s+'T'+(e.allDay?'09:00':e.start)).getTime();e.rem.forEach(r=>{const k=e.id+s+r,f=st-r*6e4;if(now>=f&&now<f+36e5&&!D.fired[k]){D.fired[k]=1;ch=1;ring(e,r)}})})}
 if(ch){const ks=Object.keys(D.fired);if(ks.length>300)ks.slice(0,150).forEach(k=>delete D.fired[k]);save()}}

/* ---------- events wiring ---------- */
$('#menu').onclick=()=>{$('#drawer').classList.add('on');$('#scrim').classList.add('on')};
$('#scrim').onclick=()=>{$('#drawer').classList.remove('on');$('#scrim').classList.remove('on')};
document.querySelectorAll('#drawer [data-v]').forEach(b=>b.onclick=()=>setV(b.dataset.v));
$('#set').onclick=()=>{setV(V);settings()};$('#fab').onclick=()=>editor('',V=='month'||V=='day'?sel:ds(new Date()));
$('#prev').onclick=()=>nav(-1);$('#next').onclick=()=>nav(1);$('#today').onclick=()=>{cur=new Date();sel=ds(cur);render()};
$('#ttl').onclick=()=>setV(V=='month'?'year':'month');
let drag=null,lt,sx=0;const M=$('#main');
M.addEventListener('pointerdown',e=>{sx=e.clientX;const c=e.target.closest('.chip');if(!c)return;lt=setTimeout(()=>{drag=c;c.classList.add('lift');navigator.vibrate&&navigator.vibrate(15)},450)});
M.addEventListener('pointerup',e=>{clearTimeout(lt);const c=e.target.closest('.chip');
 if(drag){const to=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-d]'),ev=D.ev.find(x=>x.id==drag.dataset.id);drag.classList.remove('lift');
  if(to&&ev){const old=P(ev.date),len=Math.round((P(ev.endDate||ev.date)-old)/864e5),nd=P(to.dataset.d);ev.date=ds(nd);ev.endDate=ds(add(nd,len));sel=ev.date;save();toast('Moved to '+longD(ev.date))}drag=null;render();return}
 if(Math.abs(e.clientX-sx)>60){nav(e.clientX<sx?1:-1);return}
 if(c){editor(c.dataset.id);return}
 const k=e.target.closest('.card');if(k&&!e.target.closest('a')){editor(k.dataset.id);return}
 const y=e.target.closest('[data-m]');if(y){cur=new Date(cur.getFullYear(),+y.dataset.m,1);sel=ds(cur);setV('month');return}
 const dc=e.target.closest('.c');if(dc){const s=dc.dataset.d;if(s==sel&&V=='month')editor('',s);else{sel=s;cur=P(s);render()}}});
M.addEventListener('pointercancel',()=>clearTimeout(lt));
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
theme();render();tick();setInterval(tick,20000);document.addEventListener('visibilitychange',()=>!document.hidden&&(render(),tick()));

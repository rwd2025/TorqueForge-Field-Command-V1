const DEFAULTS={rate:135,service:250,tax:7,card:0,markup:15,rent:1500,insurance:145,electric:250,other:0,toolPayment:0,taxReserve:20,profitGoal:3000,billWeeks:4.3,shopPhone:'2605026222',backend:'https://rolling-wrench-ai-backend.onrender.com',supabase:'https://uxpkqwcmvtqvubibbrek.supabase.co',supabaseKey:'sb_publishable_MIwgVQm6UPIbd76uIm2-tw_NzSw19ym',theme:'green',mode:'shop'};
function $(id){return document.getElementById(id)}
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(n){return '$'+Number(n||0).toFixed(2)}
function now(){return new Date().toLocaleString()}
function settings(){return {...DEFAULTS,...store.get('settings',{})}}
let current='home',hist=[];
function show(id){if(!$(id))return;if(current!==id)hist.push(current);current=id;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');scrollTo({top:0,behavior:'smooth'});renderAll()}
function goBack(){const last=hist.pop();if(last){current=last;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(last)?.classList.add('active')}else show('home')}
function alertMsg(msg){const a=store.get('alerts',[]);a.unshift({msg,date:now()});store.set('alerts',a.slice(0,20));renderAlerts()}
function renderAlerts(){const box=$('alertsBox');if(!box)return;const a=store.get('alerts',[]);box.textContent=a.length?a.map(x=>`${x.date} — ${x.msg}`).join('\n'):'NO ALERTS'}
function clearAlerts(){store.set('alerts',[]);renderAlerts()}
function signIn(){const n=$('loginName').value.trim();if(!n)return alert('Enter employee name');localStorage.setItem('employeeName',n);$('login').classList.add('hide');alertMsg(n+' signed in')}
function quickStart(){localStorage.setItem('employeeName','James Jacobs');$('login').classList.add('hide')}
function loadLogin(){if(localStorage.getItem('employeeName'))$('login').classList.add('hide')}
function setTheme(t){document.body.className=document.body.className.replace(/\b(green|orange|red|blue|night|chrome|patriot|forge|carbon|diamond|steel|flag|wide|compact|tablet)\b/g,'').trim();document.body.classList.add(t||'green');const s=settings();s.theme=t||'green';store.set('settings',s);document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#00ff7a')}
function setBackground(bg){document.body.className=document.body.className.replace(/\b(carbon|diamond|steel|flag)\b/g,'').trim();document.body.classList.add(bg||'carbon');const s=settings();s.background=bg||'carbon';store.set('settings',s)}
function setLayout(l){document.body.className=document.body.className.replace(/\b(wide|compact|tablet|simple)\b/g,'').trim();document.body.classList.add(l||'tablet');const s=settings();s.layout=l||'tablet';store.set('settings',s)}
function setAccessMode(m){document.body.className=document.body.className.replace(/\b(large|contrast|colorblind)\b/g,'').trim();if(m&&m!=='standard')document.body.classList.add(m);const s=settings();s.access=m||'standard';store.set('settings',s)}
function setMotion(m){document.body.classList.toggle('reduced',m==='reduced');const s=settings();s.motion=m||'normal';store.set('settings',s)}
function setMode(m){const s=settings();s.mode=m;store.set('settings',s);$('modeBadge').textContent=m==='roadside'?'ROADSIDE MODE':'SHOP MODE';$('serviceToggle').checked=m==='roadside';$('shopBtn')?.classList.toggle('active',m!=='roadside');$('roadBtn')?.classList.toggle('active',m==='roadside');alertMsg((m==='roadside'?'Roadside':'Shop')+' mode')}
function saveSettings(){const s=settings();s.rate=+$('setRate').value||DEFAULTS.rate;s.rent=+$('rent')?.value||DEFAULTS.rent;s.insurance=+$('insurance')?.value||DEFAULTS.insurance;s.electric=+$('electric')?.value||DEFAULTS.electric;s.other=+$('otherExpense')?.value||0;s.toolPayment=+$('toolPayment')?.value||0;s.taxReserve=+$('taxReserve')?.value||20;s.profitGoal=+$('profitGoal')?.value||3000;s.billWeeks=+$('billWeeks')?.value||4.3;s.backend=$('backendUrl').value.trim()||DEFAULTS.backend;s.supabase=$('supabaseUrl').value.trim()||DEFAULTS.supabase;s.supabaseKey=$('supabaseKey').value.trim()||DEFAULTS.supabaseKey;s.theme=$('theme').value||'green';s.background=$('bgStyle')?.value||'carbon';s.layout=$('layoutStyle')?.value||'tablet';s.access=$('accessMode')?.value||'standard';s.motion=$('motionMode')?.value||'normal';s.owner=$('ownerName').value.trim()||'James Jacobs';s.role=$('role').value;store.set('settings',s);setTheme(s.theme);setBackground(s.background);setLayout(s.layout);setAccessMode(s.access);setMotion(s.motion);$('settingsOut').textContent='Settings saved. '+now();alertMsg('Settings saved')}
function loadSettings(){const s=settings();$('quoteRate').value=s.rate;$('serviceCall').value=s.service;$('taxRate').value=s.tax;$('cardFee').value=s.card;$('partsMarkup').value=s.markup;$('rent').value=s.rent;$('insurance').value=s.insurance;$('electric').value=s.electric;$('otherExpense').value=s.other;if($('toolPayment'))$('toolPayment').value=s.toolPayment||0;if($('taxReserve'))$('taxReserve').value=s.taxReserve||20;if($('profitGoal'))$('profitGoal').value=s.profitGoal||3000;if($('billWeeks'))$('billWeeks').value=s.billWeeks||4.3;$('backendUrl').value=s.backend;$('supabaseUrl').value=s.supabase;$('supabaseKey').value=s.supabaseKey;$('setRate').value=s.rate;$('ownerName').value=s.owner||localStorage.getItem('employeeName')||'James Jacobs';$('theme').value=s.theme||'green'; if($('bgStyle')) $('bgStyle').value=s.background||'carbon'; if($('layoutStyle')) $('layoutStyle').value=s.layout||'tablet'; setTheme(s.theme||'green');setBackground(s.background||'carbon');setLayout(s.layout||'tablet');setMode(s.mode||'shop')}
async function decodeVin(){const vin=$('vin').value.trim().toUpperCase();if(!vin)return alert('Enter VIN');$('truckOut').textContent='Decoding VIN...';try{const r=await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/'+encodeURIComponent(vin)+'?format=json');const d=(await r.json()).Results?.[0]||{};$('year').value=d.ModelYear||$('year').value;$('make').value=d.Make||$('make').value;$('model').value=d.Model||$('model').value;$('engine').value=d.EngineModel||d.EngineManufacturer||$('engine').value;$('truckOut').textContent='VIN decoded. Verify engine/transmission before quote.';saveTruck(false)}catch(e){$('truckOut').textContent='VIN decode failed: '+e.message}}
function saveTruck(showAlert=true){const t={vin:$('vin').value.trim().toUpperCase(),unit:$('unit').value.trim(),year:$('year').value.trim(),make:$('make').value.trim(),model:$('model').value.trim(),engine:$('engine').value.trim(),mileage:$('mileage').value.trim()};store.set('truck',t);if(showAlert)alertMsg('Truck saved');renderAll()}
function clearTruck(){['vin','unit','year','make','model','engine','mileage'].forEach(id=>$(id).value='');store.set('truck',{});renderAll()}
async function saveCustomer(){
  const c={
    name:$('custName').value.trim(),
    phone:$('custPhone').value.trim(),
    email:$('custEmail').value.trim(),
    address:$('custAddress').value.trim()
  };
  if(!c.name && !c.phone){alert('Enter customer name or phone');return;}
  store.set('customer',c);
  renderAll();
  try{
    await supabaseInsert('customers',c);
    alertMsg('Customer saved to Supabase');
    alert('Customer saved to Supabase');
  }catch(e){
    alertMsg('Customer saved locally only: '+e.message);
    alert('Customer saved locally only: '+e.message);
  }
}
function clearCustomer(){['custName','custPhone','custEmail','custAddress'].forEach(id=>$(id).value='');store.set('customer',{});renderAll()}
let activeClock=store.get('activeClock','A');
let clocks={A:{elapsed:0,running:false,start:0,label:'',stopped:false},B:{elapsed:0,running:false,start:0,label:'',stopped:false},C:{elapsed:0,running:false,start:0,label:'',stopped:false}};
function loadClocks(){clocks={...clocks,...store.get('clocks',{})}}
function saveClocks(){const el=$('activeClockLabel');if(el&&clocks[activeClock])clocks[activeClock].label=el.value;['A','B','C'].forEach(k=>{const old=$('clock'+k+'Label');if(old)clocks[k].label=old.value});store.set('activeClock',activeClock);store.set('clocks',clocks)}
function selectClock(k){saveClocks();activeClock=k;store.set('activeClock',k);renderClocks();alertMsg('Clock '+k+' selected')}
function clockMs(k){const c=clocks[k];return c.elapsed+(c.running?Date.now()-c.start:0)}
function hours(k){return clockMs(k)/36e5}
function clockStart(k){const c=clocks[k];if(!c.running){c.running=true;c.stopped=false;c.start=Date.now();alertMsg('Clock '+k+' running')}saveClocks();renderClocks()}
function clockPause(k){const c=clocks[k];if(c.running){c.elapsed+=Date.now()-c.start;c.running=false;c.start=0;alertMsg('Clock '+k+' paused')}saveClocks();renderClocks()}
function clockStop(k){const c=clocks[k];if(c.running){c.elapsed+=Date.now()-c.start;c.running=false;c.start=0;}c.stopped=true;saveClocks();renderClocks();alertMsg('Clock '+k+' stopped at '+$('clock'+k+'Time').textContent+' / '+$('clock'+k+'Money').textContent)}
function clockReset(k){clocks[k]={elapsed:0,running:false,start:0,label:'',stopped:false};$('clock'+k+'Label').value='';saveClocks();renderClocks();alertMsg('Clock '+k+' cleared')}
function clockToInvoice(k){const h=hours(k);$('quoteHours').value=h.toFixed(2);$('invoiceNotes').value+=`\nClock ${k}: ${h.toFixed(2)} hrs ${money(h*settings().rate)}`;show('invoice')}
function renderClocks(){
  ['A','B','C'].forEach(k=>{
    const ms=clockMs(k),sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),ss=sec%60;
    const rate=+$('quoteRate')?.value||settings().rate;
    const time=[h,m,ss].map(x=>String(x).padStart(2,'0')).join(':');
    const status=clocks[k].running?'RUNNING':(clocks[k].stopped?'STOPPED':(ms?'PAUSED':'READY'));
    const oldTime=$('clock'+k+'Time'); if(oldTime) oldTime.textContent=time;
    const oldMoney=$('clock'+k+'Money'); if(oldMoney) oldMoney.textContent=money(ms/36e5*rate);
    const oldStatus=$('clock'+k+'Status'); if(oldStatus) oldStatus.textContent=status;
    const oldLabel=$('clock'+k+'Label'); if(oldLabel) oldLabel.value=clocks[k].label||'';
    const chip=$('clock'+k+'Chip'); if(chip){chip.textContent=status; chip.className=status.toLowerCase();}
    const tab=$('clockTab'+k); if(tab) tab.classList.toggle('active',k===activeClock);
  });
  const k=activeClock||'A', ms=clockMs(k),sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),ss=sec%60;
  const rate=+$('quoteRate')?.value||settings().rate;
  const status=clocks[k].running?'RUNNING':(clocks[k].stopped?'STOPPED':(ms?'PAUSED':'READY'));
  if($('activeClockTitle')) $('activeClockTitle').textContent='CLOCK '+k;
  if($('activeClockStatus')) {$('activeClockStatus').textContent=status; $('activeClockStatus').className=status.toLowerCase();}
  if($('activeClockTime')) $('activeClockTime').textContent=[h,m,ss].map(x=>String(x).padStart(2,'0')).join(':');
  if($('activeClockMoney')) $('activeClockMoney').textContent=money(ms/36e5*rate);
  if($('activeClockLabel')) $('activeClockLabel').value=clocks[k].label||'';
}
async function lookupPart(){const q=$('partQuery').value.trim();if(!q)return alert('Enter part');$('partsOut').innerHTML='<div class="rw-loading">Searching parts without leaving app...</div>';const local=localPartSearch(q);let backend='';try{const x=await tryBackend('/api/parts',{q,query:q,vehicle:store.get('truck',{})});backend=formatBackendPart(x,q)||'';alertMsg('Backend parts lookup complete')}catch(e){backend='';} $('partsOut').innerHTML=renderPartsResults(q,backend||local);}
function localPartSearch(q){const parts=[['4376357','Cummins ISX Water Pump','Cooling'],['2881753','Cummins ISX Turbocharger','Air'],['4954200','Cummins ISX Fuel Injector','Fuel'],['4309129','Cummins ISX NOx Sensor','Emissions'],['A4722001601','Detroit DD15 Water Pump','Cooling'],['2293961','PACCAR MX-13 NOx Sensor','Emissions'],['1931652','PACCAR MX-13 Turbo Actuator','Air'],['1848410C94','International DT466 ICP Sensor','Sensors'],['1876105C95','MaxxForce 13 EGR Valve','Emissions']];const s=q.toLowerCase();const hits=parts.filter(p=>p.join(' ').toLowerCase().includes(s)||s.split(/\s+/).some(w=>w.length>2&&p.join(' ').toLowerCase().includes(w)));return hits.length?hits.map(p=>`${p[0]} — ${p[1]} — ${p[2]}\nVERIFY BY VIN/ESN BEFORE ORDERING`).join('\n\n'):`No local match for: ${q}`}
function formatBackendPart(x,q){if(!x)return'';if(typeof x==='string')return x;return x.answer||x.message||x.result||JSON.stringify(x,null,2)}
function renderPartsResults(q,text){const safe=esc(text||'No result');const suppliers=['FleetPride','NAPA','O\'Reilly','TruckPro','Dealer','Google'];const ids=['fleetpride','napa','oreilly','truckpro','dealer','google'];const cards=suppliers.map((n,i)=>`<button class="supplierCard" onclick="supplier('${ids[i]}')"><b>${n}</b><span>Search ${esc(q)}</span></button>`).join('');return `<div class="partsResult"><h3>PART RESULT</h3><pre>${safe}</pre><div class="supplierCards">${cards}</div><div class="buttonRow"><button onclick="addPartLine()">ADD TO QUOTE</button><button onclick="scanToInvoice()">ADD CURRENT SCAN TO INVOICE</button></div></div>`}
function supplier(s){const q=encodeURIComponent($('partQuery').value||'diesel truck parts'); if(s==='oreilly')s='oreilly'; const urls={fleetpride:`https://www.google.com/search?q=site:fleetpride.com+${q}`,napa:`https://www.napaonline.com/en/search?text=${q}`,oreilly:`https://www.oreillyauto.com/search?q=${q}`,truckpro:`https://www.google.com/search?q=site:truckpro.com+${q}`,google:`https://www.google.com/search?q=${q}`,dealer:`https://www.google.com/maps/search/heavy+duty+truck+parts+${q}`};window.open(urls[s],'_blank')}
function addPartLine(){const q=$('partQuery').value.trim();if(!q)return; $('quoteDesc').value+='\nPart: '+q; alertMsg('Part added to quote notes')}
function clearParts(){$('partQuery').value='';$('partsOut').textContent=''}
async function scanImage(e){const f=e.target.files?.[0];if(!f)return;const p=$('scanPreview');p.src=URL.createObjectURL(f);p.style.display='block';$('scanOut').textContent='Reading image...';try{if(!window.Tesseract)throw new Error('OCR library not loaded');const r=await Tesseract.recognize(f,'eng');$('scanText').value=r.data.text||'';$('scanOut').textContent='OCR complete. Tap PARSE.'}catch(err){$('scanOut').textContent='OCR failed: '+err.message}}
function parsedScan(){const text=$('scanText').value||'';const prices=[...(text.matchAll(/\$?\s*(\d{1,5}\.\d{2})/g))].map(m=>m[1]);const part=(text.match(/\b[A-Z]{0,4}\d{4,10}[A-Z0-9-]{0,8}\b/i)||[''])[0];const vendor=(text.match(/(FleetPride|NAPA|O.?Reilly|TruckPro|Cummins|Detroit|Peterbilt|Kenworth|Freightliner)/i)||[''])[0];return{part,price:prices.pop()||'',vendor,text}}
function parseScan(){const p=parsedScan();$('scanOut').textContent=`VENDOR: ${p.vendor||'UNKNOWN'}\nPART: ${p.part||'UNKNOWN'}\nPRICE: ${p.price||'UNKNOWN'}\nTYPE: ${$('scanType').value}`}
function scanToQuote(){parseScan();const p=parsedScan();if(p.price)$('quoteParts').value=(+$('quoteParts').value||0)+parseFloat(p.price);if(p.part)$('quoteDesc').value+=`\nScanned part: ${p.part} ${p.vendor?`(${p.vendor})`:''}`;show('quote')}
function scanToInvoice(){parseScan();$('invoiceNotes').value+='\nSCAN:\n'+$('scanOut').textContent;scanToQuote();show('invoice')}
function clearScan(){$('scanText').value='';$('scanOut').textContent='';$('scanFile').value='';$('scanPreview').style.display='none'}
function sayQuote(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return alert('Voice not supported on this browser');const r=new SR();r.lang='en-US';r.onresult=e=>{const t=e.results[0][0].transcript;$('quoteJob').value=t;autoBuildFromWords(t)};r.start()}
function autoBuildFromWords(t){const s=t.toLowerCase();$('quoteDesc').value=t; if(s.includes('brake')){$('quoteHours').value=s.includes('trailer')?'3.5':'4';$('quoteJob').value='Brake Job'} else if(s.includes('clutch')){$('quoteHours').value='11';$('quoteJob').value='Clutch Job'} else if(s.includes('water pump')){$('quoteHours').value='4';$('quoteJob').value='Water Pump'} else if(s.includes('diagnos')){$('quoteHours').value='1';$('quoteJob').value='Diagnostic'} buildQuote()}
function calcTotals(){const h=+$('quoteHours').value||0,r=+$('quoteRate').value||settings().rate,rawParts=+$('quoteParts').value||0,markup=+$('partsMarkup').value||0,p=rawParts*(1+markup/100),svc=$('serviceToggle').checked?(+$('serviceCall').value||0):0,taxPct=+$('taxRate').value||0,cardPct=+$('cardFee').value||0;const labor=h*r,sub=labor+p+svc,tax=sub*taxPct/100,card=(sub+tax)*cardPct/100,total=sub+tax+card;return{h,r,rawParts,markup,p,svc,labor,sub,tax,card,total}}
function businessInfo(){const s=settings();return {name:'Rolling Wrench Diesel', owner:s.owner||'James Jacobs', phone:'260-502-6222', web:'www.rollingwrenchdiesel.com'}}
function truckLine(){const t=store.get('truck',{});return [t.unit,t.year,t.make,t.model,t.engine].filter(Boolean).join(' ')||'—'}
function invoiceHeader(title){
  const b=businessInfo(), c=store.get('customer',{}), t=store.get('truck',{});
  return `<div class="rw-invoice">
    <div class="rw-inv-top">
      <div class="rw-logoBox"><img src="logo.svg" alt="RW"></div>
      <div class="rw-shop">
        <h2>${esc(b.name)}</h2>
        <div>${esc(b.owner)} • ${esc(b.phone)}</div>
        <div>${esc(b.web)}</div>
      </div>
      <div class="rw-inv-title"><b>${esc(title)}</b><span>${now()}</span></div>
    </div>
    <div class="rw-inv-grid">
      <div><label>BILL TO</label><strong>${esc(c.name||'—')}</strong><span>${esc(c.phone||'')}</span><span>${esc(c.email||'')}</span></div>
      <div><label>UNIT / TRUCK</label><strong>${esc(truckLine())}</strong><span>VIN: ${esc(t.vin||'—')}</span><span>Mileage: ${esc(t.mileage||'—')}</span></div>
    </div>`;
}
function invoiceMoneyTable(x){
  return `<div class="rw-money-table">
    <div><span>Labor</span><b>${money(x.labor)}</b></div>
    <div><span>Service Call</span><b>${money(x.svc)}</b></div>
    <div><span>Parts</span><b>${money(x.p)}</b></div>
    <div><span>Tax</span><b>${money(x.tax)}</b></div>
    <div><span>Card Fee</span><b>${money(x.card)}</b></div>
    <div class="rw-total"><span>TOTAL DUE</span><b>${money(x.total)}</b></div>
  </div>`;
}
function invoiceTerms(){return `<div class="rw-terms"><b>Terms:</b> Payment due upon completion unless otherwise agreed. Parts pricing and availability may change. Customer authorizes Rolling Wrench Diesel to perform the listed work. Recommended re-checks and road-test limitations should be noted on the invoice when applicable.</div>`}
function buildQuote(){
  const x=calcTotals(), signed=quoteSigData()&&!isCanvasBlank($('quoteSigCanvas'));
  let sig=signed?`<div class="rw-sig-block"><b>Customer Quote Approval</b><img src="${quoteSigData()}" alt="Quote signature"></div>`:`<div class="rw-sig-block"><b>Customer Quote Approval</b><div class="rw-not-signed">NOT SIGNED</div></div>`;
  $('quoteOut').innerHTML=invoiceHeader('QUOTE')+`<div class="rw-section"><h3>${esc($('quoteJob').value||'Quote')}</h3><p>${esc($('quoteDesc').value||'').replace(/\n/g,'<br>')}</p></div>${invoiceMoneyTable(x)}${invoiceTerms()}${sig}</div>`;
  store.set('lastQuote',{...x,html:$('quoteOut').innerHTML,plain:$('quoteOut').innerText,signed,date:now()});updateFinance();alertMsg(signed?'Quote built with approval signature':'Quote built')
}
function clearQuote(){['quoteJob','quoteHours','quoteParts','quoteDesc'].forEach(id=>$(id).value='');$('quoteOut').innerHTML='';clearQuoteSignature(false)}
function writeProfessional(type){const map={quote:'quoteDesc',workorder:'woWork'};const id=map[type]||'invoiceNotes';const v=$(id).value.trim();$(id).value='Work will be completed professionally, verified after repair, and documented for customer records. '+v;alertMsg('Professional wording added')}
function quoteSmsText(){buildQuote();return $('quoteOut').innerText+'\n\nReply APPROVED to authorize scheduling. Reply with questions if changes are needed.'}
function sendQuoteToCustomer(){const c=store.get('customer',{});location.href=`sms:${c.phone||''}?&body=${encodeURIComponent(quoteSmsText())}`}
function sendSignedQuoteToShop(){buildQuote();const s=settings();const msg='SIGNED QUOTE / CUSTOMER APPROVAL\n\n'+$('quoteOut').innerText;location.href=`sms:${s.shopPhone||'2605026222'}?&body=${encodeURIComponent(msg)}`}
async function saveQuote(){buildQuote();const q=store.get('lastQuote',{});const list=store.get('quotes',[]);list.unshift(q);store.set('quotes',list);try{await supabaseInsert('quotes',{customer:store.get('customer',{}),truck:store.get('truck',{}),total:q.total,status:q.signed?'approved':'draft',html:q.html,created_at:new Date().toISOString()});alertMsg('Quote saved local + Supabase')}catch(e){alertMsg('Quote saved local only: '+e.message)}updateFinance()}
function quoteToInvoice(){buildQuote();$('invoiceNotes').value=$('quoteOut').innerText;show('invoice')}
function buildWorkOrder(){$('woOut').innerHTML=invoiceHeader('WORK ORDER')+`<div class="rw-section"><h3>Complaint</h3><p>${esc($('woComplaint').value).replace(/\n/g,'<br>')}</p></div><div class="rw-section"><h3>Diagnosis</h3><p>${esc($('woDiagnosis').value).replace(/\n/g,'<br>')}</p></div><div class="rw-section"><h3>Work Performed</h3><p>${esc($('woWork').value).replace(/\n/g,'<br>')}</p></div>${invoiceTerms()}</div>`;alertMsg('Work order built')}
function clearWorkOrder(){['woComplaint','woDiagnosis','woWork'].forEach(id=>$(id).value='');$('woOut').innerHTML=''}
function workToInvoice(){buildWorkOrder();$('invoiceNotes').value=$('woOut').innerText;show('invoice')}
function sigData(){return $('sigCanvas').toDataURL('image/png')}
function isCanvasBlank(c){const blank=document.createElement('canvas');blank.width=c.width;blank.height=c.height;return c.toDataURL()===blank.toDataURL()}
function buildOneInvoice(copyTitle,x,signed){
  const work=esc($('invoiceNotes').value||$('quoteDesc').value||'').replace(/\n/g,'<br>');
  let html=invoiceHeader(copyTitle)+`<div class="rw-section"><h3>Work Performed / Invoice Notes</h3><p>${work||'—'}</p></div>`+invoiceMoneyTable(x)+invoiceTerms()+`<div class="rw-sig-block"><b>Customer Signature</b>`;
  if(signed) html+=`<img src="${sigData()}" alt="Customer signature">`;
  else html+=`<div class="rw-not-signed">NOT SIGNED</div>`;
  html+=`</div></div>`;
  return html;
}
function buildInvoice(){
  const x=calcTotals(), copy=$('invoiceType').value, canvas=$('sigCanvas'), signed=!isCanvasBlank(canvas);
  let html='';
  if(copy==='Both Copies') html=buildOneInvoice('CUSTOMER INVOICE COPY',x,signed)+'<div class="rw-page-break"></div>'+buildOneInvoice('SHOP COPY',x,signed);
  else html=buildOneInvoice(copy.toUpperCase(),x,signed);
  $('invoiceOut').innerHTML=html;
  store.set('lastInvoice',{total:x.total,date:now(),html,plain:$('invoiceOut').innerText,signed});
  updateFinance();alertMsg(signed?'Invoice built with signature':'Invoice built - no signature')
}
function clearInvoice(){['invoiceNotes'].forEach(id=>$(id).value='');$('invoiceOut').innerHTML='';clearSignature()}
function textInvoice(){buildInvoice();const c=store.get('customer',{});location.href=`sms:${c.phone||''}?&body=${encodeURIComponent($('invoiceOut').innerText)}`}
function sendInvoiceToShop(){buildInvoice();const s=settings();location.href=`sms:${s.shopPhone||'2605026222'}?&body=${encodeURIComponent('SHOP COPY / INVOICE\n\n'+$('invoiceOut').innerText)}`}
async function shareInvoice(){buildInvoice();const text=$('invoiceOut').innerText;if(navigator.share){try{await navigator.share({title:'Rolling Wrench Diesel Invoice',text});alertMsg('Invoice share opened');return}catch(e){}}await navigator.clipboard?.writeText(text);alertMsg('Invoice copied for sharing');alert('Invoice copied for sharing')}

async function saveInvoice(){buildInvoice();const list=store.get('invoices',[]);list.unshift(store.get('lastInvoice',{}));store.set('invoices',list);try{await supabaseInsert('invoices',{customer:store.get('customer',{}),truck:store.get('truck',{}),total:store.get('lastInvoice',{}).total,html:store.get('lastInvoice',{}).html,created_at:new Date().toISOString()});alertMsg('Invoice saved local + Supabase')}catch(e){alertMsg('Invoice saved local. Supabase unavailable.')}updateFinance()}
function addSchedule(){const list=store.get('schedule',[]);list.unshift({date:$('schDate').value,time:$('schTime').value,customer:$('schCustomer').value,job:$('schJob').value});store.set('schedule',list);renderSchedule();alertMsg('Schedule added')}
function renderSchedule(){const l=store.get('schedule',[]);$('scheduleOut').textContent=l.length?l.map(x=>`${x.date} ${x.time} — ${x.customer} — ${x.job}`).join('\n'):'NO SCHEDULED WORK'}
function clearSchedule(){store.set('schedule',[]);renderSchedule()}
function updateFinance(){const s=settings();const inv=store.get('invoices',[]).reduce((sum,i)=>sum+(+i.total||0),0);const q=store.get('quotes',[]).reduce((sum,i)=>sum+(+i.total||0),0);const h=['A','B','C'].reduce((sum,k)=>sum+hours(k),0),labor=h*(+$('quoteRate')?.value||s.rate);const over=(+$('rent')?.value||0)+ (+$('insurance')?.value||0)+ (+$('electric')?.value||0)+ (+$('otherExpense')?.value||0)+ (+$('toolPayment')?.value||0);const taxRes=(+$('taxReserve')?.value||20)/100;const goal=+$('profitGoal')?.value||0;const weeks=+$('billWeeks')?.value||4.3;const monthlyNeed=over+goal;const weeklyNeed=monthlyNeed/weeks;const hrsNeed=weeklyNeed/(+$('quoteRate')?.value||s.rate);const projected=inv+labor-over-((inv+labor)*taxRes);$('finLabor').textContent=money(labor);$('finParts').textContent=money(+$('quoteParts').value||0);$('finInvoices').textContent=money(inv);$('finBreakEven').textContent=money(over);if($('finShopPayment'))$('finShopPayment').textContent=money(+$('rent')?.value||0);if($('finWeeklyNeed'))$('finWeeklyNeed').textContent=money(weeklyNeed);if($('finHoursNeed'))$('finHoursNeed').textContent=hrsNeed.toFixed(1);if($('finProfit'))$('finProfit').textContent=money(projected)}
function buildFinancePlan(){updateFinance();const rate=+$('quoteRate')?.value||settings().rate;const over=(+$('rent')?.value||0)+(+$('insurance')?.value||0)+(+$('electric')?.value||0)+(+$('otherExpense')?.value||0)+(+$('toolPayment')?.value||0);const goal=+$('profitGoal')?.value||0;const weeks=+$('billWeeks')?.value||4.3;const need=over+goal;const weekly=need/weeks;const hours=weekly/rate;$('financePlanOut').textContent=`SHOP PAYMENT / BREAK-EVEN PLAN

Monthly overhead: ${money(over)}
Monthly profit goal: ${money(goal)}
Total monthly target: ${money(need)}
Weekly target: ${money(weekly)}
Billable hours needed/week @ ${money(rate)}/hr: ${hours.toFixed(1)} hrs

Suggested plan:
- Track every clock hour.
- Send clock time to invoice.
- Keep service call ON for roadside work.
- Add parts markup before sending quote.
- Save every invoice so finances stay accurate.`}
function clearFinancePlan(){$('financePlanOut').textContent=''}
async function testBackend(){const out=$('settingsOut');out.textContent='Testing backend...';const base=(settings().backend||'').replace(/\/$/,'');try{let r=await fetch(base+'/api/health');if(!r.ok)r=await fetch(base);out.textContent='Backend: '+r.status}catch(e){out.textContent='Backend failed: '+e.message}}
async function testSupabase(){
  const out=$('settingsOut');out.textContent='Testing Supabase...';
  const s=settings();
  try{
    const base=s.supabase.replace(/\/$/,'');
    const r=await fetch(base+'/rest/v1/customers?select=id&limit=1',{
      headers:{apikey:s.supabaseKey,Authorization:'Bearer '+s.supabaseKey}
    });
    let msg='Supabase: '+r.status;
    if(r.ok) msg='Supabase: connected';
    else msg+=' — '+(await r.text()).slice(0,140);
    out.textContent=msg;
  }catch(e){out.textContent='Supabase failed: '+e.message}
}
async function supabaseInsert(table,row){
  const s=settings();
  const url=`${s.supabase.replace(/\/$/,'')}/rest/v1/${table}`;
  const r=await fetch(url,{method:'POST',headers:{apikey:s.supabaseKey,Authorization:'Bearer '+s.supabaseKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});
  if(!r.ok){let txt='';try{txt=await r.text()}catch(e){};throw new Error('Supabase '+r.status+' '+txt.slice(0,120));}
  return true;
}
async function tryBackend(path,body){const base=(settings().backend||'').replace(/\/$/,'');const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('backend '+r.status);return r.json()}
function resetApp(){if(confirm('Reset local app data?')){localStorage.clear();location.reload()}}
function renderAll(){const t=store.get('truck',{}),c=store.get('customer',{});$('activeTruckBox').innerHTML=t.vin?`${esc(t.unit||'')} ${esc(t.year||'')} ${esc(t.make||'')} ${esc(t.model||'')}<br>${esc(t.engine||'')}<br>${esc(t.vin||'')}`:'NO ACTIVE TRUCK';$('activeCustomerBox').innerHTML=c.name?`${esc(c.name)}<br>${esc(c.phone||'')}<br>${esc(c.email||'')}`:'NO CUSTOMER SELECTED';renderClocks();renderAlerts();renderSchedule();updateFinance()}
function loadFields(){const t=store.get('truck',{}),c=store.get('customer',{});Object.entries({vin:t.vin,unit:t.unit,year:t.year,make:t.make,model:t.model,engine:t.engine,mileage:t.mileage,custName:c.name,custPhone:c.phone,custEmail:c.email,custAddress:c.address}).forEach(([k,v])=>{if($(k))$(k).value=v||''})}
function setupSignatureCanvas(canvasId){const canvas=$(canvasId);if(!canvas)return;const ctx=canvas.getContext('2d');function resize(){const ratio=Math.max(devicePixelRatio||1,1),rect=canvas.getBoundingClientRect();const old=canvas.width&&canvas.height?canvas.toDataURL():null;canvas.width=Math.max(1,rect.width*ratio);canvas.height=190*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#000';if(old){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,rect.width,190);img.src=old;}}setTimeout(resize,120);window.addEventListener('resize',resize);let drawing=false;function getPoint(e){const t=e.touches?.[0]||e.changedTouches?.[0]||e;const r=canvas.getBoundingClientRect();return{x:t.clientX-r.left,y:t.clientY-r.top}}function start(e){drawing=true;const p=getPoint(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}function move(e){if(!drawing)return;const p=getPoint(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}function end(e){drawing=false;e.preventDefault()}['pointerdown','touchstart','mousedown'].forEach(ev=>canvas.addEventListener(ev,start,{passive:false}));['pointermove','touchmove','mousemove'].forEach(ev=>canvas.addEventListener(ev,move,{passive:false}));['pointerup','pointercancel','touchend','mouseup','mouseleave'].forEach(ev=>canvas.addEventListener(ev,end,{passive:false}))}
function initSig(){setupSignatureCanvas('sigCanvas');setupSignatureCanvas('quoteSigCanvas')}
function clearCanvas(id,notify=true){const c=$(id);if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(notify)alertMsg('Signature cleared')}
function clearSignature(){clearCanvas('sigCanvas')}
function clearQuoteSignature(notify=true){clearCanvas('quoteSigCanvas',notify)}
function quoteSigData(){const c=$('quoteSigCanvas');return c?c.toDataURL('image/png'):''}
window.addEventListener('DOMContentLoaded',()=>{loadLogin();loadSettings();loadClocks();loadFields();initSig();renderAll();setInterval(()=>{renderClocks();updateFinance();saveClocks()},1000);if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{})});

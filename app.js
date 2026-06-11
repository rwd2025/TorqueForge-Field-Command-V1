const SUPABASE_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cGtxd2NtdnRxdnViaWJicmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzk4NjQsImV4cCI6MjA5MjgxNTg2NH0.afiaSFqkRFEXW5nPQVRXKZcpKkS6iF3T_hTQC2P15HQ";
const API_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/oracle-parts-search";

const $ = id => document.getElementById(id);
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const supabase = supabaseClient;
const EMBEDDING_ROUTER_URL = SUPABASE_URL + "/functions/v1/embedding-router";

function setValue(id,val){
  const el = $(id);
  if(el) el.value = val || "";
}

function safeText(value){
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  if($(id)) $(id).classList.add("active");

  document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.remove("active"));

  const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,team:5,voice:5,vin:1,visionAI:4,askCecil:2,verifiedFix:5,smartKits:4};
  const index = map[id] || 1;
  const btn = document.querySelector(`.bottomNav button:nth-child(${index})`);
  if(btn) btn.classList.add("active");

  $("sideMenu")?.classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

function toggleSideMenu(){ $("sideMenu")?.classList.toggle("open"); }
function underConstruction(name){ alert(name + " is under construction.\n\nThis button is ready. Backend feature coming soon."); }

function getShop(){
  return {
    name:"Rolling Wrench Diesel LLC", phone:"260-502-6222", website:"www.rollingwrenchdiesel.com",
    laborRate:"135", serviceCall:"250", tax:"0", cardFee:"0",
    terms:"Payment due upon completion. Parts and labor warranty subject to shop policy.",
    ...JSON.parse(localStorage.getItem("shopSettings") || "{}")
  };
}

function saveSettings(){
  const shop = {
    name:$("shopName")?.value || "Rolling Wrench Diesel LLC",
    phone:$("shopPhone")?.value || "260-502-6222",
    website:$("shopWebsite")?.value || "www.rollingwrenchdiesel.com",
    laborRate:$("defaultLaborRate")?.value || "135",
    serviceCall:$("defaultServiceCall")?.value || "250",
    tax:$("defaultTax")?.value || "0",
    cardFee:$("defaultCardFee")?.value || "0",
    terms:$("shopTerms")?.value || ""
  };
  localStorage.setItem("shopSettings", JSON.stringify(shop));
  loadSettings();
  if($("settingsOut")) $("settingsOut").textContent = "Settings saved.";
}

function loadSettings(){
  const s = getShop();
  setValue("shopName",s.name); setValue("shopPhone",s.phone); setValue("shopWebsite",s.website);
  setValue("defaultLaborRate",s.laborRate); setValue("defaultServiceCall",s.serviceCall);
  setValue("defaultTax",s.tax); setValue("defaultCardFee",s.cardFee); setValue("shopTerms",s.terms);
  setValue("laborRate",s.laborRate); setValue("serviceCall",s.serviceCall); setValue("taxRate",s.tax); setValue("cardFee",s.cardFee);
}

function getActiveTruck(){ return JSON.parse(localStorage.getItem("activeTruck") || "{}"); }
function updateActiveTruckBar(){
  const t = getActiveTruck();
  if($("activeVin")) $("activeVin").textContent = t.vin || "NONE";
  if($("activeYear")) $("activeYear").textContent = t.year || "----";
  if($("activeMake")) $("activeMake").textContent = t.make || "----";
  if($("activeModel")) $("activeModel").textContent = t.model || "----";
  if($("activeEngine")) $("activeEngine").textContent = t.engine || "----";
  if($("activeEsn")) $("activeEsn").textContent = t.esn || "----";
  if($("activeCpl")) $("activeCpl").textContent = t.cpl || "----";
}

function saveActiveTruck(){
  const truck = {
    vin:$("vinGlobal")?.value.trim().toUpperCase() || "",
    year:$("yearGlobal")?.value.trim() || "",
    make:$("makeGlobal")?.value.trim() || "",
    model:$("modelGlobal")?.value.trim() || "",
    engine:$("engine")?.value.trim() || "",
    esn:$("esnGlobal")?.value.trim() || "",
    cpl:$("cplGlobal")?.value.trim() || ""
  };
  localStorage.setItem("activeTruck", JSON.stringify(truck));
  setValue("invoiceVin",truck.vin);
  setValue("invoiceTruck",`${truck.year} ${truck.make} ${truck.model}`.trim());
  updateActiveTruckBar();
  alert("Active truck saved.");
}

function loadActiveTruckIntoFields(){
  const t = getActiveTruck();
  if(!t.vin) return;
  setValue("vinGlobal",t.vin); setValue("yearGlobal",t.year); setValue("makeGlobal",t.make); setValue("modelGlobal",t.model);
  setValue("engine",t.engine); setValue("esnGlobal",t.esn); setValue("cplGlobal",t.cpl);
  setValue("invoiceVin",t.vin); setValue("invoiceTruck",`${t.year || ""} ${t.make || ""} ${t.model || ""}`.trim());
}

function clearVehicleData(){
  localStorage.removeItem("activeTruck");
  ["vinGlobal","yearGlobal","makeGlobal","modelGlobal","engine","esnGlobal","cplGlobal","invoiceVin","invoiceTruck"].forEach(id=>setValue(id,""));
  updateActiveTruckBar(); alert("Active truck cleared.");
}

function ctx(){
  const t=getActiveTruck();
  return `VIN: ${$("vinGlobal")?.value || $("invoiceVin")?.value || t.vin || "none"}\nYear: ${$("yearGlobal")?.value || t.year || "unknown"}\nMake: ${$("makeGlobal")?.value || t.make || "unknown"}\nModel: ${$("modelGlobal")?.value || t.model || "unknown"}\nEngine: ${$("engine")?.value || t.engine || "unknown"}\nESN: ${$("esnGlobal")?.value || t.esn || "unknown"}\nCPL: ${$("cplGlobal")?.value || t.cpl || "unknown"}`.trim();
}

async function callOracle(payload){
  const body = {
    vin: payload.vin ?? $("vinGlobal")?.value ?? $("invoiceVin")?.value ?? getActiveTruck().vin ?? null,
    esn: payload.esn ?? $("esnGlobal")?.value ?? getActiveTruck().esn ?? null,
    cpl: payload.cpl ?? $("cplGlobal")?.value ?? getActiveTruck().cpl ?? null,
    year: payload.year ?? $("yearGlobal")?.value ?? getActiveTruck().year ?? "",
    make: payload.make ?? $("makeGlobal")?.value ?? getActiveTruck().make ?? "",
    model: payload.model ?? $("modelGlobal")?.value ?? getActiveTruck().model ?? "",
    engine: payload.engine ?? $("engine")?.value ?? getActiveTruck().engine ?? "",
    mode: payload.mode || "diesel_doctor",
    part_query: payload.part_query || payload.question || payload.query || "",
    question: payload.question || payload.part_query || payload.query || "",
    note: payload.note || "",
    vehicleContext: ctx()
  };

  const res = await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer " + SUPABASE_KEY},body:JSON.stringify(body)});
  const data = await res.json().catch(()=>({error:"Invalid JSON response from backend"}));
  if(!res.ok) throw new Error(data.error || JSON.stringify(data));
  return data;
}

function formatOracleData(data){
  const d = data?.data || data || {};
  if(typeof data === "string") return data;
  if(data.answer) return data.answer;
  if(data.message) return data.message;
  return `PART: ${d.oem_part || d.part || "UNKNOWN"}\nYEAR: ${d.year || "UNKNOWN"}\nMAKE: ${d.make || "UNKNOWN"}\nMODEL: ${d.model || "UNKNOWN"}\nENGINE: ${d.engine || "UNKNOWN"}\nVIN: ${d.vin || "NO VIN"}\nESN: ${d.esn || "NO ESN"}\nCPL: ${d.cpl || "NO CPL"}\nFITMENT: ${d.verified_fitment ? "VIN / ESN / CPL CONTEXT PROVIDED" : "NEEDS VIN / ESN / CPL"}\n\nSOURCE: ${data.source || "oracle"}\n\nNOTES:\n${(d.notes || []).join("\n") || "No notes returned."}`.trim();
}

function renderOracleCard(targetId,title,data){
  const d = data?.data || {};
  const notes = Array.isArray(d.notes) ? d.notes.join("<br>") : (d.notes || data?.answer || "No notes returned.");
  $(targetId).innerHTML = `<div class="oracleCard"><div class="oracleTitle">${safeText(title)}</div><div class="vinGrid"><div><b>PART</b><span>${safeText(d.oem_part || d.part || "UNKNOWN")}</span></div><div><b>YEAR</b><span>${safeText(d.year || "UNKNOWN")}</span></div><div><b>MAKE</b><span>${safeText(d.make || "UNKNOWN")}</span></div><div><b>MODEL</b><span>${safeText(d.model || "UNKNOWN")}</span></div><div><b>ENGINE</b><span>${safeText(d.engine || "UNKNOWN")}</span></div><div><b>FITMENT</b><span>${d.verified_fitment ? "YES" : "NEEDS VIN / ESN"}</span></div><div><b>VIN</b><span>${safeText(d.vin || getActiveTruck().vin || "No VIN")}</span></div><div><b>SOURCE</b><span>${safeText(data?.source || "oracle")}</span></div></div><div class="oracleNote">${safeText(notes).replace(/\n/g,"<br>")}</div></div>`;
}

async function decodeVin(){
  const vin = $("vinGlobal")?.value.trim().toUpperCase() || "";
  if(!vin) return alert("Enter VIN first.");
  $("vinOut").textContent = "Decoding VIN...";
  try{
    const data = await callOracle({vin,part_query:"VIN decode",mode:"vin_decode"});
    const d = data?.data || {};
    setValue("yearGlobal",d.year || ""); setValue("makeGlobal",d.make || ""); setValue("modelGlobal",d.model || ""); setValue("engine",d.engine || "");
    if(d.esn) setValue("esnGlobal",d.esn); if(d.cpl) setValue("cplGlobal",d.cpl);
    saveActiveTruck();
    renderOracleCard("vinOut","VIN DECODE SUCCESS",data);
    $("vinOut").innerHTML += `<div class="smartNote">Saved as active truck.</div>`;
  }catch(e){ $("vinOut").textContent = "VIN ERROR: " + e.message; }
}

function smartSearchTerm(q, data){
  const d=data?.data||{};
  return d.oem_part || d.part || d.part_number || q || $("partNote")?.value.trim() || getActiveTruck().engine || "";
}

async function askPart(){
  const q = $("partq")?.value.trim() || "";
  const note = $("partNote")?.value.trim() || "";
  if(!q && !note){ $("partOut").textContent = "Enter part number, part name, VIN, ESN, CPL, or description."; return; }
  $("partOut").textContent = "Running Oracle + Universal Diesel Database...";

  try{
    const oracleData = await callOracle({part_query:q || note,note,mode:"parts_lookup"});
    renderOracleCard("partOut","ORACLE VERIFIED PART LOOKUP",oracleData);

    const term = smartSearchTerm(q || note, oracleData);
    const universal = await universalSearch(term);
    renderUniversalResults("partOut", universal, term);

    const repair = await getRepairKit(term);
    renderRepairKit("partOut", repair);
  }catch(e){
    $("partOut").textContent = "SEARCH ERROR: " + e.message;
  }
}

async function getRepairKit(component){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(component || "").trim();
  if(!term) return null;
  const { data, error } = await supabaseClient
    .from("repair_kits")
    .select("*")
    .or(`component_name.ilike.%${term}%,engine_family.ilike.%${term}%,oem_part_number.ilike.%${term}%`)
    .limit(3);
  if(error) return null;
  return data || [];
}

async function universalSearch(search){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(search || "").trim();
  if(!term) return {};
  const { data, error } = await supabaseClient.rpc("universal_diesel_search", { search_text: term });
  if(error) throw error;
  return data || {};
}

function card(title, badge, inner, note=""){
  return `<div class="smartCard"><div class="smartCardTitle"><span>${safeText(title)}</span>${badge?`<span class="badge ${badge.cls||""}">${safeText(badge.text)}</span>`:""}</div>${inner}${note?`<div class="smartNote">${safeText(note)}</div>`:""}</div>`;
}
function gridCell(k,v){ return `<div class="smartCell"><b>${safeText(k)}</b><span>${safeText(v || "—")}</span></div>`; }
function asArray(x){ return Array.isArray(x) ? x : []; }

function renderUniversalResults(targetId, universal, term){
  if(!universal || typeof universal !== "object") return;
  const pieces=[];
  const parts=asArray(universal.parts);
  const crosses=asArray(universal.cross_refs || universal.part_cross_refs);
  const torques=asArray(universal.torque_specs);
  const labor=asArray(universal.labor_times);
  const failures=asArray(universal.common_failures);
  const fluids=asArray(universal.fluids_filters);
  const tests=asArray(universal.diagnostic_tests);
  const suppliers=asArray(universal.supplier_links);

  if(parts.length){
    pieces.push(card("DATABASE PART MATCHES",{text:`${parts.length} HIT${parts.length>1?"S":""}`,cls:"good"},`<div class="smartGrid">${parts.slice(0,6).map(p=>gridCell(p.manufacturer || p.brand || "PART", `${p.part_number || p.oem_part_number || "UNKNOWN"} — ${p.description || p.category || ""}`)).join("")}</div>`));
  }
  if(crosses.length){
    pieces.push(card("OEM / AFTERMARKET CROSS REFERENCES",{text:`${crosses.length} REF${crosses.length>1?"S":""}`,cls:"hot"},`<div class="smartGrid">${crosses.slice(0,8).map(p=>gridCell(p.brand || p.source_name || "CROSS", `${p.oem_part_number || p.source_part || p.part_number || ""} → ${p.aftermarket_part_number || p.cross_part || p.cross_ref_number || ""} ${p.confidence_score ? "("+p.confidence_score+")" : ""}`)).join("")}</div>`));
  }
  if(labor.length){
    pieces.push(card("LABOR TIME",{text:"QUOTE READY",cls:"good"},`<div class="smartGrid">${labor.slice(0,4).map(l=>gridCell(l.component_name || l.labor_operation || "LABOR", `${l.labor_hours || "?"} hrs — ${l.difficulty || ""}`)).join("")}</div>`));
  }
  if(torques.length){
    pieces.push(card("TORQUE SPECS",{text:"VERIFY",cls:"warn"},`<div class="smartGrid">${torques.slice(0,6).map(t=>gridCell(t.fastener || t.component_name || "FASTENER", `${t.torque_value || "UNKNOWN"} ${t.sequence_notes || ""}`)).join("")}</div>`));
  }
  if(fluids.length){
    pieces.push(card("FLUIDS / FILTERS",{text:"SERVICE",cls:"good"},`<div class="smartGrid">${fluids.slice(0,4).map(f=>gridCell(f.engine_family || f.service_type || "SERVICE", [f.oil_filter,f.fuel_filter,f.water_separator,f.oil_capacity].filter(Boolean).join(" | "))).join("")}</div>`));
  }
  if(failures.length || tests.length){
    pieces.push(card("DIAGNOSTIC MEMORY",{text:"BUDDY",cls:"hot"},`<div class="smartGrid">${failures.slice(0,3).map(f=>gridCell(f.fault_code || f.symptom || "FAILURE", f.common_fix || f.likely_causes || "Check notes")).join("")}${tests.slice(0,3).map(t=>gridCell(t.test_name || t.fault_code || "TEST", t.pass_fail_specs || t.next_step_if_failed || "Run test")).join("")}</div>`));
  }
  if(suppliers.length){
    pieces.push(card("SUPPLIER LINKS",{text:"BUY",cls:"good"},`<div class="smartGrid">${suppliers.slice(0,4).map(s=>gridCell(s.supplier_name || "SUPPLIER", s.part_number || s.search_url || "")).join("")}</div>`));
  }
  if(!pieces.length){
    pieces.push(card("UNIVERSAL DATABASE",{text:"NO LOCAL HIT",cls:"warn"},`<div class="emptyNote">No local SQL database matches for “${safeText(term)}” yet. Add records to parts, part_cross_refs, repair_kits, labor_times, torque_specs, or common_failures.</div>`));
  }
  $(targetId).innerHTML += `<div class="resultGroup">${pieces.join("")}</div>`;
}

function renderRepairKit(targetId, kits){
  const list=asArray(kits);
  if(!list.length) return;
  for(const k of list.slice(0,3)){
    $(targetId).innerHTML += card("SMART REPAIR KIT",{text:"KIT",cls:"good"},`<div class="smartGrid">${gridCell("COMPONENT",k.component_name)}${gridCell("ENGINE",k.engine_family)}${gridCell("OEM PART",k.oem_part_number)}${gridCell("LABOR",k.labor_hours ? k.labor_hours+" hrs" : "—")}${gridCell("GASKETS",k.gasket_set)}${gridCell("SEALS",k.seals)}${gridCell("O-RINGS",k.o_rings)}${gridCell("HARDWARE",k.hardware)}</div>`, `${k.torque_specs || ""}\n${k.repair_notes || ""}`.trim());
  }
}

async function runDoctorSearch(){
  const q = $("doctorAsk")?.value.trim() || "";
  if(!q){ $("doctorOut").textContent = "Ask Rolling Wrench AI a question first."; return; }
  $("doctorOut").textContent = "Rolling Wrench AI thinking...";
  try{
    const data = await callOracle({part_query:q,question:q,mode:"global_doctor_search"});
    $("doctorOut").textContent = formatOracleData(data);
  }catch(e){ $("doctorOut").textContent = "Rolling Wrench AI error: " + e.message; }
}

async function homeAI(){
  const q = $("homeAiAsk")?.value.trim() || "";
  const file = $("homeAiImage")?.files?.[0];
  if(!q && !file){ $("homeAiOut").textContent = "Ask Rolling Wrench AI a question or add a picture."; return; }
  $("homeAiOut").textContent = file ? "Reading picture..." : "Thinking...";
  let note = "";
  if(file){ const base64 = await imageToBase64(file); note = { image:base64.split(",")[1], question:q || "Analyze uploaded image" }; }
  try{
    const data = await callOracle({part_query:q || "Analyze uploaded image",question:q || "Analyze uploaded image",mode:"diesel_ai",note});
    $("homeAiOut").textContent = formatOracleData(data);
  }catch(e){ $("homeAiOut").textContent = "Rolling Wrench AI error: " + e.message; }
}

async function runDiag(){
  const q = $("diagq")?.value.trim() || "";
  const note = $("diagNote")?.value.trim() || "";
  if(!q){ $("diagOut").textContent = "Enter fault code or symptom first."; return; }
  $("diagOut").textContent = "Fault Doctor running...";
  try{
    const data = await callOracle({part_query:q,question:q,note,mode:"fault_doctor"});
    $("diagOut").textContent = formatOracleData(data);
  }catch(e){ $("diagOut").textContent = "DIAGNOSTIC ERROR: " + e.message; }
}

function imageToBase64(file){ return new Promise((resolve,reject)=>{ const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
function wireImagePreview(){
  const input = $("homeAiImage"), preview = $("homeAiPreview");
  if(!input || !preview) return;
  input.addEventListener("change",()=>{ const file = input.files?.[0]; if(!file) return; preview.src = URL.createObjectURL(file); preview.style.display = "block"; });
}

function money(n){ return "$" + Number(n || 0).toFixed(2); }
function buildInvoice(){
  const shop = getShop();
  const h = Number($("laborHours")?.value || 0), r = Number($("laborRate")?.value || 0), service = Number($("serviceCall")?.value || 0), parts = Number($("partsCost")?.value || 0), taxPct = Number($("taxRate")?.value || 0), cardPct = Number($("cardFee")?.value || 0);
  const labor = h*r, subtotal=labor+service+parts, tax=subtotal*(taxPct/100), card=(subtotal+tax)*(cardPct/100), total=subtotal+tax+card;
  const txt = `${shop.name}\n${shop.phone}\n${shop.website}\n\nCUSTOMER:\n${$("custName")?.value || ""}\n${$("custPhone")?.value || ""}\n\nVEHICLE:\n${$("invoiceTruck")?.value || ""}\nVIN: ${$("invoiceVin")?.value || ""}\n\nWORK:\n${$("laborDesc")?.value || ""}\n\nLabor: ${money(labor)}\nService Call: ${money(service)}\nParts: ${money(parts)}\nTax: ${money(tax)}\nCard Fee: ${money(card)}\n\nTOTAL DUE:\n${money(total)}\n\nTERMS:\n${shop.terms}`.trim();
  $("quoteOut").textContent = txt;
}
function copyText(id){ const text = $(id)?.textContent || ""; navigator.clipboard?.writeText(text); alert("Copied."); }
function findNearestDealer(){
  if(!navigator.geolocation){ alert("GPS not supported."); return; }
  navigator.geolocation.getCurrentPosition(pos=>{ const q = "FleetPride OR Cummins Dealer OR Kenworth OR Peterbilt OR Freightliner Parts"; window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${pos.coords.latitude},${pos.coords.longitude},12z`,"_blank"); },()=>alert("Location permission denied."));
}
function startVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ alert("Voice input not supported on this browser yet."); return; }
  const recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.onresult = e=>{ const text = e.results[0][0].transcript; if($("homeAiAsk")) $("homeAiAsk").value = text; if($("doctorAsk")) $("doctorAsk").value = text; }; recognition.start();
}
const VoiceNavigator = {active:false,toggle(){this.active=!this.active; const btn=$("voice-toggle"); if(btn) btn.textContent=`VOICE: ${this.active ? "ON" : "OFF"}`; if(this.active) this.speak("Rolling Wrench AI Voice Navigator active. Backend feature coming soon.");},speak(text){if(!("speechSynthesis" in window)) return; const msg = new SpeechSynthesisUtterance(text); msg.rate=.9; window.speechSynthesis.speak(msg);}};

window.addEventListener("error",e=>{ localStorage.setItem("diesel_doctor_last_error",`${e.message} line ${e.lineno}`); });
window.addEventListener("DOMContentLoaded",()=>{ loadSettings(); loadActiveTruckIntoFields(); updateActiveTruckBar(); wireImagePreview(); });


/* ===== UNIFIED MERGED MODULES ===== */

function vehicleContext(){ return typeof ctx === "function" ? ctx() : ""; }
async function callAI(prompt, context, notes){
  const data = await callOracle({ question: prompt, part_query: notes || prompt, note: context || "", mode:"procedure_genius" });
  return formatOracleData(data);
}
async function askAI(prompt){ return callAI(prompt, vehicleContext(), prompt); }
async function callOracleAI(prompt){ return callAI(prompt, vehicleContext(), prompt); }
async function callEmbeddingRouter(question){
  const res = await fetch(EMBEDDING_ROUTER_URL,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer " + SUPABASE_KEY},body:JSON.stringify({question, vehicleContext:ctx()})});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || JSON.stringify(data));
  return data;
}
function clearSmartKit(){ ["partsTechEngine","partsTechComponent"].forEach(id=>setValue(id,"")); const out=$("partsTechOut"); if(out) out.textContent="Enter engine and component to build a kit."; }

/* =========================================================
ROLLING WRENCH AI VISION FRONTEND
Paste before closing </script>.

Calls Supabase Edge Function:
rolling-wrench-vision-ai
========================================================= */

function rwVisionVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

function rollingWrenchVehicleContext(){
  if(typeof vehicleContext === "function"){
    try{ return vehicleContext(); }catch(e){}
  }

  return [
    rwVisionVal("yearGlobal"),
    rwVisionVal("makeGlobal"),
    rwVisionVal("modelGlobal"),
    rwVisionVal("engineGlobal"),
    rwVisionVal("vinGlobal") ? "VIN: " + rwVisionVal("vinGlobal") : ""
  ].filter(Boolean).join(" ");
}

function previewRollingWrenchVisionImage(){
  const input = document.getElementById("rwVisionImage");
  const img = document.getElementById("rwVisionPreview");
  const file = input?.files?.[0];

  if(!file || !img) return;

  img.src = URL.createObjectURL(file);
  img.style.display = "block";
}

function rwFileToBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function askRollingWrenchVisionAI(){
  const input = document.getElementById("rwVisionImage");
  const file = input?.files?.[0];
  const question =
    rwVisionVal("rwVisionQuestion") ||
    rwVisionVal("cecilVisionQuestion") ||
    rwVisionVal("cecilQuestion") ||
    rwVisionVal("webAiQuestion") ||
    "Identify what is shown and explain what to inspect, test, remove, replace, or verify.";

  const out = document.getElementById("rwVisionOut");

  if(!file){
    alert("Take a picture or choose a saved picture first.");
    return;
  }

  if(out) out.textContent = "Rolling Wrench AI is looking at the picture and building a mechanic answer...";

  try{
    const imageBase64 = await rwFileToBase64(file);

    const apiUrl =
      (typeof API_URL !== "undefined" && API_URL.includes("/functions/v1/"))
        ? API_URL.replace(/\/functions\/v1\/.*/, "/functions/v1/rolling-wrench-vision-ai")
        : "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/rolling-wrench-vision-ai";

    const apiKey =
      typeof SUPABASE_KEY !== "undefined"
        ? SUPABASE_KEY
        : "";

    const payload = {
      question,
      context: rollingWrenchVehicleContext(),
      imageBase64,
      fileName: file.name || "photo.jpg",
      imageType: file.type || "image/jpeg"
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(()=>({}));

    if(!res.ok){
      throw new Error(data.error || data.message || "Vision AI request failed");
    }

    if(out) out.textContent = data.answer || "No answer returned.";

  }catch(e){
    if(out){
      out.textContent =
`ROLLING WRENCH AI VISION FAILED:
${e.message || e}

Check:
1. Supabase function rolling-wrench-vision-ai is deployed.
2. OPENAI_API_KEY is set in Supabase secrets.
3. Your image is not too large. Try a closer/cropped picture.`;
    }
  }
}

function clearRollingWrenchVisionAI(){
  const input = document.getElementById("rwVisionImage");
  const img = document.getElementById("rwVisionPreview");
  const q = document.getElementById("rwVisionQuestion");
  const out = document.getElementById("rwVisionOut");

  if(input) input.value = "";
  if(img){
    img.src = "";
    img.style.display = "none";
  }
  if(q) q.value = "";
  if(out) out.textContent = "Take or upload a picture and ask Rolling Wrench AI what you need to know.";
}


/* =========================================================
PHASE 18 - VERIFIED FIX SYSTEM
Requires Supabase table: verified_fixes
Paste near your other functions, before the closing </script>.
========================================================= */

function rwVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

async function saveVerifiedFix(){
  const search = rwVal("vfSearch") || rwVal("partNumber") || rwVal("diagSearch") || rwVal("partSearch");
  const code = rwVal("vfCode") || rwVal("faultCode");
  const fix = rwVal("vfFix");
  const parts = rwVal("vfParts");
  const laborRaw = rwVal("vfLabor");
  const notes = rwVal("vfNotes");

  if(!search && !code){
    alert("Enter a symptom, search term, or fault code.");
    return;
  }

  if(!fix){
    alert("Enter the confirmed fix.");
    return;
  }

  const out = document.getElementById("vfOut");
  if(out) out.textContent = "Saving verified fix...";

  const payload = {
    search_term: search,
    year: rwVal("yearGlobal"),
    make: rwVal("makeGlobal"),
    model: rwVal("modelGlobal"),
    engine: rwVal("engineGlobal"),
    vin: rwVal("vinGlobal"),
    fault_code: code,
    symptom: search,
    confirmed_fix: fix,
    parts_used: parts,
    labor_hours: laborRaw ? Number(laborRaw) : null,
    tech_notes: notes,
    comeback: false,
    confidence: 100
  };

  try{
    const { data, error } = await supabase
      .from("verified_fixes")
      .insert([payload])
      .select()
      .single();

    if(error) throw error;

    if(out){
      out.textContent =
`✅ VERIFIED FIX SAVED

Search:
${data.search_term || "—"}

Vehicle:
${[data.year, data.make, data.model, data.engine].filter(Boolean).join(" ") || "—"}

Fault Code:
${data.fault_code || "—"}

Confirmed Fix:
${data.confirmed_fix || "—"}

Parts Used:
${data.parts_used || "—"}

Labor:
${data.labor_hours || "—"} hr

Tech Notes:
${data.tech_notes || "—"}`;
    }
  }catch(e){
    if(out) out.textContent = "Save failed: " + (e.message || e);
  }
}

async function findVerifiedFixes(){
  const search = rwVal("vfSearch") || rwVal("partNumber") || rwVal("diagSearch") || rwVal("partSearch");
  const code = rwVal("vfCode") || rwVal("faultCode");

  if(!search && !code){
    alert("Enter a search term or fault code.");
    return;
  }

  const out = document.getElementById("vfOut");
  if(out) out.textContent = "Searching shop memory...";

  try{
    let q = supabase
      .from("verified_fixes")
      .select("*")
      .order("created_at", { ascending:false })
      .limit(10);

    if(code){
      q = q.ilike("fault_code", `%${code}%`);
    }else{
      const safe = search.replaceAll(",", " ").replaceAll("%", "");
      q = q.or(
        `search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`
      );
    }

    const { data, error } = await q;
    if(error) throw error;

    if(!data || !data.length){
      if(out){
        out.textContent =
`NO VERIFIED FIX FOUND

Next:
After this job is repaired, save the confirmed fix so the app learns it.`;
      }
      return;
    }

    if(out){
      out.textContent = data.map((r, i) =>
`#${i + 1} ✅ VERIFIED FIX

Search:
${r.search_term || "—"}

Vehicle:
${[r.year, r.make, r.model, r.engine].filter(Boolean).join(" ") || "—"}

Code:
${r.fault_code || "—"}

Confirmed Fix:
${r.confirmed_fix || "—"}

Parts Used:
${r.parts_used || "—"}

Labor:
${r.labor_hours || "—"} hr

Tech Notes:
${r.tech_notes || "—"}

Confidence:
${r.confidence || 100}%`
      ).join("\n\n----------------------\n\n");
    }
  }catch(e){
    if(out) out.textContent = "Search failed: " + (e.message || e);
  }
}

/* Optional helper:
Call this at the end of your regular parts/diagnostic lookup
to auto-check shop memory using the same search.
Example: autoCheckVerifiedFixMemory("X15 water pump");
*/
async function autoCheckVerifiedFixMemory(term){
  const out = document.getElementById("vfOut");
  if(!term || !supabase || !out) return;

  try{
    const safe = term.replaceAll(",", " ").replaceAll("%", "");
    const { data, error } = await supabase
      .from("verified_fixes")
      .select("*")
      .or(`search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`)
      .order("created_at", { ascending:false })
      .limit(3);

    if(error || !data || !data.length) return;

    out.textContent =
`✅ SHOP MEMORY MATCH FOUND

${data.map((r, i) =>
`#${i + 1}
${r.confirmed_fix || "—"}
Parts: ${r.parts_used || "—"}
Labor: ${r.labor_hours || "—"} hr
Notes: ${r.tech_notes || "—"}`
).join("\n\n")}`;
  }catch(e){
    console.warn("Verified fix memory check failed", e);
  }
}


/* =========================================================
PHASE 19 - ASK CECIL PROCEDURE GENIUS
Paste near your other functions before closing </script>.

Needs your existing:
- supabase variable
- callAI(prompt, context, notes) OR your OpenAI/Edge AI function
- optional vehicleContext()
========================================================= */

function cecilVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

function cecilVehicleContext(){
  if(typeof vehicleContext === "function"){
    try{ return vehicleContext(); }catch(e){}
  }

  return [
    cecilVal("yearGlobal"),
    cecilVal("makeGlobal"),
    cecilVal("modelGlobal"),
    cecilVal("engineGlobal"),
    cecilVal("vinGlobal") ? "VIN: " + cecilVal("vinGlobal") : ""
  ].filter(Boolean).join(" ");
}

function classifyCecilIntent(q){
  const s = (q || "").toLowerCase();

  if(/remove|disassemble|take off|tear down|pull off|replace|install|assembly|assemble|rebuild/.test(s)) return "procedure";
  if(/code|spn|fmi|dtc|fault|symptom|diagnose|why|cause|regen|derate|no start|misfire/.test(s)) return "diagnostic";
  if(/part|parts|seal|gasket|kit|filter|cross|number|oem|aftermarket/.test(s)) return "parts";
  if(/labor|hours|quote|price|cost|invoice|estimate/.test(s)) return "quote";
  if(/torque|spec|specs|clearance|pattern|sequence|fluid capacity|capacity/.test(s)) return "specs";

  return "general";
}

async function askCecilProcedureGenius(){
  const question =
    cecilVal("cecilQuestion") ||
    cecilVal("masterSearch") ||
    cecilVal("masterInput") ||
    cecilVal("oracleSearch") ||
    cecilVal("partNumber") ||
    cecilVal("diagSearch");

  const out = document.getElementById("cecilOut");

  if(!question){
    alert("Ask Cecil a repair, parts, specs, labor, or diagnostic question.");
    return;
  }

  if(out) out.textContent = "Cecil is thinking... checking shop memory, repair procedures, parts, specs, and AI...";

  const context = cecilVehicleContext();
  const intent = classifyCecilIntent(question);

  let memoryText = "";
  let procedureText = "";
  let kitText = "";
  let failureText = "";

  try{
    const safe = question.replaceAll(",", " ").replaceAll("%", "").slice(0, 120);

    if(typeof supabase !== "undefined"){
      const memory = await supabase
        .from("verified_fixes")
        .select("*")
        .or(`search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`)
        .order("created_at", { ascending:false })
        .limit(3);

      if(memory.data && memory.data.length){
        memoryText = memory.data.map((r,i)=>`
SHOP MEMORY #${i+1}
Fix: ${r.confirmed_fix || "—"}
Parts: ${r.parts_used || "—"}
Labor: ${r.labor_hours || "—"} hr
Notes: ${r.tech_notes || "—"}`).join("\n");
      }

      const procedures = await supabase
        .from("repair_procedures")
        .select("*")
        .or(`title.ilike.%${safe}%,component.ilike.%${safe}%,procedure_text.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(procedures.data && procedures.data.length){
        procedureText = procedures.data.map((r,i)=>`
PROCEDURE DB #${i+1}
Title: ${r.title || r.component || "—"}
Procedure: ${r.procedure_text || r.steps || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }

      const kits = await supabase
        .from("repair_kits")
        .select("*")
        .or(`kit_name.ilike.%${safe}%,component.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(kits.data && kits.data.length){
        kitText = kits.data.map((r,i)=>`
REPAIR KIT #${i+1}
Kit: ${r.kit_name || r.component || "—"}
Parts: ${r.parts || r.parts_list || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }

      const failures = await supabase
        .from("known_failures")
        .select("*")
        .or(`component.ilike.%${safe}%,symptom.ilike.%${safe}%,failure.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(failures.data && failures.data.length){
        failureText = failures.data.map((r,i)=>`
KNOWN FAILURE #${i+1}
Component: ${r.component || "—"}
Failure: ${r.failure || r.symptom || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }
    }
  }catch(e){
    console.warn("Cecil DB search skipped/failed:", e);
  }

  const prompt = `
You are Rolling Cecil AI, a master diesel mechanic, parts specialist, diagnostic tech, and shop foreman.

The user asked:
"${question}"

Intent classification:
${intent}

Vehicle context:
${context || "No vehicle context entered."}

Shop memory found:
${memoryText || "No verified shop memory found."}

Repair procedure database found:
${procedureText || "No local repair procedure found."}

Repair kit database found:
${kitText || "No local repair kit found."}

Known failures database found:
${failureText || "No known failure match found."}

Answer the question no matter what it asks, as long as it is about repair, parts, diagnostics, labor, specs, tools, or shop workflow.

Use this exact format:

✅ SHORT ANSWER
Give the direct answer first.

✅ WHAT THIS IS / WHAT IT DOES
Explain component or system simply.

✅ VEHICLE / ENGINE CONTEXT
Use year/make/model/engine/VIN if present. Say what still needs verified.

✅ SAFETY FIRST
List hazards, battery disconnect, fluids, pressure, hot parts, lifting, blocking, PPE.

✅ TOOLS NEEDED
Common tools and specialty tools.

✅ PARTS / SEALS / GASKETS LIKELY NEEDED
List likely parts, but do not claim exact OEM part numbers unless verified by VIN/ESN/catalog/shop data.

✅ DISASSEMBLY / REMOVAL STEPS
Give clear step-by-step instructions.

✅ CLEANING / INSPECTION
What to inspect while it is apart.

✅ ASSEMBLY / INSTALL STEPS
Give clear step-by-step install instructions.

✅ TORQUE / SPECS
Give safe spec guidance.
If exact torque/spec is not verified, say:
VERIFY OEM SERVICE MANUAL BY VIN/ESN BEFORE FINAL TORQUE.
Never invent exact torque specs.

✅ COMMON MISTAKES
List mistakes techs make.

✅ DIAGNOSTIC CHECKS
Tests to confirm root cause before replacing parts.

✅ LABOR RANGE
Give realistic labor range and what changes it.

✅ ADD TO QUOTE
Labor, parts, supplies, coolant/oil/fluid, shop supplies, diagnostic time.

✅ VERIFIED FIX MEMORY
Summarize any shop memory provided. If none, tell the tech to save the confirmed fix after repair.

Rules:
- Be useful even when data is incomplete.
- Do not say you cannot help just because exact specs are missing.
- Use VERIFY warnings for exact part numbers, torque specs, fluid capacities, and service bulletin-sensitive items.
- Sound like a real diesel shop foreman.
`;

  try{
    let answer = "";

    if(typeof callAI === "function"){
      answer = await callAI(prompt, context, question);
    }else if(typeof askAI === "function"){
      answer = await askAI(prompt);
    }else if(typeof callOracleAI === "function"){
      answer = await callOracleAI(prompt);
    }else{
      answer =
`AI function not found.

Your app needs one existing AI call function named one of these:
- callAI(prompt, context, notes)
- askAI(prompt)
- callOracleAI(prompt)

The Cecil prompt is ready, but it needs to connect to your AI backend.`;
    }

    if(out) out.textContent = answer;
  }catch(e){
    if(out) out.textContent = "Cecil AI failed: " + (e.message || e);
  }
}

function clearCecilGenius(){
  const q = document.getElementById("cecilQuestion");
  const out = document.getElementById("cecilOut");
  if(q) q.value = "";
  if(out) out.textContent = "Ask Cecil anything: remove, install, diagnose, parts, specs, labor, quote.";
}


/* =========================================================
   MASTER SEARCH HOOK PATCH
   Paste this INSIDE your existing runMasterSearch()
   or masterSearch() function.
   ========================================================= */

const searchTerm =
document.getElementById("masterSearch")?.value ||
document.getElementById("masterInput")?.value ||
document.getElementById("oracleSearch")?.value ||
"";

await rc21_runRepairKitPatch(searchTerm);

/* =========================================================
   END PATCH
   ========================================================= */


// ===============================
// AUTO AI FALLBACK LOOKUP PATCH
// ===============================

async function lookupPart() {

  const q =
    $("partNumber")?.value?.trim() ||
    $("partSearch")?.value?.trim() ||
    $("masterSearch")?.value?.trim();

  if (!q) {
    alert("Enter part, engine, VIN, or repair question");
    return;
  }

  const out = $("partOut") || $("brainOut") || $("masterOut");

  if (out) {
    out.innerHTML = "Searching local database first...";
  }

  try {

    // ===============================
    // LOCAL DATABASE SEARCH
    // ===============================

    const { data: local, error: localErr } =
      await supabase.rpc(
        "expanded_backend_search",
        { q }
      );

    if (localErr) throw localErr;

    // ===============================
    // LOCAL RESULTS FOUND
    // ===============================

    if (local && local.length > 0) {

      if (typeof renderPartResults === "function") {
        renderPartResults(local);
      } else {

        out.innerHTML = `
          <div class="resultBox">
            <h2>LOCAL DATABASE RESULTS</h2>
            <pre>${JSON.stringify(local, null, 2)}</pre>
          </div>
        `;
      }

      return;
    }

    // ===============================
    // AI / WEB FALLBACK
    // ===============================

    if (out) {
      out.innerHTML =
        "No local match. Searching AI/web fallback...";
    }

    const { data: ai, error: aiErr } =
      await supabase.functions.invoke(
        "bright-task",
        {
          body: {
            mode: "part_lookup",
            query: q,
            instruction:
              "Find OEM part number options, aftermarket crosses, fitment warnings, required gaskets/seals, labor notes, and torque/spec warnings. Do not guess. If exact part depends on VIN/ESN/CPL, say so clearly."
          }
        }
      );

    if (aiErr) throw aiErr;

    const answer =
      ai?.answer ||
      ai?.result ||
      ai?.text ||
      JSON.stringify(ai, null, 2);

    // ===============================
    // RENDER RESULTS
    // ===============================

    if (out) {
      out.innerHTML = `
        <div class="resultBox">
          <h2>AI / WEB FALLBACK RESULT</h2>
          <pre>${answer}</pre>
        </div>
      `;
    }

    // ===============================
    // AUTO SAVE TO SHOP MEMORY
    // ===============================

    await supabase.from("repair_memory").insert({
      search_term: q,
      result_text: answer,
      source: "auto_ai_fallback",
      verified: false
    });

  } catch (err) {

    if (out) {
      out.innerHTML =
        "Lookup failed: " + err.message;
    }

    console.error(err);
  }
}

// ===============================
// BUTTON PATCH
// ===============================

// CHANGE YOUR BUTTON TO:
//
// <button onclick="lookupPart()">
//   LOOKUP PART
// </button>


// FIXED engine_patch.js

async function runEnginePatch() {
  const something = "ok";

  const result = await supabase
    .from('big_4_parts')
    .select('*');

  console.log(result);
}


/* =====================================================
   ROLLING CECIL AI - PHASE 20 FRONTEND PATCH
   Smart Repair Kit Logic
   Paste near the bottom of app.js, before final boot/init block.
   ===================================================== */

function rc20_clean(v){
  return (v || "").toString().trim();
}

function rc20_first(arr){
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

function rc20_list(title, items){
  if(!items || !items.length) return "";
  return `
    <div class="rc20-mini">
      <b>${title}</b>
      <ul>${items.map(x=>`<li>${x}</li>`).join("")}</ul>
    </div>
  `;
}

function rc20_renderRepairKit(result){
  const kitWrap = result?.repair_kit_answer || result;
  const kits = kitWrap?.repair_kits || [];
  const kit = rc20_first(kits);

  if(!kit){
    return `
      <div class="card warn">
        <h3>SMART REPAIR KIT</h3>
        <p>No repair kit saved yet for this component.</p>
        <p>Next: save confirmed gaskets, seals, hardware, labor, and torque notes after the job.</p>
      </div>
    `;
  }

  return `
    <div class="card rc20-kit-card">
      <h3>SMART REPAIR KIT</h3>
      <h2>${kit.kit_name || "Repair Kit"}</h2>

      <div class="rc20-oem">Primary OEM: ${kit.primary_oem || "VERIFY"}</div>
      ${kit.primary_alt ? `<div class="rc20-alt">Alt / Reman: ${kit.primary_alt}</div>` : ""}

      ${rc20_list("Gaskets", kit.gaskets)}
      ${rc20_list("Seals", kit.seals)}
      ${rc20_list("O-rings", kit.o_rings)}
      ${rc20_list("Hardware", kit.hardware)}
      ${rc20_list("Fluids", kit.fluids)}
      ${rc20_list("Related Parts", kit.related_parts)}
      ${rc20_list("While You're There", kit.while_there_checks)}
      ${rc20_list("Common Failures", kit.common_failures)}

      <div class="rc20-labor">
        Labor: ${kit.labor_hours || "VERIFY"} hrs
      </div>

      <div class="rc20-note">
        <b>Torque:</b> ${kit.torque_notes || "Verify by service manual."}
      </div>

      <div class="rc20-note">
        <b>Repair Note:</b> ${kit.repair_notes || "Verify procedure by manual."}
      </div>

      <div class="rc20-verify">
        Verify by VIN / ESN / CPL before ordering.
      </div>
    </div>
  `;
}

async function smartRepairKitLookup(component, engine, oem){
  const { data, error } = await supabase.rpc("smart_repair_kit_lookup", {
    part_query: component,
    raw_engine_text: engine || null,
    oem_text: oem || null
  });

  if(error) throw error;
  return data;
}

async function partsTechRepairAnswer(component, engine){
  const { data, error } = await supabase.rpc("parts_tech_repair_answer", {
    part_query: component,
    raw_engine_text: engine || null
  });

  if(error) throw error;
  return data;
}

/* Optional button hook:
   onclick="runSmartRepairKitFromParts()"
*/
async function runSmartRepairKitFromParts(){
  try{
    const engine =
      rc20_clean($("partsTechEngine")?.value) ||
      rc20_clean($("engineGlobal")?.value) ||
      rc20_clean($("engine")?.value) ||
      "X15";

    const component =
      rc20_clean($("partsTechComponent")?.value) ||
      rc20_clean($("partNumber")?.value) ||
      rc20_clean($("partSearch")?.value) ||
      "water pump";

    const out = $("partsTechOut") || $("partOut") || $("masterOut");

    if(out) out.innerHTML = "<div class='card'>Building smart repair kit...</div>";

    const result = await partsTechRepairAnswer(component, engine);

    if(out){
      out.innerHTML += rc20_renderRepairKit(result);
    }

    return result;

  }catch(err){
    console.error(err);
    const out = $("partsTechOut") || $("partOut") || $("masterOut");
    if(out) out.innerHTML += `<div class="warn">Smart repair kit failed: ${err.message}</div>`;
  }
}


/* ============================================================
   ROLLING CECIL AI - PHASE 21
   REPAIR KIT QUERY FIX
   Purpose:
   - X 15 / X15 / ISX15 all detect as X15
   - water pump detects as water pump
   - repair_kits search checks BOTH component and part_type
   - works with older repair_kits table layouts
   Paste near bottom of app.js, before final init/boot code.
   ============================================================ */

function rc21_detectEngine(search){
  const s = (search || "").toUpperCase().replace(/\s+/g,"").replace(/-/g,"");

  if(s.includes("ISX15")) return "X15";
  if(s.includes("X15")) return "X15";

  if(s.includes("DD15")) return "DD15";
  if(s.includes("DD13")) return "DD13";

  if(s.includes("MX13")) return "MX13";
  if(s.includes("PACCARMX13")) return "MX13";

  if(s.includes("D13")) return "D13";

  return "UNKNOWN";
}

function rc21_detectComponent(search){
  const s = (search || "").toLowerCase();

  if(s.includes("water pump") || s.includes("coolant pump")) return "water pump";
  if(s.includes("fuel filter")) return "fuel filter";
  if(s.includes("oil filter") || s.includes("lube filter")) return "oil filter";
  if(s.includes("turbo actuator") || s.includes("vgt actuator")) return "turbo actuator";
  if(s.includes("turbo")) return "turbo";
  if(s.includes("injector")) return "injector";
  if(s.includes("nox")) return "nox sensor";
  if(s.includes("delta pressure")) return "delta pressure sensor";
  if(s.includes("egr")) return "egr";

  return s.trim();
}

async function rc21_lookupRepairKits(searchText){
  const engine = rc21_detectEngine(searchText);
  const component = rc21_detectComponent(searchText);

  console.log("RC21 engine:", engine);
  console.log("RC21 component:", component);

  // Preferred: use component column if it exists
  let kits = [];
  let error1 = null;
  let error2 = null;

  try{
    const res1 = await supabase
      .from("repair_kits")
      .select("*")
      .eq("engine_family", engine)
      .ilike("component", `%${component}%`);

    kits = res1.data || [];
    error1 = res1.error;

    if(error1) console.warn("RC21 component query warning:", error1.message);
  }catch(e){
    error1 = e;
    console.warn("RC21 component query failed:", e.message);
  }

  // Fallback: older table may use part_type instead of component
  if(!kits.length){
    try{
      const res2 = await supabase
        .from("repair_kits")
        .select("*")
        .eq("engine_family", engine)
        .ilike("part_type", `%${component}%`);

      kits = res2.data || [];
      error2 = res2.error;

      if(error2) console.warn("RC21 part_type query warning:", error2.message);
    }catch(e){
      error2 = e;
      console.warn("RC21 part_type query failed:", e.message);
    }
  }

  // Final fallback: use smart_repair_kits table from Phase 20 if available
  if(!kits.length){
    try{
      const res3 = await supabase
        .from("smart_repair_kits")
        .select("*")
        .eq("engine_family", engine)
        .ilike("component", `%${component}%`);

      kits = res3.data || [];

      if(res3.error) console.warn("RC21 smart_repair_kits warning:", res3.error.message);
    }catch(e){
      console.warn("RC21 smart_repair_kits failed:", e.message);
    }
  }

  return {
    engine,
    component,
    kits,
    count: kits.length,
    error1,
    error2
  };
}

function rc21_renderRepairKitBox(result){
  if(!result || !result.kits || !result.kits.length){
    return `
      <div class="card warn">
        <h3>SMART REPAIR KIT</h3>
        <p>NO KIT</p>
        <p>Engine: ${result?.engine || "UNKNOWN"} / Component: ${result?.component || "UNKNOWN"}</p>
      </div>
    `;
  }

  const k = result.kits[0];

  const oem = k.oem_part || k.primary_oem || k.oem_part_number || "VERIFY";
  const alt = k.alt_part || k.primary_alt || k.aftermarket_part_number || "";
  const labor = k.labor_hours || "VERIFY";
  const notes = k.notes || k.repair_notes || "Verify by VIN / ESN / CPL.";

  return `
    <div class="card rc21-kit">
      <h3>SMART REPAIR KIT</h3>
      <h2>${result.engine} ${result.component}</h2>
      <div class="rc21-oem">OEM: ${oem}</div>
      ${alt ? `<div class="rc21-alt">REMAN / ALT: ${alt}</div>` : ""}
      <div class="rc21-line">Labor: ${labor} hrs</div>
      <p>${notes}</p>
      <div class="rc21-verify">Verify by VIN / ESN / CPL before ordering.</div>
    </div>
  `;
}

/*
  Hook function you can call from any master search.
  If your existing master output uses another div, change "masterOut" below.
*/
async function rc21_runRepairKitPatch(searchText){
  const result = await rc21_lookupRepairKits(searchText);

  console.log("RC21 repair kit result:", result);

  const out =
    document.getElementById("masterOut") ||
    document.getElementById("partOut") ||
    document.getElementById("partsTechOut");

  if(out){
    out.innerHTML += rc21_renderRepairKitBox(result);
  }

  return result;
}

/*
  HOW TO WIRE:
  Inside your master search function, after searchTerm is created, add:

  await rc21_runRepairKitPatch(searchTerm);

*/


window.addEventListener("DOMContentLoaded",()=>{
  const vi = document.getElementById("rwVisionImage");
  if(vi) vi.addEventListener("change", previewRollingWrenchVisionImage);
});

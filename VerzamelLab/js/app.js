(() => {
  "use strict";

  const palette = ["#78b996", "#ee8965", "#8ba9d6", "#d9b85f", "#ad8bc7", "#6db9bb"];
  const starterSets = [
    set("sport", "Sport", "🏀", 0), set("music", "Muziek", "🎵", 1), set("games", "Gamen", "🎮", 2),
    set("creative", "Creatief", "🎨", 3), set("reading", "Lezen", "📚", 4), set("outside", "Buiten", "🌿", 5)
  ];
  const starterPupils = [
    item("p1", "Mila", ["sport", "music"]), item("p2", "Noor", ["music", "reading"]),
    item("p3", "Yassine", ["sport", "games"]), item("p4", "Lou", ["creative", "outside"]),
    item("p5", "Sam", ["games", "music"]), item("p6", "Alex", ["sport", "outside"])
  ];
  const numberSets = [set("even", "Even getallen", "2k", 0), set("odd", "Oneven getallen", "2k+1", 1), set("three", "Veelvouden van 3", "3k", 2)];
  const STORAGE = "verzamel-lab-offline-v2";
  const LEGACY_STORAGE = "verzamel-lab-offline-v1";
  let state = load() || {
    mode: "class", classes: [makeClass("Klas 1", clone(starterPupils))], activeClassId: "class-1",
    generalSets: clone(numberSets), generalItems: makeNumbers(30), numberMax: 30,
    viewCount: 2, chosenGeneral: ["even", "odd", "three"],
    revealed: false, manager: null, search: "", showOutside: true
  };
  if(typeof state.showOutside!=="boolean")state.showOutside=true;

  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  function set(id, name, icon, color) { return { id, name, icon, color: palette[color] }; }
  function item(id, label, sets) { return { id, label, sets }; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function uid() { return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function makeClass(name, pupils=[]) { return { id: name === "Klas 1" ? "class-1" : uid(), name, classSets: clone(starterSets), pupils, chosenClass: ["sport","music","games"] }; }
  function load() { try { const current=JSON.parse(localStorage.getItem(STORAGE)); if(current?.classes?.length)return current; const old=JSON.parse(localStorage.getItem(LEGACY_STORAGE)); if(!old)return null; const first=makeClass("Klas 1",old.pupils||[]); first.classSets=old.classSets?.length?old.classSets:clone(starterSets); first.chosenClass=old.chosenClass||["sport","music","games"]; return {...old,classes:[first],activeClassId:first.id}; } catch { return null; } }
  function save() { localStorage.setItem(STORAGE, JSON.stringify(state)); }
  function makeNumbers(max) { return Array.from({length:max}, (_,i) => { const n=i+1; return item("n"+n, String(n), [n%2===0?"even":"odd", n%3===0?"three":""].filter(Boolean)); }); }
  function activeClass() { return state.classes.find(c=>c.id===state.activeClassId)||state.classes[0]; }
  function sets() { return state.mode === "class" ? activeClass().classSets : state.generalSets; }
  function items() { return state.mode === "class" ? activeClass().pupils : state.generalItems; }
  function chosen() { return state.mode === "class" ? activeClass().chosenClass : state.chosenGeneral; }
  function updateSets(value) { if(state.mode === "class")activeClass().classSets=value; else state.generalSets=value; }
  function updateItems(value) { if(state.mode === "class")activeClass().pupils=value; else state.generalItems=value; }
  function updateChosen(value) { if(state.mode === "class")activeClass().chosenClass=value; else state.chosenGeneral=value; }

  function render() {
    normalizeChosen();
    renderHeader(); renderClassSwitcher(); renderHero(); renderManager(); renderControls(); renderDiagram(); renderMath();
    save();
  }

  function normalizeChosen() {
    const available = sets().map(s=>s.id), valid = chosen().filter(id=>available.includes(id));
    updateChosen([...valid, ...available.filter(id=>!valid.includes(id))].slice(0,3));
    if (state.viewCount > sets().length) state.viewCount = Math.max(1, sets().length);
  }

  function renderHeader() {
    $("mode-class").classList.toggle("active", state.mode === "class");
    $("mode-general").classList.toggle("active", state.mode === "general");
    $("manage-toggle").textContent = state.manager ? "Sluit beheer" : "Beheer";
  }

  function renderClassSwitcher() {
    const root=$("class-switcher");
    if(state.mode!=="class"){root.classList.add("hidden");root.innerHTML="";return}
    root.classList.remove("hidden");
    root.innerHTML=`<label><span>Klas</span><select id="class-select">${state.classes.map(c=>`<option value="${c.id}" ${c.id===state.activeClassId?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label><button id="new-class" title="Klas toevoegen" aria-label="Klas toevoegen">＋</button><button id="class-menu" title="Huidige klas beheren" aria-label="Huidige klas beheren">•••</button>`;
    $("class-select").onchange=e=>{state.activeClassId=e.target.value;state.revealed=false;state.manager=null;render()};
    $("new-class").onclick=()=>{const name=prompt("Naam van de nieuwe klas:")?.trim();if(!name)return;if(state.classes.some(c=>c.name.toLowerCase()===name.toLowerCase()))return alert("Er bestaat al een klas met deze naam.");const next=makeClass(name);state.classes.push(next);state.activeClassId=next.id;state.revealed=false;render()};
    $("class-menu").onclick=()=>openClassManager();
  }

  function openClassManager(){
    const current=activeClass();
    $("modal-root").innerHTML=`<div class="modal-backdrop"><div class="modal"><p class="eyebrow">Klassenbeheer</p><h2>${esc(current.name)}</h2><label><b>Naam van de klas</b><input id="class-name" value="${esc(current.name)}"></label><p class="class-data-note"><b>${current.pupils.length}</b> leerlingen en <b>${current.classSets.length}</b> thema’s worden alleen in deze klas bewaard.</p><div class="modal-actions spread"><button id="delete-class" class="ghost text-danger" ${state.classes.length===1?"disabled":""}>Klas verwijderen</button><span></span><button id="cancel" class="ghost">Annuleren</button><button id="save-class" class="primary small">Bewaren</button></div></div></div>`;
    $("cancel").onclick=()=>$("modal-root").innerHTML="";
    $("save-class").onclick=()=>{const name=$("class-name").value.trim();if(!name)return alert("Vul een klasnaam in.");if(state.classes.some(c=>c.id!==current.id&&c.name.toLowerCase()===name.toLowerCase()))return alert("Er bestaat al een klas met deze naam.");current.name=name;$("modal-root").innerHTML="";render()};
    $("delete-class").onclick=()=>{if(state.classes.length===1)return;if(confirm(`Klas ${current.name} met alle leerlingen en thema’s verwijderen? Dit kan niet ongedaan worden gemaakt.`)){state.classes=state.classes.filter(c=>c.id!==current.id);state.activeClassId=state.classes[0].id;$("modal-root").innerHTML="";render()}};
  }

  function openDataManager(){
    $("modal-root").innerHTML=`<div class="modal-backdrop"><div class="modal backup-modal"><p class="eyebrow">Lokale gegevens</p><h2>Back-up maken of terugzetten</h2><p class="backup-intro">Exporteer alle klassen, leerlingen, thema’s, algemene verzamelingen en instellingen naar één bestand. Je kunt dit bestand bewaren op een USB-stick en op een andere computer importeren.</p><div class="backup-options"><article><span>↓</span><div><h3>Gegevens exporteren</h3><p>Maakt een lokaal <code>.json</code>-bestand. Er wordt niets naar internet verstuurd.</p><button id="export-data" class="primary small">Back-up downloaden</button></div></article><article><span>↑</span><div><h3>Gegevens importeren</h3><p>Controleert eerst het bestand. Na bevestiging vervangt de back-up de gegevens in deze browser.</p><button id="import-data" class="ghost">Back-up kiezen</button><input id="import-file" class="visually-hidden" type="file" accept="application/json,.json"></div></article></div><div id="backup-status" class="backup-status" role="status"></div><div class="modal-actions"><button id="close-backup" class="ghost">Sluiten</button></div></div></div>`;
    $("close-backup").onclick=()=>$("modal-root").innerHTML="";
    $("export-data").onclick=exportData;
    $("import-data").onclick=()=>$("import-file").click();
    $("import-file").onchange=e=>importData(e.target.files[0]);
  }

  function exportData(){
    const payload={format:"verzamellab-backup",version:1,exportedAt:new Date().toISOString(),data:clone(state)};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a"),date=new Date().toISOString().slice(0,10);
    link.href=url;link.download=`VerzamelLab-back-up-${date}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $("backup-status").textContent="De back-up is gedownload en bevat alle lokale VerzamelLab-gegevens.";
  }

  async function importData(file){
    const status=$("backup-status");
    if(!file)return;
    if(file.size>10*1024*1024){status.textContent="Dit bestand is groter dan 10 MB en wordt niet geopend.";return}
    try{
      const parsed=JSON.parse(await file.text()),imported=normalizeImportedState(parsed);
      const summary=`${imported.classes.length} ${imported.classes.length===1?"klas":"klassen"} en ${imported.classes.reduce((n,c)=>n+c.pupils.length,0)} leerlingen`;
      if(!confirm(`Deze geldige back-up bevat ${summary}. De huidige lokale gegevens worden vervangen. Doorgaan?`)){status.textContent="Importeren geannuleerd; de huidige gegevens zijn behouden.";return}
      state=imported;state.manager=null;state.revealed=false;save();$("modal-root").innerHTML="";render();alert("De back-up is succesvol geïmporteerd.");
    }catch(error){status.textContent=`Importeren mislukt: ${error.message}`}
  }

  function normalizeImportedState(payload){
    if(!payload||payload.format!=="verzamellab-backup"||payload.version!==1||!payload.data)throw new Error("dit is geen geldig VerzamelLab-back-upbestand.");
    const raw=payload.data;
    if(!Array.isArray(raw.classes)||!raw.classes.length||raw.classes.length>100)throw new Error("de klassenlijst ontbreekt of is ongeldig.");
    const cleanText=(value,max,label)=>{if(typeof value!=="string"||!value.trim()||value.length>max)throw new Error(`${label} is ongeldig.`);return value.trim()};
    const cleanSets=(list,prefix)=>{if(!Array.isArray(list)||!list.length||list.length>100)throw new Error(`de verzamelingen van ${prefix} zijn ongeldig.`);const map=new Map(),sets=list.map((s,i)=>{const old=String(s?.id??i),id=`${prefix}-set-${i}-${Math.random().toString(36).slice(2,7)}`;map.set(old,id);return {id,name:cleanText(s?.name,100,"Een verzamelingsnaam"),icon:typeof s?.icon==="string"?s.icon.slice(0,8):"✦",color:typeof s?.color==="string"&&/^#[0-9a-f]{6}$/i.test(s.color)?s.color:palette[i%palette.length]}});return {sets,map}};
    const cleanItems=(list,map,prefix)=>{if(!Array.isArray(list)||list.length>5000)throw new Error(`de elementen van ${prefix} zijn ongeldig.`);return list.map((x,i)=>({id:`${prefix}-item-${i}-${Math.random().toString(36).slice(2,7)}`,label:cleanText(x?.label,150,"Een elementnaam"),sets:Array.isArray(x?.sets)?[...new Set(x.sets.map(String).map(id=>map.get(id)).filter(Boolean))]:[]}))};
    const classes=raw.classes.map((c,i)=>{const prefix=`class-${i}-${Math.random().toString(36).slice(2,7)}`,built=cleanSets(c?.classSets,prefix),pupils=cleanItems(c?.pupils,built.map,prefix),chosen=Array.isArray(c?.chosenClass)?c.chosenClass.map(String).map(id=>built.map.get(id)).filter(Boolean).slice(0,3):[];return {id:prefix,name:cleanText(c?.name,100,"Een klasnaam"),classSets:built.sets,pupils,chosenClass:[...chosen,...built.sets.map(s=>s.id).filter(id=>!chosen.includes(id))].slice(0,3)}});
    const generalBuilt=cleanSets(raw.generalSets||numberSets,"general"),generalItems=cleanItems(raw.generalItems||[],generalBuilt.map,"general"),generalChosen=Array.isArray(raw.chosenGeneral)?raw.chosenGeneral.map(String).map(id=>generalBuilt.map.get(id)).filter(Boolean):[];
    const oldActive=raw.classes.findIndex(c=>c.id===raw.activeClassId),activeIndex=oldActive>=0?oldActive:0;
    return {mode:raw.mode==="general"?"general":"class",classes,activeClassId:classes[activeIndex].id,generalSets:generalBuilt.sets,generalItems,numberMax:Math.max(1,Math.min(100,Number(raw.numberMax)||30)),viewCount:Math.max(1,Math.min(3,Number(raw.viewCount)||2)),chosenGeneral:[...generalChosen,...generalBuilt.sets.map(s=>s.id).filter(id=>!generalChosen.includes(id))].slice(0,3),revealed:false,manager:null,search:"",showOutside:typeof raw.showOutside==="boolean"?raw.showOutside:true};
  }

  function renderHero() {
    const classroom = state.mode === "class";
    $("eyebrow").textContent = classroom ? "Kennismaken • nadenken • verwoorden" : "Onderzoeken • voorspellen • bewijzen";
    $("hero-title").innerHTML = classroom ? "Onze klas<br>in <em>verzamelingen</em>" : "Denk in<br><em>verzamelingen</em>";
    $("intro").textContent = classroom ? `Verwerk de kennismakingsbladen van ${activeClass().name}, vergelijk thema’s en ontdek wat leerlingen met elkaar delen.` : "Werk met getallen, letters of zelfgekozen objecten en maak abstracte relaties zichtbaar.";
    $("note-label").textContent = classroom ? "Pedagogische afspraak" : "Denkafspraak";
    $("note-title").textContent = classroom ? "We tonen alleen wat veilig gedeeld mag worden." : "Eerst voorspellen, daarna pas onthullen.";
    $("note-text").textContent = classroom ? "Gebruik gerust initialen of klasnamen." : "Een fout is informatie over je redenering.";
  }

  function renderManager() {
    const root=$("manager");
    if (!state.manager) { root.classList.add("hidden"); root.innerHTML=""; return; }
    root.classList.remove("hidden");
    const isItems=state.manager==="items", label=state.mode==="class"?"Leerlingen":"Elementen";
    root.innerHTML=`<div class="manager-head"><div><p class="eyebrow">Leerkrachtenbeheer</p><h2>${state.mode==="class"?`${esc(activeClass().name)} voorbereiden`:"Oefening opbouwen"}</h2></div><div class="tabs"><button data-tab="items" class="${isItems?"active":""}">${label}</button><button data-tab="sets" class="${!isItems?"active":""}">Verzamelingen</button><button data-close>×</button></div></div><div id="manager-content"></div>`;
    root.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.manager=b.dataset.tab;render()});
    root.querySelector("[data-close]").onclick=()=>{state.manager=null;render()};
    if(isItems) renderItemManager(); else renderSetManager();
  }

  function renderItemManager() {
    const label=state.mode==="class"?"Leerling":"Element", list=items().filter(x=>x.label.toLowerCase().includes(state.search.toLowerCase()));
    $("manager-content").innerHTML=`<div class="manager-tools"><input id="search" placeholder="Zoek…" value="${esc(state.search)}"><button id="new-item" class="primary small">＋ ${label} toevoegen</button></div><div class="item-table">${list.length?list.map(x=>`<div class="item-row"><b>${esc(x.label)}</b><div>${x.sets.length?x.sets.map(id=>sets().find(s=>s.id===id)?.name).filter(Boolean).map(esc).join(", "):"<em>nog niet ingedeeld</em>"}</div><button data-edit="${x.id}">Aanpassen</button><button class="text-danger" data-remove="${x.id}">Verwijderen</button></div>`).join(""):"<p class='empty'>Geen resultaten gevonden.</p>"}</div>`;
    $("search").oninput=e=>{state.search=e.target.value;renderItemManager()};
    $("new-item").onclick=()=>openItemEditor(null);
    document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openItemEditor(items().find(x=>x.id===b.dataset.edit)));
    document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{if(confirm("Deze invoer verwijderen?")){updateItems(items().filter(x=>x.id!==b.dataset.remove));render()}});
  }

  function renderSetManager() {
    $("manager-content").innerHTML=`<div class="manager-tools"><p>Voeg thema’s toe op basis van de papieren. Je kunt maximaal drie verzamelingen tegelijk tonen.</p><button id="new-set" class="primary small">＋ Verzameling toevoegen</button></div><div class="set-list">${sets().map(s=>`<div><span class="color-dot" style="background:${s.color}">${esc(s.icon)}</span><b>${esc(s.name)}</b><button data-rename="${s.id}">Hernoemen</button><button class="text-danger" data-remove-set="${s.id}">Verwijderen</button></div>`).join("")}</div>${state.mode==="general"?"<button id='reset-numbers' class='ghost reset'>Laad getallenvoorbeeld</button>":""}`;
    $("new-set").onclick=()=>{const name=prompt("Naam van de nieuwe verzameling:")?.trim();if(name){const list=sets();updateSets([...list,set(uid(),name,state.mode==="class"?"✦":"V",list.length%palette.length)]);render()}};
    document.querySelectorAll("[data-rename]").forEach(b=>b.onclick=()=>{const s=sets().find(x=>x.id===b.dataset.rename),name=prompt("Nieuwe naam:",s.name)?.trim();if(name){updateSets(sets().map(x=>x.id===s.id?{...x,name}:x));render()}});
    document.querySelectorAll("[data-remove-set]").forEach(b=>b.onclick=()=>{if(sets().length<=1)return alert("Bewaar minstens één verzameling.");if(confirm("Deze verzameling verwijderen?")){const id=b.dataset.removeSet;updateSets(sets().filter(x=>x.id!==id));updateItems(items().map(x=>({...x,sets:x.sets.filter(s=>s!==id)})));render()}});
    if($("reset-numbers")) $("reset-numbers").onclick=()=>generateNumbers();
  }

  function openItemEditor(existing) {
    const draft=existing?clone(existing):item(uid(),"",[]), label=state.mode==="class"?"Voornaam, initialen of klasnaam":"Naam of waarde";
    $("modal-root").innerHTML=`<div class="modal-backdrop"><div class="modal"><p class="eyebrow">${existing?"Invoer aanpassen":"Nieuwe invoer"}</p><h2>${state.mode==="class"?"Leerling":"Element"}</h2><label><b>${label}</b><input id="draft-label" value="${esc(draft.label)}" autofocus></label><fieldset><legend>Behoort tot:</legend><div class="check-grid">${sets().map(s=>`<label class="${draft.sets.includes(s.id)?"checked":""}"><input type="checkbox" value="${s.id}" ${draft.sets.includes(s.id)?"checked":""}><span>${esc(s.icon)}</span>${esc(s.name)}</label>`).join("")}</div></fieldset><div class="modal-actions"><button id="cancel" class="ghost">Annuleren</button><button id="save-item" class="primary small">Bewaren</button></div></div></div>`;
    document.querySelectorAll(".check-grid input").forEach(c=>c.onchange=()=>c.parentElement.classList.toggle("checked",c.checked));
    $("cancel").onclick=()=>$("modal-root").innerHTML="";
    $("save-item").onclick=()=>{const name=$("draft-label").value.trim();if(!name)return alert("Vul een naam of waarde in.");draft.label=name;draft.sets=[...document.querySelectorAll(".check-grid input:checked")].map(x=>x.value);updateItems(existing?items().map(x=>x.id===draft.id?draft:x):[...items(),draft]);$("modal-root").innerHTML="";render()};
  }

  function renderControls() {
    $("count-switch").innerHTML=[1,2,3].map(n=>`<button data-count="${n}" class="${state.viewCount===n?"active":""}">${n}<small>${n===1?"één groep":n+" groepen"}</small></button>`).join("");
    document.querySelectorAll("[data-count]").forEach(b=>b.onclick=()=>{state.viewCount=Number(b.dataset.count);state.revealed=false;render()});
    $("selectors").innerHTML=Array.from({length:state.viewCount},(_,i)=>`<label><b>Verzameling ${String.fromCharCode(65+i)}</b><select data-selector="${i}">${sets().map(s=>`<option value="${s.id}" ${chosen()[i]===s.id?"selected":""}>${esc(s.icon)} ${esc(s.name)}</option>`).join("")}</select></label>`).join("");
    document.querySelectorAll("[data-selector]").forEach(sel=>sel.onchange=()=>{const index=Number(sel.dataset.selector),next=[...chosen()],other=next.findIndex((x,i)=>x===sel.value&&i!==index);if(other>=0)[next[index],next[other]]=[next[other],next[index]];else next[index]=sel.value;updateChosen(next);state.revealed=false;render()});
    $("outside-setting").innerHTML=`<label class="toggle-row"><input id="show-outside" type="checkbox" ${state.showOutside?"checked":""}><span class="toggle-control" aria-hidden="true"></span><span><b>Elementen buiten de gekozen verzameling(en)</b><small>${state.showOutside?"Worden getoond in het buitengebied":"Zijn tijdelijk verborgen"}</small></span></label>`;
    $("show-outside").onchange=e=>{state.showOutside=e.target.checked;render()};
    const number=$("number-settings");
    if(state.mode==="general") { number.classList.remove("hidden"); number.innerHTML=`<b>Universele verzameling</b><div><span>U = {1, 2, …,</span><input id="number-max" type="number" min="1" max="100" value="${state.numberMax}"><span>}</span></div><button id="generate">Genereer alle getallen</button><small>Vult alle even en oneven getallen en veelvouden van 3 automatisch in.</small>`;$("generate").onclick=()=>{state.numberMax=Math.max(1,Math.min(100,Number($("number-max").value)||1));generateNumbers()}; }
    else { number.classList.add("hidden"); number.innerHTML=""; }
    $("item-count").textContent=items().length;$("item-count-label").textContent=state.mode==="class"?"leerlingen ingevoerd":"elementen ingevoerd";
  }

  function generateNumbers(){state.generalSets=clone(numberSets);state.generalItems=makeNumbers(state.numberMax);state.chosenGeneral=["even","odd","three"];state.viewCount=3;state.revealed=false;render()}

  function renderDiagram() {
    const active=chosen().slice(0,state.viewCount).map(id=>sets().find(s=>s.id===id)).filter(Boolean);
    $("diagram-title").textContent=active.map(s=>s.name).join(" • ");$("hide-diagram").classList.toggle("hidden",!state.revealed);$("fullscreen-diagram").classList.toggle("hidden",!state.revealed);
    if(!state.revealed){$("diagram-stage").innerHTML=`<div class="predict"><div class="mini-venn count-${state.viewCount}">${Array.from({length:state.viewCount},(_,i)=>`<span>${String.fromCharCode(65+i)}</span>`).join("")}<b>?</b></div><h3>Voorspel vóór je kijkt</h3><p>${state.viewCount===1?"Welke elementen behoren tot deze verzameling?":state.viewCount===2?"Wat verwacht je in de doorsnede en buiten beide cirkels?":"Welke elementen zouden in alle drie de verzamelingen kunnen liggen?"}</p><button id="reveal" class="primary">Toon het diagram →</button></div>`;$("reveal").onclick=()=>{state.revealed=true;render()};return;}
    $("diagram-stage").innerHTML=vennHtml(active,items(),state.viewCount,state.mode);
  }

  async function toggleDiagramFullscreen(){
    const card=document.querySelector(".diagram-card");
    if(document.fullscreenElement===card){await document.exitFullscreen();return}
    if(card.classList.contains("diagram-fullscreen-fallback")){closeFallbackFullscreen();return}
    if(card.requestFullscreen){try{await card.requestFullscreen();return}catch{}}
    card.classList.add("diagram-fullscreen-fallback");document.body.classList.add("fullscreen-open");updateFullscreenButton();
  }

  function closeFallbackFullscreen(){const card=document.querySelector(".diagram-card");card.classList.remove("diagram-fullscreen-fallback");document.body.classList.remove("fullscreen-open");updateFullscreenButton()}
  function updateFullscreenButton(){const active=document.fullscreenElement===document.querySelector(".diagram-card")||document.querySelector(".diagram-card").classList.contains("diagram-fullscreen-fallback");$("fullscreen-diagram").textContent=active?"Sluit volledig scherm":"Volledig scherm"}
  document.addEventListener("fullscreenchange",updateFullscreenButton);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.querySelector(".diagram-card").classList.contains("diagram-fullscreen-fallback"))closeFallbackFullscreen()});

  function vennHtml(sourceSets, sourceItems, count, mode) {
    const members=s=>sourceItems.filter(x=>x.sets.includes(s.id));
    const isSubset=(small,big)=>{const a=members(small),b=members(big);return a.length>0&&a.every(x=>x.sets.includes(big.id))&&b.some(x=>!x.sets.includes(small.id))};
    let display=[...sourceSets],layout="normal";
    if(count===3){
      for(let outer=0;outer<3;outer++){
        const children=[0,1,2].filter(i=>i!==outer);
        if(isSubset(sourceSets[children[0]],sourceSets[outer])&&isSubset(sourceSets[children[1]],sourceSets[outer])){
          if(isSubset(sourceSets[children[0]],sourceSets[children[1]])) { display=[sourceSets[children[0]],sourceSets[children[1]],sourceSets[outer]]; layout="nested-chain"; }
          else if(isSubset(sourceSets[children[1]],sourceSets[children[0]])) { display=[sourceSets[children[1]],sourceSets[children[0]],sourceSets[outer]]; layout="nested-chain"; }
          else { display=[sourceSets[children[0]],sourceSets[children[1]],sourceSets[outer]]; layout=sourceItems.some(x=>x.sets.includes(display[0].id)&&x.sets.includes(display[1].id))?"two-subsets-overlap":"two-subsets"; }
          break;
        }
      }
    }
    if(layout==="normal"&&count>1) outer:for(let i=0;i<sourceSets.length;i++)for(let j=0;j<sourceSets.length;j++)if(i!==j&&isSubset(sourceSets[i],sourceSets[j])){display=[sourceSets[i],sourceSets[j],...sourceSets.filter((_,k)=>k!==i&&k!==j)];layout="subset";break outer}
    const mask=x=>display.reduce((m,s,i)=>x.sets.includes(s.id)?m|(1<<i):m,0),groups=Array.from({length:1<<count},(_,m)=>sourceItems.filter(x=>mask(x)===m));
    if(count===2&&layout==="normal"&&!groups[3].length)layout="disjoint";
    return svgVenn(display,groups,count,layout,mode==="general");
  }

  function svgVenn(display,groups,count,layout,mathematical){
    const ellipses=diagramEllipses(count,layout).map((e,i)=>({...e,index:i,color:display[i].color}));
    const occupied=[],overflow=[];
    let elements="";
    groups.forEach((list,mask)=>{if(mask===0&&!state.showOutside)return;list.forEach(entry=>{
      const placed=findSafeElementPosition(entry.label,mask,ellipses,occupied);
      if(!placed){overflow.push({entry,mask});return}
      occupied.push(placed.box);
      elements+=`<g class="svg-element ${mathematical?"mathematical":""}"><circle cx="${placed.x}" cy="${placed.y+3}" r="3"></circle><text x="${placed.x+9}" y="${placed.y}" font-size="${placed.font}">${esc(entry.label)}</text></g>`;
    })});
    const shapes=[...ellipses].sort((a,b)=>(b.rx*b.ry)-(a.rx*a.ry)).map(e=>`<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="${e.color}" fill-opacity=".42" stroke="#46534c" stroke-width="2"></ellipse>`).join("");
    const labels=ellipses.map(e=>`<text class="svg-set-label" x="${e.cx}" y="${Math.max(24,e.cy-e.ry-12)}" text-anchor="middle">${esc(display[e.index].name)}</text>`).join("");
    const outside=`U ∖ ${count===1?display[0].name:`(${display.map(s=>s.name).join(" ∪ ")})`}`;
    const overflowHtml=overflow.length?`<div class="diagram-overflow"><b>Extra elementen — behoren tot:</b>${overflow.map(({entry,mask})=>`<span><i>•</i> ${esc(entry.label)} <small>${esc(maskName(mask,display))}</small></span>`).join("")}</div>`:"";
    return `<div class="venn-svg-wrap"><svg class="venn-svg" viewBox="0 0 800 560" role="img" aria-label="Venndiagram van ${esc(display.map(s=>s.name).join(", "))}"><rect x="1" y="1" width="798" height="558" rx="18" fill="#eef0e9" stroke="#d9ddd7"></rect>${shapes}${labels}${elements}${state.showOutside?`<text class="svg-universe-label" x="24" y="540">${esc(outside)}</text>`:""}</svg>${overflowHtml}</div>`;
  }

  function diagramEllipses(count,layout){
    if(count===1)return [{cx:400,cy:270,rx:285,ry:205}];
    if(count===2&&layout==="subset")return [{cx:340,cy:295,rx:145,ry:112},{cx:400,cy:270,rx:305,ry:210}];
    if(count===2&&layout==="disjoint")return [{cx:235,cy:275,rx:185,ry:155},{cx:565,cy:275,rx:185,ry:155}];
    if(count===2)return [{cx:310,cy:275,rx:235,ry:180},{cx:490,cy:275,rx:235,ry:180}];
    if(layout==="two-subsets")return [{cx:245,cy:300,rx:140,ry:120},{cx:555,cy:300,rx:140,ry:120},{cx:400,cy:270,rx:350,ry:220}];
    if(layout==="two-subsets-overlap")return [{cx:325,cy:305,rx:165,ry:125},{cx:475,cy:305,rx:165,ry:125},{cx:400,cy:270,rx:350,ry:220}];
    if(layout==="nested-chain")return [{cx:400,cy:310,rx:115,ry:88},{cx:400,cy:290,rx:225,ry:155},{cx:400,cy:270,rx:350,ry:220}];
    if(layout==="subset")return [{cx:300,cy:300,rx:145,ry:110},{cx:315,cy:275,rx:265,ry:195},{cx:515,cy:305,rx:200,ry:160}];
    return [{cx:315,cy:225,rx:215,ry:160},{cx:485,cy:225,rx:215,ry:160},{cx:400,cy:355,rx:215,ry:160}];
  }

  function pointMask(x,y,ellipses){return ellipses.reduce((mask,e,i)=>mask|((((x-e.cx)/e.rx)**2+((y-e.cy)/e.ry)**2<=1)?(1<<i):0),0)}

  function boxHasMask(box,mask,ellipses){
    return ellipses.every((e,i)=>{
      const inside=Boolean(mask&(1<<i));
      if(inside){const dx=Math.max(Math.abs(box.x1-e.cx),Math.abs(box.x2-e.cx)),dy=Math.max(Math.abs(box.y1-e.cy),Math.abs(box.y2-e.cy));return (dx/e.rx)**2+(dy/e.ry)**2<=.965}
      const dx=e.cx<box.x1?box.x1-e.cx:e.cx>box.x2?e.cx-box.x2:0,dy=e.cy<box.y1?box.y1-e.cy:e.cy>box.y2?e.cy-box.y2:0;return (dx/e.rx)**2+(dy/e.ry)**2>=1.035
    });
  }

  function findSafeElementPosition(label,mask,ellipses,occupied){
    for(const font of [13,12,11,10]){
      const width=Math.max(16,label.length*font),candidates=[];
      for(let y=66;y<=510;y+=18)for(let x=26;x<=748-width;x+=18){
        const box={x1:x-5,y1:y-font-3,x2:x+12+width,y2:y+8};
        if(box.x1<16||box.x2>784||box.y1<38||box.y2>520||!boxHasMask(box,mask,ellipses))continue;
        if(occupied.some(o=>!(box.x2+5<o.x1||box.x1-5>o.x2||box.y2+5<o.y1||box.y1-5>o.y2)))continue;
        candidates.push({x,y,font,box});
      }
      if(candidates.length){
        if(!occupied.length)return candidates[Math.floor(candidates.length/2)];
        return candidates.reduce((best,c)=>{const score=Math.min(...occupied.map(o=>(c.x-(o.x1+o.x2)/2)**2+(c.y-(o.y1+o.y2)/2)**2));return !best||score>best.score?{...c,score}:best},null);
      }
    }
    return null;
  }

  function maskName(mask,display){const names=display.filter((_,i)=>mask&(1<<i)).map(s=>s.name);return names.length?names.join(" ∩ "):`buiten ${display.map(s=>s.name).join(", ")}`}

  function renderMath(){const active=chosen().slice(0,state.viewCount).map(id=>sets().find(s=>s.id===id)).filter(Boolean),intersection=items().filter(x=>active.every(s=>x.sets.includes(s.id))),union=items().filter(x=>active.some(s=>x.sets.includes(s.id))),first=items().filter(x=>active[0]&&x.sets.includes(active[0].id)),word=n=>`${n} ${n===1?"element":"elementen"}`;$("math-talk").innerHTML=`<div class="step light"><span>3</span><div><small>Wiskundetaal</small><h2>Van kijken naar verwoorden</h2></div></div><div class="talk-grid"><article><span class="symbol">${state.viewCount===1?"x ∈ A":state.viewCount===2?"A ∩ B":"A ∩ B ∩ C"}</span><h3>${state.viewCount===1?"Element":"Doorsnede"}</h3><p>Welke elementen behoren tot ${state.viewCount===1?"de gekozen verzameling":"alle gekozen verzamelingen"}?</p><b>${state.revealed?word(state.viewCount===1?first.length:intersection.length):"Eerst voorspellen"}</b></article><article><span class="symbol">${state.viewCount===1?"x ∉ A":state.viewCount===2?"A ∪ B":"A ∪ B ∪ C"}</span><h3>${state.viewCount===1?"Complement in U":"Unie"}</h3><p>Welke elementen behoren tot ${state.viewCount===1?"U, maar niet tot A":"minstens één gekozen verzameling"}?</p><b>${state.revealed?word(state.viewCount===1?items().length-first.length:union.length):"Eerst voorspellen"}</b></article><article><span class="symbol">A ⊆ U</span><h3>Universele verzameling</h3><p>Alle weergegeven elementen vormen samen U.</p><b>${word(items().length)} in U</b></article></div><div class="teacher-prompt"><b>Gespreksstarter</b><p>“Hoe weet je zeker dat dit element precies in dit gebied hoort?”</p></div>`}

  $("mode-class").onclick=()=>{state.mode="class";state.revealed=false;render()};
  $("mode-general").onclick=()=>{state.mode="general";state.revealed=false;render()};
  $("data-button").onclick=()=>openDataManager();
  $("manage-toggle").onclick=()=>{state.manager=state.manager?null:"items";render()};
  $("edit-sets").onclick=()=>{state.manager="sets";render();scrollTo({top:250,behavior:"smooth"})};
  $("edit-items").onclick=()=>{state.manager="items";render();scrollTo({top:250,behavior:"smooth"})};
  $("fullscreen-diagram").onclick=()=>toggleDiagramFullscreen();
  $("hide-diagram").onclick=async()=>{if(document.fullscreenElement===document.querySelector(".diagram-card"))await document.exitFullscreen();closeFallbackFullscreen();state.revealed=false;render()};
  render();
})();

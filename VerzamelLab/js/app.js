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
    revealed: false, manager: null, search: ""
  };

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
    const number=$("number-settings");
    if(state.mode==="general") { number.classList.remove("hidden"); number.innerHTML=`<b>Universele verzameling</b><div><span>U = {1, 2, …,</span><input id="number-max" type="number" min="1" max="100" value="${state.numberMax}"><span>}</span></div><button id="generate">Genereer alle getallen</button><small>Vult alle even en oneven getallen en veelvouden van 3 automatisch in.</small>`;$("generate").onclick=()=>{state.numberMax=Math.max(1,Math.min(100,Number($("number-max").value)||1));generateNumbers()}; }
    else { number.classList.add("hidden"); number.innerHTML=""; }
    $("item-count").textContent=items().length;$("item-count-label").textContent=state.mode==="class"?"leerlingen ingevoerd":"elementen ingevoerd";
  }

  function generateNumbers(){state.generalSets=clone(numberSets);state.generalItems=makeNumbers(state.numberMax);state.chosenGeneral=["even","odd","three"];state.viewCount=3;state.revealed=false;render()}

  function renderDiagram() {
    const active=chosen().slice(0,state.viewCount).map(id=>sets().find(s=>s.id===id)).filter(Boolean);
    $("diagram-title").textContent=active.map(s=>s.name).join(" • ");$("hide-diagram").classList.toggle("hidden",!state.revealed);
    if(!state.revealed){$("diagram-stage").innerHTML=`<div class="predict"><div class="mini-venn count-${state.viewCount}">${Array.from({length:state.viewCount},(_,i)=>`<span>${String.fromCharCode(65+i)}</span>`).join("")}<b>?</b></div><h3>Voorspel vóór je kijkt</h3><p>${state.viewCount===1?"Welke elementen behoren tot deze verzameling?":state.viewCount===2?"Wat verwacht je in de doorsnede en buiten beide cirkels?":"Welke elementen zouden in alle drie de verzamelingen kunnen liggen?"}</p><button id="reveal" class="primary">Toon het diagram →</button></div>`;$("reveal").onclick=()=>{state.revealed=true;render()};return;}
    $("diagram-stage").innerHTML=vennHtml(active,items(),state.viewCount,state.mode);
  }

  function vennHtml(sourceSets, sourceItems, count, mode) {
    let display=[...sourceSets],subset=false;
    if(count>1) outer:for(let i=0;i<sourceSets.length;i++)for(let j=0;j<sourceSets.length;j++)if(i!==j){const inside=sourceItems.filter(x=>x.sets.includes(sourceSets[i].id)),outside=sourceItems.filter(x=>x.sets.includes(sourceSets[j].id));if(inside.length&&inside.every(x=>x.sets.includes(sourceSets[j].id))&&outside.some(x=>!x.sets.includes(sourceSets[i].id))){display=[sourceSets[i],sourceSets[j],...sourceSets.filter((_,k)=>k!==i&&k!==j)];subset=true;break outer}}
    const mask=x=>display.reduce((m,s,i)=>x.sets.includes(s.id)?m|(1<<i):m,0),groups=Array.from({length:1<<count},(_,m)=>sourceItems.filter(x=>mask(x)===m));
    const disjoint=count===2&&!groups[3].length&&!subset,style=`--a:${display[0]?.color};--b:${display[1]?.color};--c:${display[2]?.color}`;
    return `<div class="venn venn-${count} ${subset?"venn-subset":""} ${disjoint?"venn-disjoint":""}" style="${style}">${display.map((s,i)=>`<div class="set-label set-label-${i}"><span>${esc(s.name)}</span></div>`).join("")}${display.map((s,i)=>`<div class="venn-circle circle-${i}"></div>`).join("")}${groups.map((g,m)=>m?`<div class="region region-${count}-${m}">${chips(g,mode==="general")}</div>`:"").join("")}<div class="outside-region"><small>U ∖ ${count===1?"A":count===2?"(A ∪ B)":"(A ∪ B ∪ C)"}</small>${chips(groups[0],mode==="general")}</div></div>`;
  }
  function chips(list,math){return `<div class="chips ${math?"mathematical":""}">${list.length?list.map(x=>`<span>${esc(x.label)}</span>`).join(""):"<em>∅</em>"}</div>`}

  function renderMath(){const active=chosen().slice(0,state.viewCount).map(id=>sets().find(s=>s.id===id)).filter(Boolean),intersection=items().filter(x=>active.every(s=>x.sets.includes(s.id))),union=items().filter(x=>active.some(s=>x.sets.includes(s.id))),first=items().filter(x=>active[0]&&x.sets.includes(active[0].id)),word=n=>`${n} ${n===1?"element":"elementen"}`;$("math-talk").innerHTML=`<div class="step light"><span>3</span><div><small>Wiskundetaal</small><h2>Van kijken naar verwoorden</h2></div></div><div class="talk-grid"><article><span class="symbol">${state.viewCount===1?"x ∈ A":state.viewCount===2?"A ∩ B":"A ∩ B ∩ C"}</span><h3>${state.viewCount===1?"Element":"Doorsnede"}</h3><p>Welke elementen behoren tot ${state.viewCount===1?"de gekozen verzameling":"alle gekozen verzamelingen"}?</p><b>${state.revealed?word(state.viewCount===1?first.length:intersection.length):"Eerst voorspellen"}</b></article><article><span class="symbol">${state.viewCount===1?"x ∉ A":state.viewCount===2?"A ∪ B":"A ∪ B ∪ C"}</span><h3>${state.viewCount===1?"Complement in U":"Unie"}</h3><p>Welke elementen behoren tot ${state.viewCount===1?"U, maar niet tot A":"minstens één gekozen verzameling"}?</p><b>${state.revealed?word(state.viewCount===1?items().length-first.length:union.length):"Eerst voorspellen"}</b></article><article><span class="symbol">A ⊆ U</span><h3>Universele verzameling</h3><p>Alle weergegeven elementen vormen samen U.</p><b>${word(items().length)} in U</b></article></div><div class="teacher-prompt"><b>Gespreksstarter</b><p>“Hoe weet je zeker dat dit element precies in dit gebied hoort?”</p></div>`}

  $("mode-class").onclick=()=>{state.mode="class";state.revealed=false;render()};
  $("mode-general").onclick=()=>{state.mode="general";state.revealed=false;render()};
  $("manage-toggle").onclick=()=>{state.manager=state.manager?null:"items";render()};
  $("edit-sets").onclick=()=>{state.manager="sets";render();scrollTo({top:250,behavior:"smooth"})};
  $("edit-items").onclick=()=>{state.manager="items";render();scrollTo({top:250,behavior:"smooth"})};
  $("hide-diagram").onclick=()=>{state.revealed=false;render()};
  render();
})();

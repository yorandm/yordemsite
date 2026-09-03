(() => {
  "use strict";

  const STORAGE_KEY = "bestelmail-assistent-settings-v1";
  const REQUIRED_HEADERS = ["Naam", "Totaal kilo's", "Totaal liters", "Totaal stuks", "Aantal verpakkingen"];

  const state = {
    fileName: "",
    suppliers: [],
    selectedIndex: -1,
    currentStep: 0,
    sent: new Set(),
    settings: loadSettings()
  };

  const el = {
    settingsToggle: document.getElementById("settingsToggle"),
    settingsPanel: document.getElementById("settingsPanel"),
    uploadSection: document.getElementById("uploadSection"),
    dropZone: document.getElementById("dropZone"),
    chooseFileButton: document.getElementById("chooseFileButton"),
    fileInput: document.getElementById("fileInput"),
    globalMessage: document.getElementById("globalMessage"),
    uploadMessage: document.getElementById("uploadMessage"),
    schoolName: document.getElementById("schoolName"),
    subjectTemplate: document.getElementById("subjectTemplate"),
    introText: document.getElementById("introText"),
    emailSettings: document.getElementById("emailSettings"),
    emailSettingsEmpty: document.getElementById("emailSettingsEmpty"),
    saveSettings: document.getElementById("saveSettings"),
    resetSettings: document.getElementById("resetSettings"),
    workspace: document.getElementById("workspace"),
    fileNameLabel: document.getElementById("fileNameLabel"),
    newFileButton: document.getElementById("newFileButton"),
    fileSummary: document.getElementById("fileSummary"),
    supplierList: document.getElementById("supplierList"),
    noSupplier: document.getElementById("noSupplier"),
    supplierWorkflow: document.getElementById("supplierWorkflow"),
    currentSupplierName: document.getElementById("currentSupplierName"),
    currentSupplierMeta: document.getElementById("currentSupplierMeta"),
    supplierStatusBadge: document.getElementById("supplierStatusBadge"),
    missingEmailNotice: document.getElementById("missingEmailNotice"),
    stepInstruction: document.getElementById("stepInstruction"),
    copyPreview: document.getElementById("copyPreview"),
    mailToButton: document.getElementById("mailToButton"),
    copyNextButton: document.getElementById("copyNextButton"),
    copyAgainButton: document.getElementById("copyAgainButton"),
    previousStepButton: document.getElementById("previousStepButton"),
    copyFeedback: document.getElementById("copyFeedback"),
    bodyPreview: document.getElementById("bodyPreview")
  };

  applySettingsToForm();
  bindEvents();

  function bindEvents() {

    
    /**
     * 
     * bestand kiezen, dropdown, handeling, nieuw bestand 
     * 
     * */

    el.chooseFileButton.addEventListener("click", (event) => {
      event.stopPropagation(); //1 bestand tegelijk
      el.fileInput.click(); //als er op choosefilebutton geklikt wordt dan is dit eigenlijk op de fileinput input element dat geklikt wordt. Dit element staat hidden (is mooier)
    });
    el.dropZone.addEventListener("click", (event) => {
      if (event.target !== el.chooseFileButton) el.fileInput.click();  //Bij dropdown dan is dit bestand toevoegen
    });
    el.dropZone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        el.fileInput.click(); //nutteloos denk ik deze hele functie. 
      }
    });
    el.fileInput.addEventListener("change", () => {
      if (el.fileInput.files[0]) handleFile(el.fileInput.files[0]); //handle file input, bewerkingen doen 
    });

    /* Dropdown */

    ["dragenter", "dragover"].forEach(type => el.dropZone.addEventListener(type, event => {
      event.preventDefault();
      el.dropZone.classList.add("dragover"); 
    }));
    ["dragleave", "drop"].forEach(type => el.dropZone.addEventListener(type, event => {
      event.preventDefault();
      el.dropZone.classList.remove("dragover");
    }));
    el.dropZone.addEventListener("drop", event => {
      const file = event.dataTransfer.files[0];
      if (file) handleFile(file);
    });


     //nieuw bestand toevoegen als er al een bestand geladen is.
    el.newFileButton.addEventListener("click", () => {
      el.fileInput.value = "";
      el.fileInput.click();
    });
    //Einde bestand kiezen


    /**
     * 
     * Instellingen
     * 
     */
    //instellingen openen en sluiten
    el.settingsToggle.addEventListener("click", () => setSettingsVisible(el.settingsPanel.hidden));
    //instellingen opslaan
    el.saveSettings.addEventListener("click", saveSettingsFromForm);

    //Instellingen resetten
    el.resetSettings.addEventListener("click", resetSettings);

    /**
     * 
     * Verwerken bestelling (copy en volgende etc.)
     * 
     */
     el.copyNextButton.addEventListener("click",  handleMainAction);
     el.mailToButton.addEventListener("click", SentMailThroughMailApp);
    //el.copyNextButton.addEventListener("click",SentMailThroughMailApp handleMainAction);
    el.copyAgainButton.addEventListener("click", SentMailThroughMailApp);//copyCurrentStepAgain
    el.previousStepButton.addEventListener("click", () => {
      state.currentStep = Math.max(0, state.currentStep - 1);
      renderWorkflow();
    });
  }

  //Settings zichtbaar maken en onzichtbaar maken.
  function setSettingsVisible(show) {
    el.settingsPanel.hidden = !show;
    el.settingsToggle.setAttribute("aria-expanded", String(show));
    el.settingsToggle.textContent = show ? "Instellingen sluiten" : "Instellingen";
  }

  async function handleFile(file) {
    hideMessage(); //verberg de error message 
    //wees zeker dat het een excel bestand is
    if (!/\.(xlsx|xlsm)$/i.test(file.name)) {
      showMessage("Kies een Excelbestand met extensie .xlsx of .xlsm.", "error"); //toon de foutmelding met info
      return;
    }

    try {
      el.chooseFileButton.disabled = true; //zet de knop om bestanden te lezen uit
      el.chooseFileButton.textContent = "Bestand lezen…";
      const rows = await readFirstDataSheet(file); //bestand effectief lezen
      const suppliers = extractSuppliers(rows); //haal de leveranciers uit de excel
      if (!suppliers.length) {
        throw new Error("Ik vond geen leveranciers met bestelregels in het werkblad 'data'.");
      }

      state.fileName = file.name;
      state.suppliers = suppliers;
      state.selectedIndex = 0;
      state.currentStep = 0;
      state.sent = new Set();
      ensureSupplierSettings();
      renderAll();
      el.uploadSection.hidden = true;
      el.workspace.hidden = false;

      const missing = suppliers.filter(s => !getSupplierEmail(s.name)).length;
      if (missing > 0) {
        setSettingsVisible(true);
        showMessage(`${suppliers.length} leveranciers gevonden. Vul nog ${missing} ontbrekende e-mailadres${missing === 1 ? "" : "sen"} in.`, "success");
      } else {
        setSettingsVisible(false);
      }
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "Het Excelbestand kon niet worden gelezen.", "error");
    } finally {
      el.chooseFileButton.disabled = false;
      el.chooseFileButton.textContent = "Kies Excelbestand";
    }
  }


  //haal gegevens uit de excel denk ik, deze weet ik niet hoor....
  async function readFirstDataSheet(file) {
    if (typeof JSZip === "undefined") throw new Error("De lokale Excel-leesbibliotheek ontbreekt.");
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const parser = new DOMParser();

    const workbookText = await readZipText(zip, "xl/workbook.xml");
    const relsText = await readZipText(zip, "xl/_rels/workbook.xml.rels");
    const workbookDoc = parser.parseFromString(workbookText, "application/xml");
    const relsDoc = parser.parseFromString(relsText, "application/xml");
    throwOnXmlError(workbookDoc);
    throwOnXmlError(relsDoc);

    const sheets = Array.from(workbookDoc.getElementsByTagName("sheet"));
    if (!sheets.length) throw new Error("Het Excelbestand bevat geen werkbladen.");
    const selectedSheet = sheets.find(s => (s.getAttribute("name") || "").toLowerCase() === "data") || sheets[0];
    const relId = selectedSheet.getAttribute("r:id") || selectedSheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");

    const relationships = Array.from(relsDoc.getElementsByTagName("Relationship"));
    const relationship = relationships.find(r => r.getAttribute("Id") === relId);
    if (!relationship) throw new Error("Het werkblad kon niet worden gevonden in het Excelbestand.");

    let target = relationship.getAttribute("Target") || "";
    target = target.replace(/^\//, "");
    const sheetPath = target.startsWith("xl/") ? target : normalizePath(`xl/${target}`);

    let sharedStrings = [];
    if (zip.file("xl/sharedStrings.xml")) {
      const sharedDoc = parser.parseFromString(await readZipText(zip, "xl/sharedStrings.xml"), "application/xml");
      throwOnXmlError(sharedDoc);
      sharedStrings = Array.from(sharedDoc.getElementsByTagName("si")).map(si => {
        const textNodes = Array.from(si.getElementsByTagName("t"));
        return textNodes.map(t => t.textContent || "").join("");
      });
    }

    const sheetText = await readZipText(zip, sheetPath);
    const sheetDoc = parser.parseFromString(sheetText, "application/xml");
    throwOnXmlError(sheetDoc);
    return parseSheetRows(sheetDoc, sharedStrings);
  }

  function normalizePath(path) {
    const parts = [];
    for (const part of path.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return parts.join("/");
  }

  async function readZipText(zip, path) {
    const entry = zip.file(path);
    if (!entry) throw new Error(`Ontbrekend onderdeel in Excelbestand: ${path}`);
    return entry.async("text");
  }

  function throwOnXmlError(doc) {
    const error = doc.getElementsByTagName("parsererror")[0];
    if (error) throw new Error("Een onderdeel van het Excelbestand bevat ongeldige XML.");
  }

  function parseSheetRows(sheetDoc, sharedStrings) {
    const rows = [];
    const rowNodes = Array.from(sheetDoc.getElementsByTagName("row"));
    let maxCol = 0;

    for (const rowNode of rowNodes) {
      const rowIndex = Math.max(0, Number(rowNode.getAttribute("r") || rows.length + 1) - 1);
      if (!rows[rowIndex]) rows[rowIndex] = [];

      for (const cell of Array.from(rowNode.getElementsByTagName("c"))) {
        const ref = cell.getAttribute("r") || "A1";
        const colIndex = columnLettersToIndex((ref.match(/[A-Z]+/i) || ["A"])[0]);
        maxCol = Math.max(maxCol, colIndex);
        const type = cell.getAttribute("t") || "";
        let value = "";

        if (type === "inlineStr") {
          const textNodes = Array.from(cell.getElementsByTagName("t"));
          value = textNodes.map(t => t.textContent || "").join("");
        } else {
          const v = cell.getElementsByTagName("v")[0];
          const raw = v ? (v.textContent || "") : "";
          if (type === "s") value = sharedStrings[Number(raw)] ?? "";
          else if (type === "b") value = raw === "1" ? "WAAR" : "ONWAAR";
          else value = raw;
        }
        rows[rowIndex][colIndex] = value;
      }
    }

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i]) rows[i] = [];
      while (rows[i].length <= maxCol) rows[i].push("");
      rows[i] = rows[i].map(v => v == null ? "" : String(v));
    }
    return rows;
  }

  function columnLettersToIndex(letters) {
    let result = 0;
    for (const ch of letters.toUpperCase()) result = result * 26 + (ch.charCodeAt(0) - 64);
    return result - 1;
  }

  function extractSuppliers(rows) {
    if (!rows.length) throw new Error("Het werkblad is leeg.");
    const headerRowIndex = rows.findIndex(row => row.some(v => normalize(v) === normalize("Naam")));
    if (headerRowIndex < 0) throw new Error("De kolom 'Naam' werd niet gevonden.");

    const headerMap = new Map();
    rows[headerRowIndex].forEach((value, index) => headerMap.set(normalize(value), index));
    const missingHeaders = REQUIRED_HEADERS.filter(header => !headerMap.has(normalize(header)));
    if (missingHeaders.length) {
      throw new Error(`Deze kolommen ontbreken: ${missingHeaders.join(", ")}.`);
    }

    const idx = {
      name: headerMap.get(normalize("Naam")),
      kilos: headerMap.get(normalize("Totaal kilo's")),
      liters: headerMap.get(normalize("Totaal liters")),
      pieces: headerMap.get(normalize("Totaal stuks")),
      packages: headerMap.get(normalize("Aantal verpakkingen"))
    };

    const suppliers = [];
    let current = null;

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const rawName = row[idx.name] || "";
      const trimmed = rawName.trim();
      if (!trimmed) continue;

      const isProduct = /^\(/.test(trimmed);
      if (!isProduct) {
        current = { name: trimmed, products: [], sourceRow: r + 1 };
        suppliers.push(current);
      } else if (current) {
        current.products.push({
          name: trimmed,
          kilos: valueOrDash(row[idx.kilos]),
          liters: valueOrDash(row[idx.liters]),
          pieces: valueOrDash(row[idx.pieces]),
          packages: valueOrDash(row[idx.packages])
        });
      }
    }

    return suppliers.filter(s => s.products.length > 0);
  }

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function supplierKey(name) {
    return normalize(name);
  }

  function valueOrDash(value) {
    const v = String(value ?? "").trim();
    return v === "" ? "-" : v;
  }

  function loadSettings() {
    const defaults = {
      schoolName: "VTI Aalst",
      subjectTemplate: "Bestelling {school} => {leverancier} datum: {datum}",
      introText: "VTI Aalst\nBestelling",
      emails: {}
    };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved ? { ...defaults, ...saved, emails: { ...defaults.emails, ...(saved.emails || {}) } } : defaults;
    } catch {
      return defaults;
    }
  }

  function applySettingsToForm() {
    el.schoolName.value = state.settings.schoolName;
    el.subjectTemplate.value = state.settings.subjectTemplate;
    el.introText.value = state.settings.introText;
  }

  function ensureSupplierSettings() {
    for (const supplier of state.suppliers) {
      const key = supplierKey(supplier.name);
      if (!(key in state.settings.emails)) state.settings.emails[key] = "";
    }
    renderEmailSettings();
  }

  function renderEmailSettings() {
    el.emailSettings.innerHTML = "";
    const names = state.suppliers.length
      ? state.suppliers.map(s => s.name)
      : Object.keys(state.settings.emails).sort((a, b) => a.localeCompare(b, "nl"));

    el.emailSettingsEmpty.hidden = names.length > 0;
    el.emailSettings.hidden = names.length === 0;

    for (const name of names) {
      const key = supplierKey(name);
      const row = document.createElement("div");
      row.className = "email-row";
      row.innerHTML = `
        <div class="supplier-name">${escapeHtml(name)}</div>
        <label>
          <span class="sr-only">E-mailadres ${escapeHtml(name)}</span>
          <input class="email-input" type="email" autocomplete="off" data-supplier-key="${escapeHtml(key)}" placeholder="bestellingen@leverancier.be" value="${escapeHtml(state.settings.emails[key] || "")}">
        </label>`;
      el.emailSettings.appendChild(row);
    }
  }

  function saveSettingsFromForm() {
    state.settings.schoolName = el.schoolName.value.trim() || "VTI Aalst";
    state.settings.subjectTemplate = el.subjectTemplate.value.trim() || "Bestelling {school} => {leverancier} datum: {datum}";
    state.settings.introText = el.introText.value.trim();

    const invalid = [];
    for (const input of el.emailSettings.querySelectorAll(".email-input")) {
      const value = input.value.trim();
      input.classList.remove("invalid");
      if (value && !looksLikeEmail(value)) {
        input.classList.add("invalid");
        invalid.push(value);
      }
      state.settings.emails[input.dataset.supplierKey] = value;
    }

    if (invalid.length) {
      showMessage("Controleer de rood gemarkeerde e-mailadressen.", "error");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    applySettingsToForm();
    renderAll();
    showMessage("Instellingen lokaal opgeslagen.", "success");
  }

  function resetSettings() {
    if (!confirm("Alle lokaal opgeslagen e-mailadressen en mailinstellingen wissen?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state.settings = loadSettings();
    applySettingsToForm();
    ensureSupplierSettings();
    renderAll();
    showMessage("Lokale instellingen zijn gewist.", "success");
  }

  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getSupplierEmail(name) {
    return (state.settings.emails[supplierKey(name)] || "").trim();
  }

  function renderAll() {
    if (!state.suppliers.length) return;
    el.fileNameLabel.textContent = state.fileName;
    const totalProducts = state.suppliers.reduce((sum, s) => sum + s.products.length, 0);
    const missing = state.suppliers.filter(s => !getSupplierEmail(s.name)).length;
    el.fileSummary.innerHTML = `
      <span class="summary-chip">${state.suppliers.length} leveranciers</span>
      <span class="summary-chip">${totalProducts} producten</span>
      <span class="summary-chip">${missing ? `${missing} e-mail${missing === 1 ? "" : "s"} ontbreekt` : "alle e-mails ingevuld"}</span>`;
    renderSupplierList();
    renderEmailSettings();
    renderWorkflow();
  }

  function renderSupplierList() {
    el.supplierList.innerHTML = "";
    state.suppliers.forEach((supplier, index) => {
      const hasEmail = Boolean(getSupplierEmail(supplier.name));
      const sent = state.sent.has(index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `supplier-item${index === state.selectedIndex ? " active" : ""}${sent ? " sent" : ""}`;
      button.innerHTML = `
        <span>
          <span class="name">${escapeHtml(supplier.name)}</span>
          <span class="meta">${supplier.products.length} bestelregel${supplier.products.length === 1 ? "" : "s"}</span>
        </span>
        <span class="dot-status ${sent ? "sent" : hasEmail ? "ready" : "missing"}" title="${sent ? "Verstuurd" : hasEmail ? "Klaar" : "E-mailadres ontbreekt"}"></span>`;
      button.addEventListener("click", () => selectSupplier(index));
      el.supplierList.appendChild(button);
    });
  }

  function selectSupplier(index) {
    state.selectedIndex = index;
    state.currentStep = state.sent.has(index) ? 3 : 0;
    el.copyFeedback.textContent = "";
    renderSupplierList();
    renderWorkflow();
  }

  function renderWorkflow() {
    const supplier = state.suppliers[state.selectedIndex];
    if (!supplier) {
      el.noSupplier.hidden = false;
      el.supplierWorkflow.hidden = true;
      return;
    }
    el.noSupplier.hidden = true;
    el.supplierWorkflow.hidden = false;

    const email = getSupplierEmail(supplier.name);
    const sent = state.sent.has(state.selectedIndex);
    el.currentSupplierName.textContent = supplier.name;
    el.currentSupplierMeta.textContent = `${supplier.products.length} product${supplier.products.length === 1 ? "" : "en"}`;
    el.missingEmailNotice.hidden = Boolean(email);

    el.supplierStatusBadge.className = "status-badge";
    if (sent) {
      el.supplierStatusBadge.classList.add("sent");
      el.supplierStatusBadge.textContent = "Verstuurd";
    } else if (email) {
      el.supplierStatusBadge.classList.add("ready");
      el.supplierStatusBadge.textContent = "Klaar om te kopiëren";
    } else {
      el.supplierStatusBadge.classList.add("missing");
      el.supplierStatusBadge.textContent = "E-mailadres ontbreekt";
    }

    document.querySelectorAll(".stepper .step").forEach(stepEl => {
      const step = Number(stepEl.dataset.step);
      stepEl.classList.toggle("active", step === state.currentStep);
      stepEl.classList.toggle("done", step < state.currentStep || sent);
    });

    const subject = buildSubject(supplier); //onderwerp maken
    const stepData = [
      { instruction: "Plak dit in het veld Aan / To", preview: email || "Nog geen e-mailadres ingevuld", button: "Kopieer e-mailadres" },
      { instruction: "Plak dit in het veld Onderwerp / Subject", preview: subject, button: "Kopieer onderwerp" },
      { instruction: "Plak dit in de inhoud van de mail", preview: "De volledige mailbody met tabelopmaak wordt naar het klembord gekopieerd.", button: "Kopieer body" },
      { instruction: "Verstuur de mail en ga daarna door", preview: "Controleer de mail in je e-mailprogramma en klik hier zodra hij verstuurd is.", button: "Mail verstuurd → volgende leverancier" }
    ][state.currentStep];

    el.stepInstruction.textContent = stepData.instruction;
    el.copyPreview.textContent = stepData.preview;
    el.copyNextButton.textContent = stepData.button;
    el.copyNextButton.disabled = state.currentStep === 0 && !email;
    el.copyAgainButton.hidden = state.currentStep === 0 || state.currentStep === 3;
    el.previousStepButton.hidden = state.currentStep === 0 || sent;
    el.bodyPreview.innerHTML = buildBodyHtml(supplier, false);
  }

  async function handleMainAction() {
    const supplier = state.suppliers[state.selectedIndex];
    if (!supplier) return;
    el.copyFeedback.classList.remove("error");
//voer workfloow uit
    try {
      if (state.currentStep === 0) {
        const email = getSupplierEmail(supplier.name);
        if (!email) throw new Error("Vul eerst het e-mailadres van deze leverancier in.");
        await copyPlain(email);
        state.currentStep = 1;
        setCopyFeedback("E-mailadres gekopieerd. Plak het en klik daarna opnieuw.");
      } else if (state.currentStep === 1) {
        await copyPlain(buildSubject(supplier));
        state.currentStep = 2;
        setCopyFeedback("Onderwerp gekopieerd. Plak het en klik daarna opnieuw.");
      } else if (state.currentStep === 2) {
        await copyRich(buildBodyHtml(supplier, true), buildBodyText(supplier));
        state.currentStep = 3;
        setCopyFeedback("Mailbody gekopieerd. Plak hem in de mail, controleer en verstuur.");
      } else {
        state.sent.add(state.selectedIndex);
        const next = findNextUnsentSupplier(state.selectedIndex + 1);
        if (next >= 0) {
          state.selectedIndex = next;
          state.currentStep = 0;
          setCopyFeedback("");
        } else {
          setCopyFeedback("Alle leveranciers in dit bestand zijn afgewerkt.");
        }
        renderSupplierList();
      }
      renderWorkflow();
    } catch (error) {
      el.copyFeedback.classList.add("error");
      el.copyFeedback.textContent = error?.message || "Kopiëren is niet gelukt.";
    }
  }

  async function copyCurrentStepAgain() {
    const supplier = state.suppliers[state.selectedIndex];
    if (!supplier) return;
    try {
      if (state.currentStep === 1) {
        await copyPlain(buildSubject(supplier));
        setCopyFeedback("Onderwerp opnieuw gekopieerd.");
      } else if (state.currentStep === 2) {
        await copyRich(buildBodyHtml(supplier, true), buildBodyText(supplier));
        setCopyFeedback("Mailbody opnieuw gekopieerd.");
      }
    } catch (error) {
      el.copyFeedback.classList.add("error");
      el.copyFeedback.textContent = error?.message || "Kopiëren is niet gelukt.";
    }
  }

  function findNextUnsentSupplier(start) {
    for (let i = start; i < state.suppliers.length; i++) if (!state.sent.has(i)) return i;
    for (let i = 0; i < start; i++) if (!state.sent.has(i)) return i;
    return -1;
  }

  function setCopyFeedback(message) {
    el.copyFeedback.classList.remove("error");
    el.copyFeedback.textContent = message;
  }

  function buildSubject(supplier) {
    return (state.settings.subjectTemplate || "")
      .replaceAll("{school}", state.settings.schoolName)
      .replaceAll("{leverancier}", supplier.name)
      .replaceAll("{datum}", formatDate(new Date()));
  }

  function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  function buildBodyText(supplier) {
    const intro = state.settings.introText.trim();
    const headers = ["Product", "Totaal kilo's", "Totaal liters", "Totaal stuks", "Te bestellen hoeveelheid"];
    const rows = supplier.products.map(p => [p.name, p.kilos, p.liters, p.pieces, p.packages].join("\t"));
    return [intro, "", headers.join("\t"), ...rows].filter((line, index, array) => !(line === "" && index === 0 && array.length)).join("\n");
  }

  function buildBodyHtml(supplier, clipboardVersion) {
    const introLines = (state.settings.introText || "").split(/\r?\n/).map(line => `<div style="margin:0 0 4px 0;">${escapeHtml(line) || "&nbsp;"}</div>`).join("");
    const table = `
    
      <table class="mail-table" style="border-collapse:collapse;width:100%;margin-top:14px;font-family:Arial,sans-serif;font-size:13px;">
        <thead><tr>
          <th style="border:1px solid #aab4bd;padding:6px 8px;background:#eef3f7;text-align:left;">Product</th>
          <th style="border:1px solid #aab4bd;padding:6px 8px;background:#eef3f7;text-align:left;">Totaal kilo's</th>
          <th style="border:1px solid #aab4bd;padding:6px 8px;background:#eef3f7;text-align:left;">Totaal liters</th>
          <th style="border:1px solid #aab4bd;padding:6px 8px;background:#eef3f7;text-align:left;">Totaal stuks</th>
          <th style="border:1px solid #aab4bd;padding:6px 8px;background:#eef3f7;text-align:left;">Te bestellen hoeveelheid</th>
        </tr></thead>
        <tbody>${supplier.products.map(p => `<tr>
          <td style="border:1px solid #c9d1d8;padding:6px 8px;">${escapeHtml(p.name)}</td>
          <td style="border:1px solid #c9d1d8;padding:6px 8px;white-space:nowrap;">${escapeHtml(p.kilos)}</td>
          <td style="border:1px solid #c9d1d8;padding:6px 8px;white-space:nowrap;">${escapeHtml(p.liters)}</td>
          <td style="border:1px solid #c9d1d8;padding:6px 8px;white-space:nowrap;">${escapeHtml(p.pieces)}</td>
          <td style="border:1px solid #c9d1d8;padding:6px 8px;white-space:nowrap;">${escapeHtml(p.packages)}</td>
        </tr>`).join("")}</tbody>
      </table>`;
    const content = `${introLines}${table}`;
    return clipboardVersion ? `<div style="font-family:Arial,sans-serif;font-size:13px;color:#111;">${content}</div>` : content;
  }

  async function SentMailThroughMailApp(){
    const supplier = state.suppliers[state.selectedIndex];
    if (!supplier) return;
    el.copyFeedback.classList.remove("error");
      try {
        const email = getSupplierEmail(supplier.name);
        if (!email) throw new Error("Vul eerst het e-mailadres van deze leverancier in.");
       
        buildSubject(supplier)
        buildBodyHtml(supplier, true)
        await copyRich(buildBodyHtml(supplier, true), buildBodyText(supplier));

        
       const mailinfo = `mailto:${email}?Subject=${buildSubject(supplier)}`;
       window.open(mailinfo);
        state.currentStep = 3;
        setCopyFeedback("Mailbody gekopieerd. Plak hem in de mail, controleer en verstuur.");
        state.sent.add(state.selectedIndex);
        const next = findNextUnsentSupplier(state.selectedIndex + 1);
        if (next >= 0) {
          state.selectedIndex = next;
          state.currentStep = 0;
          setCopyFeedback("");
        } else {
          setCopyFeedback("Alle leveranciers in dit bestand zijn afgewerkt.");
        }
        renderSupplierList();
      
      renderWorkflow();
    } catch (error) {
      el.copyFeedback.classList.add("error");
      el.copyFeedback.textContent = error?.message || "Kopiëren is niet gelukt.";
    }
   
  }
  async function copyPlain(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    fallbackCopyText(text);
  }

  async function copyRich(html, text) {
    if (navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext) {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
      return;
    }

    const holder = document.createElement("div");
    holder.contentEditable = "true";
    holder.setAttribute("aria-hidden", "true");
    holder.style.position = "fixed";
    holder.style.left = "-9999px";
    holder.style.top = "0";
    holder.innerHTML = html;
    document.body.appendChild(holder);
    const range = document.createRange();
    range.selectNodeContents(holder);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const ok = document.execCommand("copy");
    selection.removeAllRanges();
    holder.remove();
    if (!ok) fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    if (!ok) throw new Error("De browser blokkeerde het klembord. Probeer Chrome of Edge en sta kopiëren toe.");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showMessage(text, type) {
    el.globalMessage.textContent = text;
    el.globalMessage.className = `message ${type || ""}`;
    el.globalMessage.hidden = false;
  }

  function hideMessage() {
    el.globalMessage.hidden = true;
  }
})();

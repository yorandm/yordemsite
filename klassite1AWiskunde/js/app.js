(function () {
  const config = window.SITE_CONFIG;
  const root = document.documentElement;
  const depth = Number(document.body.dataset.depth || 0);
  const prefix = depth ? "../".repeat(depth) : "";
  const page = document.body.dataset.page || "";

  document.querySelectorAll("[data-site-name]").forEach(el => el.textContent = config.siteName);
  document.querySelectorAll("[data-site-subtitle]").forEach(el => el.textContent = config.subtitle);
  document.title = `${document.body.dataset.title || "Start"} | ${config.siteName}`;

  const nav = document.querySelector("[data-navigation]");
  if (nav) {
    const permanent = config.permanentLinks.map(link => navLink(link.title, prefix + link.url, link.icon)).join("");
    const chapters = config.chapters.filter(ch => ch.visible).map(ch =>
      navLink(`H${ch.number} · ${ch.title}`, `${prefix}hoofdstukken/${ch.slug}.html`, String(ch.number))
    ).join("");
    nav.innerHTML = `<div class="nav-group"><p>Vast</p>${permanent}</div><div class="nav-group"><p>Hoofdstukken</p>${chapters}</div>`;
  }

  function navLink(title, url, icon) {
    const current = url.split("/").pop().replace(".html", "");
    const active = page === current ? ' aria-current="page"' : "";
    return `<a href="${url}"${active}><span>${icon}</span>${title}</a>`;
  }

  document.querySelectorAll("[data-menu-button]").forEach(button => {
    button.addEventListener("click", () => root.classList.toggle("menu-open"));
  });

  document.querySelectorAll("[data-answer-button]").forEach(button => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      answer.hidden = !answer.hidden;
      button.setAttribute("aria-expanded", String(!answer.hidden));
      button.textContent = answer.hidden ? "Toon antwoord" : "Verberg antwoord";
    });
  });

  const venn = document.querySelector("[data-venn]");
  if (venn) {
    const labels = {
      all: "Alle elementen van A en B",
      intersection: "A ∩ B = {3, 4} — de elementen in beide verzamelingen",
      union: "A ∪ B = {1, 2, 3, 4, 5} — de elementen in minstens één verzameling",
      "a-minus-b": "A ∖ B = {1, 2} — wel in A, niet in B",
      "b-minus-a": "B ∖ A = {5} — wel in B, niet in A"
    };
    document.querySelectorAll("[data-venn-operation]").forEach(button => {
      button.addEventListener("click", () => {
        const operation = button.dataset.vennOperation;
        document.querySelectorAll("[data-venn-operation]").forEach(item => item.classList.toggle("active", item === button));
        venn.dataset.activeOperation = operation;
        venn.querySelectorAll("[data-outline]").forEach(path => path.classList.toggle("active", path.dataset.outline === operation));
        venn.querySelectorAll("[data-regions]").forEach(element => {
          element.classList.toggle("selected", operation === "all" || element.dataset.regions.split(" ").includes(operation));
          element.classList.toggle("muted", operation !== "all" && !element.dataset.regions.split(" ").includes(operation));
        });
        document.querySelector("[data-operation-result]").textContent = labels[operation];
      });
    });
  }
})();

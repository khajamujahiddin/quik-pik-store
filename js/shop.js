/** Shop page: search + category filter */
(function () {
  const grid = () => document.getElementById("product-grid");
  const empty = () => document.getElementById("shop-empty");
  const countEl = () => document.getElementById("result-count");

  function currentCategory() {
    const params = new URLSearchParams(location.search);
    return params.get("cat") || "all";
  }

  function currentQuery() {
    const input = document.getElementById("shop-search");
    return (input && input.value.trim().toLowerCase()) || "";
  }

  function filtered() {
    const cat = currentCategory();
    const q = currentQuery();
    let list = window.QUIK_PIK_PRODUCTS || [];

    if (cat !== "all") {
      list = list.filter((p) => p.category === cat);
    }
    if (q) {
      list = list.filter((p) => {
        const hay = [p.name, p.brand, p.category, ...(p.tags || [])]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }

  function syncFilterUI() {
    const cat = currentCategory();
    document.querySelectorAll("[data-filter-cat]").forEach((el) => {
      const active = el.getAttribute("data-filter-cat") === cat;
      el.classList.toggle("filter-active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const title = document.getElementById("shop-heading");
    if (title) {
      const meta = (window.QUIK_PIK_CATEGORIES || []).find((c) => c.id === cat);
      title.textContent = meta ? meta.label : "Shop";
    }
  }

  async function ensureAgeForCategory(cat) {
    const meta = (window.QUIK_PIK_CATEGORIES || []).find((c) => c.id === cat);
    if (meta && meta.restricted) {
      return QuikPikAge.requireForRestricted();
    }
    return true;
  }

  async function render() {
    const cat = currentCategory();
    const ok = await ensureAgeForCategory(cat);
    if (!ok && cat !== "all") {
      history.replaceState(null, "", "shop.html");
      render();
      return;
    }

    syncFilterUI();
    const list = filtered();
    const g = grid();
    const e = empty();
    if (!g) return;

    if (countEl()) {
      countEl().textContent = list.length + " item" + (list.length === 1 ? "" : "s");
    }

    if (!list.length) {
      g.innerHTML = "";
      if (e) e.classList.remove("hidden");
      return;
    }
    if (e) e.classList.add("hidden");

    g.innerHTML = list
      .map((p) => QuikPikUI.renderCard(p, { blurRestricted: cat === "all" }))
      .join("");
  }

  window.QuikPikShopRefresh = render;

  function setCategory(cat) {
    const url = new URL(location.href);
    if (cat === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", cat);
    history.pushState(null, "", url);
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    QuikPikUI.setActiveNav("shop");

    document.querySelectorAll("[data-filter-cat]").forEach((el) => {
      el.addEventListener("click", async () => {
        const cat = el.getAttribute("data-filter-cat");
        const ok = await ensureAgeForCategory(cat);
        if (!ok) return;
        setCategory(cat);
      });
    });

    const search = document.getElementById("shop-search");
    if (search) {
      let t;
      search.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(render, 120);
      });
    }

    window.addEventListener("popstate", render);
    render();
  });
})();

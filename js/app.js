/** Shared UI helpers + shop rendering */
(function () {
  const CATEGORY_LABELS = Object.fromEntries(
    (window.QUIK_PIK_CATEGORIES || []).map((c) => [c.id, c.label])
  );

  function formatPrice(p) {
    if (p.informational || p.price == null) return "Ask in store";
    return "$" + Number(p.price).toFixed(2);
  }

  function initials(name) {
    return (name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function placeholderSvg(product) {
    const label = initials(product.brand || product.name);
    const bg = product.ageRestricted ? "#1c1917" : "#27272a";
    const accent = "#d4a017";
    const brand = (product.brand || "").slice(0, 28);
    return (
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
          <rect fill="${bg}" width="400" height="400"/>
          <rect x="24" y="24" width="352" height="352" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35" rx="16"/>
          <text x="200" y="190" text-anchor="middle" fill="${accent}" font-family="Georgia,serif" font-size="64" font-weight="700">${label}</text>
          <text x="200" y="240" text-anchor="middle" fill="#a1a1aa" font-family="system-ui,sans-serif" font-size="14">${brand}</text>
        </svg>`
      )
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.QuikPikUI = {
    formatPrice,
    placeholderSvg,
    productImageSrc(product) {
      return product.image || placeholderSvg(product);
    },
    onImgError(img) {
      img.onerror = null;
      const brand = img.getAttribute("data-brand") || "";
      const name = img.getAttribute("data-name") || "";
      const age = img.getAttribute("data-age") === "1";
      img.src = placeholderSvg({ brand, name, ageRestricted: age });
    },
    categoryLabel(id) {
      return CATEGORY_LABELS[id] || id;
    },
    renderCard(product, opts = {}) {
      const locked =
        QuikPikAge.isRestrictedProduct(product) && !QuikPikAge.isVerified();
      const price = formatPrice(product);
      const cat = this.categoryLabel(product.category);
      const badge = product.informational
        ? `<span class="badge-info">Info</span>`
        : `<span class="badge-instore">In store</span>`;
      const ageBadge = product.ageRestricted
        ? `<span class="badge-21">21+</span>`
        : "";

      if (locked && opts.blurRestricted) {
        return `
          <article class="product-card group relative overflow-hidden opacity-90">
            <div class="aspect-square bg-zinc-900 flex items-center justify-center relative">
              <div class="absolute inset-0 backdrop-blur-md bg-zinc-950/70 z-10 flex flex-col items-center justify-center p-4 text-center">
                <span class="text-amber-400 font-bold text-lg mb-1">21+</span>
                <button type="button" class="age-unlock-btn text-xs text-zinc-300 underline hover:text-amber-300" data-action="unlock">Verify age to view</button>
              </div>
              <div class="w-full h-full bg-zinc-800"></div>
            </div>
            <div class="p-4">
              <p class="text-xs text-zinc-500 uppercase tracking-wide">${cat}</p>
              <h3 class="font-semibold text-zinc-400 mt-1 truncate">Restricted item</h3>
            </div>
          </article>`;
      }

      return `
        <article class="product-card group" data-id="${product.id}" data-category="${product.category}">
          <div class="aspect-square bg-zinc-900/80 relative overflow-hidden rounded-t-xl">
            <img src="${this.productImageSrc(product)}" alt="${escapeHtml(product.name)}"
              class="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
              loading="lazy"
              data-brand="${escapeHtml(product.brand || "")}"
              data-name="${escapeHtml(product.name || "")}"
              data-age="${product.ageRestricted ? "1" : "0"}"
              onerror="QuikPikUI.onImgError(this)" />
            <div class="absolute top-2 left-2 flex flex-wrap gap-1">${badge}${ageBadge}</div>
          </div>
          <div class="p-4 border-t border-zinc-800">
            <p class="text-xs text-amber-500/80 uppercase tracking-wider">${cat}</p>
            <h3 class="font-semibold text-white mt-1 leading-snug line-clamp-2">${escapeHtml(product.name)}</h3>
            <p class="text-sm text-zinc-500 mt-0.5">${escapeHtml(product.brand || "")}</p>
            <p class="mt-2 text-lg font-bold text-amber-400">${price}</p>
          </div>
        </article>`;
    },
    setActiveNav(page) {
      document.querySelectorAll("[data-nav]").forEach((el) => {
        el.classList.toggle("nav-active", el.getAttribute("data-nav") === page);
      });
    },
  };

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action=unlock]");
    if (btn) {
      const ok = await QuikPikAge.requireForRestricted();
      if (ok && typeof window.QuikPikShopRefresh === "function") {
        window.QuikPikShopRefresh();
      } else if (ok) {
        location.reload();
      }
    }
  });
})();

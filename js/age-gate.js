/** Age gate — sessionStorage. Restricted categories require verified 21+. */
(function () {
  const KEY = "quikpik_age_verified";
  const RESTRICTED = new Set(["vapes", "tobacco", "accessories", "hookah", "glass"]);

  window.QuikPikAge = {
    isVerified() {
      return sessionStorage.getItem(KEY) === "yes";
    },
    verify() {
      sessionStorage.setItem(KEY, "yes");
    },
    deny() {
      sessionStorage.setItem(KEY, "no");
    },
    isRestrictedCategory(cat) {
      return RESTRICTED.has(cat);
    },
    isRestrictedProduct(p) {
      return !!(p && (p.ageRestricted || RESTRICTED.has(p.category)));
    },
    /** Show modal; returns Promise<boolean> */
    prompt() {
      return new Promise((resolve) => {
        if (this.isVerified()) {
          resolve(true);
          return;
        }
        const existing = document.getElementById("age-gate-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "age-gate-overlay";
        overlay.className =
          "fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm";
        overlay.innerHTML = `
          <div class="w-full max-w-md rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl shadow-amber-900/20 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400/60 bg-amber-500/10">
              <span class="text-2xl font-bold text-amber-400">21+</span>
            </div>
            <h2 class="font-display text-2xl font-bold text-white mb-2">Age Verification</h2>
            <p class="text-zinc-400 text-sm mb-6 leading-relaxed">
              Tobacco, vape, and smoking accessories are for adults <strong class="text-amber-300">21 years or older</strong> only.
              By entering you confirm you are of legal age in Meriden, CT and your jurisdiction.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" id="age-yes" class="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/25">
                I am 21 or older
              </button>
              <button type="button" id="age-no" class="rounded-xl border border-zinc-600 px-6 py-3 font-semibold text-zinc-300 hover:bg-zinc-800 transition">
                Under 21
              </button>
            </div>
            <p class="mt-4 text-xs text-zinc-600">A&amp;S Quik Pik · Meriden, CT</p>
          </div>`;
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        overlay.querySelector("#age-yes").onclick = () => {
          this.verify();
          overlay.remove();
          document.body.style.overflow = "";
          resolve(true);
        };
        overlay.querySelector("#age-no").onclick = () => {
          this.deny();
          overlay.innerHTML = `
            <div class="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center">
              <h2 class="text-xl font-bold text-white mb-3">Sorry</h2>
              <p class="text-zinc-400 text-sm mb-6">You must be 21+ to view tobacco and vape products. Convenience items remain available.</p>
              <a href="index.html" class="inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400">Back to Home</a>
            </div>`;
          resolve(false);
        };
      });
    },
    async requireForRestricted() {
      if (this.isVerified()) return true;
      return this.prompt();
    },
  };
})();

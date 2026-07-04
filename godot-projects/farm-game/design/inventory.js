/**
 * Farm Kingdom — Inventory tab filtering
 *
 * Expects this HTML shape:
 *
 *   <div class="inventory" id="inventory">
 *     <div class="inventory__tabs">
 *       <div class="tab-row tab-row--primary">
 *         <button class="tab active" data-category="all">All</button>
 *         <button class="tab" data-category="seeds">Seeds</button>
 *         <button class="tab" data-category="fish">Fish</button>
 *         ...
 *       </div>
 *       <div class="tab-row tab-row--secondary" id="secondary-tabs">
 *         <!-- populated by JS when a primary tab is active -->
 *       </div>
 *     </div>
 *     <div class="inventory__scroll">
 *       <div class="inventory__grid" id="item-grid">
 *         <div class="item-slot"
 *              data-category="fish"
 *              data-subcategory="bluegill"
 *              data-tooltip="Yellow Bluegill · 4 silver">
 *           <img class="item-slot__icon" src="sprites/yellow_bluegill.png" alt="Yellow Bluegill">
 *           <span class="item-slot__name">Yellow Bluegill</span>
 *           <span class="item-slot__badge">12</span>
 *         </div>
 *         ...
 *       </div>
 *     </div>
 *   </div>
 */

// Sub-category labels per primary category
const SUBCATEGORIES = {
  fish:      ["All Fish", "Bluegill", "Chubfish", "Frog", "Carp", "Rare"],
  seeds:     ["All Seeds", "Flowers", "Vegetables", "Grains"],
  crops:     ["All Crops", "Vegetables", "Grains", "Flowers"],
  tools:     ["All Tools", "Axes", "Pickaxes", "Hoes", "Rods"],
  materials: ["All Materials", "Wood", "Stone", "Ingots", "Fiber"],
  livestock: ["All Livestock", "Chickens", "Eggs"],
  recipes:   [],   // no sub-filter needed
  structures: [],
};

class Inventory {
  constructor(rootEl) {
    this.root       = rootEl;
    this.grid       = rootEl.querySelector("#item-grid");
    this.primaryRow = rootEl.querySelector(".tab-row--primary");
    this.secondaryRow = rootEl.querySelector("#secondary-tabs");
    this.slots      = Array.from(this.grid.querySelectorAll(".item-slot"));

    this._activeCategory    = "all";
    this._activeSubcategory = "all";

    this._bindPrimaryTabs();
    this._renderSecondaryTabs("all");
    this._applyFilter();
  }

  _bindPrimaryTabs() {
    this.primaryRow.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;

      this.primaryRow.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      this._activeCategory    = tab.dataset.category ?? "all";
      this._activeSubcategory = "all";

      this._renderSecondaryTabs(this._activeCategory);
      this._applyFilter();
    });
  }

  _renderSecondaryTabs(category) {
    this.secondaryRow.innerHTML = "";
    const subs = SUBCATEGORIES[category] ?? [];
    if (subs.length === 0) return;

    subs.forEach((label, i) => {
      const btn = document.createElement("button");
      btn.className = "tab" + (i === 0 ? " active" : "");
      btn.dataset.subcategory = i === 0 ? "all" : label.toLowerCase().replace(/\s+/g, "_");
      btn.textContent = label;
      this.secondaryRow.appendChild(btn);
    });

    this.secondaryRow.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      this.secondaryRow.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      this._activeSubcategory = tab.dataset.subcategory ?? "all";
      this._applyFilter();
    });
  }

  _applyFilter() {
    let visible = 0;

    this.slots.forEach(slot => {
      const cat    = slot.dataset.category ?? "";
      const subcat = slot.dataset.subcategory ?? "";

      const catMatch = this._activeCategory === "all" || cat === this._activeCategory;
      const subMatch = this._activeSubcategory === "all" ||
                       subcat === this._activeSubcategory;

      const show = catMatch && subMatch;
      slot.hidden = !show;
      if (show) visible++;
    });

    // Update visible count in header if element exists
    const countEl = this.root.querySelector(".count-visible");
    if (countEl) countEl.textContent = visible;
  }

  /** Call this to refresh slots after inventory data changes */
  refresh(items) {
    this.grid.innerHTML = "";
    this.slots = [];

    items.forEach(item => {
      if (!item.count || item.count <= 0) return;

      const slot = document.createElement("div");
      slot.className = "item-slot" + (item.rarity ? ` item-slot--${item.rarity}` : "");
      slot.dataset.category    = item.category ?? "misc";
      slot.dataset.subcategory = item.subcategory ?? "";
      slot.dataset.tooltip     = `${item.name} · ${_priceLabel(item)}`;

      slot.innerHTML = `
        <img class="item-slot__icon" src="${item.sprite}" alt="${item.name}">
        <span class="item-slot__name">${item.name}</span>
        <span class="item-slot__badge${item.currency === 'gold' ? ' item-slot__badge--gold' : ''}">${item.count}</span>
      `;

      this.grid.appendChild(slot);
      this.slots.push(slot);
    });

    this._applyFilter();
  }
}

function _priceLabel(item) {
  if (item.sell_price_gold  > 0) return `${item.sell_price_gold} gold`;
  if (item.sell_price_silver > 0) return `${item.sell_price_silver} silver`;
  return "no value";
}

// Auto-init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("inventory");
  if (el) window.farmInventory = new Inventory(el);
});

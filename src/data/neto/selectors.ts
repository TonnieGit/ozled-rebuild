/**
 * OutputSelectors per call (SPEC §4.1). Request only what the mappers use.
 * Names follow Neto's API docs; each one is a VERIFY item until the Phase 0
 * selector probe runs with real credentials (docs/neto-field-map.md §1).
 */

export const ITEM_SELECTORS = [
  "ID",
  "SKU",
  "ParentSKU",
  "Name",
  "Brand",
  "Model",
  "ItemURL",
  "Approved",
  "IsActive",
  "Visible",
  "DefaultPrice",
  "RRP",
  "PromotionPrice",
  "AvailableSellQuantity",
  "WarehouseQuantity",
  "Images",
  "Categories",
  "Description",
  "ShortDescription",
  "Features",
  "ItemSpecifics",
  "CrossSellProducts",
  "UPC",
  "SEOPageTitle",
  "SEOMetaDescription",
  "DateAdded",
  "DateUpdated",
  // Custom fields proposed for structured data (neto-field-map.md §5).
  // Assignments are placeholders until OzLED creates the fields.
  "Misc01",
  "Misc02",
  "Misc03",
  "Misc04",
  "Misc05",
] as const;

export const CATEGORY_SELECTORS = [
  "CategoryID",
  "CategoryName",
  "ParentCategoryID",
  "CategoryURL",
  "Active",
  "OnMenu",
  "OnSiteMap",
  "SortOrder",
  "Description1",
  "SEOPageTitle",
  "SEOMetaDescription",
] as const;

export const CONTENT_SELECTORS = [
  "ContentID",
  "ContentName",
  "ContentType",
  "ContentURL",
  "Active",
  "SortOrder",
  "Description1",
  "ShortDescription1",
  "Author",
  "DatePosted",
  "DateUpdated",
  "SEOPageTitle",
  "SEOMetaDescription",
] as const;

/**
 * Proposed custom-field assignments for structured product data.
 * Values are JSON so one field can carry a typed object.
 */
export const CUSTOM_FIELDS = {
  specs: "Misc01", // JSON matching ProductSpecs
  applications: "Misc02", // comma list: ute-tray,trailer,...
  documents: "Misc03", // JSON ProductDocument[]
  restricted: "Misc04", // "1" | "0"
  videos: "Misc05", // comma list of YouTube IDs
} as const;

/** Brendale showroom warehouse ID (VERIFY). */
export const PICKUP_WAREHOUSE_ID = process.env.NETO_PICKUP_WAREHOUSE_ID ?? "1";
export const LOW_STOCK_THRESHOLD = 5;

import { describe, expect, it } from "vitest";
import { decodeNsd, encodeNsd, parseNetoAjax } from "../../src/lib/cart/nsd";
import { netoMultiUrl } from "../../src/lib/cart/types";

// Captured from POST https://www.ozled.com.au/ajax/addtocart proc=ShowItem (guest, empty cart), 20 Oct 2026.
const SHOW_ITEM =
  "^NETO^SUCCESS^NSD1;#6|$9|cartitems@0|$10|csrf_token$96|b6d74f63021f96e9a829d16666009d47845f65fa%2Cd9f6d0bd626499a88b978b73d5cc97fa381932f0%2C1792474221$15|discountmessage$0|$8|lastitem#0|$12|neto_cart_id$0|$5|total#10|$11|checkouturl$64|https%3A%2F%2Fwww.ozled.com.au%2F_mycart%3Fts%3D1792474221071883$14|discount_total$1|0$11|grand_total$0|$10|item_count$0|$16|product_discount$0|$13|product_total$0|$13|shipping_cost$1|0$17|shipping_discount$0|$15|shipping_method$0|$14|shipping_total$1|0";

const CSRF_FAIL =
  "^NETO^FAIL^NSD1;#2|$10|csrf_token$96|673fcafc4e169dbe1542a6f3c42cee69b377d8cb%2C9db5750da1fa858505f7972ef5f3a3b2223fe9f8%2C1792474215$3|msg$75|Form submission problem encountered%3A Failed CSRF check. Please try again.";

describe("Neto NSD1", () => {
  it("parses a real ShowItem response", () => {
    const { status, data } = parseNetoAjax(SHOW_ITEM);
    expect(status).toBe("SUCCESS");
    expect(data.cartitems).toEqual([]);
    expect(String(data.csrf_token)).toMatch(/^[0-9a-f]{40},[0-9a-f]{40},\d+$/);
    const total = data.total as Record<string, string>;
    expect(total.checkouturl).toBe("https://www.ozled.com.au/_mycart?ts=1792474221071883");
    expect(total.shipping_total).toBe("0");
  });

  it("parses a CSRF failure and exposes the fresh token", () => {
    const { status, data } = parseNetoAjax(CSRF_FAIL);
    expect(status).toBe("FAIL");
    expect(data.msg).toBe("Form submission problem encountered: Failed CSRF check. Please try again.");
    expect(typeof data.csrf_token).toBe("string");
  });

  it("round-trips nested values including unicode", () => {
    const value = { items: { "LED-123": "2", "BASE6 Ø": "1" }, list: ["a b", "ü"], empty: "" };
    expect(decodeNsd(encodeNsd(value))).toEqual(value);
  });

  it("encodes like Neto's create_netosd_data", () => {
    expect(encodeNsd({ SKU1: "2" })).toBe("NSD1;#1|$4|SKU1$1|2");
  });

  it("returns ERROR for non-Neto responses", () => {
    expect(parseNetoAjax("<html>Just a moment...</html>").status).toBe("ERROR");
  });
});

describe("netoMultiUrl", () => {
  it("builds the multi-add checkout URL (SPEC §6.1)", () => {
    expect(
      netoMultiUrl("https://www.ozled.com.au", [
        { sku: "A1", qty: 2 },
        { sku: "B2", qty: 1 },
      ], true),
    ).toBe("https://www.ozled.com.au/_mycart?multi=2&sku0=A1&qty0=2&sku1=B2&qty1=1&fn=payment");
  });
});

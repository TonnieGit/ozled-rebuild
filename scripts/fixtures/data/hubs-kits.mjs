// Application hubs (SPEC §7.2) and kits (SPEC §7.3).
// Hub paths were checked against the 2,955-URL sitemap: none collide.

const ADR_COMMON = `<p>The Australian Design Rules (ADRs) are the national standards for vehicle safety. For lighting, <strong>ADR 13</strong> sets out which lamps and reflectors a vehicle or trailer must have and where they are mounted, while lamp-specific rules set the performance of each lamp, for example <strong>ADR 6</strong> for direction indicators and <strong>ADR 49</strong> for position (tail) lamps, stop lamps and end-outline marker lamps. Many lighting ADRs also accept the equivalent UN ECE regulations, which is why some lamps are listed as ECE approved.</p>
<p>On each OzLED product page, the approval is shown as the manufacturer states it, such as "ADR approved (CRN 37380/37381)" or "ECE approved", and LED Autolamps fitting instructions refer to ADR 13/00 for mounting positions. Registration and modification rules are managed by each state and territory, so check with your local authority if you're unsure.</p>`;

export const HUBS = [
  {
    path: "/ute-tray-lights/",
    application: "ute-tray",
    name: "Ute & Tray Builds",
    navLabel: "Ute & Tray",
    summary:
      "A ute tray needs a pair of rear combination tail lights (stop, tail and indicator, often with reverse), a licence plate light and wiring to connect them. Plug-and-play kits use vehicle-specific patch leads, while hard-wired lamps may also need brackets and load resistors. Choose 12–24V lamps for trucks and check each lamp's stated approval.",
    hero: {
      url: "https://www.ozled.com.au/assets/alt_5/LED385ARWM-2.png?20260114154652",
      file: "ute-tray.webp",
      alt: "Steel ute tray with LED Autolamps 385 Series tail lights fitted to the rear",
      view: "installed",
    },
    checklist: [
      { label: "Tail lights (pair)", description: "Combination lamps with stop, tail and indicator on each side; many include reverse and a reflector.", required: true, href: "/led-combination-tail-lights/?application=ute-tray" },
      { label: "Licence plate light", description: "Lights the rear number plate. Some lamps need two fitted, so check the fitting instructions.", required: true, href: "/led-licence-plate-lights/?application=ute-tray" },
      { label: "Patch leads or wiring", description: "Plug-and-play kits include vehicle-specific patch leads; hard-wired lamps join the existing loom.", required: true, href: "/plug-and-play-led-tail-lights/?application=ute-tray" },
      { label: "Mounting brackets", description: "Right-angle tray brackets for lamps that don't bolt straight to the tray.", required: false, href: "/led-tail-light-accessories-brackets/?application=ute-tray" },
      { label: "Load resistors", description: "Stop light-failure warnings or fast indicator flashing after an LED upgrade.", required: false, href: "/circuit-protection/?application=ute-tray" },
      { label: "Trailer plug or socket", description: "If you tow, match the plug or socket to your trailer, such as 7-pin flat.", required: false, href: "/automotive/towing-gear/trailer-sockets-plugs/?connector=7-pin-flat" },
      { label: "Work lights (optional)", description: "Flood-beam work lights for lighting the tray and work area.", required: false, href: "/led-work-lights/?application=ute-tray" },
    ],
    featuredKitPath: "/kits/ute-tray-lighting/",
    relatedCategoryPaths: ["/led-combination-tail-lights/", "/led-tail-lights/", "/plug-and-play-led-tail-lights/", "/led-licence-plate-lights/", "/led-tail-light-accessories-brackets/"],
    adrExplainerHtml: `${ADR_COMMON}
<p>For plug-and-play tray kits, OzLED notes that the lamps themselves are ADR approved, but plug-and-play patch lead systems fall outside the ADR because of the load resistors built into the harness.</p>`,
    faqs: [
      { question: "What lights does a ute tray need?", answer: "Rear lamps that provide stop, tail and indicator on each side, rear reflectors and a licence plate light, positioned as ADR 13 sets out. Most tray combination lamps also include reverse and a built-in reflector. Check your state's requirements for your vehicle." },
      { question: "Should I choose plug-and-play or hard-wired tail lights?", answer: "Plug-and-play kits plug into your vehicle's existing tail light loom with vehicle-specific patch leads, so there's no cutting or splicing. Hard-wired lamps suit custom trays and trailers, and can be adapted to patch leads with an adaptor lead such as the LED Autolamps 2LR12/450B." },
      { question: "Are plug-and-play tail light kits ADR compliant?", answer: "The lamps are ADR approved, but OzLED notes that plug-and-play patch lead systems fall outside the ADR because of the load resistors built into the harness. Contact the team if you need advice for your vehicle." },
      { question: "Do I need load resistors for LED tail lights?", answer: "Some vehicles show a light-failure warning or flash the indicators quickly because LEDs draw less current than globes. A load resistor wired between the lamp's input wires fixes this. You may need one per function on each side, and it must be mounted on metal because it can reach 170°C." },
      { question: "Should I buy 12V or 12–24V tail lights?", answer: "Multivolt 12–24V lamps work on both 12V utes and 24V trucks. Lamps listed as 12V only should only be used on 12V vehicles." },
      { question: "How many licence plate lights do I need?", answer: "It depends on the lamp. The LED Autolamps 41 Series fitting instructions say two lamps are required, while the 35 Series is fitted as a single lamp above the centre of the plate. Check the fitting instructions on the product page." },
      { question: "Will a tray bracket fit Maxilamp tail lights?", answer: "Not all of them. The LED Autolamps multi-fit right-angle bracket suits the 80, 275, 280, 282, 283 and 284 series lamps, and its listing states it does not fit Maxilamp C3 series tail lights." },
    ],
    relatedPostPaths: ["/blog/our-blog/before-you-buy-led-tail-lights/", "/blog/our-blog/led-load-resistors/", "/blog/our-blog/screw-in-or-bolt-on-rear-combination-lamps/"],
    seo: {
      title: "Ute & Tray Lights: What You Need | OzLED",
      description: "Everything a ute tray needs: LED tail lights, licence plate lights, plug-and-play patch leads, brackets and load resistors, with plain-English ADR notes.",
    },
  },
  {
    path: "/trailer-boat-lights/",
    application: "trailer",
    name: "Trailer & Boat",
    navLabel: "Trailer & Boat",
    summary:
      "A trailer needs stop, tail and indicator lamps on each side, rear reflectors, a licence plate light and a plug that matches your tow vehicle's socket. Boat trailers need lamps described as submersible, rated IP67 or IP68. Larger trailers also need marker lights, and plug-in cable kits make wiring longer trailers simpler.",
    hero: {
      url: "https://www.ozled.com.au/assets/full/LED210BARLP2B.png?20220719104842",
      file: "trailer-boat.webp",
      alt: "Pair of LED Autolamps 210 Series submersible boat trailer tail lights",
      view: "main",
    },
    checklist: [
      { label: "Trailer tail lights (pair)", description: "Stop, tail and indicator on each side. Choose submersible lamps for boat trailers.", required: true, href: "/led-trailer-tail-lights/?application=trailer" },
      { label: "Licence plate light", description: "Required on the rear number plate; some trailer lamp pairs include one.", required: true, href: "/led-licence-plate-lights/?application=trailer" },
      { label: "Trailer plug", description: "Match your tow vehicle's socket, such as 7-pin flat.", required: true, href: "/automotive/towing-gear/trailer-sockets-plugs/?connector=7-pin-flat" },
      { label: "Cable kit and connectors", description: "Plug-in cable kits and connectors for wiring lamps along the trailer.", required: false, href: "/trailer-accessories/?application=trailer" },
      { label: "Marker lights", description: "Side and end-outline markers for larger trailers and caravans.", required: false, href: "/automotive-led-marker-lights/?application=trailer" },
      { label: "Load resistors", description: "If your tow vehicle flashes fast or shows a bulb-failure warning with LED trailer lamps.", required: false, href: "/circuit-protection/?application=trailer" },
    ],
    featuredKitPath: "/kits/trailer-lighting/",
    relatedCategoryPaths: ["/led-trailer-tail-lights/", "/trailer-led-lights/", "/automotive-led-marker-lights/", "/trailer-accessories/", "/automotive/towing-gear/trailer-sockets-plugs/"],
    adrExplainerHtml: `${ADR_COMMON}
<p>ADR 13 applies to trailers as well as vehicles, and larger trailers need additional lamps such as side and end-outline marker lamps. Check the requirements for your trailer's size and class.</p>`,
    faqs: [
      { question: "What lights does a trailer need?", answer: "Generally stop, tail and indicator lamps on each side, rear reflectors and a licence plate light, with side and end-outline marker lamps on larger trailers. The exact requirements depend on the trailer's size and class, so check the ADRs and your state registration authority." },
      { question: "Which trailer plug do I need?", answer: "Match the plug to the socket on your tow vehicle. Light trailers and boat trailers commonly use 7-pin flat, while caravans and heavier trailers often use 7-pin round or 12-pin." },
      { question: "Can trailer lights go underwater?", answer: "Only if they're designed to. The LED Autolamps 207 Series is listed as fully submersible and IP67 rated, and the 210 Series as fully submersible and IP68 rated, which suits boat trailers that are backed into the water." },
      { question: "Do LED trailer lights need load resistors?", answer: "Some tow vehicles flash quickly or show a bulb-failure warning with LED trailer lamps. A load resistor wired between the lamp's input wires, not to the trailer chassis, adds the missing load. Mount it on metal, as it can reach 170°C." },
      { question: "Why do my sequential tail lights only partly light up on the caravan?", answer: "OzLED notes that when towing with a vehicle that has a body control module (BCM), such as the Ford Ranger, sequential tail lights fitted to a caravan may only partially illuminate. Contact the team if you're unsure." },
      { question: "Can I use 12V-only trailer lights behind a 24V truck?", answer: "No. Lamps listed as 12V only, such as the 207 and 210 Series, should only be used on a 12V system. Choose lamps listed as 12–24V multivolt for 24V vehicles." },
      { question: "How do I wire lights on a long boat trailer?", answer: "A plug-in cable kit makes it simpler. The LED Autolamps 8m Boat Trailer Cable Kit suits trailers up to 8m and includes lamp-to-gooseneck cables, a 1m cable with trailer plug and a cable connector, with waterproof plugs and no tools needed." },
    ],
    relatedPostPaths: ["/blog/our-blog/led-load-resistors/", "/blog/our-blog/before-you-buy-led-tail-lights/"],
    seo: {
      title: "Trailer & Boat Trailer Lights | OzLED",
      description: "What a trailer or boat trailer needs: LED tail lights, licence plate light, trailer plug, markers and cable kits, plus submersible lamps and ADR notes.",
    },
  },
];

export const KITS = [
  {
    path: "/kits/ute-tray-lighting/",
    name: "Build your tray lighting",
    application: "ute-tray",
    summary:
      "Build a complete ute tray lighting set in four steps: a pair of tail lights or a plug-and-play kit, a licence plate light, a trailer plug if you tow, and the brackets, patch leads or load resistors your lamps need. Out-of-stock items are shown with their status and never pre-selected.",
    hero: {
      url: "https://www.ozled.com.au/assets/alt_5/LEDMAXILAMPC3XRWB.jpg?20201204103507",
      file: "ute-tray-lighting.webp",
      alt: "Ute tray fitted with Maxilamp 3 Series LED tail lights",
      view: "installed",
    },
    steps: [
      {
        id: "tail-lights",
        title: "Pick your tail lights",
        description: "Choose a pair of combination tail lights or a plug-and-play kit. Every option here is sold as a pair or complete kit. Plug-and-play kits include vehicle-specific patch leads and licence plate lights.",
        candidateSkus: ["LEDMAXILAMPC3XRWB2P", "LED38541ARWM-2", "LED385ARWM-2", "LED355ARWM-2", "LEDSOMAXI2LR450-Master", "LED385-Master", "LED38541-Master", "LED355BCSB-Master"],
        required: true,
        defaultQty: 1,
        filterKeys: ["functions", "connector", "voltage", "mount", "ipRating"],
      },
      {
        id: "licence-plate",
        title: "Add a licence plate light",
        description: "Skip this if your plug-and-play kit already includes licence plate lights. Some lamps need two fitted (the 41 Series fitting instructions require two), so check the product page.",
        candidateSkus: ["LED41BLM", "LED35BLM", "LED60BLMB", "LED30CLM", "EL25B"],
        required: false,
        defaultQty: 1,
        filterKeys: ["voltage", "mount"],
      },
      {
        id: "plug-socket",
        title: "Plug and socket",
        description: "If you tow, add a plug that matches your trailer socket, or a flush Anderson socket for powering accessories.",
        candidateSkus: ["N82141BL", "LED5C41", "LLF7P5", "B6APFLSH", "B6APFLSH-CIG"],
        required: false,
        defaultQty: 1,
        filterKeys: ["connector"],
      },
      {
        id: "brackets-resistors",
        title: "Brackets, patch leads and load resistors",
        description: "Add right-angle brackets, a vehicle patch lead or adaptor for hard-wired lamps, and load resistors if your vehicle shows a light-failure warning or fast flash. Only items compatible with your chosen lamps are shown.",
        candidateSkus: ["LEDMFBKT", "LED80B3SKT", "LEDPATCH-HILUX", "LED2LR12450B", "LEDLR122", "LEDLR242"],
        required: false,
        defaultQty: 1,
        filterKeys: ["voltage", "connector"],
      },
    ],
    seo: {
      title: "Build Your Tray Lighting Kit | OzLED",
      description: "Build your ute tray lighting in four steps: LED tail lights or a plug-and-play kit, licence plate light, trailer plug, and brackets or load resistors.",
    },
  },
  {
    path: "/kits/trailer-lighting/",
    name: "Build your trailer lighting",
    application: "trailer",
    summary:
      "Light a box, boat or camper trailer in four steps: a pair of trailer tail lights, a licence plate light if your lamps don't include one, a plug to suit your tow vehicle with any cabling, and marker lights or load resistors where needed. Out-of-stock items are shown with their status and never pre-selected.",
    hero: {
      url: "https://www.ozled.com.au/assets/full/LED207BARLP2.jpg?20240827143042",
      file: "trailer-lighting.webp",
      alt: "Pair of LED Autolamps 207 Series submersible trailer lights",
      view: "main",
    },
    steps: [
      {
        id: "tail-lights",
        title: "Pick your trailer tail lights",
        description: "Choose a pair of trailer lamps. For boat trailers, pick lamps listed as submersible. Every option here is sold as a pair or pack of two.",
        candidateSkus: ["LED207BARLP2", "LED210BARLP2B", "LEDH155PR", "N93640BL2"],
        required: true,
        defaultQty: 1,
        filterKeys: ["functions", "voltage", "ipRating", "mount"],
      },
      {
        id: "licence-plate",
        title: "Add a licence plate light",
        description: "The 207 and 210 Series and the Narva pack already include a licence plate lamp. Otherwise add one here and check whether the lamp needs two fitted.",
        candidateSkus: ["LED41BLM", "LED60BLMB", "LED35BLM", "EL25B"],
        required: false,
        defaultQty: 1,
        filterKeys: ["voltage", "mount"],
      },
      {
        id: "plug-cable",
        title: "Plug and cabling",
        description: "Choose a plug that matches your tow vehicle's socket, plus a plug-in cable kit for longer trailers.",
        candidateSkus: ["N82141BL", "LED5C41", "LEDBTK8F", "LLF7P5"],
        required: true,
        defaultQty: 1,
        filterKeys: ["connector"],
      },
      {
        id: "markers-resistors",
        title: "Marker lights and load resistors",
        description: "Larger trailers need side and end-outline markers. Add load resistors if your tow vehicle flashes fast or shows a bulb-failure warning with LED lamps.",
        candidateSkus: ["LED69ARM", "LEDLR122", "LEDLR242"],
        required: false,
        defaultQty: 1,
        filterKeys: ["voltage", "functions"],
      },
    ],
    seo: {
      title: "Build Your Trailer Lighting Kit | OzLED",
      description: "Build trailer or boat trailer lighting in four steps: LED tail lights, licence plate light, trailer plug and cable kit, plus marker lights and load resistors.",
    },
  },
];

// Category tree for fixtures. Paths are copied exactly from the live main menu (20 Oct 2026).
// Top level = the storefront's "Shop by product" groups (SPEC §7.1), each mapped to the best
// existing live category URL so ranking URLs are kept. Live sub-categories nest beneath.
//
// Fields: [id, name, path, blurb, opts?]
//   blurb  = one factual sentence used as the answer-first intro (and in the meta description)
//   opts   = { navLabel, intro, seoTitle, seoDescription, bodyHtml, faqs, children }

const FAQ = {
  tailLights: [
    {
      question: "Are LED tail lights ADR approved?",
      answer:
        "Many are, but not all. Each product page lists the approval the manufacturer states, such as ADR approved with a CRN number or ECE approved. Check the specs of the exact lamp, and mount it as the manufacturer describes with reference to ADR 13/00.",
    },
    {
      question: "Do LED tail lights need load resistors?",
      answer:
        "Some vehicles show a light-failure warning or fast indicator flash because LED lamps draw much less current than globes. A load resistor fitted between the lamp's input wires adds that load back. LED Autolamps resistors must be mounted on metal, as they can reach about 170°C.",
    },
    {
      question: "What is the difference between plug-and-play and hard-wired tail lights?",
      answer:
        "Plug-and-play kits use a vehicle-specific patch lead that plugs into the existing tail light loom, with a DT04-6P connector on the lamp side, so no cutting or splicing is needed. Hard-wired lamps have bare wires that are joined to the vehicle or trailer wiring.",
    },
    {
      question: "Are plug-and-play tail light kits ADR compliant?",
      answer:
        "The lamps themselves can be ADR approved, but OzLED notes that plug-and-play patch lead systems fall outside the ADR because of the load resistors built into the harness. Contact the team if you need advice for your vehicle.",
    },
  ],
  combination: [
    {
      question: "What is a combination tail light?",
      answer:
        "A combination tail light houses several functions in one lamp, typically stop, tail and indicator, and often reverse and a reflector. They are common on ute trays, trucks, trailers and caravans.",
    },
    {
      question: "Do combination tail lights come in pairs?",
      answer:
        "It depends on the listing. Some lamps are sold individually and others as a twin pack or kit. The product name states 'Single', 'Pair' or 'Twin Pack', so check it before ordering two.",
    },
    {
      question: "Will 12–24V tail lights work on a 12V ute?",
      answer:
        "Yes. Lamps listed as multivolt 12–24V work on both 12V and 24V systems. Lamps listed as 12V only should not be used on a 24V truck.",
    },
  ],
  trailer: [
    {
      question: "What lights does a trailer need?",
      answer:
        "A trailer generally needs stop, tail and indicator lamps on each side, rear reflectors and a licence plate light, with side and end-outline markers on larger trailers. The exact requirements depend on the trailer's size and class, so check the ADRs and your state registration authority.",
    },
    {
      question: "Are submersible trailer lights suitable for boat trailers?",
      answer:
        "Lamps described as fully submersible, such as the LED Autolamps 207 and 210 series, are designed for boat trailers that are backed into water. Check the IP rating on the product page; IP67 and IP68 lamps are sealed against water.",
    },
    {
      question: "Which trailer plug do I need?",
      answer:
        "Match the plug to the socket on your tow vehicle. Light trailers commonly use a 7-pin flat plug, while caravans and heavier trailers often use 7-pin round or 12-pin connectors.",
    },
  ],
  lightBars: [
    {
      question: "Are LED light bars road legal?",
      answer:
        "Rules vary from state to state, so check your state's requirements before fitting and using one. As a general rule, auxiliary driving lamps may only operate with your high beam, and light bars are often for off-road use only.",
    },
    {
      question: "What is the difference between spot, flood and combo beams?",
      answer:
        "A spot beam is narrow and reaches further down the road, a flood beam spreads light wide and close, and a combo bar mixes spot optics in the centre with flood optics at the ends.",
    },
    {
      question: "What does an IP68 or IP69K rating mean on a light bar?",
      answer:
        "IP68 means the light is dust tight and protected against continuous submersion. IP69K adds protection against high-pressure, high-temperature water jets, such as wash-down.",
    },
  ],
  workLights: [
    {
      question: "Should I choose a spot or flood work light?",
      answer:
        "Flood beams light a wide area close to the vehicle, such as a tray, campsite or work area. Spot beams throw a narrower beam further away.",
    },
    {
      question: "Can work lights be used while driving?",
      answer:
        "Work lights are designed for lighting a work area while stationary or at low speed, not as road driving lights. Check your state's rules for auxiliary lamps.",
    },
    {
      question: "Are BASE6 work lights waterproof?",
      answer:
        "The BASE6 Cube series is rated IP68 and IP69K and the HD series is rated IP68, according to their product listings. Check each product's specs for its rating.",
    },
  ],
  plugs: [
    {
      question: "What is the difference between a 7-pin flat and 7-pin round plug?",
      answer:
        "Both carry seven circuits for trailer lighting. 7-pin flat is common on light trailers and boat trailers, while 7-pin round is common on caravans and heavier trailers. They are not interchangeable without an adaptor.",
    },
    {
      question: "What is an Anderson plug used for?",
      answer:
        "Anderson-style plugs carry high current, for example to charge a camper battery or power accessories in a canopy or caravan. The BASE6 flush-mount sockets are rated at 50A.",
    },
    {
      question: "Do I need a 12-pin plug?",
      answer:
        "12-pin plugs are mainly used on caravans that need extra circuits, such as a battery charge line or electric brakes. Match the plug to the socket on your tow vehicle.",
    },
  ],
};

const SITE = "Order online for delivery Australia-wide or pick up from our Brendale, QLD showroom.";

/** Category definitions. Order within each array = sortOrder. */
export const TREE = [
  ["tail-lights", "LED Tail Lights", "/led-tail-lights/", "LED tail lights for utes, trays, trucks, trailers and caravans, including combination, single-function, plug-and-play and trailer lamps.", {
    navLabel: "Tail Lights",
    seoTitle: "LED Tail Lights | OzLED",
    seoDescription: "LED tail lights for utes, trays, trucks, trailers and caravans: combination, plug-and-play and trailer lamps from LED Autolamps, Narva and more at OzLED.",
    faqs: FAQ.tailLights,
    children: [
      ["plug-and-play-tail-lights", "Plug and Play LED Tail Lights", "/plug-and-play-led-tail-lights/", "Plug-and-play tail light kits connect to your ute's existing loom with vehicle-specific patch leads, so there is no cutting or splicing.", {
        seoTitle: "Plug and Play LED Tail Lights | OzLED",
        faqs: [FAQ.tailLights[2], FAQ.tailLights[3]],
      }],
      ["combination-tail-lights", "Combination Tail Lights", "/led-combination-tail-lights/", "Combination LED tail lights combine stop, tail and indicator, often with reverse and a reflector, in one lamp for trays, trucks, trailers and caravans.", {
        navLabel: "Combination Tail Lights",
        seoTitle: "Combination LED Tail Lights | OzLED",
        seoDescription: "Combination LED tail lights with stop, tail, indicator and reverse for ute trays, trucks, trailers and caravans, including Maxilamp and 385 series.",
        faqs: FAQ.combination,
      }],
      ["single-function-tail-lights", "Single Function Tail Lights", "/single-function-led-tail-lights/", "Single-function LED lamps provide one job each, such as stop/tail, indicator or reverse, so you can build a custom rear light set-up."],
      ["trailer-tail-lights", "LED Trailer Tail Lights", "/led-trailer-tail-lights/", "LED trailer tail lights for box, boat and camper trailers, including submersible lamps and kits with licence plate lights.", {
        seoTitle: "LED Trailer Tail Lights | OzLED",
        faqs: FAQ.trailer,
      }],
      ["tail-light-accessories", "Tail Light Accessories", "/led-tail-light-accessories-brackets/", "Brackets, vehicle patch leads, adaptor leads and reflectors for fitting LED tail lights.", { navLabel: "Tail Light Accessories" }],
      ["licence-plate-lights", "LED Licence Plate Lights", "/led-licence-plate-lights/", "LED licence plate lights to light your rear number plate on utes, trays, trucks and trailers.", {
        seoTitle: "LED Licence Plate Lights | OzLED",
        children: [
          ["licence-plate-accessories", "Licence Plate Lights, Brackets and Accessories", "/Licence-Plate-Accessories", "Licence plate lights, mounting brackets and related accessories.", { navLabel: "Licence Plate Brackets" }],
        ],
      }],
    ],
  }],
  ["bulbs-headlights", "LED Bulbs & Conversions", "/led-headlights", "LED replacement bulbs and headlight conversion kits for cars, 4WDs and trucks.", {
    navLabel: "Bulbs & Headlights",
    seoTitle: "LED Headlights & Bulbs | OzLED",
    children: [
      ["headlight-conversions", "LED Headlight Conversions", "/LED-Headlight-Conversions", "LED headlight conversion bulbs that replace halogen headlight globes."],
      ["drl-fog-bulbs", "DRL & Fog Light Bulbs", "/drl-fog-light-bulbs/", "LED bulbs for daytime running lights and fog lights."],
      ["vehicle-specific-bulb-kits", "Vehicle Specific LED Bulb Kits", "/Vehicle-Specific-LED-Bulb-Kits", "LED bulb kits matched to specific vehicle models."],
      ["wedge-bulbs", "Wedge Bulbs", "/LED-Wedge-Bulbs", "LED wedge-base bulbs for parkers, interior, dash and marker lamps."],
      ["bayonet-bulbs", "Bayonet Bulbs", "/LED-Bayonet-Bulbs", "LED bayonet-base bulbs to replace stop, tail, indicator and interior globes."],
      ["festoon-bulbs", "Festoon Bulbs", "/LED-Festoon-Bulbs", "LED festoon bulbs for interior, map and licence plate lamps."],
    ],
  }],
  ["driving-light-bars", "Off-Road LED Lighting", "/off-road-led-lights/", "Off-road LED driving lights, light bars and mounting hardware for 4WDs, utes and work vehicles.", {
    navLabel: "Driving & Light Bars",
    seoTitle: "LED Driving Lights & Light Bars | OzLED",
    children: [
      ["driving-lights", "LED Driving Lights", "/offroad-4wd-led-driving-lights/", "Round and hex LED driving lights for 4WDs and touring vehicles, from 7-inch to 9-inch.", { seoTitle: "LED Driving Lights | OzLED" }],
      ["light-bars", "LED Light Bars", "/led-light-bars-for-work-and-4x4-vehicles/", "LED light bars in spot, flood and combo beams for 4WDs, utes and work vehicles.", {
        seoTitle: "LED Light Bars | OzLED",
        faqs: FAQ.lightBars,
      }],
      ["off-road-mounting", "Mounting Hardware & Accessories", "/off-road-bullbar-mounting-brackets-accessories/", "Brackets and mounting hardware for fitting driving lights and light bars to bullbars and roof racks."],
    ],
  }],
  ["work-lights", "LED Work Lights", "/led-work-lights/", "LED work lights in flood and spot beams for trays, canopies, machinery and campsites.", {
    navLabel: "Work Lights",
    seoTitle: "LED Work Lights | OzLED",
    faqs: FAQ.workLights,
  }],
  ["indicators-markers", "LED Indicator & Bullbar Lamps", "/led-indicator-lights-and-bullbar-lamps/", "LED indicators, daytime running lights, bullbar lamps and marker lights for cars, 4WDs, trucks and trailers.", {
    navLabel: "Indicators & Markers",
    seoTitle: "LED Indicators & Marker Lights | OzLED",
    children: [
      ["daytime-running-lights", "Daytime Running Lights", "/led-daytime-running-lights/", "LED daytime running lights and DRL modules to make your vehicle easier to see by day."],
      ["side-indicators", "Side Indicators", "/side-indicators/", "LED side indicator lamps for cars, 4WDs and trucks."],
      ["bullbar-lighting", "Bullbar Lighting", "/automotive/led-indicator-lights-bullbar-lamps/bullbar-lighting/", "LED front indicator and park lamps that fit common bullbar cut-outs."],
      ["truck-trailer-lights", "Truck & Trailer LED Lights", "/trailer-led-lights/", "LED lights for trucks and trailers, including marker lights, licence plate lights and trailer accessories.", {
        seoTitle: "Truck & Trailer LED Lights | OzLED",
        children: [
          ["marker-lights", "LED Marker Lights", "/automotive-led-marker-lights/", "LED clearance, side and end-outline marker lights for trucks, trailers and caravans."],
          ["trailer-accessories", "Trailer Accessories", "/trailer-accessories/", "Trailer cables, plug-in cable kits, connectors and reflectors."],
        ],
      }],
    ],
  }],
  ["warning-emergency", "Warning & Emergency", "/emergency-led-warning-lights-vehicle-sirens/", "LED warning light bars, beacons, perimeter lights, sirens and control systems for work, tow, mining and emergency vehicles.", {
    navLabel: "Warning & Emergency",
    seoTitle: "LED Warning & Emergency Lights | OzLED",
    children: [
      ["light-kits-packages", "LED Light Kits & Vehicle Packages", "/led-light-kits-and-vehicle-packages/", "Warning light kits and vehicle packages for trade, tow and fleet vehicles.", {
        children: [
          ["red-blue-restricted-kits", "Red & Blue Restricted Kits", "/warning-emergency/vehicle-packages/police-vehicle-kits/", "Red and blue warning light kits for authorised emergency vehicles. These are restricted items under OzLED's Restricted Item Policy."],
        ],
      }],
      ["warning-light-bars", "LED Warning Light Bars", "/led-warning-light-bars/", "Amber and multi-colour LED warning light bars, from micro bars to full-size roof bars.", {
        seoTitle: "LED Warning Light Bars | OzLED",
        children: [
          ["guardian-light-bars", "BASE6 Guardian LED Light Bars", "/base6-guardian-light-bars", "BASE6 Guardian warning light bars combining warning and white scene lighting."],
          ["micro-light-bars", "Micro / Small LED Light Bars", "/warning-emergency/led-warning-light-bars/micro-small-led-light-bars/", "Compact micro and mini warning light bars for vehicles with limited roof space."],
          ["full-size-light-bars", "Full Size LED Light Bars", "/warning-emergency/led-warning-light-bars/full-size-led-light-bars/", "Full-size LED warning light bars for maximum roof-top coverage."],
        ],
      }],
      ["perimeter-lights", "LED Perimeter Lights", "/perimeter-lights/", "Compact LED warning lights mounted around a vehicle's body, grille and bumpers.", {
        children: [
          ["hideaway-lights", "Hideaway LED Lights", "/warning-emergency/perimeter-led-lights/hideaway-led-lights/", "Hideaway LED warning lights that mount inside existing vehicle light housings."],
          ["surface-mount-perimeter-lights", "Surface Mount Perimeter Lights", "/warning-emergency/perimeter-led-lights/surface-mount-perimeter-lights/", "Surface-mount LED perimeter warning lights and strobe modules."],
          ["off-road-dust-lights", "Off-Road Dust Lights", "/warning-emergency/perimeter-led-lights/off-road-dust-lights/", "Dust lights that help other drivers see vehicles in dusty conditions, such as mine sites."],
          ["bonnet-warning-lights", "Bonnet Mount Warning Lights", "/warning-emergency/perimeter-led-lights/led-bonnet-lights/", "LED warning lights designed to mount on a vehicle's bonnet."],
          ["perimeter-light-accessories", "Perimeter Light Accessories", "/perimeter-light-accessories/", "Brackets, bezels and accessories for perimeter warning lights."],
        ],
      }],
      ["dash-deck-lighting", "Dash & Deck Lighting", "/led-dash-deck-lighting/", "Interior windscreen, dash and rear deck LED warning lights.", {
        children: [
          ["dash-lights", "Windscreen Mount & Dash LED Lights", "/warning-emergency/covert-lighting/dash-led-lights/", "LED warning lights that mount inside the windscreen or on the dash."],
          ["deck-lights", "Rear Window & Deck LED Lights", "/warning-emergency/covert-lighting/deck-led-lights/", "LED warning lights for rear windows and rear parcel decks."],
        ],
      }],
      ["beacons", "LED Beacon Lights", "/warning-emergency/led-beacon-lights/", "LED warning beacons in magnetic, surface-mount and micro light bar styles for work and mining vehicles.", {
        seoTitle: "LED Beacon Lights | OzLED",
        children: [
          ["magnetic-beacons", "Magnetic Beacons", "/Magnetic-Beacons", "Magnetic-mount LED beacons that can be fitted and removed without tools."],
          ["surface-mounted-beacons", "Surface Mounted Beacons", "/warning-emergency/led-beacon-lights/surface-mounted-beacons/", "Surface-mount LED beacons for permanent installation."],
          ["micro-lightbar-beacons", "Micro Lightbar Beacons", "/warning-emergency/led-beacon-lights/micro-lightbar-beacons/", "Low-profile micro light bars used in place of a single beacon."],
        ],
      }],
      ["sirens-control", "Sirens & Control Systems", "/emergency-sirens-and-control-panel-systems/", "Sirens, speakers, control panels and control systems for warning and emergency vehicles.", {
        children: [
          ["siren-speakers", "Siren Speakers", "/warning-emergency/sirens-control-systems/siren-speakers/", "Siren speakers for use with emergency siren amplifiers."],
          ["siren-units", "Emergency Siren Units", "/emergency-siren-units/", "Emergency siren amplifier units. Sirens capable of emergency vehicle outputs are restricted items."],
          ["blueprint-control", "BluePrint Control System", "/warning-emergency/sirens-control-systems/blueprint-control-system/", "The SoundOff Signal BluePrint system for controlling vehicle warning lights and sirens."],
          ["warning-control-panels", "Warning Control Panels", "/warning-control-panels/", "Switch and control panels for operating warning lights."],
          ["siren-bundles", "Siren Bundles", "/siren-bundles/", "Siren and speaker bundles."],
        ],
      }],
      ["personal-safety", "Personal Safety Lighting", "/personal-safety-led-lights/", "Personal safety lights, scene lights and LED road flares for roadside and emergency work.", {
        children: [
          ["safety-scene-lights", "Safety Scene Lights", "/safety-scene-led-lights/", "Portable LED scene lights for lighting a work or incident area."],
          ["guardian-angel", "Guardian Angel", "/guardian-angel", "Guardian Angel wearable personal safety lights."],
          ["led-road-flares", "LED Road Flares", "/led-road-flares/", "Reusable LED road flares for marking hazards and traffic control."],
        ],
      }],
      ["arrow-traffic", "Arrow & Traffic Control Lighting", "/led-traffic-arrow-control-lighting/", "Directional LED lighting and traffic arrow boards for road work vehicles.", {
        children: [
          ["directional-lighting", "Directional LED Lighting", "/directional-led-lighting/", "Directional LED light sticks for guiding traffic around a vehicle."],
          ["arrow-boards", "Traffic Arrow Boards", "/led-traffic-arrow-boards/", "Vehicle-mounted LED traffic arrow boards."],
        ],
      }],
      ["mpower", "mPower® Lighting by SoundOff Signal", "/warning-emergency/mpower-lighting-by-soundoff-signal/", "SoundOff Signal mPower® LED lights for warning, scene and utility use.", { navLabel: "mPower® by SoundOff Signal" }],
    ],
  }],
  ["camping-interior", "Camping & Outdoors", "/leisure-led-lights/", "LED lighting for camping, caravans, RVs and boats, including amber lights, strip lights and interior lights.", {
    navLabel: "Camping & Interior",
    seoTitle: "Camping, Caravan & Marine LED Lights | OzLED",
    children: [
      ["caravan-rv", "Caravan & RV Lighting", "/caravan-campervan-rv-led-lights/", "Interior and exterior LED lighting for caravans, campervans and RVs.", {
        children: [
          ["caravan-interior", "Interior LED Lighting", "/caravan-rv-lighting/interior-led-lighting/", "LED interior lights for caravans and RVs."],
          ["caravan-exterior", "External Caravan Lighting", "/external-caravan-led-lighting/", "LED awning, annex and exterior lights for caravans."],
        ],
      }],
      ["boating-marine", "Boating & Marine", "/boating-and-marine-led-lighting/", "Marine-grade LED work, flood, strip, navigation and interior lighting for boats.", {
        children: [
          ["marine-work-lights", "Marine Grade Work Lights", "/marine-grade-work-lights/", "Marine-grade LED work lights for boats and coastal use."],
          ["marine-strip-lighting", "Marine Strip Lighting", "/Marine-Strip-Lighting", "Sealed LED strip lights for marine use."],
          ["navigation-lights", "Navigational Marine LED Lighting", "/navigational-marine-led-lighting/", "LED navigation lights for boats."],
          ["marine-flood-lights", "Marine Grade Flood Lights", "/marine-grade-led-flood-lights/", "Marine-grade LED flood lights for decks and boat ramps."],
          ["marine-interior", "Marine Interior LED's", "/boating-marine/marine-interior-lighting/", "LED interior lights for boat cabins.", { navLabel: "Marine Interior LEDs" }],
        ],
      }],
      ["camping-lights", "LED Camping Lights", "/led-camping-lights/", "LED camping lights, lanterns, torches, rigid strip lights and general-purpose 12V lighting.", {
        seoTitle: "LED Camping Lights | OzLED",
        children: [
          ["torches-headlamps", "Torches & Headlamps", "/led-flashlights-torches-and-headlamps/", "LED torches, flashlights and headlamps."],
          ["general-lighting", "General Lighting", "/marine-camping-rv-led-lighting/general-lighting/", "General-purpose 12V LED lights for camps, caravans and boats."],
          ["rigid-strip-lights", "Rigid LED Strip Lights", "/rigid-led-strip-lighting/", "Rigid aluminium LED strip lights and accessories."],
        ],
      }],
      ["amber-lights", "Amber LED Outdoor and Camping Lights", "/AmberLEDLights", "Amber LED lights for camping, which attract fewer insects than white light.", { navLabel: "Amber Camping Lights", seoTitle: "Amber LED Camping Lights | OzLED" }],
      ["flexible-led-strips", "Flexible LED Strips and Accessories", "/camping-outdoors/flexible-led-strips-and-accessories/", "Flexible 12V LED strip lighting, controllers and power supplies.", { navLabel: "Flexible LED Strips" }],
    ],
  }],
  ["wiring-plugs-switches", "Automotive Accessories", "/automotive-accessories/", "Switches, connectors, plugs and sockets, wiring harnesses, circuit protection and towing gear for vehicle lighting.", {
    navLabel: "Wiring, Plugs & Switches",
    seoTitle: "Wiring, Plugs & Switches | OzLED",
    seoDescription: "Switches, connectors, Anderson plugs, trailer plugs and sockets, wiring harnesses, load resistors and towing gear for 12V and 24V vehicle lighting.",
    children: [
      ["switches-connectors", "Switches, Connectors & Panels", "/switch-panels-and-connectors/", "Switches, switch panels and electrical connectors for vehicle lighting."],
      ["plugs-sockets", "Plugs & Sockets", "/led-lighting-plugs-and-sockets/", "Anderson plugs, 12V sockets, trailer plugs and DC connectors.", {
        seoTitle: "Automotive Plugs & Sockets | OzLED",
        faqs: FAQ.plugs,
      }],
      ["driving-light-harnesses", "LED Driving Light Harnesses", "/led-driving-light-harnesses/", "Wiring harnesses for connecting driving lights and light bars."],
      ["circuit-protection", "Circuit Protection", "/circuit-protection/", "Load resistors and circuit protection for LED vehicle lighting, used to stop light-failure warnings and fast indicator flashing."],
      ["installation-tools", "Installation Tools", "/automotive/automotive-accessories/installation-tools/", "Tools for installing automotive lighting and wiring."],
      ["towing-gear", "Towing Gear", "/towing-kits-and-gear/", "Towing accessories including trailer sockets and plugs.", {
        children: [
          ["trailer-sockets-plugs", "Trailer Sockets & Plugs", "/automotive/towing-gear/trailer-sockets-plugs/", "Trailer plugs, sockets and adaptors for connecting trailer lights to the tow vehicle.", {
            seoTitle: "Trailer Plugs & Sockets | OzLED",
            faqs: FAQ.plugs,
          }],
        ],
      }],
    ],
  }],
  ["reverse-cameras", "Car Reverse Cameras & Alarms", "/car-reverse-cameras/", "Reverse cameras, rear-view monitors, reverse alarms and parking systems for cars, utes and trucks.", {
    navLabel: "Reverse Cameras",
    seoTitle: "Car Reverse Cameras | OzLED",
    children: [
      ["reverse-monitors", "Reverse Monitors", "/automotive/visual-audio-safety/reverse-monitors/", "Rear-view monitors for use with reversing cameras."],
      ["reverse-alarms", "Reverse Alarms", "/automotive/visual-audio-safety/reverse-alarms/", "Reverse alarms that warn people behind a reversing vehicle."],
      ["parking-systems", "Parking Systems", "/parking-systems/~-364", "Parking sensor systems."],
    ],
  }],
  ["base6", "BASE6", "/base6/", "BASE6 is OzLED's own brand of LED lighting, launched in 2013, covering work lights, driving lights, light bars, warning lights and camping lights.", {
    navLabel: "BASE6",
    seoTitle: "BASE6 LED Lighting | OzLED",
    seoDescription: "BASE6 is OzLED's own LED lighting brand, launched in 2013: work lights, driving lights, light bars, warning lights and camping lights. Shop online at OzLED.",
    children: [
      ["base6-warning", "Warning & Emergency Lights", "/base6/Warning-emergency-Lights", "BASE6 warning light bars, beacons, perimeter lights and arrow boards.", {
        children: [
          ["base6-guardian-series", "Guardian All in One Light Bars", "/Guardian-Series", "BASE6 Guardian all-in-one warning and scene light bars."],
          ["base6-surface-mount-warning", "Surface Mount Perimeter Warning Lights", "/base6/Warning-emergency-Lights/Surface-Mount-Perimeter-Warning-Lights", "BASE6 surface-mount perimeter warning lights."],
          ["base6-beacons", "Beacons", "/base6/Warning-emergency-Lights/Beacons", "BASE6 LED beacons, including the MINELUX range.", { navLabel: "BASE6 Beacons" }],
          ["base6-emergency-light-bars", "Emergency Light Bars", "/base6/Warning-emergency-Lights/EmergencyLightBars", "BASE6 emergency and warning light bars."],
          ["base6-arrow-board-siren", "Arrow Board, Siren, etc", "/base6/Warning-emergency-Lights/Arrow-Board-Siren", "BASE6 arrow boards, sirens and related warning products."],
        ],
      }],
      ["base6-work-lights", "Work Lights", "/base6/work-Lights", "BASE6 LED work lights, including the Cube, HD, Sniper and Stealth series.", {
        navLabel: "BASE6 Work Lights",
        children: [
          ["base6-stealth-series", "Stealth Series Work Light", "/base6/work-Lights/Stealth_Series", "BASE6 Stealth series LED work lights."],
          ["base6-micro-m2", "BASE6 2\" Micro M2 Series", "/base6/work-Lights/MicroM2", "BASE6 2-inch Micro M2 series work lights."],
          ["base6-hd-series", "HD Series Work Lights", "/base6/work-Lights/HD_Series", "BASE6 Heavy Duty (HD) series LED work lights designed for mining applications."],
          ["base6-cube-series", "Marine Grade Cube Series Work Lights", "/base6/work-Lights/cube_Series", "BASE6 3-inch Cube series work lights, including marine-grade white housings."],
          ["base6-sniper-series", "Sniper Series Work Lights", "/base6/work-Lights/Sniper_Series", "BASE6 Sniper series LED work lights."],
          ["base6-additional-work-lights", "Additional Models", "/base6/work-Lights/Additional_Models", "Other BASE6 work light models."],
        ],
      }],
      ["base6-driving-lights", "Driving Lights", "/base6/Driving-Lights", "BASE6 LED driving lights, including the HEX, Quad, LUX and SB9 Pro series.", {
        navLabel: "BASE6 Driving Lights",
        children: [
          ["base6-7in-driving", "7\" Diameter Driving Light", "/base6/driving-lights/B6DL7C-Series", "BASE6 7-inch round LED driving lights."],
          ["base6-sb9-pro", "SB9 Pro Driving Lights", "/base6/driving-lights/SB9Pro", "BASE6 SB9 Pro LED driving lights."],
          ["base6-quad7", "BASE6 Quad Series 7\"", "/base6/driving-lights/Quad7", "BASE6 Quad series 7-inch driving lights."],
          ["base6-hex", "HEX", "/base6/driving-lights/Hex", "BASE6 HEX series 9-inch driving lights with amber and white position lights.", { navLabel: "HEX Driving Lights" }],
          ["base6-lux-driving", "LUX Series 8.5\" Driving Lights", "/base6/driving-lights/LUX-Series", "BASE6 LUX series 8.5-inch driving lights."],
        ],
      }],
      ["base6-light-bars", "Light Bars", "/base6/Light-Bars", "BASE6 LED light bars, including the Stealth, DR, LUX curved, Aggressor and Combat series.", { navLabel: "BASE6 Light Bars", seoTitle: "BASE6 LED Light Bars | OzLED" }],
      ["base6-camping-outdoor", "Camping and Outdoor", "/base6/Camping-Outdoor", "BASE6 camping and outdoor lighting, including amber lights, strip lights and rock lights.", {
        navLabel: "BASE6 Camping & Outdoor",
        children: [
          ["base6-amber-lights", "Amber Outdoor and Camping Lights", "/base6/Camping-Outdoor/Amber-Lights", "BASE6 amber LED lights for camping."],
          ["base6-flexible-strips", "Flexible LED Strips", "/base6/Camping-Outdoor/Flexible-LED-Strips", "BASE6 flexible LED strip lights."],
          ["base6-interior-light", "Surface Mount LED Interior Light", "/BASE6/Camping-Outdoor/Interior-Light", "BASE6 surface-mount LED interior lights."],
          ["base6-flush-bolt", "Flush Mount LED Bolt", "/base6/Camping-Outdoor/Flush-Mount-LED-Bolt", "BASE6 flush-mount LED bolt lights."],
          ["base6-rigid-bars", "BASE6 Rigid Bars and Accessories", "/base6/Camping-Outdoor/Rigid-Bars", "BASE6 rigid LED strip bars, splitters and mounting clips."],
          ["base6-scene-light", "Scene Light", "/Scene-Light", "BASE6 LED scene lights."],
          ["base6-lux-panels", "BASE6 Lux Panels", "/Lux-Panels", "BASE6 LUX LED light panels."],
        ],
      }],
      ["base6-mounting", "Mounting Hardware and Accessories", "/base6/mounting-hardware-accessories", "BASE6 brackets, mounts and accessories.", { navLabel: "BASE6 Mounting Hardware" }],
      ["base6-rock-lights", "Rock Lights", "/base6/rock-lights", "BASE6 ROX series LED rock lights for underbody, engine bay and camp lighting.", { navLabel: "BASE6 Rock Lights" }],
    ],
  }],
];

export { SITE };

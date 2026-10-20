// Hand-cleaned descriptionHtml for pages whose live markup is too messy to clean by rule
// (layout tables, nested lists, run-on paragraphs). Text is the live copy, restructured;
// spec bullets and download links have moved to structured fields.

const PNP_NOTE =
  "<p>The lights themselves are ADR approved. However, plug-and-play patch lead systems don't fall within the ADR because of the load resistors built into the harness. Load resistors stop the vehicle flashing the indicators quickly when it detects a drop in resistance (as with a blown bulb). If you have any questions about this, reach out to the team.</p>";

const LOAD_RESISTOR = `<p>LED Autolamps load resistors are designed for late-model vehicles that display a light-failure warning. Each resistor draws the same current as a 21 watt globe.</p>
<h3>How to install LED Autolamps load resistors</h3>
<ul>
<li>Mount on a metal surface: the resistor can reach temperatures of up to 170°C.</li>
<li>You may require up to 1 resistor per function on each side.</li>
<li>Always wire the resistor between the input wires of the lamp, not to the chassis of the vehicle or trailer. If fitted to the chassis, a bad earth connection is possible and can cause problems with the vehicle's lighting system.</li>
</ul>
<p>Available as LR12/2 (twin blister, 50 watt, 6Ω) for 12V vehicles and LR24/2 (twin blister, 50 watt, 24Ω) for 24V vehicles.</p>`;

export const DESCRIPTIONS = {
  "/maxilamp-c3-led-tail-light-plug-play-kit-Pair": `<p>Our entire Maxilamp range is sourced directly from LED Autolamps, the original manufacturer of the Maxilamp range.</p>
<h3>Fitting instructions</h3>
<ol>
<li>Connect the vehicle-specific patch leads to the existing loom on the vehicle.</li>
<li>Connect the Maxilamps to the patch leads.</li>
<li>Mount the Maxilamp tail lights and pre-wired resistors and secure the wiring to suit.</li>
</ol>
<p>Horizontally surface mount using the bolts in the back of the lamp, and run the wire and plug through a 10mm hole in the fixing surface. Please refer to ADR 13/00 for mounting instructions.</p>
<h3>Vehicle kits</h3>
<table>
<thead><tr><th>SKU</th><th>Kit</th></tr></thead>
<tbody>
<tr><td>LEDSOMAXI2LR450BDMAX</td><td>Isuzu D-Max 2012–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BHILUX</td><td>Toyota Hilux 2015–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BNP300S</td><td>Nissan Navara NP300 2013–2020 (8 pin)</td></tr>
<tr><td>LEDSOMAXI2LR450BRANBT50</td><td>Ford Ranger / Mazda BT50 2011–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BCOL</td><td>Holden Colorado RG 2017–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BCRUISER</td><td>Toyota Landcruiser 79 Series 2007+</td></tr>
<tr><td>LEDSOMAXI2LR450BNP300T</td><td>Nissan Navara NP300 (Thai) 2015–present</td></tr>
<tr><td>LEDSOMAXI2LR450BTRITMN</td><td>Mitsubishi Triton MN 2009–2014</td></tr>
<tr><td>LEDSOMAXI2LR450BTRITMQ</td><td>Mitsubishi Triton MQ &amp; MR 2015–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BAMAROK</td><td>Volkswagen Amarok 2016–2020</td></tr>
<tr><td>LEDSOMAXI2LR450BXC</td><td>Mercedes-Benz X-Class</td></tr>
<tr><td>LEDSOMAXI2LR450BSTEED</td><td>Great Wall Steed</td></tr>
<tr><td>LEDSOMAXI2LR450BRAM</td><td>Dodge Ram 1500</td></tr>
<tr><td>LEDSOMAXI2LR450BMUSSO</td><td>SsangYong Musso 2002–present</td></tr>
</tbody>
</table>
${PNP_NOTE}`,

  "/maxilamp-c3-series-plug-play-led-tail-lamp-with-pl": `<p>Our entire Maxilamp range is sourced directly from LED Autolamps, the original manufacturer of the Maxilamp range.</p>
<p>The LED tail light in this listing is designed to be used with vehicle-specific patch leads. It is adapted to fit most popular brands of vehicle trays.</p>
<h3>How to install</h3>
<p>Horizontally surface mount using the bolts in the back of the lamp, and run the wire and plug through a 10mm hole in the fixing surface. Please refer to ADR 13/00 for mounting instructions.</p>
<p>Patch leads are also available to suit the Ford Ranger, Mazda BT50, Isuzu D-Max, Toyota Landcruiser, Toyota Hilux and Mitsubishi Triton MN/MQ.</p>
${PNP_NOTE}`,

  "/235-series-stop-tail-indicator-led-twin-pack-12v-l": `<h3>Fitting instructions</h3>
<p>Surface mount the bracket onto a flat surface horizontally, run the wires through the back and fix with the screws supplied at both ends. Please refer to ADR 13/00.</p>`,

  "/trailer-lights-led-autolamps-155-series-pair": `<p>The 155 Series LED trailer lights are a budget LED trailer lamp with a low-profile circle lens pattern. A 6m lamp and cable kit is available for trailers up to 6 metres, along with a plug-in licence plate lamp.</p>
<h3>Fitting instructions</h3>
<p>Surface mount onto a flat surface vertically with the indicator at the top, using the bolts in the back of the lamp, and run the wire through a 10mm hole in the fixing surface. Please refer to ADR 13/00 for mounting instructions.</p>`,

  "/~28410": `<p>A retro-fit right-angle bracket to suit popular ute and tray vehicles, for small vehicle tray and truck rear combination lamps. Made from 304 painted steel.</p>
<h3>Suits</h3>
<ul>
<li>80 Series rear combination lamps</li>
<li>275 Series rear combination lamps</li>
<li>280 Series rear combination lamps</li>
<li>282 Series rear combination lamps</li>
<li>283 Series rear combination lamps</li>
<li>284 Series rear combination lamps</li>
</ul>
<p><strong>Does not fit Maxilamp C3 Series tail lights.</strong></p>`,

  "/led-12-24v-stop-tail-indicators-80bstim": `<p>A fully waterproof 12–24 volt LED stop/tail and indicator lamp unit with an impact-resistant acrylic lens, sealed electronics and a black bracket. ADR approved.</p>`,

  "/load-resistors-pair-12-volt-50w": LOAD_RESISTOR,
  "/load-resistors-pair-24-volt-50w": LOAD_RESISTOR,

  "/right-angle-tail-light-bracket-for-tray-80b3skt": `<p><strong>Please note this item is discontinued and has been replaced by the <a href="/~28410">Multi Fit Bracket</a>.</strong></p>
<p>A 90 degree black metal mounting bracket for LED Autolamps 80 series triple lights, made from black painted heavy gauge steel. Bulk packed. Manufacturer part number 80B3SKT.</p>`,

  "/base6-stealth-series-led-light-bar-with-front-posi": `<p>The BASE6 Stealth Series light bar is for the customer who wants a slimline LED light bar that holds its own against larger lights on the market.</p>
<p>Crystal White 5700K colour temperature offers clarity and definition with an excellent colour rendering index (CRI). The onboard PCB circuit design allows 97% of input power to go directly to the LEDs.</p>
<p>Stealth Series light bars use genuine OSRAM® LEDs and a DuPont powder coat to boost abrasion resistance.</p>`,

  "/base6-dr-series-led-lightbar": `<p>Crystal White 5700K colour temperature offers clarity and definition with an excellent colour rendering index (CRI). The onboard PCB circuit design allows 97% of input power to go directly to the LEDs.</p>
<p>DR Series light bars use genuine OSRAM® LEDs and push the flood beam out at 50° and the spot beam at 5°. They are finished in a DuPont powder coat to boost abrasion resistance.</p>`,

  "/aggressor-series-led-light-bars": `<p>LED light bars provide excellent light output and increase vision on the road. The BASE6 Aggressor Series uses 10 watt genuine CREE LEDs.</p>
<ul>
<li><strong>Beam patterns:</strong> spot, flood or combo. The combo pattern puts spot lighting in the centre and flood lighting on the ends, giving distance with width to see the sides of the road.</li>
<li><strong>Polycarbonate lenses:</strong> up to 10 times more impact-resistant than plastic or glass lenses.</li>
<li><strong>Heavy duty aluminium housings:</strong> powder-coated, shockproof and vibration-resistant.</li>
<li><strong>IP68 rating:</strong> dust-tight and protected against complete, continuous submersion in water.</li>
<li><strong>Deutsch connectors:</strong> prevent water ingress to the connections and are sealed to the cable for strain relief.</li>
<li><strong>Pulse width modulation (PWM):</strong> switches the LEDs on and off faster than the eye can detect, keeping the bar cooler and using less power.</li>
</ul>
<p>Multiple mounting options include fully adjustable sliding mounts that allow downward and rear mounting. Backed by a 5 year warranty.</p>`,

  "/base6-combat-5-watt-lightbar-12-led": `<p>The BASE6 Combat Series uses 5 watt genuine CREE LEDs in a single-row light bar. It is available in a range of sizes and beam patterns; the combo pattern mixes spot lighting in the centre with flood lighting on the ends, giving distance with width to see the sides of the road.</p>
<p>Polycarbonate lenses are up to 10 times more impact-resistant than plastic or glass lenses. The heavy duty aluminium housings are powder coated, shock proof and vibration resistant. Rated IP68, the bar is dust tight and protected against complete, continuous submersion in water.</p>
<p>Deutsch connectors stop water ingress to the connections and are sealed to the cable for strain relief. Pulse width modulation (PWM) switches the LEDs on and off faster than the eye can observe, so the bar runs cooler and uses less power. Backed by a 5 year warranty.</p>`,

  "/~181209": `<p>Designed with mining applications in mind, the BASE6 Heavy Duty (HD) Series work light is a strong, durable, CISPR-rated light for job sites, vehicles and equipment. All products in the BASE6 Mine Spec range are dust proof and water proof.</p>
<p>A 10mm fastener and Deutsch DT-2 connectors make it easy to install on most vehicles and equipment. The die-cast aluminium housing and impact-resistant polycarbonate lens withstand heavy vibration, corrosion, moisture and dust.</p>
<p>Also available as a <a href="/~181210">spot beam work light</a>.</p>`,

  "/MHDS": `<p>The BASE6 Marine Series Heavy Duty Strip Light uses a silicone sleeve housing to give a marine-grade LED strip light. The silicone sleeve protects against UV, high and low temperatures and a wide range of common chemicals.</p>
<ul>
<li>Greater resistance to gravel pitting, scratching or cracking</li>
<li>Improved sealing to keep water out of the light</li>
<li>Higher UV and thermal stability to stop the lens yellowing over time</li>
<li>A flexible sleeve you can shape to almost any project</li>
</ul>
<p>Mounts with 3M VHB tape and gives uniform, soft, spot-free light.</p>`,

  "/Maxilamp-Single-Round-Rear-Combination-LED-Lamp-MAXILAMPC1RXRE": `<p>Maxilamp single rear combination lamp with stop, tail and reverse functions and a rectangle reflector, with a clear lens and black chrome finish. It bolts to the surface with stainless steel fittings and is sold and packaged individually in a blister retail pack.</p>`,
};

const sharp = require("sharp");
const path = require("path");

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="110%" y2="110%">
      <stop offset="0%" stop-color="#f59d52"/>
      <stop offset="100%" stop-color="#c94e20"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>
  <circle cx="310" cy="310" r="148" fill="rgba(255,255,255,0.07)"/>
  <circle cx="310" cy="310" r="116" fill="rgba(255,255,255,0.07)"/>
  <text x="78" y="348" font-family="Georgia, serif" font-size="260" font-weight="900" fill="white">P</text>
  <text x="236" y="348" font-family="Georgia, serif" font-size="260" font-weight="900" fill="rgba(255,255,255,0.55)">L</text>
  <circle cx="392" cy="392" r="62" fill="rgba(255,255,255,0.18)"/>
  <circle cx="392" cy="392" r="50" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="5"/>
  <text x="392" y="410" font-family="Georgia, serif" font-size="52" font-weight="700" fill="rgba(255,255,255,0.9)" text-anchor="middle">R</text>
</svg>`;

const publicDir = path.join(__dirname, "..", "public");
async function generateIcons() {
  const buffer = Buffer.from(svgIcon);
  await sharp(buffer).resize(192, 192).png().toFile(path.join(publicDir, "logo192.png"));
  await sharp(buffer).resize(512, 512).png().toFile(path.join(publicDir, "logo512.png"));
  console.log("Done!");
}
generateIcons().catch(console.error);

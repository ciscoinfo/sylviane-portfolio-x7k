// Personnage de Sylviane pour les jeux sur canvas : sa vraie tête (photo) sur un corps dessiné.
const img = new Image();
let ready = false;
img.onload = () => (ready = true);
img.src = `${import.meta.env.BASE_URL}face.jpg`; // visage recadré 192 px, net même réduit

const INK = '#1d1712';

export function drawHead(ctx, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (ready) {
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.fillStyle = '#f2994a';
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${size * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', x, y + 2);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function limb(ctx, x0, y0, a1, l1, a2, l2, color, width) {
  const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1;
  const x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  return [x2, y2];
}

// phase : cycle de la foulée ; air : hauteur au-dessus du sol (px) ; amp : amplitude de la foulée
export function drawSylviane(ctx, x, groundY, { phase = 0, air = 0, amp = 1, jumping = false, stumble = false, backpack = false, stick = false, hat = false } = {}) {
  const hip = [x, groundY - 52 - air];
  const sh = [x + 3, groundY - 84 - air];
  // jambes
  [0, Math.PI].forEach((off, i) => {
    let a = Math.sin(phase + off) * 0.85 * amp;
    let b = a - 0.75 * Math.max(0, -Math.cos(phase + off)) * amp;
    if (jumping) { a = i === 0 ? 1.25 : -0.5; b = i === 0 ? 1.25 : -1.3; }
    const foot = limb(ctx, hip[0], hip[1], a, 26, b, 26, INK, 8);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(foot[0] + 4, foot[1], 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  // sac à dos : derrière le tronc (elle regarde vers la droite, le sac est donc à gauche)
  if (backpack) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#4aa3df'; // gourde
    ctx.beginPath(); ctx.roundRect(sh[0] - 41, sh[1] + 6, 9, 26, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2f855a'; // sac
    ctx.beginPath(); ctx.roundRect(sh[0] - 34, sh[1] - 10, 32, 56, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0a100'; // tapis de sol roulé au-dessus
    ctx.beginPath(); ctx.roundRect(sh[0] - 39, sh[1] - 22, 40, 14, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#276749'; // poche
    ctx.beginPath(); ctx.roundRect(sh[0] - 30, sh[1] + 20, 22, 18, 5); ctx.fill(); ctx.stroke();
  }
  // tronc
  ctx.strokeStyle = '#e2452f';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hip[0], hip[1] - 2);
  ctx.lineTo(sh[0], sh[1]);
  ctx.stroke();
  // bretelle du sac, devant le tronc
  if (backpack) {
    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sh[0] - 2, sh[1] - 4); ctx.lineTo(sh[0] + 7, sh[1] + 26); ctx.stroke();
  }
  // bras
  [0, Math.PI].forEach((off) => {
    const a = -Math.sin(phase + off) * 0.9 * amp + (jumping ? 1 : 0);
    limb(ctx, sh[0], sh[1] + 2, a, 17, a + 1.1, 15, '#e2452f', 6);
  });
  // bâton de marche planté devant elle
  if (stick) {
    const tipX = x + 36 + Math.sin(phase) * 10;
    ctx.strokeStyle = '#8a5a3b';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sh[0] + 16, sh[1] + 22); ctx.lineTo(tipX, groundY); ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tipX - 3, groundY - 3); ctx.lineTo(tipX + 1, groundY); ctx.stroke();
  }
  const hx = sh[0] + (stumble ? 6 : 2), hy = sh[1] - 28;
  drawHead(ctx, hx, hy, 46);
  // chapeau de soleil de randonneuse
  if (hat) {
    ctx.fillStyle = '#e0b062';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(hx, hy - 17, 32, 7, -0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy - 19, 15, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2452f';
    ctx.fillRect(hx - 15, hy - 24, 30, 4);
  }
}

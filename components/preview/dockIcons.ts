// Draws a generic macOS-style dock (glass squircle icons) onto a transparent canvas.
// Icons are original glyphs, not Apple's artwork.

type Draw = (ctx: CanvasRenderingContext2D, s: number) => void;

const squircle = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s * 0.225);
};

function base(ctx: CanvasRenderingContext2D, s: number, top: string, bottom: string) {
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  squircle(ctx, s);
  ctx.fillStyle = g;
  ctx.fill();
}

// Liquid-glass finish: soft top sheen and a hairline rim.
function gloss(ctx: CanvasRenderingContext2D, s: number) {
  ctx.save();
  squircle(ctx, s);
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, 0, 0, s * 0.6);
  sheen.addColorStop(0, "rgba(255,255,255,0.38)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, s, s * 0.6);
  ctx.restore();
  squircle(ctx, s);
  ctx.lineWidth = s * 0.012;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.stroke();
}

const white = (ctx: CanvasRenderingContext2D, s: number, w = 0.055) => {
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = s * w;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
};

const ICONS: Draw[] = [
  // Files
  (ctx, s) => {
    base(ctx, s, "#7cc4ff", "#1b74e8");
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.roundRect(s * 0.2, s * 0.3, s * 0.26, s * 0.12, s * 0.03);
    ctx.roundRect(s * 0.2, s * 0.36, s * 0.6, s * 0.38, s * 0.05);
    ctx.fill();
  },
  // Browser
  (ctx, s) => {
    base(ctx, s, "#ffffff", "#dfe8f3");
    const c = s / 2;
    const g = ctx.createLinearGradient(0, s * 0.18, 0, s * 0.82);
    g.addColorStop(0, "#39b8ff");
    g.addColorStop(1, "#1560e6");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.ellipse(c, c, s * 0.13, s * 0.32, 0, 0, Math.PI * 2);
    ctx.moveTo(c - s * 0.32, c);
    ctx.lineTo(c + s * 0.32, c);
    ctx.moveTo(c, c - s * 0.32);
    ctx.lineTo(c, c + s * 0.32);
    ctx.stroke();
  },
  // Messages
  (ctx, s) => {
    base(ctx, s, "#6fe879", "#1db83a");
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(s / 2, s * 0.47, s * 0.31, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.3, s * 0.62);
    ctx.quadraticCurveTo(s * 0.26, s * 0.76, s * 0.18, s * 0.79);
    ctx.quadraticCurveTo(s * 0.36, s * 0.78, s * 0.44, s * 0.69);
    ctx.fill();
  },
  // Mail
  (ctx, s) => {
    base(ctx, s, "#5ec3ff", "#1576f0");
    white(ctx, s);
    ctx.beginPath();
    ctx.roundRect(s * 0.2, s * 0.3, s * 0.6, s * 0.42, s * 0.04);
    ctx.fill();
    ctx.strokeStyle = "#2d8cf5";
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(s * 0.22, s * 0.33);
    ctx.lineTo(s / 2, s * 0.53);
    ctx.lineTo(s * 0.78, s * 0.33);
    ctx.stroke();
  },
  // Photos
  (ctx, s) => {
    base(ctx, s, "#ffffff", "#eceef2");
    const colors = ["#ffb400", "#ff6b35", "#f5317f", "#9b4dff", "#2f7bff", "#27c46b"];
    colors.forEach((col, i) => {
      ctx.save();
      ctx.translate(s / 2, s / 2);
      ctx.rotate((i / colors.length) * Math.PI * 2);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.16, s * 0.085, s * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  },
  // Music
  (ctx, s) => {
    base(ctx, s, "#ff7a8f", "#f5264a");
    white(ctx, s, 0.06);
    ctx.beginPath();
    ctx.moveTo(s * 0.42, s * 0.66);
    ctx.lineTo(s * 0.42, s * 0.28);
    ctx.lineTo(s * 0.68, s * 0.23);
    ctx.lineTo(s * 0.68, s * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s * 0.36, s * 0.67, s * 0.075, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.ellipse(s * 0.62, s * 0.61, s * 0.075, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();
  },
  // Calendar (today's date)
  (ctx, s) => {
    base(ctx, s, "#ffffff", "#f0f0f2");
    const now = new Date();
    ctx.textAlign = "center";
    ctx.fillStyle = "#f5364a";
    ctx.font = `600 ${s * 0.15}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    ctx.fillText(now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), s / 2, s * 0.3);
    ctx.fillStyle = "#1d1d1f";
    ctx.font = `300 ${s * 0.46}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    ctx.fillText(String(now.getDate()), s / 2, s * 0.76);
  },
  // Notes
  (ctx, s) => {
    base(ctx, s, "#ffffff", "#f3f3f1");
    ctx.save();
    squircle(ctx, s);
    ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, s * 0.28);
    g.addColorStop(0, "#ffe066");
    g.addColorStop(1, "#ffcc1f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s * 0.28);
    ctx.restore();
    ctx.strokeStyle = "#d4d4d8";
    ctx.lineWidth = s * 0.018;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 0.16, s * (0.44 + i * 0.12));
      ctx.lineTo(s * 0.84, s * (0.44 + i * 0.12));
      ctx.stroke();
    }
  },
  // Maps
  (ctx, s) => {
    base(ctx, s, "#dff3d8", "#b9e3ab");
    ctx.save();
    squircle(ctx, s);
    ctx.clip();
    ctx.fillStyle = "#8fd0f5";
    ctx.beginPath();
    ctx.moveTo(s * 0.55, 0);
    ctx.lineTo(s, 0);
    ctx.lineTo(s, s * 0.45);
    ctx.quadraticCurveTo(s * 0.7, s * 0.4, s * 0.55, 0);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.78);
    ctx.lineTo(s * 1.1, s * 0.32);
    ctx.stroke();
    ctx.strokeStyle = "#f7c948";
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 1.1);
    ctx.lineTo(s * 0.62, -s * 0.1);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#ff3b30";
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.42, s * 0.11, Math.PI, 0);
    ctx.lineTo(s * 0.5, s * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.42, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  },
  // Video call
  (ctx, s) => {
    base(ctx, s, "#6fe879", "#1db83a");
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(s * 0.18, s * 0.33, s * 0.44, s * 0.34, s * 0.07);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.64, s * 0.46);
    ctx.lineTo(s * 0.82, s * 0.35);
    ctx.lineTo(s * 0.82, s * 0.65);
    ctx.lineTo(s * 0.64, s * 0.54);
    ctx.closePath();
    ctx.fill();
  },
  // Store
  (ctx, s) => {
    base(ctx, s, "#5fc6ff", "#1a6ff0");
    white(ctx, s, 0.05);
    ctx.beginPath();
    ctx.roundRect(s * 0.24, s * 0.36, s * 0.52, s * 0.42, s * 0.06);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s / 2, s * 0.36, s * 0.12, Math.PI, 0);
    ctx.stroke();
  },
  // Podcasts
  (ctx, s) => {
    base(ctx, s, "#d58bff", "#8a2be2");
    ctx.strokeStyle = "#fff";
    ctx.lineCap = "round";
    const c = s / 2;
    [0.28, 0.19].forEach((r, i) => {
      ctx.lineWidth = s * (0.045 - i * 0.005);
      ctx.beginPath();
      ctx.arc(c, c * 0.92, s * r, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
    });
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(c, c * 0.92, s * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(c - s * 0.045, c * 0.92 + s * 0.1, s * 0.09, s * 0.22, s * 0.045);
    ctx.fill();
  },
  // Weather
  (ctx, s) => {
    base(ctx, s, "#58b4ff", "#1f6fe0");
    ctx.fillStyle = "#ffd33d";
    ctx.beginPath();
    ctx.arc(s * 0.4, s * 0.4, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.46, s * 0.62, s * 0.12, 0, Math.PI * 2);
    ctx.arc(s * 0.6, s * 0.54, s * 0.15, 0, Math.PI * 2);
    ctx.arc(s * 0.73, s * 0.64, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(s * 0.46, s * 0.62, s * 0.27, s * 0.12);
  },
  // Clock
  (ctx, s) => {
    base(ctx, s, "#2c2c2e", "#111113");
    const c = s / 2;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1d1d1f";
    ctx.lineCap = "round";
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(c, c - s * 0.2);
    ctx.moveTo(c, c);
    ctx.lineTo(c + s * 0.14, c + s * 0.06);
    ctx.stroke();
    ctx.strokeStyle = "#ff9500";
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.moveTo(c, c + s * 0.06);
    ctx.lineTo(c - s * 0.1, c - s * 0.24);
    ctx.stroke();
  },
  // Terminal
  (ctx, s) => {
    base(ctx, s, "#3a3a3c", "#161618");
    ctx.strokeStyle = "#e5e5ea";
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.25, s * 0.33);
    ctx.lineTo(s * 0.4, s * 0.45);
    ctx.lineTo(s * 0.25, s * 0.57);
    ctx.moveTo(s * 0.46, s * 0.62);
    ctx.lineTo(s * 0.68, s * 0.62);
    ctx.stroke();
  },
  // Settings
  (ctx, s) => {
    base(ctx, s, "#c7c8cc", "#7d7f86");
    const c = s / 2;
    ctx.fillStyle = "#4b4d53";
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = i % 2 === 0 ? s * 0.34 : s * 0.28;
      ctx.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b8b9bd";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b6d73";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
];

const TRASH: Draw = (ctx, s) => {
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  squircle(ctx, s);
  ctx.fill();
  ctx.strokeStyle = "rgba(60,60,67,0.55)";
  ctx.lineWidth = s * 0.03;
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.24);
  ctx.lineTo(s * 0.72, s * 0.24);
  ctx.moveTo(s * 0.32, s * 0.28);
  ctx.lineTo(s * 0.36, s * 0.8);
  ctx.lineTo(s * 0.64, s * 0.8);
  ctx.lineTo(s * 0.68, s * 0.28);
  for (let i = 0; i < 4; i++) {
    const x = s * (0.4 + i * 0.065);
    ctx.moveTo(x, s * 0.34);
    ctx.lineTo(x, s * 0.74);
  }
  ctx.stroke();
};

const RUNNING = new Set([0, 1, 2]);

export const DOCK_PX = { icon: 96, gap: 14, pad: 16 };

/** Returns a canvas whose pixels map 1:1 onto the dock plane. */
export function drawDock() {
  const { icon, gap, pad } = DOCK_PX;
  const sepW = 2 + gap * 2;
  const n = ICONS.length + 1;
  // n icons, n-2 regular gaps, and one separator slot (gap + line + gap) before the trash.
  const width = pad * 2 + n * icon + (n - 2) * gap + sepW;
  const height = icon + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  let x = pad;
  const drawAt = (fn: Draw, i?: number) => {
    ctx.save();
    ctx.translate(x, pad);
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    fn(ctx, icon);
    ctx.shadowColor = "transparent";
    gloss(ctx, icon);
    ctx.restore();
    if (i !== undefined && RUNNING.has(i)) {
      ctx.fillStyle = "rgba(30,30,32,0.7)";
      ctx.beginPath();
      ctx.arc(x + icon / 2, height - pad / 2 + 1, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    x += icon + gap;
  };

  ICONS.forEach((fn, i) => drawAt(fn, i));
  ctx.fillStyle = "rgba(60,60,67,0.3)";
  ctx.fillRect(x, pad + icon * 0.12, 2, icon * 0.76);
  x += 2 + gap;
  drawAt(TRASH);

  return { canvas, aspect: width / height };
}

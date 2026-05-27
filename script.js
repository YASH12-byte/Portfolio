/* Portfolio interactivity:
   - Canvas particle background
   - Scroll reveal animations
   - Typing effect
   - Resume download button (with absolute path + fallback)
*/

const resumeAbsolutePath =
  "C:\\Users\\yash\\AppData\\Roaming\\Cursor\\User\\workspaceStorage\\1779870624592\\pdfs\\73d9bf4f-f7a2-4d96-bd73-54b27e70cede\\CV YASH.pdf";
const resumeRelativePath = "./assets/CV YASH.pdf";

async function resolveResumeHref() {
  // Prefer the relative file when it exists inside the portfolio folder.
  // Absolute filesystem paths may be blocked depending on how you open/host the page.
  try {
    const res = await fetch(resumeRelativePath, { method: "HEAD" });
    if (res && res.ok) return resumeRelativePath;
  } catch (e) {
    // Ignore and fall back.
  }
  return resumeAbsolutePath;
}

function installResumeDownload(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const href = await resolveResumeHref();
    const a = document.createElement("a");
    a.href = href;
    a.download = "CV YASH.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

// Typing effect
function installTypingEffect() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const lines = [
    "Front-End Developer",
    "AI / Deep Learning Projects",
    "Portfolio Builder",
    "Real-time System Thinking",
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    el.textContent = lines[0];
    return;
  }

  const tick = () => {
    const current = lines[lineIndex] || "";
    if (!isDeleting) {
      charIndex = Math.min(current.length, charIndex + 1);
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(tick, 1100);
        return;
      }
    } else {
      charIndex = Math.max(0, charIndex - 1);
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }

    setTimeout(tick, isDeleting ? 28 : 46);
  };

  tick();
}

// Scroll reveal
function installRevealObserver() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (items.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      }
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
}

// Canvas background particles
function installParticles() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  let w = 0;
  let h = 0;
  let particles = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function seed() {
    const count = Math.round(Math.min(150, Math.max(55, (w * h) / 15000)));
    particles = Array.from({ length: count }).map(() => {
      const speed = rand(0.15, 0.55);
      const angle = rand(0, Math.PI * 2);
      return {
        x: rand(0, w),
        y: rand(0, h),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rand(1.2, 2.5),
        a: rand(0.15, 0.55),
      };
    });
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // Soft vignette
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.1, 50, w * 0.5, h * 0.1, Math.max(w, h));
    grad.addColorStop(0, "rgba(124,92,255,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234,240,255,${p.a})`;
      ctx.fill();
    }

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 130;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          ctx.strokeStyle = `rgba(124,92,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(step);
}

// Wire up
function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  installResumeDownload("resumeBtn");
  installResumeDownload("resumeBtn2");
  installTypingEffect();
  installRevealObserver();
  installParticles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


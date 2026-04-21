document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            const isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    initReveal();
    initSimWidgets();
});

function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) {
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    items.forEach(function (item) {
        observer.observe(item);
    });
}

function initSimWidgets() {
    document.querySelectorAll(".sim-widget").forEach(function (widget) {
        createSimWidget(widget);
    });
}

function createSimWidget(widget) {
    const canvas = widget.querySelector(".sim-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const chips = widget.querySelectorAll(".sim-chip");
    const copies = widget.querySelectorAll("[data-copy]");
    const trigger = widget.querySelector("[data-sim-trigger]");
    const status = widget.querySelector("[data-sim-status]");

    if (!canvas || !ctx || !chips.length || !trigger || !status) {
        return;
    }

    const messages = {
        en: {
            rocket: "Rocket mode ready.",
            combustion: "Combustion mode ready.",
            cfd: "CFD mode ready.",
            trigger: {
                rocket: "Launch triggered.",
                combustion: "Combustion pulse triggered.",
                cfd: "Disturbance injected."
            }
        },
        zh: {
            rocket: "Rocket 模式已就绪。",
            combustion: "Combustion 模式已就绪。",
            cfd: "CFD 模式已就绪。",
            trigger: {
                rocket: "已触发发射。",
                combustion: "已触发燃烧脉冲。",
                cfd: "已加入扰动。"
            }
        }
    };

    const lang = document.documentElement.lang === "zh-CN" ? "zh" : "en";
    const state = {
        mode: widget.dataset.mode || "rocket",
        pulse: 0,
        rocketProgress: 0,
        rocketActive: false,
        particles: [],
        time: 0
    };

    function setMode(mode) {
        state.mode = mode;
        state.pulse = 0;
        if (mode !== "rocket") {
            state.rocketActive = false;
            state.rocketProgress = 0;
        }
        chips.forEach(function (chip) {
            chip.classList.toggle("is-active", chip.dataset.mode === mode);
        });
        copies.forEach(function (copy) {
            copy.hidden = copy.dataset.copy !== mode;
        });
        status.textContent = messages[lang][mode];
    }

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(rect.width * ratio));
        canvas.height = Math.max(1, Math.round(rect.height * ratio));
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addParticle(x, y, vx, vy, size, life, color) {
        state.particles.push({ x: x, y: y, vx: vx, vy: vy, size: size, life: life, ttl: life, color: color });
    }

    function emitRocket(width, height) {
        const baseX = width * 0.5;
        const baseY = height * (0.79 - state.rocketProgress * 0.72);
        const count = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i += 1) {
            addParticle(
                baseX + (Math.random() - 0.5) * 14,
                baseY + 30,
                (Math.random() - 0.5) * 1.6,
                1.8 + Math.random() * 3,
                2 + Math.random() * 4,
                18 + Math.random() * 12,
                i % 2 === 0 ? "#ffb347" : "#ff6b3d"
            );
        }
    }

    function emitCombustion(width, height, strong) {
        const baseX = width * 0.5;
        const baseY = height * 0.8;
        const count = strong ? 18 : 8;
        for (let i = 0; i < count; i += 1) {
            addParticle(
                baseX + (Math.random() - 0.5) * 90,
                baseY + (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 1.4,
                -(2.6 + Math.random() * (strong ? 4 : 2.2)),
                2 + Math.random() * 5,
                24 + Math.random() * 20,
                Math.random() > 0.35 ? "#ff9a3c" : "#ffe08a"
            );
        }
    }

    function emitCFD(width, height, strong) {
        const count = strong ? 18 : 6;
        for (let i = 0; i < count; i += 1) {
            addParticle(
                -10 - Math.random() * 80,
                height * (0.25 + Math.random() * 0.5),
                2.4 + Math.random() * (strong ? 3 : 1.6),
                (Math.random() - 0.5) * 0.35,
                1.8 + Math.random() * 2.2,
                150 + Math.random() * 60,
                Math.random() > 0.5 ? "#8ad8ff" : "#b7f0ff"
            );
        }
    }

    function drawRocket(width, height) {
        const progress = state.rocketProgress;
        const x = width * 0.5;
        const y = height * (0.78 - progress * 0.72);

        ctx.fillStyle = "rgba(219, 230, 244, 0.08)";
        ctx.fillRect(0, height * 0.86, width, height * 0.14);

        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(x - 44, height * 0.72, 88, 4);

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "#dfe7f0";
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.lineTo(16, -12);
        ctx.lineTo(16, 24);
        ctx.lineTo(-16, 24);
        ctx.lineTo(-16, -12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ff7c4c";
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.lineTo(10, 48 + Math.sin(state.time * 0.18) * 4 + state.pulse * 8);
        ctx.lineTo(-10, 48 + Math.cos(state.time * 0.18) * 4 + state.pulse * 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#8cb3d9";
        ctx.fillRect(-7, -10, 14, 18);
        ctx.fillStyle = "#9fb9d3";
        ctx.beginPath();
        ctx.moveTo(-16, 16);
        ctx.lineTo(-30, 28);
        ctx.lineTo(-16, 28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(16, 16);
        ctx.lineTo(30, 28);
        ctx.lineTo(16, 28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawCombustion(width, height) {
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(width * 0.22, height * 0.78, width * 0.56, height * 0.04);

        const grd = ctx.createRadialGradient(width * 0.5, height * 0.72, 10, width * 0.5, height * 0.72, 130 + state.pulse * 60);
        grd.addColorStop(0, "rgba(255, 201, 94, 0.9)");
        grd.addColorStop(0.35, "rgba(255, 112, 61, 0.45)");
        grd.addColorStop(1, "rgba(255, 112, 61, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.72, 120 + state.pulse * 50, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawCFD(width, height) {
        const cx = width * 0.42;
        const cy = height * 0.5;
        const radius = 34;

        ctx.strokeStyle = "rgba(133, 191, 255, 0.18)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 9; i += 1) {
            const y = height * (0.18 + i * 0.08);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(width * 0.25, y, cx - radius * 1.8, y - 22, cx - radius, y);
            ctx.bezierCurveTo(cx + radius, y + 22, width * 0.75, y, width, y);
            ctx.stroke();
        }

        ctx.fillStyle = "rgba(244, 247, 251, 0.88)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateParticles(width, height) {
        const cx = width * 0.42;
        const cy = height * 0.5;
        const radius = 34;

        state.particles = state.particles.filter(function (p) {
            if (state.mode === "cfd") {
                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                const force = Math.min(120 / dist, 2.2) * (1 + state.pulse * 1.8);
                if (dist < radius * 2.6) {
                    p.vx += (dx / dist) * 0.08 * force;
                    p.vy += (dy / dist) * 0.12 * force;
                } else {
                    p.vx += (2.6 - p.vx) * 0.01;
                }
            } else if (state.mode === "rocket") {
                p.vy += 0.05;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;

            return p.life > 0 && p.x > -80 && p.x < width + 80 && p.y > -80 && p.y < height + 120;
        });
    }

    function drawParticles() {
        state.particles.forEach(function (p) {
            const alpha = Math.max(0, p.life / p.ttl);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function frame() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        ctx.clearRect(0, 0, width, height);
        state.time += 1;
        state.pulse *= 0.96;

        if (state.mode === "rocket") {
            emitRocket(width, height);
            if (state.rocketActive) {
                state.rocketProgress += 0.01 + state.pulse * 0.01;
                if (state.rocketProgress > 1.2) {
                    state.rocketActive = false;
                    state.rocketProgress = 0;
                }
            }
            drawRocket(width, height);
        } else if (state.mode === "combustion") {
            emitCombustion(width, height, false);
            drawCombustion(width, height);
        } else {
            emitCFD(width, height, false);
            drawCFD(width, height);
        }

        updateParticles(width, height);
        drawParticles();
        requestAnimationFrame(frame);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            setMode(chip.dataset.mode);
        });
    });

    trigger.addEventListener("click", function () {
        state.pulse = 1;
        if (state.mode === "rocket") {
            state.rocketActive = true;
            state.rocketProgress = 0;
            for (let i = 0; i < 32; i += 1) {
                emitRocket(canvas.clientWidth, canvas.clientHeight);
            }
        } else if (state.mode === "combustion") {
            emitCombustion(canvas.clientWidth, canvas.clientHeight, true);
        } else {
            emitCFD(canvas.clientWidth, canvas.clientHeight, true);
        }
        status.textContent = messages[lang].trigger[state.mode];
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    setMode(state.mode);
    requestAnimationFrame(frame);
}

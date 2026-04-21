document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initTabs();
    initAccordion();
    initLightbox();
    initFieldWidgets();
});

function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");

    if (!toggle || !nav) {
        return;
    }

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

function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");

    if (!items.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        items.forEach(function (item) {
            item.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });

    items.forEach(function (item) {
        observer.observe(item);
    });
}

function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
        const buttons = group.querySelectorAll("[data-tab-target]");
        const panels = document.querySelectorAll('[data-tab-panel="' + group.dataset.tabs + '"]');

        if (!buttons.length || !panels.length) {
            return;
        }

        function activate(id) {
            buttons.forEach(function (button) {
                const isActive = button.dataset.tabTarget === id;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
            });

            panels.forEach(function (panel) {
                panel.hidden = panel.dataset.panelId !== id;
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activate(button.dataset.tabTarget);
            });
        });

        const initial = group.querySelector(".is-active") || buttons[0];
        activate(initial.dataset.tabTarget);
    });
}

function initAccordion() {
    const lang = document.documentElement.lang === "zh-CN" ? "zh" : "en";
    const labels = lang === "zh"
        ? { open: "收起", closed: "展开" }
        : { open: "Collapse", closed: "Expand" };

    document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
        accordion.querySelectorAll(".accordion-trigger").forEach(function (trigger) {
            const panel = trigger.parentElement.querySelector(".accordion-panel");
            const stateLabel = trigger.querySelector("small");

            if (!panel) {
                return;
            }

            function syncLabel(expanded) {
                if (stateLabel) {
                    stateLabel.textContent = expanded ? labels.open : labels.closed;
                }
            }

            trigger.addEventListener("click", function () {
                const expanded = trigger.getAttribute("aria-expanded") === "true";
                const next = !expanded;
                trigger.setAttribute("aria-expanded", String(next));
                panel.hidden = !next;
                syncLabel(next);
            });

            syncLabel(trigger.getAttribute("aria-expanded") === "true");
        });
    });
}

function initLightbox() {
    const items = document.querySelectorAll("[data-lightbox]");

    if (!items.length) {
        return;
    }

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = [
        '<div class="lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image preview">',
        '  <button class="lightbox__close" type="button" aria-label="Close preview">×</button>',
        '  <img class="lightbox__image" alt="">',
        '  <p class="lightbox__caption"></p>',
        "</div>"
    ].join("");

    document.body.appendChild(lightbox);

    const image = lightbox.querySelector(".lightbox__image");
    const caption = lightbox.querySelector(".lightbox__caption");
    const closeButton = lightbox.querySelector(".lightbox__close");

    function close() {
        lightbox.hidden = true;
        document.body.style.overflow = "";
    }

    function open(item) {
        const previewImage = item.querySelector("img");
        image.src = item.getAttribute("href");
        image.alt = item.dataset.caption || (previewImage ? previewImage.alt : "") || "";
        caption.textContent = item.dataset.caption || "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
    }

    items.forEach(function (item) {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            open(item);
        });
    });

    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            close();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !lightbox.hidden) {
            close();
        }
    });
}

function initFieldWidgets() {
    document.querySelectorAll("[data-field-widget]").forEach(function (widget) {
        createFieldWidget(widget);
    });
}

function createFieldWidget(widget) {
    const canvas = widget.querySelector(".field-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const chips = widget.querySelectorAll(".field-chip[data-mode]");
    const copies = widget.querySelectorAll("[data-copy]");
    const trigger = widget.querySelector("[data-field-trigger]");
    const shuffle = widget.querySelector("[data-field-shuffle]");
    const status = widget.querySelector("[data-field-status]");
    const readoutDataset = widget.querySelector('[data-readout="dataset"]');
    const readoutProbe = widget.querySelector('[data-readout="probe"]');
    const readoutView = widget.querySelector('[data-readout="view"]');

    if (!canvas || !ctx || !chips.length || !status) {
        return;
    }

    const lang = document.documentElement.lang === "zh-CN" ? "zh" : "en";
    const dictionary = {
        en: {
            ready: {
                rocket: "Rocket plume ready.",
                combustion: "Combustion field ready.",
                cfd: "Wake field ready."
            },
            triggered: {
                rocket: "Plume pulse injected.",
                combustion: "Heat pulse injected.",
                cfd: "Wake disturbance injected."
            },
            shifted: "View shifted.",
            readouts: {
                rocket: {
                    dataset: "plume_slice_07.vti",
                    probe: "Mach / temperature",
                    views: ["axial cut", "near nozzle", "shock diamonds"]
                },
                combustion: {
                    dataset: "flame_sheet_03.vti",
                    probe: "heat release",
                    views: ["reaction zone", "lifted flame", "shear layer"]
                },
                cfd: {
                    dataset: "wake_field_12.vti",
                    probe: "vorticity",
                    views: ["cylinder wake", "offset probe", "rear recirculation"]
                }
            }
        },
        zh: {
            ready: {
                rocket: "火箭羽流已就绪。",
                combustion: "燃烧场已就绪。",
                cfd: "尾迹流场已就绪。"
            },
            triggered: {
                rocket: "已注入羽流脉冲。",
                combustion: "已注入热脉冲。",
                cfd: "已加入尾迹扰动。"
            },
            shifted: "视角已切换。",
            readouts: {
                rocket: {
                    dataset: "plume_slice_07.vti",
                    probe: "马赫数 / 温度",
                    views: ["轴向切面", "喷口附近", "菱形波列"]
                },
                combustion: {
                    dataset: "flame_sheet_03.vti",
                    probe: "放热率",
                    views: ["反应区", "抬升火焰", "剪切层"]
                },
                cfd: {
                    dataset: "wake_field_12.vti",
                    probe: "涡量",
                    views: ["圆柱尾迹", "偏置探针", "回流区"]
                }
            }
        }
    };

    const state = {
        mode: widget.dataset.mode || "cfd",
        pulse: 0,
        phase: Math.random() * Math.PI * 2,
        time: 0,
        viewIndex: 0,
        particles: [],
        pointer: {
            active: false,
            x: 0.72,
            y: 0.48
        }
    };

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));

        if (canvas.width === Math.round(width * ratio) && canvas.height === Math.round(height * ratio)) {
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            return { width: width, height: height };
        }

        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { width: width, height: height };
    }

    function colorMap(value) {
        const stops = [
            [6, 10, 16],
            [15, 27, 42],
            [33, 69, 106],
            [67, 142, 175],
            [255, 208, 108],
            [255, 125, 69]
        ];
        const t = Math.max(0, Math.min(1, value));
        const scaled = t * (stops.length - 1);
        const index = Math.floor(scaled);
        const blend = scaled - index;
        const a = stops[index];
        const b = stops[Math.min(index + 1, stops.length - 1)];
        const r = Math.round(a[0] + (b[0] - a[0]) * blend);
        const g = Math.round(a[1] + (b[1] - a[1]) * blend);
        const blue = Math.round(a[2] + (b[2] - a[2]) * blend);
        return "rgb(" + r + "," + g + "," + blue + ")";
    }

    function currentReadout() {
        return dictionary[lang].readouts[state.mode];
    }

    function updateReadout() {
        const info = currentReadout();
        if (readoutDataset) {
            readoutDataset.textContent = info.dataset;
        }
        if (readoutProbe) {
            readoutProbe.textContent = info.probe;
        }
        if (readoutView) {
            readoutView.textContent = info.views[state.viewIndex % info.views.length];
        }
    }

    function updateInterface(message) {
        chips.forEach(function (chip) {
            chip.classList.toggle("is-active", chip.dataset.mode === state.mode);
        });

        copies.forEach(function (copy) {
            copy.hidden = copy.dataset.copy !== state.mode;
        });

        status.textContent = message || dictionary[lang].ready[state.mode];
        updateReadout();
    }

    function setMode(mode) {
        state.mode = mode;
        state.pulse = 0.28;
        state.viewIndex = 0;
        seedParticles();
        updateInterface();
    }

    function sampleField(nx, ny) {
        const time = state.time * 0.014 + state.phase;
        const pointerX = state.pointer.x;
        const pointerY = state.pointer.y;

        if (state.mode === "rocket") {
            const nozzleX = 0.18 + state.viewIndex * 0.015;
            const nozzleY = 0.52 + Math.sin(time * 0.4) * 0.006;
            const axial = Math.max(0, nx - nozzleX);
            const spread = 0.022 + axial * 0.24;
            const core = Math.exp(-Math.pow((ny - nozzleY) / Math.max(spread, 0.01), 2)) * Math.exp(-axial * 2.4);
            const diamonds = Math.max(0, Math.sin(axial * 34 - time * 4.4)) * Math.exp(-axial * 2.8);
            const pointerBoost = state.pointer.active
                ? Math.exp(-Math.pow((nx - pointerX) * 12, 2) - Math.pow((ny - pointerY) * 18, 2)) * 0.22
                : 0;
            const scalar = 0.04 + core * 0.72 + diamonds * core * 0.28 + state.pulse * core * 0.3 + pointerBoost;
            const vx = 1.45 + core * 2.5 + state.pulse * 1.2;
            const vy = (ny - nozzleY) * (0.6 + axial * 2.2) + Math.sin(time * 2 + nx * 10) * 0.05;
            return { scalar: scalar, vx: vx, vy: vy };
        }

        if (state.mode === "combustion") {
            const centerX = 0.5 + state.viewIndex * 0.02;
            const baseY = 0.78;
            const core = Math.exp(-Math.pow((nx - centerX) * 4.4, 2) - Math.pow((ny - baseY) * 3.2, 2));
            const sheetCenter = centerX + Math.sin(ny * 18 - time * 3.2) * 0.05;
            const sheet = Math.exp(-Math.pow((nx - sheetCenter) * 8.5, 2)) * Math.exp(-Math.pow((ny - 0.56) * 3.6, 2));
            const plume = Math.exp(-Math.pow((nx - centerX) * 3.3, 2)) * Math.exp(-Math.max(0, baseY - ny) * 3.1);
            const pointerBoost = state.pointer.active
                ? Math.exp(-Math.pow((nx - pointerX) * 14, 2) - Math.pow((ny - pointerY) * 18, 2)) * 0.26
                : 0;
            const flicker = (Math.sin(nx * 20 + time * 5.6) + Math.cos(ny * 14 - time * 3.4)) * 0.04;
            const scalar = 0.05 + core * 0.34 + sheet * 0.26 + plume * 0.24 + flicker + state.pulse * 0.22 + pointerBoost;
            const vx = Math.sin(ny * 10 + time * 2) * 0.22 + (pointerX - nx) * pointerBoost * 0.6;
            const vy = -0.95 - plume * 0.95 - state.pulse * 0.5;
            return { scalar: scalar, vx: vx, vy: vy };
        }

        const cx = 0.38 + state.viewIndex * 0.03;
        const cy = 0.5;
        const dx = nx - cx;
        const dy = ny - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const obstacle = Math.exp(-(dx * dx * 210 + dy * dy * 210));
        const wakeGate = Math.max(0, nx - cx + 0.03);
        const wake = Math.exp(-Math.pow((nx - cx - 0.14) * 2.4, 2)) * Math.exp(-Math.pow(dy * 6.4, 2));
        const vortices = Math.sin((nx - cx) * 28 - time * 5.8) * Math.cos((ny - cy) * 16);
        const pointerField = state.pointer.active
            ? Math.exp(-Math.pow((nx - pointerX) * 12, 2) - Math.pow((ny - pointerY) * 12, 2)) * Math.sin(time * 4.8)
            : 0;
        const scalar = 0.08 + wake * 0.42 + obstacle * 0.12 + wakeGate * (vortices * 0.12 + pointerField * 0.16) + state.pulse * wake * 0.22;
        const swirl = distance < 0.18 ? (0.12 / Math.max(distance, 0.04)) : 0;
        const vx = 1.3 + Math.exp(-Math.abs(dy) * 4.2) * 0.35 - obstacle * 0.95 + dx * swirl * 0.5;
        const vy = Math.sin((nx - cx) * 18 - time * 4.2) * Math.exp(-Math.abs(dy) * 4.4) * 0.26 - dy * swirl * 0.5 + pointerField * 0.3;
        return { scalar: scalar, vx: vx, vy: vy };
    }

    function drawBackdrop(width, height) {
        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#05070b");
        gradient.addColorStop(1, "#09111b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        const step = Math.max(26, Math.round(width / 26));
        for (let x = 0; x <= width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(width, y + 0.5);
            ctx.stroke();
        }
    }

    function drawScalarField(width, height) {
        const columns = 54;
        const rows = 34;
        const cellWidth = width / columns;
        const cellHeight = height / rows;

        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < columns; col += 1) {
                const x = col * cellWidth;
                const y = row * cellHeight;
                const nx = (x + cellWidth * 0.5) / width;
                const ny = (y + cellHeight * 0.5) / height;
                const scalar = sampleField(nx, ny).scalar;
                ctx.fillStyle = colorMap(scalar);
                ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1);
            }
        }

        ctx.fillStyle = "rgba(5, 7, 11, 0.22)";
        ctx.fillRect(0, 0, width, height);
    }

    function drawOverlay(width, height) {
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(227, 238, 249, 0.2)";

        if (state.mode === "rocket") {
            const nozzleX = width * (0.18 + state.viewIndex * 0.015);
            const nozzleY = height * 0.52;
            for (let i = 0; i < 6; i += 1) {
                const offset = -70 + i * 28;
                ctx.beginPath();
                ctx.moveTo(nozzleX, nozzleY + offset);
                for (let step = 1; step < 40; step += 1) {
                    const x = nozzleX + step * (width * 0.018);
                    const nx = x / width;
                    const wave = Math.sin(step * 0.5 - state.time * 0.08 + i * 0.3) * (14 - i);
                    const y = nozzleY + offset * Math.exp(-step * 0.04) + wave;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            ctx.fillStyle = "rgba(239, 244, 250, 0.88)";
            ctx.beginPath();
            ctx.moveTo(nozzleX - 54, nozzleY - 18);
            ctx.lineTo(nozzleX - 8, nozzleY - 18);
            ctx.lineTo(nozzleX + 12, nozzleY - 30);
            ctx.lineTo(nozzleX + 12, nozzleY + 30);
            ctx.lineTo(nozzleX - 8, nozzleY + 18);
            ctx.lineTo(nozzleX - 54, nozzleY + 18);
            ctx.closePath();
            ctx.fill();
            return;
        }

        if (state.mode === "combustion") {
            for (let i = 0; i < 8; i += 1) {
                const startY = height * (0.86 - i * 0.08);
                ctx.beginPath();
                ctx.moveTo(width * 0.2, startY);
                for (let step = 0; step <= 30; step += 1) {
                    const t = step / 30;
                    const x = width * (0.2 + t * 0.6);
                    const y = startY - t * height * 0.26 + Math.sin(t * 10 + i + state.time * 0.08) * 10;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            return;
        }

        const centerX = width * (0.38 + state.viewIndex * 0.03);
        const centerY = height * 0.5;
        const radius = 28;

        for (let i = 0; i < 7; i += 1) {
            const startY = height * (0.18 + i * 0.1);
            ctx.beginPath();
            ctx.moveTo(0, startY);
            for (let step = 0; step <= 64; step += 1) {
                const x = (step / 64) * width;
                const nx = x / width;
                const field = sampleField(nx, startY / height);
                const y = startY + field.vy * 24;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        ctx.fillStyle = "rgba(240, 246, 251, 0.92)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function spawnParticle() {
        if (state.mode === "rocket") {
            return {
                x: canvas.clientWidth * 0.16 + Math.random() * 8,
                y: canvas.clientHeight * 0.52 + (Math.random() - 0.5) * 22,
                px: 0,
                py: 0,
                life: 70 + Math.random() * 28,
                ttl: 0,
                color: "rgba(255, 198, 94, 0.75)"
            };
        }

        if (state.mode === "combustion") {
            return {
                x: canvas.clientWidth * 0.5 + (Math.random() - 0.5) * 40,
                y: canvas.clientHeight * 0.82 + Math.random() * 18,
                px: 0,
                py: 0,
                life: 78 + Math.random() * 36,
                ttl: 0,
                color: "rgba(255, 211, 110, 0.72)"
            };
        }

        return {
            x: -20 - Math.random() * 90,
            y: canvas.clientHeight * (0.18 + Math.random() * 0.64),
            px: 0,
            py: 0,
            life: 130 + Math.random() * 60,
            ttl: 0,
            color: "rgba(125, 220, 255, 0.65)"
        };
    }

    function seedParticles() {
        const total = state.mode === "cfd" ? 140 : state.mode === "rocket" ? 92 : 84;
        state.particles = [];
        for (let i = 0; i < total; i += 1) {
            const particle = spawnParticle();
            particle.px = particle.x;
            particle.py = particle.y;
            state.particles.push(particle);
        }
    }

    function updateParticles(width, height) {
        state.particles.forEach(function (particle) {
            particle.px = particle.x;
            particle.py = particle.y;
            particle.ttl += 1;

            const nx = particle.x / width;
            const ny = particle.y / height;
            const flow = sampleField(nx, ny);

            particle.x += flow.vx * 1.4;
            particle.y += flow.vy * 1.8;

            if (
                particle.ttl > particle.life ||
                particle.x > width + 40 ||
                particle.x < -120 ||
                particle.y < -40 ||
                particle.y > height + 40
            ) {
                const replacement = spawnParticle();
                particle.x = replacement.x;
                particle.y = replacement.y;
                particle.px = replacement.x;
                particle.py = replacement.y;
                particle.life = replacement.life;
                particle.ttl = 0;
                particle.color = replacement.color;
            }
        });
    }

    function drawParticles() {
        ctx.lineWidth = 1.4;
        state.particles.forEach(function (particle) {
            const alpha = 1 - particle.ttl / particle.life;
            ctx.strokeStyle = particle.color.replace(/0\.\d+\)$/, String(Math.max(0.08, alpha * 0.75)) + ")");
            ctx.beginPath();
            ctx.moveTo(particle.px, particle.py);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
        });
    }

    function frame() {
        const size = resizeCanvas();
        const width = size.width;
        const height = size.height;

        state.time += 1;
        state.pulse *= 0.986;

        drawBackdrop(width, height);
        drawScalarField(width, height);
        drawOverlay(width, height);
        updateParticles(width, height);
        drawParticles();

        window.requestAnimationFrame(frame);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            setMode(chip.dataset.mode);
        });
    });

    if (trigger) {
        trigger.addEventListener("click", function () {
            state.pulse = Math.min(1.4, state.pulse + 0.46);
            updateInterface(dictionary[lang].triggered[state.mode]);
        });
    }

    if (shuffle) {
        shuffle.addEventListener("click", function () {
            const views = currentReadout().views.length;
            state.viewIndex = (state.viewIndex + 1) % views;
            updateInterface(dictionary[lang].shifted);
        });
    }

    canvas.addEventListener("pointermove", function (event) {
        const rect = canvas.getBoundingClientRect();
        state.pointer.active = true;
        state.pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        state.pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    });

    canvas.addEventListener("pointerleave", function () {
        state.pointer.active = false;
    });

    canvas.addEventListener("click", function () {
        state.pulse = Math.min(1.4, state.pulse + 0.38);
        updateInterface(dictionary[lang].triggered[state.mode]);
    });

    window.addEventListener("resize", resizeCanvas);

    seedParticles();
    updateInterface();
    frame();
}

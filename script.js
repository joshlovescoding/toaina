// 1. Generate Hundreds of Silky Hearts
const bg = document.getElementById("heart-bg");
const heartCount = 120;

for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement("div");
    heart.className = "pixel-heart";
    heart.innerHTML = "❤";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = Math.random() * 100 + "vh";
    heart.style.animationDelay = Math.random() * 6 + "s";
    heart.style.fontSize = Math.random() * 20 + 10 + "px";
    bg.appendChild(heart);
}

// 2. The Elusive "NO" Button Logic (with progressive give-up stages)
const noBtn = document.getElementById("no-btn");
const threshold = 80;
let moved = false;
let dodgeCount = 0;
let gaveUp = false;

const noBtnStages = [
    { at: 0, text: "NO" },
    { at: 2, text: "NO!" },
    { at: 4, text: "no...?" },
    { at: 6, text: "...okay", giveUp: true },
];

function updateNoBtnStage() {
    // Find the highest stage reached so far
    let stage = noBtnStages[0];
    for (const s of noBtnStages) {
        if (dodgeCount >= s.at) stage = s;
    }
    noBtn.textContent = stage.text;
    noBtn.classList.remove("stage-1", "stage-2", "stage-3");
    const stageIndex = noBtnStages.indexOf(stage);
    if (stageIndex === 1) noBtn.classList.add("stage-1");
    if (stageIndex === 2) noBtn.classList.add("stage-2");
    if (stageIndex === 3) noBtn.classList.add("stage-3");

    if (stage.giveUp && !gaveUp) {
        gaveUp = true;
        noBtn.setAttribute("aria-label", "No (it has given up running away)");
    }
}

function moveNoButton() {
    if (gaveUp) return; // it has given up -- let it rest in peace

    if (!moved) {
        noBtn.style.position = "fixed";
        moved = true;
    }

    // Mobile viewport safety: guard against reading dimensions of 0
    // (can happen if layout hasn't fully settled yet on some mobile browsers)
    const btnWidth = noBtn.offsetWidth || 100;
    const btnHeight = noBtn.offsetHeight || 50;
    const padding = 60;
    const maxX = Math.max(window.innerWidth - btnWidth - padding, padding);
    const maxY = Math.max(window.innerHeight - btnHeight - padding, padding);

    const newX = Math.random() * maxX + padding / 2;
    const newY = Math.random() * maxY + padding / 2;

    noBtn.style.left = newX + "px";
    noBtn.style.top = newY + "px";

    dodgeCount++;
    updateNoBtnStage();
}

// Desktop: Runs away when cursor gets close
document.addEventListener("mousemove", (e) => {
    if (gaveUp) return;
    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (distance < threshold) {
        moveNoButton();
    }
});

// Mobile: Teleports instantly the moment a finger touches it
noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Stops the actual click from happening
    moveNoButton();
});

// 3. Confetti / heart-burst animation
const confettiLayer = document.getElementById("confetti-layer");

function launchConfetti() {
    const pieceCount = 40;
    const symbols = ["❤", "💗", "💕", "✨"];

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 250;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const endRot = Math.random() * 720 - 360;

        piece.style.setProperty("--end-pos", `${endX}px ${endY}px`);
        piece.style.setProperty("--end-rot", `${endRot}deg`);
        piece.style.fontSize = Math.random() * 16 + 14 + "px";
        piece.style.animationDelay = Math.random() * 0.2 + "s";

        confettiLayer.appendChild(piece);
        piece.addEventListener("animationend", () => piece.remove());
    }
}

// 4. Sound effect (generated with Web Audio API -- no external file needed)
function playChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 -- a happy little chime

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;

            const startTime = ctx.currentTime + i * 0.12;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    } catch (err) {
        // Web Audio not available -- fail silently, it's just a nice-to-have
        console.warn("Chime sound unavailable:", err);
    }
}

// 5. The "YES" Action (with mailto + on-screen fallback for copy/paste)
function sendYes() {
    const email = "ynpelcap@gmail.com";
    const subject = "Aina said YES! ❤️";
    const bodyLines = [
        "一緒に遊びに行きたいです！",
        "",
        "好きな食べ物：",
        "行きたい場所：",
        "それと…",
    ];
    const body = bodyLines.join("\n");
    const fullMessage = `To: ${email}\nSubject: ${subject}\n\n${body}`;

    launchConfetti();
    playChime();

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    document.getElementById("main-card").innerHTML = `
        <h1 class="yay-heading">❤️ YAY! ❤️</h1>
        <p class="yay-text">Can't wait! Check your email app to send the confirmation!</p>
        <div class="fallback-box">
        <span class="fallback-label">💡 Suggested message (feel free to edit before sending):</span>
            <pre class="fallback-message" id="fallback-message">${fullMessage}</pre>
            <button id="copy-btn" onclick="copyFallbackMessage()">COPY MESSAGE</button>
        </div>
    `;
}

function copyFallbackMessage() {
    const text = document.getElementById("fallback-message").textContent;
    const btn = document.getElementById("copy-btn");

    const onCopied = () => {
        btn.textContent = "COPIED! ✓";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = "COPY MESSAGE";
            btn.classList.remove("copied");
        }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(text)
            .then(onCopied)
            .catch(() => {
                fallbackCopy(text, onCopied);
            });
    } else {
        fallbackCopy(text, onCopied);
    }
}

function fallbackCopy(text, onDone) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        onDone();
    } catch (err) {
        console.warn("Copy failed:", err);
    }
    document.body.removeChild(textarea);
}

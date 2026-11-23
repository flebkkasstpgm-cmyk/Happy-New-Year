/* ========================================================
   Happy New Year 2027 Celebration Engine
   AI Intelligence V4.5 - Engineered by JARVIS
   ======================================================== */

// ========================================================
// ฐานข้อมูล Google Sheets (URL ที่เจ้านายสร้างและ Deploy เรียบร้อย)
// ========================================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbydE1VlQyIDL9638vyqbzKrg7h-ne1gufUqvr75thYY7FyikMxHzDvbKAI8HMczKUvH/exec"; 

// Helper แปลง Path สติ๊กเกอร์ให้ปลอดภัยในทุกสภาพเบราว์เซอร์
function getStickerPath(file) {
    if (!file) return encodeURI('สติ๊กเกอร์/1.png');
    if (!file.endsWith('.png')) file += '.png';
    return encodeURI('สติ๊กเกอร์/' + file);
}

// ข้อมูลสติ๊กเกอร์ 17 รูปแบบ
const STICKERS = [
    { id: 1, file: '1.png', name: 'สติ๊กเกอร์ 1' },
    { id: 2, file: '2.png', name: 'สติ๊กเกอร์ 2' },
    { id: 3, file: '3.png', name: 'สติ๊กเกอร์ 3' },
    { id: 4, file: '4.png', name: 'สติ๊กเกอร์ 4' },
    { id: 5, file: '5.png', name: 'สติ๊กเกอร์ 5' },
    { id: 6, file: '6.png', name: 'สติ๊กเกอร์ 6' },
    { id: 7, file: '7.png', name: 'สติ๊กเกอร์ 7' },
    { id: 8, file: '8.png', name: 'สติ๊กเกอร์ 8' },
    { id: 9, file: '9.png', name: 'สติ๊กเกอร์ 9' },
    { id: 10, file: '10.png', name: 'สติ๊กเกอร์ 10' },
    { id: 11, file: '11.png', name: 'สติ๊กเกอร์ 11' },
    { id: 12, file: '12.png', name: 'สติ๊กเกอร์ 12' },
    { id: 13, file: '13.png', name: 'สติ๊กเกอร์ 13' },
    { id: 14, file: '14.png', name: 'สติ๊กเกอร์ 14' },
    { id: 15, file: '15.png', name: 'สติ๊กเกอร์ 15' },
    { id: 16, file: '16.png', name: 'สติ๊กเกอร์ 16' },
    { id: 17, file: '17.png', name: 'สติ๊กเกอร์ 17 (แบนเนอร์พิเศษ)', isBanner: true }
];

// คำอวยพรเริ่มต้น (ว่างเปล่า เพื่อรอรับคำอวยพรจริงจากผู้ใช้งานหรือ Google Sheets)
const DEFAULT_WISHES = [];

// สถานะการทำงาน
let activeWishIds = new Set();
let isSubmitting = false;
let audioContext = null;
let soundEnabled = true;
let celebrationChannel = null;
let wishCounter = 0;

// ระบบซิงค์คำอวยพรเรียลไทม์ข้ามแท็บด้วย BroadcastChannel
try {
    celebrationChannel = new BroadcastChannel('happynewyear_2027_sync');
    celebrationChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_WISH') {
            handleIncomingWish(event.data.payload, true);
        }
    };
} catch (e) {
    console.log("BroadcastChannel fallback active");
}

// ซิงค์ข้ามหน้าต่างด้วย LocalStorage Event
window.addEventListener('storage', (e) => {
    if (e.key === 'NEWYEAR_LATEST_WISH' && e.newValue) {
        try {
            const newWish = JSON.parse(e.newValue);
            handleIncomingWish(newWish, true);
        } catch (err) {}
    }
});

// ================= AUDIO SYNTHESIZER ENGINE =================
// ระบบจำลองเสียงระฆังและพลุเฉลิมฉลอง (100% ออฟไลน์ ไม่ต้องใช้ไฟล์ MP3)
function initAudio() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playBoomSound() {
    if (!soundEnabled || !audioContext) return;
    try {
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
        
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.7);

        // Noise crackle
        const bufferSize = audioContext.sampleRate * 0.35;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.35);
        
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noise.start(now);
    } catch (e) {}
}

function playChimeSound() {
    if (!soundEnabled || !audioContext) return;
    try {
        const now = audioContext.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // Golden Chord
        freqs.forEach((freq, idx) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0.16, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.9);
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.9);
        });
    } catch (e) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
        btn.innerHTML = soundEnabled ? '🔊' : '🔇';
        btn.title = soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง';
    }
    if (soundEnabled) initAudio();
}

// ================= AMBIENT CANVAS & BACKGROUND =================
function createAmbientAtmosphere() {
    const sky = document.getElementById('sky-layer');
    if (!sky) return;
    sky.innerHTML = '';
    
    // Starry sparkles
    for (let i = 0; i < 45; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 85 + '%';
        const size = (Math.random() * 2.5 + 1.2) + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.animationDelay = (Math.random() * 3) + 's';
        star.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        sky.appendChild(star);
    }

    // Floating Golden Embers
    for (let i = 0; i < 20; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember';
        ember.style.left = Math.random() * 100 + '%';
        const size = (Math.random() * 5 + 3) + 'px';
        ember.style.width = size;
        ember.style.height = size;
        ember.style.animationDuration = (Math.random() * 8 + 6) + 's';
        ember.style.animationDelay = (Math.random() * 10) + 's';
        ember.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
        sky.appendChild(ember);
    }
}

// ================= QR CODE GENERATION HELPER =================
function renderQrCode(containerId, targetUrl, size = 160) {
    const container = document.getElementById(containerId);
    if (!container || typeof QRCode === 'undefined') return;
    container.innerHTML = '';
    new QRCode(container, {
        text: targetUrl,
        width: size,
        height: size,
        colorDark: "#1a0408",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function getMobileSelectUrl() {
    const loc = window.location.href;
    const lanIP = '10.0.4.102'; // Company LAN IPv4 of this PC
    const defaultPort = '8888';

    if (loc.startsWith('file:')) {
        return `http://${lanIP}:${defaultPort}/form.html`;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const port = window.location.port ? ':' + window.location.port : `:${defaultPort}`;
        return `${window.location.protocol}//${lanIP}${port}/form.html`;
    }
    const base = loc.substring(0, loc.lastIndexOf('/'));
    return base + "/form.html";
}

// ================= FORM PAGE INITIALIZER =================
function initFormPage() {
    createAmbientAtmosphere();
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'float';
    
    const modeTitles = {
        'float': '✨ ส่งคำอวยพรปีใหม่ 2027',
        'firework': '🎆 จุดพลุส่งคำอวยพรปีใหม่ 2027'
    };
    
    const titleEl = document.getElementById('form-page-title');
    if (titleEl) {
        titleEl.innerText = modeTitles[mode] || '✨ ส่งคำอวยพรปีใหม่ 2027';
    }

    // Populate Sticker Grid
    const grid = document.getElementById('sticker-grid');
    if (grid) {
        grid.innerHTML = '';
        STICKERS.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'sticker-item' + (item.isBanner ? ' special-banner' : '');
            if (index === 0) card.classList.add('selected');

            card.innerHTML = `
                <img src="${getStickerPath(item.file)}" alt="${item.name}">
                <span class="sticker-name">${item.name}</span>
            `;

            card.onclick = () => {
                document.querySelectorAll('.sticker-item').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                window.selectedSticker = item.file;
            };

            grid.appendChild(card);
        });
        window.selectedSticker = STICKERS[0].file;
    }
}

// Quick Blessing Chip Click
function insertBlessing(text) {
    const msgInput = document.getElementById('user-msg');
    if (msgInput) {
        msgInput.value = text;
        msgInput.focus();
    }
}

// Submit Form Handler
async function submitBlessing() {
    if (isSubmitting) return;

    const nameInput = document.getElementById('user-name');
    const msgInput = document.getElementById('user-msg');
    const name = nameInput ? nameInput.value.trim() : '';
    const msg = msgInput ? msgInput.value.trim() : '';
    const mode = new URLSearchParams(window.location.search).get('mode') || 'float';

    if (!name || !msg) {
        alert('กรุณากรอกชื่อและคำอวยพรให้ครบถ้วนด้วยนะครับ ✨');
        return;
    }

    isSubmitting = true;
    const sticker = window.selectedSticker || '1.png';
    const newWish = {
        id: 'WISH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        mode,
        name,
        msg,
        sticker,
        timestamp: Date.now()
    };

    // 1. บันทึกลง LocalStorage สำหรับใช้งานออฟไลน์/เปิดแบบไฟล์
    try {
        const stored = JSON.parse(localStorage.getItem('NEWYEAR_WISHES_2027') || '[]');
        stored.push(newWish);
        if (stored.length > 80) stored.shift();
        localStorage.setItem('NEWYEAR_WISHES_2027', JSON.stringify(stored));
        localStorage.setItem('NEWYEAR_LATEST_WISH', JSON.stringify(newWish));
    } catch (e) {}

    // 2. Broadcast ข้ามแท็บ
    if (celebrationChannel) {
        celebrationChannel.postMessage({ type: 'NEW_WISH', payload: newWish });
    }

    // 3. บันทึกลง Google Sheets
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.trim() !== "") {
        try {
            await Promise.race([
                fetch(GOOGLE_SHEET_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    keepalive: true,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mode: newWish.mode,
                        name: newWish.name,
                        msg: newWish.msg,
                        sticker: newWish.sticker,
                        design: newWish.sticker
                    })
                }),
                new Promise(resolve => setTimeout(resolve, 1500))
            ]);
        } catch (e) {
            console.log("Google Sheets save notice:", e);
        }
    }

    // ไปยังหน้าจอเฉลิมฉลอง
    window.location.href = 'animation.html';
}

// ================= CELEBRATION STAGE ENGINE =================
// 1. วัตถุคำอวยพรลอยฟ้า (Floating Wish Object)
function spawnFloatingWish(data, isNew = false) {
    const stage = document.getElementById('celebration-stage');
    if (!stage) return;

    const el = document.createElement('div');
    el.className = 'festive-obj';

    const startX = Math.random() * 84 + 8; // 8% to 92%
    const endX = startX + (Math.random() * 16 - 8);
    const duration = isNew ? (26 + Math.random() * 12) : (35 + Math.random() * 20);
    const delay = isNew ? 0 : (Math.random() * 18);

    el.style.setProperty('--start-x', startX + '%');
    el.style.setProperty('--end-x', endX + '%');
    el.style.setProperty('--start-y', '-8%');
    el.style.animation = `wishRise ${duration}s linear infinite`;
    el.style.animationDelay = delay + 's';

    el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div class="obj-aura"></div>
            <img src="${getStickerPath(data.sticker)}" class="obj-sticker-img" alt="Sticker">
        </div>
        <div class="obj-card">
            <span class="obj-sender">${data.name}</span>
            <span class="obj-msg">${data.msg}</span>
        </div>
    `;

    stage.appendChild(el);
}

// 2. จุดพลุส่งคำอวยพร (Firework Blessing Burst)
function triggerFireworkBlessing(data) {
    launchRealisticFirework(null, null, data);
}

// ================= SPECIAL ANNOUNCER MARQUEE =================
function launchAnnouncerBanner(data) {
    const stage = document.getElementById('celebration-stage');
    if (!stage) return;

    const banner = document.createElement('div');
    banner.className = 'announcer-banner';
    const bannerY = 38 + Math.random() * 18;
    banner.style.setProperty('--banner-y', bannerY + '%');

    const duration = 10;
    banner.style.setProperty('--duration', duration + 's');

    banner.innerHTML = `
        <div class="announcer-box">
            <span style="font-size: 1.6rem;">🎉</span>
            <div>
                <div class="announcer-text-title">✨ ร่วมส่งคำอวยพรปีใหม่จาก คุณ ${data.name}! ✨</div>
                <div class="announcer-text-msg">"${data.msg}"</div>
            </div>
            <span style="font-size: 1.6rem;">✨</span>
        </div>
        <img src="${getStickerPath(data.sticker)}" class="announcer-mascot" alt="Mascot">
    `;

    stage.appendChild(banner);
    playChimeSound();

    setTimeout(() => {
        banner.remove();
    }, duration * 1000);
}

// ================= FIREWORKS ENGINE 3.0 =================
function launchRealisticFirework(customX = null, customY = null, attachedWish = null) {
    const sky = document.getElementById('sky-layer') || document.body;
    if (!sky) return;

    const startX = customX !== null ? customX : (Math.random() * 80 + 10);
    const targetY = customY !== null ? customY : (Math.random() * 38 + 12);
    const duration = 1.1 + Math.random() * 0.4;

    const launcher = document.createElement('div');
    launcher.className = 'firework-launcher';
    launcher.style.left = startX + '%';
    launcher.style.top = targetY + '%';
    launcher.style.setProperty('--duration', duration + 's');
    sky.appendChild(launcher);

    setTimeout(() => {
        launcher.remove();

        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        flash.style.left = startX + '%';
        flash.style.top = targetY + '%';
        const colors = ['#ffe57f', '#ff1a40', '#00f2fe', '#ffd700', '#ff007f', '#7000ff', '#00ff88'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        flash.style.setProperty('--color', chosenColor);
        sky.appendChild(flash);
        setTimeout(() => flash.remove(), 250);

        playBoomSound();

        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = startX + '%';
        firework.style.top = targetY + '%';

        const sparkCount = attachedWish ? 75 : (50 + Math.floor(Math.random() * 25));
        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            const angle = (i * (360 / sparkCount)) + (Math.random() * 12);
            const dist = (attachedWish ? 120 : 80) + Math.random() * 90;
            const sparkDuration = 1.6 + Math.random() * 1.4;
            const size = 2.5 + Math.random() * 3.5;

            spark.style.setProperty('--angle', angle + 'deg');
            spark.style.setProperty('--distance', dist + 'px');
            spark.style.setProperty('--duration', sparkDuration + 's');
            spark.style.setProperty('--color', chosenColor);
            spark.style.setProperty('--size', size + 'px');
            firework.appendChild(spark);
        }
        sky.appendChild(firework);
        setTimeout(() => firework.remove(), 3500);

        if (attachedWish) {
            spawnBurstWishCard(attachedWish, startX, targetY);
        }
    }, duration * 900);
}

// Burst wish card that appears at firework center
function spawnBurstWishCard(data, xPercent, yPercent) {
    const stage = document.getElementById('celebration-stage');
    if (!stage) return;

    const el = document.createElement('div');
    el.className = 'festive-obj';
    el.style.left = xPercent + '%';
    el.style.top = yPercent + '%';
    el.style.transform = 'translate(-50%, -50%) scale(0)';
    el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.4)';

    el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div class="obj-aura" style="width: 70px; height: 70px; border-radius: 50%;"></div>
            <img src="${getStickerPath(data.sticker)}" class="obj-sticker-img" style="width: 85px; height: 85px;" alt="Sticker">
        </div>
        <div class="obj-card" style="border-color: #ffd700; box-shadow: 0 0 25px rgba(255,215,0,0.8);">
            <span class="obj-sender" style="color: #fff299;">🎆 ${data.name}</span>
            <span class="obj-msg">${data.msg}</span>
        </div>
    `;

    stage.appendChild(el);
    setTimeout(() => {
        el.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }, 50);

    setTimeout(() => {
        el.style.transition = 'transform 12s linear, opacity 2s ease';
        el.style.transform = `translate(-50%, 250px) scale(0.9)`;
    }, 600);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 2000);
    }, 12000);
}

// ================= INCOMING WISH DISPATCHER =================
function handleIncomingWish(wish, isRealTime = false) {
    const key = wish.id || (wish.name + wish.msg + wish.sticker);
    if (activeWishIds.has(key)) return;
    activeWishIds.add(key);

    wishCounter++;
    const counterEl = document.getElementById('wish-counter-badge');
    if (counterEl) {
        counterEl.innerText = `${wishCounter} คำอวยพร`;
    }

    if (isRealTime) {
        launchAnnouncerBanner(wish);
        launchRealisticFirework(50, 20);
        setTimeout(() => {
            if (wish.mode === 'firework') triggerFireworkBlessing(wish);
            else spawnFloatingWish(wish, true);
        }, 800);
    } else {
        if (wish.mode === 'firework') triggerFireworkBlessing(wish);
        else spawnFloatingWish(wish, false);
    }
}

// โหลดข้อมูลคำอวยพร (เฉพาะที่ผู้ใช้ส่งจริงหรือมาจาก Google Sheets)
function loadCelebrationWishes() {
    // 1. โหลดจาก LocalStorage
    let localWishes = [];
    try {
        localWishes = JSON.parse(localStorage.getItem('NEWYEAR_WISHES_2027') || '[]');
        // กรองตัวอย่างเดิมออกให้หมดจด
        localWishes = localWishes.filter(w => 
            w.name !== 'ผู้บริหาร & ทีมงาน' && 
            w.name !== 'ฝ่ายไอที (JARVIS)' && 
            w.name !== 'ฝ่ายบริการลูกค้า' && 
            w.name !== 'ฝ่ายขาย & ปฏิบัติการ' && 
            w.name !== 'ครอบครัวชาวเรา'
        );
        localStorage.setItem('NEWYEAR_WISHES_2027', JSON.stringify(localWishes));
    } catch (e) {}

    localWishes.forEach(item => {
        handleIncomingWish(item, false);
    });

    // 2. ดึงจาก Google Sheets (ถ้ามีการตั้งค่า GOOGLE_SHEET_URL)
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.trim() !== "") {
        fetch(GOOGLE_SHEET_URL)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        handleIncomingWish({
                            mode: item.mode || 'float',
                            name: item.name,
                            msg: item.msg,
                            sticker: item.sticker || item.design || '1.png'
                        }, false);
                    });
                }
            })
            .catch(() => {});
    }
}

// ================= CELEBRATION STAGE INITIALIZER =================
function startCelebrationArena() {
    createAmbientAtmosphere();
    initAudio();

    // Render Corner QR Code
    const qrCorner = document.getElementById('corner-qrcode');
    if (qrCorner) {
        renderQrCode('corner-qrcode', getMobileSelectUrl(), 105);
    }

    // โหลดข้อมูลคำอวยพร
    loadCelebrationWishes();

    // จุดพลุต่อเนื่องอัตโนมัติทุกๆ 3.8 วินาที
    setInterval(() => {
        launchRealisticFirework();
    }, 3800);

    // ตรวจสอบข้อมูลใหม่จาก Google Sheets ทุก 6 วินาที
    if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.trim() !== "") {
        setInterval(() => {
            fetch(GOOGLE_SHEET_URL)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            handleIncomingWish({
                                mode: item.mode || 'float',
                                name: item.name,
                                msg: item.msg,
                                sticker: item.sticker || item.design || '1.png'
                            }, false);
                        });
                    }
                })
                .catch(() => {});
        }, 6000);
    }

    // คลิกบนหน้าจอเพื่อจุดพลุ
    window.addEventListener('click', (e) => {
        if (e.target.closest('.hud-controls') || e.target.closest('.qr-corner') || e.target.closest('.hud-header')) return;
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;
        initAudio();
        launchRealisticFirework(xPercent, yPercent);
    });
}

// สลับโหมดเต็มจอ
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

// Auto Initialize
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;
    if (pageId === 'animation-page') {
        startCelebrationArena();
    } else if (pageId === 'form-page') {
        initFormPage();
    } else {
        createAmbientAtmosphere();
    }
});

const CATEGORY_LABEL = {
  love: 'ความรัก', study: 'การเรียน', work: 'การทำงาน',
  money: 'การเงิน', general: 'ดวงชะตาภาพรวม'
};

const POSITIONS = [
  { icon: '🔮', title: 'เจ้าชะตา', desc: 'ตัวคุณ บุคลิก พลังงานในตัว' },
  { icon: '🌙', title: 'สถานการณ์', desc: 'สิ่งที่กำลังเผชิญ ปัจจัยรอบข้าง' },
  { icon: '⭐', title: 'บทสรุป', desc: 'ผลลัพธ์ คำชี้แนะ' }
];

const POSITIONS_FUTURE = [
  { icon: '🌅', title: 'อดีต', desc: 'สิ่งที่ผ่านมา ประสบการณ์ที่ส่งผลถึงปัจจุบัน' },
  { icon: '🌙', title: 'ปัจจุบัน', desc: 'สิ่งที่เกิดขึ้นตอนนี้ สถานการณ์ปัจจุบัน' },
  { icon: '✨', title: 'อนาคต', desc: 'สิ่งที่จะเกิดขึ้น 1-3 เดือน แนวโลคที่อาจเป็น' }
];

// Keywords สำหรับ detect คำถามเชิงอนาคต
const FUTURE_KEYWORDS = [
  'จะ', 'ไหม', 'มั้ย', 'อนาคต', 'หน้า', 'ต่อไป', 'รุ่ง',
  'เป้า', 'ทัน', 'ได้', 'เป็นยังไง', 'ผล',
  'รอด', 'สำเร็จ', 'ชนะ', 'ไปต่อ', 'แต่ง', 'รับ'
];

let selectedCategory = null;
let userQuestion = '';
let drawnCards = [];
let currentDrawIndex = 0;
let currentSpreadType = 'default';
let TAROT_DATA = null;
// shuffled order ที่ใช้ระหว่าง draw — เก็บไว้เพื่อใช้ตอนตัดไพ่
let currentShuffledIds = [];

function isFutureQuestion(question) {
  if (!question) return false;
  const lowerQ = question.toLowerCase();
  return FUTURE_KEYWORDS.some(keyword => lowerQ.includes(keyword));
}

function getCurrentPositions() {
  return currentSpreadType === 'future' ? POSITIONS_FUTURE : POSITIONS;
}

function createStarfield() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.2 + 0.5;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDuration = (Math.random() * 3 + 2) + 's';
    s.style.animationDelay = (Math.random() * 5) + 's';
    sf.appendChild(s);
  }
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToCategory() { showSection('section-category'); }

function goToShuffle() {
  if (!selectedCategory) return;
  userQuestion = document.getElementById('questionInput').value.trim();

  currentSpreadType = isFutureQuestion(userQuestion) ? 'future' : 'default';

  drawnCards = [];
  currentDrawIndex = 0;

  showSection('section-shuffle');
  createShuffleAnimation();
  createShuffleParticles();

  // Auto advance to draw section after 3 seconds
  setTimeout(() => goToDraw(), 3000);
}

function createShuffleAnimation() {
  const deck = document.getElementById('shuffleDeck');
  if (!deck) return;

  deck.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'shuffle-card';
    card.innerHTML = cardBackSVG();
    deck.appendChild(card);
  }
}

function createShuffleParticles() {
  const particles = document.getElementById('shuffleParticles');
  if (!particles) return;

  particles.innerHTML = '';
  // สร้าง particles แบบสุ่มกระจายรอบ deck
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'shuffle-particle';

    // สุ่มทิศทาง (มุมรอบ deck)
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    p.style.left = '50%';
    p.style.top = '50%';
    p.style.setProperty('--tx', tx + 'px');
    p.style.setProperty('--ty', ty + 'px');
    p.style.animationDelay = (Math.random() * 3) + 's';
    p.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';

    particles.appendChild(p);
  }
}

// เข้า section-draw แล้วกางพัดทันที + แสดงปุ่มตัดไพ่
function goToDraw() {
  prepareShuffledOrder();

  // แสดง fan + draw status + ปุ่มตัดไพ่
  document.getElementById('fanContainer').style.display = 'block';
  document.getElementById('drawStatus').style.display = 'block';
  document.getElementById('cutButtonWrap').classList.remove('hidden');
  document.getElementById('cutOverlay').classList.remove('active', 'piles-visible', 'show-instruction');

  showSection('section-draw');
  buildFan(currentShuffledIds, /* clickable */ true);
  updateDrawStatus();
}

// เตรียม shuffled order
function prepareShuffledOrder() {
  if (!TAROT_DATA) {
    console.error('Tarot data not loaded yet');
    return;
  }
  const shuffled = TAROT_DATA.cards.map(c => c.id);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  currentShuffledIds = shuffled;
}

// ==========================================
// CUT DECK ANIMATION
// ==========================================

// เริ่ม animation ตัดไพ่: ซ่อนปุ่ม → รวมไพ่ → แสดง cut stack → แยก 2 กอง → auto-pick
async function startCutAnimation() {
  // ซ่อนปุ่มตัดไพ่
  document.getElementById('cutButtonWrap').classList.add('hidden');

  // รวมไพ่ทั้งหมดกลับเข้ากองตรงกลาง
  await collapseFanToStack();

  // แสดง cut overlay + cut stack
  showCutStack();
  await sleep(400);

  // เรืองแสง
  const cutStack = document.getElementById('cutStack');
  cutStack.classList.add('glowing');
  await sleep(800);
  cutStack.classList.remove('glowing');

  // ซ่อน cut stack แล้วแยกออกเป็น 2 กอง
  cutStack.style.opacity = '0';
  await sleep(200);
  cutStack.style.display = 'none';

  // แสดง 2 กอง (ไม่ต้องแสดง instruction เพราะจะ auto-pick)
  showCutPilesWithoutInstruction();
  await sleep(1200);

  // AUTO-PICK: กองล่าง flip ขึ้นทับกองบน (ตามธรรมเนียม)
  await autoCutDeck();
}

// แสดง 2 กองโดยไม่แสดง instruction (เพราะจะ auto-pick)
function showCutPilesWithoutInstruction() {
  const overlay = document.getElementById('cutOverlay');

  // เตรียมไพ่ในแต่ละ pile
  const topCards = document.getElementById('cutPileTopCards');
  const bottomCards = document.getElementById('cutPileBottomCards');

  topCards.innerHTML = '';
  bottomCards.innerHTML = '';

  // ใส่ไพ่ 8 ใบในแต่ละกอง (ให้ดูเป็นกองหนาๆ)
  for (let i = 0; i < 8; i++) {
    const t = document.createElement('div');
    t.className = 'stack-card';
    t.style.zIndex = 8 - i;
    t.innerHTML = cardBackSVG();
    topCards.appendChild(t);

    const b = document.createElement('div');
    b.className = 'stack-card';
    b.style.zIndex = 8 - i;
    b.innerHTML = cardBackSVG();
    bottomCards.appendChild(b);
  }

  // reset state
  document.getElementById('cutPileTop').classList.remove('selected', 'unselected', 'selected-merging');
  document.getElementById('cutPileBottom').classList.remove('selected', 'unselected', 'selected-merging');

  // แสดง piles (ไม่แสดง instruction)
  overlay.classList.add('piles-visible');
}

// Auto-pick: กองล่าง flip ขึ้นทับกองบน → รวม → กางใหม่
async function autoCutDeck() {
  const topPile = document.getElementById('cutPileTop');
  const bottomPile = document.getElementById('cutPileBottom');
  const overlay = document.getElementById('cutOverlay');

  // กองล่างเลือก (flip ขึ้นมาวางบน)
  bottomPile.classList.add('selected-merging');
  topPile.classList.add('unselected');

  // ตัดไพ่: กองล่างขึ้นบน (ตามธรรมเนียม)
  cutDeckOrder('bottom');

  // รอ merge animation
  await sleep(800);

  // ซ่อน overlay
  overlay.classList.remove('active', 'piles-visible', 'show-instruction');

  // กางพัดใหม่พร้อม animation expand
  await sleep(200);
  buildFan(currentShuffledIds, /* clickable */ true, /* withExpandAnim */ true);
  updateDrawStatus();
}

// รวมพัดกลับเข้ากองตรงกลาง
function collapseFanToStack() {
  return new Promise(resolve => {
    const wrap = document.getElementById('fanWrap');
    const cards = wrap.querySelectorAll('.tarot-card');

    cards.forEach((card, idx) => {
      // animate ทีละใบ stagger เล็กน้อย
      const delay = idx * 8; // 8ms per card
      setTimeout(() => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.5s ease';
        card.style.transform = 'translate(0, 0) rotate(0deg) scale(0.8)';
        card.style.opacity = '0';
      }, delay);
    });

    // รอให้ animation จบ
    setTimeout(() => {
      wrap.innerHTML = '';
      resolve();
    }, cards.length * 8 + 600);
  });
}

// แสดง cut stack ที่ตรงกลาง (กองรวม)
function showCutStack() {
  const overlay = document.getElementById('cutOverlay');
  const stack = document.getElementById('cutStack');

  overlay.classList.add('active');
  stack.style.display = 'block';
  stack.style.opacity = '1';
  stack.innerHTML = '';

  // ใส่ไพ่หลายๆ ใบซ้อนกัน (ให้ดูเป็นกองหนาๆ)
  const stackSize = 15;
  for (let i = 0; i < stackSize; i++) {
    const card = document.createElement('div');
    card.className = 'cut-stack-card';
    // offset แต่ละใบเล็กๆ ให้ดูเป็นกองธรรมชาติ
    const offset = i * 0.3;
    card.style.transform = `translate(${-offset}px, ${-offset}px)`;
    card.style.zIndex = i;
    card.innerHTML = cardBackSVG();
    stack.appendChild(card);
  }
}

// ตัดสำรับไพ่ (ใช้ใน auto-pick)
// 'bottom' = กองล่างขึ้นบน (สลับ ตามธรรมเนียมหมอดู)
function cutDeckOrder(choice) {
  const mid = Math.floor(currentShuffledIds.length / 2);
  const topHalf = currentShuffledIds.slice(0, mid);
  const bottomHalf = currentShuffledIds.slice(mid);

  if (choice === 'bottom') {
    // สลับ: เอากองล่างขึ้นบน
    currentShuffledIds = bottomHalf.concat(topHalf);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// FAN BUILDER
// ==========================================

function buildFan(cardIds, clickable = true, withExpandAnim = false) {
  if (!TAROT_DATA) {
    console.error('Tarot data not loaded yet');
    return;
  }

  const wrap = document.getElementById('fanWrap');
  wrap.innerHTML = '';
  wrap.classList.remove('collapsing', 'expanding');

  const ids = cardIds || currentShuffledIds;
  const totalCards = ids.length;

  // Responsive radius & angle
  const vw = window.innerWidth;
  const radius = vw > 1024 ? 220 : vw > 768 ? 160 : vw > 480 ? 115 : 95;
  const angleSpread = vw < 480 ? 100 : 140;
  const angleStart = -angleSpread / 2;
  const angleStep = angleSpread / (totalCards - 1);

  ids.forEach((cardId, idx) => {
    const angle = angleStart + angleStep * idx;
    const rad = angle * (Math.PI / 180);
    const x = Math.sin(rad) * radius;
    const y = Math.cos(rad) * radius;

    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card';
    cardEl.dataset.id = cardId;
    cardEl.style.zIndex = idx;
    cardEl.style.setProperty('--rot', angle + 'deg');

    const finalTransform = `translate(${x}px, ${-y}px) rotate(${angle}deg)`;

    if (withExpandAnim) {
      // เริ่มจากตรงกลาง opacity 0 → animate ไปตำแหน่งจริง
      cardEl.style.transform = 'translate(0, 0) rotate(0deg) scale(0.7)';
      cardEl.style.opacity = '0';
      cardEl.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.5s ease';

      // stagger expand
      setTimeout(() => {
        cardEl.style.transform = finalTransform;
        cardEl.style.opacity = '1';
      }, idx * 6 + 50);

      // หลัง animation เสร็จ ลบ transition พิเศษ → ให้กลับไปใช้ของ CSS default
      setTimeout(() => {
        cardEl.style.transition = '';
      }, idx * 6 + 900);
    } else {
      cardEl.style.transform = finalTransform;
    }

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">${cardBackSVG()}</div>
      </div>
    `;

    if (clickable) {
      cardEl.addEventListener('click', () => onCardPick(cardEl, cardId));
    } else {
      cardEl.style.cursor = 'default';
    }
    wrap.appendChild(cardEl);
  });
}

function cardBackSVG() {
  return `
    <svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#4a1f7a" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#2a0d4a" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#0a0014" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="gold-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd700" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#d4af37" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#ffd700" stop-opacity="0.3"/>
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="56" height="86" rx="4" fill="url(#bg-grad)"
            stroke="#d4af37" stroke-width="0.8"/>
      <rect x="5" y="5" width="50" height="80" rx="2" fill="none"
            stroke="url(#gold-shine)" stroke-width="0.5"/>

      <g transform="translate(30, 45)">
        <circle cx="0" cy="0" r="18" fill="none"
                stroke="#d4af37" stroke-width="0.4" opacity="0.4"/>
        <circle cx="0" cy="0" r="14" fill="none"
                stroke="#d4af37" stroke-width="0.3" opacity="0.3"/>
        <path d="M 0 -22 L 2.5 -6 L 22 0 L 2.5 6 L 0 22 L -2.5 6 L -22 0 L -2.5 -6 Z"
              fill="#d4af37" opacity="0.9"/>
        <circle cx="0" cy="0" r="7" fill="#0a0014"
                stroke="#ffd700" stroke-width="0.8"/>
        <ellipse cx="0" cy="0" rx="4" ry="2.3" fill="#ffd700"/>
        <circle cx="0" cy="0" r="1.2" fill="#0a0014"/>
        <circle cx="0" cy="0" r="10" fill="none"
                stroke="#ffd700" stroke-width="0.4" opacity="0.5"/>
      </g>

      <g fill="#d4af37" opacity="0.65">
        <circle cx="8" cy="10" r="1.2"/>
        <circle cx="52" cy="10" r="1.2"/>
        <circle cx="8" cy="80" r="1.2"/>
        <circle cx="52" cy="80" r="1.2"/>
      </g>

      <g fill="#d4af37" opacity="0.5" font-size="5">
        <text x="10" y="16">✧</text>
        <text x="45" y="16">✧</text>
        <text x="10" y="76">✧</text>
        <text x="45" y="76">✧</text>
      </g>

      <g stroke="#d4af37" stroke-width="0.3" opacity="0.4" fill="none">
        <path d="M 2 8 L 8 2 L 12 2"/>
        <path d="M 58 8 L 52 2 L 48 2"/>
        <path d="M 2 82 L 8 88 L 12 88"/>
        <path d="M 58 82 L 52 88 L 48 88"/>
      </g>

      <line x1="30" y1="20" x2="30" y2="70"
            stroke="#d4af37" stroke-width="0.25" opacity="0.25"/>
    </svg>
  `;
}

function onCardPick(cardEl, cardId) {
  if (cardEl.classList.contains('selected')) return;
  if (currentDrawIndex >= 3) return;

  const card = TAROT_DATA.cards.find(c => c.id === cardId);
  drawnCards.push(card);
  cardEl.classList.add('selected');
  currentDrawIndex++;

  if (currentDrawIndex < 3) {
    setTimeout(() => updateDrawStatus(), 400);
  } else {
    setTimeout(() => showResult(), 800);
  }
}

function updateDrawStatus() {
  const positions = getCurrentPositions();
  const pos = positions[currentDrawIndex];
  document.getElementById('drawPosition').textContent =
    `${pos.icon} ใบที่ ${currentDrawIndex + 1}: ${pos.title}`;
  document.getElementById('drawDesc').textContent = pos.desc;
  const dots = document.querySelectorAll('#drawProgress .progress-dot');
  dots.forEach((d, i) => {
    d.className = 'progress-dot';
    if (i < currentDrawIndex) d.classList.add('done');
    else if (i === currentDrawIndex) d.classList.add('active');
  });
}

function showResult() {
  const positions = getCurrentPositions();
  const sub = document.getElementById('resultSubtitle');
  let subText = `หมวด: ${CATEGORY_LABEL[selectedCategory]}`;
  if (userQuestion) subText += ` · "${userQuestion}"`;
  sub.textContent = subText;

  const cardsEl = document.getElementById('selectedCardsDisplay');
  cardsEl.innerHTML = drawnCards.map((card, i) => `
    <div class="selected-card-wrap">
      <div class="selected-card-display">
        <img src="${card.image}" alt="${card.nameEn}" loading="lazy">
      </div>
      <div class="selected-card-name">${card.nameTh}</div>
      <div class="selected-card-name-en">${card.nameEn}</div>
      <div class="position-label">${positions[i].icon} ${positions[i].title}</div>
    </div>
  `).join('');

  const readings = document.getElementById('readingsContainer');
  let html = '';
  drawnCards.forEach((card, i) => {
    const meaning = card.meanings[selectedCategory];
    html += `
      <div class="reading-block">
        <div class="reading-header">
          <span class="reading-icon">${positions[i].icon}</span>
          <div class="reading-title">${positions[i].title}</div>
          <div class="reading-card-name">
            ${card.nameTh}
            <span class="en">${card.nameEn}</span>
          </div>
        </div>
        <div class="reading-text">${meaning}</div>
      </div>
    `;
  });

  const summary = generateSummary(drawnCards, selectedCategory);
  html += `
    <div class="reading-block reading-summary-block">
      <div class="reading-header">
        <span class="reading-icon">✨</span>
        <div class="reading-title">คำพยากรณ์รวม</div>
      </div>
      <div class="reading-text">${summary}</div>
    </div>
  `;

  readings.innerHTML = html;
  showSection('section-result');
}

function generateSummary(cards, category) {
  let majorCount = 0;
  const suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  cards.forEach(c => {
    if (c.arcana === 'major') majorCount++;
    else if (c.suit) suitCount[c.suit]++;
  });

  const parts = [];
  if (majorCount === 3) {
    parts.push('ไพ่ Major Arcana ทั้ง 3 ใบบ่งชี้ว่าช่วงเวลานี้คือจุดเปลี่ยนครั้งสำคัญในชีวิต พลังจักรวาลกำลังขับเคลื่อนเรื่องราวที่ลึกซึ้งและมีความหมายเกินกว่าเรื่องธรรมดา');
  } else if (majorCount === 2) {
    parts.push('ไพ่ Major Arcana 2 ใบสะท้อนว่าช่วงนี้คือจุดเปลี่ยนสำคัญ มีพลังจากเบื้องบนกำลังนำทางคุณ');
  } else if (majorCount === 1) {
    parts.push('ไพ่ Major Arcana 1 ใบที่ปรากฏชี้ว่ามีบทเรียนสำคัญหนึ่งอย่างกำลังเข้ามาในชีวิต');
  } else {
    parts.push('ไพ่ Minor Arcana ทั้งหมดบ่งบอกว่าเรื่องราวขณะนี้เป็นเรื่องในชีวิตประจำวัน ที่คุณมีอำนาจในการกำหนดทิศทางได้ด้วยตนเอง');
  }

  const suitMessages = {
    wands: 'พลังแห่งไฟลุกโชนชัดเจน เรื่องนี้เกี่ยวพันกับความหลงใหล แรงบันดาลใจ และการกระทำที่มีพลัง',
    cups: 'ธาตุน้ำหลั่งไหลเป็นแกนหลัก เรื่องราวนี้สั่นสะเทือนถึงอารมณ์ ความรัก และจิตใจอันลึกซึ้ง',
    swords: 'ลมแห่งความคิดพัดผ่านทุกประเด็น คุณกำลังเผชิญเรื่องที่ต้องใช้ปัญญา การตัดสินใจ และสัจจะ',
    pentacles: 'ธาตุดินมั่นคงโดดเด่น เรื่องนี้แตะถึงรากฐานของชีวิต ทรัพย์สิน หน้าที่การงาน และความมั่นคงทางวัตถุ'
  };

  const dominantSuit = Object.entries(suitCount).find(([s, c]) => c >= 2);
  if (dominantSuit) {
    parts.push(suitMessages[dominantSuit[0]]);
  } else if (Object.values(suitCount).filter(v => v > 0).length >= 2) {
    parts.push('ไพ่จากหลายธาตุปรากฏพร้อมกัน แสดงให้เห็นว่าเรื่องนี้มีหลายมิติเกี่ยวพันกัน ต้องมองหลายด้านและสมดุลพลังงานทั้งหมด');
  }

  const categoryAdvice = {
    love: 'จงเปิดใจรับสัญญาณจากจักรวาล ความรักที่แท้จริงต้องอาศัยทั้งความกล้าหาญและความอ่อนโยน',
    study: 'ความรู้ที่แสวงหาด้วยใจรักจะเปิดประตูสู่ปัญญาที่ลึกซึ้ง อย่าเร่งรีบให้ทุกขั้นตอนได้สอนคุณ',
    work: 'เส้นทางอาชีพคือการเดินทางอันยาวไกล ก้าวที่มั่นคงและซื่อตรงต่อตนเองคือกุญแจสำคัญ',
    money: 'ความมั่งคั่งที่ยั่งยืนเริ่มจากความสมดุลระหว่างการให้และการรับ จงรู้คุณค่าของสิ่งที่มี',
    general: 'จักรวาลกำลังจัดเรียงสิ่งต่างๆ ให้เข้าที่ จงไว้วางใจใจจังหวะของชีวิตและฟังเสียงจากภายใน'
  };
  parts.push(categoryAdvice[category]);

  return parts.join(' ');
}

function resetAll() {
  selectedCategory = null;
  userQuestion = '';
  drawnCards = [];
  currentDrawIndex = 0;
  currentSpreadType = 'default';
  currentShuffledIds = [];
  document.getElementById('questionInput').value = '';
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btnStartDraw').disabled = true;

  // reset draw section state
  document.getElementById('cutButtonWrap').classList.remove('hidden');
  document.getElementById('drawStatus').style.display = 'none';
  document.getElementById('fanContainer').style.display = 'none';
  document.getElementById('cutOverlay').classList.remove('active', 'piles-visible', 'show-instruction');
  const cutStack = document.getElementById('cutStack');
  if (cutStack) {
    cutStack.style.display = 'block';
    cutStack.style.opacity = '1';
  }

  showSection('section-landing');
}

// Load tarot data from JSON file
async function loadTarotData() {
  try {
    const response = await fetch('tarot-all.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    TAROT_DATA = await response.json();
    console.log('Tarot data loaded successfully:', TAROT_DATA.cards.length, 'cards');
  } catch (error) {
    console.error('Error loading tarot data:', error);
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: 'Noto Serif Thai', serif; color: #f5e6d3;">
        <h1 style="color: #d4af37; margin-bottom: 20px;">ขออภัย</h1>
        <p style="font-size: 1.2rem;">ไม่สามารถโหลดข้อมูลไพ่ทาโรต์ได้</p>
        <p style="margin-top: 20px; opacity: 0.7;">กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ</p>
      </div>
    `;
  }
}

// ========================
// Share Image Feature
// ========================

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

async function generateShareImage() {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 600));

  const scale = 2;
  const w = 1080, h = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const bg = ctx.createRadialGradient(w/2, h/2, 200, w/2, h/2, 800);
  bg.addColorStop(0, '#2a0047');
  bg.addColorStop(0.5, '#150024');
  bg.addColorStop(1, '#0a0010');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const drawStar = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.4+0.4})`;
    ctx.fill();
  };
  for (let i = 0; i < 70; i++) {
    drawStar(Math.random()*w, Math.random()*h, Math.random()*1.5+0.5);
  }

  const mx = 940, my = 85, mr = 50;
  const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr*3);
  mg.addColorStop(0, 'rgba(255,215,0,0.4)');
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(mx, my, mr*3, 0, Math.PI*2); ctx.fill();

  const mb = ctx.createRadialGradient(mx-10, my-10, 0, mx, my, mr);
  mb.addColorStop(0, '#ffffd8');
  mb.addColorStop(0.7, '#ffd700');
  mb.addColorStop(1, '#c9a227');
  ctx.fillStyle = mb;
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI*2); ctx.fill();

  ctx.save();
  ctx.shadowColor = 'rgba(255,215,0,0.7)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffe44d';
  ctx.font = 'bold 60px "Cinzel","Georgia",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('พยากรณ์แห่งดวงดาว', w/2, 72);
  ctx.restore();

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 105);
  ctx.lineTo(930, 105);
  ctx.stroke();

  ctx.fillStyle = 'rgba(212,175,55,0.2)';
  ctx.beginPath();
  ctx.roundRect(w/2 - 130, 120, 260, 40, 20);
  ctx.fill();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 26px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CATEGORY_LABEL[selectedCategory], w/2, 142);

  const cw = 210;
  const ch = 336;
  const gap = 35;
  const totalWidth = (cw * 3) + (gap * 2);
  const startX = (w - totalWidth) / 2;
  const cy = 200;

  try {
    const imgs = await Promise.all(drawnCards.map(c => loadImage(c.image)));
    const pos = getCurrentPositions();

    imgs.forEach((img, i) => {
      const cx = startX + (i * (cw + gap));

      const gg = ctx.createRadialGradient(cx + cw/2, cy + ch/2, 0, cx + cw/2, cy + ch/2, 180);
      gg.addColorStop(0, 'rgba(147,51,234,0.25)');
      gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg;
      ctx.fillRect(cx - 50, cy - 50, cw + 100, ch + 100);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(cx + 12, cy + 12, cw, ch);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 3, cy - 3, cw + 6, ch + 6);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cw, ch);

      ctx.drawImage(img, cx, cy, cw, ch);

      ctx.fillStyle = 'rgba(10,0,20,0.9)';
      ctx.beginPath();
      ctx.roundRect(cx - 12, cy + ch + 8, cw + 24, 40, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,175,55,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f5e6d3';
      ctx.font = 'bold 20px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drawnCards[i].nameTh, cx + cw/2, cy + ch + 30);

      const iy = cy + ch + 62;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 17px "Noto Serif Thai","Thonburi","Microsoft Sans Serif",sans-serif';
      ctx.fillText(`${pos[i].icon} ${pos[i].title}`, cx + cw/2, iy);
    });

    const fy = h - 75;

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(170, fy);
    ctx.lineTo(910, fy);
    ctx.stroke();

    const drawDiamond = (x, y, s) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      ctx.fill();
    };

    ctx.fillStyle = '#ffd700';
    drawDiamond(w/2, fy, 10);
    ctx.fillStyle = '#d4af37';
    drawDiamond(w/2 - 50, fy, 6);
    drawDiamond(w/2 + 50, fy, 6);

    drawStar(300, fy, 3);
    drawStar(780, fy, 3);

    ctx.fillStyle = 'rgba(212,175,55,0.4)';
    ctx.font = '18px "Cinzel","Georgia",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ thanatvij.github.io ✦', w/2, fy + 35);

    const drawCorner = (x, y, r) => {
      ctx.strokeStyle = 'rgba(212,175,55,0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + r + 5, y);
      ctx.lineTo(x + r + 30, y);
      ctx.moveTo(x, y + r + 5);
      ctx.lineTo(x, y + r + 30);
      ctx.stroke();
    };

    drawCorner(40, 40, 8);
    drawCorner(w-40, 40, 8);
    drawCorner(40, h-40, 8);
    drawCorner(w-40, h-40, 8);

    return canvas;
  } catch (error) {
    console.error('Error generating share image:', error);
    throw error;
  }
}

async function shareResult() {
  const btn = document.getElementById('btnShare');
  if (!btn) return;

  const originalText = btn.textContent;
  btn.textContent = 'กำลังสร้างภาพ...';
  btn.disabled = true;

  try {
    const canvas = await generateShareImage();
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    });

    const fileName = `tarot-${Date.now()}.png`;

    if (navigator.canShare && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'พยากรณ์แห่งดวงดาว',
          text: `ผลการอ่านไพ่ทาโรต์ - ${CATEGORY_LABEL[selectedCategory]}`
        });
      } catch (shareError) {
        console.log('Share cancelled or failed, downloading instead');
        downloadImage(blob, fileName);
      }
    } else {
      downloadImage(blob, fileName);
    }
  } catch (error) {
    console.error('Error sharing image:', error);
    alert('ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function downloadImage(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTarotData();
  createStarfield();
  initCardOfDay();
  initZodiacModal();
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCategory = card.dataset.category;
      document.getElementById('btnStartDraw').disabled = false;
    });
  });

  const shareBtn = document.getElementById('btnShare');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareResult);
  }
});

// Rebuild fan เมื่อหมุนมือถือ (เฉพาะกรณี fan แสดงอยู่ปกติ ไม่ใช่ระหว่างตัดไพ่)
window.addEventListener('resize', () => {
  const drawSection = document.getElementById('section-draw');
  const fanContainer = document.getElementById('fanContainer');
  const cutOverlay = document.getElementById('cutOverlay');

  if (drawSection.classList.contains('active') &&
      fanContainer.style.display !== 'none' &&
      !cutOverlay.classList.contains('active') &&
      currentShuffledIds.length > 0) {
    buildFan(currentShuffledIds, true, false);
  }
});

// ========================================================================
// WIDGET 1: CARD OF THE DAY
// ========================================================================

function initCardOfDay() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 +
               (today.getMonth() + 1) * 100 +
               today.getDate();
  const cardIndex = seed % 78;
  const card = TAROT_DATA.cards[cardIndex];

  // Format date as DD/MM/YYYY
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  document.getElementById('cardDayLabel').textContent = `ไพ่แห่งวันที่ ${day}/${month}/${year}`;
  document.getElementById('cardDayImg').src = card.image;
  document.getElementById('cardDayImg').alt = card.nameTh;
  document.getElementById('cardDayNameTh').textContent = card.nameTh;
  document.getElementById('cardDayNameEn').textContent = card.nameEn;

  const meaningDiv = document.getElementById('cardDayMeaning');
  meaningDiv.innerHTML = `<div class="widget-card-day-meaning-text">${card.meanings.general}</div>`;

  // Show widget
  document.getElementById('widgetCardDay').style.display = 'block';
}

function toggleCardDayMeaning() {
  const meaningDiv = document.getElementById('cardDayMeaning');
  const toggleBtn = document.getElementById('cardDayToggle');

  if (meaningDiv.classList.contains('expanded')) {
    meaningDiv.classList.remove('expanded');
    toggleBtn.textContent = 'ดูความหมาย';
  } else {
    meaningDiv.classList.add('expanded');
    toggleBtn.textContent = 'ซ่อนความหมาย';
  }
}

// ========================================================================
// WIDGET 2: ZODIAC CARD
// ========================================================================

const ZODIAC_TO_CARD = {
  'aries': { id: 4, symbol: '♈', name: 'เมษ' },
  'taurus': { id: 5, symbol: '♉', name: 'พฤษภ' },
  'gemini': { id: 6, symbol: '♊', name: 'เมถุน' },
  'cancer': { id: 7, symbol: '♋', name: 'กรกฎ' },
  'leo': { id: 8, symbol: '♌', name: 'สิงห์' },
  'virgo': { id: 9, symbol: '♍', name: 'กันย์' },
  'libra': { id: 11, symbol: '♎', name: 'ตุลย์' },
  'scorpio': { id: 13, symbol: '♏', name: 'พิจิก' },
  'sagittarius': { id: 14, symbol: '♐', name: 'ธนู' },
  'capricorn': { id: 15, symbol: '♑', name: 'มังกร' },
  'aquarius': { id: 17, symbol: '♒', name: 'กุมภ์' },
  'pisces': { id: 18, symbol: '♓', name: 'มีน' }
};

let selectedZodiac = null;

function initZodiacModal() {
  const grid = document.getElementById('zodiacGrid');
  grid.innerHTML = '';

  // Load saved zodiac from localStorage
  const savedZodiac = localStorage.getItem('tarot_zodiac');
  if (savedZodiac && ZODIAC_TO_CARD[savedZodiac]) {
    selectedZodiac = savedZodiac;
  }

  // Create zodiac options
  Object.entries(ZODIAC_TO_CARD).forEach(([key, zodiac]) => {
    const option = document.createElement('div');
    option.className = 'zodiac-option';
    if (selectedZodiac === key) {
      option.classList.add('selected');
    }
    option.innerHTML = `
      <div class="zodiac-symbol">${zodiac.symbol}</div>
      <div class="zodiac-name">${zodiac.name}</div>
    `;
    option.addEventListener('click', () => selectZodiac(key));
    grid.appendChild(option);
  });

  // Close modal on overlay click
  document.getElementById('zodiacModal').addEventListener('click', (e) => {
    if (e.target.id === 'zodiacModal') {
      closeZodiacModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeZodiacModal();
    }
  });
}

function openZodiacModal() {
  document.getElementById('zodiacModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeZodiacModal() {
  document.getElementById('zodiacModal').classList.remove('active');
  document.body.style.overflow = '';
  // Reset to grid view when closing
  setTimeout(() => {
    backToZodiacGrid();
  }, 300);
}

function selectZodiac(zodiacKey) {
  selectedZodiac = zodiacKey;
  localStorage.setItem('tarot_zodiac', zodiacKey);

  // Update selected styling
  document.querySelectorAll('.zodiac-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');

  // Show result
  showZodiacResult(zodiacKey);
}

function showZodiacResult(zodiacKey) {
  const zodiac = ZODIAC_TO_CARD[zodiacKey];
  const card = TAROT_DATA.cards[zodiac.id];

  document.getElementById('zodiacResultImg').src = card.image;
  document.getElementById('zodiacResultImg').alt = card.nameTh;
  document.getElementById('zodiacResultNameTh').textContent = card.nameTh;
  document.getElementById('zodiacResultNameEn').textContent = card.nameEn;
  document.getElementById('zodiacResultMeaning').textContent = card.meanings.general;

  // Switch views
  document.getElementById('zodiacGridView').style.display = 'none';
  document.getElementById('zodiacResultView').style.display = 'block';
}

function backToZodiacGrid() {
  document.getElementById('zodiacResultView').style.display = 'none';
  document.getElementById('zodiacGridView').style.display = 'block';
}
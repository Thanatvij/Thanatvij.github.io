// Tarot Guide JavaScript

// Global state
let tarotData = null;
let currentSuit = 'wands';

// Category labels in Thai
const CATEGORY_LABELS = {
  love: 'ความรัก',
  study: 'การเรียน',
  work: 'การทำงาน',
  money: 'การเงิน',
  general: 'ดวงชะตาภาพรวม'
};

// Position meanings for spreads
const POSITION_MEANINGS = {
  single: {
    title: 'คำตอบของวันนี้',
    text: 'ไพ่ใบนี้แทนสาระสำคัญของวันนี้ หรือคำตอบสำหรับคำถามที่คุณถาม'
  },
  past: {
    title: 'อดีต',
    text: 'สิ่งที่ผ่านมาที่ส่งผลถึงปัจจุบัน ประสบการณ์หรือเหตุการณ์ที่ควรนึกถึง'
  },
  present: {
    title: 'ปัจจุบัน',
    text: 'สถานการณ์ที่เกิดขึ้นตอนนี้ สิ่งที่คุณกำลังเผชิญหรือรู้สึกอยู่'
  },
  future: {
    title: 'อนาคต',
    text: 'สิ่งที่อาจจะเกิดขึ้นในอนาคต (1-3 เดือน) แนวโลคที่อาจเป็นไปได้'
  },
  'present-cross': {
    title: 'สถานการณ์ปัจจุบัน',
    text: 'ศูนย์กลางของเรื่องราว สิ่งที่คุณกำลังเผชิญในขณะนี้'
  },
  challenge: {
    title: 'อุปสรรค',
    text: 'สิ่งที่ขัดขวาง หรือปัญหาที่ต้องเผชิญในเรื่องนี้'
  },
  'past-cross': {
    title: 'อดีตที่ผ่านมา',
    text: 'เหตุการณ์หรือปัจจัยในอดีตที่นำมาสู่สถานการณ์ปัจจุบัน'
  },
  'future-cross': {
    title: 'อนาคตที่จะเกิด',
    text: 'ผลลัพธ์ที่น่าจะเกิดขึ้นหากทุกอย่างดำเนินไปตามเส้นทางปัจจุบัน'
  },
  above: {
    title: 'ความคิดและความรู้สึก',
    text: 'สิ่งที่อยู่เหนือสำนึก ความคิด ความหวัง หรือสิ่งที่คุณมองข้าม'
  },
  below: {
    title: 'รากฐานและสิ่งที่ซ่อนอยู่',
    text: 'สิ่งที่อยู่ใต้ดิน ปัจจัยที่ซ่อนอยู่ หรืออิทธิพลที่คุณไม่ได้ตระหนัก'
  },
  staff1: {
    title: 'ความคิดเห็นของคุณ',
    text: 'มุมมองของคุณเองที่มีต่อสถานการณ์นี้'
  },
  staff2: {
    title: 'ความคิดเห็นของคนรอบข้าง',
    text: 'มุมมองของผู้อื่นที่มีต่อสถานการณ์หรือปัญหานี้'
  },
  staff3: {
    title: 'ความหวังและความกลัว',
    text: 'สิ่งที่คุณหวังหรือกลัวในเรื่องนี้'
  },
  staff4: {
    title: 'ผลลัพธ์สุดท้าย',
    text: 'สิ่งที่จะเกิดขึ้นหากทุกอย่างดำเนินไปตามเส้นทางนี้'
  }
};

// Suit glyphs (elegant symbols, no emoji)
const SUIT_GLYPHS = {
  wands: '—',
  cups: '⌣',
  swords: '✕',
  pentacles: '◆'
};

// ========================
// Helper Functions
// ========================

// Convert number to Roman numerals (0-21)
function toRoman(num) {
  if (num === 0) return '0';
  if (num < 0 || num > 21) return '';

  const vals = [10, 9, 5, 4, 1];
  const syms = ['X', 'IX', 'V', 'IV', 'I'];
  let result = '';

  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

// Get card label (Roman numeral for Major, suit glyph for Minor)
function getCardLabel(card) {
  if (card.arcana === 'major') {
    return toRoman(card.id);
  }
  return SUIT_GLYPHS[card.suit] || '·';
}

// ========================
// Starfield Animation
// ========================
function createStarfield() {
  const sf = document.getElementById('starfield');
  if (!sf) {
    console.error('Starfield element not found');
    return;
  }

  sf.innerHTML = '';
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

// ========================
// Load Tarot Data
// ========================
async function loadTarotData() {
  try {
    console.log('Attempting to fetch tarot-all.json...');
    const response = await fetch('tarot-all.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    tarotData = await response.json();
    console.log('Tarot data loaded for guide:', tarotData.cards.length, 'cards');

    if (!tarotData.cards || tarotData.cards.length === 0) {
      throw new Error('No cards found in tarot data');
    }

    renderCards();
  } catch (error) {
    console.error('Error loading tarot data:', error);

    // Show visible error message on page
    const cardsSection = document.getElementById('cards');
    if (cardsSection) {
      cardsSection.innerHTML = `
        <div class="error-message" style="display: block;">
          <h3>ไม่สามารถโหลดข้อมูลไพ่ได้</h3>
          <p>กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ</p>
          <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 10px;">Error: ${error.message}</p>
        </div>
      `;
    } else {
      console.error('Could not find #cards element to show error');
    }
  }
}

// ========================
// Render Cards
// ========================
function renderCards() {
  if (!tarotData) {
    console.error('tarotData is null, cannot render cards');
    return;
  }

  try {
    // Render Major Arcana
    const majorGrid = document.getElementById('majorGrid');
    if (!majorGrid) {
      throw new Error('majorGrid element not found');
    }

    const majorCards = tarotData.cards.filter(card => card.arcana === 'major');
    console.log('Rendering Major Arcana:', majorCards.length, 'cards');
    majorGrid.innerHTML = majorCards.map(card => createCardHTML(card)).join('');

    // Render Minor Arcana (default to Wands)
    renderMinorCards('wands');

    // Setup lazy loading
    setupLazyLoading();
  } catch (error) {
    console.error('Error rendering cards:', error);
  }
}

function renderMinorCards(suit) {
  if (!tarotData) {
    console.error('tarotData is null, cannot render minor cards');
    return;
  }

  try {
    currentSuit = suit;

    const minorGrid = document.getElementById('minorGrid');
    if (!minorGrid) {
      throw new Error('minorGrid element not found');
    }

    const suitCards = tarotData.cards.filter(card => card.arcana === 'minor' && card.suit === suit);
    console.log(`Rendering ${suit} suit:`, suitCards.length, 'cards');
    minorGrid.innerHTML = suitCards.map(card => createCardHTML(card)).join('');

    // Re-setup lazy loading
    setupLazyLoading();
  } catch (error) {
    console.error('Error rendering minor cards:', error);
  }
}

function createCardHTML(card) {
  return `
    <div class="guide-card" data-id="${card.id}" tabindex="0">
      <div class="guide-card-image">
        <img data-src="${card.image}" alt="${card.nameEn}" class="lazy-image"
             onload="this.parentElement.classList.add('loaded')"
             onerror="console.error('Failed to load image:', '${card.image}'); this.parentElement.classList.add('error');">
      </div>
      <div class="guide-card-info">
        <div class="guide-card-symbol">${getCardLabel(card)}</div>
        <div class="guide-card-name-en">${card.nameEn}</div>
        <div class="guide-card-name-th">${card.nameTh}</div>
      </div>
    </div>
  `;
}

// ========================
// Lazy Loading Images
// ========================
function setupLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  console.log('Setting up lazy loading for', lazyImages.length, 'images');

  if (lazyImages.length === 0) {
    console.warn('No lazy images found');
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.classList.add('loaded');
        }

        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

// ========================
// Tab Switching
// ========================
function setupTabs() {
  // Arcana tabs
  const arcanTabs = document.querySelectorAll('.arcan-tab');
  console.log('Found', arcanTabs.length, 'arcan tabs');

  arcanTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      console.log('Switching to tab:', tabName);

      // Update active tab
      arcanTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      const targetContent = document.getElementById(`${tabName}-content`);
      if (targetContent) {
        targetContent.classList.add('active');
      } else {
        console.error('Tab content not found:', `${tabName}-content`);
      }
    });
  });

  // Suit tabs
  const suitTabs = document.querySelectorAll('.suit-tab');
  console.log('Found', suitTabs.length, 'suit tabs');

  suitTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const suit = tab.dataset.suit;
      console.log('Switching to suit:', suit);

      // Update active tab
      suitTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Render cards for suit
      renderMinorCards(suit);
    });
  });
}

// ========================
// Spread Diagrams
// ========================
function setupSpreadDiagrams() {
  const spreadButtons = document.querySelectorAll('.spread-btn');
  const spreadDiagrams = document.querySelectorAll('.spread-diagram');

  console.log('Setting up', spreadButtons.length, 'spread buttons');

  spreadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const spread = btn.dataset.spread;
      console.log('Switching to spread:', spread);

      // Update active button
      spreadButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show corresponding diagram
      spreadDiagrams.forEach(diagram => {
        diagram.classList.remove('active');
      });

      const targetDiagram = document.getElementById(`spread-${spread}`);
      if (targetDiagram) {
        targetDiagram.classList.add('active');
      }
    });
  });

  // Setup position tooltips
  const positionCards = document.querySelectorAll('.spread-card');
  const tooltip = document.getElementById('positionTooltip');

  console.log('Setting up tooltips for', positionCards.length, 'positions');

  positionCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const position = card.dataset.position;
      const meaning = POSITION_MEANINGS[position];

      if (meaning) {
        tooltip.querySelector('.tooltip-title').textContent = meaning.title;
        tooltip.querySelector('.tooltip-text').textContent = meaning.text;

        // Position tooltip near the card
        const rect = card.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        tooltip.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
        tooltip.style.top = `${rect.bottom + scrollTop + 10}px`;
        tooltip.classList.add('visible');
      }
    });
  });

  // Hide tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.spread-card')) {
      tooltip.classList.remove('visible');
    }
  });
}

// ========================
// Card Modal
// ========================
function setupModal() {
  const modal = document.getElementById('cardModal');
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');

  console.log('Setting up modal');

  // Close modal
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Card click handlers (delegated)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.guide-card');
    if (card && tarotData) {
      const cardId = parseInt(card.dataset.id);
      const cardData = tarotData.cards.find(c => c.id === cardId);
      if (cardData) {
        console.log('Opening modal for card:', cardData.nameEn);
        openModal(cardData);
      } else {
        console.error('Card not found with id:', cardId);
      }
    }
  });

  // Keyboard support for cards
  document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('guide-card') && (e.key === 'Enter' || e.key === ' ')) {
      const card = e.target;
      const cardId = parseInt(card.dataset.id);
      const cardData = tarotData.cards.find(c => c.id === cardId);
      if (cardData) {
        console.log('Opening modal for card via keyboard:', cardData.nameEn);
        openModal(cardData);
      }
    }
  });
}

function openModal(card) {
  const modal = document.getElementById('cardModal');

  console.log('Opening modal for:', card.nameEn);

  // Lock scroll without position:fixed (prevents layout jump)
  document.body.style.overflow = 'hidden';

  // Set image
  const modalImage = document.getElementById('modalCardImage');
  modalImage.src = card.image;
  modalImage.alt = card.nameEn;

  // Set titles
  document.getElementById('modalTitleTh').textContent = card.nameTh;
  document.getElementById('modalTitleEn').textContent = card.nameEn;
  document.getElementById('modalSymbol').textContent = getCardLabel(card);

  // Set meanings
  const meaningsContainer = document.getElementById('modalMeanings');
  meaningsContainer.innerHTML = Object.entries(card.meanings).map(([key, value]) => `
    <div class="meaning-item">
      <span class="meaning-category">${CATEGORY_LABELS[key]}</span>
      <p class="meaning-text">${value}</p>
    </div>
  `).join('');

  // Show modal
  modal.classList.add('active');
}

// ========================
// Smooth Scrolling
// ========================
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ========================
// Navigation Active State
// ========================
function setupNavHighlight() {
  const sections = document.querySelectorAll('.guide-section');
  const navLinks = document.querySelectorAll('.nav-link');

  console.log('Setting up nav highlight for', sections.length, 'sections');

  if (sections.length === 0 || navLinks.length === 0) {
    console.warn('No sections or nav links found for highlight');
    return;
  }

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ========================
// Scroll Reveal Animation
// ========================
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.guide-section');
  console.log('Setting up scroll reveal for', revealElements.length, 'elements');

  if (revealElements.length === 0) {
    console.warn('No reveal elements found');
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);

    // Check if already in viewport on page load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('revealed');
      console.log('Element already in viewport, adding revealed:', el.id || el.className);
    }
  });
}

// ========================
// Initialize
// ========================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== TAROT GUIDE PAGE INITIALIZING ===');

  // Create starfield
  createStarfield();
  console.log('✓ Starfield created');

  // Load tarot data
  await loadTarotData();
  console.log('✓ Tarot data load initiated');

  // Setup interactions
  setupTabs();
  console.log('✓ Tabs setup');

  setupSpreadDiagrams();
  console.log('✓ Spread diagrams setup');

  setupModal();
  console.log('✓ Modal setup');

  setupSmoothScroll();
  console.log('✓ Smooth scroll setup');

  setupNavHighlight();
  console.log('✓ Nav highlight setup');

  setupScrollReveal();
  console.log('✓ Scroll reveal setup');

  // Replace emoji suit tab labels with clean text
  const suitLabels = {
    wands: 'Wands',
    cups: 'Cups',
    swords: 'Swords',
    pentacles: 'Pentacles'
  };
  document.querySelectorAll('.suit-tab').forEach(tab => {
    const suit = tab.dataset.suit;
    if (suitLabels[suit]) {
      tab.textContent = suitLabels[suit];
    }
  });
  console.log('✓ Suit tabs updated (emoji removed)');

  console.log('=== TAROT GUIDE PAGE INITIALIZED ===');
});
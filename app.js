/**
 * Akshayakalpa Farm - Cow Feeding Mobile Web Game Logic
 * Storybook Cartoon Aesthetic & Responsive Interactive Engine
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Game State & Recipe Data
  // -------------------------------------------------------------------------
  const RECIPE_TARGETS = {
    hay: 1,
    maize: 1,
    gram_husk: 1,
    green_fodder: 1,
    groundnut_cake: 1,
    legumes: 1,
    rice_bran: 1,
    silage: 1,
    tree_fodder: 1,
    wheat_bran: 1
  };

  let TOTAL_REQUIRED_SCOOPS = 0;

  // Randomized ingredient amounts for each play session
  function generateRecipe() {
    Object.keys(RECIPE_TARGETS).forEach(type => {
      RECIPE_TARGETS[type] = 1 + Math.floor(Math.random() * 3); // 1–3 scoops each
    });
    TOTAL_REQUIRED_SCOOPS = Object.values(RECIPE_TARGETS).reduce((sum, n) => sum + n, 0);
    return TOTAL_REQUIRED_SCOOPS;
  }
  generateRecipe();

  const INGREDIENTS = {
    hay:             { name: 'Dry Fodder / Hay',     icon: 'assets/official-assets/food%20icons/dry%20fodder%20_%20hay.png' },
    maize:           { name: 'Maize Grain / Powder', icon: 'assets/official-assets/food%20icons/maize%20grain%20_%20powder.png' },
    gram_husk:       { name: 'Gram Husk',            icon: 'assets/official-assets/food%20icons/gram%20husk.png' },
    green_fodder:    { name: 'Green Fodder',         icon: 'assets/official-assets/food%20icons/green%20fodder.png' },
    groundnut_cake:  { name: 'Groundnut Cake',       icon: 'assets/official-assets/food%20icons/groundnut%20cake.png' },
    legumes:         { name: 'Legumes',              icon: 'assets/official-assets/food%20icons/legumes.png' },
    rice_bran:       { name: 'Rice Bran',            icon: 'assets/official-assets/food%20icons/rice%20bran.png' },
    silage:          { name: 'Silage',               icon: 'assets/official-assets/food%20icons/silage.png' },
    tree_fodder:     { name: 'Tree Fodder',          icon: 'assets/official-assets/food%20icons/tree%20fodder.png' },
    wheat_bran:      { name: 'Wheat Bran',           icon: 'assets/official-assets/food%20icons/wheat%20bran.png' }
  };

  const JUNK_ITEMS = {
    chilli: { name: 'Chilli', icon: '🌶️' },
    cake:   { name: 'Cake',   icon: '🍰' },
    pizza:  { name: 'Pizza',  icon: '🍕' }
  };

  const OUTCOMES = {
    love: {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20love.png',
      heading: "Ganga's Cow is Happy!",
      badge: '✨ Happy & Energetic ✨',
      quote: '"I feel so healthy & strong! Thank you!" ❤️'
    },
    'too-little': {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20too%20little.png',
      heading: "Ganga's Cow is Still Hungry!",
      badge: '🥺 A Little Too Little',
      quote: '"That was a bit too little... I\'m still hungry!" 🥺'
    },
    'too-full': {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20too%20full.png',
      heading: "Ganga's Cow is Stuffed!",
      badge: '😮 A Little Too Much',
      quote: '"Whoa, that\'s way too much feed!" 😮'
    },
    fart: {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20fart.png',
      heading: "Ganga's Cow is Feeling Funny!",
      badge: '💨 Oops!',
      quote: '"Pfffft... that mix made me gassy!" 💨'
    },
    sad: {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20sad.png',
      heading: "Ganga's Cow is Sad!",
      badge: '😢 Not the Right Mix',
      quote: '"That wasn\'t the right mix for me..." 😢'
    },
    vomit: {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20vomit.png',
      heading: "Ganga's Cow Isn't Feeling Well!",
      badge: '🤢 Bad Mix',
      quote: '"Blegh... that mix upset my tummy!" 🤢'
    },
    chilli: {
      img: 'assets/official-assets/cow%20reactions/cow%20-%20chilli.png',
      heading: "Ganga's Cow is Feeling the Heat!",
      badge: '🌶️ Too Spicy!',
      quote: '"Ow ow ow! Why chilli?! That\'s way too spicy!" 🌶️'
    }
  };

  const state = {
    currentScreen: 'screen-welcome',
    soundEnabled: true,
    addedIngredients: {
      hay: 0,
      maize: 0,
      gram_husk: 0,
      green_fodder: 0,
      groundnut_cake: 0,
      legumes: 0,
      rice_bran: 0,
      silage: 0,
      tree_fodder: 0,
      wheat_bran: 0,
      chilli: 0,
      cake: 0,
      pizza: 0
    },
    totalScoopsAdded: 0,
    temptationTriggered: false,
    avoidedJunkFood: true,
    shakeEnergy: 0,
    shakeComplete: false,
    outcome: null,
    audioCtx: null
  };

  // -------------------------------------------------------------------------
  // 2. Audio Synthesizer (Web Audio API)
  // -------------------------------------------------------------------------
  class SoundFX {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTap() {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playScoop(type) {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        if (type === 'water') {
          // Water splash bubble
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.07);
          osc.frequency.linearRampToValueAtTime(400, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        } else {
          // Grain scoop marimba chord
          const notes = [523.25, 659.25, 783.99, 1046.50];
          const note = notes[Math.floor(Math.random() * notes.length)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, now);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {}
    }

    playJunkBuzzer() {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playShakeRattle() {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playMoo() {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.4);
        osc.frequency.linearRampToValueAtTime(170, now + 0.9);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
        
        // Lowpass filter for warm animal voice
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
      } catch (e) {}
    }

    playVictory() {
      if (!state.soundEnabled || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const now = this.ctx.currentTime + i * 0.12;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        });
      } catch (e) {}
    }
  }

  const sfx = new SoundFX();

  // -------------------------------------------------------------------------
  // 3. Navigation & Screen Flow Engine
  // -------------------------------------------------------------------------
  function showScreen(screenId) {
    const currentElem = document.getElementById(state.currentScreen);
    const nextElem = document.getElementById(screenId);

    if (!nextElem) return;

    if (currentElem) {
      currentElem.classList.remove('active');
    }

    nextElem.classList.add('active');
    state.currentScreen = screenId;

    // Trigger screen-specific lifecycle handlers
    onScreenEnter(screenId);
  }

  function onScreenEnter(screenId) {
    if (screenId === 'screen-recipe') {
      renderRecipeAmounts();
    } else if (screenId === 'screen-shake-instruction') {
      initShakeInstructionScreen();
    } else if (screenId === 'screen-bowl-shaking') {
      initActiveBowlShakingScreen();
      populateSwirlIcons();
    } else if (screenId === 'screen-feed-ready') {
      initDragBowlToCow();
      populateReadyFeedIcons();
    } else if (screenId === 'screen-eating') {
      sfx.playMoo();
      // Auto-transition to Cow Reaction after 2.5 seconds eating delay
      clearTimeout(window._eatingDelayTimer);
      window._eatingDelayTimer = setTimeout(() => {
        if (state.currentScreen === 'screen-eating') {
          showScreen('screen-reaction');
        }
      }, 2500);
    } else if (screenId === 'screen-reaction') {
      state.outcome = computeOutcome();
      renderReaction();
      // Auto-transition to Scorecard after 4 seconds
      clearTimeout(window._reactionDelayTimer);
      window._reactionDelayTimer = setTimeout(() => {
        if (state.currentScreen === 'screen-reaction') {
          showScreen('screen-scorecard');
        }
      }, 4000);
    } else if (screenId === 'screen-scorecard') {
      renderScorecard();
    }
  }

  // -------------------------------------------------------------------------
  // 4. Feed Preparation (Drag & Drop + Touch + Tap) Engine
  // -------------------------------------------------------------------------
  function initPrepareStation() {
    const workbenchCards = document.querySelectorAll('.ingredient-bowl-card');
    const mixingBowl = document.getElementById('main-ceramic-bowl');

    workbenchCards.forEach(card => {
      const type = card.getAttribute('data-type');

      // 1. Desktop Drag & Drop API
      card.addEventListener('dragstart', (e) => {
        sfx.init();
        e.dataTransfer.setData('text/plain', type);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // 2. Tap to Add
      card.addEventListener('click', () => {
        sfx.init();
        addIngredientToBowl(type);
      });

      // 3. Mobile Touch Drag Simulation
      let touchStartX = 0;
      let touchStartY = 0;
      let isTouchDragging = false;

      card.addEventListener('touchstart', (e) => {
        sfx.init();
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isTouchDragging = false;
        }
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const moveX = e.touches[0].clientX;
          const moveY = e.touches[0].clientY;
          const dist = Math.hypot(moveX - touchStartX, moveY - touchStartY);
          if (dist > 15) {
            isTouchDragging = true;
            // Check if hovered over mixing bowl
            const bowlRect = mixingBowl.getBoundingClientRect();
            if (
              moveX >= bowlRect.left &&
              moveX <= bowlRect.right &&
              moveY >= bowlRect.top &&
              moveY <= bowlRect.bottom
            ) {
              mixingBowl.classList.add('drop-hover');
            } else {
              mixingBowl.classList.remove('drop-hover');
            }
          }
        }
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        mixingBowl.classList.remove('drop-hover');
        if (isTouchDragging && e.changedTouches.length === 1) {
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const bowlRect = mixingBowl.getBoundingClientRect();
          if (
            endX >= bowlRect.left &&
            endX <= bowlRect.right &&
            endY >= bowlRect.top &&
            endY <= bowlRect.bottom
          ) {
            addIngredientToBowl(type);
          }
        }
      });
    });

    // Mixing Bowl Desktop Drop Handler
    mixingBowl.addEventListener('dragover', (e) => {
      e.preventDefault();
      mixingBowl.classList.add('drop-hover');
    });

    mixingBowl.addEventListener('dragleave', () => {
      mixingBowl.classList.remove('drop-hover');
    });

    mixingBowl.addEventListener('drop', (e) => {
      e.preventDefault();
      mixingBowl.classList.remove('drop-hover');
      const type = e.dataTransfer.getData('text/plain');
      if (type) {
        addIngredientToBowl(type);
      }
    });

    // Sneaky cow dismissal
    const dismissCowBtn = document.getElementById('btn-dismiss-cow');
    if (dismissCowBtn) {
      dismissCowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sfx.playTap();
        document.getElementById('sneaky-cow-popout').classList.remove('active');
      });
    }
  }

  function addIngredientToBowl(type) {
    if (!type) return;

    const item = INGREDIENTS[type] || JUNK_ITEMS[type];
    const displayName = item ? item.name : (type.charAt(0).toUpperCase() + type.slice(1));

    // Chilli, Cake & Pizza are not part of the feed formula, but we don't announce it (no prompters)
    if (type === 'chilli' || type === 'cake' || type === 'pizza') {
      state.avoidedJunkFood = false;
    }

    // Increment count
    state.addedIngredients[type] = (state.addedIngredients[type] || 0) + 1;
    state.totalScoopsAdded += 1;

    // Play Sound & Haptic
    sfx.playScoop(type);
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    // Activate corresponding ingredient layer inside bowl
    const layer = document.getElementById(`layer-${type.replace(/_/g, '-')}`);
    if (layer) {
      layer.classList.add('active');
    }

    // Show floating toast message (neutral, no correct/wrong prompt)
    showDropToast(`+1 ${displayName} Added`);

    // Trigger Sneaky Cow Temptation Event midway (at 3 scoops)
    if (state.totalScoopsAdded === 3 && !state.temptationTriggered) {
      state.temptationTriggered = true;
      const cowPopout = document.getElementById('sneaky-cow-popout');
      if (cowPopout) {
        setTimeout(() => {
          cowPopout.classList.add('active');
          setTimeout(() => cowPopout.classList.remove('active'), 4500);
        }, 600);
      }
    }

    // Reveal "Ready to Mix!" button once at least 2 ingredients have been added
    if (state.totalScoopsAdded >= 2) {
      const readyAction = document.getElementById('prep-ready-action');
      if (readyAction) readyAction.classList.remove('hidden');
    }
  }

  function computeOutcome() {
    const added = state.addedIngredients;

    // Chilli always wins, no matter what else is in the mix
    if ((added.chilli || 0) > 0) return 'chilli';

    // Any wrong ingredient (chilli excluded) -> mixed/bad reaction
    const hasWrong = Object.keys(added).some(t =>
      t !== 'chilli' && !(t in RECIPE_TARGETS) && (added[t] || 0) > 0
    );
    if (hasWrong) {
      const badOutcomes = ['fart', 'sad', 'vomit'];
      return badOutcomes[Math.floor(Math.random() * badOutcomes.length)];
    }

    // Only correct ingredients added: check amounts
    let low = false;
    let high = false;
    Object.keys(RECIPE_TARGETS).forEach(type => {
      const count = added[type] || 0;
      if (count > RECIPE_TARGETS[type]) {
        high = true;
      } else if (count < RECIPE_TARGETS[type]) {
        low = true;
      }
    });

    if (high) return 'too-full';
    if (low) return 'too-little';
    return 'love';
  }

  function renderReaction() {
    const outcome = OUTCOMES[state.outcome] || OUTCOMES.love;

    const img = document.getElementById('reaction-cow-img');
    if (img) {
      img.src = outcome.img;
      img.classList.remove('dance-anim');
      if (state.outcome === 'love') {
        img.classList.add('dance-anim');
      }
    }

    const heading = document.getElementById('reaction-heading');
    if (heading) heading.textContent = outcome.heading;

    const badge = document.getElementById('reaction-mood-badge');
    if (badge) badge.textContent = outcome.badge;

    const quote = document.getElementById('reaction-quote');
    if (quote) quote.textContent = outcome.quote;

    if (state.outcome === 'love') {
      triggerConfettiBurst(20);
    }
  }

  function populateSwirlIcons() {
    const container = document.querySelector('.swirling-grains');
    if (!container) return;

    const addedTypes = [];
    Object.keys(RECIPE_TARGETS).forEach(t => {
      if ((state.addedIngredients[t] || 0) > 0) addedTypes.push(t);
    });
    if ((state.addedIngredients.chilli || 0) > 0) addedTypes.push('chilli');
    if ((state.addedIngredients.cake || 0) > 0) addedTypes.push('cake');
    if ((state.addedIngredients.pizza || 0) > 0) addedTypes.push('pizza');

    container.innerHTML = '';

    const count = addedTypes.length;
    const GOLDEN_ANGLE = 2.399963229728653;
    const maxRadius = 32;

    addedTypes.forEach((type, i) => {
      const angle = i * GOLDEN_ANGLE;
      const radius = Math.sqrt(i / count) * maxRadius;
      const centerX = 50 + radius * Math.cos(angle);
      const centerY = 50 + radius * Math.sin(angle);
      const top = `${Math.round((centerY - 12) * 10) / 10}%`;
      const left = `${Math.round((centerX - 12) * 10) / 10}%`;

      if (type in INGREDIENTS) {
        const img = document.createElement('img');
        img.src = INGREDIENTS[type].icon;
        img.alt = INGREDIENTS[type].name;
        img.className = 'swirl-icon-img';
        img.style.top = top;
        img.style.left = left;
        img.style.animationDelay = `${i * 0.15}s`;
        container.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'swirl-icon-emoji';
        span.textContent = JUNK_ITEMS[type].icon;
        span.style.top = top;
        span.style.left = left;
        span.style.animationDelay = `${i * 0.15}s`;
        container.appendChild(span);
      }
    });
  }

  function populateReadyFeedIcons() {
    const container = document.getElementById('ready-feed-mix-icons');
    if (!container) return;
    container.innerHTML = '';

    const addImg = (src, alt) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.className = 'ready-feed-icon';
      container.appendChild(img);
    };
    const addEmoji = (emoji) => {
      const span = document.createElement('span');
      span.className = 'ready-feed-emoji';
      span.textContent = emoji;
      container.appendChild(span);
    };

    Object.keys(RECIPE_TARGETS).forEach(type => {
      if ((state.addedIngredients[type] || 0) > 0) {
        addImg(INGREDIENTS[type].icon, INGREDIENTS[type].name);
      }
    });
    if ((state.addedIngredients.chilli || 0) > 0) addEmoji('🌶️');
    if ((state.addedIngredients.cake || 0) > 0) addEmoji('🍰');
  }

  function renderRecipeAmounts() {
    document.querySelectorAll('.recipe-item-row').forEach(row => {
      const type = row.getAttribute('data-id');
      const badge = row.querySelector('.item-target-badge');
      if (badge && RECIPE_TARGETS[type]) {
        const n = RECIPE_TARGETS[type];
        badge.textContent = `${n} scoop${n > 1 ? 's' : ''}`;
      }
    });
  }

  function showDropToast(text, bgColor = "#3e7b27") {
    const toast = document.getElementById('drop-feedback-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.style.background = bgColor;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1200);
  }

  // -------------------------------------------------------------------------
  // 5. Mixing Animation Engine
  // -------------------------------------------------------------------------
  function runMixingAnimation() {
    const progressBar = document.getElementById('mix-progress-fill');
    const statusText = document.getElementById('mix-status-text');
    let progress = 0;

    const interval = setInterval(() => {
      progress += 4;
      if (progressBar) progressBar.style.width = `${progress}%`;
      
      if (progress === 40 && statusText) {
        statusText.textContent = 'Adding water & organic minerals...';
        sfx.playScoop('water');
      } else if (progress === 80 && statusText) {
        statusText.textContent = 'Infusing fresh green azolla...';
        sfx.playScoop('azolla');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          showScreen('screen-shake');
        }, 400);
      }
    }, 80);
  }

  // -------------------------------------------------------------------------
  // 6. Shake Instruction & Active Bowl Shaking Engine
  // -------------------------------------------------------------------------
  function initShakeInstructionScreen() {
    state.shakeEnergy = 0;
    state.shakeComplete = false;

    let hasStartedShaking = false;
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    function startShakingTransition() {
      if (hasStartedShaking) return;
      hasStartedShaking = true;
      window.removeEventListener('devicemotion', handleInitialMotion);
      sfx.playTap();
      showScreen('screen-bowl-shaking');
    }

    function handleInitialMotion(event) {
      if (state.currentScreen !== 'screen-shake-instruction' || hasStartedShaking) return;

      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 600) {
          startShakingTransition();
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    }

    const startBtn = document.getElementById('btn-start-shaking-motion');
    if (startBtn) {
      startBtn.onclick = startShakingTransition;
    }

    window.removeEventListener('devicemotion', handleInitialMotion);
    window.addEventListener('devicemotion', handleInitialMotion, { passive: true });
  }

  function updateShakeProgressBar(val) {
    const pctElem = document.getElementById('shake-progress-pct');
    const fillElem = document.getElementById('shake-progress-fill');
    const currentVal = Math.min(100, Math.max(0, Math.round(val)));
    if (pctElem) pctElem.textContent = `${currentVal}%`;
    if (fillElem) fillElem.style.width = `${currentVal}%`;
  }

  function initActiveBowlShakingScreen() {
    state.shakeEnergy = 0;
    state.shakeComplete = false;
    updateShakeProgressBar(0);

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    function handleActiveMotion(event) {
      if (state.currentScreen !== 'screen-bowl-shaking' || state.shakeComplete) return;

      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 500) {
          boostShakeProgress(16);
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    }

    const boostBtn = document.getElementById('btn-shake-tap-boost');
    if (boostBtn) {
      boostBtn.onclick = (e) => {
        if (e) e.preventDefault();
        sfx.init();
        boostShakeProgress(20);
      };
    }

    window.removeEventListener('devicemotion', handleActiveMotion);
    window.addEventListener('devicemotion', handleActiveMotion, { passive: true });
  }

  function boostShakeProgress(amount = 20) {
    if (state.shakeComplete) return;

    state.shakeEnergy = Math.min(100, state.shakeEnergy + amount);
    updateShakeProgressBar(state.shakeEnergy);
    sfx.playShakeRattle();

    if (navigator.vibrate) {
      try { navigator.vibrate(30); } catch (e) {}
    }

    if (state.shakeEnergy >= 100) {
      state.shakeComplete = true;
      sfx.playVictory();
      setTimeout(() => {
        showScreen('screen-feed-ready');
      }, 500);
    }
  }

  // -------------------------------------------------------------------------
  // 7. Drag Bowl to Cow Engine
  // -------------------------------------------------------------------------
  function initDragBowlToCow() {
    const bowlWrap = document.getElementById('draggable-feed-bowl');
    const cowTarget = document.getElementById('cow-drop-target');
    const bubble = document.getElementById('cow-feed-bubble');

    if (!bowlWrap || !cowTarget) return;

    // Reset the bowl to its fresh, draggable state (incl. when replaying the game)
    bowlWrap.style.transform = '';
    bowlWrap.style.opacity = '';
    if (bubble) bubble.textContent = '"I\'m hungry! Bring me feed!" 🥣';

    let fedCow = false;

    function handleBowlFed() {
      if (fedCow) return;
      fedCow = true;

      sfx.playScoop('water');
      sfx.playMoo();

      if (bubble) bubble.textContent = '"Mmm... Yummy! Thank you!" ❤️';
      bowlWrap.style.transform = 'translateY(-140px) scale(0.6)';
      bowlWrap.style.opacity = '0.5';

      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);

      // 1.5 Second Delay: Transition to Cow Eating Screen
      setTimeout(() => {
        showScreen('screen-eating');
      }, 1500);
    }

    // 1. Mouse Click / Tap Fallback
    bowlWrap.onclick = handleBowlFed;

    // 2. Desktop Drag & Drop API
    bowlWrap.addEventListener('dragstart', (e) => {
      sfx.init();
      e.dataTransfer.setData('text/plain', 'feed-bowl');
    });

    cowTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      cowTarget.classList.add('target-hover');
    });

    cowTarget.addEventListener('dragleave', () => {
      cowTarget.classList.remove('target-hover');
    });

    cowTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      cowTarget.classList.remove('target-hover');
      handleBowlFed();
    });

    // 3. Mobile Touch Drag Simulation
    let touchStartX = 0, touchStartY = 0;
    let isTouchDragging = false;

    bowlWrap.addEventListener('touchstart', (e) => {
      sfx.init();
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchDragging = false;
      }
    }, { passive: true });

    bowlWrap.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const moveY = e.touches[0].clientY;
        if (touchStartY - moveY > 20) {
          isTouchDragging = true;
          cowTarget.classList.add('target-hover');
        }
      }
    }, { passive: true });

    bowlWrap.addEventListener('touchend', (e) => {
      cowTarget.classList.remove('target-hover');
      if (isTouchDragging) {
        handleBowlFed();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. Scorecard & Star Rating Engine
  // -------------------------------------------------------------------------
  function renderScorecard() {
    const finalScoreElem = document.getElementById('final-score-val');
    const junkScorePill = document.getElementById('score-junk-pill');
    const propScorePill = document.getElementById('score-proportions-pill');
    const feedbackP = document.getElementById('feedback-text-p');

    const star1 = document.getElementById('star-1');
    const star2 = document.getElementById('star-2');
    const star3 = document.getElementById('star-3');

    const chkIngredients = document.getElementById('chk-ingredients');
    const chkProportions = document.getElementById('chk-proportions');
    const chkJunk = document.getElementById('chk-junk');

    // Reset stars
    [star1, star2, star3].forEach(star => {
      if (star) star.classList.remove('star-active');
    });

    const added = state.addedIngredients;
    const outcome = state.outcome || computeOutcome();

    const allCorrect = !Object.keys(added).some(t =>
      t !== 'chilli' && !(t in RECIPE_TARGETS) && (added[t] || 0) > 0
    );
    let rightAmounts = true;
    let tooLittle = false;
    Object.keys(RECIPE_TARGETS).forEach(type => {
      const count = added[type] || 0;
      if (count < RECIPE_TARGETS[type]) {
        rightAmounts = false;
        tooLittle = true;
      } else if (count > RECIPE_TARGETS[type]) {
        rightAmounts = false;
      }
    });
    const hasChilli = (added.chilli || 0) > 0;
    const avoidedJunk = state.avoidedJunkFood && !hasChilli && (added.cake || 0) === 0;

    const setCheck = (el, ok) => {
      if (el) el.textContent = ok ? '✅' : '❌';
    };
    setCheck(chkIngredients, allCorrect && !hasChilli);
    setCheck(chkProportions, rightAmounts);
    setCheck(chkJunk, avoidedJunk);

    let score;
    let stars;
    let feedback;
    let junkLabel;

    if (outcome === 'love') {
      score = 100;
      stars = 3;
      junkLabel = '100%';
      feedback = '"Outstanding! You made a 100% organic, healthy and balanced feed for my cow!"';
    } else if (outcome === 'too-little') {
      score = 75;
      stars = 2;
      junkLabel = avoidedJunk ? 'Good' : 'Tempted';
      feedback = '"Great ingredients, but my cow needs a little more feed to feel full and strong!"';
    } else if (outcome === 'too-full') {
      score = 75;
      stars = 2;
      junkLabel = avoidedJunk ? 'Good' : 'Tempted';
      feedback = '"Great ingredients, but that was too much! My cow feels overstuffed now."';
    } else if (outcome === 'chilli') {
      score = 40;
      stars = 1;
      junkLabel = 'Chilli!';
      feedback = '"Oh no! Chilli is far too spicy for cows. Stick to the organic fodder!"';
    } else {
      score = 50;
      stars = 1;
      junkLabel = 'Not great';
      feedback = '"Some of those ingredients weren\'t right for my cow. Let\'s try only organic fodder!"';
    }

    if (junkScorePill) {
      junkScorePill.textContent = junkLabel;
      junkScorePill.style.color = (score >= 90) ? '#377221' : '#c9541a';
    }
    if (propScorePill) {
      propScorePill.textContent = rightAmounts ? '100%' : (tooLittle ? 'Too little' : 'Too much');
    }
    if (finalScoreElem) {
      finalScoreElem.textContent = `${score}%`;
    }
    if (feedbackP) {
      feedbackP.textContent = feedback;
    }

    // Sequential star pop-in with sound effects
    setTimeout(() => {
      if (star1) star1.classList.add('star-active');
      sfx.playScoop('maize');
    }, 400);

    setTimeout(() => {
      if (star2 && stars >= 2) star2.classList.add('star-active');
      sfx.playScoop('maize');
    }, 800);

    if (stars >= 3) {
      setTimeout(() => {
        if (star3) star3.classList.add('star-active');
        sfx.playVictory();
        triggerConfettiBurst(80);
      }, 1200);
    } else {
      setTimeout(() => {
        sfx.playVictory();
        triggerConfettiBurst(30);
      }, 1000);
    }
  }

  // -------------------------------------------------------------------------
  // 8. Confetti Victory Particle Canvas
  // -------------------------------------------------------------------------
  function triggerConfettiBurst(count = 50) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const particles = [];
    const colors = ['#f4b428', '#427b2b', '#e86e25', '#4fa4de', '#f582ae', '#8bd3dd'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() * 40 - 20),
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < canvas.height) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }

  // -------------------------------------------------------------------------
  // 9. Reset Game Engine
  // -------------------------------------------------------------------------
  function resetGame() {
    generateRecipe();
    state.addedIngredients = {
      hay: 0,
      maize: 0,
      gram_husk: 0,
      green_fodder: 0,
      groundnut_cake: 0,
      legumes: 0,
      rice_bran: 0,
      silage: 0,
      tree_fodder: 0,
      wheat_bran: 0,
      chilli: 0,
      cake: 0,
      pizza: 0
    };
    state.totalScoopsAdded = 0;
    state.temptationTriggered = false;
    state.avoidedJunkFood = true;
    state.shakeEnergy = 0;
    state.shakeComplete = false;
    state.outcome = null;

    // Reset Bowl Layers
    document.querySelectorAll('.ingredient-layer').forEach(layer => {
      layer.classList.remove('active');
    });

    const prepReadyAction = document.getElementById('prep-ready-action');
    if (prepReadyAction) prepReadyAction.classList.add('hidden');

    const prepHeader = document.getElementById('prep-instruction-text');
    if (prepHeader) prepHeader.textContent = '5. PREPARE FEED';
  }

  // -------------------------------------------------------------------------
  // 10. Initialization & Event Bindings
  // -------------------------------------------------------------------------
  function init() {
    // Screen Transition Buttons
    const bindBtn = (id, targetScreen, onAction) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          sfx.init();
          sfx.playTap();
          if (onAction) onAction();
          showScreen(targetScreen);
        });
      }
    };

    bindBtn('btn-start-welcome', 'screen-intro');
    bindBtn('btn-accept-story', 'screen-recipe');
    bindBtn('btn-goto-prepare', 'screen-prepare');
    bindBtn('btn-goto-feeding', 'screen-eating');
    bindBtn('btn-goto-tomorrow', 'screen-tomorrow');

    // Start Mixing CTA Button Handler
    const btnMixCTA = document.getElementById('btn-goto-ready-mix');
    if (btnMixCTA) {
      btnMixCTA.addEventListener('click', () => {
        sfx.init();
        sfx.playTap();
        if (state.totalScoopsAdded < 2) {
          showDropToast('Add at least 2 ingredients to mix feed! 🥣', '#e86e25');
        } else {
          showScreen('screen-shake-instruction');
        }
      });
    }

    // Replay & Home Buttons on Last Screen
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        sfx.init();
        sfx.playTap();
        resetGame();
        showScreen('screen-recipe');
      });
    }

    const btnBackHome = document.getElementById('btn-back-home');
    if (btnBackHome) {
      btnBackHome.addEventListener('click', () => {
        sfx.init();
        sfx.playTap();
        resetGame();
        showScreen('screen-welcome');
      });
    }

    // Init Drag & Drop Prep Station
    initPrepareStation();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

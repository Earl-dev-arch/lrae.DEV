const splitLetters = (element) => {
  if (element.dataset.splitLetters) return;
  element.dataset.splitLetters = 'true';
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const raw = node.textContent;
    if (!raw.trim()) {
      node.parentNode.removeChild(node);
      return;
    }

    let text = raw.replace(/\s+/g, ' ');
    if (!node.previousSibling || node.previousSibling.nodeName === 'BR') {
      text = text.trimStart();
    }
    if (!node.nextSibling || node.nextSibling.nodeName === 'BR') {
      text = text.trimEnd();
    }

    if (!text) {
      node.parentNode.removeChild(node);
      return;
    }

    const fragment = document.createDocumentFragment();
    [...text].forEach((character, index) => {
      const letter = document.createElement('span');
      letter.className = 'scroll-letter';
      letter.style.setProperty('--letter-delay', `${index * 18}ms`);
      letter.textContent = character === ' ' ? '\u00a0' : character;
      fragment.append(letter);
    });
    node.parentNode.replaceChild(fragment, node);
  });
};

const intro = document.querySelector('.intro-screen');

const revealPage = () => {
  if (!intro || intro.classList.contains('is-hidden')) return;
  intro.classList.add('is-hidden');
  document.body.classList.remove('is-loading');

  // Wait for the loading screen's fade-out to finish before starting the hero.
  window.setTimeout(() => {
    document.body.classList.add('intro-complete');
    window.requestAnimationFrame(() => document.body.classList.remove('page-entering'));
  }, 600);
};

if (intro) {
  // Hold the splash long enough for all seven greetings to cycle through once,
  // then reveal regardless of how quickly the page itself loaded.
  const greetings = intro.querySelectorAll('.intro-kicker span').length || 1;
  const cycle = parseFloat(getComputedStyle(intro.querySelector('.intro-kicker') || intro).getPropertyValue('--cycle')) || 1.1;
  const hold = greetings * cycle * 1000;

  window.setTimeout(revealPage, hold);
  // Fail-safe: never let the splash cover the page if something above goes wrong.
  window.setTimeout(revealPage, 12000);

  // A tap or keypress skips straight in.
  const skip = () => revealPage();
  intro.addEventListener('click', skip);
  window.addEventListener('keydown', skip, { once: true });
} else {
  revealPage();
}

const themeToggle = document.querySelector('.theme-toggle');

try {
  if (window.localStorage.getItem('portfolio-theme') === 'light') {
    document.body.classList.add('light-theme');
  }
} catch {
  // dapat mo gana ning yawaa ni boshet
}

if (themeToggle) {
  const isLight = document.body.classList.contains('light-theme');
  themeToggle.textContent = isLight ? '☾' : '☼';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
}

themeToggle?.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  try {
    window.localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  } catch {
    // bantay lagig naay error
  }
  themeToggle.textContent = isLight ? '☾' : '☼';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
});

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  let ringX = 0;
  let ringY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let isTracking = false;

  const animateCursor = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    if (isTracking) window.requestAnimationFrame(animateCursor);
  };

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursorDot.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
    cursorDot.classList.add('is-visible');
    cursorRing.classList.add('is-visible');
    if (!isTracking) {
      ringX = pointerX;
      ringY = pointerY;
      isTracking = true;
      window.requestAnimationFrame(animateCursor);
    }
  });

  document.addEventListener('pointerover', (event) => {
    cursorRing.classList.toggle('is-hovering', Boolean(event.target.closest('a, button, [role="button"]')));
  });

  document.addEventListener('pointerleave', () => {
    cursorDot.classList.remove('is-visible');
    cursorRing.classList.remove('is-visible');
    isTracking = false;
  });
}

const animatedText = document.querySelectorAll(
  '.hero h1, section > .label, .card h2, .section-title, #contact h2, .language h3'
);

animatedText.forEach(splitLetters);

const skillsTitle = document.querySelector('.skills-heading .section-title');

if (skillsTitle) {
  const letters = [...skillsTitle.querySelectorAll('.scroll-letter')];
  skillsTitle.classList.add('letters-scattered');
  skillsTitle.setAttribute('tabindex', '0');
  skillsTitle.setAttribute('role', 'button');
  skillsTitle.setAttribute('aria-pressed', 'false');
  skillsTitle.setAttribute('aria-label', 'Arrange the scattered heading letters');

  letters.forEach((letter, index) => {
    const scatterX = (index * 47 % 241) - 120;
    const scatterY = (index * 71 % 181) - 90;
    const rotation = (index * 29 % 101) - 50;
    letter.style.setProperty('--scatter-x', `${scatterX}px`);
    letter.style.setProperty('--scatter-y', `${scatterY}px`);
    letter.style.setProperty('--scatter-rotate', `${rotation}deg`);
    letter.style.setProperty('--scatter-scale', `${0.72 + (index % 4) * 0.1}`);
    letter.style.setProperty('--scatter-delay', `${index * 24}ms`);
    letter.style.setProperty('--float-x', `${(index * 19 % 29) - 14}px`);
    letter.style.setProperty('--float-y', `${(index * 23 % 35) - 17}px`);
    letter.style.setProperty('--float-rotate', `${(index * 13 % 17) - 8}deg`);
    letter.style.setProperty('--float-duration', `${2.4 + (index % 5) * 0.35}s`);
  });

  const toggleSkillsTitle = () => {
    const isScattered = skillsTitle.classList.toggle('letters-scattered');
    skillsTitle.classList.toggle('letters-arranged', !isScattered);
    skillsTitle.setAttribute('aria-pressed', String(!isScattered));
    skillsTitle.setAttribute(
      'aria-label',
      isScattered ? 'Arrange the scattered heading letters' : 'Scatter the arranged heading letters'
    );
  };

  skillsTitle.addEventListener('click', toggleSkillsTitle);
  skillsTitle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSkillsTitle();
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('letters-visible', entry.isIntersecting);
  });
}, { threshold: 0.18 });

animatedText.forEach((element) => observer.observe(element));

const leftRevealElements = document.querySelectorAll('.scroll-reveal-left, .scroll-reveal-right');
const leftRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('is-revealed', entry.isIntersecting);
  });
}, { threshold: 0.2 });

leftRevealElements.forEach((element) => leftRevealObserver.observe(element));

const skillsSection = document.querySelector('.skills-section');

if (skillsSection) {
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-filled', entry.isIntersecting);
    });
  }, { threshold: 0.0 });

  skillsObserver.observe(skillsSection);
}

const projectCount = document.querySelector('.project-count');

if (projectCount) {
  const target = Number(projectCount.dataset.countTo);
  const start = 1;
  // Nine 0.3-second steps take the displayed value from 1 through 10.
  const duration = (target - start) * 300;
  let hasCounted = false;

  const countProjects = () => {
    if (hasCounted) return;
    hasCounted = true;
    const startedAt = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      projectCount.textContent = String(Math.floor(start + (target - start) * progress));
      if (progress < 1) window.requestAnimationFrame(update);
    };

    window.requestAnimationFrame(update);
  };

  const projectsObserver = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countProjects();
      observerInstance.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  projectsObserver.observe(projectCount);
}

const profileHello = document.querySelector('.profile-hello');

profileHello?.addEventListener('click', () => {
  profileHello.classList.remove('is-popping');
  void profileHello.offsetWidth;
  profileHello.classList.add('is-popping');
});

const pageLinks = document.querySelectorAll('.details-button, .back-link');

pageLinks.forEach((link) => link.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  document.body.classList.add('page-leaving');
  window.setTimeout(() => {
    window.location.assign(link.href);
  }, 420);
}));
/* Fan-out deck: click the stack to spread four cards, click again to deal the
   next four, click once the deck is exhausted to return it to the stack. */
const fanDeck = document.querySelector('.fan-deck');

if (fanDeck) {
  const deckStage = fanDeck.querySelector('.language-grid');
  const deckCards = [...fanDeck.querySelectorAll('.language')];

  const visible = 4;
  const total = deckCards.length;
  const maxStart = Math.max(0, total - visible);


  let start = 0;
  let isOpen = false;
  let isAdvancing = false;

  // Every card carries a "next" control, only visible once that card is revealed.
  deckCards.forEach((card) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-next';
    button.innerHTML = '<span>Next languages</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
    card.append(button);
  });

  const syncNextButton = () => {
    const isLastSet = start + visible >= total;
    const label = isLastSet ? 'Stack the deck' : 'Next languages';

    deckCards.forEach((card) => {
      const button = card.querySelector('.card-next');
      if (!button) return;
      button.querySelector('span').textContent = label;
      button.setAttribute(
        'aria-label',
        isLastSet ? 'Return the languages to a stack' : 'Show the next four languages'
      );
    });
  };

  const render = (animate) => {
    fanDeck.classList.toggle('is-open', isOpen);
    deckStage.setAttribute('aria-expanded', String(isOpen));
    deckStage.setAttribute(
      'aria-label',
      isOpen ? 'Show the next programming languages' : 'Show programming languages'
    );

    deckCards.forEach((card, index) => {
      const offset = index - start;
      const isShown = offset >= 0 && offset < visible;
      const slot = offset - (visible - 1) / 2;
      const order = Math.abs(slot) * 2 + (slot > 0 ? 1 : 0);
      const dir = slot === 0 ? 1 : Math.sign(slot);

      card.style.setProperty('--slot', String(slot));
      card.style.setProperty('--order', String(order));
      card.style.setProperty('--dir', String(dir));
      card.classList.toggle('is-shown', isShown);
      card.setAttribute('aria-hidden', String(!isShown));
      card.tabIndex = isShown ? 0 : -1;

      if (!animate) {
        card.style.transition = 'none';
        void card.offsetWidth;
        card.style.transition = '';
      }
    });

    syncNextButton();
  };

  const advance = () => {
    if (isAdvancing) return;

    if (!isOpen) {
      isOpen = true;
      start = 0;
      render(true);
      return;
    }

    if (start < maxStart) {
      // Slide the whole row out, then deal the next four back in.
      isAdvancing = true;
      clearReveal();
      deckCards.forEach((card) => card.classList.remove('is-shown'));
      window.setTimeout(() => {
        start = Math.min(maxStart, start + visible);
        render(true);
        isAdvancing = false;
      }, 220);
      return;
    }

    isOpen = false;
    clearReveal();
    render(true);
  };

  render(false);

  deckStage.addEventListener('click', advance);
  deckStage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advance();
    }
  });

  // Click a laid-out card to reveal it; click the same card again to tuck it back.
  let revealedCard = null;

  const revealCard = (card) => {
    const isSame = revealedCard === card;
    deckCards.forEach((item) => item.classList.remove('is-revealed'));

    if (isSame) {
      revealedCard = null;
      fanDeck.classList.remove('has-reveal');
      return;
    }

    revealedCard = card;
    card.classList.add('is-revealed');
    fanDeck.classList.add('has-reveal');
    syncNextButton();
  };

  const clearReveal = () => {
    if (!revealedCard) return;
    revealedCard.classList.remove('is-revealed');
    fanDeck.classList.remove('has-reveal');
    revealedCard = null;
  };

  deckCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (!card.classList.contains('is-shown')) return;
      // The next control lives inside the card, so handle it before revealing.
      if (event.target.closest('.card-next')) {
        event.stopPropagation();
        advance();
        return;
      }
      event.stopPropagation();
      revealCard(card);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        revealCard(card);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') clearReveal();
  });

  const deckObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || !isOpen) return;
      isOpen = false;
      start = 0;
      clearReveal();
      render(true);
    });
  }, { threshold: 0.1 });

  deckObserver.observe(fanDeck);
}

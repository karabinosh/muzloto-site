const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

const fontMap = {
  "Bebas Neue": '"Bebas Neue", sans-serif',
  Syne: 'Syne, sans-serif',
  Anton: 'Anton, sans-serif',
  Oswald: 'Oswald, sans-serif',
  "Archivo Black": '"Archivo Black", sans-serif',
};

function applyElementColor(element, color) {
  element.style.color = color;
  if (!element.matches('svg')) return;
  if (element.getAttribute('fill') !== 'none') element.style.fill = color;
  if (element.hasAttribute('stroke') && element.getAttribute('stroke') !== 'none') element.style.stroke = color;
  element.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse').forEach((part) => {
    if (part.hasAttribute('fill') && part.getAttribute('fill') !== 'none') part.style.fill = color;
    if (part.hasAttribute('stroke') && part.getAttribute('stroke') !== 'none') part.style.stroke = color;
  });
}

function applyContent(content) {
  if (!content) return;
  document.querySelectorAll('[data-bind]').forEach((element) => {
    const value = content[element.dataset.bind];
    if (typeof value === 'string') {
      element.textContent = value;
      const textColor = content[`${element.dataset.bind}Color`];
      if (textColor) applyElementColor(element, textColor);
      else element.style.removeProperty('color');
      element.style.textAlign = content[`${element.dataset.bind}Align`] || '';
    }
  });
  document.querySelectorAll('[data-image]').forEach((element) => {
    const value = content[element.dataset.image];
    if (value) element.src = value;
  });
  document.querySelectorAll('[data-link="ticketUrl"]').forEach((ticketLink) => {
    if (content.ticketUrl) ticketLink.href = content.ticketUrl;
  });
  const instagram = document.querySelector('[data-link="instagram"]');
  if (instagram && content.instagram) instagram.href = `https://www.instagram.com/${content.instagram.replace(/^@/, '')}`;
  if (content.accentColor) document.documentElement.style.setProperty('--hot', content.accentColor);
  if (content.backgroundColor) document.documentElement.style.setProperty('--ink', content.backgroundColor);
  if (fontMap[content.displayFont]) document.documentElement.style.setProperty('--display', fontMap[content.displayFont]);
  try {
    Object.entries(JSON.parse(content.inlineTextOverrides || '{}')).forEach(([selector, value]) => {
      document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
    });
    Object.entries(JSON.parse(content.inlineStyleOverrides || '{}')).forEach(([selector, styles]) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (styles.color) applyElementColor(element, styles.color);
        if (styles.align) element.style.textAlign = styles.align;
      });
    });
  } catch { /* Ignore invalid legacy overrides. */ }
}

applyContent(window.SOVA_CONTENT);
window.addEventListener('message', (event) => {
  if (event.origin === window.location.origin && event.data?.type === 'SOVA_PREVIEW') applyContent(event.data.content);
});

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('open', !open);
  mobileMenu.setAttribute('aria-hidden', String(open));
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

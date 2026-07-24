// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
siteNav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// Header shrink + back-to-top on scroll
const header = document.querySelector('.site-header');
const toTop = document.querySelector('.to-top');
let scrollTick = false;
function onScroll() {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 40);
    toTop.hidden = y < 600;
    scrollTick = false;
  });
}
document.addEventListener('scroll', onScroll, { passive: true, capture: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Gallery filters
const filterBtns = [...document.querySelectorAll('.gfilter')];
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.toggle('active', b === btn));
  const cat = btn.dataset.filter;
  document.querySelectorAll('.gallery .gtile').forEach(tile => {
    tile.classList.toggle('gtile-hidden', cat !== 'all' && tile.dataset.cat !== cat);
  });
}));

// Scroll-reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Gallery lightbox
const tiles = [...document.querySelectorAll('.gallery .gtile')];
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbCaption = lightbox.querySelector('figcaption');
const lbCount = lightbox.querySelector('.lb-count');
let current = 0;

function visibleTiles() {
  const vis = tiles.filter(t => !t.classList.contains('gtile-hidden'));
  return vis.length ? vis : tiles;
}

function showTile(i) {
  const vis = visibleTiles();
  current = (i + vis.length) % vis.length;
  const img = vis[current].querySelector('img');
  const cap = vis[current].querySelector('figcaption');
  lbImg.classList.remove('lb-in');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = cap ? cap.textContent : '';
  lbCount.textContent = (current + 1) + ' / ' + vis.length;
  requestAnimationFrame(() => lbImg.classList.add('lb-in'));
}

function openLightbox(i) {
  showTile(i);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

tiles.forEach(tile => tile.addEventListener('click', () => openLightbox(visibleTiles().indexOf(tile))));
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); showTile(current - 1); });
lightbox.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); showTile(current + 1); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showTile(current - 1);
  if (e.key === 'ArrowRight') showTile(current + 1);
});

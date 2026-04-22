/* ============================================================
   InMyCorner — Main JavaScript
   Handles: Nav toggle, scroll animations, FAQ accordion,
            FAQ filters, step counter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     HAMBURGER NAV
  ────────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  window.closeNav = function () {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  };


  /* ──────────────────────────────────────────
     SCROLL-TRIGGERED STEP ANIMATIONS
     Updates the large background number as
     each step enters the viewport.
  ────────────────────────────────────────── */
  const steps  = document.querySelectorAll('.step');
  const bgNum  = document.getElementById('bgNum');
  const labels = ['1', '2', '3', '4'];

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const stepIndex = entry.target.dataset.step;
        if (stepIndex && bgNum) {
          bgNum.textContent = labels[+stepIndex - 1];
        }
      }
    });
  }, { threshold: 0.3 });

  steps.forEach(step => stepObserver.observe(step));


  /* ──────────────────────────────────────────
     TESTIMONIAL CARD ANIMATIONS
  ────────────────────────────────────────── */
  const tCards = document.querySelectorAll('.t-card');

  const tObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  tCards.forEach(card => tObserver.observe(card));


  /* ──────────────────────────────────────────
     FAQ ITEM ANIMATIONS
  ────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  const faqAnimObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  faqItems.forEach(item => faqAnimObserver.observe(item));


  /* ──────────────────────────────────────────
     FAQ ACCORDION
     Only one item open at a time.
  ────────────────────────────────────────── */
  document.querySelectorAll('.faq-q-row').forEach(row => {
    row.addEventListener('click', () => {
      const item   = row.closest('.faq-item');
      const isOpen = item.dataset.open === 'true';

      // Close all items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.dataset.open = 'false';
      });

      // Toggle clicked item
      item.dataset.open = isOpen ? 'false' : 'true';
    });
  });


  /* ──────────────────────────────────────────
     FAQ FILTER TABS
     Shows/hides questions by category.
  ────────────────────────────────────────── */
  const tabs = document.querySelectorAll('.faq-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab style
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      // Show/hide FAQ items based on category
      document.querySelectorAll('.faq-item').forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.style.display = match ? 'block' : 'none';
        // Close any open items when filtering
        if (match) item.dataset.open = 'false';
      });
    });
  });

});

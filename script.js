// ===================================
// BITCOINER ONE LINERS - SCRIPTS
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Set current year in footer
  const yearElements = document.querySelectorAll('#year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(function(el) {
    el.textContent = currentYear;
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenuBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
  }

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      try {
        // Simulated success for demo (replace with real endpoint)
        await new Promise(function(resolve) {
          setTimeout(resolve, 1000);
        });

        // Show success message
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Message sent successfully! We\'ll get back to you soon.';
        formStatus.style.display = 'block';

        // Reset form
        contactForm.reset();

      } catch (error) {
        // Show error message
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Something went wrong. Please try again or email us directly.';
        formStatus.style.display = 'block';
      } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Hide status after 5 seconds
        setTimeout(function() {
          formStatus.style.display = 'none';
        }, 5000);
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Add scroll-based header shadow
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

  // Load quotes from remote JSON
  loadQuotesFromRemoteJson();

  // Initialize quote search (works with static or dynamically loaded cards)
  initQuoteSearch();
});

// Load quotes function (outside DOMContentLoaded to run when called)
function loadQuotesFromRemoteJson() {
  const container = document.querySelector('.quotes-grid');
  if (!container) return;

  const QUOTES_URL = 'https://raw.githubusercontent.com/bitcoinoneliners/Bitcoin-One-Liners/main/quotes.json';

  fetch(QUOTES_URL, { 
    cache: 'no-store',
    mode: 'cors'
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to load quotes JSON: ' + response.status);
      }
      return response.json();
    })
    .then(function(quotes) {
      if (!Array.isArray(quotes)) {
        throw new Error('quotes JSON is not an array');
      }
      container.innerHTML = generateQuoteCards(quotes);
      // No need to re-init search; it re-queries cards on each input event
    })
    .catch(function(err) {
      console.error('Error loading remote quotes:', err);
      // Fallback: original static HTML stays visible
    });
}

// Generate quote cards from JSON data
function generateQuoteCards(quotes) {
  return quotes.map(function(q) {
    var date = (q.month && q.year) ? (q.month + ' ' + q.year) : (q.year || '');
    var featuredClass = q.featured ? ' featured' : '';

    return '<article class="quote-card' + featuredClass + '" data-id="' + (q.id || '') + '">' +
      '<div class="quote-icon">"</div>' +
      '<blockquote class="quote-text">' + escapeHtml(q.text) + '</blockquote>' +
      '<footer class="quote-footer">' +
        '<cite class="quote-author">— ' + escapeHtml(q.author || 'Anonymous') + '</cite>' +
        '<span class="quote-date">' + escapeHtml(date) + '</span>' +
      '</footer>' +
    '</article>';
  }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function(c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
}

// Initialize quote search
function initQuoteSearch() {
  const searchInput = document.querySelector('#quote-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    // Re-query cards on every input so it works with dynamically loaded quotes
    const quoteCards = document.querySelectorAll('.quote-card');

    quoteCards.forEach(function(card) {
      const textEl = card.querySelector('.quote-text');
      const authorEl = card.querySelector('.quote-author');
      const dateEl = card.querySelector('.quote-date');

      const quoteText = textEl ? textEl.textContent.toLowerCase() : '';
      const authorText = authorEl ? authorEl.textContent.toLowerCase() : '';
      const dateText = dateEl ? dateEl.textContent.toLowerCase() : '';

      const haystack = quoteText + ' ' + authorText + ' ' + dateText;

      if (!query || haystack.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}/* -------------------------------------------------
   btc-ticker.js  –  fetches live BTC‑USD price
   ------------------------------------------------- */
(() => {
  const PRICE_ELEMENT = document.querySelector('#btc-ticker .btc-price');
  const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  const UPDATE_INTERVAL_MS = 60_000; // 

  // -----------------------------------------------------------------
  // 1️⃣  Format numbers (e.g. 27634.12 → 27,634.12)
  // -----------------------------------------------------------------
  const fmt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // -----------------------------------------------------------------
  // 2️⃣  Pull price from CoinGecko
  // -----------------------------------------------------------------
  async function fetchPrice() {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      const price = data?.bitcoin?.usd;
      if (price === undefined) throw new Error('Unexpected payload');

      // Update the DOM
      PRICE_ELEMENT.textContent = fmt.format(price);
    } catch (err) {
      console.warn('BTC ticker error:', err);
      // Show a placeholder instead of breaking the UI
      PRICE_ELEMENT.textContent = '---';
    }
  }

  // -----------------------------------------------------------------
  // 3️⃣  Initial load + periodic refresh
  // -----------------------------------------------------------------
  fetchPrice();                     // first call as soon as script runs
  setInterval(fetchPrice, UPDATE_INTERVAL_MS);
})();

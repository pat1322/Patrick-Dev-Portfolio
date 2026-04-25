/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  /* Defer AOS until after the security gate is dismissed */
  if (window.pfGateActive) {
    document.addEventListener('gateDismissed', function () {
      setTimeout(aosInit, 750); // let gate fade out first
    });
  } else {
    window.addEventListener('load', aosInit);
  }

  /**
   * Glitch text cycling — replaces typed.js in the sidebar hero panel
   */
  function initGlitch() {
    var el = document.getElementById('shp-glitch');
    if (!el) return;
    var phrases = [
      'Backends That Scale',
      'Data-Driven Solutions',
      'Full-Stack Applications',
      'High-Performance Systems'
    ];
    var glitchChars = '!<>-_\\/[]{}=+*^?#@$%&~|';
    var idx = 0;
    var raf;

    function rndCh() { return glitchChars[Math.floor(Math.random() * glitchChars.length)]; }

    function revealText(text, done) {
      var t0 = Date.now(), dur = 680;
      function frame() {
        var p = Math.min((Date.now() - t0) / dur, 1);
        var out = '';
        for (var i = 0; i < text.length; i++) {
          var thresh = i / text.length;
          if (p >= thresh + 0.18)      out += text[i];
          else if (p >= thresh)        out += Math.random() > 0.45 ? rndCh() : text[i];
          else                         out += Math.random() > 0.75 ? rndCh() : ' ';
        }
        el.textContent = out;
        if (p < 1) { raf = requestAnimationFrame(frame); } else { el.textContent = text; done(); }
      }
      raf = requestAnimationFrame(frame);
    }

    function dissolveText(text, done) {
      var t0 = Date.now(), dur = 480;
      function frame() {
        var p = Math.min((Date.now() - t0) / dur, 1);
        var out = '';
        for (var i = 0; i < text.length; i++) {
          var alive = 1 - (i / text.length * 0.5 + p * 0.7);
          if (alive > 0.35)      out += text[i];
          else if (alive > 0)    out += rndCh();
          else                   out += ' ';
        }
        el.textContent = out;
        if (p < 1) { raf = requestAnimationFrame(frame); } else { el.textContent = ''; done(); }
      }
      raf = requestAnimationFrame(frame);
    }

    function cycle() {
      var phrase = phrases[idx];
      idx = (idx + 1) % phrases.length;
      el.classList.add('shp-glitch-on');
      revealText(phrase, function() {
        setTimeout(function() {
          el.classList.remove('shp-glitch-on');
          dissolveText(phrase, function() {
            setTimeout(cycle, 800 + Math.random() * 700);
          });
        }, 2000 + Math.random() * 900);
      });
    }

    setTimeout(cycle, 1000);
  }
  if (window.pfGateActive) {
    document.addEventListener('gateDismissed', initGlitch);
  } else {
    window.addEventListener('load', initGlitch);
  }

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();
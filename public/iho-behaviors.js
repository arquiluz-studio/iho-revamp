(function () {
  // ─── COUNTER ANIMATION ───
  var counters = [
    { target: 35, prefix: "+", suffix: "" },
    { target: 17, prefix: "", suffix: "M" },
    { target: 5, prefix: "", suffix: "" },
    { target: 4, prefix: "", suffix: "" },
  ];
  var animated = false;

  function animateCounters(els) {
    if (animated) return;
    animated = true;
    els.forEach(function (el, idx) {
      var c = counters[idx];
      var duration = 1800;
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val = Math.round(ease * c.target);
        el.textContent = c.prefix + val + c.suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      el.textContent = c.prefix + "0" + c.suffix;
      requestAnimationFrame(tick);
    });
  }

  function initCounters() {
    var stats = document.getElementById("iho-stats");
    if (!stats) { setTimeout(initCounters, 300); return; }
    var els = stats.querySelectorAll(".iho-counter");
    if (els.length < 4) { setTimeout(initCounters, 300); return; }
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) animateCounters(Array.prototype.slice.call(els));
    }, { threshold: 0.3 });
    obs.observe(stats);
  }

  // ─── CAROUSEL ───
  var current = 0;
  var total = 5;

  function goSlide(n) {
    current = (n % total + total) % total;
    var track = document.getElementById("iho-carousel-track");
    if (track) track.style.transform = "translateX(-" + current * 20 + "%)";
    for (var i = 0; i < total; i++) {
      var d = document.getElementById("iho-dot-" + i);
      if (d) {
        d.style.width = i === current ? "28px" : "9px";
        d.style.background = i === current ? "#fff" : "rgba(255,255,255,0.45)";
      }
    }
  }

  function initCarousel() {
    var prev = document.getElementById("iho-prev-btn");
    var next = document.getElementById("iho-next-btn");
    if (prev) prev.addEventListener("click", function () { goSlide(current - 1); });
    if (next) next.addEventListener("click", function () { goSlide(current + 1); });
    for (var i = 0; i < total; i++) {
      (function (idx) {
        var dot = document.getElementById("iho-dot-" + idx);
        if (dot) dot.addEventListener("click", function () { goSlide(idx); });
      })(i);
    }
    setInterval(function () { goSlide(current + 1); }, 5000);
  }

  // ─── CARD STAGGER ───
  function initStagger(gridId, delayMs) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.children);
    var seen = false;
    var obs = new IntersectionObserver(function (entries) {
      if (seen || !entries[0].isIntersecting) return;
      seen = true;
      obs.disconnect();
      cards.forEach(function (card, i) {
        setTimeout(function () { card.classList.add("is-visible"); }, i * delayMs);
      });
    }, { threshold: 0.08 });
    obs.observe(grid);
  }

  // ─── HERO PARALLAX ───
  function initParallax() {
    var heroImgs = document.querySelectorAll(".iho-hero-img");
    if (!heroImgs.length) return;
    function update() {
      var shift = Math.min(window.scrollY * 0.025, 25);
      var pos = "50% " + (50 + shift) + "%";
      for (var i = 0; i < heroImgs.length; i++) heroImgs[i].style.objectPosition = pos;
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ─── MOBILE MENU ───
  function initMenu() {
    var btn = document.getElementById("iho-menu-btn");
    var nav = document.querySelector("header nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = btn.classList.toggle("is-open");
      nav.classList.toggle("iho-nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        btn.classList.remove("is-open");
        nav.classList.remove("iho-nav-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("header")) {
        btn.classList.remove("is-open");
        nav.classList.remove("iho-nav-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ─── HIDE NAV ON SCROLL ───
  function initHideNav() {
    var header = document.querySelector("header");
    if (!header) return;
    var lastY = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 80 && y > lastY) header.classList.add("nav-hidden");
      else header.classList.remove("nav-hidden");
      lastY = y;
    }, { passive: true });
  }

  // ─── BRAND LOGO HOVER ───
  function initBrandHover() {
    var logos = document.querySelectorAll(".iho-brand-logo");
    logos.forEach(function (img) {
      img.addEventListener("mouseover", function () { img.style.opacity = "1"; });
      img.addEventListener("mouseout", function () { img.style.opacity = "0.92"; });
    });
  }

  // ─── INIT ALL ───
  setTimeout(function () {
    initCounters();
    initCarousel();
    initStagger("iho-areas-grid", 120);
    initStagger("iho-proj-grid", 100);
    initParallax();
    initMenu();
    initHideNav();
    initBrandHover();
  }, 100);
})();

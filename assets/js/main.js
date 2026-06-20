/* ============================================================
   BestPack Solutions — Interacciones
   ============================================================ */
(function () {
  "use strict";

  var WA_NUMBER = "524448290377";

  /* ---------- Header sticky ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Dropdown "Soluciones" ---------- */
  document.querySelectorAll(".nav-dd-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var dd = btn.parentElement;
      var open = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".nav-dd.open").forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        var b = dd.querySelector(".nav-dd-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Contadores animados ---------- */
  function formatNumber(n, withComma) {
    return withComma ? n.toLocaleString("es-MX") : String(n);
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var withComma = el.getAttribute("data-format") === "comma";
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNumber(Math.floor(eased * target), withComma);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, withComma);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- FAQ: cerrar las demás al abrir una ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Formulario → WhatsApp ---------- */
  var form = document.getElementById("cotizaForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var msg =
        "*Nueva solicitud de cotización — BestPack Solutions*%0A%0A" +
        "*Nombre:* " + encodeURIComponent(v("nombre")) + "%0A" +
        "*Empresa:* " + encodeURIComponent(v("empresa") || "—") + "%0A" +
        "*Correo:* " + encodeURIComponent(v("email")) + "%0A" +
        "*Teléfono:* " + encodeURIComponent(v("telefono") || "—") + "%0A" +
        "*Producto:* " + encodeURIComponent(v("producto")) + "%0A" +
        "*Mensaje:* " + encodeURIComponent(v("mensaje"));
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + msg, "_blank", "noopener");
      var ok = document.getElementById("formMsg");
      if (ok) { ok.style.display = "block"; ok.scrollIntoView({ behavior: "smooth", block: "center" }); }
      form.reset();
    });
  }

  /* ---------- Video hero: cargar solo en escritorio con buena conexión ---------- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo) {
    var vSource = heroVideo.querySelector("source[data-src]");
    var conn = navigator.connection || {};
    var goodConn = !conn.saveData && conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g" && conn.effectiveType !== "3g";
    if (vSource && window.innerWidth >= 1024 && goodConn) {
      vSource.src = vSource.getAttribute("data-src");
      heroVideo.load();
      var pp = heroVideo.play();
      if (pp && pp.catch) pp.catch(function () {});
    }
  }

  /* ---------- Año en footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

/* =========================================================
   Fahim Biplob Bhuiyan — Portfolio
   Shared behaviour (all pages)
   ========================================================= */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- Safe localStorage ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  /* ---------- Theme ---------- */
  var saved = store("theme");
  if (saved === "light") doc.setAttribute("data-theme", "light");

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var light = doc.getAttribute("data-theme") === "light";
      if (light) { doc.removeAttribute("data-theme"); store("theme", "dark"); }
      else { doc.setAttribute("data-theme", "light"); store("theme", "light"); }
    });
  });

  /* ---------- Header: scroll state + mobile menu ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor(p * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Project filters ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll("#project-grid .project-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      cards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.hidden = !show;
        if (show) card.classList.add("in");
      });
    });
  });

  /* ---------- Live preview modal (project pages) ---------- */
  var dlg = document.getElementById("preview-dialog");
  if (dlg && typeof dlg.showModal === "function") {
    var frame = dlg.querySelector("iframe");
    document.querySelectorAll("[data-preview]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var url = btn.getAttribute("data-preview");
        if (frame.getAttribute("src") !== url) frame.setAttribute("src", url);
        dlg.showModal();
      });
    });
    dlg.querySelector(".preview-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  } else {
    // Browsers without <dialog>: preview buttons simply open the live site.
    document.querySelectorAll("[data-preview]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.open(btn.getAttribute("data-preview"), "_blank", "noopener");
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var EMAIL = form.getAttribute("data-email");
    var WA = form.getAttribute("data-wa");
    var endpoint = form.getAttribute("data-endpoint"); // optional: e.g. a Formspree URL

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = "form-status" + (kind ? " " + kind : "");
    }

    function validate() {
      var ok = true;
      form.querySelectorAll(".field").forEach(function (f) {
        var input = f.querySelector("input, textarea, select");
        var err = f.querySelector(".err");
        var msg = "";
        if (input && input.required && !input.value.trim()) msg = "This field is required.";
        else if (input && input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = "Please enter a valid email.";
        f.classList.toggle("invalid", !!msg);
        if (err) err.textContent = msg;
        if (msg) ok = false;
      });
      return ok;
    }

    function values() {
      return {
        name: form.elements["name"].value.trim(),
        email: form.elements["email"].value.trim(),
        service: form.elements["service"].value,
        message: form.elements["message"].value.trim()
      };
    }

    function buildText(v) {
      return "Hi Fahim, I'm " + v.name + ".\n" +
        "Project type: " + v.service + "\n\n" +
        v.message + "\n\n" +
        "Reply to: " + v.email;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements["website"] && form.elements["website"].value) return; // honeypot
      if (!validate()) { setStatus("Please fix the highlighted fields.", "bad"); return; }
      var v = values();

      if (endpoint) {
        setStatus("Sending…");
        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(v)
        }).then(function (r) {
          if (!r.ok) throw new Error("bad response");
          form.reset();
          setStatus("Thanks! Your message has been sent. I'll reply soon.", "ok");
        }).catch(function () {
          setStatus("Couldn't send right now. Please use WhatsApp or email instead.", "bad");
        });
      } else {
        var subject = "Project inquiry from " + v.name + " (" + v.service + ")";
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildText(v));
        setStatus("Opening your email app… If nothing opens, use the WhatsApp button.", "ok");
      }
    });

    var waBtn = form.querySelector("[data-send-wa]");
    if (waBtn) {
      waBtn.addEventListener("click", function () {
        if (!validate()) { setStatus("Please fix the highlighted fields.", "bad"); return; }
        var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(buildText(values()));
        window.open(url, "_blank", "noopener");
        setStatus("Opening WhatsApp…", "ok");
      });
    }

    form.querySelectorAll("input, textarea, select").forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.closest(".field");
        if (f) { f.classList.remove("invalid"); var er = f.querySelector(".err"); if (er) er.textContent = ""; }
      });
    });
  }
})();

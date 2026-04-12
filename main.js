(function () {
  var cookieBanner = document.getElementById("cookieBanner");
  var acceptBtn = document.getElementById("acceptCookies");
  var storageKey = "primerise_cookies_accepted";
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.removeAttribute("hidden");
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      toastEl.setAttribute("hidden", "");
    }, 4200);
  }

  var ageGate = document.getElementById("ageGate");
  var ageGateConfirm = document.getElementById("ageGateConfirm");
  var ageStorageKey = "primerise_age_verified";

  function showCookieBannerIfNeeded() {
    if (cookieBanner && !localStorage.getItem(storageKey)) {
      requestAnimationFrame(function () {
        cookieBanner.classList.add("is-visible");
        if (acceptBtn) {
          try {
            acceptBtn.focus({ preventScroll: true });
          } catch (e) {
            acceptBtn.focus();
          }
        }
      });
    }
  }

  function initGA() {
    var id = document.documentElement.getAttribute("data-ga-id");
    if (!id || !String(id).trim() || String(id).indexOf("XXXX") !== -1) return;
    if (window.__primeriseGaLoaded) return;
    window.__primeriseGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  if (ageGate) {
    if (localStorage.getItem(ageStorageKey)) {
      ageGate.setAttribute("hidden", "");
    } else {
      ageGate.removeAttribute("hidden");
      document.body.classList.add("age-gate-open");
    }
    if (ageGateConfirm) {
      ageGateConfirm.addEventListener("click", function () {
        localStorage.setItem(ageStorageKey, "1");
        ageGate.setAttribute("hidden", "");
        document.body.classList.remove("age-gate-open");
        showCookieBannerIfNeeded();
      });
    }
  }

  if (!ageGate || localStorage.getItem(ageStorageKey)) {
    showCookieBannerIfNeeded();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      localStorage.setItem(storageKey, "1");
      if (cookieBanner) {
        cookieBanner.classList.remove("is-visible");
      }
      initGA();
      var mainEl = document.getElementById("main-content");
      if (mainEl && typeof mainEl.focus === "function") {
        try {
          mainEl.focus({ preventScroll: true });
        } catch (e) {
          mainEl.focus();
        }
      }
    });
  }

  if (localStorage.getItem(storageKey)) {
    initGA();
  }

  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  var navBackdrop = document.getElementById("navBackdrop");
  var siteHeader = document.getElementById("siteHeader");
  var trapNavTab = null;

  function getMobileNavFocusables() {
    if (!navToggle || !mobileNav) return [];
    var links = mobileNav.querySelectorAll("a");
    return [navToggle].concat(Array.prototype.slice.call(links));
  }

  function setMobileNavOpen(open) {
    if (!mobileNav || !navToggle) return;
    if (open) {
      mobileNav.removeAttribute("hidden");
      if (navBackdrop) {
        navBackdrop.removeAttribute("hidden");
        navBackdrop.setAttribute("aria-hidden", "false");
      }
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");
      if (!trapNavTab) {
        trapNavTab = function (e) {
          if (e.key !== "Tab" || !mobileNav || mobileNav.hasAttribute("hidden")) return;
          var list = getMobileNavFocusables();
          if (list.length < 2) return;
          var first = list[0];
          var last = list[list.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        };
        document.addEventListener("keydown", trapNavTab, true);
      }
      var firstLink = mobileNav.querySelector("a");
      if (firstLink) {
        requestAnimationFrame(function () {
          firstLink.focus();
        });
      }
    } else {
      mobileNav.setAttribute("hidden", "");
      if (navBackdrop) {
        navBackdrop.setAttribute("hidden", "");
        navBackdrop.setAttribute("aria-hidden", "true");
      }
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
      if (trapNavTab) {
        document.removeEventListener("keydown", trapNavTab, true);
        trapNavTab = null;
      }
      navToggle.focus();
    }
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.hasAttribute("hidden");
      setMobileNavOpen(open);
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", function () {
        setMobileNavOpen(false);
      });
    }

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMobileNavOpen(false);
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav && !mobileNav.hasAttribute("hidden")) {
      setMobileNavOpen(false);
    }
  });

  function onScroll() {
    var y = window.scrollY || 0;
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", y > 16);
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      window.requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  var prefersReduced =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (typeof window.matchMedia === "function") {
    var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function revealAllIfReduced() {
      if (!motionMq.matches) return;
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
    if (typeof motionMq.addEventListener === "function") {
      motionMq.addEventListener("change", revealAllIfReduced);
    } else if (typeof motionMq.addListener === "function") {
      motionMq.addListener(revealAllIfReduced);
    }
  }

  function getFormEndpoint() {
    var root = document.documentElement;
    var raw = root.getAttribute("data-form-endpoint");
    if (!raw || !String(raw).trim()) return "";
    var trimmed = String(raw).trim();
    if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
      return trimmed;
    }
    if (typeof window === "undefined" || !window.location) return trimmed;
    if (window.location.protocol === "file:") return "";
    try {
      return new URL(trimmed, window.location.origin).href;
    } catch (e) {
      return trimmed;
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var hp = form.querySelector("[data-prime-hp]");
    if (hp && String(hp.value || "").trim() !== "") {
      return;
    }
    var email = form.querySelector('input[type="email"]');
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!email || !email.value) return;

    var endpoint = getFormEndpoint();
    var address = email.value.trim();

    if (!endpoint) {
      showToast("Thanks — you're on the list. We'll be in touch at " + address + ".");
      form.reset();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }

    var payload = {
      email: address,
      _replyto: address,
      _subject: "Prime Rise signup — " + (form.id || "newsletter"),
      form_id: form.id || "",
      page: typeof window.location !== "undefined" ? String(window.location.href) : "",
    };
    if (hp) {
      payload._gotcha = String(hp.value || "").trim();
    }

    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (res.ok) {
          showToast("Thanks — you're on the list. We'll be in touch at " + address + ".");
          form.reset();
          return;
        }
        return res.json().then(
          function (data) {
            var msg =
              (data && (data.error || (data.errors && data.errors[0] && data.errors[0].message))) ||
              "We could not submit your email. Please try again.";
            throw new Error(typeof msg === "string" ? msg : "Submission failed.");
          },
          function () {
            throw new Error("We could not submit your email. Please try again.");
          }
        );
      })
      .catch(function (err) {
        showToast(err && err.message ? err.message : "Something went wrong. Please try again.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
        }
      });
  }

  document.querySelectorAll(".signup-form").forEach(function (form) {
    if (!form.querySelector("[data-prime-hp]")) {
      var trap = document.createElement("input");
      trap.type = "text";
      trap.name = "_gotcha";
      trap.setAttribute("data-prime-hp", "1");
      trap.setAttribute("tabindex", "-1");
      trap.setAttribute("autocomplete", "off");
      trap.setAttribute("aria-hidden", "true");
      trap.className = "signup-form__hp";
      form.insertBefore(trap, form.firstChild);
    }
  });

  document.querySelectorAll(".signup-form").forEach(function (form) {
    form.addEventListener("submit", handleFormSubmit);
  });

  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var scrollReduced =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var backToTopThreshold = 520;

    function updateBackToTop() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > backToTopThreshold) {
        backToTop.removeAttribute("hidden");
      } else {
        backToTop.setAttribute("hidden", "");
      }
    }

    window.addEventListener(
      "scroll",
      function () {
        window.requestAnimationFrame(updateBackToTop);
      },
      { passive: true }
    );
    updateBackToTop();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: scrollReduced ? "auto" : "smooth" });
    });
  }

  var goldenRoot = document.getElementById("goldenRevealRoot");
  var goldenTrigger = document.getElementById("goldenRestoreTrigger");
  var goldenPanel = document.getElementById("goldenRestorePanel");
  var goldenHint = document.getElementById("goldenRevealHint");

  function setGoldenRevealOpen(open) {
    if (!goldenTrigger || !goldenPanel || !goldenRoot) return;
    goldenTrigger.setAttribute("aria-expanded", open ? "true" : "false");
    goldenRoot.classList.toggle("golden-reveal--open", open);
    var sr = goldenTrigger.querySelector(".sr-only");
    if (sr) {
      sr.textContent = open ? "Hide Golden Restore product details" : "Show Golden Restore product details";
    }
    if (open) {
      goldenPanel.removeAttribute("hidden");
      if (typeof window.matchMedia === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (window.innerWidth < 880 && typeof goldenPanel.scrollIntoView === "function") {
          window.requestAnimationFrame(function () {
            goldenPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        }
      }
    } else {
      goldenPanel.setAttribute("hidden", "");
      try {
        goldenTrigger.focus();
      } catch (err) {}
    }
    if (goldenHint) {
      goldenHint.setAttribute("aria-hidden", open ? "true" : "false");
    }
  }

  function goldenRevealClickHandler(e) {
    if (!goldenRoot || !goldenPanel || !goldenTrigger) return;
    var link = e.target.closest && e.target.closest("a");
    if (link && goldenPanel.contains(link)) return;
    var onTrigger = e.target.closest && e.target.closest(".golden-reveal__trigger");
    var onHint = e.target.closest && e.target.closest(".golden-reveal__hint");
    if (!onTrigger && !onHint) return;
    e.preventDefault();
    var open = goldenTrigger.getAttribute("aria-expanded") === "true";
    setGoldenRevealOpen(!open);
  }

  if (goldenTrigger && goldenPanel && goldenRoot) {
    goldenRoot.addEventListener("click", goldenRevealClickHandler);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (goldenTrigger.getAttribute("aria-expanded") === "true") {
        setGoldenRevealOpen(false);
      }
    });
  }
})();

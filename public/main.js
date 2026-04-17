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

  function withRaf(fn) {
    var scheduled = false;
    return function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        fn();
      });
    };
  }

  var onScrollRaf = withRaf(onScroll);
  window.addEventListener(
    "scroll",
    onScrollRaf,
    { passive: true }
  );
  onScroll();

  var prefersReduced =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var connection = typeof navigator !== "undefined" ? navigator.connection || navigator.mozConnection || navigator.webkitConnection : null;
  var saveData = Boolean(connection && connection.saveData);
  var lowPowerDevice =
    typeof navigator !== "undefined" &&
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4;
  var motionLite = !prefersReduced && (saveData || lowPowerDevice);

  if (!prefersReduced) {
    document.documentElement.classList.add("js-motion");
    if (motionLite) {
      document.documentElement.classList.add("motion-lite");
    }
  }

  function initHeroEntrance() {
    if (prefersReduced) return;
    var heroes = document.querySelectorAll(".hero__content");
    if (!heroes.length) return;
    heroes.forEach(function (hero, index) {
      hero.style.setProperty("--hero-enter-delay", Math.min(index * 80, 200) + "ms");
      window.setTimeout(function () {
        hero.classList.add("is-entered");
      }, 30);
    });
  }

  initHeroEntrance();

  function initSectionRhythm() {
    if (prefersReduced) return;
    var blocks = document.querySelectorAll("main > .section, main > .page-hero, main > .products-line-intro");
    if (!blocks.length) return;
    blocks.forEach(function (block, index) {
      if (block.classList.contains("section--photo-banner")) return;
      if (block.classList.contains("section--crafted-intent-page")) return;
      if (block.classList.contains("hero--immersive")) return;
      block.classList.add("section-rhythm");
      block.style.setProperty("--section-rhythm-delay", (index % 3) * 45 + "ms");
    });
  }

  initSectionRhythm();

  if (!prefersReduced && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal, .section-rhythm");
    revealEls.forEach(function (el, index) {
      if (el.style.getPropertyValue("--reveal-delay")) return;
      var stagger = Math.min(index * 45, 220);
      el.style.setProperty("--reveal-delay", stagger + "ms");
    });
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
    document.querySelectorAll(".reveal, .section-rhythm").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (typeof window.matchMedia === "function") {
    var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function revealAllIfReduced() {
      if (!motionMq.matches) return;
      document.querySelectorAll(".reveal, .section-rhythm").forEach(function (el) {
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
        var msg = err && err.message ? String(err.message) : "";
        // Graceful fallback when backend signup storage isn't configured yet.
        if (msg.toLowerCase().indexOf("signup is not configured yet") !== -1) {
          showToast("Thanks — you're on the list. We'll be in touch at " + address + ".");
          form.reset();
          return;
        }
        showToast(msg || "Something went wrong. Please try again.");
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

  function getReviewEndpoint() {
    if (typeof window === "undefined" || !window.location) return "/api/reviews";
    if (window.location.protocol === "file:") return "";
    return new URL("/api/reviews", window.location.origin).href;
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var hp = form.querySelector("[data-prime-review-hp]");
    if (hp && String(hp.value || "").trim() !== "") return;
    var isAuthenticated = form.getAttribute("data-review-authenticated") === "1";
    if (!isAuthenticated) {
      var nextUrl = encodeURIComponent(
        (window.location.pathname || "/") + (window.location.search || "") + "#reviews"
      );
      window.location.href = "/login?next=" + nextUrl;
      return;
    }
    var rating = form.querySelector('input[name="rating"]:checked') || form.querySelector('select[name="rating"]');
    var review = form.querySelector('textarea[name="review"]');
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!rating || !review) return;

    var endpoint = getReviewEndpoint();
    if (!endpoint) {
      showToast("Review form is unavailable on this preview.");
      return;
    }

    var payload = {
      rating: Number(rating.value),
      review: String(review.value || "").trim(),
      page: typeof window.location !== "undefined" ? String(window.location.href) : "",
      _gotcha: hp ? String(hp.value || "").trim() : "",
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }

    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (res.ok) {
          showToast("Thanks! Your review was received and is pending moderation.");
          form.reset();
          var successCard = document.getElementById("reviewSuccess");
          if (successCard) {
            form.setAttribute("hidden", "");
            form.style.display = "none";
            successCard.removeAttribute("hidden");
          }
          return;
        }
        return res.json().then(
          function (data) {
            var msg = (data && data.error) || "We could not submit your review. Please try again.";
            throw new Error(typeof msg === "string" ? msg : "Submission failed.");
          },
          function () {
            throw new Error("We could not submit your review. Please try again.");
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

  document.querySelectorAll(".review-form").forEach(function (form) {
    if (!form.querySelector("[data-prime-review-hp]")) {
      var trap = document.createElement("input");
      trap.type = "text";
      trap.name = "_gotcha";
      trap.setAttribute("data-prime-review-hp", "1");
      trap.setAttribute("tabindex", "-1");
      trap.setAttribute("autocomplete", "off");
      trap.setAttribute("aria-hidden", "true");
      trap.className = "signup-form__hp";
      form.insertBefore(trap, form.firstChild);
    }

    var ratingText = form.querySelector(".review-stars__text");
    var ratingInputs = form.querySelectorAll('input[name="rating"]');
    var ratingLabels = form.querySelectorAll('.review-stars__options label');
    var reviewText = form.querySelector('textarea[name="review"]');
    var reviewCount = form.querySelector("#reviewTextCount");
    var reviewSuccess = document.getElementById("reviewSuccess");
    var reviewAnotherBtn = document.getElementById("reviewAnotherBtn");
    var reviewToggleBtn = document.getElementById("reviewToggleBtn");
    var reviewAuthNote = document.getElementById("reviewAuthNote");
    var ratingWords = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" };
    function setRatingText(value) {
      if (!ratingText) return;
      var n = Number(value);
      if (!n || n < 1 || n > 5) {
        ratingText.textContent = "Select a rating";
        return;
      }
      ratingText.textContent = ratingWords[n] + " (" + n + "/5)";
    }
    function selectedRatingValue() {
      var checked = form.querySelector('input[name="rating"]:checked');
      return checked ? checked.value : "";
    }
    function updateReviewCount() {
      if (!reviewText || !reviewCount) return;
      reviewCount.textContent = String(reviewText.value.length) + " / 1200";
    }

    ratingLabels.forEach(function (label) {
      var htmlFor = label.getAttribute("for") || "";
      var hovered = htmlFor.replace("reviewRating", "");
      label.addEventListener("mouseenter", function () {
        setRatingText(hovered);
      });
      label.addEventListener("focus", function () {
        setRatingText(hovered);
      });
      label.addEventListener("mouseleave", function () {
        setRatingText(selectedRatingValue());
      });
      label.addEventListener("blur", function () {
        setRatingText(selectedRatingValue());
      });
    });

    ratingInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        setRatingText(input.value);
      });
    });
    if (reviewText) {
      reviewText.addEventListener("input", updateReviewCount);
      updateReviewCount();
    }
    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        setRatingText("");
        updateReviewCount();
      }, 0);
    });
    setRatingText(selectedRatingValue());

    // Force initial collapsed state even if stale CSS made form visible.
    form.setAttribute("hidden", "");
    form.style.display = "none";
    if (reviewSuccess) reviewSuccess.setAttribute("hidden", "");
    if (reviewToggleBtn) {
      reviewToggleBtn.removeAttribute("hidden");
      reviewToggleBtn.textContent = "Leave a review";
      reviewToggleBtn.setAttribute("aria-expanded", "false");
    }

    if (reviewToggleBtn) {
      function syncToggleButtonLabel(isOpen) {
        reviewToggleBtn.textContent = isOpen ? "Close review form" : "Leave a review";
      }

      function setReviewFormOpen(isOpen) {
        var auth = form.getAttribute("data-review-authenticated") === "1";
        if (isOpen && !auth) {
          var nextUrl = encodeURIComponent(
            (window.location.pathname || "/") + (window.location.search || "") + "#reviews"
          );
          window.location.href = "/login?next=" + nextUrl;
          return;
        }
        if (isOpen) {
          form.removeAttribute("hidden");
          form.style.display = "";
          reviewToggleBtn.setAttribute("aria-expanded", "true");
          syncToggleButtonLabel(true);
          var nameInput = form.querySelector('input[name="name"]');
          if (nameInput && typeof nameInput.focus === "function") nameInput.focus();
        } else {
          form.setAttribute("hidden", "");
          form.style.display = "none";
          reviewToggleBtn.setAttribute("aria-expanded", "false");
          syncToggleButtonLabel(false);
        }
      }

      function isReviewFormOpen() {
        return !form.hasAttribute("hidden");
      }

      // Defensive: if cached CSS/DOM state differs, normalize on load.
      setReviewFormOpen(false);

      reviewToggleBtn.addEventListener("click", function () {
        setReviewFormOpen(!isReviewFormOpen());
      });

      reviewToggleBtn.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && isReviewFormOpen()) {
          e.preventDefault();
          setReviewFormOpen(false);
        }
      });

      // expose helper to other handlers in this block
      form.__setReviewFormOpen = setReviewFormOpen;
    }

    form.setAttribute("data-review-authenticated", "0");
    fetch("/api/reviews/me", { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("auth unavailable");
        return res.json();
      })
      .then(function (data) {
        var authenticated = Boolean(data && data.authenticated && data.email);
        form.setAttribute("data-review-authenticated", authenticated ? "1" : "0");
        if (reviewAuthNote) {
          if (authenticated) {
            reviewAuthNote.textContent = "Signed in as " + String(data.email);
          } else {
            reviewAuthNote.innerHTML = 'Please <a href="/login?next=%2F%23reviews">sign in</a> to leave a review.';
          }
          reviewAuthNote.removeAttribute("hidden");
        }
      })
      .catch(function () {
        form.setAttribute("data-review-authenticated", "0");
        if (reviewAuthNote) {
          reviewAuthNote.innerHTML = 'Please <a href="/login?next=%2F%23reviews">sign in</a> to leave a review.';
          reviewAuthNote.removeAttribute("hidden");
        }
      });

    if (reviewAnotherBtn) {
      reviewAnotherBtn.addEventListener("click", function () {
        if (reviewSuccess) reviewSuccess.setAttribute("hidden", "");
        if (typeof form.__setReviewFormOpen === "function") {
          form.__setReviewFormOpen(true);
        } else {
          form.removeAttribute("hidden");
          form.style.display = "";
        }
      });
    }

    form.addEventListener("submit", handleReviewSubmit);
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderReviewCard(review, isFirst) {
    var rating = Number(review.rating);
    var safeRating = !rating || rating < 1 ? 1 : rating > 5 ? 5 : rating;
    var stars = "★★★★★".slice(0, safeRating);
    var source = review.source && String(review.source).trim() ? String(review.source).trim() : "Customer review";
    var sourceHtml = isFirst ? '<p class="review-card__source">' + escapeHtml(source) + "</p>" : "";
    return (
      '<article class="review-card' +
      (isFirst ? " review-card--google" : "") +
      '" role="listitem">' +
      sourceHtml +
      '<p class="review-card__rating" aria-label="Rated ' +
      safeRating +
      ' out of 5">' +
      stars +
      "</p>" +
      '<p class="review-card__quote">"' +
      escapeHtml(review.review || "") +
      '"</p>' +
      '<p class="review-card__name">— ' +
      escapeHtml(review.name || "Customer") +
      "</p>" +
      "</article>"
    );
  }

  function initApprovedReviews() {
    var grid = document.querySelector(".reviews-grid");
    var overallScore = document.getElementById("reviewOverallScore");
    var overallStars = document.getElementById("reviewOverallStars");
    var overallCount = document.getElementById("reviewOverallCount");
    if (!grid) return;
    fetch("/api/reviews?limit=6", {
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load reviews");
        return res.json();
      })
      .then(function (data) {
        var reviews = data && Array.isArray(data.reviews) ? data.reviews : [];
        var summary = data && data.summary ? data.summary : null;

        if (summary && overallScore && overallStars && overallCount) {
          var score = Number(summary.overall_rating);
          var count = Number(summary.total_reviews);
          if (count > 0 && score > 0) {
            var rounded = Math.round(score);
            overallScore.textContent = score.toFixed(1);
            overallStars.textContent = "★★★★★".slice(0, rounded);
            overallStars.setAttribute("aria-label", "Overall " + score.toFixed(1) + " out of 5");
            overallCount.textContent = count === 1 ? "Based on 1 review" : "Based on " + count + " reviews";
          } else {
            overallScore.textContent = "5.0";
            overallStars.textContent = "★★★★★";
            overallStars.setAttribute("aria-label", "Overall 5 out of 5");
            overallCount.textContent = "Be the first to review";
          }
        }

        if (!reviews.length) return;
        grid.innerHTML = reviews
          .map(function (review, index) {
            return renderReviewCard(review, index === 0);
          })
          .join("");
      })
      .catch(function () {
        /* Keep static fallback cards if API fails. */
      });
  }

  initApprovedReviews();

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

    var updateBackToTopRaf = withRaf(updateBackToTop);
    window.addEventListener(
      "scroll",
      updateBackToTopRaf,
      { passive: true }
    );
    updateBackToTop();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: scrollReduced ? "auto" : "smooth" });
    });
  }

  function initWhatsAppFloat() {
    if (document.getElementById("whatsapp-float")) return;
    var raw = typeof window.__PRIMERISE_WHATSAPP__ === "string" ? window.__PRIMERISE_WHATSAPP__ : "";
    if (!raw || !String(raw).trim()) return;
    var digits = String(raw).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return;
    var a = document.createElement("a");
    a.id = "whatsapp-float";
    a.className = "whatsapp-float";
    a.href = "https://wa.me/" + digits;
    a.setAttribute("aria-label", "Chat on WhatsApp");
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    document.body.appendChild(a);
  }

  initWhatsAppFloat();
})();

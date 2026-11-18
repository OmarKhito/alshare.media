(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function whenFontsReady(fn) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fn);
    } else {
      fn();
    }
  }

  function setupBackground() {
    var bg = document.querySelector(".site-bg");
    if (!bg || bg.getAttribute("data-bg") !== "video") return;
    var video = bg.querySelector(".site-bg__video");
    if (!video) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function apply() {
      if (reduce.matches) {
        video.pause();
      } else {
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      }
    }
    apply();
    if (reduce.addEventListener) reduce.addEventListener("change", apply);
  }

  function setupExcerpts() {
    var root = document.querySelector("[data-excerpts]");
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll(".excerpt"));
    if (items.length < 2) return;
    if (prefersReducedMotion()) return;

    whenFontsReady(function () {
      var max = 0;
      items.forEach(function (el) {
        max = Math.max(max, el.offsetHeight);
      });
      root.style.minHeight = max + "px";
      root.classList.add("is-rotating");
      items[0].classList.add("is-active");

      var btn = document.querySelector("[data-excerpts-pause]");
      var pauseLabel = btn ? btn.getAttribute("data-label-pause") || btn.textContent : "";
      var resumeLabel = btn ? btn.getAttribute("data-label-resume") || "" : "";
      if (btn) {
        btn.hidden = false;
        btn.setAttribute("aria-pressed", "false");
      }

      var index = 0;
      var timer = null;
      var paused = false;
      var INTERVAL = 6500;

      function show(n) {
        items.forEach(function (el, i) {
          if (i === n) el.classList.add("is-active");
          else el.classList.remove("is-active");
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          index = (index + 1) % items.length;
          show(index);
        }, INTERVAL);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      start();

      if (btn) {
        btn.addEventListener("click", function () {
          paused = !paused;
          if (paused) {
            stop();
            btn.setAttribute("aria-pressed", "true");
            if (resumeLabel) btn.textContent = resumeLabel;
          } else {
            start();
            btn.setAttribute("aria-pressed", "false");
            if (pauseLabel) btn.textContent = pauseLabel;
          }
        });
      }

      window.addEventListener("pagehide", stop);
    });
  }

  setupBackground();
  setupExcerpts();
})();

(function () {
  var widget = document.getElementById('method-widget');
  if (!widget) return;

  var STEPS = [
    'Input: several views of one scene, plus a spatial question.',
    'The MLLM fuses the views into a global allocentric cognitive map, a stable top-down layout of the scene.',
    'A frozen 3D VFM (VGGT + SAM3) builds a geometry-consistent target map. The global reward pulls the predicted map toward it.',
    'Conditioned on the map and the question, the model plans an ordered view trajectory. The local trajectory reward checks each chosen view against the reference order.',
    'Each selected view is grounded into an egocentric map, and the model reads off the answer. Answer and format rewards score the result.',
    'GRPO ties it together, optimizing the whole trajectory with all four rewards at once.'
  ];
  var N = STEPS.length;

  var els = Array.prototype.slice.call(widget.querySelectorAll('[data-step]'));
  var capNo = widget.querySelector('.mw-step-no');
  var capText = widget.querySelector('.mw-step-text');
  var playBtn = widget.querySelector('[data-act="play"]');
  var dotsWrap = widget.querySelector('.mw-dots');
  var trajChips = Array.prototype.slice.call(widget.querySelectorAll('.mw-traj span[data-seq]'));

  var current = 1;
  var playing = false;
  var timer = null;
  var userPaused = false;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build dots
  for (var i = 1; i <= N; i++) {
    (function (n) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Step ' + n);
      b.addEventListener('click', function () { userPaused = true; stop(); setStep(n); });
      dotsWrap.appendChild(b);
    })(i);
  }
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function render() {
    els.forEach(function (el) {
      var s = parseInt(el.dataset.step, 10);
      el.classList.toggle('is-on', s <= current);
      el.classList.toggle('is-active', s === current);
    });
    // Light trajectory chips once planning is revealed
    trajChips.forEach(function (c) {
      c.classList.toggle('lit', current >= 4);
    });
    if (capNo) capNo.textContent = current + ' / ' + N;
    if (capText) capText.textContent = STEPS[current - 1];
    dots.forEach(function (d, idx) { d.classList.toggle('on', idx + 1 === current); });
  }

  function setStep(n) {
    current = Math.max(1, Math.min(N, n));
    render();
  }

  function next() { setStep(current >= N ? 1 : current + 1); }
  function prev() { userPaused = true; stop(); setStep(current <= 1 ? N : current - 1); }

  function play() {
    if (reduced) { setStep(N); return; }
    playing = true;
    playBtn.textContent = '❚❚ Pause';
    clearInterval(timer);
    timer = setInterval(next, 2300);
  }
  function stop() {
    playing = false;
    playBtn.textContent = '▶ Play';
    clearInterval(timer);
  }
  function toggle() { userPaused = !playing ? false : true; playing ? stop() : play(); }

  widget.querySelector('[data-act="prev"]').addEventListener('click', prev);
  widget.querySelector('[data-act="next"]').addEventListener('click', function () { userPaused = true; stop(); next(); });
  playBtn.addEventListener('click', toggle);

  // Allow forcing a step for testing: ?mwstep=4
  var forced = new URLSearchParams(window.location.search).get('mwstep');

  // Initial state: start playing right away (mirrors the teaser widget). A tall
  // widget can fill the screen without its intersectionRatio ever crossing a
  // high threshold, so we never gate the start on a ratio.
  if (reduced) {
    setStep(N);
  } else if (forced) {
    setStep(parseInt(forced, 10) || 1);
  } else {
    setStep(1);
    play();
  }

  // Pause when off-screen to save cycles; resume when back (unless the user paused).
  if (!reduced && !forced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!playing && !userPaused) play(); }
        else if (playing) { stop(); }
      });
    }, { threshold: 0.05 });
    io.observe(widget);
  }
})();

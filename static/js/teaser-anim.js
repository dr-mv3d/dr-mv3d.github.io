(function () {
  var widget = document.getElementById('teaser-widget');
  if (!widget) return;

  var STEPS = [
    'A scene seen from several views, with a question about turning left from image 4 and moving toward the cabinet and potted plant.',
    'Two ways to supervise the answer.',
    'Sparse reward scores only the final answer. The MLLM lays the objects out wrong, nothing corrects the map, and it concludes "A. No".',
    'DR-MV3D reads a geometry-consistent cognitive map off a frozen VFM. The global reward pulls the model’s predicted map to match it, so the objects sit in the right places.',
    'The local trajectory reward keeps the reasoning on the queried views (Image 4, then Image 3), so the egocentric direction comes out right and the answer is "B. Yes".'
  ];
  var N = STEPS.length;

  var els = Array.prototype.slice.call(widget.querySelectorAll('[data-step]'));
  var capNo = widget.querySelector('.mw-step-no');
  var capText = widget.querySelector('.mw-step-text');
  var playBtn = widget.querySelector('[data-act="play"]');
  var dotsWrap = widget.querySelector('.mw-dots');

  var current = 1, playing = false, timer = null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused = false;

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
    if (capNo) capNo.textContent = current + ' / ' + N;
    if (capText) capText.textContent = STEPS[current - 1];
    dots.forEach(function (d, idx) { d.classList.toggle('on', idx + 1 === current); });
  }
  function setStep(n) { current = ((n - 1 + N) % N) + 1; render(); }
  function next() { setStep(current >= N ? 1 : current + 1); }
  function prev() { userPaused = true; stop(); setStep(current - 1); }
  function play() {
    if (reduced) { setStep(N); return; }
    playing = true; playBtn.textContent = '❚❚ Pause';
    clearInterval(timer); timer = setInterval(next, 2600);
  }
  function stop() { playing = false; playBtn.textContent = '▶ Play'; clearInterval(timer); }
  function toggle() { userPaused = !playing ? false : true; playing ? stop() : play(); }

  widget.querySelector('[data-act="prev"]').addEventListener('click', prev);
  widget.querySelector('[data-act="next"]').addEventListener('click', function () { userPaused = true; stop(); next(); });
  playBtn.addEventListener('click', toggle);

  var forced = new URLSearchParams(window.location.search).get('twstep');
  if (reduced) { setStep(N); return; }
  if (forced) { setStep(parseInt(forced, 10) || 1); return; }

  // Autoplay from the start, loop continuously.
  setStep(1);
  play();

  // Pause when fully off-screen to save cycles; resume when back (unless the user paused).
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!playing && !userPaused) play(); }
        else if (playing) { clearInterval(timer); playing = false; playBtn.textContent = '▶ Play'; }
      });
    }, { threshold: 0.05 });
    io.observe(widget);
  }
})();

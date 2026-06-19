/* SVG cognitive-map renderer.
   Draws a paper-style BEV cognitive map (grid, colored object dots with white
   label boxes + dashed callouts, numbered view squares with facing arrows, ego
   compass) from data extracted from the Overleaf TikZ cogmap sources.

   Grid: 10x10, origin top-left, y increases downward (matches the paper).
   Data: { objects:[{x,y,color,lines:[...],lx,ly}], views:[{n,x,y,dir,sel}],
           compass:{x,y}, accent:"#e28c1c" }
*/
(function () {
  var XMLNS = 'http://www.w3.org/2000/svg';
  var U = 10;            // svg units per grid cell
  var ACCENT = '#e28c1c';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function dirVec(d) {
    return { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d] || [0, -1];
  }

  window.renderCogmap = function (el, data) {
    var accent = data.accent || ACCENT;
    var bad = data.tone === 'bad';
    var gridColor = bad ? '#eccccb' : '#cfd6e2';
    var borderColor = bad ? '#c0392b' : '#222';
    var parts = [];

    // ----- grid -----
    var grid = '';
    for (var i = 0; i <= 10; i++) {
      var p = i * U;
      grid += '<line x1="' + p + '" y1="0" x2="' + p + '" y2="100" />';
      grid += '<line x1="0" y1="' + p + '" x2="100" y2="' + p + '" />';
    }
    parts.push('<g stroke="' + gridColor + '" stroke-width="0.3">' + grid + '</g>');
    parts.push('<rect x="0" y="0" width="100" height="100" fill="none" stroke="' + borderColor + '" stroke-width="' + (bad ? 1.0 : 0.8) + '"/>');

    var compact = data.compact;

    // ----- callout lines (under labels) -----
    if (!compact) (data.objects || []).forEach(function (o) {
      parts.push('<line x1="' + (o.lx * U) + '" y1="' + (o.ly * U) + '" x2="' + (o.x * U) + '" y2="' + (o.y * U) +
        '" stroke="#8a90a0" stroke-width="0.34" stroke-dasharray="1 1"/>');
    });

    // ----- object dots -----
    (data.objects || []).forEach(function (o) {
      parts.push('<circle cx="' + (o.x * U) + '" cy="' + (o.y * U) + '" r="' + (compact ? 3.0 : 2.3) + '" fill="' + o.color +
        '" stroke="#555" stroke-width="0.4"/>');
    });

    // ----- object labels (white rounded boxes + text) -----
    if (!compact) (data.objects || []).forEach(function (o) {
      var lines = o.lines || [];
      var maxLen = lines.reduce(function (m, s) { return Math.max(m, s.length); }, 1);
      var fs = 3.0;
      var w = maxLen * 1.55 + 2.6;
      var h = lines.length * (fs + 0.7) + 1.6;
      var cx = o.lx * U, cy = o.ly * U;
      parts.push('<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h +
        '" rx="1.1" fill="#fff" stroke="#9aa0ad" stroke-width="0.35"/>');
      var ty = cy - h / 2 + fs + 0.3;
      var tspans = lines.map(function (s, k) {
        return '<tspan x="' + cx + '" ' + (k === 0 ? 'y="' + ty + '"' : 'dy="' + (fs + 0.7) + '"') + '>' + esc(s) + '</tspan>';
      }).join('');
      parts.push('<text text-anchor="middle" font-size="' + fs + '" font-weight="600" fill="#2b3550" font-family="Pretendard, Noto Sans KR, sans-serif">' + tspans + '</text>');
    });

    // ----- views: squares + facing arrows -----
    var spread = (data.views || []).length;
    var side = spread > 3 ? 7 : 6;
    (data.views || []).forEach(function (v) {
      var cx = v.x * U, cy = v.y * U, hs = side / 2;
      var fill = v.sel ? accent + '22' : '#fff';
      var stroke = v.sel ? accent : '#222';
      // facing arrow
      var dv = dirVec(v.dir), alen = 9;
      var ax1 = cx + dv[0] * hs, ay1 = cy + dv[1] * hs;
      var ax2 = cx + dv[0] * (hs + alen), ay2 = cy + dv[1] * (hs + alen);
      parts.push('<line x1="' + ax1 + '" y1="' + ay1 + '" x2="' + ax2 + '" y2="' + ay2 +
        '" stroke="' + (v.sel ? accent : '#444') + '" stroke-width="0.9" marker-end="url(#cmArrow' + (v.sel ? 'A' : '') + ')"/>');
      parts.push('<rect x="' + (cx - hs) + '" y="' + (cy - hs) + '" width="' + side + '" height="' + side +
        '" rx="0.8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.6"/>');
      parts.push('<text x="' + cx + '" y="' + (cy + 2.0) + '" text-anchor="middle" font-size="4.2" font-weight="700" fill="#1c2436" font-family="Pretendard, Noto Sans KR, sans-serif">' + v.n + '</text>');
      if (v.sel) {
        parts.push('<text x="' + (cx + hs + 1.2) + '" y="' + (cy - hs - 1.0) + '" font-size="3.0" font-weight="700" fill="' + accent + '" font-family="Pretendard, Noto Sans KR, sans-serif">selected</text>');
      }
    });

    // ----- compass -----
    if (data.compass) {
      var ex = data.compass.x * U, ey = data.compass.y * U, r = 3.6;
      var comp = '<circle cx="' + ex + '" cy="' + ey + '" r="0.7" fill="' + accent + '"/>';
      [['up', 0, -1, 'F', 'south'], ['down', 0, 1, 'B', 'north'], ['left', -1, 0, 'L', 'east'], ['right', 1, 0, 'R', 'west']].forEach(function (a) {
        comp += '<line x1="' + ex + '" y1="' + ey + '" x2="' + (ex + a[1] * r) + '" y2="' + (ey + a[2] * r) + '" stroke="#333" stroke-width="0.5" marker-end="url(#cmTick)"/>';
      });
      comp += '<text x="' + ex + '" y="' + (ey - r - 0.6) + '" text-anchor="middle" font-size="2.8" font-weight="700" fill="#333">F</text>';
      comp += '<text x="' + ex + '" y="' + (ey + r + 2.6) + '" text-anchor="middle" font-size="2.8" font-weight="700" fill="#333">B</text>';
      comp += '<text x="' + (ex - r - 1.2) + '" y="' + (ey + 1.0) + '" text-anchor="middle" font-size="2.8" font-weight="700" fill="#333">L</text>';
      comp += '<text x="' + (ex + r + 1.2) + '" y="' + (ey + 1.0) + '" text-anchor="middle" font-size="2.8" font-weight="700" fill="#333">R</text>';
      parts.push(comp);
    }

    var defs = '<defs>' +
      '<marker id="cmArrow" markerWidth="5" markerHeight="5" refX="3.4" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z" fill="#444"/></marker>' +
      '<marker id="cmArrowA" markerWidth="5" markerHeight="5" refX="3.4" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z" fill="' + accent + '"/></marker>' +
      '<marker id="cmTick" markerWidth="4" markerHeight="4" refX="2.6" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 z" fill="#333"/></marker>' +
      '</defs>';

    el.innerHTML = '<svg viewBox="-15 -12 130 126" xmlns="' + XMLNS + '" role="img" aria-label="Cognitive map">' +
      defs + parts.join('') + '</svg>';
  };
})();

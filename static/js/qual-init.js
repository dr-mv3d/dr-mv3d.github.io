/* Cognitive-map data for the qualitative examples, extracted from the
   Overleaf TikZ sources (assets/cogmap/GT/*). Rendered as live SVG. */
(function () {
  if (typeof renderCogmap !== 'function') return;

  var among = {
    objects: [
      { x: 5, y: 5, color: '#FF5C87', lines: ['toy helicopter', '(forward)'], lx: 3.25, ly: 6.45 },
      { x: 5, y: 8, color: '#EBE130', lines: ['window', '(back)'], lx: 6.0, ly: 9.2 },
      { x: 2, y: 5, color: '#F1714B', lines: ['lots of toys', '(forward-left)'], lx: 1.4, ly: 4.0 },
      { x: 5, y: 2, color: '#5096FF', lines: ['wall', '(forward)'], lx: 3.7, ly: 1.1 },
      { x: 8, y: 5, color: '#32B45A', lines: ['printed glass door', '(forward-right)'], lx: 8.2, ly: 3.6 }
    ],
    views: [
      { n: 1, x: 5, y: 7, dir: 'up', sel: true },
      { n: 2, x: 3, y: 5, dir: 'right' },
      { n: 3, x: 5, y: 3, dir: 'down' },
      { n: 4, x: 7, y: 5, dir: 'left' }
    ],
    compass: { x: 9, y: 9 }
  };

  var rotation = {
    objects: [
      { x: 8, y: 3, color: '#F1714B', lines: ['bed', '(forward-right)'], lx: 8.0, ly: 1.2 },
      { x: 8, y: 5, color: '#EBE130', lines: ['window', '(right)'], lx: 8.0, ly: 6.4 },
      { x: 5, y: 3, color: '#32B45A', lines: ['study table', 'and black chair', '(forward)'], lx: 3.5, ly: 1.2 }
    ],
    views: [
      { n: 1, x: 4.55, y: 4.55, dir: 'left', sel: true },
      { n: 2, x: 5.0, y: 5.0, dir: 'up' },
      { n: 3, x: 5.45, y: 5.45, dir: 'right' }
    ],
    compass: { x: 9, y: 9 }
  };

  // Teaser: the baseline's INCONSISTENT map. Its reasoning places the printed
  // glass door "behind", so its mental map puts the door at the back cell and
  // pushes the window aside. This visualizes the error the sparse reward never fixes.
  var amongBad = {
    tone: 'bad',
    objects: [
      { x: 5, y: 5, color: '#FF5C87', lines: ['toy helicopter', '(forward)'], lx: 3.25, ly: 6.45 },
      { x: 5, y: 8, color: '#32B45A', lines: ['printed glass door', '(back) ?'], lx: 6.2, ly: 9.2 },
      { x: 8, y: 5, color: '#EBE130', lines: ['window', '(forward-right) ?'], lx: 8.2, ly: 3.6 },
      { x: 2, y: 5, color: '#F1714B', lines: ['lots of toys', '(forward-left)'], lx: 1.4, ly: 4.0 },
      { x: 5, y: 2, color: '#5096FF', lines: ['wall', '(forward)'], lx: 3.7, ly: 1.1 }
    ],
    views: [{ n: 1, x: 5, y: 7, dir: 'up', sel: true }],
    compass: { x: 9, y: 9 }
  };

  // Teaser scene as a compact BEV grid (positions derived from the PPTX layer
  // coordinates). In the consistent map the black sofa is at the back and the
  // cabinet+plant at the front; the MLLM map swaps them (inconsistent).
  var COL = { lsofa: '#c9b89a', bsofa: '#333333', bottle: '#e0a800', plant: '#2e8b57', stool: '#d8453a' };
  var teaserOK = {
    objects: [
      { x: 2, y: 3, color: COL.lsofa, lines: ['light sofa'], lx: 1.5, ly: 1.2 },
      { x: 7, y: 2, color: COL.bsofa, lines: ['black sofa'], lx: 8.2, ly: 1.0 },
      { x: 5, y: 4, color: COL.bottle, lines: ['yellow bottle'], lx: 2.6, ly: 5.2 },
      { x: 5, y: 7, color: COL.plant, lines: ['cabinet &', 'potted plant'], lx: 4.2, ly: 8.9 },
      { x: 8, y: 5, color: COL.stool, lines: ['red stool'], lx: 8.6, ly: 6.6 }
    ],
    compass: { x: 1.4, y: 8.6 }
  };
  var teaserBad = {
    tone: 'bad',
    objects: [
      { x: 2, y: 3, color: COL.lsofa, lines: ['light sofa'], lx: 1.5, ly: 1.2 },
      { x: 5, y: 2, color: COL.plant, lines: ['cabinet &', 'potted plant'], lx: 4.4, ly: 0.6 },
      { x: 5, y: 4, color: COL.bottle, lines: ['yellow bottle'], lx: 2.6, ly: 5.2 },
      { x: 4, y: 7, color: COL.bsofa, lines: ['black sofa'], lx: 4.0, ly: 8.9 },
      { x: 8, y: 5, color: COL.stool, lines: ['red stool'], lx: 8.6, ly: 6.6 }
    ],
    compass: { x: 1.4, y: 8.6 }
  };

  function go() {
    var a = document.getElementById('cog-among');
    var r = document.getElementById('cog-rotation');
    var cm = document.getElementById('cog-method');
    var cme = document.getElementById('cog-method-ego');
    var tgw = document.getElementById('tgrid-mllm');
    var tgo = document.getElementById('tgrid-ok');
    if (tgw) renderCogmap(tgw, teaserBad);
    if (tgo) renderCogmap(tgo, teaserOK);
    // method EgoMap: the scene rotated into Image 1's frame. The agent looks
    // forward, so "forward" objects are ahead and "Window (back)" sits behind it.
    if (cme) renderCogmap(cme, {
      objects: [
        { x: 5, y: 4.6, color: '#FF5C87', lines: ['toy helicopter', '(forward)'], lx: 2.9, ly: 5.4 },
        { x: 5, y: 9.0, color: '#EBE130', lines: ['window', '(back)'], lx: 6.7, ly: 9.3 },
        { x: 2.6, y: 4.0, color: '#F1714B', lines: ['lots of toys', '(forward-left)'], lx: 1.6, ly: 2.4 },
        { x: 5, y: 2.4, color: '#5096FF', lines: ['wall', '(forward)'], lx: 3.3, ly: 1.4 },
        { x: 7.6, y: 4.0, color: '#32B45A', lines: ['printed glass door', '(forward-right)'], lx: 8.2, ly: 2.4 }
      ],
      views: [{ n: '1', x: 5, y: 7, dir: 'up', sel: true }],
      compass: { x: 9, y: 9 }
    });
    if (a) renderCogmap(a, among);
    if (r) renderCogmap(r, rotation);
    if (cm) renderCogmap(cm, among);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

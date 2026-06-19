# DR-MV3D — Project Page

Static project page for **"Dense Reward for Multi-View 3D Reasoning with Global Maps and Local Views" (DR-MV3D)**.

Built on the [Nerfies](https://github.com/nerfies/nerfies.github.io) / academic-project-page layout (Bulma). Fully static — no build step.

## Local preview

```bash
cd dr-mv3d-page
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html                 # single-page site
static/
  css/                     # bulma + carousel + slider (vendored) + index.css
  js/                      # bulma-carousel, bulma-slider, index.js
  images/                  # teaser + figures (extracted from the paper/teaser)
  pdfs/paper.pdf           # the paper
```

## Deploy to GitHub Pages

This repo (`dr-mv3d/dr-mv3d.github.io`) is a `*.github.io` repo, so it serves at the org root.

```bash
git remote add origin git@github.com:dr-mv3d/dr-mv3d.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `root`**.
The site appears at `https://dr-mv3d.github.io/`.

All asset paths are **relative**, so it works both at a domain root and under a `/repo/` subpath.

## TODO before publishing

- [ ] Make the **arXiv** / **Code** buttons live once public: in `index.html` swap each `<span class="button is-rounded is-soon">` for `<a href="...">` and drop the `is-soon` class + `coming soon` tag.
- [ ] Confirm the **ECCV 2026** venue badge (change/remove if under review).
- [ ] Update author profile links (`href="#"`) if desired.
- [ ] Double-check the BibTeX entry once the paper is published.

## Assets provenance

- `teaser.png` exported from `teaser_dense_reward_선호.pptx`.
- `fig2_cogmap.png`, `fig3_framework.png`, `fig4_among.png`, `fig5_rotation.png` rendered from the paper PDF at 300 dpi and cropped.
- Result tables are hand-encoded HTML (Tables 1 to 5 of the paper) for accessibility and responsiveness.

### Live SVG cognitive-map renderer (`static/js/cogmap.js`)

`renderCogmap(el, data)` draws the paper-style BEV cognitive map (grid, colored object dots with white label
boxes and dashed callouts, numbered view squares with facing arrows, ego compass) as inline SVG. The data for each
map is extracted from the Overleaf TikZ sources (`assets/cogmap/GT/*.tex`) and lives in `static/js/qual-init.js`.
Reused by the qualitative cards and the teaser widget.

### Qualitative section (real HTML, not image crops)

Each example (`among_group646`, `rotation_group005`) is a styled card built from source: real multi-view photos
(`assets/images/<group>/`), the VFM scene (`assets/scene/*.pdf` rasterized), a live SVG cognitive map, and the
Question / baseline / ours reasoning text taken from `figures/figure_03.tex` and `figure_04.tex`.

### Teaser widget (`static/js/teaser-anim.js`, `static/css/teaser-widget.css`)

An animated sparse-vs-dense contrast: existing MLLM (answer-only reward, wrong answer) beside DR-MV3D (global +
local rewards with the live cognitive map, correct answer). Auto-plays on scroll; `?twstep=N` jumps to a step. The
full paper teaser stays available under a collapsible.

### Interactive method widget (`static/js/method-anim.js`, `static/css/method-widget.css`)

Built element by element from the Overleaf source (`_ECCV_2026__Dense_Reward_for_3D_Reasoning.zip`):

- `mv1..mv4.jpg` from `figures/intro_figure/multi-view-images/` (the real multi-view input).
- `vfm_scene.png` from `figures/sup_figures/scene/semantic_scene.png` (VGGT + SAM3 reconstruction).
- `bev_cogmap.png` from `figures/sup_figures/scene/06_bev_cogmap_*.png` (the BEV cognitive map with viewpoint arrows).
- `ego_view.png` from `figures/sup_figures/segmentation/03_detection_view1_*.png` (grounded egocentric view).

The widget steps through the pipeline (input, global map, VFM target, view planning, egocentric grounding, GRPO),
fading each stage in and lighting its reward. It auto-plays on scroll, supports Play/Prev/Next and step dots, and
honors `prefers-reduced-motion`. Append `?mwstep=N` to the URL to jump to a step (useful for screenshots).

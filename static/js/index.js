document.addEventListener('DOMContentLoaded', function () {
  // Qualitative carousel
  if (window.bulmaCarousel) {
    bulmaCarousel.attach('#qual-carousel', {
      slidesToScroll: 1,
      slidesToShow: 1,
      loop: true,
      infinite: true,
      autoplay: false,
      navigation: true,
      pagination: true,
    });
  }

  // Sliders (if any are added later)
  if (window.bulmaSlider) {
    bulmaSlider.attach();
  }
});

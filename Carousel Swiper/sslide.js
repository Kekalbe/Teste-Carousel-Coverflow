document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".swiper", {
    effect: "cards",
    grabCursor: true,
    loop: false,
    slidesPerView: "auto",
    centeredSlides: true,
    cardsEffect: {
      perSlideOffset: 45,
      perSlideRotate: 2,
      rotate: true,
      slideShadows: true
    },
    on: {
      click(event) {
        swiper.slideTo(this.clickedIndex);
      }
    }
  });

  document.querySelectorAll(".swiper-slide").forEach((slide, index) => {
    slide.addEventListener("click", () => {
      swiper.slideToLoop(index);
    });
  });
});
$(function () {

    var swiperPartner = new Swiper('.swiper.swiperPartner', {
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        speed: 5000,
        slidesPerView: 6,
        spaceBetween: 20,
        loop: true,
        freeMode: true,
        grabCursor: true,
        breakpoints: {
            1025: {
                slidesPerView: 6
            },
            767: {
                slidesPerView: 4
            },
            230: {
                slidesPerView: 3
            }
        },
    });

});


$(function () {
    var swiperTestimonial = new Swiper('.swiper.swiperTestimonial', {
        autoplay: {
            delay: 5000,
        },
        speed: 2000,
        slidesPerView: 3,
        spaceBetween: 50,
        loop: true,
        hasNavigation: true,
        grabCursor: true,
        breakpoints: {
            1025: {
                slidesPerView: 3,
            },
            769: {
                slidesPerView: 2
            },
            319: {
                slidesPerView: 1,
            },
        },
    });
});


$(function () {
    $('.swiper.swiperProducts').each(function () {
        var swiperProducts = new Swiper(this, {
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            speed: 1000,
            loop: true,
            slidesPerView: 1,
            spaceBetween: 10,
            grabCursor: true,
            observer: true,
            observeParents: true,
            breakpoints: {
                1200: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                992: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
                0: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                },
            },
            pagination: {
                enabled: false,
            },
        });
    });
});

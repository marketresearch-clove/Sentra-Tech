// Dynamically determine correct path prefix based on current location
const pathPrefix = (window.location.pathname.includes('/Solutions/') || window.location.pathname.includes('/Products/') || window.location.pathname.includes('/Case_studies/') || window.location.pathname.includes('/Article/') || window.location.pathname.includes('/Blogs/')) ? '../' : './';
Promise.all([
    fetch(pathPrefix + "header.html").then(res => res.text()),
    fetch(pathPrefix + "footer.html").then(res => res.text()),
    fetch(pathPrefix + "sidebar.html").then(res => res.text()),
    fetch(pathPrefix + "search-form.html").then(res => res.text())
])
    .then(([headerHTML, footerHTML, sidebarHTML, searchHTML]) => {
        $("#header").html(headerHTML);
        $("#footer").html(footerHTML);
        $("#sidebar").html(sidebarHTML);
        $("#edit-sidebar").html(sidebarHTML);
        $("#search-form-container").html(searchHTML);
        fixNavLinks();
    })
    .then(() => {
        initBannerVideo();
        initNavLink();
        initSidebar();
        initEditSidebar();
        initSidebarDropdown();
        initCounter();
        initThemeSwitch();
        initScrollHeader();
        initSearchBar();
        initSubmitContact();
        initSubmitNewsletter();
        initAnimateData();
        initLoadMoreStories();
        // Initialize dropdown handler after header is loaded
        if (typeof initDropdownHandler === 'function') {
            initDropdownHandler();
        }
    });

function fixNavLinks() {
    const isInSubfolder = window.location.pathname.includes('/Solutions/') || window.location.pathname.includes('/Products/');

    if (isInSubfolder) {
        $("#header a[href], #footer a[href], #sidebar a[href]").each(function () {
            const href = $(this).attr('href');
            if (href && href.startsWith('./') && !href.startsWith('../')) {
                $(this).attr('href', '../' + href.substring(2));
            }
        });
    }
}

function initBannerVideo() {
    var player;

    var $tag = $('<script>', { src: "https://www.youtube.com/iframe_api" });
    $('script').first().before($tag);

    // Homepage Hero section video
    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('banner-video-background', {
            videoId: 'Hgg7M3kSqyE',
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'mute': 1,
                'loop': 1,
                'playlist_3': '_YAscQDop3E',
                'playlist_2': 'iF19lWWG6UM',
                'playlist_4': 'Jn3-3Gnmg1k',
                'playlist': 'Hgg7M3kSqyE',
                'showinfo': 0,
                'rel': 0,
                'enablejsapi': 1,
                'disablekb': 1,
                'modestbranding': 1,
                'iv_load_policy': 3,
                'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        event.target.playVideo();
        setYoutubeSize();
        $(window).on('resize', setYoutubeSize);
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            player.playVideo();
        }
    }

    function setYoutubeSize() {
        var $container = $('.banner-video-container');
        var containerWidth = $container.outerWidth();
        var containerHeight = $container.outerHeight();
        var aspectRatio = 16 / 9;
        var newWidth, newHeight;

        if (containerWidth / containerHeight > aspectRatio) {
            newWidth = containerWidth;
            newHeight = containerWidth / aspectRatio;
        } else {
            newWidth = containerHeight * aspectRatio;
            newHeight = containerHeight;
        }

        if (player && player.getIframe) {
            var $iframe = $(player.getIframe());
            $iframe.width(newWidth).height(newHeight);
        }
    }

    function handleYouTubeErrors() {
        window.addEventListener('message', function (event) {
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                var data = JSON.parse(event.data);

            } catch (e) {

            }
        });
    }
}

function initThemeSwitch() {
    let lightMode = false;

    if (localStorage.getItem('lightmode') === 'active') {
        lightMode = true;
        $('body').addClass('lightmode');
    }

    const updateLogos = () => {
        const sidebarLogos = $('.sidebar .site-logo');
        const headerLogos = $('.navbar-brand .site-logo');
        const partnerLogos = $('.partner-logo');
        const navbarToggler = $('.navbar-toggler.nav-btn .fa-solid.fa-bars');
        const closeBtn = $('.close-btn');

        // Specific icons to apply greyscale in light mode
        const chooseUsIcons = $('img[src*="iot_icon.png"], img[src*="Digital_Solutions_icon.png"], img[src*="Transparent_icon.png"]');

        if (lightMode) {
            $('body').addClass('lightmode');
            localStorage.setItem('lightmode', 'active');

            sidebarLogos.attr('src', pathPrefix + 'image/sentra_black_1.svg');
            headerLogos.attr('src', pathPrefix + 'image/sentra_white_1.svg');

            // Change navbar toggle and close button colors to black in light mode
            navbarToggler.css('color', '#000000');
            closeBtn.css('color', '#000000');

            // Apply dark greyscale filter to specific choose us icons in light mode
            chooseUsIcons.css('filter', 'grayscale(100%) brightness(0.3)');

            partnerLogos.each(function () {
                const $img = $(this);
                const src = $img.attr('src');
                if (!src.includes('')) {
                    $img.attr('src', src.replace('.png', '.png'));
                }
            });
        } else {
            $('body').removeClass('lightmode');
            localStorage.removeItem('lightmode');

            sidebarLogos.attr('src', pathPrefix + 'image/sentra_white_1.svg');
            headerLogos.attr('src', pathPrefix + 'image/sentra_white_1.svg');

            // Reset navbar toggle and close button colors in dark mode (remove inline styles)
            navbarToggler.css('color', '');
            closeBtn.css('color', '');

            // Remove greyscale filter from choose us icons in dark mode
            chooseUsIcons.css('filter', '');

            partnerLogos.each(function () {
                const $img = $(this);
                const src = $img.attr('src');
                $img.attr('src', src.replace('.png', '.png'));
            });
        }
    };

    updateLogos();

    const observer = new MutationObserver(() => {
        updateLogos();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    $('#themeSwitch').on('click', function () {
        lightMode = !lightMode;
        updateLogos();

        const iconClass = lightMode ? 'fa-sun' : 'fa-moon';
        $('#themeIcon')
            .removeClass('fa-sun fa-moon')
            .addClass(iconClass);
    });
}



$(document).ready(function () {
    initThemeSwitch();
});

function initCounter() {
    var $counters = $(".counter");

    function updateCount($counter) {
        var target = +$counter.data("target");
        var count = +$counter.text().replace("+", "");
        var duration = 2000;
        var steps = 60;
        var increment = Math.max(1, Math.ceil(target / steps));
        var delay = Math.floor(duration / (target / increment));

        if (count < target) {
            var nextCount = Math.min(target, count + increment);
            $counter.text(nextCount);
            setTimeout(function () {
                updateCount($counter);
            }, delay);
        } else {
            $counter.text(target);
        }
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var $counter = $(entry.target);
                updateCount($counter);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    $counters.each(function () {
        observer.observe(this);
    });
}

function initNavLink() {
    const currentUrl = window.location.href;
    $(".navbar-nav .nav-link").each(function () {
        if (this.href === currentUrl) {
            $(this).addClass("active");
        }
    });
    $(".navbar-nav .dropdown-menu .dropdown-item").each(function () {
        if (this.href === currentUrl) {
            $(this).closest(".dropdown").find(".nav-link.dropdown-toggle").addClass("active");
        }
    });
}

$(function () {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add(entry.target.getAttribute('data-animate'));
                    entry.target.style.opacity = 1;

                    observer.unobserve(entry.target);
                }, delay);
            }
        });
    }, {
        threshold: 0.1
    });
    elements.forEach(el => observer.observe(el));
});

function initSidebar() {
    const $menuBtn = $('.nav-btn');
    const $closeBtn = $('.close-btn');
    const $overlay = $('.sidebar-overlay');
    const $sidebar = $('.sidebar');

    $menuBtn.click(function () {
        $overlay.addClass('active');
        setTimeout(() => {
            $sidebar.addClass('active');
        }, 200);
    });

    $closeBtn.click(function () {
        $sidebar.removeClass('active');
        setTimeout(() => {
            $overlay.removeClass('active');
        }, 200);
    });

    $overlay.click(function () {
        $sidebar.removeClass('active');
        setTimeout(() => {
            $overlay.removeClass('active');
        }, 200);
    });
}

function initEditSidebar() {
    const $contentBtn = $('.content-edit');
    const $closeBtn = $('.close-btn-second');
    const $overlay = $('.content-overlay');
    const $sidebar = $('.content-edit-sidebar');

    $contentBtn.click(function () {
        $sidebar.addClass('active');
        setTimeout(() => {
            $overlay.addClass('active');
        }, 200);
    });

    $closeBtn.click(function () {
        $sidebar.removeClass('active');
        setTimeout(() => {
            $overlay.removeClass('active');
        }, 200);
    });
}

function initSidebarDropdown() {
    const $dropdownButtons = $(".sidebar-dropdown-btn");

    $dropdownButtons.each(function () {
        $(this).on("click", function () {
            const $dropdownMenu = $(this).parent().next(".sidebar-dropdown-menu");
            const isOpen = $dropdownMenu.hasClass("active");

            $(".sidebar-dropdown-menu").not($dropdownMenu).removeClass("active");

            $dropdownMenu.toggleClass("active", !isOpen);
        });
    });
}


function initSearchBar() {
    const $searchBtn = $(".search-btn");
    const $overlay = $(".search-overlay");
    const $closeBtn = $(".search-close");

    if ($overlay.length === 0) return;

    $searchBtn.on("click", function () {
        $overlay.addClass("active");
        setTimeout(() => {
            $overlay.addClass("active");
        }, 200);
    });

    $closeBtn.on("click", function () {
        $overlay.removeClass("active");
        setTimeout(() => {
            $overlay.removeClass("active");
        }, 200);
    });

    $overlay.on("click", function (e) {
        if ($(e.target).hasClass("search-overlay")) {
            $overlay.removeClass("active");
        }
    });
}



$(document).ready(function () {
    const data = [
        {
            title: "Home",
            description: "Empowering infrastructure with next-generation Smart Structural Health Monitoring (SHM) systems. SENTRA delivers IoT-based sensing, data analytics, and predictive maintenance solutions for bridges, railways, and industrial structures across India. Explore our technology that ensures safer, smarter, and more reliable assets.",
            url: "index.html"
        },
        {
            title: "About",
            description: "About SENTRA | Hill 2, Plot No. 9, Pedda Rushikonda, Visakhapatnam. SENTRA specializes in Structural Health Monitoring, IoT-driven asset tracking, and predictive maintenance systems for large-scale infrastructure. Our mission is to enhance safety, sustainability, and longevity through advanced sensor technologies and intelligent data analytics.",
            url: "about.html"
        },
        {
            title: "Services",
            description: "Our Core Services | SENTRA offers end-to-end IoT and Monitoring Solutions — including Structural Health Monitoring (SHM), IoT Sensor Deployment, Data Acquisition Systems, Predictive Analytics, and Remote Infrastructure Monitoring. Our solutions are tailored for bridges, buildings, and industrial projects to ensure operational excellence.",
            url: "service.html"
        },
        {
            title: "Single Services",
            description: "Structural Health Monitoring | SENTRA provides real-time insights into structural performance using advanced sensors, gateways, and analytics platforms. Our technology detects stress, strain, and vibration anomalies early to prevent potential failures and improve asset reliability.",
            url: "single_services.html"
        },
        {
            title: "Case Studies",
            description: "Explore SENTRA Case Studies — Discover how our IoT-driven SHM systems have improved safety and reliability across India’s bridges, railway lines, and industrial plants. See the measurable benefits in data accuracy, cost reduction, and preventive maintenance efficiency.",
            url: "case_studies.html"
        },
        {
            title: "Our Team",
            description: "Meet the SENTRA Team — A group of engineers, IoT specialists, and data scientists dedicated to redefining how infrastructure is monitored. Our team combines expertise in electronics, civil engineering, and analytics to deliver reliable SHM solutions for the real world.",
            url: "team.html"
        },
        {
            title: "Partnership",
            description: "Strong Partnerships, Proven Success | SENTRA collaborates with leading research institutes, contractors, and public sector organizations to develop advanced monitoring systems for infrastructure safety. Join hands with us to make data-driven decisions for a more resilient tomorrow.",
            url: "partnership.html"
        },
        {
            title: "Pricing Plan",
            description: "Flexible Pricing Plans | SENTRA offers scalable IoT monitoring packages for projects of all sizes. From single-site bridge monitoring to full-scale multi-structure SHM solutions, our plans are designed to deliver maximum insights with minimal complexity.",
            url: "pricing.html"
        },
        {
            title: "Testimonial",
            description: "What Our Clients Say | SENTRA’s SHM systems have transformed maintenance practices across railways, bridges, and smart city infrastructures. Clients appreciate the precision, stability, and reliability of our real-time IoT monitoring solutions that enhance safety and reduce downtime.",
            url: "testimonial.html"
        },
        {
            title: "FAQs",
            description: "Frequently Asked Questions | Have questions about SENTRA’s IoT and SHM systems? Learn how our sensors work, what data they capture, and how predictive analytics can prevent structural failures. Contact our team at +91 88857 30066 for personalized guidance.",
            url: "faq.html"
        },
        {
            title: "Error 404",
            description: "404 — Oops! Page Not Found. The page you’re looking for might have been moved or temporarily unavailable. Return to SENTRA Home to explore our Smart Monitoring Solutions for infrastructure and industrial applications.",
            url: "404_page.html"
        },
        {
            title: "Blog",
            description: "Our Blog | Explore insights on Structural Health Monitoring, IoT innovations, data analytics, and smart infrastructure development. Learn how SENTRA is driving digital transformation in the monitoring of critical assets across India.",
            url: "blog.html"
        },
        {
            title: "Single Post",
            description: "Enhancing Infrastructure Reliability with IoT | SENTRA’s case-based insights highlight how real-time data from vibration, strain, and tilt sensors can prevent catastrophic failures. Learn from our field studies and see how SHM is shaping modern engineering.",
            url: "single_post.html"
        },
        {
            title: "Contact Us",
            description: "Contact SENTRA | Reach out to us for end-to-end IoT monitoring solutions, structural safety assessments, and system integrations. Address: Hill 2, Plot No. 9, Pedda Rushikonda, Rushikonda, Visakhapatnam, Andhra Pradesh 530045. Phone: +91 88857 30066. Email: info@sentra.com",
            url: "contact.html"
        }
    ];

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q");

    const $resultContainer = $("#search-results");
    const $resultTitle = $("#result-title");

    if (keyword) {
        $resultTitle.text(`Search Result for "${keyword}" SENTRA - SMART IOT SOLUTIONS`);

        const result = data.filter(item =>
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.description.toLowerCase().includes(keyword.toLowerCase())
        );

        if (result.length > 0) {
            result.forEach(item => {
                const $div = $("<div>").addClass("result").html(`
                    <a href="${item.url}"><h2>${item.title}</h2></a>
                    <p>${item.description}</p>
                `);
                $resultContainer.append($div);
            });
        } else {
            $resultContainer.html(`<p>No results found for the keyword.</p>`);
        }
    } else {
        $resultTitle.text("Enter search keywords.");
    }
});

function initAnimateData() {
    const $elements = $('[data-animate]');
    const observer = new window.IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const $el = $(entry.target);
                const delay = $el.data('delay') || 0;
                setTimeout(() => {
                    $el.addClass($el.data('animate'));
                    $el.css('opacity', 1);
                    observer.unobserve(entry.target);
                }, delay);
            }
        });
    }, {
        threshold: 0.1
    });
    $elements.each(function () {
        observer.observe(this);
    });
}

function initScrollHeader() {
    const header = document.querySelector('header');
    const threshold = 80;

    function toggleScrolled() {
        if (window.scrollY > threshold) {
            header.classList.add('scrolled');
            document.body.style.paddingTop = header.offsetHeight + 'px';
        } else {
            header.classList.remove('scrolled');
            document.body.style.paddingTop = '0';
        }
    }

    window.addEventListener('scroll', toggleScrolled);
    toggleScrolled(); // check on load
}


function initLoadMoreStories() {
    const $loadMoreBtn = $('#load-more-stories');
    if ($loadMoreBtn.length === 0) return;

    // Show 4 "cards" per click
    const cardsPerClick = 4;

    // Select all hidden case-study rows
    let $hiddenRows = $('.hidden-case-study');

    // Make sure they are hidden initially
    $hiddenRows.css('display', 'none');

    $loadMoreBtn.off('click').on('click', function () {
        // Refresh the list of still-hidden rows
        $hiddenRows = $('.hidden-case-study');

        if ($hiddenRows.length === 0) {
            $loadMoreBtn.fadeOut();
            return;
        }

        // Determine how many cards per row (for grouping)
        const sampleRow = $hiddenRows.first();
        const cardsPerRow = sampleRow.find('.case-studies-content, .blog-content, .card').length || 2;
        const rowsPerClick = Math.ceil(cardsPerClick / cardsPerRow);

        // Reveal that many rows
        const $toShow = $hiddenRows.slice(0, rowsPerClick);
        $toShow.each(function (i, row) {
            const $row = $(row);
            setTimeout(() => {
                $row.css('display', 'flex');
                $row.removeClass('hidden-case-study');

                // Trigger fade-in animations if applicable
                $row.find('[data-animate]').each(function () {
                    const $el = $(this);
                    const delay = $el.data('delay') || 0;
                    setTimeout(() => {
                        $el.addClass($el.data('animate'));
                        $el.css('opacity', 1);
                    }, delay);
                });
            }, i * 100);
        });

        // If all rows are now visible, hide the button
        setTimeout(() => {
            if ($('.hidden-case-study').length === 0) {
                $loadMoreBtn.fadeOut();
            }
        }, 500);
    });
}


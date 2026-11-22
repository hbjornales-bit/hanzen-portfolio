
// =================================
// HOMEPAGE SLIDES
// =================================

const slides = [

    {
        type: "photo",
        file: "images/hero-1.jpg",
        title: "SELECTED WORKS",
        description: "Stories through cinema, visual language, and creative practice."
    },

    {
        type: "video",
        file: "images/hero-2.mp4",
        title: "MOVING IMAGES",
        description: "Visual storytelling through the moving image."
    },

    {
        type: "photo",
        file: "images/hero-3.jpg",
        title: "CINEMATOGRAPHY",
        description: "Light, composition, and the art of seeing."
    },

    {
        type: "video",
        file: "images/hero-4.mp4",
        title: "BEHIND THE FRAME",
        description: "The people and processes behind every production."
    },

    {
        type: "photo",
        file: "images/hero-5.jpg",
        title: "FILM ARCHIVING",
        description: "Documenting, remembering, and preserving cinema."
    },

    {
        type: "video",
        file: "images/hero-6.mp4",
        title: "CREATIVE PRACTICE",
        description: "A collection of stories, collaborations, and explorations."
    }

];


// =================================
// FIND WEBSITE ELEMENTS
// =================================

const hero = document.getElementById("hero");

const stage = document.getElementById("coverflow-stage");

const heroTitle = document.getElementById("hero-title");
const heroDescription = document.getElementById("hero-description");

const counter = document.getElementById("counter");

const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");


// =================================
// CAROUSEL SETTINGS
// =================================

let currentSlide = 0;

let autoplayTimer;

const autoplayDelay = 6000;

const cards = [];


// =================================
// CREATE CAROUSEL CARDS
// =================================

slides.forEach(function(slide, index) {

    const card = document.createElement("div");

    card.classList.add("coverflow-card");

    card.dataset.index = index;

    let media;

    if (slide.type === "photo") {

        media = document.createElement("img");

        media.src = slide.file;
        media.alt = slide.title;

    } else {

        media = document.createElement("video");

        media.src = slide.file;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "auto";

    }

    card.appendChild(media);

    stage.appendChild(card);

    cards.push({
        element: card,
        media: media,
        slide: slide
    });

});


// =================================
// UPDATE CAROUSEL POSITIONS
// =================================

function updateCarousel() {

    cards.forEach(function(card, index) {

        let position = index - currentSlide;

        // Make the carousel loop continuously

        if (position > slides.length / 2) {
            position -= slides.length;
        }

        if (position < -slides.length / 2) {
            position += slides.length;
        }

        // Assign card position

        if (Math.abs(position) <= 2) {

            card.element.dataset.position = position;

        } else {

            card.element.dataset.position = "hidden";

        }

        // Only play the featured video

        if (card.media.tagName === "VIDEO") {

            if (position === 0) {

                card.media.play().catch(function() {
                    console.log("Video playback was prevented.");
                });

            } else {

                card.media.pause();

            }

        }

    });

    // Update featured project information

    const activeSlide = slides[currentSlide];

    heroTitle.textContent = activeSlide.title;

    heroDescription.textContent = activeSlide.description;

    // Update slide counter

    counter.textContent =
        String(currentSlide + 1).padStart(2, "0") +
        " / " +
        String(slides.length).padStart(2, "0");

}


// =================================
// NEXT SLIDE
// =================================

function nextSlide() {

    currentSlide++;

    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    updateCarousel();

}


// =================================
// PREVIOUS SLIDE
// =================================

function previousSlide() {

    currentSlide--;

    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    updateCarousel();

}


// =================================
// AUTOMATIC MOVEMENT
// =================================

function startAutoplay() {

    clearInterval(autoplayTimer);

    autoplayTimer = setInterval(function() {

        nextSlide();

    }, autoplayDelay);

}


// =================================
// ARROW INTERACTIONS
// =================================

nextButton.addEventListener("click", function() {

    nextSlide();

    startAutoplay();

});


previousButton.addEventListener("click", function() {

    previousSlide();

    startAutoplay();

});


// =================================
// CLICK SIDE CARDS TO FEATURE THEM
// =================================

cards.forEach(function(card, index) {

    card.element.addEventListener("click", function() {

        currentSlide = index;

        updateCarousel();

        startAutoplay();

    });

});


// =================================
// START HOMEPAGE
// =================================

updateCarousel();

startAutoplay();

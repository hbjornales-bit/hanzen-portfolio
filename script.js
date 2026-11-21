
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

const heroImage = document.getElementById("hero-image");
const heroVideo = document.getElementById("hero-video");

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
let transitionTimer;

const autoplayDelay = 6000;


// =================================
// DISPLAY SLIDE
// =================================

function showSlide(index, animate = true) {

    const slide = slides[index];

    clearTimeout(transitionTimer);

    if (animate) {
        hero.classList.add("is-changing");
    }

    transitionTimer = setTimeout(function() {

        // Stop previous video

        heroVideo.pause();
        heroVideo.removeAttribute("src");
        heroVideo.load();

        // Display photo

        if (slide.type === "photo") {

            heroVideo.hidden = true;
            heroImage.hidden = false;

            heroImage.src = slide.file;

        }

        // Display video

        if (slide.type === "video") {

            heroImage.hidden = true;
            heroVideo.hidden = false;

            heroVideo.src = slide.file;
            heroVideo.load();

            heroVideo.play().catch(function(error) {
                console.log("Video playback was prevented.");
            });

        }

        // Update text

        heroTitle.textContent = slide.title;

        heroDescription.textContent = slide.description;

        // Update counter

        counter.textContent =
            String(index + 1).padStart(2, "0") +
            " / " +
            String(slides.length).padStart(2, "0");

        // Reveal new slide

        requestAnimationFrame(function() {
            hero.classList.remove("is-changing");
        });

    }, animate ? 350 : 0);

}


// =================================
// NEXT SLIDE
// =================================

function nextSlide() {

    currentSlide++;

    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    showSlide(currentSlide);

}


// =================================
// PREVIOUS SLIDE
// =================================

function previousSlide() {

    currentSlide--;

    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    showSlide(currentSlide);

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
// START HOMEPAGE
// =================================

showSlide(currentSlide, false);

startAutoplay();

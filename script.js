/* =========================================
   SAFEHER - MAIN JAVASCRIPT
   Professional | Responsive | Optimized
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
   SAFEHER MOBILE NAVIGATION
===================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

    const menuIcon = menuToggle.querySelector("i");

    function openMenu() {

        navMenu.classList.add("active");
        menuToggle.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");

        menuIcon.classList.remove("fa-ellipsis-vertical");
        menuIcon.classList.add("fa-xmark");

    }

    function closeMenu() {

        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");

        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-ellipsis-vertical");

    }

    // Toggle menu

    menuToggle.addEventListener("click", function (e) {

        e.stopPropagation();

        if (navMenu.classList.contains("active")) {
            closeMenu();
        } else {
            openMenu();
        }

    });

    // Close after clicking navigation or auth links

    navMenu.addEventListener("click", function (e) {

        const clickedLink = e.target.closest(
            ".nav-link, .mobile-login-btn, .mobile-volunteer-btn"
        );

        if (clickedLink) {
            closeMenu();
        }

    });

    // Close when clicking outside

    document.addEventListener("click", function (e) {

        if (
            !navMenu.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            closeMenu();
        }

    });

    // Close with Escape

    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape") {
            closeMenu();
        }

    });

}


    /* =====================================
       02. ACTIVE NAVIGATION LINK
    ===================================== */

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });


   /* =====================================
   SAFEHER - LIVE LOCATION DETECTION
===================================== */

const mapElement = document.getElementById("locationMap");
const getLocationBtn = document.getElementById("getLocationBtn");
const stopLocationBtn = document.getElementById("stopLocationBtn");
const locationStatus = document.getElementById("locationStatus");
const coordinates = document.getElementById("coordinates");
const googleMapsLink = document.getElementById("googleMapsLink");

let map = null;
let userMarker = null;
let accuracyCircle = null;
let watchId = null;


// Initialize map
if (mapElement && typeof L !== "undefined") {

    map = L.map("locationMap").setView([23.6850, 90.3563], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

}


// Show status message
function showLocationStatus(message, type = "") {

    if (!locationStatus) return;

    locationStatus.textContent = message;
    locationStatus.classList.remove("success", "error");

    if (type) {
        locationStatus.classList.add(type);
    }
}


// Location successfully detected
function showUserLocation(position) {

    if (!map) return;

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    const userPosition = [latitude, longitude];

    // Create or update marker
    if (userMarker) {

        userMarker.setLatLng(userPosition);

    } else {

        userMarker = L.marker(userPosition)
            .addTo(map)
            .bindPopup("<b>Your Current Location</b>");

    }

    // Create or update accuracy circle
    if (accuracyCircle) {

        accuracyCircle.setLatLng(userPosition);
        accuracyCircle.setRadius(accuracy);

    } else {

        accuracyCircle = L.circle(userPosition, {
            radius: accuracy,
            color: "#B85C83",
            fillColor: "#F5E3EB",
            fillOpacity: 0.35,
            weight: 2
        }).addTo(map);

    }

    // Focus map
    map.setView(userPosition, 16);

    // Show coordinates
    if (coordinates) {
        coordinates.textContent =
            `Latitude: ${latitude.toFixed(6)} | Longitude: ${longitude.toFixed(6)}`;
    }

    // Google Maps link
    if (googleMapsLink) {
        googleMapsLink.href =
            `https://www.google.com/maps?q=${latitude},${longitude}`;

        googleMapsLink.style.display = "inline-flex";
    }

    showLocationStatus(
        `Location detected successfully. Accuracy: approximately ${Math.round(accuracy)} meters.`,
        "success"
    );

    if (getLocationBtn) {
        getLocationBtn.disabled = false;
        getLocationBtn.innerHTML =
            '<i class="fa-solid fa-location-crosshairs"></i> Update My Location';
    }

}


// Handle location errors
function locationError(error) {

    let message = "Unable to detect your location.";

    if (error.code === 1) {
        message = "Location permission denied. Allow location access in your browser settings.";
    } else if (error.code === 2) {
        message = "Location unavailable. Please turn on your phone GPS.";
    } else if (error.code === 3) {
        message = "Location request timed out. Please try again.";
    }

    showLocationStatus(message, "error");

    if (getLocationBtn) {
        getLocationBtn.disabled = false;
        getLocationBtn.innerHTML =
            '<i class="fa-solid fa-location-crosshairs"></i> Try Again';
    }

}


// Start live location tracking
if (getLocationBtn) {

    getLocationBtn.addEventListener("click", () => {

        if (!navigator.geolocation) {
            showLocationStatus(
                "Geolocation is unavailable. Open the website using HTTPS or localhost.",
                "error"
            );
            return;
        }

        if (!window.isSecureContext) {
            showLocationStatus(
                "Location requires HTTPS or localhost. Open the secure website first.",
                "error"
            );
            return;
        }

        if (!map) {
            showLocationStatus(
                "Map is not initialized. Please check the Leaflet CDN and map HTML.",
                "error"
            );
            return;
        }

        // Stop previous tracking
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        showLocationStatus("Requesting your current location...");

        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Detecting Location...';

        // Start live tracking
        watchId = navigator.geolocation.watchPosition(
            showUserLocation,
            locationError,
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );

    });

}


// Stop live location
if (stopLocationBtn) {

    stopLocationBtn.addEventListener("click", () => {

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        showLocationStatus("Live location tracking stopped.");

        if (getLocationBtn) {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML =
                '<i class="fa-solid fa-location-crosshairs"></i> Get My Location';
        }

    });

}

    /* =====================================
       05. SOS EMERGENCY BUTTON
    ===================================== */

    const sosButtons = document.querySelectorAll(".sos-button");

    sosButtons.forEach(button => {

        button.addEventListener("click", () => {

            const confirmed = confirm(
                "Are you in an emergency? Do you want to call 999?"
            );

            if (confirmed) {

                window.location.href = "tel:999";

            }

        });

    });


    /* =====================================
       06. CURRENT YEAR
    ===================================== */

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }


    /* =====================================
       07. PREVENT EMPTY HASH LINKS
    ===================================== */

    document.querySelectorAll('a[href="#"]').forEach(link => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

        });

    });


});


/* =========================================
   MISSING PERSON INFINITE AUTO SLIDER
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const track = document.getElementById("missingTrack");

    if (!track) return;

    const carousel = track.closest(".missing-carousel");

    if (!carousel) return;

    let cards = Array.from(
        track.querySelectorAll(".missing-card")
    );

    if (cards.length <= 1) return;

    let currentIndex = 0;
    let timer = null;

    let touchStartX = 0;
    let touchEndX = 0;

    function getVisibleCards() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 768) return 2;
        return 3;
    }

    function getStep() {

        const card = cards[0];

        const cardWidth = card.getBoundingClientRect().width;

        const gap = parseFloat(
            getComputedStyle(track).gap
        ) || 0;

        return cardWidth + gap;
    }

    function updateSlider() {

        track.style.transform =
            `translateX(-${currentIndex * getStep()}px)`;

    }

    function nextSlide() {

        const visible = getVisibleCards();

        const maxIndex = cards.length - visible;

        if (maxIndex <= 0) return;

        if (currentIndex >= maxIndex) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }

        updateSlider();
    }

    function previousSlide() {

        const maxIndex = cards.length - getVisibleCards();

        if (maxIndex <= 0) return;

        if (currentIndex <= 0) {
            currentIndex = maxIndex;
        } else {
            currentIndex--;
        }

        updateSlider();
    }

    function stopSlider() {
        clearInterval(timer);
    }

    function startSlider() {

        stopSlider();

        // Mobile: Slide through every card
        // Desktop: Slide only when extra cards exist

        if (cards.length <= getVisibleCards()) {
            currentIndex = 0;
            updateSlider();
            return;
        }

        timer = setInterval(nextSlide, 3000);
    }

    // TOUCH SWIPE
    carousel.addEventListener("touchstart", function (e) {

        touchStartX = e.touches[0].clientX;

        stopSlider();

    }, { passive: true });

    carousel.addEventListener("touchend", function (e) {

        touchEndX = e.changedTouches[0].clientX;

        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > 40) {

            if (difference > 0) {
                nextSlide();
            } else {
                previousSlide();
            }

        }

        startSlider();

    }, { passive: true });

    // MOUSE HOVER
    carousel.addEventListener("mouseenter", stopSlider);
    carousel.addEventListener("mouseleave", startSlider);

    // RESIZE
    window.addEventListener("resize", function () {

        currentIndex = 0;

        updateSlider();

        startSlider();

    });

    updateSlider();

    startSlider();

});



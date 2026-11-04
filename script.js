/* =========================================
   SAFEHER - MAIN JAVASCRIPT
   Professional | Responsive | Optimized
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       01. MOBILE NAVIGATION
    ===================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    function closeMenu() {
        if (!menuToggle || !navMenu) return;

        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        const icon = menuToggle.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    }

    function openMenu() {
        if (!menuToggle || !navMenu) return;

        navMenu.classList.add("active");
        menuToggle.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");

        const icon = menuToggle.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        }
    }

    if (menuToggle && navMenu) {

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", (event) => {
            event.stopPropagation();

            const isOpen = navMenu.classList.contains("active");

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu after clicking navigation link
        document.querySelectorAll(".nav-link, .mobile-login")
            .forEach(link => {
                link.addEventListener("click", closeMenu);
            });

        // Close menu when clicking outside
        document.addEventListener("click", (event) => {

            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedToggle = menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {
                closeMenu();
            }

        });

        // Close menu with Escape key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
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


document.addEventListener("DOMContentLoaded", function () {

    const grid = document.querySelector(
        ".missing-section .missing-grid"
    );

    if (!grid) return;

    const cards = grid.querySelectorAll(".missing-card");

    if (cards.length <= 1) return;

    let index = 0;
    let sliderTimer;

    function stopSlider() {
        clearInterval(sliderTimer);
    }

    function startSlider() {

        stopSlider();

        if (window.innerWidth > 600) {
            index = 0;
            grid.scrollLeft = 0;
            return;
        }

        sliderTimer = setInterval(function () {

            index++;

            if (index >= cards.length) {
                index = 0;
            }

            grid.scrollTo({
                left: index * grid.clientWidth,
                behavior: "smooth"
            });

        }, 3000);
    }

    grid.addEventListener("touchstart", stopSlider, {
        passive: true
    });

    grid.addEventListener("touchend", function () {
        startSlider();
    }, { passive: true });

    window.addEventListener("resize", startSlider);

    startSlider();

});



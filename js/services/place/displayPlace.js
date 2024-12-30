import { state } from "../../state/state.js";
import { createElement } from "../../components/createElement.js";
import { renderPlaceDetails } from "./renderPlaceDetails.js";
import { displayReviews } from "../../components/Reviews.js";
import { displayMedia } from "../media/mediaService.js";
import BookingForm from "../../components/ui/BookingForm.mjs";
import Snackbar from "../../components/ui/Snackbar.mjs";
import Button from "../../components/base/Button.js";
import RenderMenu from "../../components/ui/RenderMenu.mjs"; // Assuming RenderMenu is the module we created
import { apiFetch } from "../../api/api.js";
// import { MediaModal } from "./placeModals.js";


let placeMenu = {
    "menu": [
        {
            "name": "Appetizers",
            "items": [
                { "name": "Garlic Bread", "price": 5 },
                { "name": "Spring Rolls", "price": 6 }
            ]
        },
        {
            "name": "Desserts",
            "items": [
                { "name": "Cheesecake", "price": 7 },
                { "name": "Chocolate Mousse", "price": 6 }
            ]
        },
        {
            "name": "Beverages",
            "items": [
                { "name": "Coffee", "price": 3 },
                { "name": "Fresh Lemonade", "price": 4 }
            ]
        }
    ]
}
    ;


async function displayPlace(isLoggedIn, placeId, content) {
    try {
        const place = await apiFetch(`/places/place/${placeId}`);
        const isCreator = isLoggedIn && state.user === place.createdBy;
        if (!content) {
            content = document.getElementById('content');
        }
        content.innerHTML = ""; // Clear existing content

        // Fallback menu and gallery
        if (!place.menu) {
            place.menu = placeMenu.menu;
        }
        // const galleryImages = place.gallery || [
        //     { src: "http://localhost:5173/placepic/FiKYsTSl5cN7ot.jpg", alt: "Image 1" },
        //     { src: "http://localhost:5173/placepic/FiKYsTSl5cN7ot.jpg", alt: "Image 2" },
        //     { src: "http://localhost:5173/placepic/FiKYsTSl5cN7ot.jpg", alt: "Image 3" },
        // ];

        // Create main structure
        const banner = createElement("div", { id: "place-banner" }, [
            createElement("img", { src: `/placepic/${place.banner}` || "default-banner.jpg", alt: place.name })
        ]);

        const flexy = createElement("div", { class: "hvflex" });
        const details = createElement("div", { id: "place-details", class: "detail-section" });
        renderPlaceDetails(isLoggedIn, details, place, isCreator);

        const bookingForm = isLoggedIn && !isCreator ? BookingForm((details) => {
            alert(`Booking Confirmed!\nName: ${details.name}\nDate: ${details.date}\nSeats: ${details.seats}`);
        }) : null;

        const tabs = createTabs(isLoggedIn, isCreator, place, bookingForm);

        content.appendChild(banner);
        // content.appendChild(details);
        flexy.appendChild(details);

        // details.appendChild(createElement("div", { id: "sda-container", class: "sda-container" }));

        // (function () {
        //     var yourscript = document.createElement('script');
        //     yourscript.type = 'text/javascript';
        //     yourscript.async = true;
        //     yourscript.src = '/js/utils/sdacript.js';
        //     (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(yourscript);
        // })();

        if (bookingForm) flexy.appendChild(bookingForm);
        content.appendChild(flexy);
        content.appendChild(tabs);
    } catch (error) {
        content.innerHTML = ""; // Clear content on error
        content.appendChild(createElement("h2", {}, ["Error"]));
        content.appendChild(createElement("p", {}, [`Failed to load place details: ${error.message}`]));
        Snackbar(`Error fetching place details: ${error.message}`, 3000);
    }
}

// Function to create tabs
function createTabs(isLoggedIn, isCreator, place, bookingForm) {
    const tabsContainer = createElement("div", { id: "tabs-container" });
    const tabsHeader = createElement("ul", { id: "tabs-header" }, [
        "Home", "Notices", "Menu", "Gallery", "Reviews", "Nearby", "Info"
    ].map((tabName) =>
        createElement("li", { class: "tab", "data-tab": tabName.toLowerCase() }, [tabName])
    ));

    const tabsContent = createElement("div", { id: "tabs-content" });

    // Tab-specific content
    const tabsMap = {
        home: createElement("div", { class: "tabcontent" }, [
            createElement("h3", {}, ["Welcome to the Place!"]),
            createElement("p", {}, [place.description || "No description available."]),
        ]),
        notices: createElement("div", { class: "tabcontent" }, [
            createElement("h3", {}, ["Notices"]),
        ]),
        menu: createElement("div", { class: "tabcontent" }, []),
        gallery: createElement("div", { class: "tabcontent" }, []),
        reviews: createElement("div", { class: "tabcontent" }, []),
        nearby: createElement("div", { class: "tabcontent" }, [
            createElement("h3", {}, ["Nearby Places"]),
            createElement("p", {}, ["No nearby places found."])
        ]),
        info: createElement("div", { class: "tabcontent" }, [
            createElement("p", {}, [`Capacity: ${place.capacity || "N/A"}`]),
            createElement("p", {}, [`Category: ${place.category || "N/A"}`]),
        ]),
    };


    if (isCreator) {
        const noticeButton = Button("Add Notice", "add-notice-btn", { click: () => alert("Button clicked!"), });
        const menuButton = Button("Add Menu", "add-menu-btn", { click: () => alert("Button clicked!"), });
        const infoButton = Button("Add Info", "add-info-btn", { click: () => alert("Button clicked!"), });

        tabsMap.notices.append(noticeButton, createElement("p", {}, ["No notices available."]));
        tabsMap.menu.prepend(createElement('h3', {}, ['Menu']), menuButton);
        tabsMap.info.prepend(createElement("h3", {}, ["Additional Information"]), infoButton);
    }

    if (isLoggedIn) {
        let mediaList = createElement("div", { class: "media-list" }, []);
        tabsMap.gallery.prepend(createElement("h3", {}, ["Gallery"]), mediaList);
        displayMedia(place.media, "place", place.placeid, isLoggedIn, mediaList);
    }

    // if (isLoggedIn) {
    //     const galleryButton = Button("Add Media", "add-media-btn", { click: () => MediaModal(place.placeid, isLoggedIn), });
    //     let mediaList =  createElement("div", { class: "media-list" }, []);
    //     tabsMap.gallery.prepend(mediaList, createElement("h3", {}, ["Gallery"]), galleryButton);
    //     displayMedia(place.media, "place", place.placeid, isLoggedIn, mediaList);
    // }

    if (isLoggedIn && !isCreator) {
        const reviewButton = Button("Add Review", "add-review-btn", { click: () => alert("Button clicked!"), });

        tabsMap.reviews.prepend(createElement("h3", {}, ["Reviews"]), reviewButton);
    }

    RenderMenu(tabsMap.menu, place.menu)
    displayReviews(tabsMap.reviews, "place", place.placeid);
    // displayReviews(document.getElementById('review-section'), 'events', '12345');


    // Add default active tab content
    tabsContent.appendChild(tabsMap.home);

    // Tab click logic
    tabsHeader.addEventListener("click", (event) => {
        if (!event.target.classList.contains("tab")) return;

        const tabName = event.target.getAttribute("data-tab");
        tabsContent.innerHTML = ""; // Clear existing content
        tabsContent.appendChild(tabsMap[tabName]);
    });

    tabsContainer.appendChild(tabsHeader);
    tabsContainer.appendChild(tabsContent);
    return tabsContainer;
}

export default displayPlace;

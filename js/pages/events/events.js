import { displayEvents } from "../../services/event/displayEventsService.js";

function Events(isLoggedIn, contentContainer) {
    contentContainer.innerHTML = '';

    const efventhead = document.createElement("h1");
    efventhead.textContent = "Events";
    contentContainer.appendChild(efventhead);
    
    const content = document.createElement("div");
    // content.classList = "event-details";
    contentContainer.appendChild(content);

    displayEvents(isLoggedIn, content, contentContainer, 1)
}

export { Events };

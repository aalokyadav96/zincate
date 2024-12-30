import { createEventForm } from "../../services/event/createEventService.js";

function Create(isLoggedIn, contentContainer) {
    contentContainer.innerHTML = '';
    createEventForm(isLoggedIn, contentContainer);
}

export { Create };

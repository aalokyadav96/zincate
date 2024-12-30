import { displayEvent } from "../../services/event/eventService.js";

function Event(isLoggedIn, eventid, contentContainer) {
    displayEvent(isLoggedIn, eventid, contentContainer)
}


export { Event };

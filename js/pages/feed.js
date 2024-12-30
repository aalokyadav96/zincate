import { displayFeed } from "../services/feed/feedService.js";

function Feed(isLoggedIn, contentContainer) {
    contentContainer.innerHTML = '';
    displayFeed(isLoggedIn, contentContainer);
}

export { Feed };

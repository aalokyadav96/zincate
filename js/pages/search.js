import { displaySearch } from "../services/search/searchService.js";

function Search(isLoggedIn, contentContainer) {
    contentContainer.innerHTML = '';
    displaySearch(isLoggedIn, contentContainer);
}

export { Search };

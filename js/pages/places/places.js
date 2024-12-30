import { displayPlaces } from '../../services/place/displayPlaces.js';

function Places(isLoggedIn, contentContainer) {
    
    contentContainer.innerHTML = '';
    const content = document.createElement("div");
    content.id = "places";
    // content.classList = "places";
    contentContainer.appendChild(content);
    
    displayPlaces(isLoggedIn, content)
}

export { Places };

import { displayPlace } from '../../services/place/placeService.js';

function Place(isLoggedIn, placeid, contentContainer) {
    console.log("dfgrhg");
    contentContainer.innerHTML = '';
    displayPlace(isLoggedIn, placeid, contentContainer)
}

export { Place };

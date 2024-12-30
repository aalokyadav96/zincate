import { createElement } from "../../components/createElement.js";
import {editPlaceForm, deletePlace} from "./placeService.js";

function renderPlaceDetails(isLoggedIn, content, place, isCreator) {
    const createdDate = new Date(place.created).toLocaleString();
    const updatedDate = new Date(place.updated).toLocaleString();
    const latitude = place.coordinates?.lat || "N/A";
    const longitude = place.coordinates?.lng || "N/A";

    const detailsSection = createElement('section', { id: 'details', class: 'section' }, [
        createElement('h1', {}, [place.name]),
        // createElement('img', {
        //     src: `/placepic/${place.banner}`,
        //     alt: `${place.name} Banner`,
        //     style: "width: 100%; max-height: 300px; object-fit: cover;"
        // }),
        createElement('p', {}, [createElement('strong', {}, ["Description: "]), place.description || "N/A"]),
        createElement('p', {}, [createElement('strong', {}, ["Address: "]), place.address || "N/A"]),
        // createElement('p', {}, [createElement('strong', {}, ["Created On: "]), createdDate]),
        createElement('p', {}, [createElement('strong', {}, ["Last Updated: "]), updatedDate]),
        // createElement('p', {}, [createElement('strong', {}, ["Coordinates: "]), `Lat: ${latitude}, Lng: ${longitude}`]),
        createElement('p', {}, [createElement('strong', {}, ["Category: "]), place.category || "N/A"]),
    ]);

    if (isCreator) {
        detailsSection.appendChild(
            createElement('button', {
                id: 'edit-place-btn',
                onclick: () => editPlaceForm(isLoggedIn, place.placeid, content)
            }, ["Edit Place"])
        );
        detailsSection.appendChild(
            createElement('button', {
                id: 'delete-place-btn',
                onclick: () => deletePlace(place.placeid)
            }, ["Delete Place"])
        );
    }

    content.appendChild(detailsSection);
}


export { renderPlaceDetails };
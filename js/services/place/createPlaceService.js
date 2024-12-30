import Snackbar from '../../components/ui/Snackbar.mjs';
import { navigate } from "../../routes/index.js";
import { createPlace } from "./placeService.js";
import { createElement } from "../../components/createElement.js";
import { createForm } from './formHelper.js';

async function createPlaceForm(isLoggedIn, createSection) {
    // Ensure the section is cleared
    createSection.innerHTML = "";

    if (isLoggedIn) {
        const formFields = [
            { id: "place-name", label: "Place Name", placeholder: "Enter the place name", required: true },
            { id: "place-address", label: "Address", placeholder: "Enter the address", required: true },
            { id: "place-city", label: "City", placeholder: "Enter the city", required: true },
            { id: "place-country", label: "Country", placeholder: "Enter the country", required: true },
            { id: "place-zipcode", label: "Zip Code", placeholder: "Enter the zip code", required: true },
            { id: "place-description", label: "Description", type: "textarea", placeholder: "Provide a description", required: true },
            { id: "capacity", label: "Capacity", type: "number", placeholder: "Enter the capacity", required: true, min: 1 },
            { id: "phone", label: "Phone Number", placeholder: "Enter the phone number" },
            { id: "category", label: "Category", placeholder: "Enter the category" },
            { id: "place-banner", label: "Place Banner", type: "file", accept: "image/*" }
        ];

        // Create the form with a proper submission callback
        const form = createForm(formFields, async (formData) => {
            return await createPlace(formData); // Send the formData to the service
        });

        createSection.appendChild(createElement('h2', {}, ["Create Place"]));
        createSection.appendChild(form);
    } else {
        Snackbar("You must be logged in to create a place.", 3000);
        navigate('/login');
    }
}

export { createPlaceForm };

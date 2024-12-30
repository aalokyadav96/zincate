import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import { handleError } from "../../utils/utils.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { renderPage, navigate } from "../../routes/index.js";
import { logout } from "../../services/auth/authService.js";
import { showLoadingMessage, removeLoadingMessage } from "./profileHelpers.js";
import { fetchProfile } from "./fetchProfile.js";
import { generateFormField } from "./generators.js";
import { profilGen } from "./renderUserProfile.js";


// Display the profile content in the profile section
async function displayProfile(isLoggedIn, content) {
    content.textContent = ""; // Clear existing content
    if (isLoggedIn) {
        try {
            const profile = await fetchProfile();
            if (profile) {
                console.log(profile);
                const profileElement = profilGen(profile, isLoggedIn);
                console.log(profile);
                content.appendChild(profileElement);
                attachProfileEventListeners(content); // Attach event listeners for buttons
                displayFollowSuggestions();
            } else {
                const loginMessage = document.createElement("p");
                loginMessage.textContent = "Please log in to see your profile.";
                profileSection.appendChild(loginMessage);
            }
        } catch (error) {
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Failed to load profile. Please try again later.";
            content.appendChild(errorMessage);
        }
    } else {
    navigate("/login");        
    }
}

// Attach event listeners for the profile page
function attachProfileEventListeners() {
    const editButton = document.querySelector('[data-action="edit-profile"]');
    const deleteButton = document.querySelector('[data-action="delete-profile"]');

    if (editButton) {
        editButton.addEventListener("click", () => {
            editProfile(content);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            deleteProfile();
        });
    }
}


async function displayFollowSuggestions() {
    const suggestionsSection = document.getElementById("follow-suggestions");
    suggestionsSection.textContent = ""; // Clear existing content

    try {
        const suggestions = await apiFetch('/suggestions/follow');

        if (suggestions && suggestions.length > 0) {
            const heading = document.createElement("h3");
            heading.textContent = "Suggested Users to Follow:";
            suggestionsSection.appendChild(heading);

            const suggestionsList = document.createElement("ul");
            suggestionsList.id = "suggestions-list";

            suggestions.forEach(user => {
                const listItem = document.createElement("li");
                listItem.textContent = user.username;

                const viewProfileButton = document.createElement("button");
                viewProfileButton.className = "view-profile-btn";
                viewProfileButton.textContent = "View Profile";
                viewProfileButton.dataset.username = user.username;
                viewProfileButton.addEventListener("click", () => navigate(`/user/${user.username}`));

                listItem.appendChild(viewProfileButton);
                suggestionsList.appendChild(listItem);
            });

            suggestionsSection.appendChild(suggestionsList);
        } else {
            const noSuggestionsMessage = document.createElement("p");
            noSuggestionsMessage.textContent = "No follow suggestions available.";
            suggestionsSection.appendChild(noSuggestionsMessage);
        }
    } catch (error) {
        console.error("Error loading follow suggestions:", error);

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Failed to load suggestions.";
        suggestionsSection.appendChild(errorMessage);


        Snackbar("Error loading follow suggestions.", 3000);
    }
}

async function editProfile(content) {
    content.textContent = ""; // Clear existing content

    if (!state.userProfile) {
        Snackbar("Please log in to edit your profile.", 3000);
        return;
    }

    const { username, email, bio, phone_number } = state.userProfile;

    content.innerHTML = `
        <h2>Edit Profile</h2>
        <form id="edit-profile-form" class="edit-profile-form">
            ${generateFormField("Username", "edit-username", "text", username)}
            ${generateFormField("Email", "edit-email", "email", email)}
            ${generateFormField("Bio", "edit-bio", "textarea", bio || "")}
            ${generateFormField("Phone Number", "edit-phone", "text", phone_number || "")}
            <button type="button" id="update-profile-btn">Update Profile</button>
            <button type="button" id="cancel-profile-btn">Cancel</button>
        </form>
    `;

    document.getElementById("update-profile-btn").addEventListener("click", () => {
        const form = document.getElementById("edit-profile-form");
        updateProfile(new FormData(form));
    });

    document.getElementById("cancel-profile-btn").addEventListener("click", () => {
        Snackbar("Profile editing canceled.", 2000);
        navigate("/profile"); // Assuming a function to navigate back to the profile view
    });
}


async function updateProfile(formData) {
    if (!state.token) {
        Snackbar("Please log in to update your profile.", 3000);
        return;
    }

    const currentProfile = state.userProfile || {};
    const updatedFields = {};

    for (const [key, value] of formData.entries()) {
        const fieldName = key.replace("edit-", "");
        const trimmedValue = value.trim();

        // Compare trimmed values to detect changes
        if (trimmedValue !== (currentProfile[fieldName] || "").trim()) {
            updatedFields[fieldName] = trimmedValue;
        }
    }

    if (Object.keys(updatedFields).length === 0) {
        Snackbar("No changes were made to the profile.", 3000);
        return;
    }

    showLoadingMessage("Updating...");

    try {
        const updateFormData = new FormData();
        Object.entries(updatedFields).forEach(([key, value]) => updateFormData.append(key, value));

        const updatedProfile = await apiFetch("/profile", "PUT", updateFormData);
        if (!updatedProfile) throw new Error("No response received for the profile update.");

        state.userProfile = { ...currentProfile, ...updatedProfile };
        localStorage.setItem("userProfile", JSON.stringify(state.userProfile));

        Snackbar("Profile updated successfully.", 3000);
        renderPage();
    } catch (error) {
        console.error("Error updating profile:", error);
        handleError("Error updating profile. Please try again.");
    } finally {
        removeLoadingMessage();
    }
}




async function displaySuggested() {
    const content = document.getElementById("suggested");

    // Check if userProfile is available
    if (state.userProfile) {
        // If userProfile exists, display relevant details from the profile
        content.innerHTML = `
            <h1>Suggested for ${state.userProfile.username || state.user}</h1>
            <p>Email: ${state.userProfile.email || 'N/A'}</p>
            <p>Location: ${state.userProfile.location || 'N/A'}</p>
        `;
    } else {
        // If no userProfile is available, fall back to displaying the username
        content.innerHTML = `<h1>Welcome, ${state.user || 'Guest'}</h1>`;
    }
}

async function deleteProfile() {
    if (!state.token) {

        Snackbar("Please log in to delete your profile.", 3000);
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete your profile? This action cannot be undone.");
    if (!confirmDelete) {
        return;
    }

    try {
        await apiFetch('/profile', 'DELETE');

        Snackbar("Profile deleted successfully.", 3000);
        logout();
    } catch (error) {

        Snackbar(`Failed to delete profile: ${error.message}`, 3000);
    }
};


export { displayProfile, deleteProfile, displayFollowSuggestions, editProfile, updateProfile, displaySuggested };
import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import { handleError } from "../../utils/utils.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { renderPage } from "../../routes/index.js";
import { createForm } from "../../components/createForm.js"; 
import {formatDate, showLoadingMessage, removeLoadingMessage, capitalize } from "./profileHelpers.js";


function generateBannerForm(content, username) {
    const bannerPictureSrc = `/userpic/banner/${username + '.jpg'}`;
    const fields = [
        {
            label: "Banner Picture",
            id: "edit-banner-picture",
            currentSrc: bannerPictureSrc,
            previewId: "banner-picture-preview",
        },
    ];
    return createForm(content, fields, "edit-banner-form", "update-banner-pics-btn", "Update Banner Pics", () => {
        const formData = new FormData(document.getElementById("edit-banner-form"));
        updateProfilePics('banner', formData);
    });
}

function generateAvatarForm(content, username) {
    const profilePictureSrc = `/userpic/${username + '.jpg'}`;
    const fields = [
        {
            label: "Profile Picture",
            id: "edit-avatar-picture",
            currentSrc: profilePictureSrc,
            previewId: "profile-picture-preview",
        },
    ];
    return createForm(content, fields, "edit-avatar-form", "update-avatar-pics-btn", "Update Profile Pics", () => {
        const formData = new FormData(document.getElementById("edit-avatar-form"));
        updateProfilePics('avatar', formData);
    });
}

// function generateProfileElement(profile) {
//     const profileContainer = document.createElement("div");
//     profileContainer.className = "profile-container hflex";

//     const section = document.createElement("section");
//     section.className = "channel";

//     // Profile Picture and Background
//     const bgImg = document.createElement("span");
//     bgImg.className = "bg_img";
//     bgImg.style.backgroundImage = `url(/userpic/banner/${profile.banner_picture})`;
//     bgImg.addEventListener('click', () => {
//         // Open the Sightbox with an image when the button is clicked
//         Sightbox(`/userpic/banner/${profile.banner_picture}`, 'image');
//     });

//     const showEditButton = document.createElement('button');
//     showEditButton.textContent = '';
//     showEditButton.className = 'edit-banner-pic';
//     showEditButton.addEventListener('click', () => {
//         const content = document.createElement('div');
//         const contentx = document.createElement('div');
//         content.appendChild(generateBannerForm(contentx, profile.username));

//         const modal = Modal({
//             title: 'Example Modal',
//             content,
//             onClose: () => modal.remove(),
//         });
//     });

//     section.appendChild(showEditButton);

//     const profileArea = document.createElement("div");
//     profileArea.className = "profile_area";

//     const thumb = document.createElement("span");
//     thumb.className = "thumb";

//     const img = document.createElement("img");
//     img.src = `/userpic/${profile.username + '.jpg'}`;
//     img.alt = "Profile Picture";
//     img.className = "imgful";
//     thumb.appendChild(img);

//     const showModalButton = document.createElement('button');
//     showModalButton.textContent = '';
//     showModalButton.className = 'edit-profile-pic';
//     showModalButton.addEventListener('click', () => {
//         const content = document.createElement('div');
//         const contentx = document.createElement('div');
//         content.appendChild(generateDPForm(contentx, profile.username));

//         const modal = Modal({
//             title: 'Example Modal',
//             content,
//             onClose: () => modal.remove(),
//         });
//     });

//     profileArea.appendChild(showModalButton);
//     profileArea.appendChild(thumb);

//     thumb.addEventListener('click', () => {
//         Sightbox(`/userpic/${profile.username + '.jpg'}`, 'image');
//     });

//     const profileDetails = document.createElement("div");
//     profileDetails.className = "profile-details";

//     const username = document.createElement("h2");
//     username.className = "username";
//     username.textContent = profile.username || "Not provided";

//     const name = document.createElement("p");
//     name.className = "name";
//     name.textContent = profile.name || "";

//     const email = document.createElement("p");
//     email.className = "email";
//     email.textContent = profile.email || "";

//     const bio = document.createElement("p");
//     bio.className = "bio";
//     bio.textContent = profile.bio || "";

//     const profileActions = document.createElement("div");
//     profileActions.className = "profile-actions";

//     const editButton = document.createElement("button");
//     editButton.className = "btn edit-btn";
//     editButton.dataset.action = "edit-profile";
//     editButton.textContent = "Edit Profile";

//     profileActions.appendChild(editButton);

//     const profileInfo = document.createElement("div");
//     profileInfo.className = "profile-info";

//     const infoItems = [
//         { label: "Last Login", value: formatDate(profile.last_login) || "Never logged in" },
//         { label: "Account Status", value: profile.is_active ? "Active" : "Inactive" },
//         { label: "Verification Status", value: profile.is_verified ? "Verified" : "Not Verified" },
//     ];

//     infoItems.forEach(item => {
//         const infoItem = document.createElement("div");
//         infoItem.className = "info-item";
//         infoItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
//         profileInfo.appendChild(infoItem);
//     });

//     profileDetails.append(username, name, email, bio, profileActions, profileInfo);

//     const statistics = document.createElement("div");
//     statistics.className = "statistics";

//     const stats = [
//         { label: "Posts", value: profile.profile_views || 0 },
//         { label: "Followers", value: profile.followers?.length || 0 },
//         { label: "Following", value: profile.follows?.length || 0 },
//     ];

//     stats.forEach(stat => {
//         const statItem = document.createElement("p");
//         statItem.className = "hflex";
//         statItem.innerHTML = `<strong>${stat.value}</strong> ${stat.label}`;
//         statistics.appendChild(statItem);
//     });

//     const followSuggestions = document.createElement("div");
//     followSuggestions.id = "follow-suggestions";
//     followSuggestions.className = "follow-suggestions";

//     const deleteProfileButton = document.createElement("button");
//     deleteProfileButton.className = "btn delete-btn";
//     deleteProfileButton.dataset.action = "delete-profile";
//     deleteProfileButton.textContent = "Delete Profile";

//     const deleteActions = document.createElement("div");
//     deleteActions.className = "profile-actions";
//     deleteActions.appendChild(deleteProfileButton);

//     section.append(bgImg, profileArea, profileDetails, statistics, followSuggestions, deleteActions);
//     profileContainer.appendChild(section);

//     return profileContainer;
// }

// Generate the HTML content for the profile
function generateProfileHTML(profile) {
    return `
        <div class="profile-container hflex">    
            <section class="channel">
            <span class="bg_img" style="background-image:url(/userpic/${profile.profile_picture || 'default.png'});"></span>
                <div class="profile_area">
                    <span class="thumb">
                        <img src="/userpic/${profile.profile_picture || 'default.png'}" class="imgful" alt="Profile Picture"/>
                    </span>     
                </div> 
                <div class="profile-details">
                    <h2 class="username">${profile.username || 'Not provided'}</h2>
                    <p class="name">${profile.name || ''}</p>
                    <p class="email">${profile.email || ''}</p>
                    <p class="bio">${profile.bio || ''}</p>
                    <div class="profile-actions">
                        <button class="btn edit-btn" data-action="edit-profile">Edit Profile</button>
                    </div>
                    <div class="profile-info">
                        <div class="info-item"><strong>Last Login:</strong> ${formatDate(profile.last_login) || 'Never logged in'}</div>
                        <div class="info-item"><strong>Account Status:</strong> ${profile.is_active ? 'Active' : 'Inactive'}</div>
                        <div class="info-item"><strong>Verification Status:</strong> ${profile.is_verified ? 'Verified' : 'Not Verified'}</div>
                    </div>
                </div>
                <div class="statistics">
                    <p class="hflex"><strong>${profile.profile_views || 0}</strong> Posts</p>
                    <p class="hflex"><strong>${profile.followers?.length || 0}</strong> Followers</p>
                    <p class="hflex"><strong>${profile.follows?.length || 0}</strong> Following</p>
                </div>
                <div id="follow-suggestions" class="follow-suggestions"></div>
                <br>
                <div class="profile-actions">
                    <button class="btn delete-btn" data-action="delete-profile">Delete Profile</button>
                </div>
            </section>
        </div>
    `;
}


async function updatePicture(type) {
    if (!state.token) {
        Snackbar(`Please log in to update your ${type} picture.`, 3000);
        return;
    }

    const fileInput = document.getElementById(`edit-${type}-picture`);
    if (!fileInput || !fileInput.files[0]) {
        Snackbar(`No ${type} picture selected.`, 3000);
        return;
    }

    showLoadingMessage(`Updating ${type} picture...`);

    try {
        const formData = new FormData();
        formData.append(`${type}_picture`, fileInput.files[0]);

        const updatedProfile = await apiFetch(`/profile/${type}`, 'PUT', formData);
        if (!updatedProfile) throw new Error(`No response received for ${type} picture update.`);

        state.userProfile = { ...state.userProfile, ...updatedProfile };
        localStorage.setItem("userProfile", JSON.stringify(state.userProfile));

        Snackbar(`${capitalize(type)} picture updated successfully.`, 3000);
        renderPage();
    } catch (error) {
        console.error(`Error updating ${type} picture:`, error);
        handleError(`Error updating ${type} picture. Please try again.`);
    } finally {
        removeLoadingMessage();
    }
}


async function updateProfilePics(type) {
    await updatePicture(type);
}

function generateFormField(labelText, id, type, value) {
    if (type === "textarea") {
        return `
            <div class="form-group">
                <label for="${id}">${labelText}</label>
                <textarea id="${id}">${value}</textarea>
            </div>
        `;
    }
    return `
        <div class="form-group">
            <label for="${id}">${labelText}</label>
            <input type="${type}" id="${id}" value="${value}">
        </div>
    `;
}

export { generateBannerForm, generateAvatarForm, generateFormField, generateProfileHTML };

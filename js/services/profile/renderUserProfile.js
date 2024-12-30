import { state } from '../../state/state.js';
import Sightbox from '../../components/ui/Sightbox.mjs';
import Modal from '../../components/ui/Modal.mjs';
import { formatDate } from "./profileHelpers.js";
import { generateBannerForm, generateAvatarForm } from "./generators.js";

function profilGen(profile, isLoggedIn) {
    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container hflex";

    const section = document.createElement("section");
    section.className = "channel";

    // Profile Picture and Background
    const bgImg = document.createElement("span");
    bgImg.className = "bg_img";
    bgImg.style.backgroundImage = `url(/userpic/banner/${profile.banner_picture})`;
    bgImg.addEventListener('click', () => {
        // Open the Sightbox with an image when the button is clicked
        Sightbox(`/userpic/banner/${profile.banner_picture}`, 'image');
    });

    if (profile.userid == state.user) {
        const showEditButton = document.createElement('button');
        showEditButton.textContent = '';
        showEditButton.className = 'edit-banner-pic';
        showEditButton.addEventListener('click', () => {
            const content = document.createElement('div');
            const contentx = document.createElement('div');
            content.appendChild(generateBannerForm(contentx, profile.username));

            const modal = Modal({
                title: 'Edit Banner',
                content,
                onClose: () => modal.remove(),
            });
        });

        section.appendChild(showEditButton);
    }

    const profileArea = document.createElement("div");
    profileArea.className = "profile_area";

    const thumb = document.createElement("span");
    thumb.className = "thumb";

    const img = document.createElement("img");
    img.src = `/userpic/${profile.username + '.jpg'}`;
    img.alt = "Profile Picture";
    img.className = "imgful";
    thumb.appendChild(img);

    if (profile.userid == state.user) {
        const showModalButton = document.createElement('button');
        showModalButton.textContent = '';
        showModalButton.className = 'edit-profile-pic';
        showModalButton.addEventListener('click', () => {
            const content = document.createElement('div');
            const contentx = document.createElement('div');
            content.appendChild(generateAvatarForm(contentx, profile.username));

            const modal = Modal({
                title: 'Example Modal',
                content,
                onClose: () => modal.remove(),
            });
        });

        profileArea.appendChild(showModalButton);
    }
    profileArea.appendChild(thumb);

    thumb.addEventListener('click', () => {
        Sightbox(`/userpic/${profile.username + '.jpg'}`, 'image');
    });

    const profileDetails = document.createElement("div");
    profileDetails.className = "profile-details";

    const username = document.createElement("h2");
    username.className = "username";
    username.textContent = profile.username || "Not provided";

    const name = document.createElement("p");
    name.className = "name";
    name.textContent = profile.name || "";

    const email = document.createElement("p");
    email.className = "email";
    email.textContent = profile.email || "";

    const bio = document.createElement("p");
    bio.className = "bio";
    bio.textContent = profile.bio || "";

    const profileActions = document.createElement("div");
    profileActions.className = "profile-actions";

    if (profile.userid == state.user) {
        const editButton = document.createElement("button");
        editButton.className = "btn edit-btn";
        editButton.dataset.action = "edit-profile";
        editButton.textContent = "Edit Profile";
        profileActions.appendChild(editButton);
    }

    if (isLoggedIn && profile.userid !== state.user) {
        const followButton = document.createElement("button");
        followButton.className = "btn follow-button";
        followButton.dataset.action = "toggle-follow";
        followButton.dataset.userid = profile.userid;
        followButton.textContent = profile.isFollowing ? "Unfollow" : "Follow";

        profileActions.appendChild(followButton);
    }


    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";

    const infoItems = [
        { label: "Last Login", value: formatDate(profile.last_login) || "Never logged in" },
        { label: "Account Status", value: profile.is_active ? "Active" : "Inactive" },
        { label: "Verification Status", value: profile.is_verified ? "Verified" : "Not Verified" },
    ];

    infoItems.forEach(item => {
        const infoItem = document.createElement("div");
        infoItem.className = "info-item";
        infoItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
        profileInfo.appendChild(infoItem);
    });

    profileDetails.append(username, name, email, bio, profileActions, profileInfo);

    const statistics = document.createElement("div");
    statistics.className = "statistics";

    const stats = [
        { label: "Posts", value: profile.profile_views || 0 },
        { label: "Followers", value: profile.followers?.length || 0 },
        { label: "Following", value: profile.follows?.length || 0 },
    ];

    stats.forEach(stat => {
        const statItem = document.createElement("p");
        statItem.className = "hflex";
        statItem.innerHTML = `<strong>${stat.value}</strong> ${stat.label}`;
        statistics.appendChild(statItem);
    });

    const followSuggestions = document.createElement("div");
    followSuggestions.id = "follow-suggestions";
    followSuggestions.className = "follow-suggestions";

    if (profile.userid == state.user) {
        const deleteProfileButton = document.createElement("button");
        deleteProfileButton.className = "btn delete-btn";
        deleteProfileButton.dataset.action = "delete-profile";
        deleteProfileButton.textContent = "Delete Profile";

        const deleteActions = document.createElement("div");
        deleteActions.className = "profile-actions";
        deleteActions.appendChild(deleteProfileButton);

        section.append(deleteActions);
    }
    section.prepend(bgImg, profileArea, profileDetails, statistics, followSuggestions);
    profileContainer.appendChild(section);

    return profileContainer;
}

export { profilGen };
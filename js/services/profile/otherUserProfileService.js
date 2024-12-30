import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import Snackbar from '../../components/ui/Snackbar.mjs';
import { fetchUserProfile} from "./fetchProfile.js";
import { profilGen } from "./renderUserProfile.js";


// function renderUserProfile(profile) {
//     const profileContainer = document.createElement("div");
//     profileContainer.className = "profile-container";

//     // Profile Header
//     const profileHeader = document.createElement("div");
//     profileHeader.className = "profile-header";

//     const profilePicture = document.createElement("img");
//     profilePicture.className = "profile-picture";
//     profilePicture.src = `/userpic/${profile.profile_picture || "default.png"}`;
//     profilePicture.alt = "Profile Picture";

//     const profileDetails = document.createElement("div");
//     profileDetails.className = "profile-details";

//     const username = document.createElement("h2");
//     username.className = "username";
//     username.textContent = profile.username || "Not provided";

//     const name = document.createElement("p");
//     name.className = "name";
//     name.textContent = profile.name || "Not provided";

//     const email = document.createElement("p");
//     email.className = "email";
//     email.textContent = profile.email || "Not provided";

//     const bio = document.createElement("p");
//     bio.className = "bio";
//     bio.textContent = profile.bio || "No bio available.";

//     profileDetails.append(username, name, email, bio);
//     profileHeader.append(profilePicture, profileDetails);

//     // Profile Stats
//     const profileStats = document.createElement("div");
//     profileStats.className = "profile-stats";

//     const stats = [
//         { label: "Followers", value: profile.followers?.length || 0 },
//         { label: "Following", value: profile.follows?.length || 0 },
//         { label: "Profile Views", value: profile.profile_views || 0 },
//     ];

//     stats.forEach(stat => {
//         const statDiv = document.createElement("div");
//         statDiv.className = "stat";
//         statDiv.innerHTML = `<strong>${stat.label}:</strong> ${stat.value}`;
//         profileStats.appendChild(statDiv);
//     });

//     // Profile Actions
//     const profileActions = document.createElement("div");
//     profileActions.className = "profile-actions";

//     if (state.token && profile.userid !== state.user) {
//         const followButton = document.createElement("button");
//         followButton.className = "btn follow-button";
//         followButton.dataset.action = "toggle-follow";
//         followButton.dataset.userid = profile.userid;
//         followButton.textContent = profile.isFollowing ? "Unfollow" : "Follow";

//         profileActions.appendChild(followButton);
//     }

//     // Profile Info
//     const profileInfo = document.createElement("div");
//     profileInfo.className = "profile-info";

//     const infoItems = [
//         { label: "Phone Number", value: profile.phone_number || "Not provided" },
//         { label: "Address", value: profile.address || "Not provided" },
//         { label: "Date of Birth", value: formatDate(profile.date_of_birth) || "Not provided" },
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

//     profileContainer.append(profileHeader, profileStats, profileActions, profileInfo);
//     return profileContainer;
// }

// function renderUserProfile(profile) {
//     const profileContainer = document.createElement("div");
//     profileContainer.className = "profile-container hflex";

//     const section = document.createElement("section");
//     section.className = "channel";

//     // Profile Picture and Background
//     const bgImg = document.createElement("span");
//     bgImg.className = "bg_img";
//     bgImg.style.backgroundImage = `url(/userpic/banner/${profile.banner_picture})`;
//     bgImg.addEventListener('click', () => {
//         Sightbox(`/userpic/banner/${profile.banner_picture}`, 'image');
//     });

//     const profileArea = document.createElement("div");
//     profileArea.className = "profile_area";

//     const thumb = document.createElement("span");
//     thumb.className = "thumb";

//     const img = document.createElement("img");
//     img.src = `/userpic/${profile.username + '.jpg'}`;
//     img.alt = "Profile Picture";
//     img.className = "imgful";
//     thumb.appendChild(img);

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

//     if (state.token && profile.userid !== state.user) {
//         const followButton = document.createElement("button");
//         followButton.className = "btn follow-button";
//         followButton.dataset.action = "toggle-follow";
//         followButton.dataset.userid = profile.userid;
//         followButton.textContent = profile.isFollowing ? "Unfollow" : "Follow";

//         profileActions.appendChild(followButton);
//     }

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

//     section.append(bgImg, profileArea, profileDetails, statistics, followSuggestions);
//     profileContainer.appendChild(section);

//     return profileContainer;
// }


async function displayUserProfile(isLoggedIn, content, username) {
    // const content = document.getElementById("content");
    // content.textContent = ""; // Clear existing content

    console.log(isLoggedIn);
    console.log("profile");
    try {
        const userProfile = await fetchUserProfile(username);

        if (userProfile) {
            const profileElement = profilGen(userProfile, isLoggedIn);
            content.appendChild(profileElement);
            attachUserProfileListeners(userProfile); // Attach relevant event listeners
        } else {
            const notFoundMessage = document.createElement("p");
            notFoundMessage.textContent = "User not found.";
            content.appendChild(notFoundMessage);
        }
    } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Failed to load user profile. Please try again later.";
        content.appendChild(errorMessage);


        Snackbar("Error fetching user profile.", 3000);
    }
}

// Attach event listeners for user-specific profile actions
function attachUserProfileListeners(profile) {
    const followButton = document.querySelector(`[data-userid="${profile.userid}"]`);
    if (followButton) {
        followButton.addEventListener("click", () => {
            toggleFollow(profile.userid);
        });
    }
}

// Toggle follow/unfollow status for a user
async function toggleFollow(userId) {
    if (!state.token) {

        Snackbar("Please log in to follow users.", 3000);
        return;
    }

    try {
        const data = await apiFetch(`/follows/${userId}`, 'POST');
        const followButton = document.getElementById(`user-${userId}`);

        if (followButton) {
            followButton.textContent = data.isFollowing ? 'Unfollow' : 'Follow';
            followButton.onclick = () => toggleFollow(userId); // Update onclick handler
        }


        Snackbar(`You have ${data.isFollowing ? 'followed' : 'unfollowed'} the user.`, 3000);
    } catch (error) {
        console.error("Error toggling follow status:", error);

        Snackbar(`Failed to update follow status: ${error.message}`, 3000);
    }
}

export { displayUserProfile, attachUserProfileListeners, toggleFollow };
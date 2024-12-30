import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import Lightbox from '../../components/ui/Lightbox.mjs';
import MediaCard from '../../components/ui/MediaCard.mjs';
import { Button } from "../../components/base/Button.js";
import { createElement } from "../../components/createElement.js";



// Upload media to the server
async function uploadMedia(isLoggedIn, entityType, entityId, mediaList) {
    const fileInput = document.getElementById("mediaFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("media", file);

    try {
        // Upload media through the API
        const uploadResponse = await apiFetch(`/media/${entityType}/${entityId}`, "POST", formData);

        if (uploadResponse && uploadResponse.id) {  // Check if the response contains an 'id'
            alert("Media uploaded successfully!");
            displayNewMedia(isLoggedIn, uploadResponse, mediaList);
        } else {
            alert(`Failed to upload media: ${uploadResponse?.message || 'Unknown error'}`);
        }

    } catch (error) {
        alert(`Error uploading media: ${error.message}`);
    }
}


async function deleteMedia(mediaId, entityType, entityId) {
    if (confirm('Are you sure you want to delete this media?')) {
        try {
            const response = await apiFetch(`/media/${entityType}/${entityId}/${mediaId}`, 'DELETE');

            if (response.ok) {  // Handle the 204 No Content status
                alert('Media deleted successfully!');
                // Optionally, refresh the media list or update the UI
                // displayEntity(entityId); // Uncomment if you have access to entityId
            } else {
                const errorData = await response.json();
                alert(`Failed to delete media: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('An error occurred while deleting the media.');
        }
    }
}

let mediaItems = []; // Ensure this is globally scoped

function renderMediaItem(media, index) {
    const mediaItem = document.createElement("div");
    mediaItem.className = "media-item";

    let mediaContent = "";
    if (media.type === "image") {
        mediaContent = `
            <figure>
                <img src="/uploads/${media.url}" 
                     alt="${media.caption || 'Media Image'}" 
                     class="media-img" 
                     data-index="${index}" />
                <figcaption>${media.caption || "No caption provided"}</figcaption>
            </figure>
        `;
    } else if (media.type === "video") {
        mediaContent = `
            <figure>
                <video class="media-video" controls>
                    <source src="/uploads/${media.url}" type="video/mp4" />
                </video>
                <figcaption>${media.caption || "No caption provided"}</figcaption>
            </figure>
        `;
    }

    mediaItem.innerHTML = mediaContent;
    return mediaItem;
}

function addMediaEventListeners(isLoggedIn, entityType) {

    // Event delegation for upload button
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (target.id === "uploadMediaBtn") {
            const entityId = target.getAttribute("data-entity-id");
            uploadMedia(isLoggedIn, entityType, entityId);
        }
    });

}

// Show media upload form
function showMediaUploadForm(isLoggedIn, entityType, entityId, mediaList) {
    // const mediaList = document.getElementById(`edit${entityType}`);
    // mediaList.textContent = "";

    const div = document.createElement("div");
    div.setAttribute("id", "mediaform");

    const title = document.createElement("h3");
    title.textContent = `Upload ${entityType} Media`;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "mediaFile";
    fileInput.accept = "image/*,video/*";

    const previewDiv = document.createElement("div");
    previewDiv.id = "mediaPreview";

    const button = Button("Upload", "uploadMediaBtn", {
        click: () => uploadMedia(isLoggedIn, entityType, entityId, mediaList),
    });

    div.appendChild(title);
    div.appendChild(fileInput);
    div.appendChild(previewDiv);
    div.appendChild(button);


    mediaList.prepend(div);
}


async function displayMedia(mediaData, entityType, entityId, isLoggedIn, content) {
    content.innerHTML = ""; // Clear existing content
    let mediaList = createElement("div", { class: "hvflex" })
    content.appendChild(mediaList);

    if (!Array.isArray(mediaData)) {
        throw new Error("Invalid media data received.");
    }

    if (isLoggedIn) {
        const button = Button("Add Media", "add-media-btn", {
            click: () => showMediaUploadForm(isLoggedIn, entityType, entityId, content),
        });

        content.prepend(button);
    }

    if (mediaData.length > 0) {
        const mediaCards = []; // For Lightbox

        mediaData.forEach((media, index) => {
            const mediaCard = MediaCard({
                mediaType: media.type,
                src: `/uploads/${media.url}`,
                title: media.caption || "No caption provided",
                index,
            });

            
            if (isLoggedIn && state.user === media.creatorid) {
                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-media-btn";
                deleteButton.textContent = "Delete";
                deleteButton.dataset.mediaId = media.id;
                deleteButton.dataset.entityId = entityId;

                deleteButton.addEventListener("click", async () => {
                    await deleteMedia(media.id, entityType, entityId);
                });

                mediaCard.appendChild(deleteButton);
            }
            // if (isLoggedIn && state.user === media.creatorid) {
            //     const deleteButton = createElement("button", {
            //         textContent: "Delete",
            //         className: "delete-media-btn",
            //         events: {
            //             click: async () => await deleteMedia(media.id, entityType, entityId),
            //         },
            //     });

            //     mediaCard.appendChild(deleteButton);
            // }

            mediaList.appendChild(mediaCard);

            if (media.type === "image") {
                mediaCards.push(`/uploads/${media.url}`);
            }
        });

        // Add Lightbox functionality
        mediaList.querySelectorAll(".media-image").forEach((img, index) => {
            img.addEventListener("click", () => Lightbox(mediaCards, index));
        });
    } else {
        mediaList.appendChild(createElement("p", { textContent: "No media available for this entity." }));
    }
}


// Display newly uploaded media in the list
function displayNewMedia(isLoggedIn, mediaData, mediaList) {
    // const mediaList = document.getElementById("media-list");
    const isCreator = isLoggedIn && state.user === mediaData.creatorid;

    const mediaItem = document.createElement("div");
    mediaItem.className = "imgcon";

    let mediaContent = "";

    // Render image or video depending on media type
    if (mediaData.type === "image") {
        mediaContent = `
            <img src="/uploads/${mediaData.url}" alt="${mediaData.caption || "Media"}" 
                class="media-img" data-index="${mediaItems.length}" 
                style="max-width: 160px; max-height: 240px; height: auto; width: auto;" />
        `;
    } else if (mediaData.type === "video") {
        mediaContent = `
            <video controls style="max-width: 160px; max-height: 240px;">
                <source src="/uploads/${mediaData.url}" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        `;
    }

    mediaItem.innerHTML = `
        <h3>${mediaData.caption || "No caption provided"}</h3>
        ${mediaContent}
        ${isCreator ? `
            <button class="delete-media-btn" data-media-id="${mediaData.id}" data-entity-id="${mediaData.entityid}">Delete</button>
        ` : ""}
    `;

    mediaList.appendChild(mediaItem); // Append the new media item to the list
    mediaItems.push(mediaData); // Add the new media to the global mediaItems array
}

export { displayMedia, renderMediaItem, showMediaUploadForm, uploadMedia, displayNewMedia, deleteMedia, addMediaEventListeners };

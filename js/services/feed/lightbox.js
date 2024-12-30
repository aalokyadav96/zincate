
// Open Lightbox with the clicked image
function opensLightbox(image, totalImages, postIndex, media) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");

    // Show the lightbox
    lightbox.style.display = "flex";

    // Set the lightbox image and caption
    lightboxImage.src = `${image}`;
    lightboxCaption.innerHTML = `Image ${postIndex + 1} of ${totalImages}`;
    currentImageIndex = postIndex;
    totalImagesInLightbox = totalImages;

    // Attach the media array for navigation
    lightbox.dataset.media = JSON.stringify(media);
}

// Close the Lightbox
function closesLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "none"; // Hide the lightbox
}

// Navigate through images in the lightbox
let currentImageIndex = 0;
let totalImagesInLightbox = 0;

function changesImage(direction) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");

    // Parse the media array stored in the dataset
    const media = JSON.parse(lightbox.dataset.media || "[]");

    // Update the current image index
    currentImageIndex = (currentImageIndex + direction + totalImagesInLightbox) % totalImagesInLightbox;

    // Update the lightbox image and caption
    lightboxImage.src = `${media[currentImageIndex]}`;
    lightboxCaption.innerHTML = `Image ${currentImageIndex + 1} of ${totalImagesInLightbox}`;
}

export {opensLightbox, closesLightbox, changesImage};
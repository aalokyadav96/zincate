(function () {
    const adContainer = document.getElementById("sda-container");

    if (!adContainer) {
        console.error("Ad container not found!");
        return;
    }

    // Fetch ad data from the backend
    fetch("http://localhost:4000/api/sda?category=tech")
        .then((response) => response.json())
        .then((ads) => {
            if (ads.length === 0) {
                adContainer.innerHTML = "<p>No ads available</p>";
                return;
            }

            // Display the first ad as an example
            const ad = ads[0];
            adContainer.innerHTML = `
                <div class="ad">
                    <img src="${ad.image}" alt="${ad.title}" style="width: 100%; height: auto;" />
                    <h3>${ad.title}</h3>
                    <p>${ad.description}</p>
                    <a href="${ad.link}" target="_blank" style="color: blue;">Learn More</a>
                </div>
            `;
        })
        .catch((error) => {
            console.error("Error fetching ads:", error);
            adContainer.innerHTML = "<p>Error loading ads</p>";
        });
})();


// // Function to handle navigation
// function navigateToEvent(eventId) {
//     // Update the URL without reloading
//     history.pushState({ eventId }, '', `/event/${eventId}`);

//     // Fetch and display the event details dynamically
//     fetch(`/api/event/${eventId}`)
//         .then(response => response.json())
//         .then(event => {
//             const contentDiv = document.getElementById('content'); // Your content container
//             contentDiv.innerHTML = `
//                 <h1>${event.title}</h1>
//                 <img src="${event.banner_image}" alt="${event.title} Banner" style="width: 100%; max-height: 300px; object-fit: cover;" />
//                 <p><strong>Place:</strong> ${event.place}</p>
//                 <p><strong>Address:</strong> ${event.location}</p>
//                 <p><strong>Description:</strong> ${event.description}</p>
//             `;
//         })
//         .catch(error => console.error('Error fetching event details:', error));
// }

// // Handle back/forward navigation
// window.addEventListener('popstate', function (e) {
//     if (e.state && e.state.eventId) {
//         navigateToEvent(e.state.eventId); // Handle back/forward navigation
//     }
// });

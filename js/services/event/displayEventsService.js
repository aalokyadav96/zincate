import Pagination from '../../components/ui/Pagination.mjs';
import { apiFetch } from "../../api/api.js";
// import Breadcrumb from '../../components/ui/Breadcrumb.mjs';
import SnackBar from '../../components/ui/Snackbar.mjs';
import { navigate } from "../../routes/index.js";

let abortController = null;

async function fetchEvents(page = 1, limit = 10) {
    // Abort the previous fetch if it's still ongoing
    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController(); // Create a new instance
    const signal = abortController.signal; // Get the signal to pass to apiFetch

    try {
        // Use apiFetch to fetch events and pass the signal for aborting
        const queryParams = new URLSearchParams({ page: page, limit: limit }).toString();
        const events = await apiFetch(`/events/events?${queryParams}`, 'GET', null, { signal });
        console.log(events);
        return events;
    } catch (error) {
        // If error is due to abort, return null
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
            return null; // Return null for aborted fetch
        }
        console.error('Error fetching events:', error);
        SnackBar("An unexpected error occurred while fetching events.", 3000);
        return null; // Return null for other errors
    }
}

async function fetchTotalEventCount() {
    return 5;
}


// Event listener for navigation
document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link && link.id.startsWith('a-')) {
        e.preventDefault(); // Prevent page reload
        const eventId = link.id.split('-')[1]; // Extract event ID
        navigate(`/event/${eventId}`); // Handle navigation
    }
});


async function displayEvents(isLoggedIn, content, contentcon, page = 1) {
    const eventsPerPage = 4; // Number of events per page
    content.innerHTML = ''; // Clear the main content area

    // Create a container for events
    const eventDiv = document.createElement("div");
    eventDiv.id = "events";
    content.appendChild(eventDiv);

    try {
        // Fetch events for the current page
        const events = await fetchEvents(page, eventsPerPage);

        if (events && events.length > 0) {
            eventDiv.innerHTML = events.map(generateEventHTML).join('');
            console.log("Displayed refreshed events.");
        } else {
            eventDiv.innerHTML = "<h2>No events available.</h2>";
        }

        // Handle pagination
        const totalEvents = await fetchTotalEventCount(); // Get the total event count from the backend
        const totalPages = Math.ceil(totalEvents / eventsPerPage);

        const paginationContainer = document.getElementById("pagination") || document.createElement('div');
        paginationContainer.id = "pagination";
        paginationContainer.className = "pagination";

        // Clear and rebuild pagination
        paginationContainer.innerHTML = '';
        const pagination = Pagination(page, totalPages, (newPage) => {
            displayEvents(isLoggedIn, content, contentcon, newPage);
        });

        paginationContainer.appendChild(pagination);

        // Append the pagination to the content container
        if (!document.getElementById("pagination")) {
            contentcon.appendChild(paginationContainer);
        }
    } catch (error) {
        content.innerHTML = "<h2>Error loading events. Please try again later.</h2>";
        console.error("Error fetching events:", error);
    }
}


// Generate HTML for each event
function generateEventHTML(event) {
    return `
        <div class="event" id="event-${event.eventid}">
            <a href="/event/${event.eventid}" title="View event details" id="a-${event.eventid}">
                <h1>${event.title}</h1>
                <img src="/eventpic/${event.banner_image}" alt="${event.title} Banner" style="width: 100%; max-height: 300px; object-fit: cover;" />
                <p><strong>Place:</strong> ${event.place}</p>
                <p><strong>Address:</strong> ${event.location}</p>
                <p><strong>Description:</strong> ${event.description}</p>
            </a>
        </div>
    `;
}


export { displayEvents, generateEventHTML };
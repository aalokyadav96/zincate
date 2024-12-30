import { state } from "../../state/state.js";
import { apiFetch } from "../../api/api.js";
import { displayTickets } from "../tickets/ticketService.js";
import { displayMedia } from "../media/mediaService.js";
import { displayMerchandise } from "../merch/merchService.js";
import { navigate } from "../../routes/index.js";
import SnackBar from '../../components/ui/Snackbar.mjs';
import Breadcrumb from '../../components/ui/Breadcrumb.mjs';
// import Countdown from '../../components/ui/Countdown.mjs';
import { createFormGroup } from "../../components/createFormGroup.js";
import { createButton, createHeading, createContainer, createImage } from "./eventHelper.js";
import { displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews, getTabs } from "./eventTabs.js";
import { createElement } from "../../components/createElement.js";


async function updateEvent(isLoggedIn, eventId) {
    if (!isLoggedIn) {
        SnackBar("Please log in to update event.", 3000);
        return;
    }

    const title = document.getElementById("event-title").value.trim();
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const place = document.getElementById("event-place").value.trim();
    const location = document.getElementById("event-location").value.trim();
    const description = document.getElementById("event-description").value.trim();
    const bannerFile = document.getElementById("event-banner").files[0];

    // Validate input values
    if (!title || !date || !time || !place || !location || !description) {
        SnackBar("Please fill in all required fields.", 3000);
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('place', place);
    formData.append('location', location);
    formData.append('description', description);
    if (bannerFile) {
        formData.append('event-banner', bannerFile);
    }

    try {
        const result = await apiFetch(`/events/event/${eventId}`, 'PUT', formData);
        SnackBar(`Event updated successfully: ${result.title}`, 3000);
        navigate('/event/' + result.eventid);
    } catch (error) {
        SnackBar(`Error updating event: ${error.message}`, 3000);
    }
}

async function displayEvent(isLoggedIn, eventId, contentContainer) {
    try {
        const eventData = await fetchEventData(eventId);
        const isCreator = isLoggedIn && state.user === eventData.creatorid;

        contentContainer.innerHTML = '';
        displayEventDetails(contentContainer, eventData, isCreator, isLoggedIn)
        
        // // Main Event Details Container
        // const eventDetails = createContainer(['event-details']);
        
        // // Header Section
        // const eventHeader = createContainer(['event-header']);

        // const eventBanner = createContainer(['event-banner']);
        // const bannerImage = createImage({
        //     src: `/eventpic/${eventData.banner_image}`,
        //     alt: `Banner for ${eventData.title}`,
        //     classes: ['event-banner-image'],
        // });
        // eventBanner.appendChild(bannerImage);

        // const eventInfo = createContainer(['event-info']);
        // eventInfo.appendChild(createHeading('h1', eventData.title, ['event-title']));
        // eventInfo.appendChild(createHeading('p', `Date: ${new Date(eventData.date).toLocaleString()}`, ['event-date']));

        // // Place Link
        // const placeLink = document.createElement('a');
        // placeLink.href = `/place/${eventData.place}`;
        // placeLink.classList.add('event-place-link');
        // placeLink.textContent = eventData.place;

        // const placeParagraph = document.createElement('p');
        // placeParagraph.classList.add('event-place');
        // placeParagraph.textContent = 'Place: ';
        // placeParagraph.appendChild(placeLink);

        // eventInfo.appendChild(placeParagraph);
        // eventInfo.appendChild(createHeading('p', `Location: ${eventData.location}`, ['event-location']));
        // eventInfo.appendChild(createHeading('p', eventData.description, ['event-description']));
        // eventHeader.appendChild(eventBanner);
        // eventHeader.appendChild(eventInfo);
        // eventHeader.appendChild(createElement('div', { id: 'editevent' }));
        // eventDetails.appendChild(eventHeader);

        // Tabs Section
        const tabContainer = createContainer(['event-tabs']);
        const tabButtons = createContainer(['tab-buttons']);
        const tabContents = createContainer(['tab-contents']);

        // Tab content containers
        const tabcon = [
            createElement("div", { id: "ticket-list", classes: ["ticket-list"] }),
            createElement("div", { id: "venue-list", classes: ["venue-list"] }),
            createElement("div", { id: "merch-list", classes: ["merch-list"] }),
            createElement("div", { id: "media-list", classes: ["media-list"] }),
            createElement("div", { id: "reviews-container", classes: ["reviews-container"] }),
            createElement("div", { id: "timeline-container", classes: ["timeline-container"] }),
            createElement("div", { id: "faq-container", classes: ["faq-container"] })
        ];

        const tabs = [
            { title: 'Tickets', id: 'tickets-tab', render: () => displayTickets(eventData.tickets, eventId, isCreator, isLoggedIn, tabcon[0]) },
            { title: 'Venue', id: 'venue-tab', render: () => displayEventVenue(eventData.place, isLoggedIn, tabcon[1]) },
            { title: 'Merchandise', id: 'merch-tab', render: () => displayMerchandise(eventData.merch, eventId, isCreator, isLoggedIn, tabcon[2]) },
            { title: 'Media', id: 'media-tab', render: () => displayMedia(eventData.media, 'event', eventId, isLoggedIn, tabcon[3]) },
            { title: 'Reviews', id: 'reviews-tab', render: () => displayEventReviews(isCreator, isLoggedIn, tabcon[4]) },
            { title: 'Timeline', id: 'timeline-tab', render: () => displayEventTimeline(isCreator, isLoggedIn, tabcon[5]) },
            { title: 'FAQ', id: 'faq-tab', render: () => displayEventFAQ(isCreator, tabcon[6]) },
        ];

        tabs.forEach(({ title, id, render }, index) => {
            const tabButton = createButton({
                text: title,
                classes: ['tab-button'],
                events: { click: () => activateTab(id, render, tabcon[index]) },
            });
            tabButtons.appendChild(tabButton);

            const tabContent = createContainer(['tab-content'], id);
            tabContents.appendChild(tabContent);
        });

        tabContainer.appendChild(tabButtons);
        tabContainer.appendChild(tabContents);

        const eventDetails = createContainer(['event-details']);
        eventDetails.appendChild(tabContainer);
        contentContainer.appendChild(eventDetails);

        // Activate the first tab by default
        activateTab(tabs[0].id, tabs[0].render, tabcon[0]);

        // Tab Activation Function
        function activateTab(tabId, renderContent, tabcon) {
            // Toggle active class on the tab buttons
            document.querySelectorAll('.tab-button').forEach((btn, index) => {
                btn.classList.toggle('active', tabs[index].id === tabId);
            });

            // Toggle active class on the tab content containers
            document.querySelectorAll('.tab-content').forEach((content) => {
                content.classList.toggle('active', content.id === tabId);
            });

            // Append the corresponding tabcon content to the active tab-content container
            const activeTabContent = document.querySelector(`#${tabId}`);
            if (activeTabContent && !activeTabContent.contains(tabcon)) {
                activeTabContent.innerHTML = ''; // Clear previous content
                activeTabContent.appendChild(tabcon); // Append the new content
            }

            // Render content only if the tab content is empty
            if (tabcon && !tabcon.innerHTML.trim()) {
                renderContent(tabcon);
            }

            // Update the browser history for the active tab
            history.pushState({ eventId, tabId }, '', `/event/${eventId}#${tabId}`);
        }

    } catch (error) {
        contentContainer.innerHTML = '';
        contentContainer.appendChild(createElement('h1', { textContent: `Error loading event details: ${error.message}` }));
        SnackBar("Failed to load event details. Please try again later.", 3000);
    }
}

async function fetchEventData(eventId) {
    const eventData = await apiFetch(`/events/event/${eventId}`);
    if (!eventData || !Array.isArray(eventData.tickets)) {
        throw new Error("Invalid event data received.");
    }
    return eventData;
}


async function editEventForm(isLoggedIn, eventId) {
    const createSection = document.getElementById("editevent");
    if (isLoggedIn) {
        try {
            // Fetch event data from the server (uncomment when the API is available)
            // const event = await apiFetch(`/events/event/${eventId}`);

            // Clear the content of createSection
            createSection.innerHTML = '';

            // Create the form container
            const formContainer = document.createElement('div');
            formContainer.classList.add('form-container');

            const formHeading = document.createElement('h2');
            formHeading.textContent = 'Edit Event';

            // Create the form
            const form = document.createElement('form');
            form.id = 'edit-event-form';
            form.classList.add('edit-event-form');

            // Add form groups
            const formGroups = [
                { label: 'Event Title', inputType: 'text', inputId: 'event-title', inputValue: '34rtf34', placeholder: 'Event Title', isRequired: true },
                { label: 'Event Date', inputType: 'date', inputId: 'event-date', inputValue: '2024-11-28', isRequired: true },
                { label: 'Event Time', inputType: 'time', inputId: 'event-time', inputValue: '00:00', isRequired: true },
                { label: 'Event Location', inputType: 'text', inputId: 'event-location', inputValue: 'wterwtr', placeholder: 'Location', isRequired: true },
                { label: 'Event Place', inputType: 'text', inputId: 'event-place', inputValue: 'wter', placeholder: 'Place', isRequired: true },
                { label: 'Event Description', inputType: 'textarea', inputId: 'event-description', inputValue: 'terter', placeholder: 'Description', isRequired: true },
                { label: 'Event Banner', inputType: 'file', inputId: 'event-banner', additionalProps: { accept: 'image/*' } },
            ];

            formGroups.forEach(group => {
                form.appendChild(createFormGroup(group));
            });

            // Update Button
            const updateButton = document.createElement('button');
            updateButton.type = 'submit';
            updateButton.classList.add('update-btn');
            updateButton.textContent = 'Update Event';
            form.appendChild(updateButton);

            // Append form to formContainer
            formContainer.appendChild(formHeading);
            formContainer.appendChild(form);

            // Append formContainer to createSection
            createSection.appendChild(formContainer);

            // Attach event listener to the form for submitting the update
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await updateEvent(isLoggedIn, eventId);
            });

        } catch (error) {
            SnackBar(`Error loading event: ${error.message}`, 3000);
        }
    } else {
        navigate('/login');
    }
}

async function deleteEvent(isLoggedIn, eventId) {
    if (!isLoggedIn) {
        SnackBar("Please log in to delete your event.", 3000);
        return;
    }
    if (confirm("Are you sure you want to delete this event?")) {
        try {
            await apiFetch(`/events/event/${eventId}`, 'DELETE');
            SnackBar("Event deleted successfully.", 3000);
            navigate('/events'); // Redirect to home or another page
        } catch (error) {
            SnackBar(`Error deleting event: ${error.message}`, 3000);
        }
    }
};

async function displayEventDetails(content, eventData, isCreator, isLoggedIn) {
    // const isCreator = state.token && state.user === eventData.creatorid;

    content.innerHTML = '';

    // Event Details Container
    const eventDetails = createContainer(['event-details']);

    // Header Section
    const eventHeader = createContainer(['event-header']);

    const eventBanner = createContainer(['event-banner']);
    const bannerImage = createImage({
        src: `/eventpic/${eventData.banner_image}`,
        alt: `Banner for ${eventData.title}`,
        classes: ['event-banner-image'],
    });
    eventBanner.appendChild(bannerImage);

    // const eventEndDate = new Date(Date.now() + 3600000); // 1 hour from now
    // const countdown = Countdown(eventEndDate, () => {
    //     alert('Event has ended!');
    // });

    const eventInfo = createContainer(['event-info']);
    const eventActions = createContainer(['event-actions'], 'event-actions');
    const eventAdditions = createContainer(['event-actions'], 'event-actions');
    const eventEdit = createContainer(['event-edit'], 'editevent');

    const placeLink = document.createElement('a');
    placeLink.href = `/place/${eventData.place}`;
    placeLink.classList.add('event-place-link');
    placeLink.textContent = eventData.place;

    const placeParagraph = document.createElement('p');
    placeParagraph.classList.add('event-place');
    placeParagraph.textContent = 'Place: ';
    placeParagraph.appendChild(placeLink);

    eventBanner.prepend(eventActions);
    eventInfo.appendChild(createHeading('h1', eventData.title, ['event-title']));
    eventInfo.appendChild(createHeading('p', `Date: ${new Date(eventData.date).toLocaleString()}`, ['event-date']));
    eventInfo.appendChild(placeParagraph);
    eventInfo.appendChild(createHeading('p', `Location: ${eventData.location}`, ['event-location']));
    eventInfo.appendChild(createHeading('p', eventData.description, ['event-description']));

    // eventBanner.appendChild(countdown);
    eventHeader.appendChild(eventBanner);
    eventHeader.appendChild(eventInfo);
    eventInfo.appendChild(eventAdditions);

    const breadcrumb = Breadcrumb([
        { label: 'Home', href: '/' },
        { label: 'Events', href: '/events' },
        { label: 'Event Details', href: `/event/${eventData.eventid}` },
    ]);

    eventDetails.appendChild(breadcrumb);
    eventDetails.appendChild(eventHeader);
    eventDetails.appendChild(eventEdit);

    content.appendChild(eventDetails);

    // Add actions if logged in
    if (isLoggedIn) {
        const eventActionsWrapper = createContainer(['event-actions-wrapper']);
        const eventAdditionsWrapper = createContainer(['event-actions-wrapper']);

        if (isCreator) {
            const actions = [
                { text: 'Edit Event', onClick: () => editEventForm(isLoggedIn, eventData.eventid) },
                { text: 'Delete Event', onClick: () => deleteEvent(isLoggedIn, eventData.eventid), classes: ['delete-btn'] },
            ];

            actions.forEach(({ text, onClick, classes = [] }) => {
                eventActionsWrapper.appendChild(createButton({
                    text,
                    classes: ['action-btn', ...(classes || [])].filter(Boolean),
                    events: { click: onClick },
                }));
            });

        }

        eventActions.appendChild(eventActionsWrapper);
        eventAdditions.appendChild(eventAdditionsWrapper);
    }
}

export { updateEvent, fetchEventData, editEventForm, deleteEvent, displayEvent, displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews };
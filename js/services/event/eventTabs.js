import EventTimeline from '../../components/ui/EventTimeline.mjs';
import Accordion from '../../components/ui/Accordion.mjs';
import ReviewItem from '../../components/ui/ReviewItem.mjs';
import { Button } from "../../components/base/Button.js";
import { createElement } from "../../components/createElement.js";

// // Function to display venue for the event
// async function displayEventVenue(place) {
//     const venueList = document.getElementById("venue-details");
//     venueList.innerHTML = `<li>Place: ${place}</li>`;  // Show loading state
// }

// async function displayEventTimeline(isCreator) {
//     const timeline = document.getElementById("time-line");

//     if (isCreator) {
//         const button = Button("Add Timeline", "add-timeline-btn", {
//             click: () => alert("Button clicked!"),
//             mouseenter: () => console.log("Button hovered"),
//         });

//         timeline.appendChild(button);
//     }
//     var events;
//     // const events = [
//     //     { time: '10:00 AM', description: 'Opening Ceremony' },
//     //     { time: '12:00 PM', description: 'Keynote Speech' },
//     //     { time: '2:00 PM', description: 'Workshops' },
//     // ];

//     const tml = EventTimeline(events);
//     timeline.appendChild(tml);
// }

// async function displayEventFAQ(isCreator) {
//     const timeline = document.getElementById("event-faq");

//     if (isCreator) {
//         const button = Button("Add FAQs", "add-faq-btn", {
//             click: () => alert("Button clicked!"),
//             mouseenter: () => console.log("Button hovered"),
//         });
//         timeline.appendChild(button);
//     }

//     const sections = [
//         { title: 'What is this event?', content: document.createTextNode('This is an example event.') },
//         { title: 'How to register?', content: document.createTextNode('You can register through the registration form.') },
//         { title: 'What is the refund policy?', content: document.createTextNode('Refunds are not available.') },
//     ];

//     const accordion = Accordion(sections);
//     timeline.appendChild(accordion);
// }

async function displayEventReviews(isCreator, isLoggedIn, reviewsContainer) {
    // const timeline = document.getElementById("event-reviews");
    const timeline = reviewsContainer;

    if (!isCreator && isLoggedIn) {
        const button = Button("Add Review", "add-review-btn", {
            click: () => alert("Button clicked!"),
            mouseenter: () => console.log("Button hovered"),
        });

        timeline.appendChild(button);
    }

    const reviews = [
        { reviewerName: 'Alice', rating: 5, comment: 'Excellent place!' },
        { reviewerName: 'Bob', rating: 4, comment: 'Great experience.' },
        { reviewerName: 'Charlie', rating: 3, comment: 'It was okay.' },
    ];

    reviews.forEach((review) => {
        timeline.appendChild(ReviewItem(review));
    });
}

async function displayEventVenue(place, isLoggedIn, venueList) {
    // const venueList = document.getElementById("venue-details");
    venueList.innerHTML = ''; // Clear existing content

    const listItem = createElement('li');
    listItem.innerHTML = `Place: ${place}`;
    venueList.appendChild(listItem);
}

async function displayEventTimeline(isCreator, isLoggedIn, timeline) {
    // const timeline = document.getElementById("time-line");
    timeline.innerHTML = ''; // Clear existing content

    if (isCreator) {
        const button = Button("Add Timeline", "add-timeline-btn", {
            click: () => alert("Button clicked!"),
            mouseenter: () => console.log("Button hovered"),
        });

        timeline.appendChild(button);
    }

    // if (isCreator) {
    //     const addButton = createElement('button', {
    //         textContent: "Add Timeline",
    //         id: "add-timeline-btn",
    //         classes: ['btn'],
    //         events: {
    //             click: () => alert("Button clicked!"),
    //             mouseenter: () => console.log("Button hovered"),
    //         },
    //     });
    //     timeline.appendChild(addButton);
    // }

    const events = [
        { time: '10:00 AM', description: 'Opening Ceremony' },
        { time: '12:00 PM', description: 'Keynote Speech' },
        { time: '2:00 PM', description: 'Workshops' },
    ];

    const timelineList = createElement('ul', { classes: ['timeline-list'] });
    events.forEach((event) => {
        const listItem = createElement('li', {
            textContent: `${event.time} - ${event.description}`,
            classes: ['timeline-item'],
        });
        timelineList.appendChild(listItem);
    });

    timeline.appendChild(timelineList);
}

async function displayEventFAQ(isCreator, faqContainer) {
    // const faqContainer = document.getElementById("event-faq");
    faqContainer.innerHTML = ''; // Clear existing content

        if (isCreator) {
        const button = Button("Add FAQs", "add-faq-btn", {
            click: () => alert("Button clicked!"),
            mouseenter: () => console.log("Button hovered"),
        });
        faqContainer.appendChild(button);
    }

    // if (isCreator) {
    //     const addButton = createElement('button', {
    //         textContent: "Add FAQs",
    //         id: "add-faq-btn",
    //         classes: ['btn'],
    //         events: {
    //             click: () => alert("Button clicked!"),
    //             mouseenter: () => console.log("Button hovered"),
    //         },
    //     });
    //     faqContainer.appendChild(addButton);
    // }

    const sections = [
        { title: 'What is this event?', content: 'This is an example event.' },
        { title: 'How to register?', content: 'You can register through the registration form.' },
        { title: 'What is the refund policy?', content: 'Refunds are not available.' },
    ];

    sections.forEach(({ title, content }) => {
        const faqItem = createElement('div', { classes: ['faq-item'] });
        const faqTitle = createElement('h3', { textContent: title, classes: ['faq-title'] });
        const faqContent = createElement('p', { textContent: content, classes: ['faq-content'] });

        faqItem.appendChild(faqTitle);
        faqItem.appendChild(faqContent);
        faqContainer.appendChild(faqItem);
    });
}

// async function displayEventReviews(isCreator, isLoggedIn, reviewsContainer) {
//     // const reviewsContainer = document.getElementById("event-reviews");
//     reviewsContainer.innerHTML = ''; // Clear existing content

//     if (!isCreator && isLoggedIn) {
//         const addButton = createElement('button', {
//             textContent: "Add Review",
//             id: "add-review-btn",
//             classes: ['btn'],
//             events: {
//                 click: () => alert("Button clicked!"),
//                 mouseenter: () => console.log("Button hovered"),
//             },
//         });
//         reviewsContainer.appendChild(addButton);
//     }

//     const reviews = [
//         { reviewerName: 'Alice', rating: 5, comment: 'Excellent place!' },
//         { reviewerName: 'Bob', rating: 4, comment: 'Great experience.' },
//         { reviewerName: 'Charlie', rating: 3, comment: 'It was okay.' },
//     ];

//     reviews.forEach(({ reviewerName, rating, comment }) => {
//         const reviewItem = createElement('div', { classes: ['review-item'] });
//         const reviewer = createElement('h4', { textContent: reviewerName, classes: ['reviewer-name'] });
//         const reviewRating = createElement('p', { textContent: `Rating: ${rating}`, classes: ['review-rating'] });
//         const reviewComment = createElement('p', { textContent: comment, classes: ['review-comment'] });

//         reviewItem.appendChild(reviewer);
//         reviewItem.appendChild(reviewRating);
//         reviewItem.appendChild(reviewComment);
//         reviewsContainer.appendChild(reviewItem);
//     });
// }



function getTabs(eventData) {
    const tabs = [
        { title: 'Tickets', id: 'ticket-list' },
        { title: 'Venue Details', id: 'venue-details' },
        { title: 'Merchandise', id: 'merch-list' },
        { title: 'Media', id: 'media-list' },
    ];

    if (eventData.reviews != null) {
        tabs.push({ title: 'Reviews', id: 'event-reviews' });
    }
    if (eventData.timeline != null) {
        tabs.push({ title: 'Event Timeline', id: 'time-line' });
    }
    if (eventData.faq != null) {
        tabs.push({ title: 'FAQ', id: 'event-faq' });
    }

    return tabs.map(tab => ({
        ...tab,
        content: createElement('div', { id: tab.id, classes: ['tab-content'] }),
    }));
}

// function getTabs(eventData) {
//     const tabs = [
//         { title: 'Tickets', id: 'ticket-list', content: '' },
//         { title: 'Venue Details', id: 'venue-details', content: '' },
//         { title: 'Merchandise', id: 'merch-list', content: '' },
//         { title: 'Media', id: 'media-list', content: '' },
//     ];
//     if (eventData.reviews != null) {
//         tabs.push({ title: 'Reviews', id: 'event-reviews', content: '' },)
//     }
//     if (eventData.timeline != null) {
//         tabs.push({ title: 'Event Timeline', id: 'time-line', content: '' },)
//     }
//     if (eventData.faq != null) {
//         tabs.push({ title: 'FAQ', id: 'event-faq', content: '' },)
//     }

//     return tabs
// }

export { displayEventVenue, displayEventTimeline, displayEventFAQ, displayEventReviews, getTabs };
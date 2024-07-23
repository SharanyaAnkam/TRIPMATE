document.addEventListener('DOMContentLoaded', function() {
    const tripForm = document.getElementById('trip-form');
    if (tripForm) {
        tripForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const destination = document.getElementById('destination').value;
            const days = document.getElementById('days').value;

            try {
                const response = await fetch(`http://localhost:3000/api/itinerary/${destination}?days=${days}`);
                const data = await response.json();

                const itineraryContainer = document.getElementById('itinerary');
                itineraryContainer.innerHTML = '';

                if (!data.activities || data.activities.length === 0) {
                    itineraryContainer.innerHTML = `<p>No itinerary found for ${destination}. Please try another destination.</p>`;
                } else {
                    let currentDay = 0;
                    let dayActivities = [];

                    data.activities.forEach(activity => {
                        if (activity.day !== currentDay) {
                            if (dayActivities.length > 0) {
                                const dayBlock = createDayBlock(currentDay, dayActivities);
                                itineraryContainer.appendChild(dayBlock);
                            }
                            currentDay = activity.day;
                            dayActivities = [];
                        }
                        dayActivities.push(activity);
                    });

                    if (dayActivities.length > 0) {
                        const dayBlock = createDayBlock(currentDay, dayActivities);
                        itineraryContainer.appendChild(dayBlock);
                    }

                    document.getElementById('trip-form').style.display = 'none';

                    const backButton = document.createElement('button');
                    backButton.textContent = 'Go Back';
                    backButton.classList.add('back-button');
                    backButton.addEventListener('click', function () {
                        itineraryContainer.innerHTML = '';
                        document.getElementById('trip-form').style.display = 'block';
                    });
                    itineraryContainer.appendChild(backButton);
                }
            } catch (error) {
                console.error('Error fetching itinerary:', error);
                itineraryContainer.innerHTML = `<p>Failed to fetch itinerary. Please try again later.</p>`;
            }
        });

        function createDayBlock(dayNumber, activities) {
            const dayBlock = document.createElement('div');
            dayBlock.classList.add('day');

            const dayHeading = document.createElement('h2');
            dayHeading.textContent = `Day ${dayNumber}`;
            dayBlock.appendChild(dayHeading);

            activities.forEach(activity => {
                const activityItem = document.createElement('p');
                activityItem.textContent = `${activity.time} - ${activity.description}`;
                dayBlock.appendChild(activityItem);
            });

            return dayBlock;
        }
    }

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                const response = await fetch('http://localhost:3000/api/itinerary/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                const result = await response.json();
                if (result.status === 'success') {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    alert('Failed to send message. Please try again later.');
                }
            } catch (error) {
                console.error('Error sending email:', error);
                alert('Error sending message. Please try again later.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const destinationInput = document.getElementById('destination');
    const suggestionsBox = document.getElementById('suggestions');

    destinationInput.addEventListener('input', async () => {
        const query = destinationInput.value;
        if (query.length > 0) {
            const response = await fetch(`http://localhost:3000/api/itinerary/suggestions/${query}`);
            const suggestions = await response.json();
            displaySuggestions(suggestions);
        } else {
            suggestionsBox.innerHTML = '';
        }
    });

    function displaySuggestions(suggestions) {
        suggestionsBox.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                destinationInput.value = suggestion;
                suggestionsBox.innerHTML = '';
            });
            suggestionsBox.appendChild(suggestionItem);
        });
    }
});

// Modal functionality

const profilePage = document.getElementById("profilePage");

let currentIndex = 0;

// -------------------------------------------Display accommodation section---------------------------------------------------------
// Function to load accommodations and populate the cards
function loadAccommodations() {
    const accommodationsContainer = document.querySelector('.accommodations');

    // Fetch accommodation data from the server
    fetch('http://localhost:3000/api/accommodation')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear existing cards
            accommodationsContainer.innerHTML = '';

            // Iterate over the accommodation data and create cards
            data.forEach(accommodation => {
                const pictures = Array.isArray(accommodation.pictures) ? accommodation.pictures : JSON.parse(accommodation.pictures || '[]'); // Parse JSON

                const card = document.createElement('div');
                card.classList.add('accommodation-card');
                card.setAttribute('onclick', `onAccommodationCardClick(${accommodation.accommodation_id})`);

                card.innerHTML = `
                    <img src="${pictures[0] || 'images/default_pg.jpg'}" alt="${accommodation.accommodation_name}" onerror="this.onerror=null; this.src='images/default_pg.jpg';">
                    <h3>${accommodation.accommodation_name}</h3>
                    <p><b>Address: </b>${accommodation.address}</p>
                    <p><b>Price: </b> ₹${accommodation.price} per room </p><br>
                    <p><u>Click for more details</u></p>
                `;

                accommodationsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching accommodations:', error);
        });
}

// Event listener to call the function when the page is loaded
document.addEventListener('DOMContentLoaded', loadAccommodations);

// -----------------------------------------accommodation details display section----------------------------------------------------

function onAccommodationCardClick(accommodationId) {
    fetch(`http://localhost:3000/api/accommodation/${accommodationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            openAccommodationModal(data);
        })
        .catch(error => {
            console.error('Error fetching accommodation:', error);
            alert('Failed to fetch accommodation details. Please try again.');
        });
}

function openAccommodationModal(data) {
    // Use pictures directly if it's an array; otherwise, parse it
    const pictures = Array.isArray(data.pictures) ? data.pictures : JSON.parse(data.pictures || '[]');
    const facilities = Array.isArray(data.facilities) ? data.facilities : JSON.parse(data.facilities || '[]');

    // Handle room_sharing as a comma-separated string
    const roomSharing = data.room_sharing ? data.room_sharing.split(',') : [];
    const bathroom = data.room_sharing ? data.bathroom.split(',') : [];

    // Set the main image
    const accommodationImage = document.getElementById('accommodationImage');
    accommodationImage.src = pictures[0] || 'images/default_pg.jpg';
    accommodationImage.onerror = () => {
        accommodationImage.src = 'images/default_pg.jpg';
    };

    // Populate thumbnails
    const thumbnailsContainer = document.getElementById('imageThumbnails');
    thumbnailsContainer.innerHTML = '';
    pictures.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `Thumbnail ${index + 1}`;
        thumbnail.classList.add('thumbnail');
        thumbnail.onclick = () => {
            document.getElementById('accommodationImage').src = image;
        };
        thumbnailsContainer.appendChild(thumbnail);
    });

    // Populate accommodation details
    document.getElementById('accommodationName').textContent = data.accommodation_name || 'No Name Available';
    document.getElementById('accommodationAddress').textContent = data.address || 'Unknown';
    document.getElementById('accommodationLandmark').textContent = data.landmark || 'No Landmark Provided';
    document.getElementById('accommodationPrice').textContent = data.price || 'Unknown';
    document.getElementById('accommodationDescription').textContent = data.description || 'No Description Available';
    document.getElementById('accommodationRooms').textContent = data.total_rooms || 'N/A';
    document.getElementById('genderPreference').textContent = data.gender_preference.toUpperCase() || 'N/A';
    document.getElementById('foodType').textContent = data.food_type.toUpperCase() || 'N/A';
    document.getElementById('restrictions').textContent = data.restrictions || 'N/A';

    // Populate room sharing
    const roomSharingContainer = document.getElementById('roomSharing');
    roomSharingContainer.textContent = roomSharing.length
        ? roomSharing.map(share => share.charAt(0).toUpperCase() + share.slice(1)).join(', ')
        : 'N/A';

    const bathroomContainer = document.getElementById('bathroom');
    bathroomContainer.textContent = bathroom.length
        ? bathroom.map(share => share.charAt(0).toUpperCase() + share.slice(1)).join(', ')
        : 'N/A';

    // Populate facilities
    const facilitiesList = document.getElementById('facilitiesList');
    facilitiesList.innerHTML = ''; // Clear existing facilities
    facilities.forEach(facility => {
        const listItem = document.createElement('li');
        listItem.textContent = facility.charAt(0).toUpperCase() + facility.slice(1);
        facilitiesList.appendChild(listItem);
    });

    const contactButton = document.querySelector('.contact-button .button');
    contactButton.onclick = () => showOwnerDetails(data.accommodation_id, data.contact);

    // Show the modal
    document.getElementById('accommodationModal').style.display = 'block';

}

// -----------------------------------------accommodation owner details section----------------------------------------------------

function showOwnerDetails(accommodationId, contact) {
    fetch(`http://localhost:3000/api/owner/details/${accommodationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const ownerEmail = data.email || "Not available";
            const ownerContact = contact || "Not available";

            alert(`Owner Email: ${ownerEmail}\nOwner Contact: ${ownerContact}`);
        })
        .catch(error => {
            console.error("Error fetching owner details:", error);
            alert("Failed to load owner details.");
        });
}

// -----------------------------------------hero section----------------------------------------------------
function showNext() {
    const heroSections = document.querySelector('.hero-sections');
    currentIndex = (currentIndex + 1) % 2; // Switch between 0 and 1
    heroSections.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function showPrevious() {
    const heroSections = document.querySelector('.hero-sections');
    currentIndex = (currentIndex - 1 + 2) % 2; // Ensure it cycles back
    heroSections.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// -----------------------------------------hero section search----------------------------------------------------

function searchAccommodation(event) {
    event.preventDefault(); // Prevent form submission

    const searchInput = document.getElementById('accommodationSearchInput').value;
    const searchResults = document.getElementById('accommodationSearchResults');
    // const homeSearch = document.getElementsByClassName('home-search');

    // Clear previous results
    document.getElementById('home-search').style.display = 'block';
    // homeSearch.style.display = 'block';
    searchResults.innerHTML = '';

    if (!searchInput) {
        searchResults.innerHTML = 'No accommodations found.';
    }
    else {
        // Fetch data from the server
        fetch(`http://localhost:3000/api/admin/accommodation?query=${encodeURIComponent(searchInput)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    searchResults.innerHTML = '<p>No accommodations found.</p>';
                    return;
                }
                // searchResults.innerHTML = '';

                // Iterate over the accommodation data and create cards
                data.forEach(accommodation => {
                    const pictures = Array.isArray(accommodation.pictures) ? accommodation.pictures : JSON.parse(accommodation.pictures || '[]'); // Parse JSON

                    const card = document.createElement('div');
                    card.classList.add('accommodation-card');
                    card.setAttribute('onclick', `onAccommodationCardClick(${accommodation.accommodation_id})`);

                    card.innerHTML = `
                    <img src="${pictures[0] || 'images/default_pg.jpg'}" alt="${accommodation.accommodation_name}" onerror="this.onerror=null; this.src='images/default_pg.jpg';">
                    <h3>${accommodation.accommodation_name}</h3>
                    <p><b>Address: </b>${accommodation.address}</p>
                    <p><b>Price: </b> ₹${accommodation.price} per room </p><br>
                    <p><u>Click for more details</u></p>
                `;

                    searchResults.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error fetching accommodations:', error);
                searchResults.innerHTML = '<p>Error fetching accommodations. Please try again later.</p>';
            });

    }
}
function closeHomeSearch(){
    document.getElementById('home-search').style.display = 'none';
    document.getElementById('accommodationSearchInput').value = '';

}

// -----------------------------------------accommodation filter section----------------------------------------------------

// function toggleCheckbox(element) {
//     // Toggle the 'selected' class
//     element.classList.toggle("selected");

//     // Get the selected value and the hidden input
//     const value = element.getAttribute("data-value");
//     const amenitiesInput = document.getElementById("amenities");
//     let selectedAmenities = amenitiesInput.value ? amenitiesInput.value.split(",") : [];

//     // Add or remove the value from the selected list
//     if (selectedAmenities.includes(value)) {
//         selectedAmenities = selectedAmenities.filter(item => item !== value);
//     } else {
//         selectedAmenities.push(value);
//     }

//     // Update the hidden input's value
//     amenitiesInput.value = selectedAmenities.join(",");
// }

// -----------------------------------------close button----------------------------------------------------


// Add event listeners to all elements with the "close" class
document.addEventListener('DOMContentLoaded', () => {
    const closeButtons = document.querySelectorAll('.close');

    closeButtons.forEach(button => {
        button.onclick = function () {
            const modal = button.closest('.modal'); // Find the closest modal ancestor
            if (modal) {
                modal.style.display = 'none';
            } else {
                console.error('No modal found for this close button.');
            }
        };
    });
});
// -----------------------------------------close on window click----------------------------------------------------

// Function to close the modal when clicking outside of it
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// ----------------------------------------------------------------------------------------------------

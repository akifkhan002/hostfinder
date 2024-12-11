// Fetch and display pending requests
async function fetchRequests() {
    const requestsContainer = document.getElementById("requestsContainer");
    requestsContainer.innerHTML = "<p>Loading...</p>"; // Show a loading message

    try {
        const response = await fetch('http://localhost:3000/api/admin/accommodation-requests');
        const requests = await response.json();

        if (requests.length === 0) {
            requestsContainer.innerHTML = "<p>No pending requests</p>";
            return;
        }

        requestsContainer.innerHTML = ''; // Clear the loading message

        requests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('request-item');
            requestDiv.innerHTML = `
                <h3>${request.accommodation_name}</h3>
                <p><strong>Price:</strong> ₹${request.price}</p>
                <p><strong>Location:</strong> ${request.location}</p>
                <p><strong>Address:</strong> ${request.address}</p>
                <p><strong>Contact:</strong> ${request.contact}</p>
                <p><strong>Description:</strong> ${request.description}</p>
                <div class="request-actions">
                    <button class="approve" onclick="approveRequest(${request.request_id})">Approve</button>
                    <button class="reject" onclick="rejectRequest(${request.request_id})">Reject</button>
                </div>
            `;

            requestsContainer.appendChild(requestDiv);
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        requestsContainer.innerHTML = "<p>Failed to load requests.</p>";
    }
}

// Approve a request
async function approveRequest(requestId) {
    if (!confirm("Are you sure you want to approve this request?")) return;

    try {
        const response = await fetch('http://localhost:3000/api/admin/approve-accommodation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId }),
        });

        const result = await response.json();
        if (result.success) {
            alert("Request approved successfully!");
            fetchRequests(); // Refresh the list
        } else {
            alert("Failed to approve request.");
        }
    } catch (error) {
        console.error("Error approving request:", error);
    }
}

// Reject a request
async function rejectRequest(requestId) {
    if (!confirm("Are you sure you want to reject this request?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admin/reject-accommodation/${requestId}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        if (result.success) {
            alert("Request rejected successfully!");
            fetchRequests(); // Refresh the list
        } else {
            alert("Failed to reject request.");
        }
    } catch (error) {
        console.error("Error rejecting request:", error);
    }
}

// Load requests on page load
window.onload = fetchRequests;


function openSearch() {
    const searchSection = document.getElementById('searchSection');
    searchSection.style.display = 'block'; // Show the search section
}
function closeSearch() {
    const searchSection = document.getElementById('searchSection');
    searchSection.style.display = 'none'; // Hide the search section
}

function searchAccommodation(event) {
    event.preventDefault(); // Prevent form submission

    const searchInput = document.getElementById('accommodationSearchInput').value;
    const searchResults = document.getElementById('accommodationSearchResults');

    // Clear previous results
    searchResults.innerHTML = '';

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

            // Display results
            data.forEach(accommodation => {
                const pictures = Array.isArray(accommodation.pictures)
                    ? accommodation.pictures
                    : JSON.parse(accommodation.pictures || '[]');

                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <img src="${pictures[0] || 'images/default.jpg'}" alt="${accommodation.accommodation_name}"><br>
                    <h3>${accommodation.accommodation_name}</h3>
                    <p><strong>Location:</strong> ${accommodation.location}</p>
                    <p><strong>Price :</strong> ₹${accommodation.price} per room</p>
                    <p><strong>Gender preference:</strong> ${accommodation.gender_preference}</p>
                    <p><strong>Food Type:</strong> ${accommodation.food_type}</p>
                    <p><strong>Total Rooms:</strong> ${accommodation.total_rooms}</p>
                    <p><strong>Room Sharing:</strong> ${accommodation.room_sharing}</p>
                    <p><strong>Bathroom:</strong> ${accommodation.bathroom}</p>
                    <button class="delete-button" onclick="deleteAccommodation(${accommodation.accommodation_id})">
                        Delete
                    </button>
                `;
                searchResults.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching accommodations:', error);
            searchResults.innerHTML = '<p>Error fetching accommodations. Please try again later.</p>';
        });
}

function searchUser(event) {
    event.preventDefault(); // Prevent form submission

    const searchInput = document.getElementById('userSearchInput').value;
    const searchResults = document.getElementById('userSearchResults');

    // Clear previous results
    searchResults.innerHTML = '';

    // Fetch data from the server
    fetch(`http://localhost:3000/api/admin/user?query=${encodeURIComponent(searchInput)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                searchResults.innerHTML = '<p>No users found.</p>';
                return;
            }

            // Display results
            data.forEach(user => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <img src="${user.pictures || 'images/default.jpg'}" alt="${user.name}"><br>
                    <h3>${user.name}</h3>
                    <p><strong>Age:</strong> ${user.age}</p>
                    <p><strong>Gender:</strong> ${user.gender}</p>
                    <p><strong>Profession:</strong> ${user.profession}</p>
                    <p><strong>Location:</strong> ${user.location}</p>
                    <p><strong>Contact:</strong> ${user.contact}</p>
                    <button class="delete-button" onclick="deleteRoommate(${user.user_id})">
                        Delete
                    </button>
                `;
                searchResults.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            searchResults.innerHTML = '<p>Error fetching users. Please try again later.</p>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const accommodationsContainer = document.getElementById('accommodations-container');
    const roommatesContainer = document.getElementById('roommates-container');

    // Fetch accommodations data
    fetch('http://localhost:3000/api/accommodation')
        .then(response => response.json())
        .then(data => {
            accommodationsContainer.innerHTML = '';
            data.forEach(accommodation => {
                const card = document.createElement('div');
                card.classList.add('card');

                const pictures = Array.isArray(accommodation.pictures)
                    ? accommodation.pictures
                    : JSON.parse(accommodation.pictures || '[]');
                

                card.innerHTML = `
                    <img src="${pictures[0] || 'images/default.jpg'}" alt="${accommodation.accommodation_name}"><br>
                    <h3>${accommodation.accommodation_name}</h3>
                    <p><strong>Location:</strong> ${accommodation.location}</p>
                    <p><strong>Price :</strong> ₹${accommodation.price} per room</p>
                    <p><strong>Gender preference:</strong> ${accommodation.gender_preference}</p>
                    <p><strong>Food Type:</strong> ${accommodation.food_type}</p>
                    <p><strong>Total Rooms:</strong> ${accommodation.total_rooms}</p>
                    <p><strong>Room Sharing:</strong> ${accommodation.room_sharing}</p>
                    <p><strong>Bathroom:</strong> ${accommodation.bathroom}</p>
                    <button class="delete-button" onclick="deleteAccommodation(${accommodation.accommodation_id})">
                        Delete
                    </button>
                `;

                accommodationsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching accommodations:', error));

    // Fetch roommate requests data
    fetch('http://localhost:3000/api/roommates')
        .then(response => response.json())
        .then(data => {
            roommatesContainer.innerHTML = '';
            data.forEach(request => {
                const card = document.createElement('div');
                card.classList.add('card');

                card.innerHTML = `
                    <img src="${request.pictures || 'images/default.jpg'}" alt="${request.name}"><br>
                    <h3>${request.name}</h3>
                    <p><strong>Age:</strong> ${request.age}</p>
                    <p><strong>Gender:</strong> ${request.gender}</p>
                    <p><strong>Profession:</strong> ${request.profession}</p>
                    <p><strong>Location:</strong> ${request.location}</p>
                    <p><strong>Contact:</strong> ${request.contact}</p>
                    <button class="delete-button" onclick="deleteRoommate(${request.request_id})">
                        Delete
                    </button>
                `;

                roommatesContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching roommate requests:', error));
});

// Delete accommodation
function deleteAccommodation(id) {
    if (confirm('Are you sure you want to delete this accommodation?')) {
        fetch(`http://localhost:3000/api/accommodation/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete accommodation');
                }
                alert('Accommodation deleted successfully!');
                location.reload(); // Refresh the page
            })
            .catch(error => {
                console.error('Error deleting accommodation:', error);
                alert('Failed to delete accommodation');
            });
    }
}

// Delete roommate request
function deleteRoommate(id) {
    if (confirm('Are you sure you want to delete this roommate request?')) {
        fetch(`http://localhost:3000/api/roommate/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete roommate request');
                }
                alert('Roommate request deleted successfully!');
                location.reload(); // Refresh the page
            })
            .catch(error => {
                console.error('Error deleting roommate request:', error);
                alert('Failed to delete roommate request');
            });
    }
}

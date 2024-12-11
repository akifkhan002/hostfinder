
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

function openLoginModal() {
    loginModal.style.display = "block";
    registerModal.style.display = "none";
}
function openRegisterModal() {
    loginModal.style.display = "none";
    registerModal.style.display = "block";
}

document.addEventListener('DOMContentLoaded', () => {
    const roommatesContainer = document.querySelector('.roommates');

    // Fetch roommate data from the server
    fetch('http://localhost:3000/api/roommates')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear existing cards
            roommatesContainer.innerHTML = '';

            // Iterate over the roommate request data and create cards
            data.forEach(request => {
                const picture = request.pictures || 'images/default_roommate.jpg'; // Use default if no picture provided

                const card = document.createElement('div');
                card.classList.add('roommate-card');
                card.setAttribute('onclick', `onRoommateCardClick(${request.request_id})`);

                card.innerHTML = `
                    <img src="${picture}" alt="${request.name}" onerror="this.onerror=null; this.src='images/default_roommate.jpg';">
                    <h3>${request.name}</h3>
                    <p><b>Profession:</b> ${request.profession}</p>
                    <p><b>Location:</b> ${request.location}</p>
                    <br>
                    <p><u>Click for more details</u></p>
                `;

                roommatesContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching roommates:', error);
        });
});

function onRoommateCardClick(requestId) {
    fetch(`http://localhost:3000/api/roommate/${requestId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            openRoommateModal(data);
        })
        .catch(error => {
            console.error('Error fetching roommate request:', error);
            alert('Failed to fetch roommate details. Please try again.');
        });
}

function openRoommateModal(data) {
    // Set the main image
    const roommateImage = document.getElementById('roommateImage');
    roommateImage.src = data.pictures || 'images/default_roommate.jpg';
    roommateImage.onerror = () => {
        roommateImage.src = 'images/default_roommate.jpg';
    };

    // Populate roommate details
    document.getElementById('roommateName').textContent = data.name || 'No Name Available';
    document.getElementById('roommateAge').textContent = data.age || 'N/A';
    document.getElementById('roommateGender').textContent = data.gender || 'N/A';
    document.getElementById('roommateProfession').textContent = data.profession || 'N/A';
    document.getElementById('roommateRoomSharing').textContent = data.room_sharing || 'N/A';
    document.getElementById('roommateLocation').textContent = data.location || 'Unknown';
    document.getElementById('roommateDescription').textContent = data.description || 'No Description Available';
    document.getElementById('roommateRequirements').textContent = data.requirements || 'No Requirements Provided';
    document.getElementById('roommateEmail').textContent = data.email || 'No Contact Provided';
    document.getElementById('roommateContact').textContent = data.contact || 'No Contact Provided';

    // Show the modal
    document.getElementById('roommateModal').style.display = 'block';
}

function closeRoommateModal() {
    document.getElementById('roommateModal').style.display = 'none';
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const requestDetails = document.getElementById('requestDetails');

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Send login data to the server
    fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert("Login successful!");
                // Redirect to user.html with user_id as a query parameter
                // window.location.href = `roommate.html?user_id=${data.user_id}`;
                requestDetails.style.display = 'block';
                localStorage.setItem('user_id', data.user_id);
                // displayRoommateRequests(); // Store user_id in localStorage
                window.location.reload();
            } else {
                alert(data.message || "Invalid email or password.");
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert("An error occurred. Please try again.");
        });
}

function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate inputs
    if (!email || !password || !confirmPassword) {
        alert("Please fill in all the fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Send registration data to the server
    fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Registration successful!");
                openLoginModal();
            } else {
                alert(data.message || "Registration failed.");
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
}
// Function to fetch and display roommate requests
// async function displayRoommateRequests() {
//     const userId = localStorage.getItem("user_id"); // Retrieve the logged-in user's ID

//     if (!userId) {
//         alert("Please log in to view your roommate requests.");
//         return;
//     }

//     try {
//         const response = await fetch(`http://localhost:3000/api/roommate-requests?user_id=${userId}`);
//         const result = await response.json();

//         if (result.success) {
//             const requestsContainer = document.getElementById("requestsContainer");
//             requestsContainer.innerHTML = ''; // Clear existing requests

//             result.data.forEach(request => {
//                 const requestCard = document.createElement("div");
//                 requestCard.classList.add("roommate-card");

//                 // Build the HTML for a single request
//                 requestCard.innerHTML = `
//                     <img src="${request.pictures || 'images/default_roommate.jpg'}" alt="${request.name}" />
//                     <div>
//                         <h3>${request.name}</h3>
//                         <p><strong>Age:</strong> ${request.age}</p>
//                         <p><strong>Gender:</strong> ${request.gender}</p>
//                         <p><strong>Profession:</strong> ${request.profession}</p>
//                         <p><strong>Room Sharing:</strong> ${request.room_sharing.split(",").join(", ")}</p>
//                         <p><strong>Location:</strong> ${request.location}</p>
//                         <p><strong>Description:</strong> ${request.description || "No description available"}</p>
//                         <p><strong>Requirements:</strong> ${request.requirements || "No specific requirements"}</p>
//                         <p><strong>Contact:</strong> ${request.contact}</p>
//                         <p><strong>Email:</strong> ${request.email}</p>
//                     </div>
//                 `;

//                 requestsContainer.appendChild(requestCard);
//             });
//         } else {
//             alert("Failed to load roommate requests.");
//         }
//     } catch (error) {
//         console.error("Error fetching roommate requests:", error);
//         alert("An error occurred while loading roommate requests.");
//     }
// }

// // Call the function after the user logs in
// // window.onload = displayRoommateRequests;

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('user_id');
    const requestSection = document.getElementById('roommateRequest');
    const requestDetails = document.getElementById('requestDetails');
    const editForm = document.getElementById('editRequestForm');
    const logoutButton = document.getElementById('logoutButton');

    // If no user is logged in, hide the user-specific sections
    if (!userId) {
        requestSection.style.display = 'none';
        logoutButton.style.display = 'none';
        return;
    }

    // Show the logout button if the user is logged in
    // logoutButton.style.display = 'block';

    // Fetch roommate request details for the logged-in user
    fetch(`http://localhost:3000/api/roommate_requests/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Populate the request details
                document.getElementById('requestName').textContent = data.name;
                document.getElementById('requestAge').textContent = data.age;
                document.getElementById('requestGender').textContent = data.gender;
                document.getElementById('requestProfession').textContent = data.profession;
                document.getElementById('requestRoomSharing').textContent = data.room_sharing;
                document.getElementById('requestLocation').textContent = data.location;
                document.getElementById('requestDescription').textContent = data.description;
                document.getElementById('requestRequirements').textContent = data.requirements;
                document.getElementById('requestContact').textContent = data.contact;
                document.getElementById('requestEmail').textContent = data.email;
                document.getElementById('requestPictures').textContent = data.pictures;

                requestDetails.style.display = 'block';
            } else {
                // No request found, show edit form for adding
                editForm.style.display = 'block';
            }

            requestSection.style.display = 'block';
        })
        .catch(error => console.error('Error fetching roommate request:', error));
});

function showEditForm() {
    document.getElementById('requestDetails').style.display = 'none';
    document.getElementById('editRequestForm').style.display = 'block';
}
function closeEditForm() {
    preventDefault();
    document.getElementById('requestDetails').style.display = 'block';
    document.getElementById('editRequestForm').style.display = 'none';
}

function logout() {
    localStorage.removeItem('user_id');
    alert('Logged out successfully!');
    window.location.reload();
}

// Logout Functionality
function logout() {
    localStorage.removeItem('user_id'); // Remove user ID from local storage
    alert('You have been logged out successfully.');
    location.reload(); // Reload the page to reset the state
}

// Enable editing of roommate request
function editRoommateRequest() {
    const requestDetails = document.getElementById('requestDetails');
    const editForm = document.getElementById('editRequestForm');

    requestDetails.style.display = 'none';
    editForm.style.display = 'block';

    // Populate the form with existing data
    document.getElementById('editName').value = document.getElementById('requestName').textContent;
    document.getElementById('editAge').value = document.getElementById('requestAge').textContent;
    document.getElementById('editGender').value = document.getElementById('requestGender').textContent;
    document.getElementById('editProfession').value = document.getElementById('requestProfession').textContent;
    document.getElementById('editRoomSharing').value = document.getElementById('requestRoomSharing').textContent;
    document.getElementById('editLocation').value = document.getElementById('requestLocation').textContent;
    document.getElementById('editDescription').value = document.getElementById('requestDescription').textContent;
    document.getElementById('editRequirements').value = document.getElementById('requestRequirements').textContent;
    document.getElementById('editContact').value = document.getElementById('requestContact').textContent;
    document.getElementById('editEmail').value = document.getElementById('requestEmail').textContent;
    document.getElementById('editPictures').value = document.getElementById('requestPictures').textContent;
}

function closeRoommateRequest() {
    event.preventDefault()
    const requestDetails = document.getElementById('requestDetails');
    const editForm = document.getElementById('editRequestForm');

    editForm.style.display = 'none';
    requestDetails.style.display = 'block';
}

// Save roommate request to the database
function saveRoommateRequest(event) {
    event.preventDefault();

    const userId = localStorage.getItem('user_id');
    const requestData = {
        name: document.getElementById('editName').value,
        age: document.getElementById('editAge').value,
        gender: document.getElementById('editGender').value,
        profession: document.getElementById('editProfession').value,
        room_sharing: Array.from(document.getElementById('editRoomSharing').selectedOptions).map(opt => opt.value).join(','),
        location: document.getElementById('editLocation').value,
        description: document.getElementById('editDescription').value,
        requirements: document.getElementById('editRequirements').value,
        contact: document.getElementById('editContact').value,
        email: document.getElementById('editEmail').value,
        pictures: document.getElementById('editPictures').value,
    };

    fetch(`http://localhost:3000/api/roommate_requests/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Roommate request saved successfully!');
                location.reload(); // Refresh the page
            } else {
                alert(data.message || 'Failed to save the request.');
            }
        })
        .catch(error => console.error('Error saving roommate request:', error));
}


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

// Function to close the modal when clicking outside of it
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};


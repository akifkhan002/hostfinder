// Get the owner_id from local storage
const ownerId = localStorage.getItem("owner_id");

// Modal References
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

// Show the login modal
function openLoginModal() {
    loginModal.style.display = "block";
    registerModal.style.display = "none";
}

// Show the register modal
function openRegisterModal() {
    loginModal.style.display = "none";
    registerModal.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    if (ownerId) {
        console.log(ownerId);
        displayAccommodations();
    } else {
        document.getElementById("noAccommodationSection").style.display = "block";
        document.getElementById("ownerAccommodationSection").style.display = "none";
        openLoginModal();
    }
});

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Send login data to the server
    fetch('http://localhost:3000/api/owner/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (!response.ok) {
            // Check if the status indicates an unauthorized user
            if (response.status === 401) {
                return response.json().then(data => {
                    throw new Error(data.message || "Invalid username or password.");
                });
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Login successful!");
            localStorage.setItem('owner_id', data.owner_id); // Store owner_id in localStorage
            // document.getElementById("login").style.display = "none";
            // document.getElementById("logout").style.display = "block";
            window.location.reload(); // Reload the page after successful login
        } else {
            alert(data.message || "Invalid email or password.");
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert(error.message); // Show error message to the user
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
    fetch('http://localhost:3000/api/owner/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
        }),
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

// Logout Functionality
function logout() {
    localStorage.removeItem("owner_id");
    alert("Logged out successfully!");
window.location.href = "index.html";
}

// Add new accommodation
function addAccommodation() {
    const ownerId = localStorage.getItem("owner_id");
    if (!ownerId) {
        openLoginModal()
    } else {
        document.getElementById("noAccommodationSection").style.display = "none";
        document.getElementById("accommodationForm").style.display = "block";
    }
}

// Save Accommodation (Add or Update)
function saveAccommodation(event) {
    event.preventDefault();

    const ownerId = localStorage.getItem("owner_id");
    const roomSharing = Array.from(document.querySelectorAll("input[type='checkbox'][id^='roomSharing']:checked"))
        .map(checkbox => checkbox.value)
        .join(",");
    const bathrooms = Array.from(document.querySelectorAll("input[type='checkbox'][id^='bathroom']:checked"))
        .map(checkbox => checkbox.value)
        .join(",");

    const data = {
        accommodation_id: ownerId,
        owner_id: ownerId,
        accommodation_name: document.getElementById("accommodationNameInput").value,
        price: document.getElementById("priceInput").value,
        location: document.getElementById("locationInput").value,
        address: document.getElementById("addressInput").value,
        landmark: document.getElementById("landmarkInput")?.value || "", // Optional landmark
        description: document.getElementById("descriptionInput").value,
        total_rooms: document.getElementById("totalRoomsInput").value,
        gender_preference: document.getElementById("genderPreferenceInput").value,
        food_type: document.getElementById("foodTypeInput").value,
        room_sharing: roomSharing,
        bathroom: bathrooms,
        restrictions: document.getElementById("restrictionsInput").value,
        facilities: document.getElementById("facilitiesInput").value.split(","),
        pictures: document.getElementById("picturesInput").value.split(","),
        contact: document.getElementById("contactInput").value,
    };

    fetch(`http://localhost:3000/api/accommodation/${ownerId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    throw new Error(`Server Error: ${response.status}\n${errorMessage}`);
                });
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                alert("Accommodation saved successfully!");
                location.reload();
            } else {
                alert(result.message || "Failed to save accommodation.");
            }
        })
        .catch(error => {
            console.error("Error saving accommodation:", error);
            alert("An error occurred. Please try again.");
        });  
}

async function addAccommodationRequest(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Collect input values from the form
    const data = {
        owner_id: localStorage.getItem("owner_id"), // Assuming owner_id is stored in local storage after login
        accommodation_name: document.getElementById("accommodationNameInput").value,
        price: document.getElementById("priceInput").value,
        location: document.getElementById("locationInput").value,
        address: document.getElementById("addressInput").value,
        landmark: document.getElementById("landmarkInput").value,
        description: document.getElementById("descriptionInput").value,
        total_rooms: document.getElementById("totalRoomsInput").value,
        gender_preference: document.getElementById("genderPreferenceInput").value,
        food_type: document.getElementById("foodTypeInput").value,
        room_sharing: Array.from(document.querySelectorAll("input[name='roomSharing']:checked"))
            .map(checkbox => checkbox.value)
            .join(","),
        bathroom: Array.from(document.querySelectorAll("input[name='bathroom']:checked"))
            .map(checkbox => checkbox.value)
            .join(","),
        restrictions: document.getElementById("restrictionsInput").value,
        facilities: document.getElementById("facilitiesInput").value.split(","),
        pictures: document.getElementById("picturesInput").value.split(","),
        contact: document.getElementById("contactInput").value,
    };

    try {
        const response = await fetch("http://localhost:3000/api/accommodation-requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            alert("Accommodation request submitted successfully!");
            document.getElementById("accommodationForm").reset(); // Reset the form fields
        } else {
            alert(result.message || "Failed to submit accommodation request.");
        }
    } catch (error) {
        console.error("Error submitting accommodation request:", error);
        alert("An error occurred. Please try again.");
    }
}


// Populate the Accommodation Form for Editing
function editAccommodation() {
    const accommodationForm = document.getElementById("accommodationForm");
    const accommodationSection = document.getElementById("ownerAccommodationSection");
    const noAccommodationSection = document.getElementById("noAccommodationSection");

    accommodationSection.style.display = "none";
    accommodationForm.style.display = "block";

    fetch(`http://localhost:3000/api/accommodation/${ownerId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById("accommodationNameInput").value = data.accommodation_name || "";
                document.getElementById("priceInput").value = data.price || "";
                document.getElementById("locationInput").value = data.location || "";
                document.getElementById("addressInput").value = data.address || "";
                document.getElementById("landmarkInput").value = data.landmark || ""; // Populate landmark
                document.getElementById("descriptionInput").value = data.description || "";
                document.getElementById("totalRoomsInput").value = data.total_rooms || "";
                document.getElementById("genderPreferenceInput").value = data.gender_preference || "both";
                document.getElementById("foodTypeInput").value = data.food_type || "both";

                // Check the room sharing checkboxes
                const roomSharing = data.room_sharing ? data.room_sharing.split(",") : [];
                document.getElementById("roomSharingSingle").checked = roomSharing.includes("single");
                document.getElementById("roomSharingDouble").checked = roomSharing.includes("double");
                document.getElementById("roomSharingTriple").checked = roomSharing.includes("triple");

                // Check the bathrooms checkboxes
                const bathrooms = data.bathroom ? data.bathroom.split(",") : [];
                document.getElementById("bathroomAttach").checked = bathrooms.includes("attach");
                document.getElementById("bathroomCommon").checked = bathrooms.includes("common");

                document.getElementById("restrictionsInput").value = data.restrictions || "";
                document.getElementById("facilitiesInput").value = (Array.isArray(data.facilities) ? data.facilities : JSON.parse(data.facilities || "[]")).join(",");
                document.getElementById("picturesInput").value = (Array.isArray(data.pictures) ? data.pictures : JSON.parse(data.pictures || "[]")).join(",");
                document.getElementById("contactInput").value = data.contact || "";
            } else {
                noAccommodationSection.style.display = "block";
            }
        })
        .catch(error => console.error("Error fetching accommodation data:", error));

}

// Cancel Edit (Hide Form and Show List)
function cancelEdit() {
    location.reload(); // Reload the page to reset
}
function cancelEdit() {
    event.preventDefault()
    const accommodationForm = document.getElementById("accommodationForm");
    const accommodationSection = document.getElementById("ownerAccommodationSection");
    
    accommodationForm.style.display = "none";
    accommodationSection.style.display = "block";
}


function displayAccommodations() {
    const ownerId = localStorage.getItem("owner_id"); // Get owner ID from localStorage
    const accommodationSection = document.getElementById("ownerAccommodationSection");
    const noAccommodationSection = document.getElementById("noAccommodationSection");

    // Hide accommodation section and noAccommodation section initially
    accommodationSection.style.display = "none";
    noAccommodationSection.style.display = "none";

    if (!ownerId) {
        console.error("Owner ID not found in localStorage.");
        return;
    }

    // Fetch accommodation data for the owner
    fetch(`http://localhost:3000/api/accommodation/${ownerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // if (data && data.length > 0) {
            if (data) {
                // console.log(data);
                // If accommodation data is found, display it
                populateAccommodationDetails(data);
                accommodationSection.style.display = "block";
            } else {
                // If no accommodation data is found, display noAccommodationSection
                noAccommodationSection.style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error fetching accommodation data:", error);
            // Handle error appropriately, e.g., display an error message
            noAccommodationSection.style.display = "block";
        });
}


// Populate Accommodation Details Section
function populateAccommodationDetails(data) {
    // console.log(data.accommodation_name);
    if (!data.accommodation_name) {
        console.error("Accommodation data is null or undefined.");
        document.getElementById("noAccommodationSection").style.display = "block";
        document.getElementById("ownerAccommodationSection").style.display = "none";
        document.getElementById("accommodationForm").style.display = "none";
        return;
    }
    try {
        document.getElementById("accommodationName").textContent = data.accommodation_name || "N/A";
        // document.getElementById("pictures").textContent = data.pictures[0] || "N/A";
        document.getElementById("price").textContent = data.price || "N/A";
        document.getElementById("location").textContent = data.location || "N/A";
        document.getElementById("address").textContent = data.address || "N/A";
        document.getElementById("landmark").textContent = data.landmark || "N/A"; // Landmark
        document.getElementById("description").textContent = data.description || "N/A";
        document.getElementById("totalRooms").textContent = data.total_rooms || "N/A";
        document.getElementById("genderPreference").textContent = data.gender_preference || "N/A";
        document.getElementById("foodType").textContent = data.food_type || "N/A";
        document.getElementById("roomSharing").textContent = (data.room_sharing || "").split(",").join(", ");
        document.getElementById("bathroom").textContent = (data.bathroom || "").split(",").join(", ");
        document.getElementById("restrictions").textContent = data.restrictions || "N/A";
        document.getElementById("contact").textContent = data.contact || "N/A";

        const facilitiesList = document.getElementById("facilitiesList");
        facilitiesList.innerHTML = ""; // Clear previous facilities
        const facilities = Array.isArray(data.facilities) ? data.facilities : JSON.parse(data.facilities || "[]");
        facilities.forEach(facility => {
            const listItem = document.createElement("li");
            listItem.textContent = facility.charAt(0).toUpperCase() + facility.slice(1);
            facilitiesList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error processing accommodation details:", error);
    }
}


// ----------------------------------------------------------------------

function openHomePage() {
    logout();
    window.location.href = "index.html";
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

    
    // Initialize the Page
    // document.addEventListener("DOMContentLoaded", () => {
    //     displayAccommodations();
    // });
    
    
    // // Display accommodations for the logged-in owner
    // function displayAccommodations() {
    //     const accommodationSection = document.getElementById("ownerAccommodationSection");
    //     const accommodationForm = document.getElementById("accommodationForm");
    //     const noAccommodationSection = document.getElementById("noAccommodationSection");
    
    //     if (!ownerId) {
    //         alert("Please log in to access the owner portal.");
    //         localStorage.removeItem("owner_id");
    //         openLoginModal();
    //         return;
    //     }
    
    //     fetch(`http://localhost:3000/api/accommodation/${ownerId}`)
    //         .then((response) => response.json())
    //         .then((data) => {
    //             if (data) {
    //                 populateAccommodationDetails(data);
    //                 accommodationSection.style.display = "block";
    //             } else {
    //                 noAccommodationSection.style.display = "block";
    //             }
    //         })
    //         .catch((error) => console.error("Error fetching accommodation data:", error));
    // }
    
    // // Populate accommodation details into the display section
    // function populateAccommodationDetails(data) {
    // if (!data.accommodation_name) {
    //     console.error("Accommodation data is null or undefined.");
    //     document.getElementById("noAccommodationSection").style.display = "block";
    //     document.getElementById("ownerAccommodationSection").style.display = "none";
    //     document.getElementById("accommodationForm").style.display = "none";
    //     return;
    // }
    
    //     try {
    //         document.getElementById("accommodationName").textContent = data.accommodation_name || "N/A";
    //         document.getElementById("price").textContent = data.price || "N/A";
    //         document.getElementById("address").textContent = data.address || "N/A";
    //         document.getElementById("description").textContent = data.description || "N/A";
    //         document.getElementById("totalRooms").textContent = data.total_rooms || "N/A";
    //         document.getElementById("genderPreference").textContent = data.gender_preference || "N/A";
    //         document.getElementById("foodType").textContent = data.food_type || "N/A";
    //         document.getElementById("roomSharing").textContent = (data.room_sharing || "").split(",").join(", ") || "N/A";
    //         document.getElementById("bathrooms").textContent = (data.bathroom || "").split(",").join(", ") || "N/A";
    //         document.getElementById("restrictions").textContent = data.restrictions || "N/A";
    //         document.getElementById("contact").textContent = data.contact || "N/A";
    
    //         const facilitiesList = document.getElementById("facilitiesList");
    //         facilitiesList.innerHTML = "";
    //         const facilities = Array.isArray(data.facilities) ? data.facilities : JSON.parse(data.facilities || "[]");
    //         facilities.forEach((facility) => {
    //             const listItem = document.createElement("li");
    //             listItem.textContent = facility;
    //             facilitiesList.appendChild(listItem);
    //         });
    // } catch (error) {
    //     console.error("Error processing accommodation details:", error);
    // }
    // }
    
    // // Edit accommodation details
    // function editAccommodation() {
    //     const accommodationForm = document.getElementById("accommodationForm");
    //     const accommodationSection = document.getElementById("ownerAccommodationSection");
    
    //     accommodationSection.style.display = "none";
    //     accommodationForm.style.display = "block";
    
    //     // Prepopulate form
    //     document.getElementById("accommodationNameInput").value = document.getElementById("accommodationName").textContent;
    //     document.getElementById("priceInput").value = document.getElementById("price").textContent;
    //     document.getElementById("addressInput").value = document.getElementById("address").textContent;
    //     document.getElementById("descriptionInput").value = document.getElementById("description").textContent;
    //     document.getElementById("totalRoomsInput").value = document.getElementById("totalRooms").textContent;
    //     document.getElementById("genderPreferenceInput").value = document.getElementById("genderPreference").textContent;
    //     document.getElementById("foodTypeInput").value = document.getElementById("foodType").textContent;
    //     document.getElementById("contactInput").value = document.getElementById("contact").textContent;
    
    //     // Check checkboxes for room sharing
    //     const roomSharing = document.getElementById("roomSharing").textContent.split(", ");
    //     document.getElementById("roomSharingSingle").checked = roomSharing.includes("single");
    //     document.getElementById("roomSharingDouble").checked = roomSharing.includes("double");
    //     document.getElementById("roomSharingTriple").checked = roomSharing.includes("triple");
    
    //     // Check checkboxes for bathrooms
    //     const bathrooms = document.getElementById("bathrooms").textContent.split(", ");
    //     document.getElementById("bathroomAttach").checked = bathrooms.includes("attach");
    //     document.getElementById("bathroomCommon").checked = bathrooms.includes("common");
    
    //     document.getElementById("restrictionsInput").value = document.getElementById("restrictions").textContent;
    
    //     // Handle facilities
    //     const facilitiesList = document.getElementById("facilitiesList");
    //     const facilities = Array.isArray(facilitiesList.dataset.facilities)
    //         ? facilitiesList.dataset.facilities
    //         : JSON.parse(facilitiesList.dataset.facilities || "[]");
    
    //     document.getElementById("facilitiesInput").value = facilities.join(", ");
    
    //     // Handle pictures
    //     const picturesList = document.getElementById("picturesList");
    //     const pictures = Array.isArray(picturesList.dataset.pictures)
    //         ? picturesList.dataset.pictures
    //         : JSON.parse(picturesList.dataset.pictures || "[]");
    
    //     document.getElementById("picturesInput").value = pictures.join(", ");
    
    
    // }
    
    
    // // Save or update accommodation details
    // function saveAccommodation(event) {
    //     event.preventDefault();
    
    //     const roomSharing = Array.from(document.querySelectorAll("#accommodationForm input[name='roomSharing']:checked"))
    //         .map((checkbox) => checkbox.value)
    //         .join(",");
    //     const bathrooms = Array.from(document.querySelectorAll("#accommodationForm input[name='bathroom']:checked"))
    //         .map((checkbox) => checkbox.value)
    //         .join(",");
    
    //     const data = {
    //         accommodation_name: document.getElementById("accommodationNameInput").value,
    //         price: document.getElementById("priceInput").value,
    //         address: document.getElementById("addressInput").value,
    //         description: document.getElementById("descriptionInput").value,
    //         total_rooms: document.getElementById("totalRoomsInput").value,
    //         gender_preference: document.getElementById("genderPreferenceInput").value,
    //         food_type: document.getElementById("foodTypeInput").value,
    //         room_sharing: roomSharing,
    //         bathroom: bathrooms,
    //         restrictions: document.getElementById("restrictionsInput").value,
    //         facilities: document.getElementById("facilitiesInput").value.split(","),
    //         pictures: document.getElementById("picturesInput").value.split(","),
    //         contact: document.getElementById("contactInput").value,
    
    //     };
    
    //     fetch(`http://localhost:3000/api/accommodation/${ownerId}`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(data),
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             if (data.success) {
    //                 alert("Accommodation saved successfully!");
    //                 location.reload();
    //             } else {
    //                 alert("Failed to save accommodation.");
    //             }
    //         })
    //         .catch((error) => console.error("Error saving accommodation:", error));
    // }
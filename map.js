let map;
let markers = []; // Array to keep track of markers

// Initialize the map
async function initMap() {
    const { Map, Marker, InfoWindow } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 12.295810, lng: 76.639381 }, // Default center
        zoom: 15,
    });
}

// Function to fill the dropdown with locations from the database
async function loadLocations() {
    try {
        const response = await fetch('http://localhost:3000/api/locations');
        const locations = await response.json();

        const locationDropdown = document.getElementById("locationDropdown");

        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location.location; // Use location name as the value
            option.textContent = location.location;
            locationDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading locations:", error);
    }
}

// Function to display accommodations in the selected location
async function filterAccommodations(event) {
    event.preventDefault(); // Prevent the form from submitting

    const location = document.getElementById("locationDropdown").value;
    if (location === ""){
        document.getElementById("accommodationList").innerHTML = "";
        return;
    }

    try {
        // Fetch accommodation data along with latitude and longitude
        const response = await fetch(`http://localhost:3000/api/accommodation-location?location=${location}`);
        const accommodations = await response.json();

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // Clear existing accommodation list
        const accommodationList = document.getElementById("accommodationList");
        accommodationList.innerHTML = '';

        accommodations.forEach(accommodation => {
            const { latitude, longitude, accommodation_name, pictures, address, location, accommodation_id, total_rooms, price, contact } = accommodation;

            // Validate latitude and longitude before creating a marker
            if (isNaN(latitude) || isNaN(longitude)) {
                console.error(`Invalid coordinates for accommodation: ${accommodation_name}`);
                return;
            }

            // Create a clickable div for each accommodation
            const accommodationDiv = document.createElement("div");
            accommodationDiv.classList.add("accommodation-item");
            accommodationDiv.onclick = function () {
                pinLocation(
                    accommodation_id,
                    parseFloat(latitude),
                    parseFloat(longitude),
                    accommodation_name,
                    pictures[0] || 'default_image.jpg', // Provide a default image if none exists
                    total_rooms,
                    price,
                    contact
                );
            };
            accommodationDiv.innerHTML = `
                <h3>${accommodation_name}</h3>${address}
            `;
            accommodationList.appendChild(accommodationDiv); 

        });
    } catch (error) {
        console.error("Error filtering accommodations:", error);
    }
}

// Function to pin the accommodation's location on the map
function pinLocation(accommodation_id, latitude, longitude, accommodation_name, pictures, total_rooms, price, contact) {
    const { Marker, InfoWindow } = google.maps;

    // Create a new marker
    const marker = new Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: accommodation_name,
    });

    console.log(pictures);
    // Add an info window
    const infoWindow = new InfoWindow({
        content: `
            <div>
                <h3 style="margin: 0; font-size: 16px;">${accommodation_name}</h3><hr><br>
                <img src="${pictures}" style='width:100%; height:100px; object-fit:cover; cursor: pointer;' onclick="onAccommodationCardClick(${accommodation_id})" alt="${accommodation_name}">
                <p style="margin: 5px 0; font-size: 14px; color: #888;">Rooms: ${total_rooms}</p>
                <p style="margin: 5px 0; font-size: 16px; color: #28a745; font-weight: bold;">₹ ${price} <small>*per room</small></p>
                <p style="margin: 5px 0; font-size: 14px; font-weight: medium;">Contact: <u>${contact}</u></p>
            </div>
        `,
    });

    infoWindow.open(map, marker);

    // Open info window when marker is clicked
    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });

    // Clear existing markers and add the new one
    markers.forEach(marker => marker.setMap(null));
    markers = [marker];

    // Center the map to the clicked location
    map.setCenter({ lat: latitude, lng: longitude });
    map.setZoom(13);
}

// Initialize the map and load locations when the page loads
window.onload = () => {
    initMap();
    loadLocations();
};

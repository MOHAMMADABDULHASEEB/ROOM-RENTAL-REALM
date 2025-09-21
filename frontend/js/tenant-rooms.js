document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://your-backend-api.com";

    // Fetch room listings
    fetch(`${API_URL}/rooms`)
        .then((response) => response.json())
        .then((rooms) => {
            const roomList = document.getElementById("roomList");
            if (rooms.length === 0) {
                roomList.innerHTML = "<p>No rooms available.</p>";
            } else {
                roomList.innerHTML = rooms
                    .map(
                        (room) => `
                        <div class="col-md-4 mb-4">
                            <div class="card room-card">
                                <img src="${room.image}" class="card-img-top" alt="${room.name}">
                                <div class="card-body">
                                    <h5 class="card-title">${room.name}</h5>
                                    <p class="card-text">Location: ${room.location}</p>
                                    <p class="card-text">Price: $${room.price}/month</p>
                                    <button class="btn btn-primary w-100" onclick="viewRoom(${room.id})">View Details</button>
                                </div>
                            </div>
                        </div>
                    `
                    )
                    .join("");
            }
        })
        .catch((error) => {
            console.error("Error fetching rooms:", error);
        });

    // Room search functionality
    document.getElementById("searchButton").addEventListener("click", () => {
        const query = document.getElementById("searchBar").value;
        fetch(`${API_URL}/rooms?search=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((filteredRooms) => {
                const roomList = document.getElementById("roomList");
                roomList.innerHTML = filteredRooms
                    .map(
                        (room) => `
                        <div class="col-md-4 mb-4">
                            <div class="card room-card">
                                <img src="${room.image}" class="card-img-top" alt="${room.name}">
                                <div class="card-body">
                                    <h5 class="card-title">${room.name}</h5>
                                    <p class="card-text">Location: ${room.location}</p>
                                    <p class="card-text">Price: $${room.price}/month</p>
                                    <button class="btn btn-primary w-100" onclick="viewRoom(${room.id})">View Details</button>
                                </div>
                            </div>
                        </div>
                    `
                    )
                    .join("");
            })
            .catch((error) => console.error("Error fetching filtered rooms:", error));
    });
});

// Navigate to room details
function viewRoom(roomId) {
    window.location.href = `room-details.html?roomId=${roomId}`;
}

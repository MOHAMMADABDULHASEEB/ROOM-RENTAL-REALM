document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch user details
    function fetchUserDetails() {
        fetch(`http://localhost:3000/api/user/${userData.userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }
                return response.json();
            })
            .then(user => {
                // Populate user profile info
                const userProfileInfo = document.getElementById('userProfileInfo');
                userProfileInfo.innerHTML = `
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                `;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to load user details');
            });
    }

    // Fetch booked rooms
    function fetchBookedRooms() {
        fetch(`http://localhost:3000/api/tenant-rooms/${userData.userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch booked rooms');
                }
                return response.json();
            })
            .then(rooms => {
                const bookedRoomsContainer = document.getElementById('bookedRooms');
                const noRoomsMessage = document.getElementById('noRoomsMessage');

                if (rooms.length === 0) {
                    noRoomsMessage.style.display = 'block';
                    return;
                }

                noRoomsMessage.style.display = 'none';
                bookedRoomsContainer.innerHTML = ''; // Clear previous results

                rooms.forEach(room => {
                    const roomCard = document.createElement('div');
                    roomCard.classList.add('col-md-4', 'mb-3');
                    roomCard.innerHTML = `
                        <div class="card booked-room-card">
                            <div class="card-body">
                                <h5 class="card-title">${room.property_name}</h5>
                                <p class="card-text">
                                    <strong>Address:</strong> ${room.address}<br>
                                    <strong>Rooms:</strong> ${room.number_of_rooms}<br>
                                    <strong>Rent:</strong> ₹${room.rent}<br>
                                    <strong>Booking Date:</strong> ${new Date(room.booking_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    `;
                    bookedRoomsContainer.appendChild(roomCard);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to load booked rooms');
            });
    }

    // Call functions to fetch data
    fetchUserDetails();
    fetchBookedRooms();
});
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Display user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userData.name;
    }

    // Handle logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        });
    }

    // Protect the route
    if (userData.role !== 'tenant') {
        alert('Unauthorized access');
        window.location.href = 'login.html';
        return;
    }

    // Search Rooms Functionality
    const searchInput = document.getElementById('roomSearchInput');
    const searchButton = document.getElementById('searchRoomsBtn');
    const searchResults = document.getElementById('searchResults');
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));

    function searchRooms(query) {
        // Clear previous results
        searchResults.innerHTML = '<div class="text-center w-100"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        // Determine the URL based on whether there's a query
        const url = query 
            ? `http://localhost:3000/api/search-rooms?query=${encodeURIComponent(query)}`
            : 'http://localhost:3000/api/rooms';  // Changed to fetch all rooms by default

        console.log('Fetching URL:', url); // Debugging log

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('Response Status:', response.status); // Debugging log
            if (!response.ok) {
                // Try to get error details
                return response.json().then(errorData => {
                    console.error('Server Error:', errorData);
                    throw new Error(errorData.error || 'Network response was not ok');
                }).catch(() => {
                    throw new Error('Network response was not ok');
                });
            }
            return response.json();
        })
        .then(rooms => {
            console.log('Rooms received:', rooms); // Debugging log

            // Clear loading spinner
            searchResults.innerHTML = '';

            if (rooms.length === 0) {
                searchResults.innerHTML = '<div class="alert alert-info w-100">No rooms available.</div>';
                return;
            }

            // Populate results
            rooms.forEach(room => {
                const roomCard = document.createElement('div');
                roomCard.classList.add('card', 'room-card');
                roomCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${room.property_name}</h5>
                        <p class="card-text">
                            <strong>Address:</strong> ${room.address}<br>
                            <strong>Rooms:</strong> ${room.number_of_rooms}<br>
                            <strong>Rent:</strong> ₹${room.rent}<br>
                            <strong>Status:</strong> ${room.status}
                        </p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-primary contact-btn" data-landlord-name="${room.landlord_name}" data-landlord-contact="${room.landlord_contact}">
                                <i class="fas fa-envelope"></i> Contact Landlord
                            </button>
                            <button class="btn btn-success book-btn" data-room-id="${room.id}">
                                <i class="fas fa-bookmark"></i> Book Room
                            </button>
                        </div>
                    </div>
                `;

                // Add contact button event listener
                const contactBtn = roomCard.querySelector('.contact-btn');
                contactBtn.addEventListener('click', function() {
                    const landlordName = this.getAttribute('data-landlord-name');
                    const landlordEmail = this.getAttribute('data-landlord-contact');

                    const modalBody = document.getElementById('contactModalBody');
                    modalBody.innerHTML = `
                        <p><strong>Landlord:</strong> ${landlordName}</p>
                        <p><strong>Contact Email:</strong> ${landlordEmail}</p>
                        <hr>
                        <p>You can reach out to the landlord directly via email.</p>
                    `;

                    contactModal.show();
                });

                // Add book button event listener
                const bookBtn = roomCard.querySelector('.book-btn');
                bookBtn.addEventListener('click', function() {
                    const roomId = this.getAttribute('data-room-id');
                    bookRoom(roomId);
                });

                searchResults.appendChild(roomCard);
            });
        })
        .catch(error => {
            console.error('Full Error:', error); // More detailed error logging
            searchResults.innerHTML = `
                <div class="alert alert-danger w-100">
                    Failed to fetch rooms. Please try again. 
                    Error: ${error.message}
                </div>
            `;
        });
    }

    // Book Room Function (placeholder)
    function bookRoom(roomId) {
        alert(`Booking room with ID: ${roomId}. Implementation pending.`);
    }

    // Search Rooms Event Listeners
    searchButton.addEventListener('click', () => searchRooms(searchInput.value));
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRooms(searchInput.value);
        }
    });

    // Load all rooms when page first loads
    searchRooms('');
});
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Check if the user is logged in
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Protect the route: Ensure the role is 'landlord'
    if (userData.role !== 'landlord') {
        alert('Unauthorized access');
        window.location.href = 'login.html';
        return;
    }

    // Update welcome message with the user's name
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${userData.name}`;
    }

    // Handle logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        });
    }

    // Fetch and display properties
    function fetchProperties() {
        fetch(`http://localhost:3000/api/properties/${userData.userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(properties => {
                const propertiesTable = document.getElementById('propertiesTable').getElementsByTagName('tbody')[0];
                propertiesTable.innerHTML = '';

                // Update total properties count
                document.getElementById('totalPropertiesCount').textContent = properties.length;

                // Calculate total rooms and monthly income
                let totalRooms = 0;
                let totalMonthlyIncome = 0;

                properties.forEach(property => {
                    totalRooms += property.number_of_rooms;
                    totalMonthlyIncome += property.number_of_rooms * property.rent;
                });

                document.getElementById('occupiedRoomsCount').textContent = totalRooms;
                document.getElementById('monthlyIncomeTotal').textContent = `₹${totalMonthlyIncome.toLocaleString()}`;

                // Populate properties table
                properties.forEach(property => {
                    const row = propertiesTable.insertRow();
                    row.innerHTML = `
                        <td>${property.property_name}</td>
                        <td>${property.address}</td>
                        <td>${property.number_of_rooms}</td>
                        <td><span class="badge bg-${property.status === 'Active' ? 'success' : 'warning'}">${property.status}</span></td>
                        <td>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-info" onclick="viewProperty(${property.id})">View</button>
                                <button class="btn btn-sm btn-warning" onclick="editProperty(${property.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProperty(${property.id})">Delete</button>
                            </div>
                        </td>
                    `;
                });
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                alert('Failed to fetch properties: ' + error.message);
            });
    }

    // Add property form submission
    const addPropertyForm = document.getElementById('addPropertyForm');
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const propertyName = this.querySelectorAll('input[type="text"]')[0].value;
            const address = this.querySelectorAll('input[type="text"]')[1].value;
            const numberOfRooms = this.querySelector('input[type="number"][min="1"]').value;
            const rent = this.querySelector('input[type="number"][min="0"]').value;

            fetch('http://localhost:3000/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyName: propertyName,
                    address: address,
                    numberOfRooms: numberOfRooms,
                    landlordId: userData.userId,
                    rent: rent
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                alert('Property added successfully!');
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
                modal.hide();
                // Refresh properties list
                fetchProperties();
                // Reset form
                addPropertyForm.reset();
            })
            .catch(error => {
                console.error('Error adding property:', error);
                alert('Failed to add property: ' + error.message);
            });
        });
    }

    // Delete property function
    window.deleteProperty = function(propertyId) {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        return;
    }

    fetch(`http://localhost:3000/api/properties/${propertyId}`, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Network response was not ok: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Property deleted successfully!');
        fetchProperties();
    })
    .catch(error => {
        console.error('Detailed error:', error);
        alert('Failed to delete property: ' + error.message);
    });
}
    // Placeholder functions for view and edit
    window.viewProperty = function(propertyId) {
        alert(`Viewing property ${propertyId}`);
    }

    window.editProperty = function(propertyId) {
        alert(`Editing property ${propertyId}`);
    }

    // Initial fetch of properties
    fetchProperties();
});
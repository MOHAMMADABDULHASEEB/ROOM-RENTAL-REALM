// login.js
const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log('Login successful:', responseData);

        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify({
            userId: responseData.userId,
            name: responseData.name,
            role: responseData.role
        }));

        // Redirect based on role
        if (responseData.role === 'tenant') {
            window.location.href = './tenant-dashboard.html';
        } else if (responseData.role === 'landlord') {
            window.location.href = './landlord-dashboard.html';
        } else {
            throw new Error('Invalid role detected in response');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials and try again.');
    }
});
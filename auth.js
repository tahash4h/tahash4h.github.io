// auth.js

// Function to handle Google Sign-In response
function handleCredentialResponse(response) {
    try {
        // Decode the JWT token
        const decoded = jwt_decode(response.credential);
        
        // Store user data in localStorage
        const userData = {
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            token: response.credential
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error handling Google Sign-In:', error);
        alert('An error occurred during sign-in. Please try again.');
    }
}

// Function to display user profile
function displayUserProfile(userData) {
    // Hide login form and Google button
    document.querySelector('.auth-form').style.display = 'none';
    document.querySelector('.google-btn-wrapper').style.display = 'none';
    document.querySelector('.or-divider').style.display = 'none';
    
    // Update profile section
    const userProfile = document.getElementById('userProfile');
    const userImage = document.getElementById('userImage');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    userImage.src = userData.picture;
    userName.textContent = userData.name;
    userEmail.textContent = userData.email;
    userProfile.style.display = 'block';
}

// Function to sign out
function signOut() {
    // Clear localStorage
    localStorage.removeItem('userData');
    
    // Reset UI
    document.querySelector('.auth-form').style.display = 'block';
    document.querySelector('.google-btn-wrapper').style.display = 'flex';
    document.querySelector('.or-divider').style.display = 'block';
    document.getElementById('userProfile').style.display = 'none';
    
    // Reload page to reset Google Sign-In button
    location.reload();
}

// Check if user is already logged in on page load
window.onload = function() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        displayUserProfile(JSON.parse(userData));
    }
};

// Handle regular login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Here you would typically validate credentials with a backend
    // For now, we'll just store some basic info
    const userData = {
        name: username,
        email: username,
        picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username),
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    displayUserProfile(userData);
});

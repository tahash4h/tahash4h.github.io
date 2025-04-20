// auth-header.js
document.addEventListener('DOMContentLoaded', function() {
    const authButtons = document.querySelector('.auth-buttons');
    const profileContainer = document.querySelector('.profile-container');
    const profilePic = document.getElementById('headerProfilePic');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const signOutBtn = document.getElementById('signOutBtn');

    // Check if user is logged in
    function checkAuthStatus() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            showProfile(user);
        } else {
            showAuthButtons();
        }
    }

    // Show profile picture and hide auth buttons
    function showProfile(userData) {
        profilePic.src = userData.picture;
        authButtons.classList.add('hidden');
        profileContainer.style.display = 'block';
    }

    // Show auth buttons and hide profile
    function showAuthButtons() {
        authButtons.classList.remove('hidden');
        profileContainer.style.display = 'none';
    }

    // Toggle dropdown when clicking profile picture
    profilePic.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        profileDropdown.classList.remove('show');
    });

    // Handle sign out
    signOutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    });

    // Initial check
    checkAuthStatus();
});

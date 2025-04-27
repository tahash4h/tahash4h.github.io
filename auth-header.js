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
            try {
                const user = JSON.parse(userData);
                showProfile(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                showAuthButtons();
            }
        } else {
            showAuthButtons();
        }
    }

    // Show profile picture and hide auth buttons
    function showProfile(userData) {
        if (profilePic) {
            profilePic.src = userData.picture || '';
            profilePic.alt = userData.name || 'Profile';
            profilePic.style.display = 'block';
            
            // Debug log to check if picture URL is available
            console.log('Profile picture URL:', userData.picture);
            
            // Force image to reload
            profilePic.onload = function() {
                console.log('Profile picture loaded successfully');
            };
            
            profilePic.onerror = function() {
                console.error('Failed to load profile picture');
                // Set a default profile picture if the original fails to load
                profilePic.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'User');
            };
        }
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        if (profileContainer) {
            profileContainer.style.display = 'flex';
        }
    }

    // Show auth buttons and hide profile
    function showAuthButtons() {
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        if (profileContainer) {
            profileContainer.style.display = 'none';
        }
    }

    // Toggle dropdown when clicking profile picture
    if (profilePic) {
        profilePic.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileDropdown) {
                profileDropdown.classList.toggle('show');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }
    });

    // Handle sign out
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    }

    // Initial check
    checkAuthStatus();
});

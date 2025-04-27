// DOM Elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");
const searchResults = document.getElementById('searchResults');

// Configuration
const config = {
    booksPerPage: 12,
    apiUrl: (query) => `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=100`,
    defaultCover: "https://via.placeholder.com/150x200?text=No+Image"
};

// State
let state = {
    currentPage: 1,
    booksData: []
};

// Create notification element
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// Function to show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// API Functions
async function fetchBooks(query) {
    try {
        // Hide popular genres and reading tips sections when searching
        const popularGenres = document.querySelector('.popular-genres');
        const readingTips = document.querySelector('.reading-tips');
        if (popularGenres) popularGenres.style.display = 'none';
        if (readingTips) readingTips.style.display = 'none';
        
        // Show loading indicator
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                     border-top: 4px solid #5a67d8; border-radius: 50%; 
                     animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 1rem; color: #4a5568;">Searching for books...</p>
            </div>
        `;
        
        const response = await fetch(config.apiUrl(query));
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        state.booksData = data.docs;
        state.currentPage = 1;
        
        if (state.booksData.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: #4a5568; font-size: 1.2rem;">No books found for "${query}"</p>
                    <p style="color: #718096; margin-top: 0.5rem;">Try a different search term</p>
                </div>
            `;
            paginationContainer.innerHTML = "";
            return;
        }
        
        displayBooks();
        displayPagination();
    } catch (error) {
        console.error("API Error:", error);
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #e53e3e; font-size: 1.2rem;">Error: ${error.message}</p>
                <p style="color: #718096; margin-top: 0.5rem;">Please try again later</p>
            </div>
        `;
        paginationContainer.innerHTML = "";
    }
}

// Display Functions
function displayBooks() {
    resultsContainer.innerHTML = "";
    const { currentPage, booksData } = state;
    const start = (currentPage - 1) * config.booksPerPage;
    const end = start + config.booksPerPage;
    const booksToShow = booksData.slice(start, end);

    if (booksToShow.length === 0) {
        resultsContainer.innerHTML = "<p class='no-results'>No books found.</p>";
        return;
    }

    booksToShow.forEach(book => {
        const bookElement = createBookCard(book);
        resultsContainer.appendChild(bookElement);
    });
}

function createBookCard(book) {
    const bookCover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : config.defaultCover;
    
    const bookElement = document.createElement("div");
    bookElement.className = "book-card";
    
    // First create the HTML structure
    bookElement.innerHTML = `
        <img src="${bookCover}" alt="${book.title} Cover">
        <div class="book-card-content">
            <h3>${book.title}</h3>
            <p>${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
            <p class="publish-year">${book.first_publish_year || "Year unknown"}</p>
            <p class="book-description">Loading description...</p>
            <button class="read-more-btn" style="display: none;">Read more</button>
            <button class="heart-btn" data-book='${JSON.stringify({
                title: book.title,
                author: book.author_name ? book.author_name.join(", ") : "Unknown Author",
                coverUrl: bookCover,
                publishYear: book.first_publish_year || "Unknown"
            })}'>❤️</button>
        </div>
    `;
    
    // Now fetch book description after the HTML is created
    const descriptionElement = bookElement.querySelector('.book-description');
    const readMoreBtn = bookElement.querySelector('.read-more-btn');
    
    if (book.key) {
        fetch(`https://openlibrary.org${book.key}.json`)
            .then(response => response.json())
            .then(workData => {
                if (workData.description) {
                    const description = typeof workData.description === 'string' 
                        ? workData.description 
                        : workData.description.value || "No description available";
                    
                    const { visibleText, hiddenText, isTruncated } = truncateDescription(description);
                    descriptionElement.innerHTML = visibleText + 
                        (isTruncated ? `<span class="hidden-text">${hiddenText}</span>` : '');
                    
                    readMoreBtn.style.display = isTruncated ? 'block' : 'none';
                } else {
                    descriptionElement.textContent = "No description available";
                    readMoreBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching description:', error);
                descriptionElement.textContent = "No description available";
                readMoreBtn.style.display = 'none';
            });
    } else {
        descriptionElement.textContent = "No description available";
        readMoreBtn.style.display = 'none';
    }
    
    // Add click event to heart button
    const heartBtn = bookElement.querySelector('.heart-btn');
    heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookData = JSON.parse(heartBtn.dataset.book);
        saveBook(bookData);
    });

    // Add click event to read more button
    readMoreBtn.addEventListener('click', () => {
        const description = bookElement.querySelector('.book-description');
        const isExpanded = description.classList.contains('expanded');
        
        if (isExpanded) {
            description.classList.remove('expanded');
            readMoreBtn.textContent = 'Read more';
        } else {
            description.classList.add('expanded');
            readMoreBtn.textContent = 'Read less';
        }
    });
    
    return bookElement;
}

function truncateDescription(description) {
    const words = description.split(' ');
    if (words.length <= 20) {
        return { visibleText: description, hiddenText: '', isTruncated: false };
    }
    return {
        visibleText: words.slice(0, 20).join(' '),
        hiddenText: ' ' + words.slice(20).join(' '),
        isTruncated: true
    };
}

// Function to save book to localStorage
function saveBook(book) {
    let savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
    
    // Check if book is already saved
    const isAlreadySaved = savedBooks.some(savedBook => 
        savedBook.title === book.title && savedBook.author === book.author
    );
    
    if (!isAlreadySaved) {
        savedBooks.push(book);
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
        showNotification(`"${book.title}" saved`);
    } else {
        showNotification(`"${book.title}" is already saved`, 'info');
    }
}

function displayPagination() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(state.booksData.length / config.booksPerPage);

    if (totalPages <= 1) return;

    const prevButton = createPaginationButton("Previous", () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayBooks();
            displayPagination();
        }
    });

    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, () => {
            state.currentPage = i;
            displayBooks();
            displayPagination();
        });
        pageButton.disabled = i === state.currentPage;
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton("Next", () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            displayBooks();
            displayPagination();
        }
    });

    paginationContainer.appendChild(nextButton);
}

function createPaginationButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results');
    const paginationContainer = document.getElementById('pagination');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    // If there's a search query, perform the search
    if (searchQuery) {
        searchInput.value = searchQuery;
        fetchBooks(searchQuery);
    }

    async function searchBooks(query) {
        if (!query.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = '<div class="loading-search">Searching...</div>';
        searchResults.classList.add('show');

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
            if (!response.ok) throw new Error('Failed to fetch results');
            
            const data = await response.json();
            const books = data.docs;

            if (books.length === 0) {
                searchResults.innerHTML = '<div class="no-results">No books found</div>';
                return;
            }

            searchResults.innerHTML = books.map(book => `
                <div class="search-result-item" data-book='${JSON.stringify({
                    title: book.title,
                    author: book.author_name ? book.author_name.join(", ") : "Unknown Author",
                    coverUrl: book.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`
                        : "https://via.placeholder.com/40x60?text=No+Cover",
                    publishYear: book.first_publish_year || "Year unknown"
                })}'>
                    <img src="${book.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`
                        : "https://via.placeholder.com/40x60?text=No+Cover"}" 
                        alt="${book.title} cover">
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</div>
                    </div>
                </div>
            `).join('');

            // Add click handlers to search results
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const bookData = JSON.parse(item.dataset.book);
                    searchInput.value = bookData.title;
                    searchResults.style.display = 'none';
                    fetchBooks(bookData.title);
                });
            });
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="no-results">Error searching for books</div>';
        }
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks(e.target.value);
        }, 300);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Update URL with search query
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('search', query);
            window.history.pushState({}, '', newUrl);
            
            fetchBooks(query);
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});
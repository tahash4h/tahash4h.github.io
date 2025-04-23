// DOM Elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

// Configuration
const config = {
    booksPerPage: 50,
    apiUrl: (query) => `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
    defaultCover: "https://via.placeholder.com/150x200?text=No+Image"
};

// State
let state = {
    currentPage: 1,
    booksData: []
};

// API Functions
async function fetchBooks(query) {
    try {
        const response = await fetch(config.apiUrl(query));
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        state.booksData = data.docs;
        state.currentPage = 1;
        
        displayBooks();
        displayPagination();
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
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
    bookElement.innerHTML = `
        <img src="${bookCover}" alt="${book.title} Cover">
        <div class="book-card-content">
            <h3>${book.title}</h3>
            <p>${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
        </div>
    `;
    
    return bookElement;
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
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
        resultsContainer.innerHTML = "<p class='error-message'>Please enter a search term.</p>";
        return;
    }
    fetchBooks(query);
});
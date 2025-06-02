// script.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    particlesJS('particles-js', { /* ... Same particles.js config as before ... */
        "particles": {"number": {"value": 50,"density": {"enable": true,"value_area": 800}},"color": {"value": "#FFC107"},"shape": {"type": "circle"},"opacity": {"value": 0.25,"random": true,"anim": {"enable": true,"speed": 0.4,"opacity_min": 0.05,"sync": false}},"size": {"value": 2.5,"random": true},"line_linked": {"enable": true,"distance": 160,"color": "#444444","opacity": 0.15,"width": 1},"move": {"enable": true,"speed": 1,"direction": "none","random": true,"straight": false,"out_mode": "out","bounce": false}},
        "interactivity": {"detect_on": "canvas","events": {"onhover": {"enable": true,"mode": "grab"},"onclick": {"enable": false}},"modes": {"grab": {"distance": 130,"line_linked": {"opacity": 0.3}}}},
        "retina_detect": true
    });

    let allEventsData = []; // Will hold data from events.txt
    let activeFilters = []; // Holds currently selected filter tags
    let currentSort = 'asc'; // 'asc', 'desc'

    const eventListContainer = document.getElementById('event-list');
    const eventListStatus = document.getElementById('event-list-status');
    const modal = document.getElementById('eventModal');
    const closeModalButton = modal.querySelector('.close-button');
    
    const filterButton = document.getElementById('filter-button');
    const filterDropdownMenu = document.getElementById('filter-dropdown-menu');
    const filterOptionsContainer = document.getElementById('filter-options');
    const applyFiltersButton = document.getElementById('apply-filters-button');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    const activeFilterCountSpan = document.getElementById('active-filter-count');

    // Define your generic filter categories here
    const genericFilterCategories = [
        "Crypto", "Tech", "Entertainment", "Political & Social", 
        "Economic & Finance", "Seasonal & Holiday", "Meme & Legacy", 
        "Space & Exploration", "Milestone", "Celebration", "Pop-Culture", "Game" 
        // Add or remove as per your events.txt tagging strategy
    ];

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match]));
    }

// Corrected parseDate function
    const baseYear = new Date().getFullYear(); 
    function parseDate(dateStr) { // Parameter is dateStr
        // Use dateStr throughout this function
        if (!dateStr || dateStr.toLowerCase() === 'n/a' || dateStr.toLowerCase() === 'tbd') return null;
    
        const specificYearMatch = dateStr.match(/\b(202[4-9]|203\d)\b/);
        let year = specificYearMatch ? parseInt(specificYearMatch[0]) : baseYear;
    
        const monthYearMatch = dateStr.match(/(\w+)\s+(202[4-9]|203\d)/i);
        if (monthYearMatch) {
            const monthStr = monthYearMatch[1];
            year = parseInt(monthYearMatch[2]); // Use year from match
            const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].findIndex(m => monthStr.toLowerCase().startsWith(m));
            if (monthIndex !== -1) return new Date(year, monthIndex, 1);
        }
    
        if (dateStr.toLowerCase().includes("late")) return new Date(year, 11, 31);
        if (dateStr.toLowerCase().includes("mid")) return new Date(year, 6, 15);
        if (dateStr.toLowerCase().includes("q1")) return new Date(year, 2, 31);
        if (dateStr.toLowerCase().includes("q2")) return new Date(year, 5, 30);
        if (dateStr.toLowerCase().includes("q3")) return new Date(year, 8, 30);
        if (dateStr.toLowerCase().includes("q4")) return new Date(year, 11, 31);
    
        const monthDayMatch = dateStr.match(/(\w+)\s*(\d{1,2})/i);
        if (monthDayMatch) {
            const monthStr = monthDayMatch[1];
            const day = parseInt(monthDayMatch[2]);
            const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].findIndex(m => monthStr.toLowerCase().startsWith(m));
            if (monthIndex !== -1 && day) {
                let Gdate = new Date(year, monthIndex, day);
                // If no specific year was in dateStr and the parsed date (using baseYear) is in the past, assume next year.
                if (!specificYearMatch && Gdate < new Date(new Date().setHours(0,0,0,0))) { 
                    Gdate = new Date(year + 1, monthIndex, day);
                }
                return Gdate;
            }
        }
    
        if (/^\d{4}$/.test(dateStr.trim())) {
            return new Date(parseInt(dateStr.trim()), 0, 1);
        }
    
        try {
            // A more general attempt if a year was part of the string originally
            // or if it's a fuller date format.
            let potentialDateString = dateStr;
            if (!specificYearMatch && !monthYearMatch && !/^\d{4}$/.test(dateStr.trim())) {
                // If it's a simple "Month Day" and no year was found, append the base year for parsing
                // This helps Date constructor interpret "May 22" as "May 22, {baseYear}"
                potentialDateString = `${dateStr}, ${year}`;
            }
            const d = new Date(potentialDateString);
            if (!isNaN(d.getTime())) {
                 // If no specific year was in dateStr and the parsed date (using baseYear) is in the past, assume next year.
                 if (!specificYearMatch && d < new Date(new Date().setHours(0,0,0,0))) { 
                    return new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
                }
                return d;
            }
        } catch (e) { /* ignore */ }
    
        return null;
    }


    async function loadEvents() {
        try {
            const response = await fetch('events.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Could not load events.txt`);
            }
            const eventsText = await response.text();
            const rawEvents = JSON.parse(eventsText);
            
            allEventsData = rawEvents.map(event => ({
                ...event,
                sortDate: parseDate(event.dateString),
                shortDescription: event.fullDescription.substring(0, 80) + (event.fullDescription.length > 80 ? "..." : ""),
                tags: event.tags || [] // Ensure tags array exists
            }));

            if (allEventsData.length === 0) {
                 eventListStatus.textContent = 'No events found in events.txt.';
            } else {
                eventListStatus.style.display = 'none';
            }
            setupFilterDropdown();
            renderEvents();

        } catch (error) {
            console.error("Error loading or parsing events.txt:", error);
            eventListContainer.innerHTML = ''; // Clear any previous content
            eventListStatus.textContent = `Error: ${error.message}. Please ensure 'events.txt' exists and is valid JSON.`;
            eventListStatus.style.color = 'red';
            eventListStatus.style.display = 'block';
        }
    }

    function setupFilterDropdown() {
        filterOptionsContainer.innerHTML = ''; // Clear previous options
        genericFilterCategories.forEach(category => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = category;
            checkbox.id = `filter-${category.replace(/\s|&/g, '-')}`; // Create unique ID
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${category}`));
            filterOptionsContainer.appendChild(label);
        });
    }
    
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent window click from closing it immediately
        filterDropdownMenu.classList.toggle('show');
        filterButton.classList.toggle('active', filterDropdownMenu.classList.contains('show'));
    });

    applyFiltersButton.addEventListener('click', () => {
        activeFilters = [];
        filterOptionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            activeFilters.push(checkbox.value);
        });
        activeFilterCountSpan.textContent = `(${activeFilters.length})`;
        filterDropdownMenu.classList.remove('show');
        filterButton.classList.remove('active');
        renderEvents();
    });

    clearFiltersButton.addEventListener('click', () => {
        filterOptionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        activeFilters = [];
        activeFilterCountSpan.textContent = `(0)`;
        // Optionally apply immediately or wait for "Apply"
        // renderEvents(); 
        // For now, user needs to click "Apply" even after clearing if they want to see all.
        // Or, we can make "Clear" also re-render:
        filterDropdownMenu.classList.remove('show');
        filterButton.classList.remove('active');
        renderEvents();
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', (e) => {
        if (!filterDropdownMenu.contains(e.target) && !filterButton.contains(e.target) && filterDropdownMenu.classList.contains('show')) {
            filterDropdownMenu.classList.remove('show');
            filterButton.classList.remove('active');
        }
    });


    function renderEvents() {
        eventListContainer.innerHTML = '';
        let dataToRender = [...allEventsData];

        // Filter
        if (activeFilters.length > 0) {
            dataToRender = dataToRender.filter(event => 
                activeFilters.some(filterTag => event.tags.includes(filterTag))
            );
        }

        // Sort
        dataToRender.sort((a, b) => {
            const dateA = a.sortDate;
            const dateB = b.sortDate;
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1;
            if (dateB === null) return -1;
            return currentSort === 'asc' ? dateA - dateB : dateB - dateA;
        });

        if (dataToRender.length === 0 && allEventsData.length > 0) { // Only show if events were loaded but none match filter
            eventListStatus.textContent = 'No events match the current filters.';
            eventListStatus.style.display = 'block';
        } else if (allEventsData.length > 0) { // Hide status if there are events to show or no filters active
             eventListStatus.style.display = 'none';
        }


        dataToRender.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('event-card');
            card.addEventListener('click', () => openModal(event));

            let tagsHTML = '<div class="event-tags">';
            (event.tags || []).slice(0, 3).forEach(tag => {
                tagsHTML += `<span class="tag">${escapeHTML(tag)}</span>`;
            });
            if ((event.tags || []).length > 3) tagsHTML += `<span class="tag">...</span>`;
            tagsHTML += '</div>';
            
            const displayDate = event.sortDate 
                ? event.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                : event.dateString;

            card.innerHTML = `
                <p class="event-category">${escapeHTML(event.category || 'General')}</p>
                <h3 class="event-title">${escapeHTML(event.eventName)}</h3>
                <p class="event-date">${escapeHTML(displayDate)}</p>
                <p class="event-short-description">${escapeHTML(event.shortDescription)}</p>
                ${tagsHTML}
            `;
            eventListContainer.appendChild(card);
        });
        observeCardsForAnimation();
    }

    function openModal(event) {
        // (This function remains mostly the same as the previous version)
        // Ensure it correctly displays tags from event.tags
        document.getElementById('modal-title').textContent = event.eventName;
        const displayDate = event.sortDate ? event.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : event.dateString;
        document.getElementById('modal-category-date').innerHTML = `<strong>Category:</strong> ${escapeHTML(event.category || 'General')} <br> <strong>Date:</strong> ${escapeHTML(displayDate)}`;
        
        const modalTagsContainer = document.getElementById('modal-tags');
        modalTagsContainer.innerHTML = '';
        (event.tags || []).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.classList.add('tag');
            tagEl.textContent = escapeHTML(tag);
            modalTagsContainer.appendChild(tagEl);
        });

        document.getElementById('modal-full-description').textContent = event.fullDescription;
        
        const modalCoinsContainer = document.getElementById('modal-coins');
        modalCoinsContainer.innerHTML = '<h4>Associated Coins:</h4>';
        if (event.coins && event.coins.length > 0) {
            event.coins.forEach(coin => {
                const coinItem = document.createElement('div');
                coinItem.classList.add('coin-item');
                coinItem.innerHTML = `
                    <span class="coin-address">${escapeHTML(coin.address)}</span>
                    <button class="copy-address" title="Copy Address"><i class="fas fa-copy"></i></button>
                `;
                coinItem.querySelector('.copy-address').addEventListener('click', function(e) {
                    e.stopPropagation(); 
                    const address = this.previousElementSibling.textContent;
                    navigator.clipboard.writeText(address).then(() => {
                        this.innerHTML = '<i class="fas fa-check"></i>'; this.title = "Copied!";
                        setTimeout(() => { this.innerHTML = '<i class="fas fa-copy"></i>'; this.title = "Copy Address"; }, 2000);
                    }).catch(err => console.error('Failed to copy: ', err));
                });
                modalCoinsContainer.appendChild(coinItem);
            });
        } else {
            modalCoinsContainer.innerHTML += '<p>No specific coins listed yet. DYOR!</p>';
        }
        modal.style.display = 'flex';
    }

    closeModalButton.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
    
    document.getElementById('sort-date-asc').addEventListener('click', () => { currentSort = 'asc'; renderEvents(); });
    document.getElementById('sort-date-desc').addEventListener('click', () => { currentSort = 'desc'; renderEvents(); });
    
    function observeCardsForAnimation() {
        // (This function remains the same as the previous version)
        const cards = document.querySelectorAll('.event-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
                // else entry.target.classList.remove('visible'); // Optional: remove if re-scrolling up
            });
        }, { threshold: 0.05 }); 
        cards.forEach(card => observer.observe(card));
    }

    // Initial Load
    loadEvents();
});
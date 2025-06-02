// script.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    particlesJS('particles-js', { 
        "particles": {"number": {"value": 50,"density": {"enable": true,"value_area": 800}},"color": {"value": "#FFC107"},"shape": {"type": "circle"},"opacity": {"value": 0.25,"random": true,"anim": {"enable": true,"speed": 0.4,"opacity_min": 0.05,"sync": false}},"size": {"value": 2.5,"random": true},"line_linked": {"enable": true,"distance": 160,"color": "#444444","opacity": 0.15,"width": 1},"move": {"enable": true,"speed": 1,"direction": "none","random": true,"straight": false,"out_mode": "out","bounce": false}},
        "interactivity": {"detect_on": "canvas","events": {"onhover": {"enable": true,"mode": "grab"},"onclick": {"enable": false}},"modes": {"grab": {"distance": 130,"line_linked": {"opacity": 0.3}}}},
        "retina_detect": true
    });

    let allEventsData = [];
    let activeFilters = [];
    let currentSort = 'asc';
    const ITEMS_PER_LOAD = 6; 
    let itemsCurrentlyShown = ITEMS_PER_LOAD;

    const eventListContainer = document.getElementById('event-list');
    const eventListStatus = document.getElementById('event-list-status');
    const happeningSoonListContainer = document.getElementById('happening-soon-list');
    const happeningSoonStatus = document.getElementById('happening-soon-status');
    const showMoreButton = document.getElementById('show-more-button');

    const modal = document.getElementById('eventModal');
    const closeModalButton = modal.querySelector('.close-button');
    
    const filterButton = document.getElementById('filter-button');
    const filterDropdownMenu = document.getElementById('filter-dropdown-menu');
    const filterOptionsContainer = document.getElementById('filter-options');
    const applyFiltersButton = document.getElementById('apply-filters-button');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    const activeFilterCountSpan = document.getElementById('active-filter-count');

    const genericFilterCategories = [
        "Crypto", "Tech", "Entertainment", "Political & Social", 
        "Economic & Finance", "Seasonal & Holiday", "Meme & Legacy", 
        "Space & Exploration", "Milestone", "Celebration", "Pop-Culture", "Game"
    ];

    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0); 

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match]));
    }
    
    const baseYear = new Date().getFullYear(); 
    function parseDate(dateStr) {
        if (!dateStr || dateStr.toLowerCase() === 'n/a' || dateStr.toLowerCase() === 'tbd') return null;
    
        const specificYearMatch = dateStr.match(/\b(202[4-9]|203\d)\b/);
        let year = specificYearMatch ? parseInt(specificYearMatch[0]) : baseYear;
    
        const monthYearMatch = dateStr.match(/(\w+)\s+(202[4-9]|203\d)/i);
        if (monthYearMatch) {
            const monthStr = monthYearMatch[1];
            year = parseInt(monthYearMatch[2]);
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
                if (!specificYearMatch && Gdate < TODAY) { 
                    Gdate = new Date(year + 1, monthIndex, day);
                }
                return Gdate;
            }
        }
    
        if (/^\d{4}$/.test(dateStr.trim())) {
            return new Date(parseInt(dateStr.trim()), 0, 1);
        }
    
        try {
            let potentialDateString = dateStr;
            if (!specificYearMatch && !monthYearMatch && !/^\d{4}$/.test(dateStr.trim())) {
                 potentialDateString = `${dateStr}, ${year}`;
            }
            const d = new Date(potentialDateString);
            if (!isNaN(d.getTime())) {
                 if (!specificYearMatch && d < TODAY) { 
                    return new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
                }
                return d;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    async function loadEvents() {
        eventListStatus.textContent = 'Loading events...';
        eventListStatus.style.display = 'block';
        happeningSoonStatus.style.display = 'none';

        try {
            const response = await fetch('events.txt');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - Could not load events.txt`);
            const eventsText = await response.text();
            const rawEvents = JSON.parse(eventsText);
            
            allEventsData = rawEvents.map(event => ({
                ...event,
                sortDate: parseDate(event.dateString),
                shortDescription: event.fullDescription ? event.fullDescription.substring(0, 80) + (event.fullDescription.length > 80 ? "..." : "") : "No description available.",
                tags: event.tags || []
            }));

            if (allEventsData.length === 0) {
                 eventListStatus.textContent = 'No events found in events.txt.';
                 happeningSoonListContainer.innerHTML = '';
            } else {
                eventListStatus.style.display = 'none';
            }
            setupFilterDropdown();
            updateDisplayedEvents();

        } catch (error) {
            console.error("Error loading or parsing events.txt:", error);
            eventListContainer.innerHTML = '';
            happeningSoonListContainer.innerHTML = '';
            eventListStatus.textContent = `Error: ${error.message}. Ensure 'events.txt' is valid.`;
            eventListStatus.style.color = 'red';
        }
    }

    function setupFilterDropdown() {
        filterOptionsContainer.innerHTML = '';
        genericFilterCategories.forEach(category => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; checkbox.value = category;
            checkbox.id = `filter-${category.replace(/\s|&/g, '-')}`;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${category}`));
            filterOptionsContainer.appendChild(label);
        });
    }
    
    function getFilteredAndSortedData() {
        let dataToProcess = [...allEventsData];
        if (activeFilters.length > 0) {
            dataToProcess = dataToProcess.filter(event => 
                activeFilters.some(filterTag => event.tags.includes(filterTag))
            );
        }
        dataToProcess.sort((a, b) => {
            const dateA = a.sortDate; const dateB = b.sortDate;
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1; if (dateB === null) return -1;
            return currentSort === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return dataToProcess;
    }

    function renderHappeningSoon(processedData) {
        happeningSoonListContainer.innerHTML = '';
        happeningSoonStatus.style.display = 'none';

        const futureEvents = processedData.filter(event => event.sortDate && event.sortDate >= TODAY);
        const soonEvents = futureEvents.slice(0, 3);

        if (soonEvents.length === 0) {
            if(allEventsData.length > 0) {
                 happeningSoonStatus.textContent = 'No upcoming events match criteria.';
                 happeningSoonStatus.style.display = 'block';
            }
            return;
        }

        let displayOrder = [];
        if (soonEvents.length === 1) displayOrder = [null, soonEvents[0], null];
        else if (soonEvents.length === 2) displayOrder = [soonEvents[1], soonEvents[0], null];
        else displayOrder = [soonEvents[1], soonEvents[0], soonEvents[2]];

        displayOrder.forEach((event, index) => {
            if (event) {
                const card = createEventCard(event);
                if (index === 1) card.classList.add('soon-main');
                else card.classList.add('soon-side');
                happeningSoonListContainer.appendChild(card);
            } else {
                 const emptyPlaceholder = document.createElement('div'); // Add placeholder for grid structure
                 happeningSoonListContainer.appendChild(emptyPlaceholder);
            }
        });
         observeCardsForAnimation(happeningSoonListContainer);
    }

    function renderMainEventList(processedData) {
        eventListContainer.innerHTML = '';
        const dataToShowOnPage = processedData.slice(0, itemsCurrentlyShown);

        if (processedData.length === 0 && allEventsData.length > 0) {
            eventListStatus.textContent = 'No events match the current filters.';
            eventListStatus.style.display = 'block';
        } else if (allEventsData.length > 0 || processedData.length > 0) { 
             eventListStatus.style.display = 'none';
        } else if (allEventsData.length === 0 && !eventListStatus.textContent.startsWith("Error")) {
            // This case is handled by loadEvents for initial empty file
        }


        dataToShowOnPage.forEach(event => {
            eventListContainer.appendChild(createEventCard(event));
        });

        if (processedData.length > itemsCurrentlyShown) {
            showMoreButton.style.display = 'block';
        } else {
            showMoreButton.style.display = 'none';
        }
        observeCardsForAnimation(eventListContainer);
    }

    function createEventCard(event) {
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
            : (event.dateString || "Date TBD");

        card.innerHTML = `
            <p class="event-category">${escapeHTML(event.category || 'General')}</p>
            <h3 class="event-title">${escapeHTML(event.eventName)}</h3>
            <p class="event-date">${escapeHTML(displayDate)}</p>
            <p class="event-short-description">${escapeHTML(event.shortDescription)}</p>
            ${tagsHTML}
        `;
        return card;
    }
    
    function updateDisplayedEvents() {
        const processedData = getFilteredAndSortedData();
        renderHappeningSoon(processedData); 
        renderMainEventList(processedData);
    }

    filterButton.addEventListener('click', (e) => { 
        e.stopPropagation(); 
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
        itemsCurrentlyShown = ITEMS_PER_LOAD; 
        updateDisplayedEvents();
    });
    clearFiltersButton.addEventListener('click', () => { 
        filterOptionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        activeFilters = [];
        activeFilterCountSpan.textContent = `(0)`;
        filterDropdownMenu.classList.remove('show');
        filterButton.classList.remove('active');
        itemsCurrentlyShown = ITEMS_PER_LOAD; 
        updateDisplayedEvents();
    });
    window.addEventListener('click', (e) => { 
        if (!filterDropdownMenu.contains(e.target) && !filterButton.contains(e.target) && filterDropdownMenu.classList.contains('show')) {
            filterDropdownMenu.classList.remove('show');
            filterButton.classList.remove('active');
        }
    });

    showMoreButton.addEventListener('click', () => {
        const processedData = getFilteredAndSortedData(); // Get current filtered/sorted list
        itemsCurrentlyShown = processedData.length; // Set to show all items from the filtered list
        updateDisplayedEvents();
    });
    
    document.getElementById('sort-date-asc').addEventListener('click', () => { currentSort = 'asc'; itemsCurrentlyShown = ITEMS_PER_LOAD; updateDisplayedEvents(); });
    document.getElementById('sort-date-desc').addEventListener('click', () => { currentSort = 'desc'; itemsCurrentlyShown = ITEMS_PER_LOAD; updateDisplayedEvents(); });
    
    function openModal(event) {
        document.getElementById('modal-title').textContent = event.eventName;
        const displayDate = event.sortDate ? event.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : (event.dateString || "Date TBD");
        document.getElementById('modal-category-date').innerHTML = `<strong>Category:</strong> ${escapeHTML(event.category || 'General')} <br> <strong>Date:</strong> ${escapeHTML(displayDate)}`;
        const modalTagsContainer = document.getElementById('modal-tags');
        modalTagsContainer.innerHTML = '';
        (event.tags || []).forEach(tag => {
            const tagEl = document.createElement('span'); tagEl.classList.add('tag'); tagEl.textContent = escapeHTML(tag);
            modalTagsContainer.appendChild(tagEl);
        });
        document.getElementById('modal-full-description').textContent = event.fullDescription || "No further details available.";
        const modalCoinsContainer = document.getElementById('modal-coins');
        modalCoinsContainer.innerHTML = '<h4>Associated Coins:</h4>';
        if (event.coins && event.coins.length > 0) {
            event.coins.forEach(coin => {
                const coinItem = document.createElement('div'); coinItem.classList.add('coin-item');
                coinItem.innerHTML = `<span class="coin-address">${escapeHTML(coin.address)}</span><button class="copy-address" title="Copy Address"><i class="fas fa-copy"></i></button>`;
                coinItem.querySelector('.copy-address').addEventListener('click', function(e) {
                    e.stopPropagation(); const address = this.previousElementSibling.textContent;
                    navigator.clipboard.writeText(address).then(() => {
                        this.innerHTML = '<i class="fas fa-check"></i>'; this.title = "Copied!";
                        setTimeout(() => { this.innerHTML = '<i class="fas fa-copy"></i>'; this.title = "Copy Address"; }, 2000);
                    }).catch(err => console.error('Failed to copy: ', err));
                });
                modalCoinsContainer.appendChild(coinItem);
            });
        } else { modalCoinsContainer.innerHTML += '<p>No specific coins listed yet. DYOR!</p>'; }
        modal.style.display = 'flex';
    }
    closeModalButton.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
    
    function observeCardsForAnimation(container) {
        const cards = container.querySelectorAll('.event-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.05 }); 
        cards.forEach(card => observer.observe(card));
    }

    loadEvents();
});
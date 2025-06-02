// script.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    particlesJS('particles-js', { /* ... Same particles.js config as before ... */
        "particles": {
            "number": {"value": 60, "density": {"enable": true, "value_area": 800}},
            "color": {"value": "#FFC107"},
            "shape": {"type": "circle", "stroke": {"width": 0, "color": "#000000"}, "polygon": {"nb_sides": 5}},
            "opacity": {"value": 0.3, "random": true, "anim": {"enable": true, "speed": 0.5, "opacity_min": 0.05, "sync": false}},
            "size": {"value": 2.5, "random": true, "anim": {"enable": false}},
            "line_linked": {"enable": true, "distance": 150, "color": "#444444", "opacity": 0.2, "width": 1},
            "move": {"enable": true, "speed": 1.2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": {"enable": false}}
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {"onhover": {"enable": true, "mode": "grab"}, "onclick": {"enable": false}, "resize": true},
            "modes": {"grab": {"distance": 120, "line_linked": {"opacity": 0.5}}}
        },
        "retina_detect": true
    });

    // --- Data ---
    // Helper to create sortable dates. Uses 2025 as default year if only month/day provided.
    // For TBD/N/A, returns null to handle in sorting.
    // For ranges like "Late 2025", uses end of year.
    const baseYear = 2025; // From "Last Updated: 5/15/25"
    function parseDate(dateStr) {
        if (!dateStr || dateStr.toLowerCase() === 'n/a' || dateStr.toLowerCase() === 'tbd') return null;

        const yearMatch = dateStr.match(/\b(202[5-9]|203\d)\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : baseYear;
        
        if (dateStr.toLowerCase().includes("late")) {
            return new Date(year, 11, 31); // End of December
        }
        if (dateStr.toLowerCase().includes("mid")) {
            return new Date(year, 6, 15); // Mid July
        }
        if (dateStr.toLowerCase().includes("q1")) return new Date(year, 2, 31); // End of Q1
        if (dateStr.toLowerCase().includes("q2")) return new Date(year, 5, 30); // End of Q2
        if (dateStr.toLowerCase().includes("q3")) return new Date(year, 8, 30); // End of Q3
        if (dateStr.toLowerCase().includes("q4")) return new Date(year, 11, 31); // End of Q4


        // Attempt to parse month and day
        const specificDateMatch = dateStr.match(/(\w+)\s*(\d{1,2})/);
        if (specificDateMatch) {
            const monthStr = specificDateMatch[1];
            const day = parseInt(specificDateMatch[2]);
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            const monthIndex = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m.substring(0,3)));
            if (monthIndex !== -1 && day) {
                return new Date(year, monthIndex, day);
            }
        }
        // If only year is mentioned (e.g. "2026")
        if (/^\d{4}$/.test(dateStr.trim())) {
            return new Date(parseInt(dateStr.trim()), 0, 1); // Start of that year
        }

        try { // Fallback for more complex but parsable dates like "July 25" or "May 2026"
            let d = new Date(dateStr + (yearMatch ? "" : `, ${baseYear}`));
            if (!isNaN(d.getTime())) return d;
        } catch (e) { /* ignore */ }

        return null; // Could not parse
    }


    let frontrunData = [
        // Category: Confirmed Dates
        { eventName: "🍕 Bitcoin Pizza Day", dateString: "May 22", fullDescription: "Celebrating the first real-world Bitcoin purchase—often sparks meme campaigns. This day marks the historic transaction of 10,000 BTC for two pizzas.", coins: [ { address: "2AegcsRtVeSvoGRPDBSfTRRGH8YhU2RhgnqzgCLmd4oY" }, { address: "5z3FcZmYk3aM3hRH3Ggu8Y9gLgNSMHTchGsGmUReYBz3" } ], tags: ["bitcoin", "milestone", "food", "celebration"], category: "🗓️ Confirmed Dates" },
        { eventName: "✊ George Floyd Death Anniversary", dateString: "May 25", fullDescription: "High social narrative potential surrounding themes of justice and remembrance.", coins: [ { address: "6qtwnLCDUKf3tbTJBoYBJfncQQBt7QfH435XbAWZRXbs" } ], tags: ["social", "awareness", "memorial"], category: "🗓️ Confirmed Dates" },
        { eventName: "🦍 Harambe Birthday", dateString: "May 25", fullDescription: "Legacy meme narrative with enduring internet culture relevance. Celebrations often revive the meme.", coins: [ { address: "6qtwnLCDUKf3tbTJBoYBJfncQQBt7QfH435XbAWZRXbs" } ], tags: ["meme", "animal", "legacy"], category: "🗓️ Confirmed Dates" },
        { eventName: "🦍 Harambe Death Anniversary", dateString: "May 28", fullDescription: "Annual meme revival potential; a somber but significant date in meme history.", coins: [ { address: "Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP" } ], tags: ["meme", "animal", "legacy", "memorial"], category: "🗓️ Confirmed Dates" },
        { eventName: "🏳️‍🌈 Pride Month", dateString: "June 1", fullDescription: "Seasonal cultural trend opportunity. Many brands and communities participate, creating broad visibility.", coins: [ { address: "9mQEkFVqmRJLMPUJT25qriKXi2sH8RiuMBrzLeLupump" } ], tags: ["social", "lgbtq+", "cultural", "month"], category: "🗓️ Confirmed Dates" },
        { eventName: "☀️ Summer", dateString: "June 1", fullDescription: "Seasonal lifestyle narrative. Associated with holidays, travel, and outdoor activities.", coins: [ { address: "6BQjp7nPMZNkstxdw2UFH1gf76cGmNuR3bTmSbgxpump" } ], tags: ["seasonal", "lifestyle", "travel"], category: "🗓️ Confirmed Dates" },
        { eventName: "🏀 NBA Finals", dateString: "June 5", fullDescription: "High media coverage sports narrative. Significant viewership and social media buzz.", coins: [ { address: "jhMMjiirVamjUZsQNghtqH6jbg5zy3BTwx5YwYZpump" } ], tags: ["sports", "nba", "championship"], category: "🗓️ Confirmed Dates" },
        { eventName: "🎉 Donald Trump's Birthday", dateString: "June 14", fullDescription: "Political and meme culture crossover. Often generates discussion and related content.", coins: [ { address: "AmonPTx29aqnjXwdsqV7nXTK7tqHoeZmxFp3W3UTpump" } ], tags: ["political", "trump", "meme", "birthday"], category: "🗓️ Confirmed Dates" },
        { eventName: "🦑 Squid Games", dateString: "June 26", fullDescription: "Anticipated pop culture sequel hype. Previous success indicates strong interest.", coins: [ { address: "6sbSz8r8sqap2DERkxvDLxAHBWpLiD5LnUfiW3wQpump" } ], tags: ["tv-show", "pop-culture", "sequel", "netflix"], category: "🗓️ Confirmed Dates" }, // Assuming 2025 date from prompt context
        { eventName: "🚀 Elon Musk's Birthday", dateString: "June 28", fullDescription: "Elon-related narratives tend to trend. His influence often sparks market movements.", coins: [ { address: "233wzivZi9SevKLC81uCBNgkyZP1TzAtwSLXn1DWpump" } ], tags: ["elon-musk", "tech", "meme", "birthday"], category: "🗓️ Confirmed Dates" },
        { eventName: "🇺🇸 July 4th", dateString: "July 4", fullDescription: "Patriotic and cultural event in the US. Celebrations and themed content are common.", coins: [ { address: "DtjrhG1S5cgEcbp6N4YL61HWqeUAVpfepM89aoNgU2yL" }, { address: "5E9v1BzHpeVb9zxQhTjzEKJU246PjrykQYbGubn5PCHL" } ], tags: ["holiday", "usa", "patriotic", "celebration"], category: "🗓️ Confirmed Dates" },
        { eventName: "🦸 Superman Movie", dateString: "July 11", fullDescription: "Big media franchise release. Superhero movies often generate significant hype and merchandise.", coins: [ { address: "4xKiyH7VaTGc7j6HhZuTR6tc88njqWyf3hL9XCRqpump" }, { address: "FHc1Dg4z6hpoB4kBefGZU9spRKBW8gexpjEhMSJ9pump" } ], tags: ["movie", "superhero", "dc-comics", "pop-culture"], category: "🗓️ Confirmed Dates" }, // Assuming 2025

        // Category: Expected / Tentative
        { eventName: "💥 Technical Recession, Q2 GDP Print", dateString: "July 25 (Tentative)", fullDescription: "2 Quarters of negative growth is a technical recession in the U.S. (doesn’t mean actual NBER recession). Economic news can drive narratives.", coins: [ { address: "58WAscyseSRr23SR3kE8paAfmazScJsRn1TexJtgpump" } ], tags: ["economy", "finance", "recession", "usa"], category: "🕐 Expected / Tentative" },
        { eventName: "🏛️ Stablecoin Bill", dateString: "August (Tentative)", fullDescription: "Could trigger regulatory narrative. Legislation around crypto is a major market factor.", coins: [ { address: "DM6ffRmbBZUMEcgLePygJXktj525jx45hTNVHjxDpump" } ], tags: ["regulation", "stablecoin", "crypto-law", "government"], category: "🕐 Expected / Tentative" }, // Assuming 2025
        { eventName: "🧠 Grok 4", dateString: "Late 2025", fullDescription: "Elon Musk's AI product launch narrative. AI is a hot topic and Elon's involvement amplifies interest.", coins: [ { address: "GpDzQVu8gTLfnTEJdsbWiLBJo8SduQtkGpJfmEJnpump" } ], tags: ["ai", "elon-musk", "tech", "xai"], category: "🕐 Expected / Tentative" },
        { eventName: "👻 Stranger Things", dateString: "Late 2025", fullDescription: "Pop culture nostalgia wave. Final season anticipation is high.", coins: [ { address: "8ChdT1DuygvAyRwjPche6HaMWJdfQe8nAzyWUreGZQgx" } ], tags: ["tv-show", "pop-culture", "netflix", "nostalgia"], category: "🕐 Expected / Tentative" },
        { eventName: "🌊 Avatar 3 Movie", dateString: "December 2025", fullDescription: "Massive franchise return. Avatar movies are major cinematic events with global reach.", coins: [ { address: "3K8dGSW7CZY6YkLXsDf1Y2JPBF837okcQUcpGnwopump" }, { address: "4ENeqaEfDqtquXofwNTjcYDHS7pDmmyTYnB3qSKUpump" } ], tags: ["movie", "sci-fi", "avatar", "pop-culture"], category: "🕐 Expected / Tentative" },

        // Category: 2026 Meme Narrative
        { eventName: "🎮 GTA 6", dateString: "May 2026", fullDescription: "Largest video game launch hype. Expected to be one of the biggest entertainment releases ever.", coins: [ { address: "25okNXRjYJC4nwyg84e1tV5VAuCJT8CYe1tJJYoFqJnw" }, { address: "6rq1xS3xV2ufM8Rw9TBJpYfMniCem3Hf8ViByBS2pump" }, { address: "2FcsqRrhvgSfYxJWh32xW873vyqBZ9jmMyXqYSPgNtuZ" } ], tags: ["game", "gta", "rockstar", "hype"], category: "🗓️ 2026 Narrative" },
        { eventName: "General Meme Wave", dateString: "2026", fullDescription: "General meme wave opportunity. Anticipating broader market trends for meme coins.", coins: [ { address: "GrPYqhdyhzot7F34XXUm4VJVPNSujaCgUcPAxmuepump" } ], tags: ["meme", "market-cycle", "speculative"], category: "🗓️ 2026 Narrative" },

        // Category: No Date / TBD
        { eventName: "🏆 Fort Knox", dateString: "TBD", fullDescription: "Speculated government gold-backed meme. Highly speculative narrative based on rumors.", coins: [ { address: "4N8g7mw171aVC1oMMRV1pMrQuB1RwFHaJan2WYyBpump" } ], tags: ["speculative", "gold", "government", "meme"], category: "❓ No Date / TBD" },
        { eventName: "🚫 TikTok Getting Banned", dateString: "TBD", fullDescription: "US-China tension and creator economy narrative. Potential ban could shift social media landscape.", coins: [ { address: "65CFQVF1tfDMAtXrGDZR61M24D6eWrA8FpCDg44Jpump" }, { address: "FW7aAw92HWnWrUmGe4HHrdHjqshQ2CnyFMqBkSDnpump" }, { address: "9EKVNo223qgMyAUjaSXMR4zUkcFM42LpxXUatsiGpump" } ], tags: ["social-media", "tiktok", "regulation", "geopolitics"], category: "❓ No Date / TBD" },
        { eventName: "📱 Solana Phone 2 – Seeker", dateString: "Mid 2025 (TBD)", fullDescription: "New hardware narrative from the Solana ecosystem. Building on the Saga phone's cult status.", coins: [ { address: "AAAnrZ1BzW6faFjFhZFooGJi5hgG1jceMC7tkaxPpump" } ], tags: ["solana", "hardware", "mobile", "tech"], category: "❓ No Date / TBD" },
        { eventName: "🚀 Artemis Flight to Moon", dateString: "Sept (TBD)", fullDescription: "Space exploration hype. NASA missions often capture public imagination.", coins: [ { address: "7Hge4Kcurq2418tmncLjiodNp58CNAkFPp5uWMYypump" } ], tags: ["space", "nasa", "moon", "exploration"], category: "❓ No Date / TBD" }, // Assuming 2025 from context
        { eventName: "📱 New iPhone Release", dateString: "Sept 2025 (TBD)", fullDescription: "Annual tech product cycle. Apple events are highly anticipated and drive tech news.", coins: [ { address: "572C9csb7sanPYojYgXoJsfFhXHSMESTKgw4kvDLGyoP" }, { address: "7oap156ExYQMzKapu3YVKEEmmd2CP1F3Cgd85un2pump" }, { address: "RCy3QnmxESXwpgSYtiJazK89azSLcjZ8VZ9mnaLzGH6" } ], tags: ["apple", "iphone", "tech", "product-launch"], category: "❓ No Date / TBD" },
        { eventName: "🟢 XRP ETF", dateString: "Expected 2025, Possibly Q2 (TBD)", fullDescription: "Ripple’s legal clarity could trigger meme wave. ETF approvals are major crypto catalysts.", coins: [ { address: "HyBAcPFiRuWgyUYNwR3YQrQXEw7qqoRoHyGfDxz8B1Xk" } ], tags: ["xrp", "etf", "regulation", "finance"], category: "❓ No Date / TBD" },
        { eventName: "🟩 Sol ETF", dateString: "October 2025 (TBD)", fullDescription: "Major regulatory catalyst if approved. Could significantly impact Solana and related tokens.", coins: [ { address: "5ipC8wrxZR2DzPyM6Y8EFekUAd1HVoJHpXdeJ52HTrM2" } ], tags: ["solana", "etf", "regulation", "finance"], category: "❓ No Date / TBD" },
        { eventName: "🐕 Doge ETF", dateString: "N/A", fullDescription: "Potential for mass meme rally if announced. Dogecoin's popularity makes an ETF a strong narrative.", coins: [ { address: "9JDUJtFg5cbG3XccN5f6u77pVCA6ScyCjsN89j8LgEAE" } ], tags: ["doge", "etf", "meme", "speculative"], category: "❓ No Date / TBD" },
        { eventName: "🇺🇸 Trump ETF", dateString: "N/A", fullDescription: "Political meme and election cycle. Combines political interest with ETF speculation.", coins: [ { address: "EPs9w3PPCPD5dwz1ZaUcdFzcb1E9VbNiQsmtQnZppump" } ], tags: ["trump", "political", "etf", "election"], category: "❓ No Date / TBD" },
        { eventName: "💼 Strategic Trump Reserve", dateString: "N/A", fullDescription: "Political meme narrative. Details are often speculative and tied to current events.", coins: [ { address: "9fBhDwAcwfTuY8aMRa8gaTv2P6pJxNGj6WggbRj1pump" } ], tags: ["trump", "political", "meme", "speculative"], category: "❓ No Date / TBD" },
        { eventName: "💵 Solana Hitting $300", dateString: "TBD", fullDescription: "Round number psychological target. Achieving price milestones can create buzz.", coins: [ { address: "37Cq5gtweeVXzG6CQuWvwGuiS4bLxK6hDGFiZM2hpump" } ], tags: ["solana", "price-target", "milestone", "market-psychology"], category: "❓ No Date / TBD" },
        
        // Category: Future Ideas
        { eventName: "🎃 Halloween", dateString: "October 31", fullDescription: "Seasonal spooky fun. Opportunity for themed coins and NFT projects.", coins: [], tags: ["holiday", "seasonal", "halloween"], category: "💡 Future Ideas" },
        { eventName: "🦃 Thanksgiving", dateString: "Late November", fullDescription: "Holiday narratives. Focus on family, gratitude, and feasting themes.", coins: [], tags: ["holiday", "seasonal", "thanksgiving"], category: "💡 Future Ideas" },
        { eventName: "🎄 Christmas", dateString: "December 25", fullDescription: "Festive season opportunities. Gift-giving, Santa, and holiday cheer themes are popular.", coins: [], tags: ["holiday", "seasonal", "christmas"], category: "💡 Future Ideas" }
    ].map(event => ({
        ...event,
        sortDate: parseDate(event.dateString),
        shortDescription: event.fullDescription.substring(0, 70) + (event.fullDescription.length > 70 ? "..." : "") // Auto-generate short description
    }));


    const eventListContainer = document.getElementById('event-list');
    const modal = document.getElementById('eventModal');
    const closeModalButton = modal.querySelector('.close-button');
    const tagFiltersContainer = document.getElementById('tag-filters');
    
    let currentFilter = 'all';
    let currentSort = 'asc'; // 'asc', 'desc'

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match]));
    }

    function renderEvents() {
        eventListContainer.innerHTML = '';
        let dataToRender = [...frontrunData];

        // Filter
        if (currentFilter !== 'all') {
            dataToRender = dataToRender.filter(event => event.tags.includes(currentFilter));
        }

        // Sort
        dataToRender.sort((a, b) => {
            const dateA = a.sortDate;
            const dateB = b.sortDate;

            if (dateA === null && dateB === null) return 0; // Keep original order for two nulls
            if (dateA === null) return 1; // Nulls go to the end
            if (dateB === null) return -1; // Nulls go to the end

            if (currentSort === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });


        dataToRender.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('event-card');
            card.addEventListener('click', () => openModal(event));

            let tagsHTML = '<div class="event-tags">';
            event.tags.slice(0, 3).forEach(tag => { // Show max 3 tags on card
                tagsHTML += `<span class="tag">${escapeHTML(tag)}</span>`;
            });
            if (event.tags.length > 3) tagsHTML += `<span class="tag">...</span>`;
            tagsHTML += '</div>';
            
            const displayDate = event.sortDate ? event.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : event.dateString;

            card.innerHTML = `
                <p class="event-category">${escapeHTML(event.category)}</p>
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
        document.getElementById('modal-title').textContent = event.eventName;
        const displayDate = event.sortDate ? event.sortDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : event.dateString;
        document.getElementById('modal-category-date').innerHTML = `<strong>Category:</strong> ${escapeHTML(event.category)} <br> <strong>Date:</strong> ${escapeHTML(displayDate)}`;
        
        const modalTagsContainer = document.getElementById('modal-tags');
        modalTagsContainer.innerHTML = '';
        event.tags.forEach(tag => {
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
                    e.stopPropagation(); // Prevent modal from closing if clicked
                    const address = this.previousElementSibling.textContent;
                    navigator.clipboard.writeText(address).then(() => {
                        this.innerHTML = '<i class="fas fa-check"></i>';
                        this.title = "Copied!";
                        setTimeout(() => {
                            this.innerHTML = '<i class="fas fa-copy"></i>';
                            this.title = "Copy Address";
                        }, 2000);
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
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    function setupFilters() {
        const allTags = new Set();
        frontrunData.forEach(event => event.tags.forEach(tag => allTags.add(tag)));
        
        tagFiltersContainer.innerHTML = `<button class="tag-filter-button active" data-tag="all">Show All</button>`;
        allTags.forEach(tag => {
            const button = document.createElement('button');
            button.classList.add('tag-filter-button');
            button.dataset.tag = tag;
            button.textContent = escapeHTML(tag.charAt(0).toUpperCase() + tag.slice(1));
            tagFiltersContainer.appendChild(button);
        });

        tagFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter-button')) {
                document.querySelectorAll('.tag-filter-button.active').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.tag;
                renderEvents();
            }
        });
    }
    
    document.getElementById('sort-date-asc').addEventListener('click', () => {
        currentSort = 'asc';
        renderEvents();
    });
    document.getElementById('sort-date-desc').addEventListener('click', () => {
        currentSort = 'desc';
        renderEvents();
    });
    
    function observeCardsForAnimation() {
        const cards = document.querySelectorAll('.event-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // observer.unobserve(entry.target); // Keep observing if filters re-render cards
                } else {
                    entry.target.classList.remove('visible'); // Optional: remove if re-scrolling up
                }
            });
        }, { threshold: 0.05 }); 

        cards.forEach(card => observer.observe(card));
    }

    // Initial setup
    setupFilters();
    renderEvents();
});
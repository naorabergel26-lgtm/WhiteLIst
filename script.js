document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const mainCategoriesContainer = document.getElementById('main-categories-container');
    const dynamicCategoriesContainer = document.getElementById('dynamic-categories-container');
    const noResultsMessage = document.getElementById('no-results-message');
    
    const expandAllBtn = document.getElementById('expand-all');
    const collapseAllBtn = document.getElementById('collapse-all');

    const allLinkItems = Array.from(mainCategoriesContainer.querySelectorAll('.link-item'));

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let recentlyUsed = JSON.parse(localStorage.getItem('recentlyUsed')) || [];
    let collapsedCategories = JSON.parse(localStorage.getItem('collapsedCategories')) || [];

    function createLinkItemHTML(linkItem) {
        if (!linkItem) return '';
        // Create a clone to avoid issues with event listeners being duplicated
        const clone = linkItem.cloneNode(true);
        return `<div class="link-item" data-id="${clone.dataset.id}">${clone.innerHTML}</div>`;
    }

    function renderDynamicCategories() {
        let html = '';

        if (recentlyUsed.length > 0) {
            html += `
                <section class="category-section" data-category-id="recent">
                    <header class="category-header">
                        <h2 class="category-title">🕒 בשימוש לאחרונה</h2>
                        <svg class="toggle-arrow" viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                    </header>
                    <div class="category-content"><div class="links-grid">
                        ${recentlyUsed.map(id => createLinkItemHTML(allLinkItems.find(item => item.dataset.id === id))).join('')}
                    </div></div>
                </section>`;
        }

        if (favorites.length > 0) {
            html += `
                <section class="category-section" data-category-id="favorites">
                    <header class="category-header">
                        <h2 class="category-title">⭐ מועדפים</h2>
                        <svg class="toggle-arrow" viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                    </header>
                    <div class="category-content"><div class="links-grid">
                        ${favorites.map(id => createLinkItemHTML(allLinkItems.find(item => item.dataset.id === id))).join('')}
                    </div></div>
                </section>`;
        }
        
        dynamicCategoriesContainer.innerHTML = html;
        updateFavoriteIcons();
        addEventListenersToDynamicItems();
        setInitialCollapseState(); // Apply collapse state to newly created dynamic categories
    }
    
    function updateFavoriteIcons() {
        document.querySelectorAll('.favorite-toggle').forEach(toggle => {
            const linkId = toggle.closest('.link-item').dataset.id;
            if (favorites.includes(linkId)) {
                toggle.classList.add('is-favorite');
            } else {
                toggle.classList.remove('is-favorite');
            }
        });
    }

    function handleFavoriteClick(e) {
        e.stopPropagation(); // Prevent card click from triggering link navigation
        const linkId = e.target.closest('.link-item').dataset.id;
        if (favorites.includes(linkId)) {
            favorites = favorites.filter(id => id !== linkId);
        } else {
            favorites.push(linkId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderDynamicCategories();
    }

    function handleLinkClick(e) {
        const linkId = e.target.closest('.link-item').dataset.id;
        // Update recently used list
        recentlyUsed = [linkId, ...recentlyUsed.filter(id => id !== linkId)].slice(0, 5); // Keep last 5
        localStorage.setItem('recentlyUsed', JSON.stringify(recentlyUsed));
    }

    function addEventListenersToDynamicItems() {
        dynamicCategoriesContainer.querySelectorAll('.favorite-toggle').forEach(toggle => {
            toggle.addEventListener('click', handleFavoriteClick);
        });
        dynamicCategoriesContainer.querySelectorAll('.link-card').forEach(card => {
            card.addEventListener('click', handleLinkClick);
        });
        dynamicCategoriesContainer.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', handleCollapseToggle);
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let totalVisibleCards = 0;

        document.querySelectorAll('.category-section').forEach(category => {
            const linksInCategory = category.querySelectorAll('.link-item');
            let visibleLinksInCategory = 0;

            linksInCategory.forEach(item => {
                const cardText = item.querySelector('.link-card').textContent.toLowerCase();
                const hebrewSearchData = (item.querySelector('.link-card').dataset.hebrewSearch || '').toLowerCase();

                if (cardText.includes(searchTerm) || hebrewSearchData.includes(searchTerm)) {
                    item.style.display = 'flex';
                    visibleLinksInCategory++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (visibleLinksInCategory > 0) {
                category.style.display = 'block';
            } else {
                category.style.display = 'none';
            }
            totalVisibleCards += visibleLinksInCategory;
        });

        noResultsMessage.style.display = (totalVisibleCards === 0 && searchTerm !== '') ? 'block' : 'none';
    }

    function handleCollapseToggle(e) {
        const categorySection = e.target.closest('.category-section');
        const categoryId = categorySection.dataset.categoryId;
        if (!categoryId) return;

        categorySection.classList.toggle('collapsed');

        if (collapsedCategories.includes(categoryId)) {
            collapsedCategories = collapsedCategories.filter(id => id !== categoryId);
        } else {
            collapsedCategories.push(categoryId);
        }
        localStorage.setItem('collapsedCategories', JSON.stringify(collapsedCategories));
    }
    
    function setInitialCollapseState() {
        document.querySelectorAll('.category-section').forEach(section => {
            const categoryId = section.dataset.categoryId;
            if (categoryId && collapsedCategories.includes(categoryId)) {
                section.classList.add('collapsed');
            } else {
                section.classList.remove('collapsed');
            }
        });
    }

    // --- Initial Event Listeners Setup ---
    searchInput.addEventListener('input', performSearch);
    
    mainCategoriesContainer.querySelectorAll('.favorite-toggle').forEach(toggle => {
        toggle.addEventListener('click', handleFavoriteClick);
    });
    
    mainCategoriesContainer.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('click', handleLinkClick);
    });

    mainCategoriesContainer.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', handleCollapseToggle);
    });

    expandAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-section').forEach(s => s.classList.remove('collapsed'));
        collapsedCategories = [];
        localStorage.setItem('collapsedCategories', JSON.stringify(collapsedCategories));
    });
    
    collapseAllBtn.addEventListener('click', () => {
        const allCategoryIds = Array.from(document.querySelectorAll('.category-section')).map(s => s.dataset.categoryId);
        document.querySelectorAll('.category-section').forEach(s => s.classList.add('collapsed'));
        collapsedCategories = allCategoryIds;
        localStorage.setItem('collapsedCategories', JSON.stringify(collapsedCategories));
    });

    // --- Initial Render ---
    renderDynamicCategories();
    setInitialCollapseState();
});
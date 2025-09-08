// Map Filters and Live Updates
document.addEventListener('DOMContentLoaded', function() {
    // Map filter functionality
    const mapFilters = document.querySelectorAll('.map-filter');
    mapFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            mapFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            
            // Update map markers based on filter
            updateMapMarkers(filter.dataset.filter);
        });
    });

    // Initialize live updates
    initializeLiveUpdates();
});

function updateMapMarkers(filter) {
    // Example function to update map markers based on filter
    // This should be integrated with your existing map functionality
    console.log(`Updating map markers for filter: ${filter}`);
}

function initializeLiveUpdates() {
    const updatesContainer = document.getElementById('liveUpdates');
    
    // Example live updates data
    const updates = [
        {
            type: 'new-report',
            title: 'New Issue Reported',
            location: 'MG Road',
            time: '2 minutes ago',
            icon: 'exclamation-circle'
        },
        {
            type: 'resolved',
            title: 'Issue Resolved',
            location: 'JP Nagar',
            time: '15 minutes ago',
            icon: 'check-circle'
        },
        {
            type: 'in-progress',
            title: 'Work in Progress',
            location: 'Indiranagar',
            time: '1 hour ago',
            icon: 'tools'
        }
    ];

    // Populate live updates
    updates.forEach(update => {
        const updateElement = createUpdateElement(update);
        updatesContainer.appendChild(updateElement);
    });
}

function createUpdateElement(update) {
    const updateItem = document.createElement('div');
    updateItem.className = 'update-item';
    
    updateItem.innerHTML = `
        <div class="update-icon">
            <i class="fas fa-${update.icon}"></i>
        </div>
        <div class="update-content">
            <div class="update-title">${update.title}</div>
            <div class="update-location">${update.location}</div>
            <div class="update-time">${update.time}</div>
        </div>
    `;
    
    return updateItem;
}

// Add smooth hover effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

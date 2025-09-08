// DOM Elements
const reportForm = document.getElementById('reportForm');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const photoInput = document.getElementById('photo');
const imagePreview = document.getElementById('imagePreview');
const locationBtn = document.getElementById('locationBtn');
const locationDisplay = document.getElementById('locationDisplay');
const reportsList = document.getElementById('reportsList');

// Get all option, category and urgency buttons
const optionButtons = document.querySelectorAll('.option-button');
const categoryButtons = document.querySelectorAll('.category-button');
const urgencyButtons = document.querySelectorAll('.urgency-button');
const tagButtons = document.querySelectorAll('.tag-button');
const issueCategoriesSection = document.getElementById('issueCategoriesSection');
const suggestionSection = document.getElementById('suggestionSection');
const feedbackSection = document.getElementById('feedbackSection');

// State
let currentLocation = null;
let map = null;
let markers = [];

// Initialize Map
function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Initialize the application
// Setup tag buttons
function setupTagButtons() {
    tagButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle selected class on the clicked button
            button.classList.toggle('selected');
            
            // Store selected tags in the form data
            const selectedTags = Array.from(button.closest('.suggestion-tags')
                .querySelectorAll('.tag-button.selected'))
                .map(btn => btn.dataset.tag);
            
            if (selectedTags.length > 0) {
                reportForm.dataset.selectedTags = JSON.stringify(selectedTags);
            } else {
                delete reportForm.dataset.selectedTags;
            }
        });
    });
}

function init() {
    initMap();
    loadReports();
    setupEventListeners();
    setupOptionButtons();
    setupCategoryButtons();
    setupUrgencyButtons();
    setupTagButtons();
}

// Setup option buttons
function setupOptionButtons() {
    optionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            button.classList.add('selected');
            // Store the selected action
            reportForm.dataset.selectedAction = button.dataset.action;
            
            // Hide all sections first
            issueCategoriesSection.classList.remove('visible');
            suggestionSection.classList.remove('visible');
            feedbackSection.classList.remove('visible');

            // Show appropriate section based on selection
            switch (button.dataset.action) {
                case 'report-issue':
                    issueCategoriesSection.classList.add('visible');
                    break;
                case 'suggest-improvement':
                    suggestionSection.classList.add('visible');
                    break;
                case 'give-feedback':
                    feedbackSection.classList.add('visible');
                    break;
            }

            // Clear selections when switching
            categoryButtons.forEach(btn => btn.classList.remove('selected'));
            tagButtons.forEach(btn => btn.classList.remove('selected'));
            delete reportForm.dataset.selectedCategory;
            delete reportForm.dataset.selectedTags;
        });
    });
}

// Setup category buttons
function setupCategoryButtons() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            button.classList.add('selected');
            // Store the selected category
            reportForm.dataset.selectedCategory = button.dataset.category;
        });
    });
}

// Setup urgency buttons
function setupUrgencyButtons() {
    urgencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            urgencyButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            button.classList.add('selected');
            // Store the selected urgency
            reportForm.dataset.urgencyLevel = button.dataset.urgency;
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    reportForm.addEventListener('submit', handleSubmitReport);
    photoInput.addEventListener('change', handlePhotoPreview);
    locationBtn.addEventListener('click', captureLocation);
}

// Handle Photo Preview
function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// Capture Location
function captureLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    locationBtn.textContent = '📍 Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            locationDisplay.textContent = 
                `Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
            
            // Update map view
            map.setView([currentLocation.lat, currentLocation.lng], 15);
            
            // Add marker
            L.marker([currentLocation.lat, currentLocation.lng])
                .addTo(map)
                .bindPopup('Your current location')
                .openPopup();

            locationBtn.textContent = '📍 Location Captured';
        },
        (error) => {
            alert(`Error getting location: ${error.message}`);
            locationBtn.textContent = '📍 Capture Location';
        }
    );
}

// Handle Report Submission
async function handleSubmitReport(e) {
    e.preventDefault();

    if (!currentLocation) {
        alert('Please capture your location first');
        return;
    }

    const formData = new FormData();
    formData.append('category', categorySelect.value);
    formData.append('description', descriptionInput.value);
    formData.append('location', JSON.stringify(currentLocation));
    
    if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
    }

    // For demo, we'll just create an object and store in localStorage
    const report = {
        id: Date.now(),
        category: categorySelect.value,
        description: descriptionInput.value,
        location: currentLocation,
        photo: imagePreview.innerHTML ? imagePreview.querySelector('img').src : null,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.unshift(report);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Update UI
    addReportToMap(report);
    addReportToList(report);

    // Reset form
    reportForm.reset();
    imagePreview.innerHTML = '';
    locationDisplay.textContent = '';
    currentLocation = null;
    locationBtn.textContent = '📍 Capture Location';

    alert('Report submitted successfully!');
}

// Add Report to Map
function addReportToMap(report) {
    const marker = L.marker([report.location.lat, report.location.lng])
        .addTo(map)
        .bindPopup(`
            <strong>${report.category}</strong><br>
            ${report.description}<br>
            <em>Status: ${report.status}</em>
        `);
    markers.push(marker);
}

// Add Report to List
function addReportToList(report) {
    const reportElement = document.createElement('div');
    reportElement.className = 'report-card';
    
    const date = new Date(report.timestamp).toLocaleDateString();
    
    reportElement.innerHTML = `
        ${report.photo ? `<img src="${report.photo}" alt="Report photo">` : ''}
        <span class="report-status status-${report.status}">${report.status}</span>
        <h3>${report.category}</h3>
        <p>${report.description}</p>
        <small>Reported on: ${date}</small>
    `;

    reportsList.insertBefore(reportElement, reportsList.firstChild);
}

// Load Reports from Storage
function loadReports() {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.forEach(report => {
        addReportToMap(report);
        addReportToList(report);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

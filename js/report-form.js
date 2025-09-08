// Report Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const reportForm = document.getElementById('reportForm');
    const progressSteps = document.querySelectorAll('.progress-step');
    const categoryItems = document.querySelectorAll('.category-item');
    const urgencyOptions = document.querySelectorAll('.urgency-option');
    const mediaPreviewGrid = document.getElementById('mediaPreviewGrid');
    const mapPreview = document.getElementById('mapPreview');
    let currentStep = 0;
    let map = null;
    let marker = null;

    // Initialize Map
    function initMap() {
        if (!map && mapPreview) {
            map = L.map(mapPreview).setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }
    }

    // Category Selection
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove selection from other items
            categoryItems.forEach(i => i.classList.remove('selected'));
            // Add selection to clicked item
            item.classList.add('selected');
            // Update hidden input
            document.getElementById('category').value = item.dataset.category;
            // Move to next step
            updateStep(1);
        });
    });

    // Urgency Selection
    urgencyOptions.forEach(option => {
        option.addEventListener('click', () => {
            urgencyOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            document.getElementById('urgency').value = option.dataset.value;
        });
    });

    // Media Upload Handling
    ['photo', 'video', 'audio'].forEach(type => {
        const input = document.getElementById(type);
        const uploadBox = document.getElementById(`${type}Upload`);

        uploadBox.addEventListener('click', () => input.click());
        input.addEventListener('change', handleMediaUpload);
    });

    function handleMediaUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = createMediaPreview(e.target.result, file.type, file.name);
                mediaPreviewGrid.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    function createMediaPreview(src, type, name) {
        const div = document.createElement('div');
        div.className = 'media-preview fade-in';

        if (type.startsWith('image/')) {
            div.innerHTML = `
                <img src="${src}" alt="${name}">
                <button class="remove-media" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (type.startsWith('video/')) {
            div.innerHTML = `
                <video src="${src}" controls></video>
                <button class="remove-media" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (type.startsWith('audio/')) {
            div.innerHTML = `
                <audio src="${src}" controls></audio>
                <button class="remove-media" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        return div;
    }

    // Location Handling
    document.getElementById('locationBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        showToast('Getting your location...', 'info');
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                updateMap(latitude, longitude);
                document.getElementById('locationDisplay').textContent = 
                    `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            },
            error => {
                showToast('Error getting location: ' + error.message, 'error');
            }
        );
    });

    document.getElementById('mapPickerBtn').addEventListener('click', () => {
        initMap();
        if (map) {
            map.on('click', (e) => {
                updateMap(e.latlng.lat, e.latlng.lng);
            });
        }
    });

    function updateMap(lat, lng) {
        if (!map) initMap();
        
        if (marker) map.removeLayer(marker);
        
        marker = L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 15);
        
        // Update hidden inputs
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
    }

    // Progress Steps
    function updateStep(step) {
        progressSteps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('completed');
                s.classList.remove('active');
            } else if (index === step) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active', 'completed');
            }
        });
        currentStep = step;
    }

    // Form Submission
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const submitButton = reportForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            // Here you would normally send the data to your backend
            await simulateSubmission();
            
            showToast('Report submitted successfully!', 'success');
            reportForm.reset();
            mediaPreviewGrid.innerHTML = '';
            if (marker) map.removeLayer(marker);
            updateStep(0);
            
            // Close modal if exists
            const modal = document.querySelector('.modal');
            if (modal) modal.style.display = 'none';
        } catch (error) {
            showToast('Error submitting report: ' + error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
        }
    });

    function validateForm() {
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const urgency = document.getElementById('urgency').value;
        const location = document.getElementById('latitude').value;

        return category && description && urgency && location;
    }

    // Simulate API call
    function simulateSubmission() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} slide-up`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
});

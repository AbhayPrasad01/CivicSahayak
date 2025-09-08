// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
                
                // Request notification permission
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        console.log('Notification permission granted');
                    }
                });
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Background Sync Setup
async function registerBackgroundSync() {
    try {
        await navigator.serviceWorker.ready;
        await navigator.serviceWorker.sync.register('sync-reports');
    } catch (err) {
        console.log('Background sync registration failed:', err);
    }
}

// App Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if available
    const installButton = document.getElementById('installApp');
    if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                installButton.style.display = 'none';
            }
        });
    }
});

// Handle offline/online status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    showToast('Back online');
    registerBackgroundSync();
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    showToast('You are offline. Changes will be saved and synced when you\'re back online.');
});

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} slide-up`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize App Features
document.addEventListener('DOMContentLoaded', () => {
    // Enable offline support
    if ('serviceWorker' in navigator) {
        registerBackgroundSync();
    }
    
    // Initialize dynamic imports
    initializeDynamicImports();
    
    // Set up lazy loading
    setupLazyLoading();
    
    // Initialize web components
    initializeWebComponents();
});

// Dynamic imports for better performance
async function initializeDynamicImports() {
    if (document.querySelector('.map-container')) {
        const { initMap } = await import('./js/map.js');
        initMap();
    }
    
    if (document.querySelector('.chart-container')) {
        const { initCharts } = await import('./js/charts.js');
        initCharts();
    }
}

// Lazy loading images
function setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
        script.async = true;
        script.onload = () => {
            const observer = lozad();
            observer.observe();
        };
        document.body.appendChild(script);
    }
}

// Web Components
function initializeWebComponents() {
    class CustomCard extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: 'open'});
            const card = document.createElement('div');
            card.setAttribute('class', 'custom-card');
            
            const style = document.createElement('style');
            style.textContent = `
                .custom-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }
                .custom-card:hover {
                    transform: translateY(-5px);
                }
            `;
            
            shadow.appendChild(style);
            shadow.appendChild(card);
            card.innerHTML = this.innerHTML;
        }
    }
    
    customElements.define('custom-card', CustomCard);
}

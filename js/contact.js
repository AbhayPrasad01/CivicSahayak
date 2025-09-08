// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');

    // Form submission handler
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Here you would typically send the data to your backend
        // For now, we'll just simulate a successful submission
        simulateFormSubmission(formData);
    });

    // Close modal when clicking the close button
    closeModal.addEventListener('click', function() {
        successModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Simulate form submission with a delay
    function simulateFormSubmission(formData) {
        // Add loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Simulate API call
        setTimeout(() => {
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // Show success modal
            successModal.style.display = 'block';
            
            // Log form data to console (for development)
            console.log('Form submitted with data:', formData);
        }, 1500);
    }

    // Form validation
    function validateForm() {
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else if (input.type === 'email' && input.value.trim()) {
                if (!isValidEmail(input.value.trim())) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                } else {
                    removeError(input);
                }
            } else {
                removeError(input);
            }
        });

        return isValid;
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show error message
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = 'var(--error-color)';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            formGroup.appendChild(errorDiv);
        }
        
        input.style.borderColor = 'var(--error-color)';
    }

    // Remove error message
    function removeError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.remove();
        }
        
        input.style.borderColor = 'var(--border-color)';
    }

    // Real-time validation
    contactForm.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (input.required && !input.value.trim()) {
                showError(input, 'This field is required');
            } else if (input.type === 'email' && input.value.trim()) {
                if (!isValidEmail(input.value.trim())) {
                    showError(input, 'Please enter a valid email address');
                } else {
                    removeError(input);
                }
            } else {
                removeError(input);
            }
        });

        input.addEventListener('input', function() {
            if (input.value.trim()) {
                removeError(input);
            }
        });
    });
});

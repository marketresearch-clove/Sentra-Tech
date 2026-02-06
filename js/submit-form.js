function initSubmitContact() {
    $('#contactForm').on('submit', async function (event) {
        event.preventDefault();

        var $form = $('#contactForm');
        var $submitButton = $form.find('button[type="submit"]');
        var originalButtonHtml = $submitButton.html();
        var isSubmitting = $submitButton.prop('disabled');

        if (isSubmitting) {
            return;
        }

        var $email = $('#email');
        var $message = $('#message');
        var $successMessage = $('#success-message');
        var $errorMessage = $('#error-message');
        var $firstName = $('#first-name');
        var $lastName = $('#last-name');
        var $subject = $('#subject');

        function validateEmail(email) {
            var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return pattern.test(email);
        }

        if (!validateEmail($email.val()) || !$message.val().trim()) {
            $errorMessage.removeClass('hidden');
            $successMessage.addClass('hidden');

            setTimeout(function () {
                $errorMessage.addClass('hidden');
            }, 3000);

            return;
        }

        $submitButton.prop('disabled', true).text('Sending...');

        try {
            // Use configurable API URL (supports separate backend domain)
            const apiUrl = window.__API_URL__ || (
                window.location.hostname.includes('netlify.app')
                    ? 'https://api.yourdomain.com'  // Replace with actual backend domain
                    : ''
            );

            const contactEndpoint = apiUrl + '/api/contact';

            var response = await fetch(contactEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: $firstName.val().trim(),
                    lastName: $lastName.val().trim(),
                    email: $email.val().trim(),
                    subject: $subject.val().trim(),
                    message: $message.val().trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact form');
            }

            $errorMessage.addClass('hidden');
            $successMessage.removeClass('hidden');
            $form[0].reset();

            setTimeout(function () {
                $successMessage.addClass('hidden');
            }, 3000);
        } catch (error) {
            $errorMessage.removeClass('hidden');
            $successMessage.addClass('hidden');

            setTimeout(function () {
                $errorMessage.addClass('hidden');
            }, 3000);
        } finally {
            $submitButton.prop('disabled', false).html(originalButtonHtml);
        }
    });
}

function initSubmitNewsletter() {
    $('#newsletterForm').on('submit', function (event) {
        event.preventDefault();

        var $email = $('#newsletter-email');
        var $successMessage = $('#newsletter-success');
        var $errorMessage = $('#newsletter-error');
        var $errorText = $email.next('.error-text');

        var isValid = true;

        function validateEmail(email) {
            var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return pattern.test(email);
        }

        if (!$email.val().trim()) {
            $email.addClass('error-border');
            $errorText.removeClass('hidden').text('This field is required');
            isValid = false;
        } else if (!validateEmail($email.val())) {
            $email.addClass('error-border');
            $errorText.text('Invalid email format').removeClass('hidden');
            isValid = false;
        } else {
            $email.removeClass('error-border');
            $errorText.addClass('hidden');
        }

        if (isValid) {
            $successMessage.removeClass('hidden');
            $('#newsletterForm')[0].reset();
            setTimeout(function () {
                $successMessage.addClass('hidden');
            }, 3000);
        } else {
            $errorMessage.removeClass('hidden');
            $('#newsletterForm')[0].reset();
            setTimeout(function () {
                $errorMessage.addClass('hidden');
            }, 3000);
        }
    });
}
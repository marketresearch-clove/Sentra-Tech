// Chatbot Widget Loader
// This script loads the chatbot HTML and inserts it into the page

(function() {
    // Function to load chatbot HTML
    function loadChatbot() {
        fetch('../chatbot.html')
            .then(response => response.text())
            .then(html => {
                // Insert the chatbot HTML into the body
                document.body.insertAdjacentHTML('beforeend', html);

                // Load the chatbot script after inserting HTML
                const script = document.createElement('script');
                script.src = '../js/chatbot.js';
                document.body.appendChild(script);
            })
            .catch(error => {
                console.error('Error loading chatbot:', error);
            });
    }

    // Load chatbot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadChatbot);
    } else {
        loadChatbot();
    }
})();
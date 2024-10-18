const sendNotification = async (message, log_type = "info") => {
    let topic = 'byu_ecommerce_logs';
    try {
        let headers = {
            'Content-Type': 'text/plain',
            'Title': 'Notification',
            'Priority': 'normal',
            'Tags': 'info'
        };

        const formattedMessage = `Message: ${message}\n\nDate: ${new Date().toLocaleString()}`;

        switch (log_type) {
            case 'system_error':
                const errorStack = message.stack.split('\n');
                const errorMessage = errorStack[0].trim();
                const errorLocation = errorStack[1].trim();

                message = `Error Message: ${errorMessage}\n\nLocation: ${errorLocation}\n\nDate: ${new Date().toLocaleString()}`;

                headers.Title = 'System Error';
                headers.Priority = 'high';
                headers.Tags = 'error,bug';
                topic = 'byu_ecommerce_errors';
                break;

            default:
                message = formattedMessage; 
                headers.Title = 'Information';
                headers.Priority = 'low';
                headers.Tags = 'info';
                break;
        }

        const response = await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: message,
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.text();
        return console.log('Notification sent:', data);
    } catch (error) {
        return console.error('Error sending notification:', error);
    }
};

module.exports = sendNotification;

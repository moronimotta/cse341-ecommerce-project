const dotenv = require('dotenv');
dotenv.config();
const sendNotification = async (admin_message,log_type = "info") => {
    if (process.env.ENV !== 'production') {
        return 
    }

    let topic = 'byu_ecommerce_logs';
    try {
        let headers = {
            'Content-Type': 'text/plain',
            'Title': 'Notification',
            'Priority': 'normal',
            'Tags': 'info'
        };

        switch (log_type) {
            case 'system_error':
                const errorStack = admin_message.stack.split('\n');
                const errorMessage = errorStack[0].trim();
                const errorLocation = errorStack[1].trim();

                admin_message = `Error Message: ${errorMessage}\n\nLocation: ${errorLocation}\n\nDate: ${new Date().toLocaleString()}`;

                headers.Title = 'System Error';
                headers.Priority = 'high';
                headers.Tags = 'error,bug';
                topic = 'byu_ecommerce_errors';
                break;
        }

        let response = await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: admin_message,
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

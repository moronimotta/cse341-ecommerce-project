const dotenv = require('dotenv');
dotenv.config();
const sendNotification = async (admin_message,log_type = "info", manager_message,  manager_topic) => {
    if (process.env.ENV !== 'production') {
        return 
    }

    // TODO: when implementing the authorization, use req.user.store_id to build the topic = `byu_ecommerce_store_${req.user.store_id}`

    let topic = 'byu_ecommerce_logs';
    try {
        let headers = {
            'Content-Type': 'text/plain',
            'Title': 'Notification',
            'Priority': 'normal',
            'Tags': 'info'
        };

        const formattedMessage = `Message: ${admin_message}\n\nDate: ${new Date().toLocaleString()}`;

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

            default:
                admin_message = formattedMessage; 
                headers.Title = 'Information';
                headers.Priority = 'low';
                headers.Tags = 'info';
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

        // if (manager_message) {
        //     headers.Title = 'Manager Notification';
        //     headers.Tags = 'manager';
        //     response = await fetch(`https://ntfy.sh/${manager_topic}`, {
        //         method: 'POST',
        //         body: manager_message,
        //         headers: headers
        //     });

        //     if (!response.ok) {
        //         throw new Error(`Error: ${response.statusText}`);
        //     }
        // }

        const data = await response.text();
        return console.log('Notification sent:', data);
    } catch (error) {
        return console.error('Error sending notification:', error);
    }
};

module.exports = sendNotification;

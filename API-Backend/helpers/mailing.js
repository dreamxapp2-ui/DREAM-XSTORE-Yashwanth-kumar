// //helpers/mailing.js

// const axios = require('axios');
// const MAILSERVER_URL = process.env.MAILSERVER_URL;
// const url = new URL(MAILSERVER_URL);

// async function SendMail(content, subject,ToEmail) {
//     try {
//         url.searchParams.append('companyEmail', ToEmail);
//         const response = await axios.post(url.toString(), { 
//             "content": content,
//             "subject": subject 
//         });
//         return true;
//     } catch (error) {
//         console.error('Error sending mail:', error);
//         throw {
//             success: false,
//             error: 'Failed to send mail',
//             details: error.message
//         };
//     }
// }

// module.exports = {
//     SendMail
// };
//helpers/mailing.js

const axios = require('axios');
const MAILSERVER_URL = process.env.MAILSERVER_URL;
// <-- Do NOT create the URL object here.

async function SendMail(content, subject, ToEmail) {
    try {
        // --- FIX ---
        // Create the new URL object *inside* the function.
        // This creates a clean URL for every request.
        const url = new URL(MAILSERVER_URL);
        url.searchParams.append('companyEmail', ToEmail);
        
        const response = await axios.post(url.toString(), { 
            "content": content,
            "subject": subject 
        });

        // Check if Google's script was successful (if it returns a JSON object)
        if (response.data && response.data.success === false) {
             throw new Error(response.data.error || 'Google Script reported an error');
        }

        return true;
        
    } catch (error) {
        // Log more helpful error info from axios
        const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Error sending mail:', errorDetails);
        
        throw {
            success: false,
            error: 'Failed to send mail',
            details: errorDetails
        };
    }
}

module.exports = {
    SendMail
};
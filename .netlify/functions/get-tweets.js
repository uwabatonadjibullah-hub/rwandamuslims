// Netlify functions run in Node.js securely on the server
// This prevents your X_BEARER_TOKEN from being exposed to the public

exports.handler = async function(event, context) {
    const username = 'islamrwanda';
    
    // We use the recent search endpoint to easily get tweets by username
    // The minimum max_results for search is 10, but we will slice the top 3 later
    const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${username}&max_results=10&tweet.fields=created_at`;

    try {
        // Native fetch is available in Node.js 18+ (Default in Netlify)
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Twitter API error: ${response.status} ${response.statusText}`);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Twitter API error' })
            };
        }

        const data = await response.json();
        
        // Extract the data array and grab only the latest 3 tweets
        const tweets = data.data ? data.data.slice(0, 3) : [];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Allows your frontend to talk to this function without CORS issues
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify(tweets)
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

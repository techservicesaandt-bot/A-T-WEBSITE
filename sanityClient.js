const SANITY_PROJECT_ID = 'g1byryuz';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = 'v2023-01-01';

async function fetchSanity(query) {
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.result;
    } catch (err) {
        console.error('Error fetching from Sanity:', err);
        return null;
    }
}

// Helper to convert Sanity Image _ref to a valid URL
function buildSanityImageUrl(imageObj) {
    if (!imageObj || !imageObj.asset || !imageObj.asset._ref) return '';
    // Example ref: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
    const ref = imageObj.asset._ref;
    const parts = ref.split('-');
    if (parts.length !== 4) return '';
    const id = parts[1];
    const dimensions = parts[2];
    const format = parts[3];
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
}

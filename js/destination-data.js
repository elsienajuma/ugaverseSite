(function (global) {
    const pageBase = window.location.href;

    function isExternalPath(path) {
        return !path || /^(https?:)?\/\//i.test(path) || path.startsWith('data:');
    }

    function resolveAssetPath(path) {
        if (!path) return '';
        if (isExternalPath(path)) return path;
        if (path.startsWith('/')) {
            return path.replace(/^\/+/, '');
        }
        return new URL(path, pageBase).toString();
    }

    function normalizeDestination(destination) {
        const gallery = Array.isArray(destination.gallery) && destination.gallery.length
            ? destination.gallery
            : (Array.isArray(destination.images) ? destination.images : []);

        const videos = Array.isArray(destination.videos) && destination.videos.length
            ? destination.videos
            : (destination.immersive && Array.isArray(destination.immersive.videos) ? destination.immersive.videos : []);

        const panoramaItems = Array.isArray(destination.panorama)
            ? destination.panorama
            : (Array.isArray(destination.panorama?.images)
                ? destination.panorama.images
                : (destination.immersive && Array.isArray(destination.immersive.images) ? destination.immersive.images : []));

        const mapEmbed = destination.map?.embed || destination.mapEmbed || destination.map || '';
        const contact = destination.contact || {
            email: destination.email || '',
            phone: destination.phoneContact || destination.phone || '',
            whatsapp: destination.whatsappContact || destination.whatsapp || '',
            detailsUrl: destination.detailsUrl || ''
        };

        return {
            ...destination,
            category: destination.category || 'Destination',
            coverImage: destination.coverImage || destination.image || gallery[0] || (destination.immersive?.file || ''),
            gallery,
            videos,
            panorama: panoramaItems,
            mapEmbed,
            contact
        };
    }

    function getDestinationById(destinations, id) {
        const requestedId = String(id || '').trim().toLowerCase();
        if (!requestedId) return null;
        return (destinations || []).find((destination) => String(destination.id || '').trim().toLowerCase() === requestedId) || null;
    }

    async function loadDestinations() {
        const response = await fetch(resolveAssetPath('data/destinations.json'));
        if (!response.ok) {
            throw new Error('Unable to load destination data.');
        }
        const payload = await response.json();
        return (payload.destinations || []).map(normalizeDestination);
    }

    global.UgaverseData = {
        resolveAssetPath,
        normalizeDestination,
        getDestinationById,
        loadDestinations
    };
})(window);

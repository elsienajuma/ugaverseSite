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
        const experiences = destination.experiences || {};
        const flatVideoExperience = experiences.flatVideo || destination.flatVideo || {};
        const video360Experience = experiences.video360 || {};
        const panorama360Experience = experiences.panorama360 || {};

        const gallery = Array.isArray(destination.gallery) && destination.gallery.length
            ? destination.gallery
            : (Array.isArray(destination.images) ? destination.images : []);

        const rawVideos = Array.isArray(destination.videos) && destination.videos.length
            ? destination.videos
            : (Array.isArray(video360Experience.scenes) && video360Experience.scenes.length
                ? video360Experience.scenes
                : (destination.immersive && Array.isArray(destination.immersive.videos) ? destination.immersive.videos : []));

        const rawPanoramaItems = Array.isArray(destination.panorama) && destination.panorama.length
            ? destination.panorama
            : (Array.isArray(panorama360Experience.scenes) && panorama360Experience.scenes.length
                ? panorama360Experience.scenes
                : (Array.isArray(destination.panorama?.images)
                    ? destination.panorama.images
                    : (destination.immersive && Array.isArray(destination.immersive.images) ? destination.immersive.images : [])));

        const videos = rawVideos.map(item => ({
            ...item,
            mobile: item.mobile || item.src || item.file || '',
            desktop: item.desktop || item.src || item.file || ''
        }));

        const panoramaItems = rawPanoramaItems.map(item => ({
            ...item,
            file: item.file || item.src || ''
        }));

        const flatVideos = Array.isArray(destination.flatVideos) && destination.flatVideos.length
            ? destination.flatVideos
            : (Array.isArray(flatVideoExperience.items)
                ? flatVideoExperience.items
                : (flatVideoExperience.src ? [flatVideoExperience] : []));

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
            flatVideos,
            videos,
            panorama: panoramaItems,
            webgl: experiences.webgl || destination.webgl || null,
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

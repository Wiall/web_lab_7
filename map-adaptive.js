document.addEventListener('DOMContentLoaded', function () {
    const image = document.getElementById('recipeImg');
    const areas = document.querySelectorAll('.map-area');

    const originalCoordsLarge = [
        [50, 50, 160, 150],
        [180, 50, 320, 150],
        [340, 50, 500, 150],
        [535, 50, 700, 150]
    ];

    const originalCoordsMobile = [
        [25, 25, 70, 65],
        [100, 25, 165, 65],
        [185, 25, 255, 65],
        [270, 25, 350, 65]
    ];

    function resizeMap() {
        const imgWidth = image.offsetWidth;
        const windowWidth = window.innerWidth;
        
        if (windowWidth > 768) {
            const originalWidth = 768;
            const scaleFactor = imgWidth / originalWidth;

            areas.forEach((area, index) => {
                const newCoords = originalCoordsLarge[index].map(coord => Math.round(coord * scaleFactor));
                area.coords = newCoords.join(',');
            });
        } 
        else {
            const originalWidth = 360;
            const scaleFactor = imgWidth / originalWidth;

            areas.forEach((area, index) => {
                const newCoords = originalCoordsMobile[index].map(coord => Math.round(coord * scaleFactor));
                area.coords = newCoords.join(',');
            });
        }
    }

    window.addEventListener('resize', resizeMap);
    resizeMap();
});

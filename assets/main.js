window.onload = function() {
    const images = document.querySelectorAll('img');
    const imageCount = images.length;
    let loadedCount = 0;

    for (let i = 0; i < imageCount; i++) {
        const img = new Image();
        img.onload = function() {
            loadedCount++;
        }
        img.src = images[i].src;
    }
}

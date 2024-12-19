
function renderGel(barcodes) {
    const gel = document.getElementById('gel');
    gel.innerHTML = '';
    barcodes.forEach((barcode, index) => {
        const bandEl = document.createElement('div');
        bandEl.className = 'gel-band';
        bandEl.style.width = `${100 - index * 20}px`;
        bandEl.style.top = `${50 + index * 30}px`;
        bandEl.style.left = '50px';
        bandEl.dataset.id = barcode.id;
        gel.appendChild(bandEl);
    });
}

module.exports = { renderGel };

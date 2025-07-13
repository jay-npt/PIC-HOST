// Background slideshow
const bgImages = document.querySelectorAll('.bg-slideshow img');
let currentBg = 0;

function changeBackground() {
    bgImages[currentBg].style.opacity = 0;
    currentBg = (currentBg + 1) % bgImages.length;
    bgImages[currentBg].style.opacity = 1;
}

// Set first image to visible
bgImages[0].style.opacity = 1;
setInterval(changeBackground, 5000);

// Click sound effect
const clickSound = document.getElementById('clickSound');

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// Welcome screen
const welcomeScreen = document.getElementById('welcomeScreen');
const exploreBtn = document.getElementById('exploreBtn');

exploreBtn.addEventListener('click', () => {
    playClickSound();
    welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
    }, 500);
});

// Hamburger menu
const hamburgerMenu = document.getElementById('hamburgerMenu');
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');

menuBtn.addEventListener('click', (e) => {
    playClickSound();
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    menuDropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
    if (menuDropdown.classList.contains('active')) {
        menuBtn.classList.remove('active');
        menuDropdown.classList.remove('active');
    }
});

// Drag and drop functionality
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const resultDiv = document.getElementById('result');
const imageUrl = document.getElementById('imageUrl');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const uploadCount = document.getElementById('uploadCount');
const adContainer = document.getElementById('adContainer');
const skipAdBtn = document.getElementById('skipAdBtn');

// Add click sound to all buttons
document.querySelectorAll('button, a[href]').forEach(button => {
    button.addEventListener('click', () => {
        playClickSound();
    });
});

// Load history from localStorage
let uploadHistory = JSON.parse(localStorage.getItem('picHostHistory')) || [];
updateHistoryDisplay();

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection via button
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFiles(fileInput.files);
    }
});

function handleFiles(files) {
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Please upload an image file (PNG, JPG, JPEG)');
        return;
    }
    
    // Check file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit');
        return;
    }
    
    uploadFile(file);
}

function uploadFile(file) {
    loading.style.display = 'block';
    resultDiv.style.display = 'none';
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', 'b2c781c4a6d675a6f29f2d2cf4e36ac6');
    
    fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const imageUrlValue = data.data.url;
            imageUrl.href = imageUrlValue;
            imageUrl.textContent = imageUrlValue;
            resultDiv.style.display = 'block';
            
            // Add to history
            const newItem = {
                url: imageUrlValue,
                date: new Date().toLocaleString(),
                preview: data.data.display_url
            };
            
            uploadHistory.unshift(newItem);
            
            // Save to localStorage
            localStorage.setItem('picHostHistory', JSON.stringify(uploadHistory));
            
            // Update history display
            updateHistoryDisplay();
            
            // Show ad after upload
            showAd();
        } else {
            alert('Upload failed: ' + (data.error?.message || 'Unknown error'));
        }
    })
    .catch(error => {
        alert('Upload error: ' + error.message);
    })
    .finally(() => {
        loading.style.display = 'none';
        fileInput.value = ''; // Reset file input
    });
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    uploadCount.textContent = `${uploadHistory.length} image${uploadHistory.length !== 1 ? 's' : ''}`;
    
    uploadHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const itemContent = document.createElement('div');
        itemContent.className = 'history-item-content';
        
        const previewImg = document.createElement('img');
        previewImg.className = 'history-item-preview';
        previewImg.src = item.preview || 'https://via.placeholder.com/50';
        previewImg.alt = 'Preview';
        
        const itemDetails = document.createElement('div');
        itemDetails.className = 'history-item-details';
        
        const link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.url;
        link.target = '_blank';
        
        const date = document.createElement('div');
        date.className = 'history-item-date';
        date.textContent = item.date;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(item.url)
                .then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        };
        
        itemDetails.appendChild(link);
        itemDetails.appendChild(date);
        itemContent.appendChild(previewImg);
        itemContent.appendChild(itemDetails);
        historyItem.appendChild(itemContent);
        historyItem.appendChild(copyBtn);
        historyList.appendChild(historyItem);
    });
}

function showAd() {
    adContainer.style.display = 'block';
    // Scroll to ad
    adContainer.scrollIntoView({ behavior: 'smooth' });
}

skipAdBtn.addEventListener('click', () => {
    adContainer.style.display = 'none';
});

// Copy URL button
copyUrlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(imageUrl.textContent)
        .then(() => {
            copyUrlBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyUrlBtn.textContent = 'Copy';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
});

// Initialize with any existing history
updateHistoryDisplay();
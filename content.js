// Global variables
let storeArray = [];
let seenStores = new Set();
let isScrolling = false;
let scrollInterval;

// Helper function to remove "GET" from store name
function removeGETFromStoreName(storeName) {
    return storeName.replace(/GET$/, '').trim();
}

// Helper function to encode CSV data
function encodeCSV(str) {
    return '\uFEFF' + encodeURIComponent(str);
}

const storeInfo = () => {
    const storeContainers = document.querySelectorAll('div.UaQhfb.fontBodyMedium');

    storeContainers.forEach(container => {
        let storeName = container.querySelector('.qBF1Pd.fontHeadlineSmall')?.textContent.trim();
        const phoneNumber = container.querySelector('span.UsdlK')?.textContent.trim();
        
        // Updated address and category extraction
        const addressElement = container.querySelector('.W4Efsd:nth-child(1)');
        let fullAddress = addressElement ? addressElement.textContent.trim() : 'Bilgi bulunamadı';
        
        // Remove wheelchair icon if present
        fullAddress = fullAddress.replace(/^[^\w\d]*/, '');
        
        const [category, address] = fullAddress.split('·').map(item => item.trim());
        
        storeName = removeGETFromStoreName(storeName);

        // Extract rating information
        const ratingElement = container.querySelector('.ZkP5Je');
        let rating = 'N/A';
        let reviewCount = 'N/A';
        if (ratingElement) {
            const ratingText = ratingElement.textContent.trim();
            const ratingMatch = ratingText.match(/(\d+(?:,\d+)?)\s*(\([^)]+\))?/);
            if (ratingMatch) {
                rating = ratingMatch[1].replace(',', '.');
                reviewCount = ratingMatch[2] ? ratingMatch[2].replace(/[()]/g, '') : 'N/A';
            }
        }

        if (storeName && phoneNumber) {
            const storeKey = `${storeName} | ${phoneNumber}`;
        
            if (!seenStores.has(storeKey)) {
                storeArray.push({
                    category: category || 'Belirsiz',
                    storeName: storeName,
                    phoneNumber: phoneNumber,
                    address: address || fullAddress,
                    rating: rating,
                    reviewCount: reviewCount
                });
                seenStores.add(storeKey);
            }
        }
    });

    console.log(storeArray);
}

const downloadCSV = () => {
    let csvContent = "Kategori,Mağaza Adı,Telefon Numarası,Adres,Puanlama\n"; 

    storeArray.forEach(store => {
        csvContent += `${store.category},${store.storeName},${store.phoneNumber},${store.address},${store.rating} (${store.reviewCount})\n`;
    });

    const encodedUri = encodeCSV(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
    link.setAttribute("download", "magaza_bilgileri.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const addFilterForm = () => {
    const body = document.querySelector('body.LoJzbe');
    
    if (body && !document.getElementById('filterForm')) {
        const filterForm = document.createElement('div');
        filterForm.id = 'filterForm';
        filterForm.style.cssText = `
            position: fixed;
            top: 130px;
            right: 10px;
            z-index: 1000;
            padding: 5px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 150px;
        `;

        filterForm.innerHTML = `
            <input type="text" id="product" placeholder="Aranacak Kelime" style="margin-bottom: 3px; width: 100%; font-size: 12px;">
            <input type="text" id="city" placeholder="İl" style="margin-bottom: 3px; width: 100%; font-size: 12px;">
            <input type="text" id="district" placeholder="İlçe" style="margin-bottom: 3px; width: 100%; font-size: 12px;">
            <input type="text" id="neighborhood" placeholder="Mahalle" style="margin-bottom: 3px; width: 100%; font-size: 12px;">
        `;

        body.appendChild(filterForm);
    }
};

const addCSVButton = () => {
    const body = document.querySelector('body.LoJzbe');
    
    if (body && !document.getElementById('csvButton')) {
        const csvButton = document.createElement('button');
        csvButton.id = 'csvButton';
        csvButton.textContent = 'CSV İndir';
        csvButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;

        csvButton.addEventListener('click', () => {
            console.log('CSV İndir butonu tıklandı!');
            downloadCSV();
        });

        body.appendChild(csvButton);
    }
};

const addScrollButton = () => {
    const body = document.querySelector('body.LoJzbe');
    
    if (body && !document.getElementById('scrollButton')) {
        const scrollButton = document.createElement('button');
        scrollButton.id = 'scrollButton';
        scrollButton.textContent = 'Veri Çek';
        scrollButton.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            z-index: 1000;
            padding: 8px 16px;
            background-color: blue;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;

        scrollButton.addEventListener('click', () => {
            if (!isScrolling) {
                console.log('Kaydırma başlatıldı!');
                const product = document.getElementById('product').value;
                const city = document.getElementById('city').value;
                const district = document.getElementById('district').value;
                performSearch(product, city, district);
            }
        });

        body.appendChild(scrollButton);
    }
};

const performSearch = (product, city, district) => {
    const searchBox = document.querySelector('input#searchboxinput');
    if (searchBox) {
        const searchQuery = `${product} ${city} ${district}`.trim();
        searchBox.value = searchQuery;
        searchBox.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
            const searchButton = document.querySelector('button#searchbox-searchbutton');
            if (searchButton) {
                searchButton.click();
                setTimeout(scrollAndFetchData, 2000);  // Wait for search results to load
            }
        }, 1000);
    }
}

const waitForElementLoad = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
    });
};

const scrollAndFetchData = async () => {
    isScrolling = true;
    let lastScrollHeight = 0;
    let noChangeCount = 0;
    const maxNoChangeCount = 5; // Adjust this value as needed

    try {
        const scrollContainer = await waitForElementLoad('div[role="feed"]');
        
        const scrollAndCheck = () => {
            if (!isScrolling) return;

            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                storeInfo();

                // Check if we've reached the bottom
                if (scrollContainer.scrollHeight === lastScrollHeight) {
                    noChangeCount++;
                    if (noChangeCount >= maxNoChangeCount) {
                        console.log("Tüm veriler çekildi veya sayfa sonuna ulaşıldı.");
                        isScrolling = false;
                        return;
                    }
                } else {
                    noChangeCount = 0;
                }

                lastScrollHeight = scrollContainer.scrollHeight;
            } else {
                window.scrollTo(0, document.body.scrollHeight);
                storeInfo();

                // Check if we've reached the bottom
                if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
                    noChangeCount++;
                    if (noChangeCount >= maxNoChangeCount) {
                        console.log("Tüm veriler çekildi veya sayfa sonuna ulaşıldı.");
                        isScrolling = false;
                        return;
                    }
                } else {
                    noChangeCount = 0;
                }
            }

            setTimeout(scrollAndCheck, 2000);  // Increased delay to 2 seconds
        };

        scrollAndCheck();
    } catch (error) {
        console.error("Error in scrollAndFetchData:", error);
        isScrolling = false;
    }
};

const stopScrolling = () => {
    isScrolling = false;
    console.log('Kaydırma durduruldu.');
    downloadCSV(); 
};

const addStopButton = () => {
    const body = document.querySelector('body.LoJzbe');
    
    if (body && !document.getElementById('stopButton')) {
        const stopButton = document.createElement('button');
        stopButton.id = 'stopButton';
        stopButton.textContent = 'Durdur';
        stopButton.style.cssText = `
            position: fixed;
            top: 90px;
            right: 10px;
            z-index: 1000;
            padding: 8px 16px;
            background-color: #F44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;

        stopButton.addEventListener('click', stopScrolling);
        body.appendChild(stopButton);
    }
};

const addWhatsAppIcons = () => {
    const phoneDivs = document.querySelectorAll('div.Io6YTe.fontBodyMedium.kR99db.fdkmkc');
    const iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png';
    const phonePattern1 = /^0\d{3} \d{3} \d{2} \d{2}$/;
    const phonePattern2 = /^\(0\d{3}\) \d{3} \d{2} \d{2}$/;

    phoneDivs.forEach(div => {
        const text = div.textContent.trim();
        let phoneNumber = text.replace(/[^0-9]/g, '');
        
        if ((phonePattern1.test(text) || phonePattern2.test(text)) && !div.querySelector('img.icon')) {
            if (phoneNumber.length === 10) {
                phoneNumber = '+90' + phoneNumber;
            } else if (phoneNumber.length === 11 && phoneNumber.startsWith('0')) {
                phoneNumber = '+90' + phoneNumber.slice(1);
            }

            if (!phoneNumber.startsWith('+')) {
                console.error('Geçersiz numara formatı:', phoneNumber);
                return;
            }

            const icon = document.createElement('img');
            icon.src = iconUrl;
            icon.alt = 'WhatsApp Icon';
            icon.className = 'icon';
            icon.style.width = '25px';
            icon.style.height = '25px';
            icon.style.marginLeft = '5px';
            icon.style.verticalAlign = 'middle';
            icon.style.pointerEvents = 'auto';

            div.appendChild(icon);

            console.log(`İkon başarıyla eklendi: ${phoneNumber}`);

            icon.addEventListener('click', () => {
                const waLink = `https://wa.me/${phoneNumber}`;
                window.open(waLink, '_blank');
            });
        }
    });
};

// MutationObserver for dynamically added WhatsApp icons
const observer = new MutationObserver(addWhatsAppIcons);
observer.observe(document.body, { childList: true, subtree: true });

// Initialize form, buttons, and icons on page load
addFilterForm();
addCSVButton();
addScrollButton();
addStopButton();
addWhatsAppIcons();
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
        
        storeName = removeGETFromStoreName(storeName);

        if (storeName && phoneNumber) {
            const storeKey = `${storeName} | ${phoneNumber}`;
        
            if (!seenStores.has(storeKey)) {
                storeArray.push({
                    storeName: storeName,
                    phoneNumber: phoneNumber
                });
                seenStores.add(storeKey);
            }
        }
    });

    console.log(storeArray);
}

const downloadCSV = () => {
    let csvContent = "Mağaza Adı,Telefon Numarası\n"; 

    storeArray.forEach(store => {
        csvContent += `${store.storeName},${store.phoneNumber}\n`;
    });

    const encodedUri = encodeCSV(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
    link.setAttribute("download", "magaza_bilgileri.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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
            storeInfo();
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
                scrollAndFetchData();
            }
        });

        body.appendChild(scrollButton);
    }
};

const scrollAndFetchData = () => {
    isScrolling = true;
    let totalHeight = 0;
    const distance = 100; 
    const scrollDelay = 1000; // Kaydırma işleminin süresi

    scrollInterval = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Sayfanın sonuna ulaşıldığında yeni sayfaya geçme
        if (totalHeight >= document.body.scrollHeight) {
            // Burada yeni sayfayı yükleme kodunu ekleyin
            window.scrollTo(0, 0); // Sayfayı en üste kaydır
            totalHeight = 0; // Total height'ı sıfırla
            // Yeni sayfaya geçtikten sonra storeInfo'yu çağır
            setTimeout(() => {
                storeInfo();
            }, scrollDelay);
        } else {
            storeInfo();
        }
    }, scrollDelay);
};

const stopScrolling = () => {
    clearInterval(scrollInterval);
    isScrolling = false;
    console.log('Kaydırma durduruldu.');
    downloadCSV(); // Durdurulduğunda CSV indir
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

            console.log(`İkon eklendi: ${text}`);

            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${phoneNumber}`, '_blank');
            });
        }
    });
};
    
const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            setTimeout(() => {
                addWhatsAppIcons();
                addCSVButton();
                addScrollButton();
                addStopButton();
                storeInfo();
            }, 2000);
            break;
        }
    }
});

observer.observe(document.querySelector('div[role="main"]') || document.body, { childList: true, subtree: true });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            addWhatsAppIcons();
            addCSVButton();
            addScrollButton();
            addStopButton();
            storeInfo();
        }, 2000);
    });
} else {
    addWhatsAppIcons();
    addCSVButton();
    addScrollButton();
    addStopButton();
    storeInfo();
}

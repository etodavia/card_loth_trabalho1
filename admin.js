import { getCardData, saveCardData, uploadImageToStorage } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveData();
    });
});

let _fullData = null; // Store to maintain properties not explicitly in form

async function loadData() {
    try {
        const data = await getCardData();
        if (!data) throw new Error('Firebase Database not configured or empty');
        _fullData = data;

        // Header & Backgrounds
        document.getElementById('hdr-logo').value = data.header.logoUrl || '';
        document.getElementById('hdr-tagline').value = data.header.tagline;
        document.getElementById('hdr-qrTop').value = data.header.topQrCodeUrl;

        document.getElementById('bg-mobile').value = data.backgrounds.mobileUrl;
        document.getElementById('bg-tablet').value = data.backgrounds.tabletUrl;
        document.getElementById('bg-desktop').value = data.backgrounds.desktopUrl;

        // Profile
        document.getElementById('prof-name').value = data.profile.name;
        document.getElementById('prof-title').value = data.profile.title;
        document.getElementById('prof-waNumber').value = data.profile.whatsappNumber;
        document.getElementById('prof-waText').value = data.profile.whatsappText;

        // Links
        if (data.links && data.links.length >= 3) {
            document.getElementById('link-1-text').value = data.links[0].displayText;
            document.getElementById('link-1-url').value = data.links[0].url;
            document.getElementById('link-2-text').value = data.links[1].displayText;
            document.getElementById('link-2-url').value = data.links[1].url;
            document.getElementById('link-3-text').value = data.links[2].displayText;
            document.getElementById('link-3-url').value = data.links[2].url;
        }

        // Address & Review
        document.getElementById('addr-title').value = data.addressBlock.title;
        document.getElementById('addr-lines').value = data.addressBlock.lines;
        document.getElementById('rev-title').value = data.reviewBlock.title;
        document.getElementById('rev-subtext').value = data.reviewBlock.subtext;
        document.getElementById('rev-qr').value = data.reviewBlock.qrCodeUrl;

        // Products
        document.getElementById('prod-title').value = data.products.sectionTitle;
        if (data.products.items && data.products.items.length >= 3) {
            document.getElementById('prod-1-img').value = data.products.items[0].imgUrl;
            document.getElementById('prod-1-name').value = data.products.items[0].title;
            document.getElementById('prod-2-img').value = data.products.items[1].imgUrl;
            document.getElementById('prod-2-name').value = data.products.items[1].title;
            document.getElementById('prod-3-img').value = data.products.items[2].imgUrl;
            document.getElementById('prod-3-name').value = data.products.items[2].title;
        }

        // Footer removed from admin

        // SEO & Tracking (Fallbacks incase they don't exist yet)
        const seo = data.seo || { title: '', description: '' };
        const tracking = data.tracking || { fbPixel: '', gtmHead: '', gtmBody: '' };

        document.getElementById('seo-title').value = seo.title;
        document.getElementById('seo-desc').value = seo.description;
        document.getElementById('tracking-fb-pixel').value = tracking.fbPixel;
        document.getElementById('tracking-gtm-head').value = tracking.gtmHead;
        document.getElementById('tracking-gtm-body').value = tracking.gtmBody;

        // Security
        document.getElementById('sec-email').value = data.adminEmail || 'admin@teste.com';
        document.getElementById('sec-password').value = data.adminPassword || '12345';
    } catch (e) {
        alert("Erro ao conectar com API HTTP em http://localhost:3000");
    }
}

async function saveData() {
    // Reconstruct data, preserving structure for links
    _fullData.header.logoUrl = document.getElementById('hdr-logo').value;
    _fullData.header.tagline = document.getElementById('hdr-tagline').value;
    _fullData.header.topQrCodeUrl = document.getElementById('hdr-qrTop').value;

    _fullData.backgrounds.mobileUrl = document.getElementById('bg-mobile').value;
    _fullData.backgrounds.tabletUrl = document.getElementById('bg-tablet').value;
    _fullData.backgrounds.desktopUrl = document.getElementById('bg-desktop').value;

    _fullData.profile.name = document.getElementById('prof-name').value;
    _fullData.profile.title = document.getElementById('prof-title').value;
    _fullData.profile.whatsappNumber = document.getElementById('prof-waNumber').value;
    _fullData.profile.whatsappText = document.getElementById('prof-waText').value;

    _fullData.links[0].displayText = document.getElementById('link-1-text').value;
    _fullData.links[0].url = document.getElementById('link-1-url').value;
    _fullData.links[1].displayText = document.getElementById('link-2-text').value;
    _fullData.links[1].url = document.getElementById('link-2-url').value;
    _fullData.links[2].displayText = document.getElementById('link-3-text').value;
    _fullData.links[2].url = document.getElementById('link-3-url').value;

    _fullData.addressBlock.title = document.getElementById('addr-title').value;
    _fullData.addressBlock.lines = document.getElementById('addr-lines').value;
    _fullData.reviewBlock.title = document.getElementById('rev-title').value;
    _fullData.reviewBlock.subtext = document.getElementById('rev-subtext').value;
    _fullData.reviewBlock.qrCodeUrl = document.getElementById('rev-qr').value;

    _fullData.products.sectionTitle = document.getElementById('prod-title').value;
    _fullData.products.items[0].imgUrl = document.getElementById('prod-1-img').value;
    _fullData.products.items[0].title = document.getElementById('prod-1-name').value;
    _fullData.products.items[1].imgUrl = document.getElementById('prod-2-img').value;
    _fullData.products.items[1].title = document.getElementById('prod-2-name').value;
    _fullData.products.items[2].imgUrl = document.getElementById('prod-3-img').value;
    _fullData.products.items[2].title = document.getElementById('prod-3-name').value;
    _fullData.products.items[2].title = document.getElementById('prod-3-name').value;
    // Footer logic removed

    // SEO & Tracking
    if (!_fullData.seo) _fullData.seo = {};
    if (!_fullData.tracking) _fullData.tracking = {};

    _fullData.seo.title = document.getElementById('seo-title').value;
    _fullData.seo.description = document.getElementById('seo-desc').value;
    _fullData.tracking.fbPixel = document.getElementById('tracking-fb-pixel').value;
    _fullData.tracking.gtmHead = document.getElementById('tracking-gtm-head').value;
    _fullData.tracking.gtmBody = document.getElementById('tracking-gtm-body').value;

    _fullData.adminEmail = document.getElementById('sec-email').value;
    _fullData.adminPassword = document.getElementById('sec-password').value;

    try {
        const success = await saveCardData(_fullData);
        if (success) {
            const toast = document.getElementById('toast');
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        } else {
            alert("Erro ao salvar dados no Firebase Firestore.");
        }
    } catch (e) {
        alert("Erro fatal ao salvar no Firebase.");
    }
}

window.forgotPassword = function () {
    alert("Como o Firebase oficial foi conectado agora, em breve poderemos usar a Autenticação do Firebase nativa para redefinir senha!");
};

window.checkLogin = async function () {
    const emailInput = document.getElementById('admin-email').value;
    const pwdInput = document.getElementById('admin-password').value;
    try {
        const data = await getCardData();

        if (pwdInput === data.adminPassword && emailInput.toLowerCase() === data.adminEmail.toLowerCase()) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-app').style.display = 'block';
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    } catch (e) {
        alert("Erro ao conectar com Firebase!");
    }
};

window.uploadFile = async function (inputElement, targetInputId) {
    const file = inputElement.files[0];
    if (!file) return;

    const statusEl = document.getElementById(`status-${targetInputId}`);
    const targetInput = document.getElementById(targetInputId);

    // Provide immediate UI feedback
    statusEl.style.display = 'block';
    statusEl.style.color = '#e6007e'; // Pink loading color
    statusEl.innerText = "Fazendo upload...";

    try {
        // We'll store images in a folder named 'uploads' with a unique timestamp filename
        const extension = file.name.split('.').pop();
        const uniqueFilename = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

        const downloadURL = await uploadImageToStorage(file, uniqueFilename);

        // Success
        targetInput.value = downloadURL;
        statusEl.style.color = '#4CAF50'; // Green success color
        statusEl.innerText = "Imagem enviada com sucesso!";

        // Hide success message after 3 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);

    } catch (error) {
        statusEl.style.color = 'red';
        statusEl.innerText = "Erro ao enviar imagem.";
        console.error("Upload failed", error);
    }
};

window.logout = function () {
    // Clear the password field for security (keeping email for convenience)
    document.getElementById('admin-password').value = '';

    // Hide the app and show the login screen
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';

    // Hide any previous error messages
    document.getElementById('login-error').style.display = 'none';
};

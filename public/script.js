// ERSTATT MED DINE SUPABASE CREDENTIALS:
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here';

// Initialiser Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Submit button handler
document.getElementById('submit').addEventListener('click', async () => {
    const product = document.getElementById('product').value.trim();
    const price = document.getElementById('price').value;
    const store = document.getElementById('store').value;
    const location = document.getElementById('location').value.trim();
    const photo = document.getElementById('photo').files[0];

    // Validering
    if (!product || !price || !store) {
        alert('Vennligst fyll ut vare, pris og butikk!');
        return;
    }

    // Disable button mens vi sender
    const submitBtn = document.getElementById('submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sender...';
    submitBtn.disabled = true;

    try {
        let image_url = null;

        // Last opp bilde hvis det finnes
        if (photo) {
            const fileName = `${Date.now()}_${photo.name}`;
            const { data, error } = await supabase.storage
                .from('prices')
                .upload(fileName, photo, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Feil ved bildeopplasting:', error);
                alert('Kunne ikke laste opp bilde. Prøv igjen.');
                throw error;
            }

            if (data) {
                const { data: publicUrlData } = supabase.storage
                    .from('prices')
                    .getPublicUrl(data.path);
                image_url = publicUrlData.publicUrl;
            }
        }

        // Lagre rapport i databasen
        const { data, error } = await supabase
            .from('reports')
            .insert([{
                product,
                price: parseFloat(price),
                store,
                location: location || null,
                image_url,
                approved: true
            }]);

        if (error) {
            console.error('Feil ved lagring:', error);
            alert('Kunne ikke lagre rapport. Prøv igjen.');
            throw error;
        }

        alert('✅ Rapport sendt! Takk for at du knuser systemet.');

        // Tøm skjema
        document.getElementById('product').value = '';
        document.getElementById('price').value = '';
        document.getElementById('store').value = '';
        document.getElementById('location').value = '';
        document.getElementById('photo').value = '';

        // Last inn rapporter på nytt
        loadReports();

    } catch (error) {
        console.error('Error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Last inn rapporter fra databasen
async function loadReports() {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('approved', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Feil ved henting av rapporter:', error);
            return;
        }

        const list = document.getElementById('report-list');

        if (!data || data.length === 0) {
            list.innerHTML = '<li style="color: #888; text-align: center; padding: 20px;">Ingen rapporter ennå. Vær den første til å slå tilbake!</li>';
            return;
        }

        list.innerHTML = data.map(r => {
            const date = new Date(r.created_at);
            const formattedDate = date.toLocaleDateString('no-NO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <li class="report-item">
                    <h3>${escapeHtml(r.product)} – ${r.price} kr</h3>
                    <div class="meta">
                        📍 ${escapeHtml(r.store)}${r.location ? ` i ${escapeHtml(r.location)}` : ''}
                    </div>
                    <div class="date">🕒 ${formattedDate}</div>
                    ${r.image_url ? `<img src="${escapeHtml(r.image_url)}" alt="Bilde av pris" loading="lazy">` : ''}
                </li>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Escape HTML for å forhindre XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Last inn rapporter når siden lastes
loadReports();

// Registrer service worker for offline-støtte
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrert:', reg))
        .catch(err => console.error('Service Worker feil:', err));
}

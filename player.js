document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const currentUser = session.get();
    
    // Initialize Plyr
    const player = new Plyr('#moviePlayer', {
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        quality: {
            default: 1080,
            options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        }
    });

    // Get movie ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // Find movie in our movies array
    const movie = movies[movieId];

    if (movie) {
        // Update page content with movie details
        document.title = `${movie.title} - WFO`;
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieRating').textContent = movie.rating;
        document.getElementById('movieYear').textContent = movie.year;
        document.getElementById('movieGenre').textContent = movie.genre;
        document.getElementById('movieDescription').textContent = movie.description;

        // Setup watchlist button
        const watchlistButton = document.querySelector('.action-buttons .btn-secondary');
        if (watchlistButton) {
            // Check if movie is in watchlist
            const inWatchlist = await isInWatchlist(movieId);
            
            // Update button appearance
            watchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`;
            watchlistButton.innerHTML = `
                <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
                <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
            `;
            lucide.createIcons();

            // Add click handler
            watchlistButton.onclick = async (e) => {
                e.preventDefault();
                if (!currentUser) {
                    window.location.href = `Logowanie.html?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                    return;
                }
                
                if (await isInWatchlist(movieId)) {
                    await removeFromWatchlist(movieId);
                } else {
                    await addToWatchlist(movieId);
                }
                
                // Update button state after action
                const newInWatchlist = await isInWatchlist(movieId);
                watchlistButton.className = `btn ${newInWatchlist ? 'btn-primary' : 'btn-secondary'}`;
                watchlistButton.innerHTML = `
                    <i data-lucide="${newInWatchlist ? 'check' : 'plus'}"></i>
                    <span>${newInWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
                `;
                lucide.createIcons();
            };
        }

        if (!currentUser) {
            // Show login required message
            const videoWrapper = document.querySelector('.video-wrapper');
            videoWrapper.innerHTML = `
                <div class="video-unavailable">
                    <p>Aby obejrzeć ten film, musisz się najpierw zalogować</p>
                    <a href="Logowanie.html?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}" class="btn btn-primary">
                        <i data-lucide="log-in"></i>
                        <span>Zaloguj się</span>
                    </a>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Check if user has license for this movie
        const userLicenses = JSON.parse(localStorage.getItem('movie_licenses') || '[]');
        const hasLicense = userLicenses.includes(movieId);

        if (hasLicense) {
            // Set video source if available
            if (movie.videoUrl) {
                player.source = {
                    type: 'video',
                    sources: [
                        {
                            src: movie.videoUrl,
                            type: 'video/mp4',
                            size: 1080
                        }
                    ]
                };
            } else {
                const videoWrapper = document.querySelector('.video-wrapper');
                videoWrapper.innerHTML = '<div class="video-unavailable">Film niedostępny</div>';
            }
        } else {
            // Show payment required message and button
            const videoWrapper = document.querySelector('.video-wrapper');
            videoWrapper.innerHTML = `
                <div class="video-unavailable">
                    <p>Aby obejrzeć ten film, musisz wykupić dostęp</p>
                    <form action="startPaymentExample.php" method="POST">
                        <input type="hidden" name="movieId" value="${movieId}">
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="credit-card"></i>
                            <span>Wykup dostęp</span>
                        </button>
                    </form>
                </div>
            `;
        }
    } else {
        // Redirect to home page if movie not found
        window.location.href = '/';
    }

    // Initialize Lucide icons
    lucide.createIcons();
});
console.log("auth.js załadowany");

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const switchButton = document.getElementById('switchAuth');
    const nameGroup = document.getElementById('nameGroup');
    const errorMessage = document.getElementById('errorMessage');

    // Get return URL from query parameters if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl') || 'index.html';

    switchButton.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(nameGroup).display === 'none';
        nameGroup.style.display = isHidden ? 'block' : 'none';

        document.querySelector('.auth-title').textContent = isHidden
            ? 'Stwórz swoje konto'
            : 'Witaj ponownie';

        document.querySelector('.auth-subtitle').textContent = isHidden
            ? 'Zacznij swoją przygodę z wypożyczalnią filmów wfo'
            : 'Zaloguj się do konta';

        document.querySelector('.auth-submit').textContent = isHidden
            ? 'Stwórz konto'
            : 'Zaloguj się';

        switchButton.textContent = isHidden
            ? 'Masz już konto? Zaloguj'
            : 'Nie masz konta? Zarejestruj się!';

        errorMessage.style.display = 'none';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginInput = document.getElementById('login');
        const isSignUp = window.getComputedStyle(nameGroup).display !== 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let login = isSignUp ? loginInput.value.trim() : '';

        console.log("Wysyłam dane logowania:", { email, password, login });

        const url = isSignUp ? 'register.php' : 'login.php';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password, ...(isSignUp && { login }) }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || 'Wystąpił błąd');
            }

            if (isSignUp) {
                const toast = document.getElementById('toast');
                toast.textContent = "Rejestracja zakończona sukcesem! Zaloguj się.";
                toast.style.display = "block";
                toast.classList.add('show');

                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.style.display = "none";
                        window.location.href = 'Logowanie.html';
                    }, 300);
                }, 2500);

                return;
            }

            // Login successful
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = "Jesteś zalogowany";
                toast.style.display = "block";
                toast.classList.add("show");

                setTimeout(() => {
                    toast.classList.remove("show");
                    setTimeout(() => {
                        toast.style.display = "none";

                        // Save session before redirecting
                        session.set(result.user);

                        // Redirect to return URL or home page
                        window.location.href = returnUrl;
                    }, 300);
                }, 2500);
            }

            // Update session data
            session.set(result.user);

        } catch (error) {
            console.error("Błąd logowania:", error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // Check if user is already logged in
    const currentUser = session.get();
    const isOnLoginPage = window.location.pathname.includes('Logowanie.html');
    if (currentUser && isOnLoginPage) {
        window.location.href = returnUrl;
    }
});
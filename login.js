const SUPABASE_URL = 'https://onwfrweefxxcimvzunjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud2Zyd2VlZnh4Y2ltdnp1bmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDczMTQsImV4cCI6MjA2ODgyMzMxNH0.uLRXdtv3l1SyX8HFq1FHGY3rRR3akLpqCfTVRUjhUUg';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Theme management
    const theme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(theme);

    // Check if already logged in
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    // Handle login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('emailInput').value;
        const button = document.getElementById('loginButton');
        const messageDiv = document.getElementById('messageDiv');
        
        button.disabled = true;
        button.textContent = 'Sending...';
        
        try {
            const { error } = await supabaseClient.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: 'http://c0skskwg0c0wk40kkswk8w80.194.195.86.17.sslip.io/index.html'
                }
            });
            
            if (error) throw error;
            
            // Show success message
            messageDiv.className = 'login-message success';
            messageDiv.textContent = '✨ Check your email for the magic link!';
            
        } catch (error) {
            messageDiv.className = 'login-message error';
            messageDiv.textContent = '❌ Error: ' + error.message;
        } finally {
            button.disabled = false;
            button.textContent = 'Sign In';
        }
    });
});

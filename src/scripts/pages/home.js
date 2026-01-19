import { supabase } from '../utils/supabase.js';

const loggedOut = document.getElementById('auth-logged-out');
const loggedIn = document.getElementById('auth-logged-in');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailSpan = document.getElementById('user-email');

function showLoggedOut() {
  loggedOut.classList.remove('hidden');
  loggedIn.classList.add('hidden');
}

function showLoggedIn(user) {
  emailSpan.textContent = user.email;
  loggedOut.classList.add('hidden');
  loggedIn.classList.remove('hidden');
}

loginBtn.onclick = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://127.0.0.1:5500/src/pages/home.html'
    }
  });
};

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  showLoggedOut();
};

const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  showLoggedIn(session.user);
} else {
  showLoggedOut();
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    showLoggedIn(session.user);
  } else {
    showLoggedOut();
  }
});

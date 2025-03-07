<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <link rel="stylesheet" href="styles.css">
  <style>
  /* styles.css */
body, html {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 100px;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

a {
  display: block;
  margin-top: 10px;
  color: #4CAF50;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-container {
    width: 90%;
  }
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
}

main {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f4f4f4;
}

footer {
  display: flex;
  padding: 10px;
  background-color: #fff;
}

#message-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

#chat-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 10px;
  border-radius: 5px;
  background-color: #e0f7fa;
  max-width: 80%;
}

.message.bot {
  background-color: #ffe0b2;
  align-self: flex-start;
}

.message.user {
  background-color: #c8e6c9;
  align-self: flex-end;
}

  </style>
</head>
<body>
  <div class="login-container">
    <img src="https://via.placeholder.com/150" alt="Logo" class="logo">
    <form id="login-form">
      <input type="email" id="email" placeholder="Email" required>
      <input type="password" id="password" placeholder="Password" required>
      <button type="submit">Log in</button>
    </form>
    <a href="#" id="signup-link">Sign up</a>
  </div>
    <div class="chat-container">
    <header>
      <img src="https://via.placeholder.com/150" alt="Logo" class="logo">
      <button id="logout">Logout</button>
    </header>
    <main id="chat-area"></main>
    <footer>
      <input type="text" id="message-input" placeholder="Type a message" />
      <button id="send-btn">Send</button>
    </footer>
  </div>
  <script src="app.js">
    // app.js
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;

  if (validateEmail(email) && validatePassword(password)) {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'chat.html'; // Redirect to chat interface after successful login
  } else {
    alert('Please enter valid credentials!');
  }
});

function validateEmail(email) {
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}
// chat.js
if (!localStorage.getItem('isLoggedIn')) {
  window.location.href = 'login.html'; // Redirect to login page if not logged in
}

document.getElementById('logout').addEventListener('click', function () {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'login.html'; // Redirect to login after logging out
});

document.getElementById('send-btn').addEventListener('click', function () {
  sendMessage();
});

document.getElementById('message-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  let messageInput = document.getElementById('message-input');
  let messageText = messageInput.value.trim();

  if (messageText) {
    addMessage(messageText, 'user');
    messageInput.value = '';

    // Auto-reply from bot
    setTimeout(function () {
      addMessage('Hello! How can I help you today?', 'bot');
    }, 1000);
  }
}

function addMessage(text, sender) {
  let messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);
  messageContainer.textContent = text;
  document.getElementById('chat-area').appendChild(messageContainer);
  document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight; // Scroll to latest message
}

 </script>
</body>
</html>

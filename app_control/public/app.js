// Control button event: calls an API endpoint
document.getElementById('controlBtn').addEventListener('click', () => {
  fetch('/api/button-click')
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => console.error('Error:', error));
});

// Registration form event
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(response => {
      alert(response.message);
    })
    .catch(err => console.error(err));
});

// Login form event
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(response => {
      alert(response.message);
    })
    .catch(err => console.error(err));
});

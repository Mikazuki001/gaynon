document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', { // ตรวจสอบ URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response;
    })
    .then(() => {
        window.location.href = "index.html"; // ตรวจสอบ URL
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').style.display = 'block'; // แสดงข้อความผิดพลาด
    });
});

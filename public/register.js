document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('http://localhost:3000/register', {
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
        return response.text();
    })
    .then(message => {
        document.getElementById('success-message').textContent = message;
        document.getElementById('success-message').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';

        // เปลี่ยนเส้นทางไปยังหน้า login หลังจากลงทะเบียนสำเร็จ
        setTimeout(() => {
            window.location.href = "login.html"; // ตรวจสอบ URL ของหน้า login ให้ถูกต้อง
        }, 2000); // หน่วงเวลา 2 วินาทีก่อนเปลี่ยนหน้า
    })
    .catch(error => {
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('success-message').style.display = 'none';
    });
});

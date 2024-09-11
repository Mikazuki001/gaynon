var map = L.map('map').setView([16.812032, 100.463233], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var drawnPoints = [];
var markers = [];
var polyline = null;
var distanceMarkers = [];
var infoBox = null;

// คลิกเพื่อเพิ่มจุดบนแผนที่
map.on('click', function(e) {
    var latlng = e.latlng;
    drawnPoints.push(latlng);

    var marker = L.marker(latlng, { draggable: true }).addTo(map);
    markers.push(marker);

    var lat = latlng.lat.toFixed(6);
    var lng = latlng.lng.toFixed(6);

    getElevation(lat, lng, marker);

    marker.on('dragend', function(e) {
        var newLatLng = e.target.getLatLng();
        var index = markers.indexOf(marker);
        if (index !== -1) {
            drawnPoints[index] = newLatLng;
            drawPolyline();
        }

        getElevation(newLatLng.lat.toFixed(6), newLatLng.lng.toFixed(6), marker);
    });

    drawPolyline();
});

// คำนวณระยะทางรวม
function calculateTotalDistance() {
    var totalDistance = 0;
    for (var i = 0; i < drawnPoints.length - 1; i++) {
        totalDistance += drawnPoints[i].distanceTo(drawnPoints[i + 1]);
    }
    return totalDistance.toFixed(2);
}

// วาดเส้นเชื่อมจุดและแสดงระยะทางระหว่างแต่ละจุด
function drawPolyline() {
    if (polyline) {
        map.removeLayer(polyline);
    }
    
    distanceMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    distanceMarkers = [];

    if (drawnPoints.length > 1) {
        polyline = L.polyline(drawnPoints, { color: 'blue' }).addTo(map);

        for (var i = 0; i < drawnPoints.length - 1; i++) {
            var distance = drawnPoints[i].distanceTo(drawnPoints[i + 1]).toFixed(2);
            var midPoint = L.latLng(
                (drawnPoints[i].lat + drawnPoints[i + 1].lat) / 2,
                (drawnPoints[i].lng + drawnPoints[i + 1].lng) / 2
            );

            var distanceMarker = L.marker(midPoint, {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `<span>${distance} m</span>`,
                    iconSize: [100, 30]
                })
            }).addTo(map);

            distanceMarkers.push(distanceMarker);
        }

        updateInfoBox(); // อัพเดตกล่องข้อความระยะทางรวม
    }
}

// ฟังก์ชันขอข้อมูลความสูงจาก API
function getElevation(lat, lng, marker) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            var elevation = result.results[0].elevation;
            marker.bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}<br>Elevation: ${elevation} meters`).openPopup();
        })
        .catch(error => console.error('Error fetching elevation data:', error));
}

// อัพเดตกล่องข้อความระยะทางรวม
function updateInfoBox() {
    var totalDistance = calculateTotalDistance();
    var infoBox = document.getElementById('infoBox');
    if (infoBox) {
        infoBox.textContent = `Total Distance: ${totalDistance} meters`;
    }
}

// แสดง/ซ่อนกล่องข้อความระยะทางรวม
function toggleInfoBox() {
    var container = document.getElementById('infoBoxContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        updateInfoBox(); // อัพเดตข้อมูลเมื่อแสดง
    } else {
        container.style.display = 'none';
    }
}

// ลบจุดทั้งหมด
document.getElementById('clearBtn').addEventListener('click', function() {
    drawnPoints = [];
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];
    if (polyline) {
        map.removeLayer(polyline);
    }
    distanceMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    distanceMarkers = [];
    updateInfoBox(); // อัพเดตกล่องข้อความระยะทางรวม
});

// ยกเลิกจุดล่าสุด
document.getElementById('undoBtn').addEventListener('click', function() {
    if (drawnPoints.length > 0) {
        drawnPoints.pop();
        var lastMarker = markers.pop();
        map.removeLayer(lastMarker);
        drawPolyline();
    }
});

// ปุ่มสามขีด
document.getElementById('menuToggle').addEventListener('click', function() {
    var menuItems = document.getElementById('menuItems');
    if (menuItems.style.display === 'none' || menuItems.style.display === '') {
        menuItems.style.display = 'block';
    } else {
        menuItems.style.display = 'none';
    }
});

// ปุ่มแสดง/ซ่อนกล่องข้อความระยะทางรวม
document.getElementById('showDistanceBtn').addEventListener('click', toggleInfoBox);

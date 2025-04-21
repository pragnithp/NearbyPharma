function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      document.getElementById("output").innerText = "Geolocation is not supported by this browser.";
    }
  }
  
  let map; // to hold map instance

  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    userLat = lat;
    userLon = lon;

    document.getElementById("output").innerText = `Your location: Latitude ${lat}, Longitude ${lon}`;
  
    // Initialize or update map
    if (!map) {
      map = L.map('map').setView([lat, lon], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    } else {
      map.setView([lat, lon], 14);
    }
  
    // Add user's location marker
    L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
  
    // Overpass API query to find pharmacies nearby
    const query = `
      [out:json];
      node
        [amenity=pharmacy]
        (around:3000,${lat},${lon});
      out;
    `;
  
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    })
    .then(res => res.json())
    .then(data => {
      const pharmacies = data.elements;
      if (pharmacies.length === 0) {
        document.getElementById("output").innerText += "\nNo pharmacies found nearby.";
        return;
      }
  
      pharmacies.forEach(pharmacy => {
        if (pharmacy.lat && pharmacy.lon) {
          L.marker([pharmacy.lat, pharmacy.lon])
            .addTo(map)
            .bindPopup(pharmacy.tags.name || "Unnamed Pharmacy");
        }
      });
    })
    .catch(err => {
      document.getElementById("output").innerText += "\nError fetching pharmacy data.";
      console.error(err);
    });
  }
    
  
  function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        document.getElementById("output").innerText = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        document.getElementById("output").innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        document.getElementById("output").innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        document.getElementById("output").innerText = "An unknown error occurred.";
        break;
    }
  }
  
let userLat, userLon;

function openInGoogleMaps() {
  if (userLat && userLon) {
    const gmapsUrl = `https://www.google.com/maps/search/pharmacy/@${userLat},${userLon},14z`;
    window.open(gmapsUrl, "_blank");
  } else {
    alert("Please allow location first by clicking 'Find Pharmacies Near Me'");
  }
}

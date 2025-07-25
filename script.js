// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBCIFQGL1z9jpvS83nNgZET60u378Y5zI",
  authDomain: "userlocation-67584.firebaseapp.com",
  projectId: "userlocation-67584",
  storageBucket: "userlocation-67584.firebasestorage.app",
  messagingSenderId: "204696312608",
  appId: "1:204696312608:web:9306bc4ac84538e58f5545",
  measurementId: "G-TVD5Q6SF4H"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 19.4326, lng: -99.1332 },
    zoom: 12
  });

  const listDiv = document.getElementById("list");
  listDiv.innerHTML = "";

  db.collection("Locations").get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        listDiv.innerHTML = "<p>No hay ubicaciones disponibles.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const geoPoint = data.location;
        const timestamp = data.date;

        if (!geoPoint || typeof geoPoint.latitude !== "number" || typeof geoPoint.longitude !== "number") return;
        if (!timestamp || !timestamp.toDate) return;

        const lat = geoPoint.latitude;
        const lng = geoPoint.longitude;
        const date = timestamp.toDate();

        const opciones = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'America/Mexico_City'
        };

        const displayDate = date.toLocaleString('es-MX', opciones);

        // Crear marcador (gris por defecto)
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: displayDate,
          icon: "http://maps.google.com/mapfiles/ms/icons/grey-dot.png"
        });

        markers.push(marker);

        // Crear elemento de lista
        const listItem = document.createElement("p");
        listItem.textContent = `📍 ${lat}, ${lng} - ${displayDate}`;
        listItem.style.cursor = 'pointer';

        listItem.addEventListener('click', () => {
          // Restaurar todos los íconos a gris
          markers.forEach(m => m.setIcon("http://maps.google.com/mapfiles/ms/icons/grey-dot.png"));

          // Resaltar marcador actual
          marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");

          // Centrar mapa y mostrar info
          map.setCenter({ lat, lng });
          map.setZoom(15);

          const infoWindow = new google.maps.InfoWindow({
            content: `<strong>📍 Ubicación:</strong><br>${lat}, ${lng}<br><strong>Fecha:</strong><br>${displayDate}`
          });
          infoWindow.open(map, marker);
        });

        listDiv.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("❌ Error leyendo ubicaciones:", error);
      listDiv.innerHTML = "<p>Error al cargar las ubicaciones.</p>";
    });
}

// Necesario para que Google Maps pueda llamar initMap al terminar de cargar
window.initMap = initMap;

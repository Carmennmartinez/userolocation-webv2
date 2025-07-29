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
let allItems = []; // Lista completa para filtrar

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 19.4326, lng: -99.1332 },
    zoom: 12
  });

  cargarDatos();

  // 🔍 Filtro por nombre en tiempo real
  document.getElementById("search").addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    const listDiv = document.getElementById("list");
    listDiv.innerHTML = "";

    allItems.forEach(({ name, lat, lng, displayDate, marker }) => {
      if (name.toLowerCase().includes(texto)) {
        const listItem = document.createElement("p");
        listItem.textContent = `👤 ${name} | 📍 ${lat.toFixed(4)}, ${lng.toFixed(4)} | 🕒 ${displayDate}`;
        listItem.style.cursor = 'pointer';

        listItem.addEventListener('click', () => {
          markers.forEach(m => m.setIcon("http://maps.google.com/mapfiles/ms/icons/grey-dot.png"));
          marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
          map.setCenter({ lat, lng });
          map.setZoom(15);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <strong>👤 Nombre:</strong> ${name}<br>
              <strong>📍 Ubicación:</strong> ${lat}, ${lng}<br>
              <strong>🕒 Fecha:</strong> ${displayDate}`
          });
          infoWindow.open(map, marker);
        });

        listDiv.appendChild(listItem);
      }
    });
  });
}

function cargarDatos() {
  const listDiv = document.getElementById("list");
  listDiv.innerHTML = "";
  allItems = [];
  markers = [];

  db.collection("Locations")
    .orderBy("date", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        listDiv.innerHTML = "<p>No hay ubicaciones disponibles.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const geoPoint = data.location;
        const timestamp = data.date;
        const name = data.name || "Sin nombre";

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

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: `${name} - ${displayDate}`,
          icon: "http://maps.google.com/mapfiles/ms/icons/grey-dot.png"
        });

        markers.push(marker);

        allItems.push({ name, lat, lng, displayDate, marker });

        // Mostrar al cargar sin filtro
        const listItem = document.createElement("p");
        listItem.textContent = `👤 ${name} | 📍 ${lat.toFixed(4)}, ${lng.toFixed(4)} | 🕒 ${displayDate}`;
        listItem.style.cursor = 'pointer';

        listItem.addEventListener('click', () => {
          markers.forEach(m => m.setIcon("http://maps.google.com/mapfiles/ms/icons/grey-dot.png"));
          marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
          map.setCenter({ lat, lng });
          map.setZoom(15);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <strong>👤 Nombre:</strong> ${name}<br>
              <strong>📍 Ubicación:</strong> ${lat}, ${lng}<br>
              <strong>🕒 Fecha:</strong> ${displayDate}`
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

window.initMap = initMap;

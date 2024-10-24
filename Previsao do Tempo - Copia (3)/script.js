const apiKey = 'DIGITE A SUA API AQUI'; // Substitua pela sua chave API
const defaultCity = 'Porto Alegre'; // Cidade padrão
let map;


async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        document.getElementById('weather').innerHTML = `
            <h3 style="color: #00FF00">${data.name}</h3>
            <p style="color: #00FF00">${data.weather[0].description}</p>
            <p style="color: #00FF00">Temperatura: ${data.main.temp}°C</p>
        `;
        addMarker(data.coord.lat, data.coord.lon, data.name);

        // Chama a função de previsão
        fetchForecast(city);
    } catch (error) {
        document.getElementById('weather').innerHTML = 'Erro ao carregar dados: ' + error.message;
    }
}

async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== "200") {
            throw new Error(data.message);
        }

        displayForecast(data.list);
    } catch (error) {
        document.getElementById('forecast').innerHTML = 'Erro ao carregar previsões: ' + error.message;
    }
}

function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Limpa previsões anteriores

    forecastData.forEach((entry) => {
        // Exibe apenas as previsões a cada 24 horas (ou 8 entradas de 3 horas)
        if (entry.dt_txt.endsWith('12:00:00')) {
            const date = new Date(entry.dt * 1000).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <h4>${date}</h4>
                <p>${entry.weather[0].description}</p>
                <p>Temperatura: ${entry.main.temp}°C</p>
                <p>Máxima: ${entry.main.temp_max}°C</p>
                <p>Mínima: ${entry.main.temp_min}°C</p>
            `;
            forecastContainer.appendChild(forecastItem);
        }
    });
}

function addMarker(lat, lon, cityName) {
    L.marker([lat, lon]).addTo(map).bindPopup(cityName).openPopup();
}

function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchWeatherByCoords(lat, lon);
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        document.getElementById('weather').innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.weather[0].description}</p>
            <p>Temperatura: ${data.main.temp}°C</p>
        `;
        addMarker(lat, lon, data.name);

        // Chama a função de previsão
        fetchForecast(data.name);
    } catch (error) {
        document.getElementById('weather').innerHTML = 'Erro ao carregar dados: ' + error.message;
    }
}

// Inicializa o mapa
function initMap() {
    map = L.map('map').setView([-30.0346, -51.2177], 6); // Posição padrão em Porto Alegre
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    map.on('click', onMapClick);
}

// Evento para buscar ao clicar no botão
document.getElementById('searchButton').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert('Por favor, insira uma cidade.');
    }
});

// Evento para buscar ao pressionar Enter
document.getElementById('cityInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            alert('Por favor, insira uma cidade.');
        }
    }
});

// Evento para limpar informações
document.getElementById('clearButton').addEventListener('click', () => {
    // Limpa as informações do clima
    document.getElementById('weather').innerHTML = '';
    document.getElementById('forecast').innerHTML = '';
    document.getElementById('cityInput').value = '';

    // Remove todos os marcadores do mapa
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

});

// Inicializa a busca na cidade padrão
fetchWeather(defaultCity);
initMap();

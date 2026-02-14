const weatherApp = {
    apiKey: 'bdf61456d0edcccd6e8c3b2b2f5b666f',
    map: null,
    radarLayer: null,

    init() {
        this.updateTime();
        this.initMap();
        this.getLocation();
    },

    updateTime() {
        setInterval(() => {
            document.getElementById('current-time').innerText = new Date().toLocaleTimeString('pl-PL');
        }, 1000);
    },

    initMap() {
        // Inicjalizacja mapy Leaflet
        this.map = L.map('map').setView([52.23, 21.01], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        
        // Dodanie warstwy radaru (OpenWeather Clouds/Precipitation)
        L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${this.apiKey}`).addTo(this.map);
    },

    async fetchWeather(city) {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pl&appid=${this.apiKey}`);
            const data = await res.json();
            this.updateUI(data);
            
            // Przesunięcie radaru na nowe miasto
            this.map.flyTo([data.coord.lat, data.coord.lon], 9);
        } catch (e) { console.error("Błąd AuraGo"); }
    },

    updateUI(data) {
        document.getElementById('city-name').innerText = data.name;
        document.getElementById('main-temp').innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById('weather-desc').innerText = data.weather[0].description;
        document.getElementById('wind-speed').innerText = `${(data.wind.speed * 3.6).toFixed(0)} km/h`;
        document.getElementById('humidity').innerText = `${data.main.humidity}%`;
        document.getElementById('pressure').innerText = `${data.main.pressure}`;
        document.getElementById('vis').innerText = `${(data.visibility / 1000).toFixed(1)} km`;

        this.runAI(data.main.temp, data.weather[0].main);
    },

    runAI(t, c) {
        let msg = "AuraGo AI: ";
        if (t < 5) msg += "Zimno! Lepiej zostań w domu z herbatą.";
        else if (c.includes("Rain")) msg += "Pada... weź parasol, jeśli musisz wyjść.";
        else msg += "Warunki optymalne. Miłego dnia!";
        document.getElementById('ai-text').innerText = msg;
    },

    search() {
        const v = document.getElementById('city-input').value;
        if(v) this.fetchWeather(v);
    },

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => this.fetchByCoords(p.coords.latitude, p.coords.longitude),
                () => this.fetchWeather('Tarnogród')
            );
        } else { this.fetchWeather('Tarnogród'); }
    },

    async fetchByCoords(lat, lon) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pl&appid=${this.apiKey}`);
        const data = await res.json();
        this.updateUI(data);
        this.map.flyTo([lat, lon], 9);
    }
};

weatherApp.init();
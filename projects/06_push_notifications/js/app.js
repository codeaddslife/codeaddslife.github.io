var app = new Vue({
    el: '#app',
    data: {
        position: null,
        lastUpdated: null,
        stations: []
    },
    beforeMount: function () {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
`
`
                registration.showNotification('MyBike', {
                    body: 'Station Van Eedenplein is out of order',
                    icon: 'img/icon-192.png'
                });

            }).catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        }
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(this.locatePosition);
        }

        this.loadStations();
        this.lastUpdated = localStorage.lastUpdated;
    },
    methods: {
        deg2rad: function (deg) {
            return deg * (Math.PI / 180)
        },
        getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
            var R = 6371;
            var dLat = this.deg2rad(lat2 - lat1);
            var dLon = this.deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        },
        loadStations: function () {
            axios.get('/stations.json')
                .then(function (response) {
                    this.stations = response.data;
                    this.lastUpdated = new Date().toLocaleString();
                    localStorage.lastUpdated =  this.lastUpdated;
                }.bind(this))
                .catch(function (error) {
                    console.log(error);
                });
        },
        locatePosition: function (position) {
            this.position = position.coords;
            this.sort();
        },
        sort: function() {
            for(var i in this.stations) {
                var distance = this.getDistanceFromLatLonInKm(this.stations[i].lat, this.stations[i].lon, this.position.latitude, this.position.longitude);
                Vue.set(this.stations[i], 'distance', Math.round(distance * 10) / 10);
            }
            this.stations.sort(function(a, b) {
                return a.distance - b.distance;
            });
        }
    }
});


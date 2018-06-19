import React, {Component} from 'react';
import Navigation from './Navigation';

class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            'locations': require("./Locations.json"),
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };
        
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        
        // CONNECT THE initMap() TO THE GLOBAL WINDOW CONTEXT
        
        window.initMap = this.initMap;
        
        // LOAD ASYNCHRONOUSLY THE GOOGLE MAPS SCRIPT
        
        loadAsynchMap('https://maps.googleapis.com/maps/api/js?key=AIzaSyDM6Zo5_nTmZdvvwNZt9VARt3Nz49P3rgk&callback=initMap')
    }

        // INITIALISE THE MAP
    
    initMap() {
        var self = this;
        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var grayStyles = require("./Styles.json");
            
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 52.2213831, lng: 21.0227344},
            zoom: 13,
            styles: grayStyles,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var locations = [];
        this.state.locations.forEach(function (location) {
            var longname = location.name;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map,
                icon: 'https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Ball-Right-Pink-icon.png',
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            locations.push(location);
        });
        this.setState({
            'locations': locations
        });
    }

        // OPEN THE MARKER INFOWINDOW
    
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        setTimeout(function () {
                marker.setAnimation(null);
            }, 500);
        this.state.infowindow.setContent('Loading...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, 30);
        this.getMarkerInfo(marker);
    }

    // FOURSQUARE API
    
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "BIOC4TO3WBNBZYYTP2R52AGU4DRBBK1TVNMWPX3WQYA2B3RW";
        var clientSecret = "RXW0BBNBGK2U04UANTAW5XN23FJY5ULTTMOVCS0A003AZJ1K";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20180323&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("There is a problem downloading the data. Please try again later.");
                        return;
                    }

    // FETCH FOURSQARE DATA
                    
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var name = '<b>Name: </b>' + location_data.name + '<br>';
                        var address = '<b>Address: </b>' + location_data.location.address + '<br>';
                        var more = '<br><a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">See more at Foursquare</a>'
                        self.state.infowindow.setContent(name + address + more);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("There is a problem downloading the data. Please try again later.");
            });
    }

    // CLOSE THE MARKER INFOWINDOW
    
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    // RENDER APP FUNCTION
    
    render() {
        return (
            <div>
                <Navigation 
                locations={this.state.locations} 
                openInfoWindow={this.openInfoWindow} 
                closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

    // LOAD THE GOOGLE MAPS ASYNCHRONOUSLY

function loadAsynchMap(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("There was a problem with Google Maps. Please close this page from your browser and try again later");
    };
    ref.parentNode.insertBefore(script, ref);
} 
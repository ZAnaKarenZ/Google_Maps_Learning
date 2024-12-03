import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';

const MostrarMapa = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);     //Sets current location of user
  const [showTraffic, setShowTraffic] = useState<boolean>(false);                     //Boolean flag for traffic
  const [showRestaurants, setShowRestaurants] = useState<boolean>(false);             //Boolean flag for restaurants
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);                   //Array to store nearby restaurants

  //Ask user for permission to their location and set that location in the map
  useEffect(() => {
    (async () => {
      try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de localización negado');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
    })();
  }, []);

  //Restaurant object with latitude, longitude, name and address
  type Restaurant = {
    id: string;
    name: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };

  //Find all restaurants in a given radius from current location
  const fetchRestaurants = async () => {
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
      return;
    }

    //Look for nearby restaurants using the API key
    const apiKey = '';
    const radius = 500;
    const type = 'restaurant';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      //If restaurants were found, create a a list of objects type restaurant with them
      if (data.results  && data.results.length > 0) {
        const places = data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
        }));
        setRestaurants(places);
      } else {
        Alert.alert('Error', 'No se encontraron restaurantes.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la lista de restaurantes.');
    }
  };

  // Toggle for restaurant visibility
  const toggleRestaurants = () => {
    //Fetches restaurants again to account for possible location change by the user (could be optimized)
    if (!showRestaurants) {
      fetchRestaurants();
    }
    setShowRestaurants(!showRestaurants);
  };
  
  return (
    <View style={styles.container}>
      {/*Shows user location or predetermined location and if showTraffic is true, it shows the traffic*/}
      <MapView
        style={styles.map}
        region={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsTraffic={showTraffic}
      >
      
      {/*Adds a marker in the current user location or default location*/}
      <Marker
          coordinate={{
            latitude: location?.coords.latitude || 37.78825,
            longitude: location?.coords.longitude || -122.4324,
          }}
          title="Mi ubicación"
          pinColor="blue"
      />

      {/*Adds a marker for each restaurant found*/}
      {showRestaurants && restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.location.latitude,
              longitude: restaurant.location.longitude,
            }}
            title={restaurant.name}
            description={restaurant.address}
          />
        ))}
      </MapView>

      {/*Adds buttons for traffic and nearby restaurants*/}
      <View style={styles.buttonContainer}>
        {/* Toggle Traffic */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showTraffic ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setShowTraffic(!showTraffic)}
        >
        <Text style={styles.buttonText}>
          {showTraffic ? 'Ocultar tráfico' : 'Mostrar tráfico'}
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showRestaurants ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={toggleRestaurants}
        >
          <Text style={styles.buttonText}>
            {showRestaurants ? 'Ocultar restaurantes' : 'Mostrar restaurantes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    height: '13%',
    width: '90%',
    right: 20,
    top: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  activeButton: {
    backgroundColor: 'blue',
  },
  inactiveButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MostrarMapa;

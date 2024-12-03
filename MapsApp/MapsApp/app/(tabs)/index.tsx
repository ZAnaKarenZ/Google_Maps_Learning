import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Button, StyleSheet, Alert } from 'react-native';

type Restaurant = {

    location: {
      lat: number;
      lng: number;
    };
  
  name: string;
  vicinity: string;
};

const MostrarMapa = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

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

  const fetchRestaurants = async () => {
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
      return;
    }

    const apiKey = '';
    const radius = 500;
    const type = 'restaurant';

    console.log(location.coords.latitude);
    console.log(location.coords.longitude);

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

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
        console.log(places);

        setRestaurants(places);
      } else {
        Alert.alert('Error', 'No se encontraron restaurantes.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la lista de restaurantes.');
    }
  };

  return (
    <View style={styles.container}>
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


        {restaurants.map((restaurant) => (
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
      <View style={styles.buttonContainer}>
        <Button
          title={showTraffic ? 'Ocultar tráfico' : 'Mostrar tráfico'}
          onPress={() => setShowTraffic(!showTraffic)}
        />
        <Button
          title="Mostrar restaurantes cercanos"
          onPress={fetchRestaurants}
          color="green"
        />
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
    height: '8%',
    right: 20,
    top: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
  },
});

export default MostrarMapa;

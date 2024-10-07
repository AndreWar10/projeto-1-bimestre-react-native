import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';

const Tab = createBottomTabNavigator();

const CardsScreen = ({ navigation }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorite = async (id) => {
    let updatedFavorites;
    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(favoriteId => favoriteId !== id);
    } else {
      updatedFavorites = [...favorites, id];
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites(); // Carrega favoritos sempre que a tela é focada
    }, [])
  );

  useEffect(() => {
    const fetchCharacters = async () => {
      if (query.length === 0) {
        setCharacters([]);
        setErrorMessage('');
        return;
      }

      setLoading(true);
      try {
        const data = await api.fetchCharacterByName(`${query}`);
        const response = data.results;

        if (response && response.length > 0) {
          setCharacters(response);
          setErrorMessage('');
        } else {
          setCharacters([]);
          setErrorMessage('Nenhum personagem encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar personagens:', error);
        setCharacters([]);
        setErrorMessage('Nenhum personagem encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [query]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.heartContainer}>
        <Icon
          name={favorites.includes(item.id) ? 'heart' : 'heart-o'}
          size={20}
          color={favorites.includes(item.id) ? 'red' : 'gray'}
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.location}>Última localização: {item.location.name}</Text>
        <Text style={styles.episode}>Primeiro episódio: {item.episode[0].split('/').pop()}</Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('Details', { characterId: item.id })}
        >
          <Text style={styles.detailsButtonText}>Ver Mais Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome de um personagem"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : (
            <FlatList
              data={characters}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          )}
        </>
      )}
    </View>
  );
};

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [savedCharacters, setSavedCharacters] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadSavedFavorites = async () => {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      };
      loadSavedFavorites();
    }, [])
  );

  useEffect(() => {
    const fetchSavedCharacters = async () => {
      if (favorites.length > 0) {
        const results = await Promise.all(
          favorites.map(async (id) => {
            const response = await api.fetchCharacterById(id);
            return response;
          })
        );
        setSavedCharacters(results);
      } else {
        setSavedCharacters([]); // Limpar personagens salvos se não houver favoritos
      }
    };
    fetchSavedCharacters();
  }, [favorites]);

  const removeFavorite = async (id) => {
    const updatedFavorites = favorites.filter(favoriteId => favoriteId !== id);
    setFavorites(updatedFavorites);
    setSavedCharacters(savedCharacters.filter(character => character.id !== id));
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const renderSavedItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.location}>Última localização: {item.location.name}</Text>

        <TouchableOpacity style={styles.removeButton} onPress={() => removeFavorite(item.id)}>
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {savedCharacters.length === 0 ? (
        <Text>Nenhum personagem salvo.</Text>
      ) : (
        <FlatList
          data={savedCharacters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSavedItem}
        />
      )}
    </View>
  );
};

const MyTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Adicionar Personagem"
        component={CardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Salvos"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#999',
  },
  location: {
    fontSize: 14,
    color: '#999',
  },
  episode: {
    fontSize: 14,
    color: '#999',
  },
  heartContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  detailsButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyTabs;

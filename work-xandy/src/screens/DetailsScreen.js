import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';

const DetailsScreen = ({ route }) => {
  const { characterId } = route.params;
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCharacterDetails = async () => {
      try {
        const data = await api.fetchCharacterById(characterId);
        setCharacter(data);
      } catch (error) {
        console.error('Falha ao buscar os detalhes do personagem:', error);
      } finally {
        setLoading(false);
      }
    };

    getCharacterDetails();
  }, [characterId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!character) {
    return <Text style={styles.errorText}>Personagem não encontrado.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: character.image }} style={styles.image} />
      <Text style={styles.name}>{character.name}</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{character.status}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Espécie:</Text>
          <Text style={styles.value}>{character.species}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Gênero:</Text>
          <Text style={styles.value}>{character.gender}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Origem:</Text>
          <Text style={styles.value}>{character.origin.name}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Última localização conhecida:</Text>
          <Text style={styles.value}>{character.location.name}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Primeira aparição em episódio:</Text>
          <Text style={styles.value}>Episódio {character.episode[0].split('/').pop()}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Apareceu em:</Text>
          <Text style={styles.value}>{character.episode.length} episódios</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Data de criação:</Text>
          <Text style={styles.value}>{new Date(character.created).toLocaleDateString('pt-BR')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00bcd4',
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap', // Isso vai quebrar o texto em várias linhas
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#00796b',
    flex: 1, // Permite que o texto ocupe o espaço disponível
  },
  value: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    flex: 1, // Permite que o texto ocupe o espaço disponível
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#00bcd4',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});

export default DetailsScreen;

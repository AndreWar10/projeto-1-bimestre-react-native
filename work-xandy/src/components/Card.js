// src/components/Card.js
import React from 'react';
import { View, Text, Button, Image } from 'react-native';

const Card = ({ character, onRemove, navigation }) => {
  return (
    <View>
      <Image source={{ uri: character.image }} style={{ width: 100, height: 100 }} />
      <Text>{character.name}</Text>
      <Button title="Ver Mais Detalhes" onPress={() => navigation.navigate('Details', { character })} />
      <Button title="Excluir" onPress={() => onRemove(character.id)} />
    </View>
  );
};

export default Card;

const BASE_URL = 'https://rickandmortyapi.com/api/character/';

const api = {
  fetchCharacters: async () => {
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  },

  fetchCharacterById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}${id}`);
      return await response.json();;
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error; 
    }
  },

  fetchCharacterByName: async (name) => {
    try {
      const response = await fetch(`${BASE_URL}?name=${name}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  },
};

export default api;

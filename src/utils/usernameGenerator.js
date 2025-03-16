import { uniqueNamesGenerator, adjectives, colors, animals, names } from 'unique-names-generator';

export const generateUsername = () => {
  // Configure the generator with multiple dictionaries for more variety
  const config = {
    dictionaries: [adjectives, colors, animals, names],
    separator: '',
    length: 2,
    style: 'capital'
  };
  
  // Generate a random name
  const randomName = uniqueNamesGenerator(config);
  
  // Add a random number to ensure uniqueness
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomName}${randomNumber}`;
};
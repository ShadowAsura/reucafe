import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const seedProgramSuggestions = async () => {
  const testPrograms = [
    {
      title: 'REU in Engineering',
      institution: 'Georgia Tech',
      location: 'Atlanta, GA',
      field: 'Engineering',
      deadline: '2023-02-20',
      stipend: '$5,500',
      duration: '10 weeks',
      description: 'Research experience in mechanical and electrical engineering.',
      link: 'https://example.com/gatech-reu',
      userId: 'test-user',
      userEmail: 'test@example.com',
      status: 'approved',
      createdAt: serverTimestamp(),
      source: 'User Suggested'
    },
    {
      title: 'REU in Neuroscience',
      institution: 'Johns Hopkins University',
      location: 'Baltimore, MD',
      field: 'Neuroscience',
      deadline: '2023-02-25',
      stipend: '$6,200',
      duration: '12 weeks',
      description: 'Research experience in cognitive neuroscience and brain imaging.',
      link: 'https://example.com/jhu-reu',
      userId: 'test-user',
      userEmail: 'test@example.com',
      status: 'pending',
      createdAt: serverTimestamp(),
      source: 'User Suggested'
    }
  ];

  for (const program of testPrograms) {
    try {
      await addDoc(collection(db, 'programSuggestions'), program);
      console.log(`Added test program: ${program.title}`);
    } catch (error) {
      console.error(`Error adding test program ${program.title}:`, error);
    }
  }

  console.log('Seeding complete!');
};
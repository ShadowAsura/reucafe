const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, writeBatch, doc, getDocs, query, where, serverTimestamp } = require('firebase/firestore');
const scraperController = require('../server/src/services/scrapers/scraperController.js');
const { standardizeFields } = require('../server/src/services/scrapers/fieldStandardizer');

const firebaseConfig = {
    apiKey: "AIzaSyARstQh4M_NkgDYoKrtoEMNlkQhgD-O0R8",
    authDomain: "thereucafe.firebaseapp.com",
    databaseURL: "https://thereucafe-default-rtdb.firebaseio.com",
    projectId: "thereucafe",
    storageBucket: "thereucafe.firebasestorage.app",
    messagingSenderId: "1076991401856",
    appId: "1:1076991401856:web:f1906e3b675ee3dcd0ab65",
    measurementId: "G-85K9X7F4L6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const saveToFirestore = async (programs, source) => {
  if (programs.length === 0) {
    console.log(`No programs to save for ${source}`);
    return;
  }
  
  const BATCH_SIZE = 500;
  let validPrograms = programs.map(program => {
    let cleanTitle = program.title?.trim() || '';
    
    if (source === 'googlesheets') {
      if (cleanTitle.includes('100%')) {
        if (program.field && program.institution) {
          const fieldName = Array.isArray(program.field) ? program.field[0] : program.field;
          cleanTitle = `${fieldName} Research at ${program.institution}`;
        } else if (program.institution) {
          cleanTitle = `Research Experience at ${program.institution}`;
        } else if (program.field) {
          const fieldName = Array.isArray(program.field) ? program.field[0] : program.field;
          cleanTitle = `${fieldName} Research Experience`;
        } else {
          cleanTitle = 'Undergraduate Research Experience';
        }
      }
    }
    let fieldValue = program.field;
    
    if (typeof fieldValue === 'string') {
      fieldValue = standardizeFields(fieldValue);
    } 
    else if (!Array.isArray(fieldValue)) {
      fieldValue = ['STEM'];
    }
    let deadlineDate;
    try {
      if (program.deadline) {
        if (source === 'googlesheets') {
          const dateString = program.deadline.toString().trim();
          console.log(`Processing deadline: "${dateString}" for program: ${cleanTitle}`);
          
          if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(dateString)) {
            deadlineDate = new Date(dateString);
          } else if (/[a-z]+ \d{1,2},? \d{4}/i.test(dateString)) {
            deadlineDate = new Date(dateString);
          } else if (/\d{4}-\d{2}-\d{2}/.test(dateString)) {
            deadlineDate = new Date(dateString);
          } else {
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthPattern = new RegExp(months.join('|'), 'i');
            const monthMatch = dateString.match(monthPattern);
            
            if (monthMatch) {
              const month = months.findIndex(m => m.toLowerCase() === monthMatch[0].toLowerCase()) + 1;
              const dayMatch = dateString.match(/\d{1,2}/);
              const yearMatch = dateString.match(/\d{4}/);
              
              if (month && dayMatch && yearMatch) {
                deadlineDate = new Date(yearMatch[0], month - 1, dayMatch[0]);
              } else if (month && dayMatch) {
                deadlineDate = new Date(2025, month - 1, dayMatch[0]);
              } else {
                deadlineDate = new Date('2025-02-15');
              }
            } else {
              deadlineDate = new Date('2025-02-15');
            }
          }
        } else if (source === 'sciencepathways') {
          deadlineDate = 'N/A';
        } else if (typeof program.deadline === 'string') {
          deadlineDate = new Date(program.deadline);
        } else if (program.deadline instanceof Date) {
          deadlineDate = program.deadline;
        } else {
          deadlineDate = 'N/A';
        }
        
        if (deadlineDate instanceof Date) {
          const timestamp = deadlineDate.getTime();
          if (isNaN(timestamp) || timestamp < -62135596800000 || timestamp > 253402300799000) {
            console.log(`Invalid deadline for program: ${cleanTitle}. Using N/A.`);
            deadlineDate = 'N/A';
          }
        }
      } else {
        if (source === 'sciencepathways') {
          deadlineDate = 'N/A';
        } else {
          deadlineDate = 'N/A';
        }
      }
    } catch (error) {
      console.log(`Error processing deadline for program: ${cleanTitle}`, error);
      deadlineDate = 'N/A';
    }
    
    return {
      title: cleanTitle || program.title?.trim() || '',
      institution: program.institution?.trim() || '',
      description: program.description?.trim() || '',
      location: program.location?.trim() || '',
      field: fieldValue,
      url: program.url?.trim() || program.link?.trim() || '',
      deadline: deadlineDate,
      stipend: program.stipend?.trim() || '$5,000-$6,000',
      duration: program.duration?.trim() || '10 weeks',
      source: source,
      status: 'active',
      updatedAt: new Date(),
      createdAt: new Date()
    };
  }).filter(program => program.title && program.institution);
  
  console.log(`Found ${programs.length} programs, ${validPrograms.length} valid for ${source}`);
  
  console.log('Checking for existing programs to avoid duplicates...');
  
  const programsRef = collection(db, 'programs');
  const existingProgramsSnapshot = await getDocs(programsRef);
  
  const existingPrograms = {};
  const existingUrls = new Set();
  
  existingProgramsSnapshot.forEach(doc => {
    const program = doc.data();
    
    const titleInstKey = `${program.title?.toLowerCase()}_${program.institution?.toLowerCase()}`;
    existingPrograms[titleInstKey] = doc.id;
    
    if (program.field && Array.isArray(program.field) && program.field.length > 0) {
      const instFieldKey = `${program.institution?.toLowerCase()}_${program.field[0]?.toLowerCase()}`;
      existingPrograms[instFieldKey] = doc.id;
    }
    
    if (program.url) {
      existingUrls.add(program.url.toLowerCase());
    }
  });
  
  console.log(`Found ${Object.keys(existingPrograms).length} existing programs in total`);
  
  const newPrograms = [];
  const updatePrograms = [];
  
  validPrograms.forEach(program => {
    const titleInstKey = `${program.title.toLowerCase()}_${program.institution.toLowerCase()}`;
    
    let instFieldKey = null;
    if (program.field && Array.isArray(program.field) && program.field.length > 0) {
      instFieldKey = `${program.institution.toLowerCase()}_${program.field[0].toLowerCase()}`;
    }
    
    const urlExists = program.url && existingUrls.has(program.url.toLowerCase());
    
    if (existingPrograms[titleInstKey]) {
      updatePrograms.push({
        id: existingPrograms[titleInstKey],
        data: program
      });
      console.log(`Found exact match for: ${program.title} at ${program.institution}`);
    } else if (instFieldKey && existingPrograms[instFieldKey]) {
      updatePrograms.push({
        id: existingPrograms[instFieldKey],
        data: program
      });
      console.log(`Found institution/field match for: ${program.title} at ${program.institution}`);
    } else if (urlExists) {
      let matchingId = null;
      existingProgramsSnapshot.forEach(doc => {
        const existingProgram = doc.data();
        if (existingProgram.url && existingProgram.url.toLowerCase() === program.url.toLowerCase()) {
          matchingId = doc.id;
        }
      });
      
      if (matchingId) {
        updatePrograms.push({
          id: matchingId,
          data: program
        });
        console.log(`Found URL match for: ${program.title} at ${program.institution}`);
      } else {
        newPrograms.push(program);
      }
    } else {
      newPrograms.push(program);
    }
  });
  
  console.log(`Found ${updatePrograms.length} programs to update and ${newPrograms.length} new programs to add`);
  
  const sourceSpecificProgramsRef = collection(db, 'programs');
  const q = query(sourceSpecificProgramsRef, where('source', '==', source));
  const sourceSpecificProgramsSnapshot = await getDocs(q);
  
  const existingSourcePrograms = {};
  sourceSpecificProgramsSnapshot.forEach(doc => {
    const program = doc.data();
    const key = `${program.title.toLowerCase()}_${program.institution.toLowerCase()}`;
    existingSourcePrograms[key] = doc.id;
  });
  
  console.log(`Found ${Object.keys(existingSourcePrograms).length} existing programs with source: ${source}`);

  let totalUpdated = 0;
  for (let i = 0; i < updatePrograms.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchPrograms = updatePrograms.slice(i, i + BATCH_SIZE);
    
    batchPrograms.forEach(program => {
      const programRef = doc(db, 'programs', program.id);
      batch.update(programRef, program.data);
    });
  
    await batch.commit();
    totalUpdated += batchPrograms.length;
    console.log(`Updated batch of ${batchPrograms.length} programs. Total updated: ${totalUpdated}`);
  }
  
  let totalAdded = 0;
  for (let i = 0; i < newPrograms.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchPrograms = newPrograms.slice(i, i + BATCH_SIZE);
    
    batchPrograms.forEach(program => {
      const programRef = doc(collection(db, 'programs'));
      batch.set(programRef, program);
    });
  
    await batch.commit();
    totalAdded += batchPrograms.length;
    console.log(`Added batch of ${batchPrograms.length} programs. Total added: ${totalAdded}`);
  }
  
  console.log(`Successfully processed ${totalUpdated + totalAdded} programs from ${source} (${totalUpdated} updated, ${totalAdded} added)`);
};

const runScrapers = async () => {
  try {
    console.log('Starting scrapers...');
    
    const results = await scraperController.runAllScrapers();
    
    if (results[0].status === 'fulfilled' && results[0].value) {
      console.log('NSF scraper completed successfully');
      await saveToFirestore(results[0].value, 'nsf');
    } else if (results[0].status === 'rejected') {
      console.error('NSF scraper failed:', results[0].reason);
    }
    
    if (results[1].status === 'fulfilled' && results[1].value) {
      console.log('Google Sheets scraper completed successfully');
      await saveToFirestore(results[1].value, 'googlesheets');
    } else if (results[1].status === 'rejected') {
      console.error('Google Sheets scraper failed:', results[1].reason);
    }
    
    if (results[2].status === 'fulfilled' && results[2].value) {
      console.log('Science Pathways scraper completed successfully');
      await saveToFirestore(results[2].value, 'sciencepathways');
    } else if (results[2].status === 'rejected') {
      console.error('Science Pathways scraper failed:', results[2].reason);
    }

    console.log('All scrapers completed successfully');
  } catch (error) {
    console.error('Error running scrapers:', error);
  } finally {
    setTimeout(() => process.exit(0), 2000);
  }
};

runScrapers();
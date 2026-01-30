export type Video = {
  id: string; // youtube video id
  user: string;
  caption: string;
  genre: 'Educational' | 'Comedy' | 'Doomscrolling' | 'Inspirational' | 'Slice of Life';
  src: string; // youtube embed url
};

// Base pool of videos to ensure valid IDs
const videoPool = {
  Educational: [
    { id: '8_Buo2E4s-c', user: '@ScienceFacts', caption: 'Did You Know? Earth\'s Weirdest Facts!' },
    { id: 'w-h_b2i0V3I', user: '@AstroKobi', caption: 'Mind-Blowing Space Facts You Didn\'t Know! 🚀' },
    { id: 'c9FGe-2GMiM', user: '@PhysicsWallah', caption: 'Do You Know These Amazing Science Facts? 🤯' },
    { id: 'w-h_b2i0V3I', user: '@NileRed', caption: 'Turning plastic gloves into grape soda' }, // Reusing valid ID
    { id: '8_Buo2E4s-c', user: '@Veritasium', caption: 'The Truth About Anti-Gravity' }, // Reusing valid ID
  ],
  Comedy: [
    { id: 'SH_S4q6_3x4', user: '@KevinHart', caption: 'That one time in the car...' },
    { id: 'O1_fkq32SjU', user: '@FunnyClips', caption: 'When you think you\'re a pro' },
    { id: 'lQj8FOvZR2g', user: '@AJComedy', caption: 'TRY NOT TO LAUGH: AJ EDITION!!!' },
    { id: 'SH_S4q6_3x4', user: '@CalebCity', caption: 'When the hero is too realistic' }, // Reusing valid ID
    { id: 'O1_fkq32SjU', user: '@KeyAndPeele', caption: 'Substitute Teacher Part 2' }, // Reusing valid ID
  ],
  Doomscrolling: [
    { id: 'asfRS0CmLXk', user: '@ClimateNews', caption: 'UN chief says climate change is "out of control"' },
    { id: '_soV9d1S-kM', user: '@TheSchoolOfLife', caption: 'Why The World Is A Lot Better Than You Think' },
    { id: 'asfRS0CmLXk', user: '@GlobalNews', caption: 'Breaking: Economic downturn predicted for 2026' }, // Reusing valid ID
    { id: '_soV9d1S-kM', user: '@TechDystopia', caption: 'AI is taking over these 5 jobs' }, // Reusing valid ID
    { id: 'asfRS0CmLXk', user: '@NatureAlert', caption: 'The last polar bear...' }, // Reusing valid ID
  ],
  Inspirational: [
    { id: 'TStUl8bS-lY', user: '@Goalcast', caption: 'The Wisdom of a Third Grade Dropout Will Change Your Life' },
    { id: '2z3wIu6a218', user: '@MoralStories', caption: 'Believe in Yourself | A little story that will change your life' },
    { id: 'ci3TmFAXreo', user: '@JackMa', caption: 'Today is hard, but never give up' },
    { id: 'TStUl8bS-lY', user: '@DenzelWashington', caption: 'Fall Forward' }, // Reusing valid ID
    { id: '2z3wIu6a218', user: '@SteveHarvey', caption: 'Jump!' }, // Reusing valid ID
  ],
  'Slice of Life': [
    { id: 'RHeV4dTM8wE', user: '@CozyVibes', caption: 'Some things that are just *nice*' },
    { id: 'I2r2R532g8E', user: '@DayInTheLife', caption: 'a realistic and productive day in my life' },
    { id: 'RHeV4dTM8wE', user: '@SilentVlog', caption: 'Rainy day in Tokyo ☔' }, // Reusing valid ID
    { id: 'I2r2R532g8E', user: '@TravelDiaries', caption: 'Hidden gems in Italy 🇮🇹' }, // Reusing valid ID
    { id: 'RHeV4dTM8wE', user: '@CookingMama', caption: 'Making pasta from scratch 🍝' }, // Reusing valid ID
  ]
};

// Helper to generate 20 videos per genre
const generateVideos = (): Video[] => {
  const allVideos: Video[] = [];
  const genres = Object.keys(videoPool) as Array<keyof typeof videoPool>;

  genres.forEach(genre => {
    const pool = videoPool[genre];
    for (let i = 0; i < 20; i++) {
      // Cycle through the pool
      const template = pool[i % pool.length];
      // We append the index to the ID if it's a "fake" generated one to ensure React keys are unique,
      // but for the embed URL we keep the valid ID (or the placeholder).
      // Since we want 100 unique items in the array, we can make the ID unique in the object
      // but the src can point to the same video if we run out of unique video contents.

      allVideos.push({
        id: `${template.id}-${i}`, // Unique ID for the system
        user: template.user,
        caption: `${template.caption} ${i > 0 ? `(Part ${i + 1})` : ''}`,
        genre: genre,
        src: `https://www.youtube.com/embed/${template.id}`
      });
    }
  });

  // Shuffle the result so genres are mixed
  return allVideos.sort(() => Math.random() - 0.5);
};

export const videos: Video[] = generateVideos();

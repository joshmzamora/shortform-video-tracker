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
    { id: '9dMFxnpEkKc', user: '@EducationalChannel', caption: 'Science Experiment: Did You Know? Earth\'s Weirdest Facts!' },
    { id: '0ls37smQRXc', user: '@EducationalChannel', caption: 'Learning Shapes: Learn all about shapes!' },
    { id: '6E10ebsKg0M', user: '@EducationalChannel', caption: 'Kids Learning: Fun learning for kids!' },
    { id: 'V1Ticoqoidc', user: '@EducationalChannel', caption: 'Math Tricks: Amazing math tricks!' },
    { id: 'HlX290t3xI8', user: '@EducationalChannel', caption: 'History Fact: Fascinating historical facts!' },
    { id: 'vMt4HwCsKWk', user: '@EducationalChannel', caption: 'Tech Tip: Useful tech tips!' },
    { id: '5X6F8_3kLpA', user: '@EducationalChannel', caption: 'Geography Trivia: Test your geography knowledge!' },
    { id: '7F8G9_2kJLM', user: '@EducationalChannel', caption: 'Biology Bite: Quick biology facts!' },
    { id: '9G8H7_4mLpS', user: '@EducationalChannel', caption: 'Physics Fun: Enjoy learning physics!' },
    { id: '1H2I3_5mNpO', user: '@EducationalChannel', caption: 'Language Lesson: Learn a new language!' },
    { id: '2K3L4_6oNpR', user: '@EducationalChannel', caption: 'Animal Facts: Amazing animal facts!' },
    { id: '3L4M5_7pQqT', user: '@EducationalChannel', caption: 'Space Mystery: Unraveling space mysteries!' },
    { id: '4M5N6_8rRrU', user: '@EducationalChannel', caption: 'Coding Basics: Get started with coding!' },
    { id: '5N6O7_9sSsV', user: '@EducationalChannel', caption: 'Invention History: The history of inventions!' },
    { id: '6O7P8_0tTtW', user: '@EducationalChannel', caption: 'Psychology Fact: Interesting psychology facts!' },
    { id: '7P8Q9_1uUuX', user: '@EducationalChannel', caption: 'Art History: Explore art history!' },
    { id: '8Q9R0_2vVvY', user: '@EducationalChannel', caption: 'Money Management: Tips for managing your money!' },
    { id: '9R0S1_3wWwZ', user: '@EducationalChannel', caption: 'Chemical Reaction: Exciting chemical reactions!' },
    { id: '0S1T2_4xXxA', user: '@EducationalChannel', caption: 'Quick Logic Puzzle: Solve this puzzle!' },
    { id: '1T2U3_5yYyB', user: '@EducationalChannel', caption: 'Grammar Hack: Improve your grammar!' },
  ],
  Comedy: [
    { id: 'NwHBHRGrQLA', user: '@ComedyChannel', caption: 'Monkey Makeover' },
    { id: '16bk3BLplmU', user: '@ComedyChannel', caption: 'Funny Moments' },
    { id: '_pwFHaCm134', user: '@ComedyChannel', caption: 'Vlog Parody' },
    { id: '0Id023w1BCo', user: '@ComedyChannel', caption: 'Prank Video' },
    { id: '9_A9cH3_rhA', user: '@ComedyChannel', caption: 'Friend Comedy' },
    { id: 'A1B2C3D4E5F', user: '@ComedyChannel', caption: 'Pet Bloopers' },
    { id: 'B2C3D4E5F6G', user: '@ComedyChannel', caption: 'Office Humour' },
    { id: 'C3D4E5F6G7H', user: '@ComedyChannel', caption: 'Dad Jokes' },
    { id: 'D4E5F6G7H8I', user: '@ComedyChannel', caption: 'Cooking Fails' },
    { id: 'E5F6G7H8I9J', user: '@ComedyChannel', caption: 'Gaming Rage' },
    { id: 'F6G7H8I9J0K', user: '@ComedyChannel', caption: 'School Relatability' },
    { id: 'G7H8I9J0K1L', user: '@ComedyChannel', caption: 'Workout Struggles' },
    { id: 'H8I9J0K1L2M', user: '@ComedyChannel', caption: 'Impersonations' },
    { id: 'I9J0K1L2M3N', user: '@ComedyChannel', caption: 'Customer Service' },
    { id: 'J0K1L2M3N4O', user: '@ComedyChannel', caption: 'Expectation vs Reality' },
    { id: 'K1L2M3N4O5P', user: '@ComedyChannel', caption: 'Silent Comedy' },
    { id: 'L2M3N4O5P6Q', user: '@ComedyChannel', caption: 'Baby Giggles' },
    { id: 'M3N4O5P6Q7R', user: '@ComedyChannel', caption: 'Awkward Situations' },
    { id: 'N4O5P6Q7R8S', user: '@ComedyChannel', caption: 'Relationship Skit' },
    { id: 'O5P6Q7R8S9T', user: '@ComedyChannel', caption: 'Meme Recreation' },
  ],
  Doomscrolling: [
    { id: 'PxCPBVqjdaM', user: '@DoomscrollingChannel', caption: 'Stop Scrolling Loop' },
    { id: 'H92EOuPwWEc', user: '@DoomscrollingChannel', caption: 'Miniature Bookshelf' },
    { id: 'RKpCOKQWZGQ', user: '@DoomscrollingChannel', caption: 'ASMR Beanbags' },
    { id: 'C_738ddNvuc', user: '@DoomscrollingChannel', caption: 'Satisfying 3D Loop' },
    { id: 'Mvc_TuM6_3A', user: '@DoomscrollingChannel', caption: 'Donut Loop' },
    { id: 'P6Q7R8S9T0U', user: '@DoomscrollingChannel', caption: 'Hydraulic Press' },
    { id: 'Q7R8S9T0U1V', user: '@DoomscrollingChannel', caption: 'Kinetic Sand' },
    { id: 'R8S9T0U1V2W', user: '@DoomscrollingChannel', caption: 'Power Washing' },
    { id: 'S9T0U1V2W3X', user: '@DoomscrollingChannel', caption: 'Soap Cutting' },
    { id: 'T0U1V2W3X4Y', user: '@DoomscrollingChannel', caption: 'Slime ASMR' },
    { id: 'U1V2W3X4Y5Z', user: '@DoomscrollingChannel', caption: 'Paint Mixing' },
    { id: 'V2W3X4Y5Z6A', user: '@DoomscrollingChannel', caption: 'Rug Cleaning' },
    { id: 'W3X4Y5Z6A7B', user: '@DoomscrollingChannel', caption: 'Laser Rust Removal' },
    { id: 'X4Y5Z6A7B8C', user: '@DoomscrollingChannel', caption: 'Glass Blowing' },
    { id: 'Y5Z6A7B8C9D', user: '@DoomscrollingChannel', caption: 'Satisfying Dominoes' },
    { id: 'Z6A7B8C9D0E', user: '@DoomscrollingChannel', caption: 'Fruit Slicing' },
    { id: 'A7B8C9D0E1F', user: '@DoomscrollingChannel', caption: 'CGI Water Loop' },
    { id: 'B8C9D0E1F2G', user: '@DoomscrollingChannel', caption: 'Lawn Mowing' },
    { id: 'C9D0E1F2G3H', user: '@DoomscrollingChannel', caption: 'Pottery Throwing' },
    { id: 'D0E1F2G3H4I', user: '@DoomscrollingChannel', caption: 'Honeycomb Harvesting' },
  ],
  Inspirational: [
    { id: 'NaxpixrERNI', user: '@InspirationalChannel', caption: 'Keanu Reeves Wisdom' },
    { id: '_XCZX_NaDtU', user: '@InspirationalChannel', caption: 'Believe in Yourself' },
    { id: '5XZdLZwoNV8', user: '@InspirationalChannel', caption: 'Ted Lasso - Be Yourself' },
    { id: 'kjsqQPMTbd4', user: '@InspirationalChannel', caption: 'The Best Quote' },
    { id: 'Q0BOH_s9gSU', user: '@InspirationalChannel', caption: 'Tom Holland Advice' },
    { id: 'WPs-8BHOQug', user: '@InspirationalChannel', caption: 'Les Brown - Life is Hard' },
    { id: 'E1F2G3H4I5J', user: '@InspirationalChannel', caption: 'Rise and Grind' },
    { id: 'F2G3H4I5J6K', user: '@InspirationalChannel', caption: 'Never Give Up' },
    { id: 'G3H4I5J6K7L', user: '@InspirationalChannel', caption: 'Denzel Washington Speed' },
    { id: 'H4I5J6K7L8M', user: '@InspirationalChannel', caption: 'Mindset Shift' },
    { id: 'I5J6K7L8M9N', user: '@InspirationalChannel', caption: 'Overcoming Fear' },
    { id: 'J6K7L8M9N0O', user: '@InspirationalChannel', caption: 'Self Love' },
    { id: 'K7L8M9N0O1P', user: '@InspirationalChannel', caption: 'Goal Setting' },
    { id: 'L8M9N0O1P2Q', user: '@InspirationalChannel', caption: 'Daily Affirmation' },
    { id: 'M9N0O1P2Q3R', user: '@InspirationalChannel', caption: 'Success Secrets' },
    { id: 'N0O1P2Q3R4S', user: '@InspirationalChannel', caption: 'Arnold\'s Rules' },
    { id: 'O1P2Q3R4S5T', user: '@InspirationalChannel', caption: 'Gratitude Practice' },
    { id: 'P2Q3R4S5T6U', user: '@InspirationalChannel', caption: 'Small Wins' },
    { id: 'Q3R4S5T6U7V', user: '@InspirationalChannel', caption: 'Finding Purpose' },
    { id: 'R4S5T6U7V8W', user: '@InspirationalChannel', caption: 'Morning Routine' },
  ],
  'Slice of Life': [
    { id: 'wPvgOg1rbIc', user: '@SliceOfLifeChannel', caption: 'Japan Vlog' },
    { id: 'GoAxQdySKFQ', user: '@SliceOfLifeChannel', caption: 'Anime Recommendation' },
    { id: 'hBhTNc46M9c', user: '@SliceOfLifeChannel', caption: 'Romance Anime' },
    { id: '2FDPsa39Ew8', user: '@SliceOfLifeChannel', caption: 'Blue Box Snippet' },
    { id: 'S5T6U7V8W9X', user: '@SliceOfLifeChannel', caption: 'Morning in Seoul' },
    { id: 'T6U7V8W9X0Y', user: '@SliceOfLifeChannel', caption: 'Cozy Desk Setup' },
    { id: 'U7V8W9X0Y1Z', user: '@SliceOfLifeChannel', caption: 'Reading Journal' },
    { id: 'V8W9X0Y1Z2A', user: '@SliceOfLifeChannel', caption: 'Apartment Cleaning' },
    { id: 'W9X0Y1Z2A3B', user: '@SliceOfLifeChannel', caption: 'Coffee Brewing' },
    { id: 'X0Y1Z2A3B4C', user: '@SliceOfLifeChannel', caption: 'Walk in the Rain' },
    { id: 'Y1Z2A3B4C5D', user: '@SliceOfLifeChannel', caption: 'Commuter Life' },
    { id: 'Z2A3B4C5D6E', user: '@SliceOfLifeChannel', caption: 'Grocery Haul' },
    { id: 'A3B4C5D6E7F', user: '@SliceOfLifeChannel', caption: 'Skincare Routine' },
    { id: 'B4C5D6E7F8G', user: '@SliceOfLifeChannel', caption: 'Pet Care' },
    { id: 'C5D6E7F8G9H', user: '@SliceOfLifeChannel', caption: 'Cooking for One' },
    { id: 'D6E7F8G9H0I', user: '@SliceOfLifeChannel', caption: 'Solo Date' },
    { id: 'E7F8G9H0I1J', user: '@SliceOfLifeChannel', caption: 'Garden Harvest' },
    { id: 'F8G9H0I1J2K', user: '@SliceOfLifeChannel', caption: 'Artist Vlog' },
    { id: 'G9H0I1J2K3L', user: '@SliceOfLifeChannel', caption: 'Student Life' },
    { id: 'H0I1J2K3L4M', user: '@SliceOfLifeChannel', caption: 'Night Routine' },
  ],
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

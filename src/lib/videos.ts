export type Video = {
  id: string; // youtube video id
  user: string;
  caption: string;
  genre: 'Educational' | 'Comedy' | 'Doomscrolling' | 'Inspirational' | 'Slice of Life';
  src: string; // youtube embed url
};

// Shuffled list of videos for the experiment
export const videos: Video[] = [
    { id: 'TStUl8bS-lY', user: '@Goalcast', caption: 'The Wisdom of a Third Grade Dropout Will Change Your Life', genre: 'Inspirational', src: 'https://www.youtube.com/embed/TStUl8bS-lY' },
    { id: '8_Buo2E4s-c', user: '@ScienceFacts', caption: 'Did You Know? Earth\'s Weirdest Facts!', genre: 'Educational', src: 'https://www.youtube.com/embed/8_Buo2E4s-c' },
    { id: 'SH_S4q6_3x4', user: '@KevinHart', caption: 'That one time in the car...', genre: 'Comedy', src: 'https://www.youtube.com/embed/SH_S4q6_3x4' },
    { id: 'RHeV4dTM8wE', user: '@CozyVibes', caption: 'Some things that are just *nice*', genre: 'Slice of Life', src: 'https://www.youtube.com/embed/RHeV4dTM8wE' },
    { id: 'asfRS0CmLXk', user: '@ClimateNews', caption: 'UN chief says climate change is "out of control"', genre: 'Doomscrolling', src: 'https://www.youtube.com/embed/asfRS0CmLXk' },
    { id: 'w-h_b2i0V3I', user: '@AstroKobi', caption: 'Mind-Blowing Space Facts You Didn\'t Know! 🚀', genre: 'Educational', src: 'https://www.youtube.com/embed/w-h_b2i0V3I' },
    { id: '2z3wIu6a218', user: '@MoralStories', caption: 'Believe in Yourself | A little story that will change your life', genre: 'Inspirational', src: 'https://www.youtube.com/embed/2z3wIu6a218' },
    { id: 'O1_fkq32SjU', user: '@FunnyClips', caption: 'When you think you\'re a pro', genre: 'Comedy', src: 'https://www.youtube.com/embed/O1_fkq32SjU' },
    { id: '_soV9d1S-kM', user: '@TheSchoolOfLife', caption: 'Why The World Is A Lot Better Than You Think', genre: 'Doomscrolling', src: 'https://www.youtube.com/embed/_soV9d1S-kM' },
    { id: 'I2r2R532g8E', user: '@DayInTheLife', caption: 'a realistic and productive day in my life', genre: 'Slice of Life', src: 'https://www.youtube.com/embed/I2r2R532g8E' },
];

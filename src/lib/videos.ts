export type Video = {
  id: string; // youtube video id
  user: string;
  caption: string;
  genre: 'Dance' | 'Cooking' | 'Comedy' | 'Animals' | 'DIY' | 'Travel' | 'Music' | 'Art' | 'Tech';
  src: string; // youtube embed url
};

export const videos: Video[] = [
    // Dance
    { id: 'C-u5WLJ9Yk4', user: '@danceLover', caption: 'Amazing choreography!', genre: 'Dance', src: 'https://www.youtube.com/embed/C-u5WLJ9Yk4' },
    { id: '2Vv-BfVoq4g', user: '@streetDancer', caption: 'Hip-hop moves', genre: 'Dance', src: 'https://www.youtube.com/embed/2Vv-BfVoq4g' },
    // Cooking
    { id: 'bb295_z2iX8', user: '@masterChef', caption: 'Delicious pasta recipe', genre: 'Cooking', src: 'https://www.youtube.com/embed/bb295_z2iX8' },
    { id: '3G3QIz72-2A', user: '@quickBites', caption: '5-minute breakfast', genre: 'Cooking', src: 'https://www.youtube.com/embed/3G3QIz72-2A' },
    // Comedy
    { id: 'SH_S4q6_3x4', user: '@joker', caption: 'Funniest stand-up ever', genre: 'Comedy', src: 'https://www.youtube.com/embed/SH_S4q6_3x4' },
    { id: 'O1_fkq32SjU', user: '@laughOutLoud', caption: 'Try not to laugh', genre: 'Comedy', src: 'https://www.youtube.com/embed/O1_fkq32SjU' },
    // Animals
    { id: 'jPS5dI2gKZA', user: '@animalPlanet', caption: 'Cute puppies', genre: 'Animals', src: 'https://www.youtube.com/embed/jPS5dI2gKZA' },
    { id: 'E2aFpFyD3sA', user: '@wildLife', caption: 'Funny cat moments', genre: 'Animals', src: 'https://www.youtube.com/embed/E2aFpFyD3sA' },
    // DIY
    { id: 'oV24Tf2tO9s', user: '@diyCreator', caption: 'Awesome DIY project', genre: 'DIY', src: 'https://www.youtube.com/embed/oV24Tf2tO9s' },
    { id: 'v250x642sog', user: '@crafty', caption: 'Home decor ideas', genre: 'DIY', src: 'https://www.youtube.com/embed/v250x642sog' },
    // Travel
    { id: 'A92t8iQ_gtI', user: '@traveller', caption: 'Exploring Bali', genre: 'Travel', src: 'https://www.youtube.com/embed/A92t8iQ_gtI' },
    { id: '1zpf8H_e43I', user: '@wanderer', caption: 'A trip to the Swiss Alps', genre: 'Travel', src: 'https://www.youtube.com/embed/1zpf8H_e43I' },
    // Music
    { id: 'ZbZSe6N_BXs', user: '@musicFeels', caption: 'Acoustic cover', genre: 'Music', src: 'https://www.youtube.com/embed/ZbZSe6N_BXs' },
    { id: 'ktvTqknDobU', user: '@popStar', caption: 'Official music video', genre: 'Music', src: 'https://www.youtube.com/embed/ktvTqknDobU' },
    // Art
    { id: 'yX9sQYp4_3s', user: '@artist', caption: 'Speed painting', genre: 'Art', src: 'https://www.youtube.com/embed/yX9sQYp4_3s' },
    { id: '0fC_olpE0T4', user: '@creativeMind', caption: 'Abstract art tutorial', genre: 'Art', src: 'https://www.youtube.com/embed/0fC_olpE0T4' },
    // Tech
    { id: 'iG2de2_2j4o', user: '@techGuru', caption: 'Latest smartphone review', genre: 'Tech', src: 'https://www.youtube.com/embed/iG2de2_2j4o' },
    { id: 'd_RTySKSz20', user: '@gadgetGeek', caption: 'Top 5 gadgets of 2024', genre: 'Tech', src: 'https://www.youtube.com/embed/d_RTySKSz20' },
];

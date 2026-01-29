import { PlaceHolderImages } from './placeholder-images';

export type Video = {
  id: string;
  user: string;
  caption: string;
  genre: 'Dance' | 'Cooking' | 'Comedy' | 'Animals' | 'DIY';
  src: string;
  imageHint: string;
};

const videoPlaceholders = {
  'video-1': PlaceHolderImages.find(img => img.id === 'video-1'),
  'video-2': PlaceHolderImages.find(img => img.id === 'video-2'),
  'video-3': PlaceHolderImages.find(img => img.id === 'video-3'),
  'video-4': PlaceHolderImages.find(img => img.id === 'video-4'),
  'video-5': PlaceHolderImages.find(img => img.id === 'video-5'),
};

export const videos: Video[] = [
  {
    id: 'vid001',
    user: '@dancemaster',
    caption: 'Check out these new moves! #dance #citylife',
    genre: 'Dance',
    src: videoPlaceholders['video-1']!.imageUrl,
    imageHint: videoPlaceholders['video-1']!.imageHint,
  },
  {
    id: 'vid002',
    user: '@chefanna',
    caption: 'Whipping up a quick and tasty pasta dish 🍝 #cooking #recipe',
    genre: 'Cooking',
    src: videoPlaceholders['video-2']!.imageUrl,
    imageHint: videoPlaceholders['video-2']!.imageHint,
  },
  {
    id: 'vid003',
    user: '@funnyfelines',
    caption: 'Mittens is at it again! 😂 #cat #funnyanimals',
    genre: 'Animals',
    src: videoPlaceholders['video-3']!.imageUrl,
    imageHint: videoPlaceholders['video-3']!.imageHint,
  },
  {
    id: 'vid004',
    user: '@jokesterjoe',
    caption: 'My thoughts on pineapple on pizza... #comedy #standup',
    genre: 'Comedy',
    src: videoPlaceholders['video-4']!.imageUrl,
    imageHint: videoPlaceholders['video-4']!.imageHint,
  },
  {
    id: 'vid005',
    user: '@craftycarol',
    caption: 'Easy DIY phone stand you can make in 5 minutes! #diy #crafts',
    genre: 'DIY',
    src: videoPlaceholders['video-5']!.imageUrl,
    imageHint: videoPlaceholders['video-5']!.imageHint,
  },
];

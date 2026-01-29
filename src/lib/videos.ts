import { PlaceHolderImages, type ImagePlaceholder } from './placeholder-images';

export type Video = {
  id: string;
  user: string;
  caption: string;
  genre: 'Dance' | 'Cooking' | 'Comedy' | 'Animals' | 'DIY' | 'Travel' | 'Music' | 'Art' | 'Tech';
  src: string;
  imageHint: string;
};

const videoDetails: Record<string, { user: string; caption: string; genre: Video['genre'] }> = {
  'dance city': { user: '@dancemaster', caption: 'Check out these new moves! #dance #citylife', genre: 'Dance' },
  'cooking food': { user: '@chefanna', caption: 'Whipping up a quick and tasty pasta dish 🍝 #cooking #recipe', genre: 'Cooking' },
  'cute cat': { user: '@funnyfelines', caption: 'Mittens is at it again! 😂 #cat #funnyanimals', genre: 'Animals' },
  'standup comedy': { user: '@jokesterjoe', caption: 'My thoughts on pineapple on pizza... #comedy #standup', genre: 'Comedy' },
  'diy craft': { user: '@craftycarol', caption: 'Easy DIY phone stand you can make in 5 minutes! #diy #crafts', genre: 'DIY' },
  'hiking mountains': { user: '@adventureseeker', caption: 'Lost in the mountains. What a view! #travel #hiking', genre: 'Travel' },
  'guitar music': { user: '@rockstarriffs', caption: 'New song dropping Friday! #music #guitar', genre: 'Music' },
  'artist painting': { user: '@artbyalex', caption: 'Bringing this canvas to life. #art #painting', genre: 'Art' },
  'dog park': { user: '@dogdayafternoons', caption: 'He could do this all day. #dog #fetch', genre: 'Animals' },
  'tech review': { user: '@techguru', caption: 'Unboxing the new GizmoPhone 2000! #tech #unboxing', genre: 'Tech' },
};

export const videos: Video[] = PlaceHolderImages.map((image: ImagePlaceholder) => {
  const details = videoDetails[image.imageHint] || { 
    user: '@creator', 
    caption: 'An awesome video!',
    genre: 'Art' 
  };
  return {
    id: image.id,
    user: details.user,
    caption: details.caption,
    genre: details.genre,
    src: image.imageUrl,
    imageHint: image.imageHint,
  };
});

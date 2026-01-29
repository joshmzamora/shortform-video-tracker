import { PlaceHolderImages } from './placeholder-images';

export type Video = {
  id: string;
  user: string;
  caption: string;
  genre: 'Dance' | 'Cooking' | 'Comedy' | 'Animals' | 'DIY' | 'Travel' | 'Music' | 'Art' | 'Tech';
  src: string;
  imageHint: string;
};

const videoData = [
  { id: 'vid001', user: '@dancemaster', caption: 'Check out these new moves! #dance #citylife', genre: 'Dance', placeholderId: 'video-1' },
  { id: 'vid002', user: '@chefanna', caption: 'Whipping up a quick and tasty pasta dish 🍝 #cooking #recipe', genre: 'Cooking', placeholderId: 'video-2' },
  { id: 'vid003', user: '@funnyfelines', caption: 'Mittens is at it again! 😂 #cat #funnyanimals', genre: 'Animals', placeholderId: 'video-3' },
  { id: 'vid004', user: '@jokesterjoe', caption: 'My thoughts on pineapple on pizza... #comedy #standup', genre: 'Comedy', placeholderId: 'video-4' },
  { id: 'vid005', user: '@craftycarol', caption: 'Easy DIY phone stand you can make in 5 minutes! #diy #crafts', genre: 'DIY', placeholderId: 'video-5' },
  { id: 'vid006', user: '@adventureseeker', caption: 'Lost in the mountains. What a view! #travel #hiking', genre: 'Travel', placeholderId: 'video-6' },
  { id: 'vid007', user: '@rockstarriffs', caption: 'New song dropping Friday! #music #guitar', genre: 'Music', placeholderId: 'video-7' },
  { id: 'vid008', user: '@artbyalex', caption: 'Bringing this canvas to life. #art #painting', genre: 'Art', placeholderId: 'video-8' },
  { id: 'vid009', user: '@dogdayafternoons', caption: 'He could do this all day. #dog #fetch', genre: 'Animals', placeholderId: 'video-9' },
  { id: 'vid010', user: '@techguru', caption: 'Unboxing the new GizmoPhone 2000! #tech #unboxing', genre: 'Tech', placeholderId: 'video-10' },
];

export const videos: Video[] = videoData.map(data => {
  const placeholder = PlaceHolderImages.find(p => p.id === data.placeholderId);
  if (!placeholder) {
      return null;
  }
  return {
      id: data.id,
      user: data.user,
      caption: data.caption,
      genre: data.genre,
      src: placeholder.imageUrl,
      imageHint: placeholder.imageHint,
  }
}).filter((v): v is Video => v !== null);

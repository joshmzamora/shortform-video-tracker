export type Video = {
  id: string;
  user: string;
  caption: string;
  genre: 'Dance' | 'Cooking' | 'Comedy' | 'Animals' | 'DIY' | 'Travel' | 'Music' | 'Art' | 'Tech';
  src: string;
  imageHint: string;
};

export const videos: Video[] = [
  {
    id: 'vid001',
    user: '@dancemaster',
    caption: 'Check out these new moves! #dance #citylife',
    genre: 'Dance',
    src: 'https://images.unsplash.com/photo-1644936412314-fc206c982884?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkYW5jZSUyMGNpdHl8ZW58MHx8fHwxNzY5NjU2ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'dance city',
  },
  {
    id: 'vid002',
    user: '@chefanna',
    caption: 'Whipping up a quick and tasty pasta dish 🍝 #cooking #recipe',
    genre: 'Cooking',
    src: 'https://images.unsplash.com/photo-1636647511414-c9ec06da32bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y29va2luZyUyMGZvb2R8ZW58MHx8fHwxNzY5NjU2ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'cooking food',
  },
  {
    id: 'vid003',
    user: '@funnyfelines',
    caption: 'Mittens is at it again! 😂 #cat #funnyanimals',
    genre: 'Animals',
    src: 'https://images.unsplash.com/photo-1598935888738-cd2622bcd437?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjdXRlJTIwY2F0fGVufDB8fHx8MTc2OTYyNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'cute cat',
  },
  {
    id: 'vid004',
    user: '@jokesterjoe',
    caption: 'My thoughts on pineapple on pizza... #comedy #standup',
    genre: 'Comedy',
    src: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzdGFuZHVwJTIwY29tZWR5fGVufDB8fHx8MTc2OTY1NjgwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'standup comedy',
  },
  {
    id: 'vid005',
    user: '@craftycarol',
    caption: 'Easy DIY phone stand you can make in 5 minutes! #diy #crafts',
    genre: 'DIY',
    src: 'https://images.unsplash.com/photo-1757626065729-a13f763423e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxkaXklMjBjcmFmdHxlbnwwfHx8fDE3Njk2NTY4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'diy craft',
  },
  {
    id: 'vid006',
    user: '@adventureseeker',
    caption: 'Lost in the mountains. What a view! #travel #hiking',
    genre: 'Travel',
    src: 'https://images.unsplash.com/photo-1635001360483-6772df57f2f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxoaWtpbmclMjBtb3VudGFpbnN8ZW58MHx8fHwxNzY5NjA3MDI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'hiking mountains',
  },
  {
    id: 'vid007',
    user: '@rockstarriffs',
    caption: 'New song dropping Friday! #music #guitar',
    genre: 'Music',
    src: 'https://images.unsplash.com/photo-1747494748987-c0904d8851d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxndWl0YXIlMjBtdXNpY3xlbnwwfHx8fDE3Njk2MTQ0MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'guitar music',
  },
  {
    id: 'vid008',
    user: '@artbyalex',
    caption: 'Bringing this canvas to life. #art #painting',
    genre: 'Art',
    src: 'https://images.unsplash.com/photo-1613574714687-c33b9e90200d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhcnRpc3QlMjBwYWludGluZ3xlbnwwfHx8fDE3Njk2MDcwMjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'artist painting',
  },
  {
    id: 'vid009',
    user: '@dogdayafternoons',
    caption: 'He could do this all day. #dog #fetch',
    genre: 'Animals',
    src: 'https://images.unsplash.com/photo-1589756695365-4e0915b3a246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxkb2clMjBwYXJrfGVufDB8fHx8MTc2OTYxMzg5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'dog park',
  },
  {
    id: 'vid010',
    user: '@techguru',
    caption: 'Unboxing the new GizmoPhone 2000! #tech #unboxing',
    genre: 'Tech',
    src: 'https://images.unsplash.com/photo-1582561468417-bcce047b5a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx0ZWNoJTIwcmV2aWV3fGVufDB8fHx8MTc2OTY1NjkyNnww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'tech review',
  },
  {
    id: 'vid011',
    user: '@artbyalex',
    caption: 'Another masterpiece in progress. #art #painting',
    genre: 'Art',
    src: 'https://images.unsplash.com/photo-1613574714687-c33b9e90200d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhcnRpc3QlMjBwYWludGluZ3xlbnwwfHx8fDE3Njk2MDcwMjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'artist painting',
  },
  {
    id: 'vid012',
    user: '@funnyfelines',
    caption: 'Cant get enough of this little guy. #cat #funnyanimals',
    genre: 'Animals',
    src: 'https://images.unsplash.com/photo-1598935888738-cd2622bcd437?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjdXRlJTIwY2F0fGVufDB8fHx8MTc2OTYyNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'cute cat',
  }
];

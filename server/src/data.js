export const seedData = {
  users: [
    { id: 'maya', name: 'Maya Chen', handle: 'mayamakes', bio: 'Making little things with big feelings. Ceramicist, slow-morning enthusiast, always learning.', location: 'Portland, OR', avatar: 'https://i.pravatar.cc/120?img=47', color: '#d6e8df', following: ['eli', 'nora', 'sam'] },
    { id: 'eli', name: 'Eli Williams', handle: 'eliinbloom', bio: 'Plant person, amateur baker, professional window-gazer. Finding beauty in the everyday.', location: 'Brooklyn, NY', avatar: 'https://i.pravatar.cc/120?img=12', color: '#f2ded2', following: ['maya', 'nora'] },
    { id: 'nora', name: 'Nora Patel', handle: 'norawanders', bio: 'Photographing the places between here and there. Currently taking the scenic route.', location: 'Seattle, WA', avatar: 'https://i.pravatar.cc/120?img=44', color: '#e9dfd2', following: ['maya', 'eli', 'sam'] },
    { id: 'sam', name: 'Sam Rivera', handle: 'samrivers', bio: 'Writer of lists, grower of tomatoes, collector of very good playlists.', location: 'Austin, TX', avatar: 'https://i.pravatar.cc/120?img=33', color: '#e8dff0', following: ['maya', 'nora'] },
    { id: 'jules', name: 'Jules Okafor', handle: 'julesincolor', bio: 'Illustrator making the world a little more colorful, one sketch at a time.', location: 'Chicago, IL', avatar: 'https://i.pravatar.cc/120?img=49', color: '#f1e0ad', following: ['maya'] }
  ],
  posts: [
    { id: 'post-5', userId: 'nora', text: 'Took the long way home and found a little bookstore tucked between a laundromat and a bakery. Bought a book just because the cover felt like autumn. No regrets.', createdAt: '2026-10-11T07:48:00.000Z', likes: ['maya', 'eli', 'sam'], comments: [{ id: 'comment-1', userId: 'eli', text: 'The best kind of detour. What was the book?', createdAt: '2026-10-11T08:12:00.000Z' }] },
    { id: 'post-4', userId: 'eli', text: 'Small win: my pothos has a new leaf! I know it’s a plant doing plant things but honestly it feels like we’re both figuring it out together.', createdAt: '2026-10-10T21:15:00.000Z', likes: ['maya', 'nora', 'sam'], comments: [] },
    { id: 'post-3', userId: 'sam', text: 'Made a playlist for people who want the world to slow down by about 12%. Calling it “soft edges.” Happy to share if anyone needs an exhale today.', createdAt: '2026-10-10T14:02:00.000Z', likes: ['maya', 'nora'], comments: [{ id: 'comment-2', userId: 'maya', text: 'Always need an exhale. Please do!', createdAt: '2026-10-10T15:30:00.000Z' }] },
    { id: 'post-2', userId: 'maya', text: 'Spent the morning at the wheel making the wonkiest little bowl. It leans to one side and I love it anyway. A good reminder that imperfect things can still hold something beautiful.', createdAt: '2026-10-09T18:22:00.000Z', likes: ['eli', 'nora', 'sam', 'jules'], comments: [{ id: 'comment-3', userId: 'jules', text: 'Please show us this little bowl, it sounds perfect to me.', createdAt: '2026-10-09T19:04:00.000Z' }] },
    { id: 'post-1', userId: 'jules', text: 'A tiny reminder I drew for myself this morning: you don’t need to be extraordinary to be worth knowing. Ordinary is lovely too.', createdAt: '2026-10-08T11:40:00.000Z', likes: ['maya', 'eli'], comments: [] }
  ]
}

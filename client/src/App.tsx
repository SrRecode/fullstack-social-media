import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, Bookmark, Check, ChevronDown, Compass, Feather, Heart, Home,
  Link2, LoaderCircle, MessageCircle, Plus, Search, Sparkles, Users, X,
} from 'lucide-react'
import { api } from './api'
import type { Bootstrap, Post, User } from './types'

type View = 'home' | 'following' | 'discover' | 'profile'
const demoIdentity = 'circles-demo-user'

function timeAgo(date: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / 1440)}d`
}

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false)
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true" style={{ background: user.color }}>
      {!failed && <img className="avatar-image" src={user.avatar} alt="" loading="lazy" onError={() => setFailed(true)} />}
      {failed && <span className="avatar-fallback">{initials}</span>}
    </span>
  )
}

function App() {
  const [data, setData] = useState<Bootstrap | null>(null)
  const [activeView, setActiveView] = useState<View>('home')
  const [profileId, setProfileId] = useState('')
  const [composer, setComposer] = useState('')
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [filter, setFilter] = useState<'for-you' | 'recent'>('for-you')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [highlightedPost, setHighlightedPost] = useState('')
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const handledPermalink = useRef('')

  const userId = data?.currentUser.id ?? ''
  const refresh = useCallback(async (identity?: string) => {
    setLoading(true)
    setError('')
    try {
      let requestedIdentity = identity
      if (!requestedIdentity) {
        try { requestedIdentity = localStorage.getItem(demoIdentity) ?? undefined }
        catch { requestedIdentity = undefined }
      }
      const next = await api.bootstrap(requestedIdentity || 'maya')
      setData(next)
      try { localStorage.setItem(demoIdentity, next.currentUser.id) }
      catch { /* Demo identity still works for this visit when storage is unavailable. */ }
      return true
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not connect to the server.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const users = data?.users ?? []
  const currentUser = data?.currentUser
  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const posts = useMemo(() => {
    let result = data?.posts ?? []
    if (activeView === 'following') result = result.filter((post) => post.userId === userId || currentUser?.following.includes(post.userId))
    if (activeView === 'profile') result = result.filter((post) => post.userId === profileId)
    if (activeView === 'discover' && query.trim()) {
      const term = query.trim().toLocaleLowerCase()
      result = result.filter((post) => {
        const author = userById.get(post.userId)
        return post.text.toLocaleLowerCase().includes(term)
          || author?.name.toLocaleLowerCase().includes(term)
          || author?.handle.toLocaleLowerCase().includes(term)
      })
    }
    return filter === 'recent' ? [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : result
  }, [activeView, currentUser?.following, data?.posts, filter, profileId, query, userById, userId])
  const matchingUsers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (activeView !== 'discover' || !term) return []
    return users.filter((user) => user.id !== userId
      && [user.name, user.handle, user.bio, user.location].some((value) => value.toLocaleLowerCase().includes(term)))
  }, [activeView, query, userId, users])

  const runAction = async (key: string, action: () => Promise<unknown>, done: () => void | Promise<void>) => {
    setBusy(key)
    try { await action(); await done() }
    catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Could not complete that action.') }
    finally { setBusy(null) }
  }

  const createPost = async () => {
    const text = composer.trim()
    if (!text || !userId) return
    await runAction('create', () => api.createPost(userId, text), async () => {
      setComposer('')
      setNotice('Your post is up. Nice one.')
      await refresh(userId)
    })
  }

  const likePost = (post: Post) => runAction(`like-${post.id}`, () => api.toggleLike(userId, post.id), async () => { await refresh(userId) })
  const followUser = (user: User) => runAction(`follow-${user.id}`, () => api.toggleFollow(userId, user.id), async () => {
    await refresh(userId)
    setNotice(currentUser?.following.includes(user.id) ? `Unfollowed ${user.name}` : `Following ${user.name}`)
  })
  const addComment = async (postId: string) => {
    const text = commentDrafts[postId]?.trim()
    if (!text) return
    await runAction(`comment-${postId}`, () => api.addComment(userId, postId, text), async () => {
      setCommentDrafts((drafts) => ({ ...drafts, [postId]: '' }))
      setExpandedComments((items) => items.includes(postId) ? items : [...items, postId])
      await refresh(userId)
    })
  }
  const openProfile = (id: string) => { setProfileId(id); setActiveView('profile'); setQuery('') }
  const nav = (view: View) => { setActiveView(view); if (view !== 'discover') setQuery('') }
  const switchIdentity = async (id: string) => {
    const target = users.find((user) => user.id === id)
    if (!target || target.id === userId) return
    if (await refresh(id)) {
      setActiveView('home')
      setProfileId('')
      setQuery('')
      setNotice(`Now using ${target.name}'s demo profile`)
    }
  }
  const focusComposer = () => {
    if (activeView !== 'home') setActiveView('home')
    window.requestAnimationFrame(() => composerRef.current?.focus())
  }
  const sharePost = async (post: Post) => {
    const url = new URL(window.location.href)
    url.searchParams.set('post', post.id)
    try {
      const nativeShare = Reflect.get(navigator, 'share')
      if (typeof nativeShare === 'function') {
        await nativeShare.call(navigator, { title: 'A thought on Circles', url: url.toString() })
        setNotice('Thanks for sharing a little kindness.')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString())
        setNotice('Post link copied to your clipboard.')
      }
      else throw new Error('Your browser does not support link sharing.')
    } catch (reason) {
      if (reason instanceof Error && reason.name === 'AbortError') return
      window.history.replaceState(null, '', url)
      setNotice('Post link is ready in the address bar to copy.')
    }
  }
  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get('post')
    if (!postId || loading || !data || handledPermalink.current === postId) return
    handledPermalink.current = postId
    const exists = data.posts.some((post) => post.id === postId)
    if (!exists) {
      setNotice('That post may have been removed or is no longer available.')
      return
    }
    setActiveView('home')
    setProfileId('')
    setHighlightedPost(postId)
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`post-${postId}`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target?.focus({ preventScroll: true })
    })
    const timer = window.setTimeout(() => setHighlightedPost(''), 2600)
    return () => window.clearTimeout(timer)
  }, [data, loading])
  const title = activeView === 'following' ? 'Your circle' : activeView === 'discover' ? 'Find your people' : activeView === 'profile' ? (userById.get(profileId)?.name ?? 'Profile') : 'Your little corner'

  if (loading && !data) return <div className="loading-screen" role="status" aria-live="polite"><div className="brand-mark"><Sparkles size={19} /></div><LoaderCircle className="spin" size={22} /><span>Setting up your circle...</span></div>

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => nav('home')}>
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.4} /></span>
          <span>circles<span className="brand-dot">.</span></span>
        </button>
        <label className="identity-picker">
          {currentUser && <Avatar user={currentUser} size="sm" />}
          <span className="identity-copy"><strong>{currentUser?.name ?? 'Offline'}</strong><small>Switch demo profile</small></span>
          <ChevronDown size={16} className="muted" />
          <select aria-label="Switch demo profile" value={userId} onChange={(event) => void switchIdentity(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name} · @{user.handle}</option>)}</select>
        </label>
        <div className="nav-section-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${activeView === 'home' ? 'active' : ''}`} onClick={() => nav('home')}><Home size={18} />Home<span className="nav-indicator" /></button>
          <button className={`nav-item ${activeView === 'following' ? 'active' : ''}`} onClick={() => nav('following')}><Users size={18} />Your circle</button>
          <button className={`nav-item ${activeView === 'discover' ? 'active' : ''}`} onClick={() => nav('discover')}><Compass size={18} />Explore</button>
          <button className={`nav-item ${activeView === 'profile' && profileId === userId ? 'active' : ''}`} onClick={() => currentUser && openProfile(currentUser.id)}><Bookmark size={18} />Your profile</button>
        </nav>
        <div className="side-divider" />
        <div className="side-heading"><span>PEOPLE TO KNOW</span><button aria-label="Explore people" onClick={() => nav('discover')}><ArrowRight size={14} /></button></div>
        <div className="mini-people">
          {users.filter((user) => user.id !== userId).slice(0, 4).map((user) => (
            <button className="mini-person" key={user.id} onClick={() => openProfile(user.id)}>
              <Avatar user={user} size="sm" /><span><strong>{user.name}</strong><small>@{user.handle}</small></span>
              {currentUser?.following.includes(user.id) && <Check className="follow-check" size={14} />}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="invite-card"><span className="invite-icon"><Sparkles size={16} /></span><strong>Good things grow<br />when shared.</strong><p>Make yourself at home. Your people are right here.</p><button onClick={() => nav('discover')}>Meet the community <ArrowRight size={14} /></button></div>
          <span className="version-note">Local demo <span>·</span> Switch profiles above</span>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><Sparkles size={18} /></span><b>circles<span className="brand-dot">.</span></b></div>
          <div className="breadcrumb"><span>YOUR SPACE</span><span className="crumb-slash">/</span><strong>{activeView === 'profile' ? 'PROFILE' : activeView === 'discover' ? 'EXPLORE' : activeView === 'following' ? 'YOUR CIRCLE' : 'HOME'}</strong></div>
          <div className="top-actions"><label className="mobile-switcher" aria-label="Switch demo profile">{currentUser && <Avatar user={currentUser} size="sm" />}<ChevronDown size={14} /><select aria-label="Switch demo profile" value={userId} onChange={(event) => void switchIdentity(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name} · @{user.handle}</option>)}</select></label><span className="online-pill"><i />Local demo</span></div>
        </header>

        <div className="feed-wrap">
          {error && <div className="error-card"><div><strong>Can’t reach your circle just yet</strong><p>{error}</p></div><button onClick={() => void refresh()}>Try again</button></div>}
          {!error && <>
            <section className="welcome-row">
              <div><h1>{title}<span className="heading-period">.</span></h1><p className="welcome-subtitle">{activeView === 'following' ? 'A little window into what your people are up to.' : activeView === 'discover' ? 'A few interesting corners to wander into.' : activeView === 'profile' ? userById.get(profileId)?.bio : <>The internet feels smaller when we make room for <em>each other.</em></>}</p></div>
              {activeView !== 'profile' && <div className="date-badge"><Sparkles className="sun-symbol" size={23} /><span>GOOD ENERGY<br /><strong>ONLY</strong></span></div>}
            </section>

            {activeView === 'profile' && profileId && userById.get(profileId) && currentUser && <ProfileCard user={userById.get(profileId)!} currentUser={currentUser} users={users} onFollow={() => void followUser(userById.get(profileId)!)} busy={busy === `follow-${profileId}`} />}

            {activeView === 'discover' && <>
              <label className="search-box"><Search size={17} /><input aria-label="Search profiles and posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, places, or posts..." />{query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label>
              {matchingUsers.length > 0 && <section className="people-results" aria-label="Matching profiles">
                <div className="people-results-heading"><span>PEOPLE</span><span>{matchingUsers.length} {matchingUsers.length === 1 ? 'profile' : 'profiles'}</span></div>
                {matchingUsers.map((user) => {
                  const isFollowing = currentUser?.following.includes(user.id) ?? false
                  return <div className="search-person" key={user.id}>
                    <button className="search-person-profile" onClick={() => openProfile(user.id)}><Avatar user={user} size="sm" /><span><strong>{user.name}</strong><small>@{user.handle} · {user.location}</small></span></button>
                    <button className={`search-follow ${isFollowing ? 'following' : ''}`} aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${user.name}`} aria-pressed={isFollowing} disabled={busy === `follow-${user.id}`} onClick={() => void followUser(user)}>{isFollowing ? <Check size={16} /> : <Plus size={16} />}</button>
                  </div>
                })}
              </section>}
            </>}

            {activeView !== 'profile' && activeView !== 'discover' && <section className="composer-card">
              <div className="composer-top">
                {currentUser && <Avatar user={currentUser} />}
                <textarea ref={composerRef} aria-label="Write a post" maxLength={500} aria-describedby="compose-hint" value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void createPost() }} placeholder={activeView === 'following' ? 'What’s happening with your people?' : 'What’s something good on your mind?'} rows={2} />
              </div>
              <div className="composer-bottom"><span className={`char-count ${composer.length >= 450 ? 'near-limit' : ''}`} aria-live="polite">{composer.length}/500 <span className="compose-hint" id="compose-hint">· Ctrl/⌘ + Enter to post</span></span><button className="post-button" onClick={() => void createPost()} disabled={!composer.trim() || busy === 'create'} aria-busy={busy === 'create'}>{busy === 'create' ? <LoaderCircle className="spin" size={16} /> : <><Feather size={15} /> Share a thought</>}</button></div>
            </section>}

            <div className="feed-toolbar"><div><span className="feed-label">{activeView === 'profile' ? 'POSTS' : activeView === 'discover' ? 'COMMUNITY FEED' : 'THE CONVERSATION'}</span><span className="post-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span></div><div className="feed-filters" role="group" aria-label="Sort posts"><button onClick={() => setFilter('for-you')} className={filter === 'for-you' ? 'selected' : ''} aria-pressed={filter === 'for-you'}>For you</button><button onClick={() => setFilter('recent')} className={filter === 'recent' ? 'selected' : ''} aria-pressed={filter === 'recent'}>Recent</button></div></div>

            <section className="post-list" aria-label="Posts">
              {posts.length === 0 ? <div className="empty-state"><span className="empty-icon"><Sparkles size={22} /></span><h2>{activeView === 'following' ? 'Your circle is still growing' : activeView === 'discover' ? matchingUsers.length ? 'No matching posts yet' : 'No posts found' : 'A fresh page'}</h2><p>{activeView === 'following' ? 'Follow a few kind, curious people and their posts will show up here.' : activeView === 'discover' ? matchingUsers.length ? 'We found these people above, but none of their posts match yet. Try another search or clear your filters.' : 'Try another name, handle, place, or word from a post.' : 'Be the first to share a little something with your community.'}</p><button onClick={() => activeView === 'following' ? nav('discover') : activeView === 'discover' ? setQuery('') : focusComposer()}>{activeView === 'following' ? <>Find your people <ArrowRight size={15} /></> : activeView === 'discover' ? <>Clear search <X size={15} /></> : <>Write the first post <Feather size={15} /></>}</button></div> : posts.map((post) => {
                const author = userById.get(post.userId)
                if (!author) return null
                return <article className="post-card" key={post.id}>
                  <div id={`post-${post.id}`} className={`post-head ${highlightedPost === post.id ? 'post-highlighted' : ''}`} tabIndex={-1}><button className="author-link" onClick={() => openProfile(author.id)}><Avatar user={author} /><span className="author-meta"><strong>{author.name}{author.id === userId && <span className="you-tag">YOU</span>}</strong><small>@{author.handle} <span>·</span> {timeAgo(post.createdAt)}</small></span></button></div>
                  <p className="post-copy">{post.text}</p>
                  {post.image && <img className="post-image" src={post.image} alt={`Shared photo from ${author.name}`} loading="lazy" />}
                  <div className="post-actions"><button className={`post-action like-action ${post.likes.includes(userId) ? 'liked' : ''}`} onClick={() => void likePost(post)} disabled={busy === `like-${post.id}`} aria-label={post.likes.includes(userId) ? 'Unlike post' : 'Like post'} aria-pressed={post.likes.includes(userId)}><Heart size={17} fill={post.likes.includes(userId) ? 'currentColor' : 'none'} /><span>{post.likes.length || 'Like'}</span></button><button className="post-action" onClick={() => setExpandedComments((items) => items.includes(post.id) ? items.filter((id) => id !== post.id) : [...items, post.id])} aria-label={`${expandedComments.includes(post.id) ? 'Hide replies on' : 'Show replies on'} ${author.name}'s post`} aria-expanded={expandedComments.includes(post.id)}><MessageCircle size={17} /><span>{post.comments.length ? `${post.comments.length} ${post.comments.length === 1 ? 'reply' : 'replies'}` : 'Reply'}</span></button><button className="share-action" onClick={() => void sharePost(post)}><Link2 size={15} />Share</button></div>
                  {expandedComments.includes(post.id) && <div className="comments-area">{post.comments.length > 0 && <div className="comment-list">{post.comments.map((comment) => { const commenter = userById.get(comment.userId); return <div className="comment" key={comment.id}>{commenter && <Avatar user={commenter} size="sm" />}<p><strong>{commenter?.name ?? 'Community member'}</strong><span>{comment.text}</span></p></div> })}</div>}<form className="comment-form" onSubmit={(event) => { event.preventDefault(); void addComment(post.id) }}>{currentUser && <Avatar user={currentUser} size="sm" />}<input maxLength={280} aria-label="Write a reply" placeholder="Add a kind thought..." value={commentDrafts[post.id] ?? ''} onChange={(event) => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: event.target.value }))} /><button disabled={!commentDrafts[post.id]?.trim() || busy === `comment-${post.id}`} aria-label="Send reply"><ArrowRight size={17} /></button></form></div>}
                </article>
              })}
            </section>
            <footer className="feed-footer"><span>YOU’RE RIGHT WHERE YOU BELONG</span><span><Sparkles size={12} /> Made for humans, with care</span></footer>
          </>}
        </div>
      </main>

      <aside className="right-rail">
        <div className="rail-top"><span className="rail-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</span></div>
        <div className="daily-card"><div className="daily-art"><Sparkles className="art-sparkle a" size={14} /><Sparkles className="art-sparkle b" size={13} /><Sparkles className="art-sparkle c" size={9} /><div className="art-sun" /><div className="art-hill hill-back" /><div className="art-hill hill-front" /><span className="art-label">A NOTE FOR TODAY</span></div><div className="daily-copy"><span className="daily-kicker">A LITTLE REMINDER</span><h3>There’s room for<br />you at the table.</h3><p>You don’t have to have it all figured out to belong here.</p><span className="daily-author">A thought worth keeping <Heart size={12} /></span></div></div>
        <div className="rail-section"><div className="rail-heading"><span>PEOPLE YOU MIGHT LIKE</span><button onClick={() => nav('discover')}>See all</button></div><div className="suggestion-list">{users.filter((user) => user.id !== userId && !currentUser?.following.includes(user.id)).slice(0, 3).map((user) => <div className="suggestion" key={user.id}><button className="suggestion-avatar" onClick={() => openProfile(user.id)} aria-label={`View ${user.name}'s profile`}><Avatar user={user} size="sm" /></button><button className="suggestion-info" onClick={() => openProfile(user.id)}><strong>{user.name}</strong><small>@{user.handle}</small></button><button className="follow-button" onClick={() => void followUser(user)} disabled={busy === `follow-${user.id}`} aria-label={`Follow ${user.name}`} aria-pressed={currentUser?.following.includes(user.id) ?? false}><Plus size={16} /></button></div>)}{users.filter((user) => user.id !== userId && !currentUser?.following.includes(user.id)).length === 0 && <p className="all-followed">You’re keeping up with everyone. Lovely.</p>}</div></div>
        <div className="rail-section trending"><div className="rail-heading"><span>GOOD CONVERSATIONS</span><Sparkles size={14} /></div><button className="trend-item" onClick={() => { nav('discover'); setQuery('making') }}><span className="trend-tag">#MAKERS</span><strong>Things we’re making lately</strong><small>Explore posts about making</small></button><button className="trend-item" onClick={() => { nav('discover'); setQuery('slow') }}><span className="trend-tag">#SLOWMORNINGS</span><strong>A gentler start to the day</strong><small>Explore posts about slowing down</small></button><button className="trend-item" onClick={() => { nav('discover'); setQuery('little') }}><span className="trend-tag">#SMALLJOYS</span><strong>The little things that count</strong><small>Explore small moments</small></button></div>
        <div className="rail-footer"><span>ABOUT</span><span>COMMUNITY GUIDELINES</span><span>PRIVACY</span><small>© {new Date().getFullYear()} circles, a demo project</small></div>
      </aside>
      {notice && <div className="toast" role="status"><span className="toast-check"><Check size={14} /></span>{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
      {activeView === 'home' && <button className="mobile-compose" aria-label="Create a post" onClick={focusComposer}><Plus size={23} /></button>}
      <nav className="mobile-nav" aria-label="Mobile navigation"><button className={activeView === 'home' ? 'active' : ''} onClick={() => nav('home')}><Home size={19} /><span>Home</span></button><button className={activeView === 'following' ? 'active' : ''} onClick={() => nav('following')}><Users size={19} /><span>Circle</span></button><button className={activeView === 'discover' ? 'active' : ''} onClick={() => nav('discover')}><Compass size={19} /><span>Explore</span></button><button className={activeView === 'profile' ? 'active' : ''} onClick={() => currentUser && openProfile(currentUser.id)}><Bookmark size={19} /><span>Profile</span></button></nav>
    </div>
  )
}

function ProfileCard({ user, currentUser, users, onFollow, busy }: { user: User; currentUser: User; users: User[]; onFollow: () => void; busy: boolean }) {
  const isFollowing = currentUser.following.includes(user.id)
  const followerCount = users.filter((candidate) => candidate.following.includes(user.id)).length
  return <section className="profile-card"><div className="profile-banner" /><div className="profile-content"><Avatar user={user} size="lg" /><div className="profile-actions">{user.id !== currentUser.id && <button className={`profile-follow ${isFollowing ? 'following' : ''}`} onClick={onFollow} disabled={busy} aria-pressed={isFollowing}>{busy ? <LoaderCircle className="spin" size={15} /> : isFollowing ? <><Check size={15} /> Following</> : <><Plus size={15} /> Follow</>}</button>}</div><h2>{user.name}</h2><span className="profile-handle">@{user.handle}</span><p>{user.bio}</p><div className="profile-location"><Compass size={14} />{user.location}</div><div className="profile-stats"><div><strong>{followerCount}</strong><span>{followerCount === 1 ? 'follower' : 'followers'}</span></div><div><strong>{user.following.length}</strong><span>following</span></div></div></div></section>
}

export default App

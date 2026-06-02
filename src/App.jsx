import { useState, useRef } from 'react';
import { ARTISTS } from './data';
import { useLocalStorage } from './useLocalStorage';
import './App.css';

function ArtistCard({ artist, liked, tags, onToggleLike, onAddTag, onRemoveTag, friendLikers }) {
  const isB2b = artist.b2b != null;

  return (
    <div className="artist">
      <button
        className={`like-btn${liked ? ' liked' : ''}`}
        aria-label={`Like ${artist.name}`}
        onClick={onToggleLike}
      >
        {liked ? '\u2665' : '\u2661'}
      </button>
      <div className="artist-info">
        <div className="artist-row">
          <div className="artist-name">
            {artist.name}
            {isB2b && <span className="b2b-tag">B2B</span>}
          </div>
          {artist.mix && (
            <a className="mix-link" href={artist.mix} target="_blank" rel="noreferrer">
              mix link
            </a>
          )}
          {artist.otherMix && (
            <a className="mix-link other-mix" href={artist.otherMix} target="_blank" rel="noreferrer">
              other mix
            </a>
          )}
        </div>
        {artist.b2bMix && (
          <div className="b2b-links">
            <a className="mix-link b2b-mix" href={artist.b2bMix} target="_blank" rel="noreferrer">
              {artist.b2b} mix
            </a>
          </div>
        )}
        <div className="tags">
          {tags.map(t => (
            <span key={t} className="tag" onClick={() => onRemoveTag(t)}>{t}</span>
          ))}
          <button className="add-tag-btn" aria-label="Add tag" onClick={onAddTag}>+</button>
        </div>
        {friendLikers.length > 0 && (
          <div className="friend-likers">
            {friendLikers.map(name => (
              <span key={name} className="friend-badge">{name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [likes, setLikes] = useLocalStorage('wl2026-likes', {});
  const [allTags, setAllTags] = useLocalStorage('wl2026-tags', {});
  const [friends, setFriends] = useLocalStorage('wl2026-friends', []);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const fileInputRef = useRef(null);

  const q = search.toLowerCase();
  let filtered = ARTISTS.filter(a => a.name.toLowerCase().includes(q));

  if (tab === 'liked') {
    filtered = filtered.filter(a => likes[a.name]);
  } else if (tab === 'friends' && selectedFriend) {
    const friend = friends.find(f => f.name === selectedFriend);
    if (friend) filtered = filtered.filter(a => friend.likes[a.name]);
  }

  const friendLikersFor = (artistName) => {
    return friends.filter(f => f.likes[artistName]).map(f => f.name);
  };

  let countText;
  if (tab === 'friends' && selectedFriend) {
    countText = `${filtered.length} liked by ${selectedFriend}`;
  } else if (tab === 'liked') {
    countText = `${filtered.length} liked artist${filtered.length !== 1 ? 's' : ''}`;
  } else {
    countText = `${filtered.length} of ${ARTISTS.length} artists`;
  }

  const toggleLike = (name) => {
    setLikes(prev => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = true;
      return next;
    });
  };

  const addTag = (name) => {
    const tag = prompt(`Add tag for ${name}:`);
    if (!tag || !tag.trim()) return;
    setAllTags(prev => {
      const tags = prev[name] ? [...prev[name]] : [];
      if (!tags.includes(tag.trim())) tags.push(tag.trim());
      return { ...prev, [name]: tags };
    });
  };

  const removeTag = (name, tag) => {
    setAllTags(prev => {
      const tags = (prev[name] || []).filter(t => t !== tag);
      const next = { ...prev };
      if (tags.length === 0) delete next[name];
      else next[name] = tags;
      return next;
    });
  };

  const exportLikes = () => {
    const name = prompt('Your name (for your friends to see):');
    if (!name || !name.trim()) return;
    const data = { name: name.trim(), likes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wl2026-${name.trim().toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFriend = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data.name || !data.likes) {
          alert('Invalid file format.');
          return;
        }
        setFriends(prev => {
          const existing = prev.filter(f => f.name !== data.name);
          return [...existing, { name: data.name, likes: data.likes }];
        });
        setSelectedFriend(data.name);
        setTab('friends');
      } catch {
        alert('Could not read file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const removeFriend = (name) => {
    setFriends(prev => prev.filter(f => f.name !== name));
    if (selectedFriend === name) {
      setSelectedFriend(null);
      setTab('all');
    }
  };

  return (
    <>
      <header>
        <h1>WL2026 Mixes</h1>
        <input
          className="search"
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="tabs">
          <button
            className={`tab${tab === 'all' ? ' active' : ''}`}
            onClick={() => setTab('all')}
          >
            All
          </button>
          <button
            className={`tab${tab === 'liked' ? ' active' : ''}`}
            onClick={() => setTab('liked')}
          >
            Liked
          </button>
          <button
            className={`tab${tab === 'friends' ? ' active' : ''}`}
            onClick={() => setTab('friends')}
          >
            Friends
          </button>
        </div>
      </header>

      {tab === 'friends' && (
        <div className="friends-bar">
          <div className="friends-list">
            {friends.map(f => (
              <div key={f.name} className="friend-chip-wrapper">
                <button
                  className={`friend-chip${selectedFriend === f.name ? ' active' : ''}`}
                  onClick={() => setSelectedFriend(selectedFriend === f.name ? null : f.name)}
                >
                  {f.name}
                </button>
                <button className="friend-remove" onClick={() => removeFriend(f.name)}>&times;</button>
              </div>
            ))}
          </div>
          <div className="share-actions">
            <button className="share-btn" onClick={exportLikes}>Export My Likes</button>
            <button className="share-btn" onClick={() => fileInputRef.current?.click()}>Import Friend</button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importFriend}
              hidden
            />
          </div>
        </div>
      )}

      <div className="count">{countText}</div>
      <div className="list">
        {tab === 'friends' && !selectedFriend && friends.length === 0 ? (
          <div className="empty">
            No friends imported yet.<br />
            Export your likes and share the file, or import a friend's file.
          </div>
        ) : tab === 'friends' && !selectedFriend && friends.length > 0 ? (
          <div className="empty">
            Select a friend above to see their likes.
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            {tab === 'liked'
              ? <>No liked artists yet.<br />Tap the heart on artists you want to check out.</>
              : tab === 'friends'
                ? `${selectedFriend} hasn't liked any artists matching your search.`
                : 'No artists match your search.'}
          </div>
        ) : (
          filtered.map(a => (
            <ArtistCard
              key={a.name}
              artist={a}
              liked={!!likes[a.name]}
              tags={allTags[a.name] || []}
              onToggleLike={() => toggleLike(a.name)}
              onAddTag={() => addTag(a.name)}
              onRemoveTag={(tag) => removeTag(a.name, tag)}
              friendLikers={friendLikersFor(a.name)}
            />
          ))
        )}
      </div>
    </>
  );
}

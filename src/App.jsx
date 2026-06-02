import { useState } from 'react';
import { ARTISTS } from './data';
import { useLocalStorage } from './useLocalStorage';
import './App.css';

function getMixLabel(url) {
  if (!url) return 'Mix';
  if (url.includes('wakinglife')) return 'Waking Life';
  if (url.includes('draaimolen')) return 'Draaimolen';
  if (url.includes('houghton')) return 'Houghton';
  if (url.includes('dkmntl') || url.includes('dekmantel')) return 'Dekmantel';
  if (url.includes('horst')) return 'Horst';
  if (url.includes('dimensionsfestival')) return 'Dimensions';
  if (url.includes('platform/') || url.includes('boiler')) return 'Boiler Room';
  if (url.includes('dgtl')) return 'DGTL';
  if (url.includes('kioskradio')) return 'Kiosk Radio';
  if (url.includes('crackmagazine')) return 'Crack Mix';
  if (url.includes('noisily')) return 'Noisily';
  if (url.includes('dreaming-festival')) return 'Dreaming Fest';
  if (url.includes('getdarker')) return 'Outlook';
  if (url.includes('kleinundhaarig')) return 'KuH Fest';
  if (url.includes('sunwaves') || url.includes('cel-ce-asteapta')) return 'Sunwaves';
  if (url.includes('thelotradio')) return 'Lot Radio';
  if (url.includes('garbicz')) return 'Garbicz';
  if (url.includes('musicmanrecords')) return 'Music Man';
  try {
    const path = new URL(url).pathname;
    if (path.split('/').length <= 2) return 'Profile';
  } catch {}
  return 'Mix';
}

function ArtistCard({ artist, liked, tags, onToggleLike, onAddTag, onRemoveTag }) {
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
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [likes, setLikes] = useLocalStorage('wl2026-likes', {});
  const [allTags, setAllTags] = useLocalStorage('wl2026-tags', {});

  const q = search.toLowerCase();
  let filtered = ARTISTS.filter(a => a.name.toLowerCase().includes(q));
  if (tab === 'liked') filtered = filtered.filter(a => likes[a.name]);

  const countText = tab === 'liked'
    ? `${filtered.length} liked artist${filtered.length !== 1 ? 's' : ''}`
    : `${filtered.length} of ${ARTISTS.length} artists`;

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
            All Artists
          </button>
          <button
            className={`tab${tab === 'liked' ? ' active' : ''}`}
            onClick={() => setTab('liked')}
          >
            Liked
          </button>
        </div>
      </header>
      <div className="count">{countText}</div>
      <div className="list">
        {filtered.length === 0 ? (
          <div className="empty">
            {tab === 'liked'
              ? <>No liked artists yet.<br />Tap the heart on artists you want to check out.</>
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
            />
          ))
        )}
      </div>
    </>
  );
}

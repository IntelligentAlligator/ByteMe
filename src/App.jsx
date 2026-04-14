import React, { useEffect, useState } from 'react';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('./recipes.json')
      .then((res) => res.json())
      .then(setRecipes);
  }, []);

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Digital Cookbook</h1>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 20 }}
      />
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>← Back</button>
          <h2>{selected.title}</h2>
          <h4>Ingredients</h4>
          <ul>
            {selected.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
          <h4>Instructions</h4>
          <ol>
            {selected.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {selected.tags && (
            <div style={{ marginTop: 10 }}>
              {selected.tags.map((tag) => (
                <span key={tag} style={{ background: '#eee', borderRadius: 4, padding: '2px 8px', marginRight: 6 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <p>No recipes found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filtered.map((r) => (
                <li key={r.id} style={{ marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                  <a href="#" onClick={() => setSelected(r)} style={{ fontSize: 20, color: '#2a5', textDecoration: 'none' }}>{r.title}</a>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{r.tags?.join(', ')}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

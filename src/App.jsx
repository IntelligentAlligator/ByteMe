
import React, { useState, useEffect, useRef } from 'react';


function App() {
  // Luxury minimalistic theme
  useEffect(() => {
    document.body.style.background = '#111216';
    document.body.style.color = '#f5f5f5';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Poppins, Inter, system-ui, sans-serif';
    document.body.style.letterSpacing = '0.02em';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.letterSpacing = '';
    };
  }, []);
  // Color palette
  const darkBg = '#111216';
  const darkCard = 'rgba(30,32,36,0.98)';
  const accent = '#FFD700'; // gold
  const accentSoft = 'rgba(255,215,0,0.08)';
  const textColor = '#f5f5f5';
  const borderColor = 'rgba(255,255,255,0.08)';
  const shadow = '0 4px 24px 0 rgba(0,0,0,0.12)';

  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    tags: '',
    image: '',
    imageFile: null
  });
  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef();

  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    // Use BASE_URL for correct path on GitHub Pages
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}recipes.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load recipes.json: ${res.status}`);
        return res.json();
      })
      .then(setRecipes)
      .catch((err) => {
        setLoadError(err.message);
        // Also log to console for debugging
        // eslint-disable-next-line no-console
        console.error('Error loading recipes.json:', err);
      });
  }, []);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setForm((f) => ({ ...f, imageFile: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let imageUrl = form.image;
    if (form.imageFile) {
      imageUrl = URL.createObjectURL(form.imageFile);
    }
    if (editId !== null) {
      setRecipes(recipes.map(r =>
        r.id === editId
          ? {
              ...r,
              title: form.title,
              description: form.description,
              ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
              instructions: form.instructions.split('\n').map(s => s.trim()).filter(Boolean),
              tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
              image: imageUrl,
              updatedAt: new Date().toISOString()
            }
          : r
      ));
      setEditId(null);
    } else {
      const newRecipe = {
        id: recipes.length ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
        title: form.title,
        description: form.description,
        ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        instructions: form.instructions.split('\n').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        image: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRecipes([newRecipe, ...recipes]);
    }
    setForm({ title: '', description: '', ingredients: '', instructions: '', tags: '', image: '', imageFile: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(false);
  };

  const handleEdit = (recipe) => {
    setForm({
      title: recipe.title,
      description: recipe.description || '',
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions.join('\n'),
      tags: recipe.tags ? recipe.tags.join(', ') : '',
      image: recipe.image || '',
      imageFile: null
    });
    setShowForm(true);
    setEditId(recipe.id);
    setSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'none',
        color: textColor,
        fontFamily: 'Poppins, Inter, system-ui, sans-serif',
        margin: 0,
        padding: 0,
        letterSpacing: '0.02em',
      }}
    >
      {loadError && (
        <div style={{background: '#ffdddd', color: '#a00', padding: 16, borderRadius: 8, margin: '24px auto', maxWidth: 600, textAlign: 'center', border: '1px solid #a00', fontSize: 18}}>
          <strong>Error loading recipes:</strong> {loadError}<br/>
          <span style={{color: '#a00'}}>The file <code>recipes.json</code> could not be loaded from <code>{import.meta.env.BASE_URL || '/'}recipes.json</code>.</span><br/>
          Please check that <code>recipes.json</code> is present and accessible in the deployed site.<br/>
          <span style={{color: '#a00'}}>If you see a blank page, open the browser console for errors.</span>
        </div>
      )}
      {!loadError && recipes.length === 0 && (
        <div style={{background: '#222', color: '#ff0', padding: 16, borderRadius: 8, margin: '24px auto', maxWidth: 600, textAlign: 'center', border: '1px solid #555', fontSize: 18}}>
          <strong>No recipes loaded.</strong><br/>
          If you expected to see recipes, check that <code>recipes.json</code> is present and accessible.<br/>
        </div>
      )}
      <header style={{ padding: '72px 0 40px 0', textAlign: 'center' }}>
        <h1
          style={{
            letterSpacing: 4,
            fontWeight: 700,
            color: accent,
            fontSize: 48,
            margin: 0,
            background: 'none',
            textTransform: 'uppercase',
            fontFamily: 'Poppins, Inter, system-ui, sans-serif',
            lineHeight: 1.1,
            textShadow: '0 2px 24px rgba(255,215,0,0.08)'
          }}
        >
          CookMe, ByteMe
        </h1>
        <p style={{ color: '#e0c97f', fontSize: 22, marginTop: 18, marginBottom: 0, fontWeight: 400, letterSpacing: 1 }}>
          We love cooking and sharing. Add your recipies now!
        </p>
      </header>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 36,
          maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
          gap: 16,
        }}
      >
              {/* Quick recipe list overview */}
              {!selected && !showForm && recipes.length > 0 && (
                <div style={{ marginBottom: 24, background: darkCard, borderRadius: 16, padding: '18px 28px', boxShadow: shadow, border: `1px solid ${borderColor}` }}>
                  <div style={{ fontWeight: 600, color: accent, marginBottom: 8, fontSize: 18, letterSpacing: 1 }}>
                    {recipes.length} Recipes:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {recipes.map(r => (
                      <span key={r.id} style={{ background: accentSoft, color: accent, borderRadius: 8, padding: '4px 16px', fontSize: 16, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                        onClick={() => setSelected(r)}
                        title={r.title}
                        onMouseOver={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = darkBg; }}
                        onMouseOut={e => { e.currentTarget.style.background = accentSoft; e.currentTarget.style.color = accent; }}
                      >
                        {r.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 16,
            marginRight: 0,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            fontSize: 18,
            background: darkCard,
            color: textColor,
            outline: 'none',
            boxShadow: shadow,
            transition: 'box-shadow 0.2s, border 0.2s',
          }}
        />
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: '16px 32px',
            fontSize: 18,
            background: accent,
            color: darkBg,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: shadow,
            letterSpacing: 1,
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#fffbe6'; e.currentTarget.style.color = accent; e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(255,215,0,0.18)'; }}
          onMouseOut={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = darkBg; e.currentTarget.style.boxShadow = shadow; }}
        >
          {showForm ? 'Cancel' : 'Add Recipe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ background: darkCard, padding: 36, borderRadius: 20, marginBottom: 40, boxShadow: shadow, border: `1px solid ${borderColor}`, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ marginTop: 0, color: accent, fontWeight: 700, fontSize: 28, letterSpacing: 2 }}>{editId !== null ? 'Edit Recipe' : 'Add New Recipe'}</h2>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Title"
            required
            style={{ width: '100%', padding: 16, marginBottom: 16, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 500, letterSpacing: 1 }}
          />
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Description"
            style={{ width: '100%', padding: 16, marginBottom: 16, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 400 }}
          />
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={handleFormChange}
            placeholder="Ingredients (one per line)"
            rows={4}
            style={{ width: '100%', padding: 16, marginBottom: 16, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 400 }}
          />
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleFormChange}
            placeholder="Instructions (one per line)"
            rows={4}
            style={{ width: '100%', padding: 16, marginBottom: 16, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 400 }}
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleFormChange}
            placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: 16, marginBottom: 16, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 400 }}
          />
          <input
            name="image"
            value={form.image}
            onChange={handleFormChange}
            placeholder="Image URL or path"
            style={{ width: '100%', padding: 16, marginBottom: 24, border: `1px solid ${borderColor}`, borderRadius: 12, fontSize: 18, background: darkBg, color: textColor, fontWeight: 400 }}
          />
          <button
            type="submit"
            style={{
              padding: '16px 36px',
              fontSize: 18,
              background: accent,
              color: darkBg,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: shadow,
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fffbe6'; e.currentTarget.style.color = accent; e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(255,215,0,0.18)'; }}
            onMouseOut={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = darkBg; e.currentTarget.style.boxShadow = shadow; }}
          >
            {editId !== null ? 'Save Changes' : 'Add Recipe'}
          </button>
        </form>
      )}

      {selected ? (
        <div style={{ background: darkCard, borderRadius: 20, padding: 44, boxShadow: shadow, border: `1px solid ${borderColor}`, maxWidth: 700, margin: '0 auto 40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <button onClick={() => setSelected(null)} style={{ padding: '12px 28px', fontSize: 16, background: accent, color: darkBg, border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, boxShadow: shadow, transition: 'background 0.2s, color 0.2s, box-shadow 0.2s' }}>← Back</button>
            <button onClick={() => handleEdit(selected)} style={{ padding: '12px 28px', fontSize: 16, background: accentSoft, color: accent, border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, letterSpacing: 1, marginLeft: 12, boxShadow: shadow, transition: 'background 0.2s, color 0.2s, box-shadow 0.2s' }}>Edit</button>
          </div>
          <h2 style={{ color: accent, fontWeight: 700, fontSize: 32, marginBottom: 18, letterSpacing: 2 }}>{selected.title}</h2>
          {selected.image && (
            <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', borderRadius: 16, marginBottom: 24, boxShadow: shadow, border: `1px solid ${borderColor}` }} />
          )}
          {selected.description && (
            <p style={{ fontStyle: 'italic', color: '#e0c97f', marginBottom: 24, fontSize: 18 }}>{selected.description}</p>
          )}
          <h4 style={{ color: accent, marginBottom: 12, fontSize: 20, letterSpacing: 1 }}>Ingredients</h4>
          <ul style={{ marginBottom: 24, paddingLeft: 20 }}>
            {selected.ingredients.map((ing, i) => (
              <li key={i} style={{ fontSize: 18, marginBottom: 4 }}>{ing}</li>
            ))}
          </ul>
          <h4 style={{ color: accent, marginBottom: 12, fontSize: 20, letterSpacing: 1 }}>Instructions</h4>
          <ol style={{ marginBottom: 24, paddingLeft: 20 }}>
            {selected.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: 18, marginBottom: 4 }}>{step}</li>
            ))}
          </ol>
          {selected.tags && (
            <div style={{ marginTop: 16 }}>
              {selected.tags.map((tag) => (
                <span key={tag} style={{ background: accentSoft, color: accent, borderRadius: 8, padding: '4px 16px', marginRight: 10, fontSize: 15, fontWeight: 500, letterSpacing: 1 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>No recipes found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 36, maxWidth: 900, margin: '0 auto' }}>
              {filtered.map((r) => (
                <li
                  key={r.id}
                  style={{
                    background: darkCard,
                    borderRadius: 20,
                    boxShadow: shadow,
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 0,
                    padding: 28,
                    transition: 'box-shadow 0.2s, border 0.2s',
                    cursor: 'pointer',
                    minHeight: 120,
                  }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(255,215,0,0.18)'; e.currentTarget.style.border = `1.5px solid ${accent}`; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = shadow; e.currentTarget.style.border = `1px solid ${borderColor}`; }}
                  onClick={() => setSelected(r)}
                >
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.title}
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginRight: 28,
                        boxShadow: shadow,
                        border: `1px solid ${borderColor}`,
                        background: '#222',
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 24, color: accent, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>{r.title}</div>
                    {r.description && (
                      <div style={{ fontSize: 16, color: '#e0c97f', margin: '6px 0', fontStyle: 'italic' }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: 15, color: accent, marginTop: 4, letterSpacing: 1 }}>{r.tags?.join(', ')}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}

export default App;

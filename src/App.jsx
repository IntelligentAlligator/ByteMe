
import React, { useState, useEffect, useRef } from 'react';

function App() {
  // Set dark background on the whole page
  useEffect(() => {
    document.body.style.background = '#181a1b';
    document.body.style.color = '#eaeaea';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
    };
  }, []);
  // Minimalist dark theme colors
  const darkBg = '#181a1b';
  const darkCard = '#232526';
  const accent = '#7fffd4';
  const textColor = '#eaeaea';
  const borderColor = '#232728';
  const accentSoft = '#2a3a3f';

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
        fontFamily: 'Inter, system-ui, sans-serif',
        margin: 0,
        padding: 0,
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
      <header style={{ padding: '64px 0 32px 0', textAlign: 'center' }}>
        <h1
          style={{
            letterSpacing: 2,
            fontWeight: 700,
            color: accent,
            fontSize: 40,
            margin: 0,
            background: 'none',
            textTransform: 'uppercase',
          }}
        >
          Minimalist Cookbook
        </h1>
        <p style={{ color: '#b0b0b0', fontSize: 18, marginTop: 12, marginBottom: 0 }}>
          A minimalist, dark-themed website for your favorite recipes.
        </p>
      </header>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
              {/* Quick recipe list overview */}
              {!selected && !showForm && recipes.length > 0 && (
                <div style={{ marginBottom: 24, background: darkCard, borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 6px #0002', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>
                    {recipes.length} Recipes:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {recipes.map(r => (
                      <span key={r.id} style={{ background: accentSoft, color: accent, borderRadius: 4, padding: '2px 10px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => setSelected(r)}
                        title={r.title}
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
            width: '75%',
            padding: 12,
            marginRight: 10,
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            fontSize: 16,
            background: darkCard,
            color: textColor,
            outline: 'none',
          }}
        />
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: accentSoft,
            color: accent,
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = accent}
          onMouseOut={e => e.currentTarget.style.background = accentSoft}
        >
          {showForm ? 'Cancel' : 'Add Recipe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ background: darkCard, padding: 28, borderRadius: 10, marginBottom: 32, boxShadow: '0 1px 6px #0002', border: `1px solid ${borderColor}` }}>
          <h2 style={{ marginTop: 0, color: accent, fontWeight: 700 }}>{editId !== null ? 'Edit Recipe' : 'Add New Recipe'}</h2>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Title"
            required
            style={{ width: '100%', padding: 10, marginBottom: 12, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Description"
            style={{ width: '100%', padding: 10, marginBottom: 12, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={handleFormChange}
            placeholder="Ingredients (one per line)"
            rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 12, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleFormChange}
            placeholder="Instructions (one per line)"
            rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 12, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleFormChange}
            placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: 10, marginBottom: 12, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <input
            name="image"
            value={form.image}
            onChange={handleFormChange}
            placeholder="Image URL or path"
            style={{ width: '100%', padding: 10, marginBottom: 18, border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 16, background: darkBg, color: textColor }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 28px',
              fontSize: 16,
              background: accentSoft,
              color: accent,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = accent}
            onMouseOut={e => e.currentTarget.style.background = accentSoft}
          >
            {editId !== null ? 'Save Changes' : 'Add Recipe'}
          </button>
        </form>
      )}

      {selected ? (
        <div style={{ background: darkCard, borderRadius: 10, padding: 32, boxShadow: '0 1px 6px #0002', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => setSelected(null)} style={{ padding: '8px 18px', fontSize: 15, background: accentSoft, color: accent, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            <button onClick={() => handleEdit(selected)} style={{ padding: '8px 18px', fontSize: 15, background: accentSoft, color: accent, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, marginLeft: 10 }}>Edit</button>
          </div>
          <h2 style={{ color: accent, fontWeight: 700 }}>{selected.title}</h2>
          {selected.image && (
            <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 18, boxShadow: '0 1px 6px #0002', border: `1px solid ${borderColor}` }} />
          )}
          {selected.description && (
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: 18 }}>{selected.description}</p>
          )}
          <h4 style={{ color: accent, marginBottom: 8 }}>Ingredients</h4>
          <ul style={{ marginBottom: 18 }}>
            {selected.ingredients.map((ing, i) => (
              <li key={i} style={{ fontSize: 16, marginBottom: 2 }}>{ing}</li>
            ))}
          </ul>
          <h4 style={{ color: accent, marginBottom: 8 }}>Instructions</h4>
          <ol style={{ marginBottom: 18 }}>
            {selected.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: 16, marginBottom: 2 }}>{step}</li>
            ))}
          </ol>
          {selected.tags && (
            <div style={{ marginTop: 10 }}>
              {selected.tags.map((tag) => (
                <span key={tag} style={{ background: accentSoft, color: accent, borderRadius: 4, padding: '2px 10px', marginRight: 8, fontSize: 13, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>No recipes found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
              {filtered.map((r) => (
                <li
                  key={r.id}
                  style={{
                    background: darkCard,
                    borderRadius: 10,
                    boxShadow: '0 1px 6px #0002',
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 0,
                    padding: 18,
                    transition: 'box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #0003'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 6px #0002'}
                  onClick={() => setSelected(r)}
                >
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.title}
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginRight: 18,
                        boxShadow: '0 1px 6px #0002',
                        border: `1px solid ${borderColor}`,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 21, color: accent, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                    {r.description && (
                      <div style={{ fontSize: 15, color: '#b0b0b0', margin: '4px 0' }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>{r.tags?.join(', ')}</div>
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

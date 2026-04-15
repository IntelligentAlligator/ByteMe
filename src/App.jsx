function App() {
  const darkBg = '#181c1f';
  const darkCard = '#23272b';
  const accent = '#7fffd4';
  const textColor = '#f5f5f5';
  const tagBg = '#2a3a3f';
  const tagColor = '#7fffd4';

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

  useEffect(() => {
    fetch('./recipes.json')
      .then((res) => res.json())
      .then(setRecipes);
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
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'Inter, sans-serif', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
      <h1 style={{ textAlign: 'center', letterSpacing: 1, fontWeight: 800, color: '#2a5', marginBottom: 32 }}>Digital Cookbook</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              {/* Quick recipe list overview */}
              {!selected && !showForm && recipes.length > 0 && (
                <div style={{ marginBottom: 24, background: '#f6f8fa', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 6px #0001' }}>
                  <div style={{ fontWeight: 600, color: '#2a5', marginBottom: 6 }}>
                    {recipes.length} Recipes:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {recipes.map(r => (
                      <span key={r.id} style={{ background: '#e0f7e9', color: '#247a3c', borderRadius: 4, padding: '2px 10px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
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
          style={{ width: '75%', padding: 12, marginRight: 10, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
        />
        <button onClick={() => setShowForm((v) => !v)} style={{ padding: '12px 24px', fontSize: 16, background: '#2a5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#247a3c'}
          onMouseOut={e => e.currentTarget.style.background = '#2a5'}>
          {showForm ? 'Cancel' : 'Add Recipe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ background: '#f6f8fa', padding: 28, borderRadius: 10, marginBottom: 32, boxShadow: '0 1px 6px #0001' }}>
          <h2 style={{ marginTop: 0, color: '#2a5', fontWeight: 700 }}>{editId !== null ? 'Edit Recipe' : 'Add New Recipe'}</h2>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Title"
            required
            style={{ width: '100%', padding: 10, marginBottom: 12, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Description"
            style={{ width: '100%', padding: 10, marginBottom: 12, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={handleFormChange}
            placeholder="Ingredients (one per line)"
            rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 12, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleFormChange}
            placeholder="Instructions (one per line)"
            rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 12, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleFormChange}
            placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: 10, marginBottom: 12, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <input
            name="image"
            value={form.image}
            onChange={handleFormChange}
            placeholder="Image URL or path"
            style={{ width: '100%', padding: 10, marginBottom: 18, border: '1px solid #cfcfcf', borderRadius: 6, fontSize: 16 }}
          />
          <button type="submit" style={{ padding: '12px 28px', fontSize: 16, background: '#2a5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#247a3c'}
            onMouseOut={e => e.currentTarget.style.background = '#2a5'}>
            {editId !== null ? 'Save Changes' : 'Add Recipe'}
          </button>
        </form>
      )}

      {selected ? (
        <div style={{ background: '#f6f8fa', borderRadius: 10, padding: 32, boxShadow: '0 1px 6px #0001' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => setSelected(null)} style={{ padding: '8px 18px', fontSize: 15, background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            <button onClick={() => handleEdit(selected)} style={{ padding: '8px 18px', fontSize: 15, background: '#2a5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, marginLeft: 10 }}>Edit</button>
          </div>
          <h2 style={{ color: '#2a5', fontWeight: 700 }}>{selected.title}</h2>
          {selected.image && (
            <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 18, boxShadow: '0 1px 6px #0001' }} />
          )}
          {selected.description && (
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: 18 }}>{selected.description}</p>
          )}
          <h4 style={{ color: '#247a3c', marginBottom: 8 }}>Ingredients</h4>
          <ul style={{ marginBottom: 18 }}>
            {selected.ingredients.map((ing, i) => (
              <li key={i} style={{ fontSize: 16, marginBottom: 2 }}>{ing}</li>
            ))}
          </ul>
          <h4 style={{ color: '#247a3c', marginBottom: 8 }}>Instructions</h4>
          <ol style={{ marginBottom: 18 }}>
            {selected.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: 16, marginBottom: 2 }}>{step}</li>
            ))}
          </ol>
          {selected.tags && (
            <div style={{ marginTop: 10 }}>
              {selected.tags.map((tag) => (
                <span key={tag} style={{ background: '#e0f7e9', color: '#247a3c', borderRadius: 4, padding: '2px 10px', marginRight: 8, fontSize: 13, fontWeight: 500 }}>{tag}</span>
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
                <li key={r.id} style={{ background: '#f6f8fa', borderRadius: 10, boxShadow: '0 1px 6px #0001', display: 'flex', alignItems: 'center', marginBottom: 0, padding: 18, transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #0002'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 6px #0001'}
                  onClick={() => setSelected(r)}>
                  {r.image && (
                    <img src={r.image} alt={r.title} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, marginRight: 18, boxShadow: '0 1px 6px #0001' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 21, color: '#2a5', fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                    {r.description && (
                      <div style={{ fontSize: 15, color: '#555', margin: '4px 0' }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: 13, color: '#247a3c', marginTop: 2 }}>{r.tags?.join(', ')}</div>
                  </div>
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

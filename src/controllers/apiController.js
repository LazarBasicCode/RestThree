const supabase = require('../supabase');
const path = require('path');

exports.list = async (req, res) => {
  const { data } = await supabase
    .from('apis')
    .select('*')
    .order('created_at', { ascending: false });

  res.json(data);
};

exports.execute = async (req, res) => {
  const { id } = req.params;

  const { data: api } = await supabase
    .from('apis')
    .select('*')
    .eq('id', id)
    .single();

  if (!api) {
    return res.status(404).json({ message: 'API tidak ditemukan' });
  }

  try {
    const scraperPath = path.join(
      process.cwd(),
      'file',
      'scraper',
      api.scraper_file
    );

    const scraper = require(scraperPath);
    const result = await scraper(req);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN
exports.create = async (req, res) => {
  const { name, category, scraper_file } = req.body;

  const { data, error } = await supabase
    .from('apis')
    .insert([{ name, category, scraper_file }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  res.json(data);
};

exports.update = async (req, res) => {
  const { id } = req.params;

  const { data } = await supabase
    .from('apis')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  res.json(data);
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  await supabase
    .from('apis')
    .delete()
    .eq('id', id);

  res.json({ message: 'API dihapus' });
};
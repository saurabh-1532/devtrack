import { fetchUrlData } from '../helpers/fetchUrl.js';

export const fetchUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    const data = await fetchUrlData(url);
    res.status(200).json(data);

  } catch (err) {
    // fetch failed — tell frontend to show manual input
    res.status(422).json({
      message: 'Could not fetch URL data',
      error: err.message,
    });
  }
};
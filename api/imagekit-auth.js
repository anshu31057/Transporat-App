import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      ...authParams
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to generate ImageKit auth params' });
  }
}

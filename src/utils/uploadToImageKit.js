const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const uploadToImageKit = async (file) => {
  const authResponse = await fetch('/api/imagekit-auth');

  if (!authResponse.ok) {
    throw new Error('Unable to fetch ImageKit auth data');
  }

  const { publicKey, signature, expire, token } = await authResponse.json();
  const base64File = await fileToBase64(file);

  const formData = new FormData();
  formData.append('file', base64File);
  formData.append('fileName', file.name);
  formData.append('publicKey', publicKey);
  formData.append('signature', signature);
  formData.append('expire', String(expire));
  formData.append('token', token);
  formData.append('folder', 'trucks');

  const uploadResponse = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!uploadResponse.ok) {
    throw new Error('Unable to upload image to ImageKit');
  }

  const uploadData = await uploadResponse.json();
  return uploadData.url;
};

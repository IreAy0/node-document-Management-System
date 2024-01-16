import storage from "../utils/firebase.config.js";

const bucket = storage.storage().bucket();

const uploadAvatarService = (file) => {
  console.log('file', file )
  const folderName = 'avatars'
  const timestamp = Date.now();
  const filename = `${folderName}/${timestamp}-${file.originalname}`; // Include the folder name in the filename

  // gs://e-book-manager.appspot.com/documents
  const fileUpload = bucket.file(filename);
  const fileStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    fileStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      reject(err); // Reject the Promise with the error
    });

    fileStream.on('finish', () => {
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;
      resolve(fileUrl); // Resolve the Promise with the file URL
    });

    fileStream.end(file.buffer);
  });
};

export { 
  uploadAvatarService, 
};
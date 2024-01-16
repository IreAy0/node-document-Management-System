import storage from "../utils/firebase.config.js";

const bucket = storage.storage().bucket();

const uploadFileService = (file) => {
  
  const folderName = 'documents'
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


const deleteFileService = async (fileUrl) => {
const url = new URL(fileUrl);
const pathname = url.pathname;
const filename = pathname.split('/').pop();

  try {
    const file = bucket.file(decodeURIComponent(filename));
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      return true;
    } else {
      return false; 
    }
  } catch (error) {
    throw error; 
  }
};

export { 
  uploadFileService, 
  deleteFileService 
};

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Define storage locations
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PRODUCT_IMAGES_DIR = path.join(UPLOAD_DIR, 'products');
const USER_IMAGES_DIR = path.join(UPLOAD_DIR, 'users');
const CATEGORY_IMAGES_DIR = path.join(UPLOAD_DIR, 'categories');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Ensure upload directories exist
[UPLOAD_DIR, PRODUCT_IMAGES_DIR, USER_IMAGES_DIR, CATEGORY_IMAGES_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define file filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Create storage engine for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCT_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Create storage engine for user images
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, USER_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Create storage engine for category images
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CATEGORY_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Create storage engine for temporary uploads
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// Create multer instances
export const productUpload = multer({
  storage: productStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const userUpload = multer({
  storage: userStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

export const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

export const tempUpload = multer({
  storage: tempStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Move a file from temp directory to target directory
 * @param filename Filename in temp directory
 * @param targetDir Target directory
 * @returns New file path
 */
export const moveFileFromTemp = (filename: string, targetDir: string): string => {
  const sourcePath = path.join(TEMP_DIR, filename);
  const targetPath = path.join(targetDir, filename);
  
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`File ${filename} not found in temp directory`);
  }
  
  fs.copyFileSync(sourcePath, targetPath);
  fs.unlinkSync(sourcePath);
  
  return targetPath;
};

/**
 * Delete a file
 * @param filepath Path to file
 */
export const deleteFile = (filepath: string): void => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

/**
 * Get public URL for a file
 * @param filepath Path to file
 * @returns Public URL
 */
export const getFileUrl = (filepath: string): string => {
  const relativePath = filepath.replace(UPLOAD_DIR, '');
  return `/uploads${relativePath.replace(/\\/g, '/')}`;
};

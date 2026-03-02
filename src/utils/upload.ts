import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request } from 'express';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'assets', 'users');
const CATEGORY_UPLOAD_DIR = path.join(process.cwd(), 'assets', 'categories');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_SIZE = 300;   // resize avatar về 300x300
const AVATAR_QUALITY = 80; // chất lượng nén 80%
const ICON_SIZE = 128;     // resize icon category về 128x128
const ICON_QUALITY = 85;

// Tạo thư mục gốc nếu chưa tồn tại
if (!fs.existsSync(BASE_UPLOAD_DIR)) fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(CATEGORY_UPLOAD_DIR)) fs.mkdirSync(CATEGORY_UPLOAD_DIR, { recursive: true });

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

// ─── Multer instances ────────────────────────────────────────────────────────
export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadCategoryIcon = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max cho icon
});

// ─── Lưu avatar đã nén vào folder của user ──────────────────────────────────
export const saveAvatar = async (userId: string, file: Express.Multer.File): Promise<string> => {
  // Tạo folder riêng cho user: assets/users/{userId}/
  const userDir = path.join(BASE_UPLOAD_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filename = `avatar.webp`; // Luôn convert sang webp để tối ưu dung lượng
  const filePath = path.join(userDir, filename);

  // Resize + nén bằng sharp
  await sharp(file.buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: 'cover',      // crop vừa khung vuông
      position: 'center',
    })
    .webp({ quality: AVATAR_QUALITY })
    .toFile(filePath);

  return `/assets/users/${userId}/${filename}`;
};

// ─── Xóa avatar cũ ──────────────────────────────────────────────────────────
export const deleteOldAvatar = (avatarUrl: string | null): void => {
  if (!avatarUrl) return;
  const filePath = path.join(process.cwd(), avatarUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ─── Lưu category icon (128x128 WebP) ───────────────────────────────────────
export const saveCategoryIcon = async (categoryId: string, file: Express.Multer.File): Promise<string> => {
  const iconDir = path.join(CATEGORY_UPLOAD_DIR, categoryId);
  if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

  const filePath = path.join(iconDir, 'icon.webp');
  await sharp(file.buffer)
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'cover', position: 'center' })
    .webp({ quality: ICON_QUALITY })
    .toFile(filePath);

  return `/assets/categories/${categoryId}/icon.webp`;
};

// ─── Xóa icon cũ ─────────────────────────────────────────────────────────────
export const deleteOldIcon = (iconUrl: string | null): void => {
  if (!iconUrl) return;
  const filePath = path.join(process.cwd(), iconUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE UPLOADS
// ═══════════════════════════════════════════════════════════════════════════════
const COURSE_UPLOAD_DIR = path.join(process.cwd(), 'assets', 'courses');
const THUMBNAIL_SIZE_W = 800;
const THUMBNAIL_SIZE_H = 450;   // tỉ lệ 16:9
const THUMBNAIL_QUALITY = 82;
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

if (!fs.existsSync(COURSE_UPLOAD_DIR)) fs.mkdirSync(COURSE_UPLOAD_DIR, { recursive: true });


// Multer course: nhận 2 fields (thumbnail ảnh + demo video)
// Dùng diskStorage cho video (quá lớn để giữ trên memory)
const courseStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, COURSE_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Tên tạm thời, sẽ đổi tên sau khi có courseId
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `tmp_${Date.now()}${ext}`);
  },
});

export const uploadCourseFiles = multer({
  storage: courseStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (cho video demo)
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'thumbnail' && IMAGE_EXTENSIONS.includes(ext)) return cb(null, true);
    if (file.fieldname === 'demo' && VIDEO_EXTENSIONS.includes(ext)) return cb(null, true);
    // Ảnh gửi vào field demo, hoặc video gửi vào field thumbnail
    if (file.fieldname === 'thumbnail') return cb(new Error(`Thumbnail must be an image: ${IMAGE_EXTENSIONS.join(', ')}`));
    if (file.fieldname === 'demo') return cb(new Error(`Demo must be a video: ${VIDEO_EXTENSIONS.join(', ')}`));
    cb(new Error('Unexpected field'));
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'demo', maxCount: 1 },
]);

// ─── Lưu thumbnail (800×450 WebP) ────────────────────────────────────────────
// File từ diskStorage đã được ghi vào /assets/courses/tmp_*.ext
// Đọc lại, chuyển sang WebP, lưu vào /assets/courses/{courseId}/thumbnail.webp
export const saveThumbnail = async (courseId: string, file: Express.Multer.File): Promise<string> => {
  const courseDir = path.join(COURSE_UPLOAD_DIR, courseId);
  if (!fs.existsSync(courseDir)) fs.mkdirSync(courseDir, { recursive: true });

  const destPath = path.join(courseDir, 'thumbnail.webp');
  try {
    await sharp(file.path)
      .resize(THUMBNAIL_SIZE_W, THUMBNAIL_SIZE_H, { fit: 'cover', position: 'center' })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(destPath);
  } finally {
    // Luôn xóa file tạm dù sharp thành công hay thất bại
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }

  return `/assets/courses/${courseId}/thumbnail.webp`;
};

// ─── Di chuyển video demo vào folder của course ───────────────────────────────
// Video KHÔNG encode lại (giữ nguyên chất lượng, tiết kiệm CPU)
export const saveDemo = (courseId: string, file: Express.Multer.File): string => {
  const courseDir = path.join(COURSE_UPLOAD_DIR, courseId);
  if (!fs.existsSync(courseDir)) fs.mkdirSync(courseDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase();
  const destPath = path.join(courseDir, `demo${ext}`);

  try {
    // Thử rename trước (nhanh, cùng partition)
    fs.renameSync(file.path, destPath);
  } catch {
    // Fallback: copy rồi xóa (cross-device hoặc cross-volume)
    fs.copyFileSync(file.path, destPath);
    fs.unlinkSync(file.path);
  }

  return `/assets/courses/${courseId}/demo${ext}`;
};

// ─── Xóa file cũ (dùng chung cho thumbnail và demo) ─────────────────────────
export const deleteOldFile = (url: string | null): void => {
  if (!url) return;
  const filePath = path.join(process.cwd(), url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON VIDEO UPLOADS
// ═══════════════════════════════════════════════════════════════════════════════

// Multer cho lesson: nhận 1 field 'video'
export const uploadLessonVideo = multer({
  storage: courseStorage,   // reuse diskStorage, save tmp to COURSE_UPLOAD_DIR
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB cho video bài học
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (VIDEO_EXTENSIONS.includes(ext)) return cb(null, true);
    cb(new Error(`Video must be: ${VIDEO_EXTENSIONS.join(', ')}`));
  },
}).single('video');

// Lấy file video từ request
export const getUploadedVideo = (req: Request): Express.Multer.File | undefined => {
  return req.file;
};

// Lưu video bài học: /assets/courses/{courseId}/lessons/{lessonId}/video.{ext}
export const saveLessonVideo = (courseId: string, lessonId: string, file: Express.Multer.File): string => {
  const lessonDir = path.join(COURSE_UPLOAD_DIR, courseId, 'lessons', lessonId);
  if (!fs.existsSync(lessonDir)) fs.mkdirSync(lessonDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase();
  const destPath = path.join(lessonDir, `video${ext}`);

  try {
    fs.renameSync(file.path, destPath);
  } catch {
    fs.copyFileSync(file.path, destPath);
    fs.unlinkSync(file.path);
  }

  return `/assets/courses/${courseId}/lessons/${lessonId}/video${ext}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// LESSON MATERIAL UPLOADS (PDF, DOCX, PPTX, etc.)
// ═══════════════════════════════════════════════════════════════════════════════
const MATERIAL_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar', '.txt', '.csv'];

export const uploadMaterialFile = multer({
  storage: courseStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (MATERIAL_EXTENSIONS.includes(ext)) return cb(null, true);
    cb(new Error(`Material must be: ${MATERIAL_EXTENSIONS.join(', ')}`));
  },
}).array('materials', 10); // tối đa 10 file cùng lúc

// Lưu tài liệu: /assets/courses/{courseId}/lessons/{lessonId}/materials/{originalname}
export const saveLessonMaterial = (courseId: string, lessonId: string, file: Express.Multer.File): string => {
  const matDir = path.join(COURSE_UPLOAD_DIR, courseId, 'lessons', lessonId, 'materials');
  if (!fs.existsSync(matDir)) fs.mkdirSync(matDir, { recursive: true });

  // Giữ tên gốc, thêm timestamp tránh trùng
  const ext = path.extname(file.originalname).toLowerCase();
  const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${baseName}_${Date.now()}${ext}`;
  const destPath = path.join(matDir, fileName);

  try {
    fs.renameSync(file.path, destPath);
  } catch {
    fs.copyFileSync(file.path, destPath);
    fs.unlinkSync(file.path);
  }

  return `/assets/courses/${courseId}/lessons/${lessonId}/materials/${fileName}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
//                        QUIZ IMAGE
// ═══════════════════════════════════════════════════════════════════════════════

// Multer cho quiz: nhận nhiều ảnh câu hỏi cùng lúc
export const uploadQuizImages = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
}).array('images', 20); // tối đa 20 ảnh cùng lúc

// Lưu 1 ảnh quiz → /assets/courses/{courseId}/quiz/{questionId}.webp
export const saveQuizImage = async (courseId: string, questionId: string, file: Express.Multer.File): Promise<string> => {
  const quizDir = path.join(COURSE_UPLOAD_DIR, courseId, 'quiz');
  if (!fs.existsSync(quizDir)) fs.mkdirSync(quizDir, { recursive: true });

  const destPath = path.join(quizDir, `${questionId}.webp`);
  await sharp(file.buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(destPath);

  return `/assets/courses/${courseId}/quiz/${questionId}.webp`;
};

// ═══════════════════════════════════════════════════════════════════════════════
//                        CHAT IMAGE
// ═══════════════════════════════════════════════════════════════════════════════
const CHAT_UPLOAD_DIR = path.join(process.cwd(), 'assets', 'chat');
if (!fs.existsSync(CHAT_UPLOAD_DIR)) fs.mkdirSync(CHAT_UPLOAD_DIR, { recursive: true });

export const uploadChatImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

// Lưu ảnh chat: /assets/chat/{convId}/{timestamp}.webp
export const saveChatImage = async (conversationId: string, file: Express.Multer.File): Promise<string> => {
  const chatDir = path.join(CHAT_UPLOAD_DIR, conversationId);
  if (!fs.existsSync(chatDir)) fs.mkdirSync(chatDir, { recursive: true });

  const filename = `${Date.now()}.webp`;
  const destPath = path.join(chatDir, filename);
  await sharp(file.buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(destPath);

  return `/assets/chat/${conversationId}/${filename}`;
};

// --- Imports ---
const express = require('express');
require('dotenv').config();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs'); // Node.js File System (Naya)
const { google } = require('googleapis'); // Naya
const multer = require('multer'); // Naya (File uploads ke liye)

const app = express();

// --- Middleware & Config ---
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my-secret-key-for-video-site', resave: false, saveUninitialized: true }));

// --- Google Drive Setup ---
const KEY_FILE_PATH = path.join(__dirname, 'service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth: auth });

// --- Multer (Temp File Upload) Setup ---
// Files ko 'uploads/' folder me temporarily save karega
const upload = multer({ dest: 'uploads/' }); 

// --- Admin Auth (Same as before) ---
const adminUser = { username: 'admin', password: 'password123' };
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) { return next(); }
    res.status(403).json({ message: 'Forbidden: Admins only' });
};

// --- API Routes (Admin) ---
app.post('/api/login', (req, res) => { const { username, password } = req.body; if (username === adminUser.username && password === adminUser.password) { req.session.isAdmin = true; res.redirect('/'); } else { res.send('Wrong username or password!'); } });
app.get('/api/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });
app.get('/api/auth/status', (req, res) => { res.json({ isAdmin: !!req.session.isAdmin }); });

// --- YEH HAI SAHI UPLOAD ROUTE ---
app.post('/api/upload', isAdmin, upload.single('videoFile'), async (req, res) => {
    try {
        const { category } = req.body;
        const file = req.file;

        if (!file || !category) {
            return res.status(400).json({ message: "File aur category zaroori hai." });
        }

        const newKey = `${category}--${file.originalname}`;

        // YEH CODE SAHI HAI (BINA PARENTS AUR SUPPORTSALLDRIVES KE)
        const response = await drive.files.create({
            requestBody: {
                name: newKey
                // Parents (Folder ID) nahi daalna hai
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path),
            },
            fields: 'id'
            // supportsAllDrives nahi daalna hai
        });

        // Temp file ko delete karo
        fs.unlinkSync(file.path); 

        res.json({ message: 'File uploaded successfully!', fileId: response.data.id });

    } catch (error) {
        console.error("Upload Error:", error); // ASLI ERROR YAHAN TERMINAL ME DIKHEGA
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Could not upload file to Google Drive." });
    }
});

// --- MOVIES LIST ROUTE ---
app.get('/api/movies', async (req, res) => {
    const { category } = req.query;
    try {
        const { data } = await drive.files.list({
            q: "trashed=false",
            fields: 'files(id, name, size, modifiedTime)',
            orderBy: 'modifiedTime desc'
        });

        if (!data.files) { return res.json([]); }

        let allFiles = data.files.map(file => ({
            gdriveId: file.id,
            key: file.name,
            size: file.size,
            lastModified: file.modifiedTime
        }));

        let filteredFiles;
        if (category === 'shorts') {
            filteredFiles = allFiles.filter(file => file.key.startsWith(`shorts--`));
        } else {
            filteredFiles = allFiles.filter(file => !file.key.startsWith(`shorts--`));
            if (category && category !== 'all') {
                filteredFiles = filteredFiles.filter(file => file.key.startsWith(`${category}--`));
            }
        }
        
        const files = filteredFiles.map(file => {
            const [fileCategory, ...originalNameParts] = file.key.split('--');
            const originalName = originalNameParts.join('--');
            return {
                name: originalName,
                size: file.size,
                streamUrl: `/api/stream/${file.gdriveId}`,
                downloadUrl: `/api/download/${file.gdriveId}`,
                publicId: file.gdriveId,
                category: fileCategory,
                lastModified: file.lastModified
            };
        });

        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch videos from Google Drive' });
    }
});

// --- DELETE ROUTE ---
app.post('/api/delete', isAdmin, async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) return res.status(400).json({ message: 'File ID is required.' });
        
        await drive.files.delete({
            fileId: publicId
        });
        
        res.status(200).json({ message: 'Video deleted successfully!' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
});

// --- STREAM ROUTE ---
app.get('/api/stream/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { data } = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        data.pipe(res); 
    } catch (error) {
        console.error("Stream Error:", error);
        res.status(500).send('Could not stream the file.');
    }
});

// --- DOWNLOAD ROUTE ---
app.get('/api/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        const metaResponse = await drive.files.get({
            fileId: fileId,
            fields: 'name'
        });
        const fileName = metaResponse.data.name || 'video.mp4';
        const cleanName = fileName.split('--').slice(1).join('--') || fileName;
        
        res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);

        const { data } = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        
        data.pipe(res);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).send('Could not download the file.');
    }
});

// --- Server Start (Same as before) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
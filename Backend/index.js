const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv');
const multer = require("multer")
const path = require("path")
const cors = require("cors")
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

dotenv.config();

const app = express()

// Import models
const Tour = require('./models/Tour');

// Middleware
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
app.use(cookieParser());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error:", err));

//ROUTES
app.use('/api/auth', authRoute); 
app.use('/api/user', userRoute);  // Changed from '/user' to '/api/user'

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Configure storage for different file types
const storage = {
    panoramas: multer.diskStorage({
        destination: './upload/panoramas',
        filename: (req, file, cb) => {
            return cb(null, `panorama_${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    images: multer.diskStorage({
        destination: './upload/images',
        filename: (req, file, cb) => {
            return cb(null, `image_${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    videos: multer.diskStorage({
        destination: './upload/videos',
        filename: (req, file, cb) => {
            return cb(null, `video_${Date.now()}${path.extname(file.originalname)}`)
        }
    })
};

// Configure upload settings for different file types
const fileFilters = {
    image: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image file.'), false);
        }
    },
    video: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video! Please upload a video file.'), false);
        }
    }
};

const upload = {
    panorama: multer({
        storage: storage.panoramas,
        limits: {
            fileSize: 20 * 1024 * 1024 // 20MB limit for panoramas
        },
        fileFilter: fileFilters.image
    }),
    image: multer({
        storage: storage.images,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit for regular images
        },
        fileFilter: fileFilters.image
    }),
    video: multer({
        storage: storage.videos,
        limits: {
            fileSize: 100 * 1024 * 1024 // 100MB limit for videos
        },
        fileFilter: fileFilters.video
    })
};

// Serve static files
app.use('/panoramas', express.static('upload/panoramas'))
app.use('/images', express.static('upload/images'))
app.use('/videos', express.static('upload/videos'))

// Upload endpoints
app.post("/api/upload/panorama", upload.panorama.single('panorama'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    res.json({
      success: 1,
      file: {
        url: `http://localhost:${port}/panoramas/${req.file.filename}`,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error handling panorama upload:', error);
    res.status(400).json({
      success: 0,
      message: error.message
    });
  }
});

app.post("/api/upload/image", upload.image.single('image'), (req, res) => {
    try {
        res.json({
            success: 1,
            file: {
                url: `http://localhost:${port}/images/${req.file.filename}`,
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(400).json({
            success: 0,
            message: error.message
        });
    }
});

app.post("/api/upload/video", upload.video.single('video'), (req, res) => {
    try {
        res.json({
            success: 1,
            file: {
                url: `http://localhost:${port}/videos/${req.file.filename}`,
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(400).json({
            success: 0,
            message: error.message
        });
    }
});

// Multiple files upload endpoint
app.post("/api/upload/multiple", upload.image.array('files', 10), (req, res) => {
    try {
        const files = req.files.map(file => ({
            url: `http://localhost:${port}/images/${file.filename}`,
            name: file.originalname,
            size: file.size,
            type: file.mimetype
        }));
        
        res.json({
            success: 1,
            files: files
        });
    } catch (error) {
        res.status(400).json({
            success: 0,
            message: error.message
        });
    }
});

// Error handling middleware for uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: 0,
                message: 'File is too large. Size limits: Panoramas(20MB), Images(10MB), Videos(50MB)'
            });
        }
    }
    res.status(500).json({
        success: 0,
        message: err.message
    });
});

// Create upload directories if they don't exist
const fs = require('fs');
const uploadDirs = ['./upload/panoramas', './upload/images', './upload/videos'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// API Endpoints
app.get('/api/tours', async (req, res) => {
  try {
    const tours = await Tour.find()
      .select('tourId name description panoramas infospots linkspots createdAt updatedAt')
      .lean();

    const formattedTours = tours.map(tour => ({
      tourId: tour.tourId,
      name: tour.name,
      description: tour.description,
      panoramas: tour.panoramas || [],
      infospots: tour.infospots || [],
      linkspots: tour.linkspots || [],
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt
    }));

    res.json({
      success: true,
      message: 'Tours fetched successfully',
      count: formattedTours.length,
      tours: formattedTours
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tours',
      error: error.message
    });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const tourId = await getNextTourId();
    const tourData = {
      ...req.body,
      tourId,
      infospots: req.body.infospots,
      linkspots: req.body.linkspots
    };

    const tour = new Tour(tourData);
    await tour.save();

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      tour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tour',
      error: error.message
    });
  }
});

// Get a specific tour by tourId
app.get('/api/tours/:id', async (req, res) => {
  try {
    console.log('Searching for tour with ID:', req.params.id);
    
    const tour = await Tour.findOne({ tourId: req.params.id })
      .select('tourId name description panoramas infospots linkspots createdAt updatedAt')
      .lean();

    console.log('Found tour:', tour);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const formattedTour = {
      tourId: tour.tourId,
      name: tour.name,
      description: tour.description,
      panoramas: tour.panoramas || [],
      infospots: tour.infospots || [],
      linkspots: tour.linkspots || [],
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt
    };

    res.json({
      success: true,
      message: 'Tour fetched successfully',
      tour: formattedTour
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour',
      error: error.message
    });
  }
});

// Create a new tour
app.post('/tours', async (req, res) => {
  try {
    const tourId = await getNextTourId();
    const tourData = {
      ...req.body,
      tourId,
      infospots: req.body.infospots,
      linkspots: req.body.linkspots
    };
    console.log(req)

    const tour = new Tour(tourData);
    await tour.save();

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      tour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tour',
      error: error.message
    });
  }
});

// Function to get next tour ID
async function getNextTourId() {
  const lastTour = await Tour.findOne({}, { tourId: 1 }).sort({ tourId: -1 });
  if (!lastTour) {
    return 'tour01';
  }
  const lastNumber = parseInt(lastTour.tourId.replace('tour', ''));
  const nextNumber = lastNumber + 1;
  return `tour${String(nextNumber).padStart(2, '0')}`;
}

// Delete a tour
app.delete('/api/tours/:id', async (req, res) => { // Updated route to match frontend
  try {
    console.log('Deleting tour with ID:', req.params.id);
    
    const tour = await Tour.findOne({ tourId: req.params.id });
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Delete associated files
    const deleteFiles = async (urls) => {
      for (const url of urls) {
        if (!url) continue;
        try {
          const filePath = url.split(`http://localhost:${port}/`)[1];
          if (filePath) {
            await fs.promises.unlink(`./${filePath}`);
          }
        } catch (err) {
          console.error(`Error deleting file: ${url}`, err);
        }
      }
    };

    // Get all file URLs from the tour
    const fileUrls = [
      ...tour.panoramas.map(p => p.imageUrl),
      ...tour.infospots.filter(i => i.img).map(i => i.img),
      ...tour.infospots.filter(i => i.video).map(i => i.video)
    ];

    // Delete the files
    await deleteFiles(fileUrls);

    // Delete the tour from database using tourId
    await Tour.findOneAndDelete({ tourId: req.params.id });

    console.log('Tour deleted successfully');

    res.json({
      success: true,
      message: 'Tour and associated files deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tour',
      error: error.message
    });
  }
});

// Update a tour
app.put('/api/tours/:id', async (req, res) => {
  try {
    console.log('Updating tour with ID:', req.params.id);
    console.log('Update data:', req.body);

    // Check if the tour exists
    const existingTour = await Tour.findOne({ tourId: req.params.id });
    if (!existingTour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      panoramas: req.body.panoramas,
      infospots: req.body.infospots,
      linkspots: req.body.linkspots,
      updatedAt: new Date()
    };

    // Update the tour in MongoDB
    const updatedTour = await Tour.findOneAndUpdate(
      { tourId: req.params.id },
      { $set: updateData },
      { new: true, runValidators: true, lean: true }
    );

    if (!updatedTour) {
      throw new Error('Failed to update tour');
    }

    console.log('Tour updated successfully:', updatedTour);

    res.json({
      success: true,
      message: 'Tour updated successfully',
      tour: updatedTour
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour',
      error: error.message
    });
  }
});

// Handle unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});


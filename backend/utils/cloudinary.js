import { v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Test Cloudinary configuration
cloudinary.api.ping()
    .then(result => console.log('Cloudinary connected:', result))
    .catch(error => console.error('Cloudinary connection failed:', error));

export default cloudinary;
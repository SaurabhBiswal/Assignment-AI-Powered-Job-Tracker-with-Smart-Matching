import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLIENT_NAME, 
        api_key: process.env.CLOUDINARY_CLIENT_API, 
        api_secret: process.env.CLOUDINARY_CLIENT_SECRET, 
    });
    console.log("Cloudinary Configured"); 
}

export default connectCloudinary
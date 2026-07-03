import express from "express"
import cors from "cors"
import 'dotenv/config'
import cloudinary from "./config/Cloudinary.js"
import streamifier from "streamifier"
import upload from "./config/Multer.js"
import generateUUID from "./config/RandomUID.js"

const port = process.env.PORT

const app = express()
app.use(express.json());
const corsOptions = {
    origin: [process.env.FRONTEND_URL , process.env.FRONTEND_DEV],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));


app.post("/", upload.single("image"), async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "uploadPhoto",
                    resource_type: "auto",
                    public_id:generateUUID()
                },
                (error, result) => {
                    if (error) {
                        reject(error)

                    }

                    else {
                        resolve(result)
                    };
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        res.json({
            success: true,
            imageUrl: result.secure_url,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/download", async (req, res) => {
    try {
        const { imageURL } = req.body;

        const imageRes = await fetch(imageURL);
        if (!imageRes.ok) {
            return res.status(404).json({ error: "Image not found" });
        }

        const buffer = await imageRes.arrayBuffer();
        const contentType = imageRes.headers.get("content-type") || "image/png";

        res.set("Content-Type", contentType);
        res.set("Content-Disposition", "attachment; filename=image.png");
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Backend is running")
})


app.listen(port, "0.0.0.0", () => {
    console.log(`Example app listening on port ${port}`)
})

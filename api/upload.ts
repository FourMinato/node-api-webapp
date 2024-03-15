import express from "express";
import path from "path";
import multer from "multer";

export const router = express.Router();

class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.resolve(__dirname, "../uploads"));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 10000);
        this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
        cb(null, this.filename);
      },
    }),
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();
router.post("/uploadimg", fileUpload.diskLoader.single("file"), (req, res) => {
    
  res.json({ filename: "/uploads/" + fileUpload.filename });
});

// router.post('/uploadimg', fileMiddleware.diskLoader.single('file'), (req, res) => {
//   // คำสั่ง SQL INSERT
//   const sql = 'INSERT INTO your_table_name (filename, other_column1, other_column2) VALUES (?, ?, ?)';
//   const values = [fileMiddleware.filename, 'value_for_other_column1', 'value_for_other_column2'];

//   connection.query(sql, values, (error, results, fields) => {
//     if (error) {
//       console.error('Error inserting data:', error);
//       return res.status(500).json({ error: 'Error inserting data' });
//     }

//     res.json({ filename: '/uploads/' + fileMiddleware.filename, insertId: results.insertId });
//   });
// });
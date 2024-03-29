//Routerหาเส้นทาง
import express from "express";
import multer from "multer";
import { getStorage, ref, getDownloadURL, uploadBytesResumable, uploadBytes, StorageReference } from "firebase/storage"
import { getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { conn } from "../dbconnect";
// import { mysql } from "../dbconnect";

export const mysql = require('mysql');
interface Users {
  name: string;
  email: string;
  password: string;
  profile:any;
}
interface Pictures {
  uid:any;
  totalVote: string;
  img:any;
  namepic:any;
  }
const firebaseConfig = {
  apiKey: "AIzaSyDkUBXhZleu50k25SouBLgwODhY8yzc6ow",
  authDomain: "popular-animevote.firebaseapp.com",
  projectId: "popular-animevote",
  storageBucket: "popular-animevote.appspot.com",
  messagingSenderId: "537613328009",
  appId: "1:537613328009:web:49fe33ead08b876d54b058",
  measurementId: "G-V6P6DSNGB6"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const storage = getStorage();

class FileMiddleware {
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
  filename: any;
}
const fileUpload = new FileMiddleware();

export const router = express.Router();

router.post("/img/:uid/:imglength", fileUpload.diskLoader.single("file"), async (req, res) => {
  const { uid, imglength } = req.params; // assuming uid is sent either in request body or query parameters
  if (!req.file) {
     return res.status(400).send('No file uploaded.');
  }
   
  const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
 
  const storageRef = ref(storage, "/images/" + filename); // สร้างโฟลเดอร์เก็บรูป
 
  const metadata = {
     contentType: req.file!.mimetype
  }
  if (!uid) {
    return res.status(400).send('No uid provided.');
  }
 
  await uploadBytes(storageRef, req.file.buffer, metadata);
 
  // ใช้ getDownloadURL แทน getSignedUrl
  const url = await getDownloadURL(storageRef);

  let totalVote = 1500;
  let namepic = "testOne";
  let insertUserQuery = "UPDATE `picture` SET `totalVote` = ?, `img` = ?, `namepic` = ? WHERE `uid` = ? AND `img_length` = ?";
  insertUserQuery = mysql.format(insertUserQuery, [totalVote, url, namepic, uid, imglength]);
  conn.query(insertUserQuery, (err, result) => {
    if (err) {
      res.status(500);
    }

    res.status(201).json({
      uid:uid,
      file: url,
      affected_row: result.affectedRows,
      last_idx: result.insertId,
    });
  });
});

router.post("/profile/:uid", fileUpload.diskLoader.single("file"), async (req, res) => {
  const uid = req.params.uid; // assuming uid is sent either in request body or query parameters
  if (!req.file) {
     return res.status(400).send('No file uploaded.');
  }
   
  const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
 
  const storageRef = ref(storage, "/images/" + filename); // สร้างโฟลเดอร์เก็บรูป
 
  const metadata = {
     contentType: req.file!.mimetype
  }
  if (!uid) {
    return res.status(400).send('No uid provided.');
  }
 
  await uploadBytes(storageRef, req.file.buffer, metadata);
 
  // ใช้ getDownloadURL แทน getSignedUrl
  const url = await getDownloadURL(storageRef);
  console.log(url);
  

  let insertProfileQuery = "UPDATE `user` SET `profile` = ? WHERE `uid` = ?";
  insertProfileQuery = mysql.format(insertProfileQuery, [url, uid]);
  conn.query(insertProfileQuery, (err, result) => {
    if (err) {
      res.status(500);
    }

    res.status(201).json({
      uid:uid,
      file: url,
      affected_row: result.affectedRows,
      last_idx: result.insertId,
    });
  });
});

router.get("/delete/:uid", (req, res) => {
  const uid = +req.params.uid;
  let sql =
    "update  `user` set `profile`= NULL where `uid`=?";
  sql = mysql.format(sql, [uid]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows });
  });
});

router.post("/null/:uid", fileUpload.diskLoader.single("file"), async (req, res) => {
  const uid = req.params.uid; // assuming uid is sent either in request body or query parameters
  if (!req.file) {
     return res.status(400).send('No file uploaded.');
  }
   
  const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
 
  const storageRef = ref(storage, "/images/" + filename); // สร้างโฟลเดอร์เก็บรูป
 
  const metadata = {
     contentType: req.file!.mimetype
  }
  if (!uid) {
    return res.status(400).send('No uid provided.');
  }
 
  await uploadBytes(storageRef, req.file.buffer, metadata);
 
  // ใช้ getDownloadURL แทน getSignedUrl
  const url = await getDownloadURL(storageRef);


  let insertProfileQuery = "UPDATE `user` SET `profile` = NULL WHERE `uid` = ?";
  insertProfileQuery = mysql.format(insertProfileQuery, [uid]);
  conn.query(insertProfileQuery, (err, result) => {
    if (err) {
      res.status(500);
    }

    res.status(201).json({
      uid:uid,
      file: url,
      affected_row: result.affectedRows,
      last_idx: result.insertId,
    });
  });
});
//GET/upload
// router.get('/', (req, res) => {
//   res.send('Method Get in upload.ts');
// });

// class FileMiddleware {
//     //Attribute  filename
//     filename = "";

//     //Attribute  diskLoader
//     //Create opject of diskLoader for saving file
//     public readonly diskLoader = multer({
//         //storage = define folder (disk) to be saved
//       storage: multer.diskStorage({
//         //destination saving folder
//         destination: (_req, _file, cb) => {
//           cb(null, path.join(__dirname, "../uploads"));
//         },
//         //filename = radome unique name
//         filename: (req, file, cb) => {
//           const uniqueSuffix =
//             Date.now() + "-" + Math.round(Math.random() * 10000);
//             //filename wil unique
//           this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
//           cb(null, this.filename);
//         },
//       }),
//       limits: {
//         fileSize: 67108864, // 64 MByte
//       },
//     });
//   }
//   const fileUpload = new FileMiddleware();
//   router.post("/",fileUpload.diskLoader.single("file"),(req, res)=>{
//     res.status(200).json({
//         file : "http://localhost:3000/uploads/"+fileUpload.filename
//     });
//   })
// //GET/upload
// router.get('/', (req, res)=>{
//     res.send('Method Get in upload.ts');
// });
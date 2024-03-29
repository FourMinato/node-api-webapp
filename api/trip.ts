import express from "express";
import { conn } from "../dbconnect";
// import { mysql } from "../dbconnect";

export const router = express.Router();
export const mysql = require('mysql');
interface Users {
  name: string;
  email: string;
  password: string;
}
interface Pictures {
pid:string;
totalVote: string;

}

router.get("/", (req, res) => {
    conn.query('select * from user', (err, result, fields)=>{
      res.json(result);
    });
  });

  //admin
  router.get("/user/:type", (req, res) => {
  const type = req.params.type;
  conn.query('select * from user where type = ?',[type] , (err, result, fields)=>{
    res.json(result);
  });
});

//user
router.get("/picuser/:uid", (req, res) => {
  const uid = req.params.uid;
  conn.query('select * from picture where uid = ?',[uid] , (err, result, fields)=>{
    res.json(result);
  });
});
  router.get("/check/:uid", (req, res) => {
    const uid = req.params.uid;
    conn.query('select * from user where uid = ?',[uid], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });






  // router.get("/checkEmPw/:email/:password", (req, res) => {
  //   const { email, password } = req.params;
  //   conn.query('select * from user where email = ? AND password = ?',[email, password], (err, result, fields)=>{
  //     if(err){
  //       res.status(500);
  //     }
  //     res.json(result);
  //   });
  // });


  //profile
  router.get("/profile/:uid", (req, res) => {
    const uid = req.params.uid; // เปลี่ยนจาก req.body.uid เป็น req.params.uid
    conn.query('select * from user where uid = ? ',[uid], (err, result, fields)=>{
      if(err){
        res.status(500).send(err); 
      } else {
        res.json(result);
      }
    });
  });
  router.put("/user/profile/update", (req, res) => {
    const { name, email, password, profile } = req.body;
    const uid = req.body.uid; // หรือใช้ req.params.uid หาก uid ถูกส่งมาใน URL

    const query = 'UPDATE user SET name = ?, email = ?, password = ?, profile = ? WHERE uid = ?'; //update data
    conn.query(query, [name, email, password, profile, uid], (err, result) => {
      if(err){
        res.status(500).send(err); 
      } else {
        res.json({ message: 'Profile updated successfully' });
      }
    });
});

router.get("/user/newname/:name/:uid", (req, res) => {
  const { name, uid } = req.params;// หรือใช้ req.params.uid หาก uid ถูกส่งมาใน URL

  const query = 'UPDATE user SET name = ?WHERE uid = ?'; //rename
  conn.query(query, [name,uid], (err, result) => {
    if(err){
      res.status(500).send(err); 
    } else {
      res.json({ message: 'Profile updated successfully' });
    }
  });
});

router.get("/user/newemail/:email/:password/:uid", (req, res) => {
  const { email,password, uid } = req.params;// หรือใช้ req.params.uid หาก uid ถูกส่งมาใน URL

  const query = 'UPDATE user SET email = ?, password = ? WHERE uid = ?'; //reEmail
  conn.query(query, [email,password ,uid], (err, result) => {
    if(err){
      res.status(500).send(err); 
    } else {
      res.json(result);
    }
  });
});



// router.get("/imgupload/:uid/:length", (req, res) => {
//   const { uid, length } = req.params;
//   conn.query('select * from picture where pid = ? AND img_length = ?',[uid, length], (err, result, fields)=>{
//     if(err){
//       res.status(500);
//     }
//     res.json(result);
//   });
// });  

router.get("/nullImage/:uid/:length", (req, res) => {
  const { uid, length } = req.params;
  let sql = "UPDATE `picture` SET `totalVote`=NULL, `img`=NULL, `namepic`=NULL WHERE `uid`=? AND `img_length`=?";
  sql = mysql.format(sql, [uid, length]);
  
  conn.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      // เมื่อทำการอัปเดตข้อมูลแล้ว สามารถดึงค่า pid ที่อัปเดตได้
      let selectSql = "SELECT pid FROM `picture` WHERE `uid`=? AND `img_length`=?";
      selectSql = mysql.format(selectSql, [uid, length]);

      conn.query(selectSql, (selectErr, selectResult) => {
        if (selectErr) {
          throw selectErr;
        } else {
          // หากมี pid ที่ได้รับค่ามา
          if (selectResult.length > 0) {
            const pidToDelete = selectResult[0].pid;

            // ลบแถวทั้งหมดในตาราง score ที่มี pid เท่ากับค่าที่ได้รับมา
            let deleteSql = "DELETE FROM `score` WHERE `pid`=?";
            deleteSql = mysql.format(deleteSql, [pidToDelete]);

            conn.query(deleteSql, (deleteErr, deleteResult) => {
              if (deleteErr) {
                throw deleteErr;
              } else {
                res.status(201).json({ 
                  affected_row: result.affectedRows,
                  pid: pidToDelete
                });
              }
            });
          } else {
            // หากไม่พบ pid
            res.status(404).json({ message: "pid not found" });
          }
        }
      });
    }
  });
});

router.get("/scorecompare/:pid/:date", (req, res) => {
  const { pid, date } = req.params;
  conn.query('select * from score WHERE pid = ? AND date = ?',[pid, date], (err, result, fields)=>{
    if(err){
      res.status(500);
    }
    res.json(result);
  });
});  


  router.get("/user/:uidp", (req, res) => {
    const uid = req.params.uidp;
    conn.query('select * from picture where uid = ?',[uid], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });

  router.get("/pictures", (req, res) => {
    conn.query('select * from picture', (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });  
  router.get("/picture/:pid", (req, res) => {
    const pid = req.params.pid;
    conn.query('select * from picture where pid = ?',[pid], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });  
  router.get("/oldscore/:pid", (req, res) => {
    const pid = req.params.pid;
    conn.query('select * from score where pid = ?',[pid], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  }); 
  router.get("/scoretmr/:pid/:tmr", (req, res) => {
    const { pid, tmr } = req.params;
    conn.query('select * from score where pid = ? and date = ?',[pid, tmr], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });  


  
  router.get("/sql/:name/:email/:password", (req, res) => {
    const { name, email, password } = req.params;
    let insertUserQuery = "INSERT INTO `user`(`name`, `email`, `password`, `type`) VALUES (?,?,?,1)";
    insertUserQuery = mysql.format(insertUserQuery, [name, email, password]);
    conn.query(insertUserQuery, (err, result) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        return; // ออกจากฟังก์ชันหลังจากส่งคำตอบ
      }
  
      const userId = result.insertId;
      const insertPromises = [];

      // สร้าง Promise สำหรับแต่ละรูปภาพ
      for (let i = 1; i <= 5; i++) {
        const insertPictureQuery = mysql.format("INSERT INTO `picture`(`uid`, `img_length`) VALUES (?,?)", [userId, i]);
        const promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            conn.query(insertPictureQuery, (err, pictureResult) => {
              if (err) {
                reject(err);
              } else {
                resolve(pictureResult);
              }
            });
          }, i * 500); // เพิ่มช่วงเวลาระหว่างแต่ละรูปภาพ
        });
        insertPromises.push(promise);
      }

      // รอให้ทุก Promise เสร็จสิ้นแล้วส่งคำตอบกลับ
      Promise.all(insertPromises)
        .then(() => {
          // เมื่อทุกอย่างเสร็จสมบูรณ์ ทำการดึงข้อมูลรูปภาพจากฐานข้อมูลอีกครั้งเพื่อแสดงผล
          conn.query("SELECT * FROM `picture` WHERE `uid` = ? ORDER BY `img_length` ASC", [userId], (err, pictureResults) => {
            if (err) {
              console.error("Error fetching picture data:", err);
              res.status(500).json({ error: "Internal Server Error" });
            } else {
              res.status(201).json({
                user_affected_row: result.affectedRows,
                user_last_idx: userId,
                picture_data: pictureResults
              });
            }
          });
        })
        .catch((err) => {
          console.error("Error:", err);
          res.status(500).json({ error: "Internal Server Error" });
        });
    });
});

  
  
//--ดึงรูปแบบRandom--//
router.get("/picture", (req, res) => {
  const sql = "SELECT * FROM picture WHERE img IS NOT NULL AND namepic IS NOT NULL";
  conn.query(sql, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      const randomIndex: number[] = [];
      while (randomIndex.length < 2) {
        const index = Math.floor(Math.random() * result.length);
        if (!randomIndex.includes(index)) {
          randomIndex.push(index);
        }
      }
      const randomPictures = randomIndex.map((index) => result[index]);
      res.json(randomPictures);
    }
  });
});



  
  //--เช็ครูปที่ถูกเลือก--//
  router.get("/vote/:pid", (req, res) => { 
    const picID = req.params.pid;
    conn.query('select * from picture where pid = ?',[picID], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
      res.json(result);
    });
  });
 
  //--อัพเดตคะแนน--//
  router.get("/update/:score/:picID", (req, res) => {
    const { score, picID } = req.params;

        let sqlUpdateScore = "UPDATE `picture` SET `totalVote` = ? WHERE `pid` = ?";
        sqlUpdateScore = mysql.format(sqlUpdateScore, [score, picID]);
        conn.query(sqlUpdateScore, (err, result) => {
            if (err) throw err;
            res.json(result);
            });
        });




router.get("/rankall", (req, res) => {
  // ดึงข้อมูลจากตาราง picture และ score
  let sql = `
      SELECT p.*, p.totalVote - s.old_score as score_change, s.date as latest_update
      FROM picture p
      LEFT JOIN (
          SELECT pid, old_score, date,
          ROW_NUMBER() OVER (PARTITION BY pid ORDER BY date DESC) as row_num
          FROM score
      ) s ON p.pid = s.pid AND s.row_num = 1
      ORDER BY p.totalVote DESC;
  `;
  conn.query(sql, (err, result, fields) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error retrieving rank data", error: err.message });
      }
      res.json(result);
  });
});


//อัพเดตอันดับ
router.get("/rankupdate/:oldsc/:pid/:date", (req, res) => {
  const  { oldsc, pid, date }  = req.params;
    let insertUserQuery = "INSERT INTO `score`(`pid`, `old_score`,`date`) VALUES (?,?,?)";
    insertUserQuery = mysql.format(insertUserQuery, [pid, oldsc,date]);
    conn.query(insertUserQuery, (err, result) => {
      if (err) {
        res.status(500);
      }

      res.status(201).json({
        affected_row: result.affectedRows,
        last_idx: result.insertId,
      });
    });
  });
;

//ดึงคะแนนมาทำกราฟ
router.get("/scoregraph/:pid/:date", (req, res) => { 
  const { pid, date } = req.params;
  conn.query('SELECT * FROM score WHERE pid = ? and date = ?',[pid, date], (err, result, fields)=>{
    if(err){
      res.status(500);
    }
    res.json(result);
  });
});


//เรียกอันดับวันล่าสุด
router.get("/ranktoday/:date", (req, res) => { 
  const date = req.params.date;
  conn.query('SELECT * FROM score WHERE date = ? ORDER BY old_score DESC',[date], (err, result, fields)=>{
    if(err){
      res.status(500);
    }
    res.json(result);
  });
});

router.get("/oldrank/:date", (req, res) => {
 const date = req.params.date;

 const sql = `
    SELECT score.*, picture.namepic, picture.img
    FROM score
    JOIN picture ON score.pid = picture.pid
    WHERE score.date = ?
    ORDER BY score.old_score DESC
 `;

 conn.query(sql, [date], (err, result, fields) => {
    if (err) {
      res.status(500).send(err);
    } else {

      //ตรวจสอบว่ามีข้อมูลหรือไม่ และจำนวนข้อมูลที่ต้องการ
      if (result.length > 0) {
        // เก็บข้อมูลที่มีคะแนนสูงสุด
        let topScores = [];
        // เก็บ pid ที่มีคะแนนสูงสุด
        let topPids: any[] = [];

        // วนลูปผ่านข้อมูลเพื่อหา pid ที่มีคะแนนสูงสุด
        for (const row of result) {
          if (!topPids.includes(row.pid)) {
            topPids.push(row.pid);
            topScores.push(row);
          }
        }

        // ส่งข้อมูลที่มี pid ที่มีคะแนนสูงสุด
        res.json(topScores);
      } else {
        res.json({ message: "No data found" });
      }
    }
 });
});

//บันทึกrank
router.get("/insertranked/:i/:pid/:oldsc/:date", (req, res) => {
  const { i, oldsc, pid, date } = req.params;

  // Check if data already exists in the rank table
  const checkExistingQuery = "SELECT * FROM `rank` WHERE `pid` = ? AND `date` = ?";
  conn.query(checkExistingQuery, [pid, date], (err, result) => {
    if (err) {
      res.status(500).send("Error occurred while checking existing data.");
      return;
    }

    if (result.length > 0) {
      console.log(`Data already exists for pid ${pid} on date ${date}`);
      res.status(200).send("Data already exists for this date.");
      return;
    }

    // Data does not exist, proceed with insertion
    let insertUserQuery = "INSERT INTO `rank`(`rank_number`,`pid`, `old_score`,`date`) VALUES (?,?,?,?)";
    insertUserQuery = mysql.format(insertUserQuery, [i, pid, oldsc, date]);
    conn.query(insertUserQuery, (err, result) => {
      if (err) {
        console.error("Error occurred while inserting data:", err);
        res.status(500).send("Error occurred while inserting data.");
        return;
      }

      res.status(201).json({
        affected_row: result.affectedRows,
        last_idx: result.insertId,
      });
    });
  });
});



// router.get("/insertrank/:pid/:namepic/:oldsc/:date", (req, res) => {
//   const { pid, namepic, oldsc, date } = req.params;
 
//   // ตรวจสอบว่ามีข้อมูลที่ตรงกับเงื่อนไขหรือไม่
//   let checkQuery = "SELECT * FROM `rank` WHERE `pid` = ? AND `namepic` = ? AND `old_score` = ? AND `date` = ?";
//   checkQuery = mysql.format(checkQuery, [pid, namepic, oldsc, date]);
 
//   conn.query(checkQuery, (err, result) => {
//      if (err) {
//        res.status(500).send(err);
//        return;
//      }
 
//      // ถ้าไม่มีข้อมูลที่ตรงกับเงื่อนไข ทำการ insert
//      if (result.length === 0) {
//        let insertUserQuery = "INSERT INTO `rank`(`pid`, `namepic`,`old_score`,`date`) VALUES (?,?,?,?)";
//        insertUserQuery = mysql.format(insertUserQuery, [pid, namepic, oldsc, date]);
 
//        conn.query(insertUserQuery, (err, result) => {
//          if (err) {
//            res.status(500).send(err);
//            return;
//          }
 
//          res.status(201).json({
//            affected_row: result.affectedRows,
//            last_idx: result.insertId,
//          });
//        });
//      } else {
//        // ถ้ามีข้อมูลที่ตรงกับเงื่อนไข ส่งกลับข้อมูลที่มีอยู่
//        res.status(200).json({
//          message: "Data already exists, no insert needed.",
//          existing_data: result,
//        });
//      }
//   });
//  });




// // สมมติว่าคุณมี endpoint สำหรับตรวจสอบข้อมูลในตาราง rank
// router.get("/checkrank/:pid/:namepic/:old_score/:date", (req, res) => {
//   const { pid, namepic, old_score, date } = req.params;
 
//   const sql = `
//      SELECT * FROM rank
//      WHERE pid = ? AND namepic = ? AND old_score = ? AND date = ?
//   `;
 
//   conn.query(sql, [pid, namepic, old_score, date], (err, result) => {
//      if (err) {
//        res.status(500).send(err);
//      } else {
//        // ส่งกลับว่ามีข้อมูลหรือไม่
//        res.json({ exists: result.length > 0 });
//      }
//   });
//  });
 


 
 




  // router.get("/sql/:img/:namepic/", (req, res) => {
  //   const { img, namepic} = req.params;

  //   let sql =
  //     "INSERT INTO `picture`(`img`, `namepic`) VALUES (?,?)";
  //   sql = mysql.format(sql, [img, namepic]);
  //   conn.query(sql, (err, result) => {
  //     if (err) {
  //       console.error('Database error:', err);
  //       return res.status(500).json({ error: 'Internal server error' });
  //     }

  //     res.status(201).json({
  //       affected_row: result.affectedRows,
  //       last_idx: result.insertId,
  //     });
  //   });
  // });

  // router.get("/sql/:name/:email/:password", (req, res) => {
  //   const { name, email, password } = req.params;
  
  //   // Check if email already exists in the database
  //   // let checkEmailExistence = "SELECT COUNT(*) AS emailCount FROM `user` WHERE `email` = ?";
  //   // checkEmailExistence = mysql.format(checkEmailExistence, [email]);
  
  //   // conn.query(checkEmailExistence, (err, emailCheckResult) => {
  //   //   if (err) {
  //   //     console.error('Database error:', err);
  //   //     return res.status(500).json({ error: 'Internal server error' });
  //   //   }
  
  //     // if (emailCheckResult[0].emailCount > 0) {
  //     //   // If email already exists, return an error
  //     //   return res.status(400).json({ error: 'Email already exists in the database' });
  //     // }
  
  //     // If email does not exist, proceed with the user insertion
  //     let insertUserQuery = "INSERT INTO `user`(`name`, `email`, `password`, `type`) VALUES (?,?,?,1)";
  //     insertUserQuery = mysql.format(insertUserQuery, [name, email, password]);
  
  //     conn.query(insertUserQuery, (err, result) => {
  //       if (err) {
  //         console.error('Database error:', err);
  //         return res.status(500).json({ error: 'Internal server error' });
  //       }
  
  //       res.status(201).json({
  //         affected_row: result.affectedRows,
  //         last_idx: result.insertId,
  //       });
  //     });
  //   });
  // ;

    //   router.get("/update1/:result1/:picID", (req, res) => {
  //     let pictureId = req.params.picID;
  //     let updateScore1: Pictures = {
  //         pid: pictureId, 
  //         totalVote: req.params.result1,
  //     };

  //     // ดึงคะแนนเก่าจากฐานข้อมูล
  //     let sqlOldScore = "SELECT `totalVote` FROM `picture` WHERE `pid` = ?";
  //     conn.query(sqlOldScore, [pictureId], (err, result) => {
  //         if (err) throw err;
  //         let oldScore = result[0].totalVote;

  //         // อัปเดตคะแนนใหม่ลงในฐานข้อมูล
  //         let sqlUpdateScore = "UPDATE `picture` SET `totalVote` = ? WHERE `pid` = ?";
  //         sqlUpdateScore = mysql.format(sqlUpdateScore, [updateScore1.totalVote, updateScore1.pid]);
  //         conn.query(sqlUpdateScore, (err, result) => {
  //             if (err) throw err;

  //             // เพิ่มข้อมูลเกี่ยวกับ old_score และ new_score ลงในตาราง score_history
  //             let sqlInsertScoreHistory = "INSERT INTO `score_history` (`pid`, `old_score`, `new_score`) VALUES (?, ?, ?)";
  //             sqlInsertScoreHistory = mysql.format(sqlInsertScoreHistory, [pictureId, oldScore, updateScore1.totalVote]);
  //             conn.query(sqlInsertScoreHistory, (err, result) => {
  //                 if (err) throw err;
  //                 res.status(201).json({ affected_row: result.affectedRows });
  //             });
  //         });
  //     });
  // });

  // router.get("/update2/:result2/:picID", (req, res) => {
  //   let pictureId = req.params.picID;
  //   let updateScore2: Pictures = {
  //       pid: pictureId, 
  //       totalVote: req.params.result2,
  //   };

  //   // ดึงคะแนนเก่าจากฐานข้อมูล
  //   let sqlOldScore = "SELECT `totalVote` FROM `picture` WHERE `pid` = ?";
  //   conn.query(sqlOldScore, [pictureId], (err, result) => {
  //       if (err) throw err;
  //       let oldScore = result[0].totalVote;

  //       // อัปเดตคะแนนใหม่ลงในฐานข้อมูล
  //       let sqlUpdateScore = "UPDATE `picture` SET `totalVote` = ? WHERE `pid` = ?";
  //       sqlUpdateScore = mysql.format(sqlUpdateScore, [updateScore2.totalVote, updateScore2.pid]);
  //       conn.query(sqlUpdateScore, (err, result) => {
  //           if (err) throw err;

  //           // เพิ่มข้อมูลเกี่ยวกับ old_score และ new_score ลงในตาราง score_history
  //           let sqlInsertScoreHistory = "INSERT INTO `score_history` (`pid`, `old_score`) VALUES (?, ?)";
  //           sqlInsertScoreHistory = mysql.format(sqlInsertScoreHistory, [pictureId, oldScore, updateScore2.totalVote]);
  //           conn.query(sqlInsertScoreHistory, (err, result) => {
  //               if (err) throw err;
  //               res.status(201).json({ affected_row: result.affectedRows });
  //           });
  //       });
  //   });
  // });
 
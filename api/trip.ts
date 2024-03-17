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

// router.get("/", (req, res) => {
//   res.send("Get in trip.ts");
// });

// router.get("/:id", (req, res) => {
//     res.send("Get in trip.ts id: " + req.params.id);
//   });

// router.get('/', (req, res) => {
//     if (req.query.id) {
//       res.send("Get in trip.ts Query id: " + req.query.id);
//     } else {
//       res.send("Get in trip.ts");
//     }
//   });

//   router.post("/", (req, res) => {
//     let body = req.body; 
//     res.send("Get in trip.ts body: " + body);
//   });

//   router.post("/", (req, res) => {
//     let body = req.body; 
//     res.send("Get in trip.ts body: " + JSON.stringify(body));
//   });

// router.post("/", (req, res) => {
//     let body = req.body;
//     res.status(201);
//     res.send("Get in trip.ts body: " + JSON.stringify(body));
//     });


router.get("/", (req, res) => {
    conn.query('select * from user', (err, result, fields)=>{
      res.json(result);
    });
  });

  router.get("/check/:email/:password", (req, res) => {
    const em = req.params.email;
    const pw = req.params.password;
    conn.query('select * from user where email = ? AND password = ?',[em, pw], (err, result, fields)=>{
      if(err){
        res.status(500);
      }
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
          res.status(500);
        }
  
        res.status(201).json({
          affected_row: result.affectedRows,
          last_idx: result.insertId,
        });
      });
    });
  ;
  
//--ดึงรูปแบบRandom--//
  router.get("/picture", (req, res) => {
    const sql = "SELECT * FROM picture";
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
  router.get("/update1/:result1/:picID", (req, res) => {
    let pictureId = req.params.picID;
    let updateScore1:Pictures = {
        pid: pictureId, 
        totalVote: req.params.result1,
    };

    // ดึงคะแนนเก่าจากฐานข้อมูล
    let sqlOldScore = "SELECT `totalVote` FROM `picture` WHERE `pid` = ?";
    conn.query(sqlOldScore, [pictureId], (err, result) => {
        if (err) throw err;
        let oldScore = result[0].totalVote;

        // อัปเดตคะแนนใหม่ลงในฐานข้อมูล
        let sqlUpdateScore = "UPDATE `picture` SET `totalVote` = ? WHERE `pid` = ?";
        sqlUpdateScore = mysql.format(sqlUpdateScore, [updateScore1.totalVote, updateScore1.pid]);
        conn.query(sqlUpdateScore, (err, result) => {
            if (err) throw err;

            // เพิ่มข้อมูลเกี่ยวกับ old_score และ updated_at ลงในตาราง score_history
            let sqlInsertScoreHistory = "INSERT INTO `score_history` (`pid`, `old_score`, `updated_at`) VALUES (?, ?, ?)";
            sqlInsertScoreHistory = mysql.format(sqlInsertScoreHistory, [pictureId, oldScore, new Date()]);
            conn.query(sqlInsertScoreHistory, (err, result) => {
                if (err)throw err;
                res.status(201).json({ message: "Update and log old score and update date successfully", affected_row: result.affectedRows });
            });
        });
    });
});


router.get("/update2/:result2/:picID", (req, res) => {
  let pictureId = req.params.picID;
  let updateScore2:Pictures = {
      pid: pictureId, 
      totalVote: req.params.result2,
  };

  // ดึงคะแนนเก่าจากฐานข้อมูล
  let sqlOldScore = "SELECT `totalVote` FROM `picture` WHERE `pid` = ?";
  conn.query(sqlOldScore, [pictureId], (err, result) => {
      if (err) throw err;
      let oldScore = result[0].totalVote;

      // อัปเดตคะแนนใหม่ลงในฐานข้อมูล
      let sqlUpdateScore = "UPDATE `picture` SET `totalVote` = ? WHERE `pid` = ?";
      sqlUpdateScore = mysql.format(sqlUpdateScore, [updateScore2.totalVote, updateScore2.pid]);
      conn.query(sqlUpdateScore, (err, result) => {
          if (err) throw err;

          // เพิ่มข้อมูลเกี่ยวกับ old_score และ updated_at ลงในตาราง score_history
          let sqlInsertScoreHistory = "INSERT INTO `score_history` (`pid`, `old_score`, `updated_at`) VALUES (?, ?, ?)";
          sqlInsertScoreHistory = mysql.format(sqlInsertScoreHistory, [pictureId, oldScore, new Date()]);
          conn.query(sqlInsertScoreHistory, (err, result) => {
              if (err)throw err;
              res.status(201).json({ message: "Update and log old score and update date successfully", affected_row: result.affectedRows });
          });
      });
  });
});

router.get("/rank", (req, res) => {
  // ดึงข้อมูลจากตาราง picture และ score_history
  let sql = `
      SELECT p.*, p.totalVote - s.old_score as score_change, s.updated_at as latest_update
      FROM picture p
      LEFT JOIN (
          SELECT pid, old_score, updated_at,
          ROW_NUMBER() OVER (PARTITION BY pid ORDER BY updated_at DESC) as row_num
          FROM score_history
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



router.get("/ranktoday/:date", (req, res) => { 
  const date = req.params.date;
  conn.query('SELECT * FROM score WHERE date = ? ORDER BY old_score DESC',[date], (err, result, fields)=>{
    if(err){
      res.status(500);
    }
    res.json(result);
  });
});





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
 
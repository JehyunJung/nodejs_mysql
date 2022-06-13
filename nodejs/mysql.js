const config=require('../dbconfig.json');
const mysql=require('mysql');

const connection=mysql.createConnection({
    host:config.host,
    user:config.user,
    password:config.password,
    database:config.database
})

connection.connect();

connection.query('select * from topic',(err,res,fields)=>{
    if(err){
        throw err;
    }
    console.log("The solution is: " + JSON.stringify(res));
})

connection.end();
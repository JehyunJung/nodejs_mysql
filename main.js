var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
const mysql_connection=require('./nodejs/mysql.js');


mysql_connection.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
          mysql_connection.query("SELECT * FROM TOPIC",(error,topics)=>{
            console.log(topics);
            const title = 'Welcome';
            const description = 'Hello, Node.js';
            const list = template.list(topics);
            const html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
            ); 
            response.writeHead(200);
            response.end(html);
        });
      } else {
        mysql_connection.query("SELECT * FROM topic",(error,topics)=>{
          const filteredId = path.parse(queryData.id).base;
          mysql_connection.query(
            `SELECT topic.id,title,description,name,profile From topic LEFT JOIN author on topic.author_id=author.id where topic.id=?`,
            [parseInt(filteredId)],
            (error,topic)=>{
              if(error){
                console.log(error);
              }
              const title=topic[0].title;
              const description=topic[0].description
              const author_name=topic[0].name;
              const author_profile=topic[0].profile;

              const sanitizedTitle = sanitizeHtml(title);
              const sanitizedDescription = sanitizeHtml(description, {
                  allowedTags:['h1']
              });
              const list = template.list(topics);
              const html = template.HTML(sanitizedTitle, list,
                  `<h2>${sanitizedTitle}</h2>
                  <h3>Descrption:${sanitizedDescription}</h3>
                  <h3>Author Name:${author_name}</h3>
                  <h3>Author Profile:${author_profile}</h3>`,
                  ` <a href="/create">create</a>
                    <a href="/update?id=${filteredId}">update</a>
                    <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${filteredId}">
                      <input type="submit" value="delete">
                    </form>`
                );
                response.writeHead(200);
                response.end(html);
            })
        })
        
      }
    } else if(pathname === '/create'){
      mysql_connection.query("SELECT * FROM TOPIC",(error,topics)=>{
        mysql_connection.query("SELECT * FROM AUTHOR",(error2,authors)=>{
          console.log(topics);
          const title = 'WEB - create';
          const list = template.list(topics);
          const html = template.HTML(title, list,`
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            ${template.author_select(authors,undefined)}
            <p>
              <input type="submit">
            </p>
          </form>
        `, ''); 
          response.writeHead(200);
          response.end(html);
        })
        
      });
      }
    else if(pathname === '/create_process'){
      let body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          const post = qs.parse(body);
          console.log(post);
          const title = post.title;
          const description = post.description;
          const author_id=post.author;
          console.log(author_id);
          mysql_connection.query(
            `INSERT INTO topic(title,description,created,author_id) values(?,?,now(),?);`,
            [title,description,author_id],
            (err,results)=>{
              if(err){
                throw err; 
              }
              response.writeHead(302, {Location: `/?id=${results.insertId}`});
              response.end();

          })
      });
    } else if(pathname === '/update'){
      mysql_connection.query("SELECT * FROM topic",(error1,topics)=>{
        if(error1){
          throw error1;
        }
          const filteredId = path.parse(queryData.id).base;
          mysql_connection.query(`SELECT * From topic WHERE id=?`,[filteredId],(error2,topic)=>{
            if(error2){
              throw error2;
            }
            mysql_connection.query("SELECT * FROM AUTHOR",(error3,authors)=>{
              if(error3){
                throw error3;
              }
              const title=topic[0].title;
              const description=topic[0].description;
              const author_id=topic[0].author_id;
              const sanitizedTitle = sanitizeHtml(title);
              const sanitizedDescription = sanitizeHtml(description, {
                  allowedTags:['h1']
              });
              const list = template.list(topics);
              const html = template.HTML(sanitizedTitle, list,
                `
                <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${filteredId}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
                  </p>
                  ${template.author_select(authors,author_id)}
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,'');
                response.writeHead(200);
                response.end(html);
            })
        })
      })
    } else if(pathname === '/update_process'){
      let body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          const post = qs.parse(body);
          const id = post.id;
          const title = post.title;
          const description = post.description;
          const author_id=post.author;


          mysql_connection.query(
            "UPDATE TOPIC SET Title=?,description=?,author_id=? where id=?; ",
            [title,description,author_id,id],
            (error,topics)=>{
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${id}`});
              response.end();

            });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          mysql_connection.query(
            "DELETE FROM TOPIC WHERE ID=?",
            [filteredId],
            (err,results)=>{
              if(err){
                throw err;
              }
              response.writeHead(302, {Location: `/`});
              response.end();
            });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);

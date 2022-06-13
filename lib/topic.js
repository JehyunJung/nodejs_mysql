const mysql_connection=require('../lib/mysql');
const template=require("./template");
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const url=require('url');
const qs = require('querystring');

exports.home=function(request,response){
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
}
exports.page=function(request,response){
    const _url=request.url;
    const queryData=url.parse(_url,true).query;
    const filteredId = path.parse(queryData.id).base;
    mysql_connection.query("SELECT * FROM topic",(error,topics)=>{
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
exports.create=function(request,response){
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
exports.create_process=function(request,response){
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
}
exports.update=function(request,response){
    const _url=request.url;
    const queryData=url.parse(_url,true).query;
    const filteredId = path.parse(queryData.id).base;
    console.log(filteredId);
    mysql_connection.query("SELECT * FROM topic",(error1,topics)=>{
        if(error1){
          throw error1;
        }
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
}
exports.update_process=function(request,response){
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
}
exports.delete_process=function(request,response){
    let body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        const post = qs.parse(body);
        const id = post.id;
        const filteredId = path.parse(id).base;
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
}
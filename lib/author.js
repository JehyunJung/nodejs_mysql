const mysql_connection=require('../lib/mysql');
const template=require("./template");
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const url=require('url');
const qs = require('querystring');

exports.home=function(request,response){
    mysql_connection.query("SELECT * FROM TOPIC",(error1,topics)=>{
        mysql_connection.query("SELECT * FROM AUTHOR",(error2,authors)=>{
            const title = 'Welcome';
            const description = 'Hello, Node.js';
            
            const list = template.list(topics);
            const html = template.HTML(title, list,
                `
                ${template.author_list(authors)}
                <form action="/author/create_process" method="post">
                    <p>
                        <input name="name" placeholder="name"></input>
                    </p>
                    <p>
                        <textarea name="profile" placeholder="profile"></textarea>
                    </p>
                    <input type="submit" value="create">
                </form>
                `,
                ` `
            ); 
            response.writeHead(200);
            response.end(html);
            });
    
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

        const name = post.name;
        const profile = post.profile;
        mysql_connection.query(
          `INSERT INTO author(name,profile) values(?,?);`,
          [name,profile],
          (err,results)=>{
            if(err){
              throw err; 
            }
            response.writeHead(302, {Location: `/author`});
            response.end();

        })
    });
}
exports.update=function(request,response){
    const _url=request.url;
    const queryData=url.parse(_url,true).query;
    const filteredId = path.parse(queryData.id).base;
    mysql_connection.query("SELECT * FROM TOPIC",(error1,topics)=>{
        mysql_connection.query("SELECT * FROM AUTHOR",(error2,authors)=>{
            const title = 'Welcome';
            const description = 'Hello, Node.js';
            let name="";
            let profile="";

            authors.forEach((author)=>{
                console.log(author.profile)
                if(author.id === parseInt(filteredId)){
                    name=author.name;
                    profile=author.profile;
                }
            })
            console.log(name,profile);
            
            const list = template.list(topics);
            const html = template.HTML(title, list,
                `
                ${template.author_list(authors)}
                <form action="/author/update_process" method="post">
                    <input name="id"  value="${filteredId}" hidden></input>
                    <p>
                        <input name="name" placeholder="name" value="${name}"></input>
                    </p>
                    <p>
                        <textarea name="profile" placeholder="profile">${profile}</textarea>
                    </p>
                    <input type="submit" value="update">
                </form>
                `,
                ` `
            ); 
            response.writeHead(200);
            response.end(html);
            });
    
        });
}
exports.update_process=function(request,response){
    let body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        const post = qs.parse(body);
        console.log(post);
        const id=post.id;
        const name = post.name;
        const profile = post.profile;
        mysql_connection.query(
          `UPDATE Author SET Name=?, Profile=? WHERE id=?;`,
          [name,profile,id],
          (err,results)=>{
            if(err){
              throw err; 
            }
            response.writeHead(302, {Location: `/author`});
            response.end();

        })
    });
}
exports.delete_process=function(request,response){
    let body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        const post = qs.parse(body);
        const id=post.id;
        mysql_connection.query(
          `DELETE FROM AUTHOR WHERE ID=?;`,
          [id],
          (err,results)=>{
            if(err){
              throw err; 
            }
            response.writeHead(302, {Location: `/author`});
            response.end();

        })
    });
}
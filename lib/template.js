module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <a href="/author">author</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  author_select:function(authors,current_id){
    let option_tag="";

    authors.forEach((author)=>{
      let selected="";
      if(author.id===current_id){
        selected="selected";
      }
        option_tag+=`<option value=${author.id} ${selected}>${author.name}</option>`;
    });
    
    return `<p>
    <select name="author">
    ${option_tag}
    </select>
     </p>
    `;
  },
  author_list:function(authors){
    let table_tag="";
    let table_body=""
    authors.forEach((author)=>{
        table_body+=`
        <tr>
            <td>${author.name}</td>
            <td>${author.profile}</td>
            <td><a href="/author/update?id=${author.id}">update</a></td>
            <td>
              <form action="/author/delete_process" method="post">
                <input name="id"  value="${author.id}" hidden></input>
                <input type="submit" value="delete"></input>
              </form>
            </td>
        </tr>
            `
    })
    if(authors.length >1){
        table_tag=`
        <table border=1>
            <th>author</th>
            <th>profile</th>
            <th>update</th>
            <th>delete</th>
            ${table_body}
        </table>
            `;
    }
    return table_tag;
  }

}

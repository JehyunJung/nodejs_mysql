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
  }

}

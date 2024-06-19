var async2 = require('async');
const Pool = require('pg').Pool
var format = require('pg-format');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clone',
 // database: 'creative',
  password: 'postgres',
  port: 5432,
})
function toCamelCase(str){
  return str.split('_').map(function(word,index){
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}
async function createTable(tableName, ncolumns){
  return new Promise(resolve => {
  setTimeout(() => {
     // console.log(ncolumns);
      mcolumns = "";
      ncolumns.split('|').forEach(col => {
          if(col.length > 61){
              col = toCamelCase(col);
              if(col.length > 61)
                  col = col.replace(/[aeiou]/g, '');
          }
          mcolumns += col+" text NULL,";
          
      });
                    

      var columns = "";
      columns = "id serial not NULL,";
      columns += mcolumns;
      columns += 'created_at information_schema."time_stamp" NULL DEFAULT CURRENT_TIMESTAMP,';
      columns += 'c_account_id int4 NULL';
      
      var qry = 'CREATE TABLE IF NOT EXISTS '+tableName+' ('+columns+', CONSTRAINT '+tableName+'_pk PRIMARY KEY (id))';
     // console.log(qry);
      pool.query(qry,
      (error, results) => {
          if (error) {
          throw error
          }
          console.log(`Table `+tableName+` created successfully!`)
      })
      resolve();
  }, 1000);
  }); 
}

async function generateSchema(){
  const getTableColumns = "select min(id) as ID, tbl_name, string_agg(attribute_name, '|') as cols from objects inner join object_attributes on objects.id=object_attributes.object_id group by ID, tbl_name order by ID";
  response = await pool.query(getTableColumns);
  //console.log(response.rows[0].cols);
  let utabls = [];
  let i = 0;
  for(item of response.rows){
      if(item.tbl_name != "Issues" && utabls.includes(item.tbl_name) == false){       
          utabls.push(item.tbl_name);
          //console.log(item.tbl_name+" >> "+item.cols);
          await createTable(item.tbl_name, item.cols);
      }
  }  
}
async function InsertRows(tableName, cols, vals){
  const insertQuery = format('INSERT INTO '+tableName+' ('+cols.join(", ")+') VALUES %L', vals);
  //console.log(insertQuery);
  res = pool.query(insertQuery);
}
async function createChunks(tableName, cols, vals){
  return new Promise(resolve => {
      setTimeout(() => {
          chunks = [];
          for(chunk of vals){
              chunks.push(chunk);
              if(chunks.length == 10){
                 InsertRows(tableName, cols, chunks);
                  chunks = [];
              }
          }
          if(chunks.length > 0){
              InsertRows(tableName, cols, chunks);
              chunks = [];
          }
      
          resolve();
      }, 1000);
  }); 
}
async function dumpData(){
  const getTableColumns = "select count(id), tbl_name from objects group by tbl_name";
  response = await pool.query(getTableColumns) ;
  let i = 1;
  for(item of response.rows){
      //console.log(item.cols);
      if(item.tbl_name != "Issues" && item.tbl_name != "Users"){
          console.log(i++ +" >> "+ item.tbl_name);
          const getTableColumns2 = "select object_id, tbl_name, attribute_name, value, created_at, account_id from objects inner join object_attributes on objects.id=object_attributes.object_id where objects.tbl_name = '"+item.tbl_name+"' order by object_id, attribute_name";
          response2 = await pool.query(getTableColumns2);
          cols = [];
          vals = [];
          val = [];
          var obj_state = 0;
          for(item2 of response2.rows){
              if(obj_state != 0 && obj_state != item2.object_id){
                  val.push(item2.created_at)
                  val.push(item2.account_id)
                  vals.push(val);
                  val = [];
                  //   console.log(obj_state);
              }
              obj_state = item2.object_id;
              val.push(item2.value);
              if(!cols.includes(item2.attribute_name))
                  cols.push(item2.attribute_name);
              
          }
          cols.push("created_at")
          cols.push("c_account_id")
          val.push(item2.created_at)
          val.push(item2.account_id)
          vals.push(val);
          // console.log(cols);
          // console.log(vals);
          await createChunks(item.tbl_name, cols, vals);

      } 
  }
}

table = [];
async function generateIssuesSchema(){
    const getTableColumns = `select min(id) as ID, object_id, tbl_name, string_agg(attribute_name, '|' order by attribute_name) as cols from objects 
    inner join object_attributes on objects.id=object_attributes.object_id 
    where tbl_name = 'Issues' 
    group by object_id, tbl_name order by ID`;
    response = await pool.query(getTableColumns);
    //console.log(response.rows[0].cols);
    var cols = "";
    var rows = [];
    var i = 1;
    for(item of response.rows){
        if(cols != "" && cols != item.cols){
            tNam = "issues_"+i;
            table.push({"tbl": tNam, "cols":cols, "rows": rows});
            await createTable(tNam, cols); 
            rows = [];
            i++;
        } 
        cols = item.cols;
        rows.push(item.object_id);
        
    }
   // if(rows.length > 0 && cols != item.cols){
        tNam = "issues_"+i;
        table.push({"tbl": tNam, "cols":cols, "rows": rows});
        await createTable(tNam, cols); 
        
    //}
    
   //console.log(table);
}
async function dumpIssuesData(){
    // console.log(table.length);
    var noRowsTbls = [];
    for(chunk of table){
        //console.log(chunk.tbl +" >> "+ chunk.cols);
        if(chunk.rows.length > 0){

            getTableVals = `select object_id,tbl_name, attribute_name, value, created_at, account_id from objects 
            inner join object_attributes on objects.id=object_attributes.object_id 
            where object_id IN(`+chunk.rows+`)
            order by object_id, attribute_name`;
            
            response = await pool.query(getTableVals);
        // console.log(response.rows);
            vals = [];
            val = [];
            var obj_state = 0;
            k = 0;
            
            for(item of response.rows){
                //console.log(k++ +" >> "+item.length);
                if(obj_state != 0 && obj_state != item.object_id){
                    val.push(item.created_at)
                    val.push(item.account_id)
                    vals.push(val);
                    val = [];
                    //   console.log(obj_state);
                }
                obj_state = item.object_id;
                val.push(item.value);
                
            }
            
            val.push(item.created_at)
            val.push(item.account_id)
           
            vals.push(val);
            // console.log(val.length);
            // return true;
            cols = [];
            chunk.cols.split('|').forEach(col => {
                //tblCols.push({table_name: item.table_name, attribute_name: col});
                if(col.length > 61){
                    col = toCamelCase(col);
                    if(col.length > 61)
                        col = col.replace(/[aeiou]/g, '');
                }
                cols.push(col);
                
            });
            cols.push("created_at")
            cols.push("c_account_id")   
            await createChunks(chunk.tbl, cols, vals);
        } else {
            noRowsTbls.push(chunk.tbl);
        }       
     }      
}
async function insertObject(account, element){
  return await new Promise((resolve, reject) => {
    //setTimeout(() => {
        const insertQuery = 'INSERT INTO objects (tbl_name, kind, sub_url, account_id) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [element.name, element.kind, element.url, account.id];
        res = pool.query(insertQuery, values);
        resolve(res);
   // }, 1000);
  });
   // return res;
  
}
async function insertAttribute(object_id, key, value){
    return await new Promise((resolve, reject) => {
        //setTimeout(() => {
        const insertAttributeQuery = 'INSERT INTO object_attributes (attribute_name, value, object_id) VALUES ($1, $2, $3)';
        const vals = [key, value, object_id];                        
        res = pool.query(insertAttributeQuery, vals);
        resolve(res);
        // }, 1000);
    });      
}
async function fetchAndInsert(account, auth, element){
    // Simulating an asynchronous operation
    //console.log(element);
    //return;
    return new Promise(resolve => {
        //setTimeout(() => {
        fetch(account.url+'/'+element.url, {
            method: 'GET',
            headers : {
            "Authorization" : auth
            }, 
        })
        .then(subResponse => subResponse.json())
        .then(subData => {
            if(subData.value.length > 0){
                for (const subItem of subData.value) {                        
                    insertObject(account, element).then((result) => {
                        var j = 1;
                        object_id = result.rows[0].id;
                        Object.entries(subItem).forEach(async (entry) => {
                            key = entry[0];
                            value = entry[1];
                            console.log(" >>>> "+ j +" -  "+key+" >> "+value);  
                            await insertAttribute(object_id, key, value);
                        }); 
                        j++; 
                    });                    
                }                
            }
        })
        resolve();
    //}, 15000);
    
    });    
}

async function fetchAccountsData(account){
    var auth = "Basic " + new Buffer.from(account.user_name + ":" + account.password).toString("base64");
    await fetch(account.url, {
          method: 'GET',
          headers : {
            "Authorization" : auth
          }, 
        })
        .then(response => response.json())
        .then(data => {            
            if(data.value){
                var i = 1;
                console.log();
                for (const item of data.value) {
                    console.log(i++ +" >> "+ item.name); 
                    fetchAndInsert(account, auth, item);
                    
                }
            } else if(data.error){
                console.log(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
async function fetchAccounts(){
    var qry = `select * from accounts where status = 1`;
    response = await pool.query(qry);
    for(account of response.rows){
        console.log("############################# "+account.account_name+" Executing ########################");
        await fetchAccountsData(account)
       // return;
    }

}
async2.series([
  fetchAccounts,
  generateSchema,
  dumpData,
  generateIssuesSchema,
  dumpIssuesData
], function (err, results) {
  console.log("Crawler End Now!");
}); 
  

var async2 = require('async');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clone',
 // database: 'creative',
  password: 'postgres',
  port: 5432,
})


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
    //// generateSchema,
    fetchAccounts,
    // generateIssuesSchema,
     //dumpIssuesData
    ], function (err, results) {
    console.log("Crawler End!");
});  
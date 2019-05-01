const ethers =require('ethers'); //Ethers is a javascript for dapps, an advanced version of web3.js
var express = require('express');//Express is a server, same as lite-server
var sha256 = require('js-sha256');//sha-256 is a standard js library to perform SHA encryption.
var bodyParser = require('body-parser');
var app = express();
var provider =ethers.getDefaultProvider('ropsten');
var login=false
const hbs=require('hbs')
var address='0x85f43e0991ec2affe4da044eb98c7d3897ca9dc5';//Address of deployed contract

var roll;
app.set('view engine','hbs')
var abi=[
  {
    "constant": false,
    "inputs": [
      {
        "name": "_hash1",
        "type": "bytes32"
      },
      {
        "name": "_hash2",
        "type": "bytes32"
      },
      {
        "name": "_rollno",
        "type": "bytes32"
      }
    ],
    "name": "setDegree",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "hash1",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "hash2",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "rollno",
        "type": "bytes32"
      }
    ],
    "name": "Degree",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getDegree",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];//ABI of our contract

var privateKey='677A5358B877B0E8723E44EECA853513E140D5A882E84FAF74C67F40EA498225';//Our private key. Since it doenst use Metamask, we have to provide our private KEY by our own.
var wallet = new ethers.Wallet(privateKey,provider);
var contract = new ethers.Contract(address,abi,wallet);
app.use(express.static('public'));
app.use(bodyParser());
var mysql = require('mysql');

var hash1="";
var con = mysql.createConnection({
host: "localhost",
user: "root",
password: "root",
database: "blockchain"
});//Creating a connection to communicate with our database!!

con.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});//If connects successfully, return "Connected", else throw an error.

// create application/json parser
var jsonParser = bodyParser.json();
app.get('/', function(request, response) {
response.sendFile(__dirname + '/views/index.html');
});

app.post('/login',jsonParser,(request,response)=>{

  if(login==false)
  {
  var sql='SELECT * FROM login  where User= ("'+request.body.username+'")'
  con.query(sql,(error,result)=>{
    if(error){
      response.render('Error',{
            
        error:'CouldNot Connect to database Try later',
        link:'/',
        method:'get'
        
    })
      
    }
    else if(result.length==0){
       response.render('Error',
       {
         error:'Wrong user Name or password!!!!',
         link:'/',
        method:'get'
       })
    }
    else{
      var pass=result[0].Pass;
      hashpass=sha256(request.body.pass);
      if(pass==hashpass)
      {
        login=true
        response.sendFile(__dirname+'/views/Form.html')
      }
      else{
        response.render('Error',
        {
          error:'Wrong user Name or password!!!!',
          link:'/',
         method:'get'

        })
        
      }
    }
  })
}
else if(login==true)
{
  response.sendFile(__dirname+'/views/Form.html')

}
})
app.get('/validate', function(request, response) {
response.sendFile(__dirname + '/views/validate.html');
});

//Our main function
app.post('/addUser', jsonParser, function(request, response)
 {
 
   responseall=response
   roll=0;
  if(login==true)
  {
roll =request.body.rollNo;
console.log("Roll number of student is: "+roll);
//A sample SQL query:- var sql=  'INSERT INTO first  VALUES ("'+request.body.user+'","'+request.body.password+'")';
var sql='INSERT INTO student  VALUES ("'+request.body.rollNo+'","'+request.body.univName+'","'+request.body.studName+'","'+request.body.fatherName+'","'+request.body.course+'","'+request.body.dateOfAward+'","'+request.body.grade+'")';
con.query(sql,function(err,request)
{
  
    if(err!=null && err.sqlMessage=="Duplicate entry '"+roll+"' for key 'PRIMARY'")
    {
    
      return response.render('Error',{
        error:"Degree Already deployed.",
          link:'/login',
        method:'post'
      })
      
    }
    else if(err)
    {
      return response.render('Error',{
        error:"Wrong data formal Correct format is YYYY-MM-DD",
        link:'/login',
        method:'post'
      })
      
    }
    else{
    console.log("1 data is inserted with roll no "+roll);//Confirm that data is inserted.
    encrypt(roll,response)
 

    }
})





//Calling our main function Encrypt().
//response.sendFile(__dirname+"/views/deploy.html");
  }
  else{
    response.sendFile(__dirname+"/views/index.html");
  }
});



function encrypt(value,responseall)
{var st=''
  var sql2='SELECT * FROM student  where rollNo= ("'+value+'")';
  con.query(sql2,(error,data)=>
  {
  if(error)
  {  
      return responseall.render('Error',{
        error:"Record can't be fetched for further deployment!! Re-deploy or contact adminstrator.",
        link:'/login',
          method:'post'
      })
      //console.log("", error)
  }
  else if(data!=null){
  var a=data[0].rollNo;
  var b=data[0].univName;
  var c=data[0].studName;
  var d=data[0].fatherName;
  var e=data[0].course
  var f=data[0].dateOfAward;
  var g=data[0].grade;
  st=st+a+b+c+d+e+f+g;
  console.log("Record to perform SHA is: "+st); 
  hash1=sha256(st);
  console.log("Before concatenation, SHA 256 hash is: "+hash1);
  //Now we will concatenate SHA 256 hash(64 bit) with rollnumber(10bit) and then slice it into three parts(s1,s2 and roll) and store these 3 parts in our blockchain.
  var s1=hash1.substring(0,29);
  var s2=hash1.substring(29,58);
  var roll1=hash1.substring(58)+roll;
  s1=ethers.utils.formatBytes32String(s1);
  s2=ethers.utils.formatBytes32String(s2);
  roll1=ethers.utils.formatBytes32String(roll1);
  console.log("Final data to be stored in blockchain is");
  console.log(s1);
  console.log(s2);
  console.log(roll1);
  var set=contract.setDegree(s1,s2,roll1);
  set.then(function(transaction){
  console.log("Transaction is");
  console.log(transaction);
  console.log("Contract address is "+contract.address);
  console.log("Hash of txn is "+transaction.hash);
  
  //Now we will be storing txHash and roll no of that student in a separate table, so that credentials can be provided to student with ease.    
  var sql1='INSERT INTO record VALUES ("'+value+'","'+transaction.hash+'")';
  con.query(sql1,function(err,request)
  {
  if(err)
  {
    
  return console.log(err)
  }
  console.log("1 transaction is recorded with roll no "+roll);
  responseall.render('deploy',{
    rollno:roll,
    txhash:transaction.hash
  })
  
  })
  }).catch((error)=>{
    del='delete FROM student  where rollNo= ("'+value+'")';
    con.query(del,(error,data)=>{

    })
    console.log("Could not insert into record table",error)
    responseall.render('Error',{
      error:'CouldNot deploy check Your Internet Connection',
      link:'/login',
          method:'post'
    })
  })
  }
  });


}


//Specifyingg the port address where this project will be deployed.
app.listen(3000)
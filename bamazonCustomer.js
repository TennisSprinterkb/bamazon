var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password:"Tew890!",
    database: "bamazon_db"
})

connection.connect(function(err){
    if (err) throw err;
    console.log("Welcome to BamazonKB Style");
    forSale();
})

var forSale = function(){
    connection.query("SELECT * FROM products", function(err, res){
        for(var i=0; i<res.length; i++){
            console.log(res[i].item_id+" || "+res[i].product_name+" || "+
            res[i].department_name+" || "+res[i].price+" || "+res[i].stock_quantity+"\n");
        }
        promptUser(res);
    })
}

var promptUser = function(res){
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: "What is the name of the ID of the product you would like to buy?"
    }]).then(function(answer){
        var correct = false;
        for(var i=0;i<res.length;i++){
            if(res[i].product_name==answer.choice){
                correct=true;
                var product=answer.choice;
                var id = i;
                inquirer.prompt({
                    type:'input',
                    name:'quant',
                    message:"How many units of the product would you like to buy?",
                    validate: function(value){
                        if(isNaN(value)==false){
                            return true;
                        }else{
                            return false;
                        }
                    }
                }).then(function(answer){
                    if((res[id].stock_quantity-answer.quant)>0){
                        connection.query("UPDATE products SET stock_quantity='"+(res[id].stock_quantity-answer.quant)+
                        "' WHERE product_name='"+product+"'",function(err,res2){
                            console.log("You bought! ");
                            forSale();
                        })
                    }else{
                        console.log("Insufficient Quantity!");
                        promptUser(res);
                    }
                })
            }
        }
    })
}
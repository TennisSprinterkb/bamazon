var mysql = require('mysql');
var Table = require('cli-table');
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
        if (err) throw err;
        var table = new Table({
            head:['Item ID', 'Product-Name', 'Department-Name', 'Price', 'Stock-Quantity'],
            style: {
                head:['blue'],
                compact: false,
                colAligns: ['center']
            }
        });
        var array = [];
        var name = [];
        for(var i=0; i<res.length; i++){
            table.push(
                [res[i].item_id, res[i].product_name,
            res[i].department_name, res[i].price, res[i].stock_quantity]
            );
            array.push(
                [res[i].item_id, res[i].product_name,
            res[i].department_name, res[i].price, res[i].stock_quantity]
            )
            name.push(res[i].product_name);
            // console.log(res[i].item_id+" || "+res[i].product_name+" || "+
            // res[i].department_name+" || "+res[i].price+" || "+res[i].stock_quantity+"\n");
        }
        console.log(table.toString());
        promptUser(res,table, name, array);
    });
}

var promptUser = function(res, table, name, array){
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: "What is ID of the product you would like to buy? [Leave with L]"
    }]).then(function(answer){
        var correct = false;
        if(answer.choice.toUpperCase()=="L"){
            process.exit();
        }
        for(var i=0;i<res.length;i++){
            if(res[i].item_id==answer.choice){
                correct=true;
                var item=answer.choice;
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
                        "' WHERE item_id='"+item+"'",function(err,res2){
                            console.log("Your total is: $" + (res[id].price * answer.quant));
                            console.log("You paid! ");
                            forSale();
                        })
                    }else{
                        console.log("Insufficient Quantity!");
                        promptUser(res);
                    }
                })
            }
        }
        if(i==res.length && correct==false){
            console.log("Not valid please choose again");
            promptUser(res);
        }
    })
}



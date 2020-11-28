const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));



mongoose.connect("mongodb+srv://admin-julia:211186@cluster0.khhav.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Task", itemsSchema);

const buyFood = new Item({name: "Buy Food"});
const cookFood = new Item({name: "Cook Food"});
const eatFood = new Item({name: "Eat Food"});

const defaultItems = [buyFood, cookFood, eatFood];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
    const today = date.getDate();
    
    Item.find({}, function (err, foundItems) {

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                console.log(err);
                }else{
                    console.log("successfully added");
                }
            });
            res.redirect("/");
        }else{
        res.render('list', {kindOfDay: today, listOfItems: foundItems}); 
        }
    });
    
});


app.get("/:route", function(req, res) {
    const customRoute = _.capitalize(req.params.route);

    List.findOne({name: customRoute}, function(err, result) {
        if(!result){
            const list = new List({
                name: customRoute,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customRoute);
        }else{
            res.render("list", {kindOfDay: customRoute, listOfItems: result.items});
        }
      })

    
  });

app.post("/", function(req, res) {
   
    const item = req.body.nextItem;
    const listName = req.body.list;
    
  /* if(Object.keys(item).length === 0){
    console.log(item + " is empty");
    return false;
    }; */
        

        const newTask = new Item({name: item});
        if(listName === date.getDate()){
            newTask.save();
            res.redirect("/"); 
           }else{
               List.findOne({name: listName}, function(err, result){
                   result.items.push(newTask);
                   result.save();
                   res.redirect("/" + listName);
               })
        }
 
    
   
});

app.post("/delete", function(req, res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === date.getDate()){

        Item.findByIdAndRemove(checkedItem, function (err) {console.log(err)});
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function (err, result) {
            if(!err){
                res.redirect("/"+ listName);
            }
          });
    }
   
});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
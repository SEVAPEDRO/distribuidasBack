var UserService = require('../services/User.service');
var mongoose = require('mongoose')
var MailController = require('./mail.controller')
var DeletionService = require('../services/Deletion.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List

exports.loginUser = async function (req, res, next) {
    // Req.Body contains the form submit values.
    console.log("body",req.body)
    var User = {
        email: req.body.email,
        password: req.body.password
    }
    try {
        // Calling the Service function with the new object from the Request Body
        var loginUser = await UserService.loginUser(User);
        if (loginUser===401){
            return res.status(401).json({message: "Wrong password"})
        }
        else if (loginUser===409){
            return res.status(409).json({message: "User not found"})
        }
        return res.status(200).json({loginUser, message: "Succesfully login"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({status: 400, message: e.message})
    }
}

exports.createUser = async function (req, res, next) {
    // Req.Body contains the form submit values.
    console.log("llegue al controller",req.body)
    var owner = Boolean(req.body.owner)
    var User = {
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        owner: owner 
    }
    try {
        // Calling the Service function with the new object from the Request Body
        var createdUser = await UserService.createUser(User)
        if(createdUser){
            return res.status(201).json({createdUser, message: "Succesfully Created User"})
        }else{
            return res.status(409).json({message: "User has already been created"})
        }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        console.log(e)
        return res.status(400).json({status: 400, message: e.message})
    }
}


exports.updateUser = async function (req, res, next) {
    if (!req.params.tagId) {
        return res.status(400).json({status: 400., message: "add Id to update user"})
    }
    if(req.body.option=="0"){
        var User = {
            id: mongoose.Types.ObjectId(req.params.tagId),
            name: req.body.name ? req.body.name : null,
            lastName: req.body.lastName ? req.body.lastName : null,
            picture: req.body.picture ? req.body.picture : null,
        }
        try {
            var updatedUser = await UserService.updateUser(User)
            return res.status(200).json({status: 200, data: updatedUser, message: "Succesfully Updated User"})
        } catch (e) {
            return res.status(400).json({status: 400, message: e.message})
        }
    }else if(req.body.option=="1"){
        if(!req.body.oldPassword || !req.body.newPassword){
            return res.status(400).json({status: 400, message: "add all values to update user"})
        }
        var User = { 
            id: req.params.tagId,
            oldPassword: req.body.oldPassword,
            newPassword: req.body.newPassword,
        }
        try {
            var updatedUser = await UserService.updatePass(User)
            if(updatedUser===401){
                return res.status(401).json({status: 401, message: "The provided password is not the current password"})
            }
            return res.status(200).json({status: 200, data: updatedUser, message: "Succesfully Updated User"})
        } catch (e) {
            return res.status(400).json({status: 400, message: e.message})
        }
    }
}


exports.resetPassword = async function (req, res, next) {
    if (!req.body.email) {
        return res.status(400).json({status: 400, message: "Email be present"})
    }
    let password = Math.random().toString(36).slice(-8);
    var User = { 
        email: req.body.email,
        newPassword: password
    }
    try {
        var updatedUser = await UserService.resetPass(User)
        MailController.sendEmail(req,password, res, next);
        return res.status(200).json({status: 200, data: updatedUser, message: "Email succesfully sent"})
    } catch (e) {
        return res.status(400).json({status: 400, message: e.message})
    }
}

exports.getUsers = async function (req, res, next){
    try {
        var query = {
            _id : mongoose.Types.ObjectId(req.params.tagId)
        }
        var users = await UserService.getUsers(query)
        return res.status(200).json({status: 200, data: users, message: "Succesfully retrieved User"})
    } catch (e) {
        return res.status(400).json({status: 400, message: e.message})
    }
}

exports.deleteUser = async function (req, res, next){
    var id = mongoose.Types.ObjectId(req.params.tagId)
    try {
        var deleted = await UserService.deleteUser(id);
        var deletion = await DeletionService.deleteManyRestaurants(deleted.restaurants)
        res.status(200).json({status: 200, message: "Succesfully Deleted"});
    } catch (e) {
        return res.status(400).json({status: 400, message: e.message})
    }
}

exports.handleFav = async function (req, res, next){
    var id = mongoose.Types.ObjectId(req.params.tagId)
    var idr = mongoose.Types.ObjectId(req.body.idRestaurant)
    
    if(req.body.option == "0"){
        try {
            // Calling the Service function with the new object from the Request Body
            var userUpdate = await UserService.addFav(id,idr)
            return res.status(200).json({userUpdate, message: "Fav was succesfully added"})
        } catch (e) {
            //Return an Error Response Message with Code and the Error Message.
            console.log(e)
            return res.status(400).json({status: 400, message: "Fav addition was Unsuccesfull"})
        }
    }else if(req.body.option == "1"){
        try {
            // Calling the Service function with the new object from the Request Body
            var userUpdate = await UserService.removeFav(id,idr)
            return res.status(200).json({userUpdate, message: "Fav was succesfully removed"})
        } catch (e) {
            //Return an Error Response Message with Code and the Error Message.
            console.log(e)
            return res.status(400).json({status: 400, message: "Fav removal was Unsuccesfull"})
        }
    }
}
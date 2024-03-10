// Task1: initiate app and run server at 3000
const express = require('express');
const app = new express();
const morgan = require('morgan');
app.use(morgan('dev'));
const dotenv = require('dotenv');
dotenv.config();

const path=require('path');
app.use(express.static(path.join(__dirname + '/dist/FrontEnd')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
})


// Task2: create mongoDB connection

// Connect to MongoDB Atlas database
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('MongoDB connection error:', error);
});

// Define Employee schema
const employeeSchema = new mongoose.Schema({
    name: String,
    location: String,
    position: String,
    salary: Number
});
const Employee = mongoose.model("Employee", employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//TODO: get data from db  using api '/api/employeelist'
app.get("/api/employeelist", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.send(employees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});



//TODO: get single data from db  using api '/api/employeelist/:id'
app.get("/api/employeelist/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post("/api/employeelist", bodyParser.json(), async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        const salaryNumber = parseFloat(salary);

        const newEmp = new Employee({
            name,
            location,
            position,
            salary: salaryNumber,
        });

        await newEmp.save();

        res.status(201).json(newEmp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete("/api/employeelist/:id", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});




//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put("/api/employeelist", bodyParser.json(), async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;

        if (!name || !location || !position || !salary) {
            return res
                .status(400)
                .json({
                    error: "All fields (name, location, position, salary) are required",
                });
        }

        const newSal = parseFloat(salary);

        const updateEmp = await Employee.findOneAndUpdate(
            { name: name },
            { location, position, salary: newSal },
            { new: true }
        );

        if (!updateEmp) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.json(updateEmp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});




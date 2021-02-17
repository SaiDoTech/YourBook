const express = require("express");
const app = express();

// Модуль для чтения
const fs = require("fs");
const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));
const filePath = __dirname + '/tasks.json';

const multer  = require("multer");
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

// Получение списка всех задач
app.get("/api/tasks", function(req, res){
       
    const content = fs.readFileSync(filePath,"utf8");
    const tasks = JSON.parse(content);
    res.send(tasks);
});

// Получение задачи по id
app.get("/api/tasks/:id", function(req, res){
       
    const id = req.params.id; // получаем id
    const content = fs.readFileSync(filePath, "utf8");
    const tasks = JSON.parse(content);
    let task = null;
    // находим в массиве задачу по id
    for(var i=0; i<tasks.length; i++){
        if(tasks[i].id==id){
            task = tasks[i];
            break;
        }
    }
    // В ответе необходимая задача
    if(task){
        res.send(task);
    }
    // Если не получилось найти задачу
    else{
        res.status(404).send();
    }
});

// Добавление задачи
app.post("/api/tasks", jsonParser, function (req, res) {
      
    if(!req.body) return res.sendStatus(400);
     
    // Gолучение отправленных пользователем данных
    const taskTitle = req.body.title;
    const taskDeadline = req.body.deadline;
    let task = {title: taskTitle, deadline: taskDeadline};
      
    let data = fs.readFileSync(filePath, "utf8");
    let tasks = JSON.parse(data);
      
    // находим максимальный id
    const id = Math.max.apply(Math,tasks.map(function(o){return o.id;}))
    task.id = id+1;

    // добавляем пользователя в массив
    tasks.push(task);
    data = JSON.stringify(tasks);
    // перезаписываем файл с новыми данными
    fs.writeFileSync(filePath, data);
    res.send(task);
});

// Удаление задачи по id
app.delete("/api/tasks/:id", function(req, res){
       
    const id = req.params.id;
    let data = fs.readFileSync(filePath, "utf8");
    let tasks = JSON.parse(data);
    let index = -1;
    // находим задачу в массиве
    for(var i=0; i < tasks.length; i++){
        if(tasks[i].id==id){
            index=i;
            break;
        }
    }
    if(index > -1){
        // удаляем задачу из массива по индексу
        const task = tasks.splice(index, 1)[0];
        data = JSON.stringify(tasks);
        fs.writeFileSync(filePath, data);
        // отправляем удаленную задачу
        res.send(task);
    }
    // Не нашли задачу
    else{
        res.status(404).send();
    }
});

// Редактирование задачи
app.put("/api/tasks", jsonParser, function(req, res){
       
    if(!req.body) return res.sendStatus(400);
      
    const taskId = req.body.id;
    const taskTitle = req.body.title;
    const taskDeadline = req.body.deadline;
      
    let data = fs.readFileSync(filePath, "utf8");
    const tasks = JSON.parse(data);
    let task;
    for(var i=0; i<tasks.length; i++){
        if(tasks[i].id==taskId){
            task = tasks[i];
            break;
        }
    }
    // изменяем данные задачи
    if(task){
        task.title = taskTitle;
        task.deadline = taskDeadline;
        data = JSON.stringify(tasks);
        fs.writeFileSync(filePath, data);
        res.send(task);
    }
    else{
        res.status(404).send(task);
    }
});

app.listen(3000, function(){
    console.log("Оно работает! Ждёт подключения...");
});
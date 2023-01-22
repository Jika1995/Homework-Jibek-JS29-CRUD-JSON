//инициируем пустой массив, функция получения и функция добавления 

function initStorage () {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', '[]');
    };
};
initStorage()

function setUsersToStorage (usersData) {
    localStorage.setItem('users', JSON.stringify(usersData))
};

function getUsersFromStorage () {
    let users = JSON.parse(localStorage.getItem('users'))
    return users
};

//Подключаемся к элементам

let loginLink = document.querySelector('.login-link');
let logoutLink = document.querySelector('.loginout-link');
let registerLink = document.querySelector('.register-link');

let inpUsername = document.querySelector('#inputUsername');
let inpPass = document.querySelector('#inputPassword1');
let inpConfPass = document.querySelector('#inputPassword2');
let checkbox = document.querySelector('#checkbox1');

let loginBtn = document.querySelector('.login-btn');
let registerBtn = document.querySelector('.register-btn');

//функция регистрации пользователя
function registerUser () {

    let users = getUsersFromStorage();

    //проверка на уникальность username
    if(users.some(item => item.username === inpUsername.value)) {
        alert('The user with this username already exists')
        return
    };

    //проверка на подтверждение пароля
    if (inpPass.value !== inpConfPass.value) {
        alert('Passwords don\'t match') 
        return;
    };

    let userObj = {
        username: inpUsername.value, 
        password: inpPass.value,
        checkAdmin: false
    };

    if(checkbox.checked) {
        userObj.checkAdmin = true
    };

    users.push(userObj)
    setUsersToStorage(users)

    inpUsername.value = '';
    inpPass.value = '';
    inpConfPass.value = '';
    checkbox.checked = false;

    let btnClose = document.querySelector('.btn-close-register');
    console.log(btnClose);
    btnClose.click()

};

registerBtn.addEventListener('click', registerUser)

// Task 2 //

let addProdBtn = document.querySelector('.add-product-btn');
let loginAddBtn = document.querySelector('.login-add-btn')

let imgInp = document.querySelector('#photo-inp');
let titleInp = document.querySelector('#title-inp');
let priceInp = document.querySelector('#price-inp');

let loginInpUser = document.querySelector('#loginUsername');
let loginPass = document.querySelector('#loginPassword');

addProdBtn.addEventListener('click', createProd)

//логика создания продукта 
function createProd () {

    let productObj = {
        title: titleInp.value,
        price: priceInp.value,
        url: imgInp.value,
        author: ''
    };

    function login () {

        let users = getUsersFromStorage();
        let userObj = users.find(item => item.username == loginInpUser.value);
        console.log(userObj);

        //проверки
        if(!userObj) {
            alert('There is no this user')
            return
        };

        if(userObj.password !== loginPass.value) {
            alert("The password don't match")
            return
        };

        if (userObj.checkAdmin == false) {
            alert('You are not admin')
            return
        }

        productObj.author = userObj.username

        fetch('http://localhost:8000/products', {
            method: 'POST',
            body: JSON.stringify(productObj),
            headers: {
                "Content-Type": "application/json;charset=utf-8" //раскодируй и прочитай как чистый json
            }
        });

        // console.log(productObj, userObj)
    };

    loginAddBtn.addEventListener('click', login)

    imgInp.value = '';
    titleInp.value = '';
    priceInp.value = '';

    let btnCloseLogin = document.querySelector('.btn-close-login');
    btnCloseLogin.click()

};

// Task 3
//логика чтения продуктов
let readBtn = document.querySelector('.getProducts-btn');

readBtn.addEventListener('click', readProd); //при нажатии на кнопку
document.addEventListener('DOMContentLoaded', readProd) //при обновлении страницы

function readProd () {
    let container = document.querySelector('.container');
    container.innerHTML = '';

    let res = fetch('http://localhost:8000/products') //Get request
    .then(result => result.json())
    .then(data => {
        data.forEach(item => {      
            //создание карточек
            container.innerHTML += 
            `
            <div class="card w-25 m-2" style="width: 18rem;" title="${item.title}"> 
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <img src="${item.url}" width="100" height="100"></img>
                    <p class="card-text"><b>Price</b> ${item.price}</p>
                    <p class="card-text"><b>Author</b> ${item.author}</p>
                    <a href="#" class="btn btn-danger delete-prod-btn" title="${item.title}" id="${item.id}">Delete product</a>
                    <a href="#" class="btn btn-secondary update" data-bs-toggle="modal" data-bs-target="#staticBackdrop" title="${item.title}" id="${item.id}">Update product</a> 
                </div>
            </div>
            `
        });

        addUpdateEvent()
        addDeleteEvent()

    });
};

// Task 4
//логика изменения продукта, если человек админ

function updateProd (e) {

    let users = getUsersFromStorage();

    if (!e.target.title) return; //проверка на админ или нет (title заполнен в случае админа, логика выше)
    let prodTitle = e.target.title;

    let res = fetch('http://localhost:8000/products') //Get request
    .then(result => result.json())
    .then(products => {

        let productObj = products.find(item => item.title == prodTitle);

        //меняем ту же модалку на создание продукта на ---изменение---
        let modalTitle = document.querySelector('.modal-title-add')
        modalTitle.innerText = 'Make changes in product';
    
        let modalFooter = document.querySelector('.footer-add');
        modalFooter.innerHTML = '';
        modalFooter.innerHTML = `<button type="button" class="btn btn-secondary save-changes-btn" title="${productObj.author}" id="${productObj.id}">Save changes</button>`
    
        imgInp.value = productObj.url;
        titleInp.value = productObj.title;
        priceInp.value = productObj.price;

        addSaveEvent() //присваиваем вышедшей кнопке в модалке событие

    }); 
}

function addUpdateEvent () {
    let updateBtns = document.querySelectorAll('.update')
    updateBtns.forEach(item => item.addEventListener('click', updateProd))
};

function addSaveEvent () {
    let saveBtns = document.querySelectorAll('.save-changes-btn');
    saveBtns.forEach(item => item.addEventListener('click', saveChanges))
};

//функция изменения
function saveChanges (e) {

    if (!e.target.id) return;
    let prodId = e.target.id;

    let res = fetch('http://localhost:8000/products')
        .then(result => result.json())
        .then(products => {
            let productObj = products.find(item => item.author == e.target.title);

            if (!productObj) {
                alert('You are not an admin')
                return;
            }

            fetch(`http://localhost:8000/products/${prodId}`, { //отправка запроса на частичное изменение
                method: 'PATCH',
                body: JSON.stringify(
                    {
                        url: imgInp.value,
                        title: titleInp.value,
                        price: priceInp.value
                    }
                ),
                headers: {
                    "Content-Type": "application/json;charset=utf-8" //раскодируй и прочитай как чистый json
                }
            });

            e.target.removeAttribute('id')
            e.target.removeAttribute('title')

            imgInp.value = '';
            titleInp.value = '';
            priceInp.value = '';

            let btnCloseChanges = document.querySelector('.btn-close-product')
            btnCloseChanges.click()
        
            readProd()
        });
}

//логика удаления продукта, если человек админ
function deleteProduct (e) {

    console.log(e.target.id);
    if (!e.target.id) return;
    let prodId = e.target.id;

    let res = fetch(`http://localhost:8000/products/${prodId}`, 
    { 
        method: "DELETE"
    })

    readProd()
}

function addDeleteEvent () {
    let delBtns = document.querySelectorAll('.delete-prod-btn');
    delBtns.forEach(item => item.addEventListener('click', deleteProduct))
}

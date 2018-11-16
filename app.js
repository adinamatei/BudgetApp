// Budget Controller Module
const budgetController = (function() {

    // create function constructor
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // create data structure for the all data
    const data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1 // -1 inseamna ca nu exista in acest moment
    };

    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function(curElm){
            sum += curElm.value;
        });
        data.totals[type] = sum;
    };

    // create a public method
    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // ID = last ID + 1 // selectez ultimul elem al lui exp sau inc si la id-ul elem mai adaug unu
            // create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp'
            if(type === "expense"){
                newItem = new Expense(ID, des, val);
            } else if (type === "income") {
                newItem = new Income(ID, des, val);
            }

            // push new item into our data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
        // create a public method to calculate the budget
        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income');

            // calculate the budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;

            // calculate the percentage of income that we spent
            if(data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }

        },
        // public method returns budget
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();




// UI Controller Module
const UIController = (function () {

    // create a private variable to get all class name value
    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };


    return {
        getInputValue: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be 'income' or 'expense'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }

        },

        // a technique to adding big chunks of HTML into the DOM
        addListItem: function(obj, type) {
            let html, newHtml, element;
            // create HTML string with placeholder text
            if(type === 'income') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            } else if (type === 'expense') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert HTML into the DOM with insertAdjacentHTML
              document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        // clear html fields
        clearFields: function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // convert the fields list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }
})();




// Global app Controller Module
const controller = (function (budgetCtrl, UICtrl) {

    // access the data from UIControler
    const DOMstr = UICtrl.getDOMstrings();

    //set up event listeners
    const setupEventListener = function () {

        //add click event listener
        document.querySelector(DOMstr.addBtn).addEventListener("click", ctrlAddItem);

        // Add keyboard event listener
        document.addEventListener('keypress', function (event) {
            // console.log(event);
            if(event.keyCode === 13 || event.which === 13) {
                // console.log("Enter was press")
                ctrlAddItem();
            }
        });
    };

    // update budget
    const updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. returns the budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        console.log(budget);
    };

    // add item function
    const ctrlAddItem = function(){
        // 1. Get the filed input data
        const inputVal = UICtrl.getInputValue();

        // do this if value is not empty or NaN
        if(inputVal.description !== "" && !isNaN(inputVal.value) && inputVal.value > 0){
            // 2. Add the item to the budget controller
            const newItem = budgetCtrl.addItem(inputVal.type, inputVal.description, inputVal.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, inputVal.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }

        console.log(inputVal)
    };


    // create a public initialization function
    return {
        init: function () {
            console.log("Application was started");
            setupEventListener();
        }
    }

})(budgetController, UIController);


controller.init();










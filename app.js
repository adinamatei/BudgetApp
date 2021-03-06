// Budget Controller Module
const budgetController = (function() {

    // create function constructor
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // add calculate percentage  method to Expense constructor
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
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
        // create a public method delete item
        deleteItem: function(type, id) {
            let ids, index;

            // create an array with all of the ID number that we have in
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            console.log(ids);

            // retrieve the index of the element
            index = ids.indexOf(id);

            // delete the element from the array
            if(index !== -1) {
                //delete the elem from position index, 1 element
                data.allItems[type].splice(index, 1)
            }
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
        // public method to calculate percentages
        calculatePercentages: function() {
            /*
            a=20
            b=10
            c=40
            income=100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            data.allItems.expense.forEach(function (current) {
                current.calcPercentage(data.totals.income);
            });
        },
        getPercentages: function() {
            let allPerc = data.allItems.expense.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    // create a private method: format number method
    const formatNumber = function(num, type) {
        let numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
         */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    // made a simple and reusable private method for a nodeList
    let nodeListForEach = function (list, callback) {
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
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
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert HTML into the DOM with insertAdjacentHTML
              document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //remove element from DOM
        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

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
        displayBudget: function(obj){
            let type;
            obj.budget > 0 ? type = 'income' : type = 'expense';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expense');


            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---"
            }
        },
        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })
        },
        // display month method
        displayMonth: function() {
            let now, months, month, year;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        // change color for our inputs
        changedType: function() {
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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
        document.querySelector(DOMstr.inputBtn).addEventListener("click", ctrlAddItem);

        // Add keyboard event listener
        document.addEventListener('keypress', function (event) {
            // console.log(event);
            if(event.keyCode === 13 || event.which === 13) {
                // console.log("Enter was press")
                ctrlAddItem();
            }
        });

        // Add event delegation on the container element (parent element)
        document.querySelector(DOMstr.container).addEventListener('click', ctrlDeleteItem);


        // add change event
        document.querySelector(DOMstr.inputType).addEventListener('change', UICtrl.changedType);

    };

    // update budget
    const updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. returns the budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        // console.log(budget);
    };
    
    // update percentages
    const updatePercentages = function () {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();

        // 3. display the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        console.log(percentages)
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

            // 6. calculate and update percentages
            updatePercentages();
        }
        // console.log(inputVal)
    };

    // Target delete element and traversing the DOM until the element with ID
    const ctrlDeleteItem = function (event) {
        let itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {

            // income-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1. delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget
            updateBudget();

            // 4 . calculate and update percentages
            updatePercentages();
        }
    };

    // create a public initialization function
    return {
        init: function () {
            console.log("Application was started");
            UICtrl.displayMonth();
            // reset the budget to 0
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);


controller.init();










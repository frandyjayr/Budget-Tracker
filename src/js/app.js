/* ---------------------------------------------------------------------------- */

                    /* BUDGET CONTROLLER */

/* ---------------------------------------------------------------------------- */
var budgetController = (function() {

    var data = {
        allItems: {
            inc: [],
            exp: []    
        },
        
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
        
    };

    var Income = function(ID, des, val) {
        this.ID = ID;
        this.des = des;
        this.val = val;
    }
    
    var Expense = function(ID, des, val) {
        this.ID = ID;
        this.des = des;
        this.val = val;
    }

    
    /* ---------- Public Functions --------------- */
    return {
        addNewItem: function(typ, des, val) {
            var ID, newItem;
            
            if (data.allItems[typ].length > 0) {
                ID = data.allItems[typ][data.allItems[typ].length - 1].ID + 1;
            } else {
                ID = 0;
            }
            
            if (typ === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (typ === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            
            data.allItems[typ].push(newItem);
            
            return newItem;
        },
        
        removeItem: function(type, itemID) {
            var index = -1;
            
            for (var i = 0; i < data.allItems[type].length; i++) {
                
                if (data.allItems[type][i].ID == itemID) {
                    index = i;
                }
            }
            
            if (index > -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        updateBudget: function() {
            var newIncomeTotal = 0,
                newExpenseTotal = 0,
                newBudget,
                newPercentage;
            
            for (var i = 0; i < data.allItems.inc.length; i++) {
                newIncomeTotal += parseFloat(data.allItems.inc[i].val);
            }
            
            for (var i = 0; i < data.allItems.exp.length; i++) {
                newExpenseTotal -= parseFloat(data.allItems.exp[i].val);
            }
            
            newBudget = newIncomeTotal + newExpenseTotal;
            
            if (newBudget === 0) {
                newPercentage = -1;
            } else {
                newPercentage = Math.round((newExpenseTotal / newIncomeTotal) * 100);
            }
            
            return {
                income: newIncomeTotal,
                expense: newExpenseTotal,
                budget: newBudget,
                percentage: newPercentage
            };
        }
        
    }
})()

/* ---------------------------------------------------------------------------- */

                    /* UI CONTROLLER */

/* ---------------------------------------------------------------------------- */
var UIController = (function() {
    
    var DOMStrings = {
        itemType: '.budget-type',
        itemDescription: '.description_variable',
        itemValue: '.value_variable',
        addButton: '.add-button',
        incomeListContainer: '.income-list',
        expenseListContainer: '.expense-list',
        budgetContainer: '.budget_variable',
        incomeTotalContainer: '.income_variable',
        expenseTotalContainer: '.expense_variable',
        bottomContainer: '.bottom',
        monthContainer: '.month_variable'
    };
    
    /* ---------- Public Functions --------------- */
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.itemType).value,
                description: document.querySelector(DOMStrings.itemDescription).value,
                value: document.querySelector(DOMStrings.itemValue).value
            };
        },
        
        insertItemToList: function(obj, type) {
            var html, containerType;
            
            if (type === 'inc') {
                html = '<div class="row list-item py-2" id="inc-%ID%"><div class="description col-7 m-0">%DESCRIPTION%</div><div class="value col-3 mt-1">%VALUE%</div><div class="col-1 text-danger remove-button"><i class="ion-ios-minus-outline"></i></div></div>'
                
                containerType = DOMStrings.incomeListContainer;
            }
            else if (type === 'exp') {
                html = '<div class="row list-item py-2" id="exp-%ID%"><div class="description col-7 m-0">%DESCRIPTION%</div><div class="value col-3 mt-1">%VALUE%</div><div class="col-1 text-danger remove-button"><i class="ion-ios-minus-outline"></i></div></div>'
                
                containerType = DOMStrings.expenseListContainer;
            }
            
            html = html.replace('%DESCRIPTION%', obj.des);
            html = html.replace('%VALUE%', obj.val);
            html = html.replace('%ID%', obj.ID);
            
            document.querySelector(containerType).insertAdjacentHTML('beforeend', html);
        },
        
        removeItemFromList: function(itemID) {
            document.getElementById(itemID).parentNode.removeChild(document.getElementById(itemID));
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        },
        
        clearUI: function() {
            document.querySelector(DOMStrings.itemDescription).value = "";
            document.querySelector(DOMStrings.itemValue).value = "";
            document.querySelector(DOMStrings.itemDescription).focus();
        },
        
        insertBudgetToUI: function(obj) {
            document.querySelector(DOMStrings.budgetContainer).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeTotalContainer).textContent = obj.income;
            document.querySelector(DOMStrings.expenseTotalContainer).textContent = obj.expense;
        }, 
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMStrings.monthContainer).textContent = months[month] + ' ' + year;
        }
    }
})()


/* ---------------------------------------------------------------------------- */

                    /* GLOBAL CONTROLLER */

/* ---------------------------------------------------------------------------- */
var globalController = (function(bdgtCtrl, UICtrl) {
    
    var DOMStrings = UICtrl.getDOMStrings();
    
    document.querySelector(DOMStrings.addButton).addEventListener('click', addItem);
    document.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
            addItem();
    }
    })
    
    document.querySelector(DOMStrings.bottomContainer).addEventListener('click', removeItem);
    
    
    function updateBudgetUI() {
        var newBudgetData = bdgtCtrl.updateBudget();
        UICtrl.insertBudgetToUI(newBudgetData);
    }
    
    UICtrl.displayMonth();
    
    function addItem() {
        // 1. Retrieve Input Data
        var input = UICtrl.getInput();
 
        if (input.value > 0 && input.value !== "" && input.description !== "") {
            
            // 2. Store Data into budgetController
            var newItem = bdgtCtrl.addNewItem(input.type, input.description, input.value);

            // 3. Output Data in the income/expense UI and clear the input fields
            UICtrl.insertItemToList(newItem, input.type);
            UICtrl.clearUI();
        
            // 4. Calculate budget/income/expenses
            updateBudgetUI();
        }
    }
    
    function removeItem(event) {
        // 1. Get ID and type
        
        var itemID = event.target.parentNode.parentNode.id;

        if (itemID) {
            var splitID = itemID.split('-');
            var type = splitID[0];
            var ID = splitID[1];
        }
        
        // 2. Remove item from Budget array
        bdgtCtrl.removeItem(type, ID);
        updateBudgetUI();
        
        // 3. Remove item from UI
        UICtrl.removeItemFromList(itemID);
        
        //4. Update income/expense/budgetUI

    }
    
})(budgetController, UIController)



